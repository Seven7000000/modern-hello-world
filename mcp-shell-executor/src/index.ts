import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { TextContent, CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import * as os from 'os';
import * as path from 'path';
// Import HTTP transport
import { HttpServerTransport } from './http-transport.js';

// Default allowed commands, can be overridden with ALLOWED_COMMANDS env var
const DEFAULT_ALLOWED_COMMANDS = ['ls', 'pwd', 'cat', 'echo', 'find', 'grep', 'mkdir', 'cp', 'mv', 'rm', 'ps', 'head', 'tail'];

// Get allowed commands from environment variable or use defaults
const getAllowedCommands = (): string[] => {
  const envAllowed = process.env.ALLOWED_COMMANDS;
  if (envAllowed) {
    return envAllowed.split(',').map((cmd) => cmd.trim());
  }
  return DEFAULT_ALLOWED_COMMANDS;
};

const allowedCommands = getAllowedCommands();

// Validate if command is allowed
const isCommandAllowed = (command: string): boolean => {
  // Get the first part of the command (before any space)
  const baseCommand = command.split(' ')[0];
  return allowedCommands.includes(baseCommand);
};

// HTTP port for Streamable HTTP transport (if used)
const DEFAULT_PORT = 5002;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;

// Create the MCP server
const server = new Server(
  {
    name: 'mcp-shell-executor',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Single handler for all tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  
  switch (toolName) {
    case 'execute': {
      const args = request.params.arguments as { command: string } | undefined;
      
      if (!args) {
        throw new Error('Command is required');
      }
      
      const command = args.command;
      
      if (!command) {
        throw new Error('Command is required');
      }
      
      if (!isCommandAllowed(command)) {
        throw new Error(`Command not allowed: ${command}. Allowed commands: ${allowedCommands.join(', ')}`);
      }
      
      try {
        const output = await executeCommand(command);
        
        const content: TextContent = {
          type: 'text',
          text: output,
        };
        
        return {
          content: [content],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Command execution failed: ${errorMessage}`);
      }
    }
    
    case 'list_allowed_commands': {
      const content: TextContent = {
        type: 'text',
        text: `Allowed commands: ${allowedCommands.join(', ')}`,
      };
      
      return {
        content: [content],
      };
    }
    
    case 'get_system_info': {
      const systemInfo = {
        platform: os.platform(),
        release: os.release(),
        hostname: os.hostname(),
        userHome: os.homedir(),
        tempDir: os.tmpdir(),
        cpus: os.cpus().length,
        memoryTotal: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
        memoryFree: `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
      };
      
      const content: TextContent = {
        type: 'text',
        text: JSON.stringify(systemInfo, null, 2),
      };
      
      return {
        content: [content],
      };
    }
    
    case 'get_cwd': {
      const content: TextContent = {
        type: 'text',
        text: process.cwd(),
      };
      
      return {
        content: [content],
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
});

// Define tools list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute',
        description: 'Execute a shell command from the approved list',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'list_allowed_commands',
        description: 'List all allowed shell commands',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_system_info',
        description: 'Get information about the system',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_cwd',
        description: 'Get the current working directory',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Function to execute a shell command and return the output
function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    
    // Spawn the command with arguments
    const process = spawn(cmd, args, {
      shell: false, // Don't use shell to prevent injection
    });
    
    let stdout = '';
    let stderr = '';
    
    // Collect stdout
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    // Collect stderr
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Handle completion
    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });
    
    // Handle errors
    process.on('error', (err) => {
      reject(err);
    });
  });
}

// Set up connection using stdio or HTTP
async function main() {
  try {
    // Check if HTTP transport is enabled
    const useHttp = process.env.USE_HTTP === 'true' || process.env.PORT !== undefined;
    
    if (useHttp) {
      // Use HTTP transport
      console.log(`Starting shell executor with HTTP transport on port ${port}`);
      const transport = new HttpServerTransport(port);
      await server.connect(transport);
      console.log(`Shell executor HTTP server started on port ${port}`);
    } else {
      // Use stdio transport for Claude Desktop compatibility
      console.log('Starting shell executor with stdio transport');
      const transport = {
        start: async () => {
          process.stdin.on('data', (data) => {
            try {
              const message = JSON.parse(data.toString());
              if (transport.onmessage) {
                transport.onmessage(message);
              }
            } catch (error) {
              console.error('Error parsing message:', error);
              if (transport.onerror) {
                transport.onerror(error instanceof Error ? error : new Error(String(error)));
              }
            }
          });
          
          process.stdin.on('end', () => {
            if (transport.onclose) {
              transport.onclose();
            }
          });
        },
        
        send: async (message: any) => {
          process.stdout.write(JSON.stringify(message) + '\n');
        },
        
        close: async () => {
          process.exit(0);
        },
        
        onmessage: undefined as ((message: any) => void) | undefined,
        onclose: undefined as (() => void) | undefined,
        onerror: undefined as ((error: Error) => void) | undefined,
      };
      
      await server.connect(transport);
      console.error('MCP Shell Executor Server started on stdio');
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

main(); 
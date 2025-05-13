#!/usr/bin/env node

/**
 * Filesystem MCP server that provides file system operations
 * - Read files
 * - Write files
 * - List directories
 * - Create directories
 * - Delete files/directories
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { existsSync } from "fs";
import { HttpServerTransport } from "./http-transport.js";

/**
 * Create an MCP server with capabilities for tools
 */
const server = new Server(
  {
    name: "mcp-filesystem-executor",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_file",
        description: "Read the contents of a file",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file to read"
            }
          },
          required: ["path"]
        }
      },
      {
        name: "write_file",
        description: "Write content to a file",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file to write"
            },
            content: {
              type: "string",
              description: "Content to write to the file"
            }
          },
          required: ["path", "content"]
        }
      },
      {
        name: "list_directory",
        description: "List the contents of a directory",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the directory to list"
            }
          },
          required: ["path"]
        }
      },
      {
        name: "create_directory",
        description: "Create a new directory",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the directory to create"
            }
          },
          required: ["path"]
        }
      },
      {
        name: "delete_file",
        description: "Delete a file or directory",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the file or directory to delete"
            },
            recursive: {
              type: "boolean",
              description: "If true, recursively delete directories"
            }
          },
          required: ["path"]
        }
      }
    ]
  };
});

/**
 * Normalize path to prevent path traversal attacks
 */
function normalizePath(filePath: string): string {
  // Resolve user home directory if path starts with ~
  if (filePath.startsWith("~")) {
    filePath = path.join(process.env.HOME || "/home", filePath.substring(1));
  }
  
  // Convert to absolute path and normalize
  return path.normalize(path.resolve(filePath));
}

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = request.params.name;
  const args = request.params.arguments || {};
  
  try {
    switch (tool) {
      case "read_file": {
        const filePath = normalizePath(String(args.path));
        
        try {
          const content = await fs.readFile(filePath, "utf-8");
          return {
            content: [{
              type: "text",
              text: content
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to read file: ${err.message}`);
        }
      }
      
      case "write_file": {
        const filePath = normalizePath(String(args.path));
        const content = String(args.content);
        
        try {
          // Create parent directories if they don't exist
          const dirPath = path.dirname(filePath);
          if (!existsSync(dirPath)) {
            await fs.mkdir(dirPath, { recursive: true });
          }
          
          await fs.writeFile(filePath, content);
          return {
            content: [{
              type: "text",
              text: `Successfully wrote to ${filePath}`
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to write file: ${err.message}`);
        }
      }
      
      case "list_directory": {
        const dirPath = normalizePath(String(args.path));
        
        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          const files = entries.filter(entry => entry.isFile()).map(entry => entry.name);
          const directories = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
          
          const result = {
            directories,
            files,
            path: dirPath
          };
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to list directory: ${err.message}`);
        }
      }
      
      case "create_directory": {
        const dirPath = normalizePath(String(args.path));
        
        try {
          await fs.mkdir(dirPath, { recursive: true });
          return {
            content: [{
              type: "text",
              text: `Successfully created directory ${dirPath}`
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to create directory: ${err.message}`);
        }
      }
      
      case "delete_file": {
        const filePath = normalizePath(String(args.path));
        const recursive = Boolean(args.recursive);
        
        try {
          const stat = await fs.stat(filePath);
          
          if (stat.isDirectory()) {
            await fs.rm(filePath, { recursive, force: true });
          } else {
            await fs.unlink(filePath);
          }
          
          return {
            content: [{
              type: "text",
              text: `Successfully deleted ${filePath}`
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to delete: ${err.message}`);
        }
      }
      
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  } catch (error: any) {
    console.error(`Error in tool ${tool}:`, error);
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

/**
 * Start the server
 */
async function main() {
  try {
    // Check if HTTP transport is enabled
    const useHttp = process.env.USE_HTTP === 'true' || process.env.HTTP_PORT !== undefined;
    const httpPort = parseInt(process.env.HTTP_PORT || '5003', 10);
    
    console.error(`Starting filesystem executor with ${useHttp ? 'HTTP' : 'stdio'} transport ${useHttp ? `on port ${httpPort}` : ''}`);
    
    if (useHttp) {
      // Use HTTP transport
      const transport = new HttpServerTransport(httpPort);
      await server.connect(transport);
      console.error(`Filesystem executor HTTP server started on port ${httpPort}`);
    } else {
      // Use stdio transport (default)
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error('Filesystem executor stdio server started');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

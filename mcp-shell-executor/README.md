# MCP Shell Executor

A Model Context Protocol (MCP) server for securely executing shell commands. This server can be used with Claude Desktop or any other MCP-compatible client.

## Features

- Securely execute shell commands from a pre-approved list
- List allowed commands
- Get system information
- Get current working directory
- Configurable command whitelist

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-shell-executor.git
cd mcp-shell-executor

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Starting the Server

```bash
npm start
```

### Configuring Allowed Commands

By default, the following commands are allowed:
- `ls`
- `pwd`
- `cat`
- `echo`
- `find`
- `grep`
- `mkdir`
- `cp`
- `mv`
- `rm`
- `ps`
- `head`
- `tail`

You can override this list by setting the `ALLOWED_COMMANDS` environment variable:

```bash
ALLOWED_COMMANDS=ls,pwd,cat,echo npm start
```

### Claude Desktop Integration

To use with Claude Desktop, add this to your Claude configuration file:

On macOS:
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "shell": {
      "url": "http://localhost:5002"
    }
  }
}
```

Or use stdio transport:

```json
{
  "mcpServers": {
    "shell": {
      "command": "node",
      "args": [
        "/path/to/mcp-shell-executor/build/index.js"
      ]
    }
  }
}
```

## Available Tools

### 1. execute

Execute a shell command from the approved list.

Example:
```
ls -la
```

### 2. list_allowed_commands

Lists all allowed shell commands.

### 3. get_system_info

Returns information about the system including platform, memory, CPU, etc.

### 4. get_cwd

Returns the current working directory.

## Security Considerations

- Only whitelisted commands can be executed
- Commands are executed without a shell to prevent injection
- No input is allowed from the user to the command
- Command arguments are properly separated

## License

MIT 
# MSSQL MCP Server Examples

This directory contains example implementations of the MSSQL MCP server.

## Simple Server

The `simple-server.ts` example demonstrates a basic MSSQL MCP server with:
- A query tool for executing SQL statements
- An examples resource that provides usage information
- Connection pooling for better performance
- Proper error handling

### Running the Example

```bash
# Install dependencies first if you haven't already
cd ..
npm install

# Run the example with tsx
npx tsx examples/simple-server.ts
```

### Testing with MCP Inspector

You can test this server with the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

1. Install the inspector:
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. In one terminal, start the server:
   ```bash
   npx tsx examples/simple-server.ts
   ```

3. In another terminal, start the inspector:
   ```bash
   mcp-inspector --transport=stdio --command="npx tsx examples/simple-server.ts"
   ```

4. Use the inspector UI to:
   - Browse available tools and resources
   - Execute SQL queries
   - View responses and errors

## Configuration

The example server can be configured with environment variables:

```bash
# Configure the server through environment variables
MSSQL_HOST=localhost MSSQL_USER=sa MSSQL_PASSWORD=YourPassword123! npx tsx examples/simple-server.ts
```

For more advanced configuration options, see the main project README.

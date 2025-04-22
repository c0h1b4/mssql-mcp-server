# MSSQL MCP Server

[![smithery badge](https://smithery.ai/badge/@c0h1b4/mssql-mcp-server)](https://smithery.ai/server/@c0h1b4/mssql-mcp-server)

A Model Context Protocol (MCP) server for connecting to Microsoft SQL Server databases. This server provides tools for executing SQL queries and managing database connections.

**Version Notice:** This project has been upgraded to use Model Context Protocol SDK 1.9.0. See [UPGRADE.md](UPGRADE.md) for details.

## Installation

### Installing via Smithery

To install MSSQL MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@c0h1b4/mssql-mcp-server):

```bash
npx -y @smithery/cli install @c0h1b4/mssql-mcp-server --client claude
```

### Manual Installation
```bash
npm install mssql-mcp-server
```

## Usage

Add the server to your MCP settings configuration file:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "mssql-mcp-server",
      "env": {
        "MSSQL_CONNECTION_STRING": "Server=localhost;Database=master;User Id=sa;Password=yourpassword;",
        // Or individual connection parameters:
        "MSSQL_HOST": "localhost",
        "MSSQL_PORT": "1433",
        "MSSQL_DATABASE": "master",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "yourpassword",
        "MSSQL_ENCRYPT": "false",
        "MSSQL_TRUST_SERVER_CERTIFICATE": "true"
      }
    }
  }
}
```

## Tools

### query

Execute a SQL query on a MSSQL database.

#### Parameters

- `connectionString` (string, optional): Full connection string (alternative to individual parameters)
- `host` (string, optional): Database server hostname
- `port` (number, optional): Database server port (default: 1433)
- `database` (string, optional): Database name (default: master)
- `username` (string, optional): Database username
- `password` (string, optional): Database password
- `query` (string, required): SQL query to execute
- `encrypt` (boolean, optional): Enable encryption (default: false)
- `trustServerCertificate` (boolean, optional): Trust server certificate (default: true)

Either `connectionString` OR (`host` + `username` + `password`) must be provided.

#### Example

```typescript
const result = await use_mcp_tool({
  server_name: 'mssql',
  tool_name: 'query',
  arguments: {
    host: 'localhost',
    username: 'sa',
    password: 'yourpassword',
    query: 'SELECT * FROM Users',
  },
});
```

## Running the Server

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run the built server
npm start
```

### Using Docker

```bash
# Build and start services (SQL Server + MCP server)
docker-compose up

# Or just build the Docker image
docker build -t mssql-mcp-server .
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Security

The server includes safeguards against dangerous SQL operations:

- Blocks potentially harmful commands like DROP, TRUNCATE, ALTER, CREATE, EXEC, etc.
- Validates all input parameters and database names
- Sets reasonable limits on query length and timeout
- Uses connection pooling for better performance and security

## License

MIT

# How to Run the MSSQL MCP Server

This guide explains how to run the MSSQL MCP Server after the upgrade to MCP SDK 1.9.0.

## Prerequisites

- Node.js 16 or later
- SQL Server instance (or access to one)
- Git (if cloning from repository)

## Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/c0h1b4/mssql-mcp-server.git
   cd mssql-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to match your SQL Server configuration:
   ```
   # SQL Server Connection Settings
   MSSQL_HOST=your-server-host
   MSSQL_PORT=1433
   MSSQL_USER=your-username
   MSSQL_PASSWORD=your-password
   MSSQL_DATABASE=your-database
   
   # Security Settings
   MSSQL_ENCRYPT=true
   MSSQL_TRUST_SERVER_CERTIFICATE=false
   ```

## Building the Server

Build the TypeScript code:

```bash
npm run build
```

## Running the Server

### Method 1: Direct Execution

```bash
npm start
```

### Method 2: Using the Example Server

```bash
npx tsx examples/simple-server.ts
```

### Method 3: Using Docker

```bash
# Start both the SQL Server and MCP Server
docker-compose up

# Or just the MCP Server (if you have a SQL Server elsewhere)
docker-compose up app
```

## Testing the Server

You can test the server using the MCP Inspector:

1. Install the inspector:
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. Run the inspector (in a separate terminal while the server is running):
   ```bash
   mcp-inspector --transport=stdio --command="node build/index.js"
   ```

3. Use the inspector to:
   - Browse available tools
   - Execute SQL queries
   - View responses

## Troubleshooting

- **Connection issues**: Check your SQL Server connection settings in `.env`
- **Build errors**: Make sure you have the latest dependencies with `npm install`
- **Permission errors**: Ensure your SQL user has the necessary permissions
- **Port conflicts**: Check if port 1433 is already in use

## Example Queries

Here are some example queries to try with the server:

```sql
-- List all databases
SELECT name FROM sys.databases

-- List tables in the current database
SELECT * FROM information_schema.tables

-- Simple query with parameters
SELECT * FROM your_table WHERE your_column = @value
```

For more detailed usage instructions, see the main [README.md](README.md).

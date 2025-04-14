#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import sql from 'mssql';
import { z } from 'zod';

// Define the main server class
async function main() {
  // Create a new MCP server
  const server = new McpServer({
    name: 'mssql-demo-server',
    version: '1.0.0',
  });

  // Store pools for connection reuse
  const pools = new Map<string, sql.ConnectionPool>();

  // Helper function to get connection config
  function getConnectionConfig(args: any): sql.config {
    if (args.connectionString) {
      return {
        server: args.connectionString,
      };
    }

    return {
      server: args.host,
      port: args.port || 1433,
      database: args.database || 'master',
      user: args.username,
      password: args.password,
      options: {
        encrypt: args.encrypt ?? false,
        trustServerCertificate: args.trustServerCertificate ?? true,
      },
    };
  }

  // Helper function to get/create a connection pool
  async function getPool(config: sql.config): Promise<sql.ConnectionPool> {
    const key = JSON.stringify(config);
    let pool = pools.get(key);

    if (!pool) {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      pools.set(key, pool);
    }

    return pool;
  }

  // Register the query tool
  server.tool(
    'query',
    {
      connectionString: z.string().optional(),
      host: z.string().optional(),
      port: z.number().optional(),
      database: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      query: z.string(),
      encrypt: z.boolean().optional(),
      trustServerCertificate: z.boolean().optional(),
    },
    async (args) => {
      try {
        const config = getConnectionConfig(args);
        const pool = await getPool(config);
        const result = await pool.request().query(args.query);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.recordset, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Database error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // Add examples resource that shows usage examples
  server.resource(
    'examples',
    'examples://mssql',
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: `
# MSSQL MCP Server Examples

This server provides a 'query' tool to execute SQL queries. Here are some examples:

## Simple SELECT query

\`\`\`
query({
  host: "localhost",
  username: "sa",
  password: "YourPassword123!",
  query: "SELECT TOP 10 * FROM master.sys.objects"
})
\`\`\`

## Using a connection string

\`\`\`
query({
  connectionString: "Server=localhost;Database=master;User Id=sa;Password=YourPassword123!;",
  query: "SELECT @@VERSION AS SqlVersion"
})
\`\`\`

## Query with filter

\`\`\`
query({
  host: "localhost",
  username: "sa",
  password: "YourPassword123!",
  database: "AdventureWorks",
  query: "SELECT TOP 5 * FROM Person.Person WHERE FirstName LIKE 'A%'"
})
\`\`\`
        `
      }]
    })
  );

  // Connect to the transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MSSQL demo server running on stdio transport');

  // Set up cleanup on exit
  process.on('SIGINT', async () => {
    const closePromises = Array.from(pools.values()).map((pool) => pool.close());
    await Promise.all(closePromises);
    pools.clear();
    await server.close();
    process.exit(0);
  });
}

main().catch(console.error);

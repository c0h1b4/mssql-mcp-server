#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import sql from 'mssql';
import { z } from 'zod';

// Define the schema for the query parameters
const QueryArgsSchema = z.object({
  connectionString: z.string().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  query: z.string(),
  encrypt: z.boolean().optional(),
  trustServerCertificate: z.boolean().optional(),
}).refine(
  (data) => {
    // Either connectionString OR (host + username + password) must be provided
    return (
      (data.connectionString !== undefined) ||
      (data.host !== undefined && data.username !== undefined && data.password !== undefined)
    );
  },
  {
    message: 'Either connectionString OR (host, username, and password) must be provided',
  }
);

// Type inference from the schema
type QueryArgs = z.infer<typeof QueryArgsSchema>;

export class MssqlServer {
  private server: McpServer;
  private pools: Map<string, sql.ConnectionPool>;

  constructor() {
    this.server = new McpServer({
      name: 'mssql-server',
      version: '0.1.0',
    });

    this.pools = new Map();
    this.setupTools();

    // Error handling
    process.on('SIGINT', () => {
      void this.cleanup();
      process.exit(0);
    });
  }

  private async cleanup(): Promise<void> {
    const closePromises = Array.from(this.pools.values()).map((pool) => pool.close());
    await Promise.all(closePromises);
    this.pools.clear();
    // The close method in the new API
    await this.server.close();
  }

  private getConnectionConfig(args: QueryArgs): sql.config {
    if (args.connectionString) {
      return {
        server: args.connectionString, // Using server instead of connectionString as per mssql types
      };
    }

    return {
      server: args.host!,
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

  private async getPool(config: sql.config): Promise<sql.ConnectionPool> {
    const key = JSON.stringify(config);
    let pool = this.pools.get(key);

    if (!pool) {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      this.pools.set(key, pool);
    }

    return pool;
  }

  private setupTools(): void {
    // Define the query tool using the raw object form instead of ZodSchema
    this.server.tool(
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
          const config = this.getConnectionConfig(args as QueryArgs);
          const pool = await this.getPool(config);
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
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MSSQL MCP server running on stdio');
  }
}

// Only start the server if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MssqlServer();
  void server.run().catch((error) => console.error('Server error:', error));
}

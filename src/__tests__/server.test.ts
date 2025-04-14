import { config } from 'dotenv';
import { ConnectionPool } from 'mssql';
import { validateConfig } from '../utils/config.js';
import { createConnectionPool } from '../utils/database.js';
import { handleError } from '../utils/error.js';
import { validateQueryParams } from '../utils/validation.js';
import type { DatabaseConfig, QueryParams } from '../types/index.js';

// Load test environment variables
config({ path: '.env.test' });

describe('MSSQL MCP Server', () => {
  let testConfig: DatabaseConfig;
  let pool: ConnectionPool;

  beforeAll(async () => {
    testConfig = validateConfig(process.env);
    pool = await createConnectionPool(testConfig);
  });

  afterAll(async () => {
    await pool?.close();
  });

  describe('Configuration', () => {
    it('should validate configuration correctly', () => {
      const config = validateConfig(process.env);
      expect(config).toBeDefined();
      expect(config.host).toBe(process.env.MSSQL_HOST);
      expect(config.port).toBe(Number(process.env.MSSQL_PORT));
    });

    it('should throw error for missing required config', () => {
      const invalidEnv = { ...process.env };
      delete invalidEnv.MSSQL_HOST;

      expect(() => validateConfig(invalidEnv)).toThrow('MSSQL_HOST is required');
    });
  });

  describe('Query Validation', () => {
    it('should validate correct query params', () => {
      const params: QueryParams = {
        query: 'SELECT 1',
      };

      expect(() => validateQueryParams(params)).not.toThrow();
    });

    it('should throw error for missing query', () => {
      const params = {} as QueryParams;

      expect(() => validateQueryParams(params)).toThrow('Query is required');
    });

    it('should throw error for dangerous commands', () => {
      const params: QueryParams = {
        query: 'DROP TABLE Users',
      };

      expect(() => validateQueryParams(params)).toThrow('Query contains forbidden command');
    });

    it('should validate query parameters', () => {
      const params: QueryParams = {
        query: 'SELECT * FROM Users WHERE Id = @id',
        params: {
          id: 1,
        },
      };

      expect(() => validateQueryParams(params)).not.toThrow();
    });

    it('should throw error for invalid parameter values', () => {
      const params: QueryParams = {
        query: 'SELECT * FROM Users WHERE Id = @id',
        params: {
          id: Symbol('invalid'),
        },
      };

      expect(() => validateQueryParams(params)).toThrow('Invalid parameter value');
    });
  });

  describe('Error Handling', () => {
    it('should handle SQL errors correctly', () => {
      const sqlError = new Error('SQL error');
      Object.assign(sqlError, { number: 208 });

      const mcpError = handleError(sqlError);
      expect(mcpError.message).toContain('Object does not exist');
    });

    it('should handle connection errors correctly', () => {
      const connError = new Error('Connection error');
      Object.assign(connError, { code: 'ECONNREFUSED' });

      const mcpError = handleError(connError);
      expect(mcpError.message).toContain('Connection refused');
    });

    it('should handle unknown errors correctly', () => {
      const unknownError = new Error('Unknown error');

      const mcpError = handleError(unknownError);
      expect(mcpError.message).toContain('Unknown error');
    });
  });

  describe('Database Operations', () => {
    it('should connect to database successfully', async () => {
      const pool = await createConnectionPool(testConfig);
      expect(pool).toBeDefined();
      expect(pool.connected).toBe(true);
      await pool.close();
    });

    it('should execute simple query successfully', async () => {
      const result = await pool.request().query('SELECT 1 as value');
      expect(result.recordset[0].value).toBe(1);
    });

    it('should handle parameterized queries', async () => {
      const value = 42;
      const result = await pool
        .request()
        .input('value', value)
        .query('SELECT @value as value');
      
      expect(result.recordset[0].value).toBe(value);
    });
  });
});

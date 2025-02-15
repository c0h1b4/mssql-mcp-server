import { describe, expect, vi, beforeEach, afterEach, type SpyInstance } from 'vitest';
import type { config } from 'mssql';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { QueryResult } from './types/index.js';

interface MockRequest {
  query: SpyInstance<[string], Promise<QueryResult>>;
}

interface MockPool {
  request: () => MockRequest;
  close: SpyInstance;
  connect: SpyInstance;
}

// Mock the mssql module
vi.mock('mssql', () => {
  const mockRequest: MockRequest = {
    query: vi.fn(),
  };
  const mockPool: MockPool = {
    request: () => mockRequest,
    close: vi.fn(),
    connect: vi.fn(),
  };
  return {
    default: {
      ConnectionPool: vi.fn(() => mockPool),
    },
  };
});

// Import after mocking
import { MssqlServer } from './index.js';

describe('MssqlServer', () => {
  let server: MssqlServer;
  const mockQuery = 'SELECT * FROM TestTable';
  const mockResult = {
    recordset: [{ id: 1, name: 'Test' }],
  };

  beforeEach(() => {
    server = new MssqlServer();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('query tool', () => {
    it('should execute a query with connection string', async () => {
      const mockConfig: config = {
        server: 'Server=localhost;Database=test;User Id=sa;Password=test;',
      };
      const mockPool = new (await import('mssql')).default.ConnectionPool(
        mockConfig
      ) as unknown as MockPool;
      const querySpy = mockPool.request().query;
      querySpy.mockResolvedValue(mockResult);

      const response = await server.handleQuery({
        connectionString: 'Server=localhost;Database=test;User Id=sa;Password=test;',
        query: mockQuery,
      });

      expect(response.content[0].text).toBe(JSON.stringify(mockResult.recordset, null, 2));
      expect(querySpy).toHaveBeenCalledWith(mockQuery);
    });

    it('should execute a query with individual parameters', async () => {
      const mockConfig: config = {
        server: 'localhost',
        user: 'sa',
        password: 'test',
      };
      const mockPool = new (await import('mssql')).default.ConnectionPool(
        mockConfig
      ) as unknown as MockPool;
      const querySpy = mockPool.request().query;
      querySpy.mockResolvedValue(mockResult);

      const response = await server.handleQuery({
        host: 'localhost',
        username: 'sa',
        password: 'test',
        query: mockQuery,
      });

      expect(response.content[0].text).toBe(JSON.stringify(mockResult.recordset, null, 2));
      expect(querySpy).toHaveBeenCalledWith(mockQuery);
    });

    it('should throw error for invalid arguments', async () => {
      const promise = server.handleQuery({
        query: mockQuery,
      });

      await expect(promise).rejects.toThrow(
        new McpError(ErrorCode.InternalError, 'Database error: MCP error -32600: Host is required when not using connection string')
      );
    });

    it('should handle database errors', async () => {
      const mockConfig: config = {
        server: 'localhost',
        user: 'sa',
        password: 'test',
      };
      const mockPool = new (await import('mssql')).default.ConnectionPool(
        mockConfig
      ) as unknown as MockPool;
      const mockError = new Error('Database error');
      const querySpy = mockPool.request().query;
      querySpy.mockRejectedValue(mockError);

      const promise = server.handleQuery({
        host: 'localhost',
        username: 'sa',
        password: 'test',
        query: mockQuery,
      });

      await expect(promise).rejects.toThrow(
        new McpError(ErrorCode.InternalError, 'Database error: Database error')
      );
      expect(querySpy).toHaveBeenCalledWith(mockQuery);
    });
  });
});

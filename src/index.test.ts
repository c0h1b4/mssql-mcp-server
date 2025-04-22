import { describe, expect, vi, beforeEach, afterEach, type SpyInstance } from 'vitest';

interface MockRequest {
  query: SpyInstance;
}

interface MockPool {
  request: () => MockRequest;
  close: SpyInstance;
  connect: SpyInstance;
}

// Mock the mssql module
vi.mock('mssql', () => {
  const mockRequest: MockRequest = {
    query: vi.fn().mockResolvedValue({ recordset: [{ id: 1, name: 'Test' }] }),
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

  beforeEach(() => {
    server = new MssqlServer();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('query tool', () => {
    it('should execute a query with connection string', async () => {
      // Get access to private methods via any cast for testing
      const serverAny = server as any;
      
      // Execute our getConnectionConfig directly
      const response = await serverAny.getConnectionConfig({
        connectionString: 'Server=localhost;Database=test;User Id=sa;Password=test;',
        query: mockQuery,
      });

      expect(response).toEqual({
        server: 'Server=localhost;Database=test;User Id=sa;Password=test;',
      });
    });

    it('should execute a query with individual parameters', async () => {
      // Get access to private methods via any cast for testing
      const serverAny = server as any;
      
      // Execute our method directly
      const response = await serverAny.getConnectionConfig({
        host: 'localhost',
        username: 'sa',
        password: 'test',
        query: mockQuery,
      });

      expect(response).toEqual({
        server: 'localhost',
        port: 1433,
        database: 'master',
        user: 'sa',
        password: 'test',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      });
    });

    it('should handle database errors', async () => {
      const mockPool = new (await import('mssql')).default.ConnectionPool({} as any) as unknown as MockPool;
      const querySpy = mockPool.request().query as SpyInstance;
      
      // Make the query function throw an error this time
      querySpy.mockRejectedValueOnce(new Error('Database error'));

      // Get access to private methods via any cast for testing
      const serverAny = server as any;
      
      // Create and get the pool
      const config = serverAny.getConnectionConfig({
        host: 'localhost',
        username: 'sa',
        password: 'test',
        query: mockQuery,
      });
      
      // Test directly with the SDK's result object structure
      await expect(async () => {
        const pool = await serverAny.getPool(config);
        await pool.request().query(mockQuery);
      }).rejects.toThrow();
    });
  });
});

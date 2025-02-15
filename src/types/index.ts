export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
  enableArithAbort: boolean;
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
    acquireTimeoutMillis: number;
  };
  queryTimeout: number;
  multipleStatements: boolean;
  rowsAsArray: boolean;
  debug: boolean;
  debugSql: boolean;
}

export interface QueryParams {
  query: string;
  params?: Record<string, unknown>;
  database?: string;
  timeout?: number;
}

export interface DatabaseError extends Error {
  code?: string;
  number?: number;
  state?: string;
  class?: number;
  serverName?: string;
  procName?: string;
  lineNumber?: number;
}

export interface McpError extends Error {
  code: string;
}

export interface QueryResult {
  recordset: Record<string, any>[];
}

export type EnvVars = {
  MSSQL_HOST?: string;
  MSSQL_PORT?: string;
  MSSQL_USER?: string;
  MSSQL_PASSWORD?: string;
  MSSQL_DATABASE?: string;
  MSSQL_ENCRYPT?: string;
  MSSQL_TRUST_SERVER_CERTIFICATE?: string;
  MSSQL_ENABLE_ARITH_ABORT?: string;
  MSSQL_POOL_MAX?: string;
  MSSQL_POOL_MIN?: string;
  MSSQL_POOL_IDLE_TIMEOUT?: string;
  MSSQL_POOL_ACQUIRE_TIMEOUT?: string;
  MSSQL_QUERY_TIMEOUT?: string;
  MSSQL_MULTIPLE_STATEMENTS?: string;
  MSSQL_ROWS_AS_ARRAY?: string;
  MSSQL_DEBUG?: string;
  MSSQL_DEBUG_SQL?: string;
  [key: string]: string | undefined;
};

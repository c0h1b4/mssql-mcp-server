import type { DatabaseConfig, EnvVars } from '../types/index.js';

const DEFAULT_PORT = 1433;
const DEFAULT_POOL_MAX = 10;
const DEFAULT_POOL_MIN = 0;
const DEFAULT_POOL_IDLE_TIMEOUT = 30000;
const DEFAULT_POOL_ACQUIRE_TIMEOUT = 15000;
const DEFAULT_QUERY_TIMEOUT = 30000;

export function validateConfig(env: EnvVars): DatabaseConfig {
  // Required settings
  if (!env.MSSQL_HOST) {
    throw new Error('MSSQL_HOST is required');
  }
  if (!env.MSSQL_USER) {
    throw new Error('MSSQL_USER is required');
  }
  if (!env.MSSQL_PASSWORD) {
    throw new Error('MSSQL_PASSWORD is required');
  }

  // Parse and validate port
  const port = parseInt(env.MSSQL_PORT || String(DEFAULT_PORT), 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error('Invalid MSSQL_PORT value');
  }

  // Parse pool settings
  const poolMax = parseInt(env.MSSQL_POOL_MAX || String(DEFAULT_POOL_MAX), 10);
  const poolMin = parseInt(env.MSSQL_POOL_MIN || String(DEFAULT_POOL_MIN), 10);
  const poolIdleTimeout = parseInt(
    env.MSSQL_POOL_IDLE_TIMEOUT || String(DEFAULT_POOL_IDLE_TIMEOUT),
    10
  );
  const poolAcquireTimeout = parseInt(
    env.MSSQL_POOL_ACQUIRE_TIMEOUT || String(DEFAULT_POOL_ACQUIRE_TIMEOUT),
    10
  );

  // Validate pool settings
  if (isNaN(poolMax) || poolMax <= 0) {
    throw new Error('Invalid MSSQL_POOL_MAX value');
  }
  if (isNaN(poolMin) || poolMin < 0) {
    throw new Error('Invalid MSSQL_POOL_MIN value');
  }
  if (poolMin > poolMax) {
    throw new Error('MSSQL_POOL_MIN cannot be greater than MSSQL_POOL_MAX');
  }
  if (isNaN(poolIdleTimeout) || poolIdleTimeout < 0) {
    throw new Error('Invalid MSSQL_POOL_IDLE_TIMEOUT value');
  }
  if (isNaN(poolAcquireTimeout) || poolAcquireTimeout < 0) {
    throw new Error('Invalid MSSQL_POOL_ACQUIRE_TIMEOUT value');
  }

  // Parse query timeout
  const queryTimeout = parseInt(env.MSSQL_QUERY_TIMEOUT || String(DEFAULT_QUERY_TIMEOUT), 10);
  if (isNaN(queryTimeout) || queryTimeout < 0) {
    throw new Error('Invalid MSSQL_QUERY_TIMEOUT value');
  }

  // Parse boolean settings
  const encrypt = parseBooleanConfig(env.MSSQL_ENCRYPT, true);
  const trustServerCertificate = parseBooleanConfig(env.MSSQL_TRUST_SERVER_CERTIFICATE, false);
  const enableArithAbort = parseBooleanConfig(env.MSSQL_ENABLE_ARITH_ABORT, true);
  const multipleStatements = parseBooleanConfig(env.MSSQL_MULTIPLE_STATEMENTS, false);
  const rowsAsArray = parseBooleanConfig(env.MSSQL_ROWS_AS_ARRAY, false);
  const debug = parseBooleanConfig(env.MSSQL_DEBUG, false);
  const debugSql = parseBooleanConfig(env.MSSQL_DEBUG_SQL, false);

  return {
    host: env.MSSQL_HOST,
    port,
    user: env.MSSQL_USER,
    password: env.MSSQL_PASSWORD,
    database: env.MSSQL_DATABASE,
    encrypt,
    trustServerCertificate,
    enableArithAbort,
    pool: {
      max: poolMax,
      min: poolMin,
      idleTimeoutMillis: poolIdleTimeout,
      acquireTimeoutMillis: poolAcquireTimeout,
    },
    queryTimeout,
    multipleStatements,
    rowsAsArray,
    debug,
    debugSql,
  };
}

function parseBooleanConfig(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  const lowercaseValue = value.toLowerCase();
  if (lowercaseValue === 'true' || lowercaseValue === '1') {
    return true;
  }
  if (lowercaseValue === 'false' || lowercaseValue === '0') {
    return false;
  }
  throw new Error(`Invalid boolean value: ${value}`);
}
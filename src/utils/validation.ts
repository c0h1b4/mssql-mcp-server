// This file is kept for backward compatibility with tests
// but the main validation logic is now handled by Zod schemas

import { z } from 'zod';
import type { QueryParams } from '../types/index.js';

const MAX_QUERY_LENGTH = 1000000; // 1MB
const DANGEROUS_COMMANDS = ['DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'EXEC', 'EXECUTE', 'sp_', 'xp_'];

// Schema for validating query parameters
export const QueryParamsSchema = z.object({
  query: z.string().min(1).max(MAX_QUERY_LENGTH),
  params: z.record(z.unknown()).optional(),
  database: z.string().max(128).optional(),
  timeout: z.number().min(0).max(3600000).optional(),
});

// Legacy validation function kept for test compatibility
export function validateQueryParams(params: QueryParams): void {
  // Check query presence
  if (!params.query) {
    throw new Error('Query is required');
  }

  // Check query length
  if (params.query.length > MAX_QUERY_LENGTH) {
    throw new Error(`Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`);
  }

  // Check for dangerous commands
  const upperQuery = params.query.toUpperCase();
  for (const command of DANGEROUS_COMMANDS) {
    if (upperQuery.includes(command)) {
      throw new Error(`Query contains forbidden command: ${command}`);
    }
  }

  // Validate database name if provided
  if (params.database) {
    validateDatabaseName(params.database);
  }

  // Validate timeout if provided
  if (params.timeout !== undefined) {
    validateTimeout(params.timeout);
  }

  // Validate parameters if provided
  if (params.params) {
    validateQueryParameters(params.params);
  }
}

function validateDatabaseName(name: string): void {
  // Check for SQL injection in database name
  const invalidChars = /[;'"\\]/;
  if (invalidChars.test(name)) {
    throw new Error('Database name contains invalid characters');
  }

  // Check database name length
  if (name.length > 128) {
    throw new Error('Database name exceeds maximum length of 128 characters');
  }
}

function validateTimeout(timeout: number): void {
  if (typeof timeout !== 'number') {
    throw new Error('Timeout must be a number');
  }

  if (timeout < 0) {
    throw new Error('Timeout cannot be negative');
  }

  if (timeout > 3600000) {
    // 1 hour
    throw new Error('Timeout cannot exceed 1 hour');
  }
}

function validateQueryParameters(params: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(params)) {
    // Validate parameter name
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      throw new Error(`Invalid parameter name: ${key}`);
    }

    // Validate parameter value
    if (!isValidParameterValue(value)) {
      throw new Error(`Invalid parameter value for ${key}`);
    }
  }
}

function isValidParameterValue(value: unknown): boolean {
  if (value === null) {
    return true;
  }

  switch (typeof value) {
    case 'string':
      return value.length <= 8000; // Max NVARCHAR length
    case 'number':
      return !isNaN(value) && isFinite(value);
    case 'boolean':
      return true;
    case 'object':
      if (value instanceof Date) {
        return !isNaN(value.getTime());
      }
      if (value instanceof Buffer) {
        return value.length <= 2147483647; // Max VARBINARY length
      }
      return false;
    default:
      return false;
  }
}

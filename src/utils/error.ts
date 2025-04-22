// This file is kept for backward compatibility with tests
// but the main error handling is now done within the tool implementation

import type { DatabaseError } from '../types/index.js';

export function handleError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  const dbError = error as DatabaseError;

  // SQL Server specific error codes
  if (dbError.number) {
    switch (dbError.number) {
      // Login failed
      case 18456:
        return new Error('Authentication failed');

      // Database does not exist
      case 4060:
        return new Error('Database does not exist');

      // Object (table, view, etc.) does not exist
      case 208:
        return new Error('Object does not exist');

      // Permission denied
      case 229:
      case 230:
        return new Error('Insufficient permissions');

      // Query timeout
      case -2:
        return new Error('Query execution timeout');

      // Connection timeout
      case -1:
        return new Error('Connection timeout');

      // Constraint violation
      case 547:
        return new Error('Operation would violate database constraints');

      // Duplicate key
      case 2601:
      case 2627:
        return new Error('Duplicate key value');

      // Arithmetic overflow
      case 8115:
        return new Error('Arithmetic overflow error');

      // String or binary data would be truncated
      case 8152:
        return new Error('Data would be truncated');

      // Invalid object name
      case 201:
        return new Error('Invalid object name');

      // Invalid column name
      case 207:
        return new Error('Invalid column name');

      // Syntax error
      case 102:
        return new Error('SQL syntax error');
    }
  }

  // Connection errors
  if (dbError.code) {
    switch (dbError.code) {
      case 'ECONNREFUSED':
        return new Error('Connection refused');

      case 'ETIMEDOUT':
        return new Error('Connection timed out');

      case 'ENOTFOUND':
        return new Error('Host not found');

      case 'ENETUNREACH':
        return new Error('Network unreachable');
    }
  }

  // Generic error handling
  const message = dbError.message || 'An unknown error occurred';
  return new Error(message);
}

export function isTransientError(error: unknown): boolean {
  const dbError = error as DatabaseError;

  // SQL Server transient error numbers
  const transientErrors = [
    -2, // Timeout
    701, // Out of memory
    921, // Database has not been recovered yet
    1204, // Lock issue
    1205, // Deadlock victim
    1221, // Resource lock validation
    40143, // Azure SQL connection issue
    40197, // Azure SQL error processing request
    40501, // Azure SQL service busy
    40613, // Azure SQL Database not currently available
  ];

  return (
    transientErrors.includes(dbError.number || 0) ||
    dbError.code === 'ETIMEDOUT' ||
    dbError.code === 'ECONNRESET' ||
    dbError.code === 'EPIPE'
  );
}
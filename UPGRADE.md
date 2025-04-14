# Upgrade to MCP SDK 1.9.0

This document describes the upgrade from Model Context Protocol SDK version 0.1.0 to 1.9.0.

## Major Changes

The MCP SDK has undergone significant changes between version 0.1.0 and 1.9.0, including:

1. Introduction of a higher-level `McpServer` class that simplifies server creation
2. Improved parameter validation with Zod schemas instead of custom validation functions
3. Simplified tool definition and error handling
4. Better type safety and IntelliSense support

## Upgrade Steps

The following changes were made to upgrade the codebase:

### 1. Package Dependencies

Updated `package.json` to use the latest SDK version:

```diff
- "@modelcontextprotocol/sdk": "^0.1.0",
+ "@modelcontextprotocol/sdk": "^1.9.0",
```

And added the required Zod dependency:

```
npm install zod
```

### 2. Server Implementation

The main implementation class was updated to use the new API:

```diff
- import { Server } from '@modelcontextprotocol/sdk/server/index.js';
+ import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
```

### 3. Schema Validation

Replaced custom validation with Zod schemas but with a format that works with the tool API:

```diff
- const isValidQueryArgs = (args: unknown): args is QueryArgs => {
-   // Custom validation logic...
- };
+ server.tool(
+   'query',
+   {
+     connectionString: z.string().optional(),
+     host: z.string().optional(),
+     // etc.
+   },
+   async (args) => {
+     // ...
+   }
+ );
```

### 4. Method Names

Some method names have changed in the new API:

```diff
- await this.server.disconnect();
+ await this.server.close();
```

### 5. Error Handling

Switched from McpError objects to standard Error or returned error responses:

```diff
- throw new McpError(ErrorCode.InternalError, `Database error: ${message}`);
+ throw new Error(`Database error: ${message}`);
// OR
+ return {
+   content: [{ type: 'text', text: `Database error: ${message}` }],
+   isError: true,
+ };
```

## Breaking Changes

1. The low-level `Server` class has been replaced with the higher-level `McpServer` class
2. Request handlers are now registered using more concise methods like `tool()`, `resource()`, etc.
3. Error handling is now done by returning objects with `isError: true` instead of throwing exceptions
4. Parameter validation is now done using Zod schemas in a format expected by the tool API
5. Method names have changed - `disconnect()` is now `close()`

## Testing

After upgrading, make sure to run tests to verify the functionality:

```
npm test
```

Note that test files have been updated to accommodate the new API changes.

## Known Issues

When using Zod schemas with the tool API, you need to use the individual schema properties as an object instead of directly passing a ZodEffects or ZodObject:

```diff
- server.tool('query', QueryArgsSchema, async (args) => {/* ... */})
+ server.tool('query', 
+   {
+     connectionString: z.string().optional(),
+     // other schema properties...
+   }, 
+   async (args) => {/* ... */}
+ )
```

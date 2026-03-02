# CLAUDE.md - Project Instructions for Claude

This file provides guidance for Claude when working with the Sharesight MCP Server codebase.

## Project Overview

This is an MCP (Model Context Protocol) server that wraps the Sharesight v3 API, allowing AI assistants to interact with Sharesight portfolio data through natural language.

**Tech Stack:**
- TypeScript
- Node.js 18+
- MCP SDK (`@modelcontextprotocol/sdk`)

## Project Structure

```
sharesight-mcp/
├── src/
│   ├── index.ts              # MCP server entry point and tool definitions
│   ├── oauth.ts              # OAuth 2.0 client credentials token management
│   ├── sharesight-client.ts  # HTTP client for Sharesight API
│   └── types.ts              # TypeScript interfaces for API types
├── dist/                     # Compiled output (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Key Files

### `src/index.ts`
The entry point. Reads `SHARESIGHT_CLIENT_ID` and `SHARESIGHT_CLIENT_SECRET` from env vars, creates the OAuth manager and Sharesight client, registers all MCP tools, and connects the stdio transport. No CLI commands — it just runs.

### `src/oauth.ts`
OAuth 2.0 manager using the **client credentials** grant type. Fetches a token on first use, caches it in memory, and re-fetches automatically when it expires (Sharesight tokens last 30 minutes). No file storage.

### `src/sharesight-client.ts`
HTTP client class with methods for each API endpoint. All methods:
- Are async and return typed responses
- Use the private `request()` method for HTTP calls
- Handle query parameters and request bodies

### `src/types.ts`
TypeScript interfaces matching Sharesight API v3 response structures. Organized into:
- Common types (ApiTransaction, Currency, Pagination)
- Domain types (Portfolio, Holding, CustomInvestment, etc.)
- Response types (PortfoliosResponse, HoldingsResponse, etc.)
- Request types (CreateCustomInvestmentRequest, etc.)

## Build Commands

```bash
npm install     # Install dependencies
npm run build   # Compile TypeScript to dist/
npm run dev     # Watch mode for development
npm start       # Run the compiled server
```

## Adding a New Tool

1. **Add API method** to `src/sharesight-client.ts`:
   ```typescript
   async newMethod(param: string): Promise<SomeResponse> {
     return this.request<SomeResponse>("GET", `/endpoint/${param}`);
   }
   ```

2. **Add types** to `src/types.ts` if needed

3. **Add tool** to `registerTools()` in `src/index.ts`:
   ```typescript
   server.registerTool(
     "new_tool",
     {
       description: "Description of what it does",
       inputSchema: z.object({
         param: z.string().describe("..."),
       }),
     },
     async (args) => {
       try {
         const result = await client.newMethod(args.param);
         return formatResult(result);
       } catch (error) {
         return formatError(error);
       }
     }
   );
   ```

## API Conventions

### Sharesight API v3
- Base URL: `https://api.sharesight.com/api/v3`
- Auth: Bearer token in Authorization header
- Dates: `YYYY-MM-DD` format
- Pagination: cursor-based with `page` and `per_page`

### Error Handling
The client throws errors for non-2xx responses. The MCP handler catches these and returns `isError: true` responses.

## Authentication

Uses OAuth 2.0 client credentials grant type. Set `SHARESIGHT_CLIENT_ID` and `SHARESIGHT_CLIENT_SECRET` environment variables. No interactive auth flow or token files.

## Testing

Currently no automated tests. Test manually:

1. Set `SHARESIGHT_CLIENT_ID` and `SHARESIGHT_CLIENT_SECRET` env vars
2. Run `node dist/index.js`
3. Use MCP inspector or Claude Desktop to test tools

## Common Tasks

### Update an existing tool
1. Find the tool in `registerTools()` in `src/index.ts`
2. Modify the `inputSchema` as needed
3. Update the handler if parameters changed
4. Update the client method in `src/sharesight-client.ts` if needed

### Fix type errors
1. Check `src/types.ts` matches actual API responses
2. The API sometimes returns different field names (camelCase vs snake_case)
3. Mark optional fields with `?`

### Debug API issues
1. Check `SHARESIGHT_CLIENT_ID` and `SHARESIGHT_CLIENT_SECRET` are set correctly
2. Look at the error message from Sharesight
3. Compare request against API documentation

## Notes

- The server uses stdio transport (stdin/stdout)
- All tool responses are JSON stringified with 2-space indentation
- Tokens are held in memory only — no files written to disk

# Sharesight MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with access to the [Sharesight](https://www.sharesight.com/) portfolio tracking platform via the v3 API.

## Quick Start

### Step 1: Get OAuth Credentials

You'll need a **Client ID** and **Client Secret** from Sharesight.

- Contact Sharesight support at support@sharesight.com to request API access
- Visit the [Sharesight API documentation](https://api.sharesight.com/doc/api/v3) for more information
- API access may require a specific Sharesight plan

### Step 2: Add MCP Server Configuration

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sharesight": {
      "command": "npx",
      "args": ["-y", "github:sryburn/sharesight-mcp"],
      "env": {
        "SHARESIGHT_CLIENT_ID": "your_client_id",
        "SHARESIGHT_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

Restart Claude Desktop and you're ready to go.

## Overview

This MCP server enables Claude and other AI assistants to interact with Sharesight accounts, allowing natural language queries and operations on investment portfolios, holdings, custom investments, and performance reports.

### What is Sharesight?

Sharesight is a portfolio tracking platform that helps investors track their stocks, ETFs, mutual funds, and other investments across multiple markets. It provides performance reporting, dividend tracking, and tax reporting features.

### What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that enables AI assistants to securely connect to external data sources and tools.

## Authentication

This server uses the OAuth 2.0 **client credentials** grant type. Your `SHARESIGHT_CLIENT_ID` and `SHARESIGHT_CLIENT_SECRET` are passed as environment variables — no browser-based auth flow or stored token files required. Tokens are fetched automatically at startup and refreshed in memory when they expire.

## Tools

| Tool | Description |
|------|-------------|
| `list_portfolios` | List all user portfolios with optional consolidated view |
| `get_performance_report` | Detailed performance breakdown with gains, holdings, and benchmarks |

## Install from Source

```bash
git clone https://github.com/sryburn/sharesight-mcp.git
cd sharesight-mcp
npm install
npm run build
```

Then configure Claude Desktop to use the local build:

```json
{
  "mcpServers": {
    "sharesight": {
      "command": "node",
      "args": ["/path/to/sharesight-mcp/dist/index.js"],
      "env": {
        "SHARESIGHT_CLIENT_ID": "your_client_id",
        "SHARESIGHT_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Error Handling

Common errors:
- **401** - Invalid or expired credentials
- **403** - Insufficient permissions
- **404** - Resource not found
- **422** - Validation error (check field values)

## Development

```bash
npm run dev     # Watch mode
npm run build   # Build for production
npm start       # Run the server
```

## License

MIT — see [LICENSE](LICENSE). Original work by [Haizzz](https://github.com/Haizzz/sharesight-mcp).

## Fork Notes

This is a fork of [Haizzz/sharesight-mcp](https://github.com/Haizzz/sharesight-mcp). Key changes from the original:

- Switched from OAuth 2.0 authorization code flow to **client credentials** grant type, eliminating the need for a one-time browser-based auth setup and stored token files
- Credentials are passed via environment variables only; no state is written to disk
- Stripped down to two tools (`list_portfolios`, `get_performance_report`) to reduce AI agent complexity and limit API access to read-only operations

## Support

- **Sharesight Support**: support@sharesight.com
- **API Documentation**: https://api.sharesight.com/doc/api/v3
- **MCP Protocol**: https://modelcontextprotocol.io/

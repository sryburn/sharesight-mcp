# Sharesight MCP Server

A Model Context Protocol (MCP) server that gives AI assistants read-only access to [Sharesight](https://www.sharesight.com/) portfolio performance data.

This allows an AI agent to list your portfolios and retrieve a full performance breakdown — including all holdings and their individual performance — for any portfolio over any date range.

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

## What can it do?

Ask Claude things like:

- *"How has my portfolio performed this year?"*
- *"Which of my holdings has performed best over the last 6 months?"*
- *"Show me my portfolio performance for the 2026 financial year."*
- *"What are my biggest positions and how are they tracking?"*

## Tools

| Tool | Description |
|------|-------------|
| `list_portfolios` | List all portfolios in the account |
| `get_performance_report` | Get a full performance breakdown for a portfolio, including all holdings and their gains, over a specified date range |

## Authentication

This server uses the OAuth 2.0 **client credentials** grant type. Your `SHARESIGHT_CLIENT_ID` and `SHARESIGHT_CLIENT_SECRET` are passed as environment variables — no browser-based auth flow or stored token files required. Tokens are fetched automatically and refreshed in memory when they expire.

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

- Stripped down to two read-only tools (`list_portfolios`, `get_performance_report`) covering the core portfolio performance use case
- Switched from OAuth 2.0 authorization code flow to **client credentials** grant type, eliminating the need for a one-time browser-based auth setup and stored token files
- Credentials are passed via environment variables only; no state is written to disk

## Support

- **Sharesight Support**: support@sharesight.com
- **API Documentation**: https://api.sharesight.com/doc/api/v3
- **MCP Protocol**: https://modelcontextprotocol.io/

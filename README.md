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

## Features

This server exposes **27 tools** covering all Sharesight v3 API endpoints:

### Portfolio Management
| Tool | Description |
|------|-------------|
| `list_portfolios` | List all user portfolios with optional consolidated view |
| `get_portfolio` | Get detailed portfolio information by ID |
| `list_portfolio_holdings` | List all holdings within a specific portfolio |
| `get_portfolio_user_setting` | Get user display preferences for a portfolio |
| `update_portfolio_user_setting` | Update chart type, grouping, and other display settings |

### Holdings Management
| Tool | Description |
|------|-------------|
| `list_holdings` | List all holdings across all portfolios |
| `get_holding` | Get holding details with optional cost base and historical values |
| `update_holding` | Update holding settings (DRP configuration) |
| `delete_holding` | Remove a holding from a portfolio |

### Custom Investments
| Tool | Description |
|------|-------------|
| `list_custom_investments` | List custom/unlisted investments |
| `get_custom_investment` | Get custom investment details |
| `create_custom_investment` | Create a new custom investment (property, bonds, etc.) |
| `update_custom_investment` | Update custom investment properties |
| `delete_custom_investment` | Remove a custom investment |

### Custom Investment Prices
| Tool | Description |
|------|-------------|
| `list_custom_investment_prices` | Get price history for a custom investment |
| `create_custom_investment_price` | Add a new price entry |
| `update_custom_investment_price` | Modify an existing price entry |
| `delete_custom_investment_price` | Remove a price entry |

### Coupon Rates (Fixed Interest)
| Tool | Description |
|------|-------------|
| `list_coupon_rates` | List interest rates for fixed interest investments |
| `create_coupon_rate` | Add a new coupon rate |
| `update_coupon_rate` | Modify a coupon rate |
| `delete_coupon_rate` | Remove a coupon rate |

### Performance Reports
| Tool | Description |
|------|-------------|
| `get_performance_report` | Detailed performance breakdown with gains analysis |
| `get_performance_index_chart` | Chart data for visualizing portfolio performance |

### Other
| Tool | Description |
|------|-------------|
| `list_countries` | Get Sharesight-supported countries and their settings |
| `show_coupon_code` | View applied promotional coupon code |
| `apply_coupon_code` | Apply a promotional coupon code |
| `delete_coupon_code` | Remove applied coupon code |
| `revoke_api_access` | Disconnect API access (invalidates all tokens) |

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

## Support

- **Sharesight Support**: support@sharesight.com
- **API Documentation**: https://api.sharesight.com/doc/api/v3
- **MCP Protocol**: https://modelcontextprotocol.io/

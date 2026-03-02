#!/usr/bin/env node

/**
 * Sharesight MCP Server
 *
 * @see https://api.sharesight.com/doc/api/v3
 * @see https://modelcontextprotocol.io/
 *
 * @module index
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SharesightClient } from "./sharesight-client.js";
import { OAuthManager } from "./oauth.js";

function formatResult(result: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
}

function formatError(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return { content: [{ type: "text" as const, text: `Error: ${errorMessage}` }], isError: true };
}

function registerTools(server: McpServer, client: SharesightClient) {
  // ==================== Portfolios ====================

  server.registerTool(
    "list_portfolios",
    {
      description: "Retrieves a list of the user's portfolios. Optionally filter by consolidated view or instrument.",
      inputSchema: z.object({
        consolidated: z.boolean().optional().describe("Set to true to see consolidated portfolio views"),
        instrument_id: z.number().optional().describe("Filter by instrument ID. When set, consolidated defaults to false"),
      }),
    },
    async (args) => {
      try {
        const result = await client.listPortfolios(args);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_portfolio",
    {
    description: "Retrieves a single portfolio by ID",
      inputSchema: z.object({
        portfolio_id: z.number().describe("The portfolio ID"),
        consolidated: z.boolean().optional().describe("Set to true if the portfolio is consolidated"),
      }),
    },
    async (args) => {
      try {
        const result = await client.getPortfolio(args.portfolio_id, args.consolidated);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "list_portfolio_holdings",
    {
    description: "Retrieves all holdings for a specific portfolio",
      inputSchema: z.object({
        portfolio_id: z.number().describe("The portfolio ID"),
        consolidated: z.boolean().optional().describe("True if a consolidated view is requested"),
      }),
    },
    async (args) => {
      try {
        const result = await client.listPortfolioHoldings(args.portfolio_id, args.consolidated);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_portfolio_user_setting",
    {
      description: "Retrieves user settings for a portfolio (chart type, grouping, etc.)",
      inputSchema: z.object({
        portfolio_id: z.number().describe("The portfolio ID"),
        consolidated: z.boolean().optional().describe("Set to true for consolidated portfolio views"),
      }),
    },
    async (args) => {
      try {
        const result = await client.showPortfolioUserSetting(args.portfolio_id, args.consolidated);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "update_portfolio_user_setting",
    {
    description: "Updates user settings for a portfolio",
      inputSchema: z.object({
        portfolio_id: z.number().describe("The portfolio ID"),
        consolidated: z.boolean().optional().describe("Set to true for consolidated portfolio views"),
        portfolio_chart: z.string().optional().describe("Chart type: VALUE, VALUELINE, GROWTH, BENCHMARK, or HIDE"),
        holding_chart: z.string().optional().describe("Holding chart type: PRICE, HOLDING_VALUE, BENCHMARK, or HIDE"),
        combined: z.boolean().optional().describe("True to combine holdings in consolidated portfolios"),
        grouping: z.string().optional().describe("Grouping to use (e.g., market, country, currency)"),
        include_sold_shares: z.boolean().optional().describe("True to include sold shares in calculations"),
      }),
    },
    async (args) => {
      try {
        const { portfolio_id, consolidated, ...settings } = args;
        const result = await client.updatePortfolioUserSetting(
          portfolio_id,
          { portfolio_user_settings: settings },
          consolidated
        );

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ==================== Holdings ====================

  server.registerTool(
    "list_holdings",
  {
    description: "Retrieves a list of all holdings across all portfolios",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const result = await client.listHoldings();

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_holding",
    {
    description: "Retrieves details of a specific holding",
      inputSchema: z.object({
        holding_id: z.number().describe("The holding ID"),
        average_purchase_price: z.boolean().optional().describe("Include average purchase price in response"),
        cost_base: z.boolean().optional().describe("Include cost base in response"),
        values_over_time: z.string().optional().describe("Set to 'true' for values from inception, or a date (YYYY-MM-DD) for start date"),
      }),
    },
    async (args) => {
      try {
        const result = await client.getHolding(args.holding_id, {
          average_purchase_price: args.average_purchase_price,
          cost_base: args.cost_base,
          values_over_time: args.values_over_time,
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "update_holding",
    {
    description: "Updates a holding (currently supports DRP settings)",
      inputSchema: z.object({
        holding_id: z.number().describe("The holding ID"),
        enable_drp: z.boolean().optional().describe("Set to true to enable DRP, false to disable"),
        drp_mode_setting: z.string().optional().describe("DRP mode: up, down, half, or down_track"),
      }),
    },
    async (args) => {
      try {
        const result = await client.updateHolding(args.holding_id, {
          enable_drp: args.enable_drp,
          drp_mode_setting: args.drp_mode_setting,
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "delete_holding",
    {
    description: "Deletes a holding",
      inputSchema: z.object({
        holding_id: z.number().describe("The holding ID to delete"),
      }),
    },
    async (args) => {
      try {
        const result = await client.deleteHolding(args.holding_id);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ==================== Custom Investments ====================

  server.registerTool(
    "list_custom_investments",
  {
    description: "Retrieves a list of custom investments",
      inputSchema: z.object({
        portfolio_id: z.number().optional().describe("Optional portfolio ID to filter by"),
      }),
    },
    async (args) => {
      try {
        const result = await client.listCustomInvestments(args.portfolio_id);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_custom_investment",
    {
    description: "Retrieves a single custom investment by ID",
      inputSchema: z.object({
        id: z.number().describe("The custom investment ID"),
      }),
    },
    async (args) => {
      try {
        const result = await client.getCustomInvestment(args.id);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "create_custom_investment",
    {
    description: "Creates a new custom investment",
      inputSchema: z.object({
        portfolio_id: z.number().optional().describe("Portfolio ID (optional, links to owner if not provided)"),
        code: z.string().describe("The investment code"),
        name: z.string().describe("The name of the custom investment"),
        country_code: z.string().describe("Country code (e.g., AU, NZ, US)"),
        investment_type: z.string().describe("Type: ORDINARY, WARRANT, SHAREFUND, PROPFUND, PREFERENCE, STAPLEDSEC, OPTIONS, RIGHTS, MANAGED_FUND, FIXED_INTEREST, PIE"),
        face_value: z.number().optional().describe("Face value per unit (FIXED_INTEREST only)"),
        interest_rate: z.number().optional().describe("Initial interest rate (FIXED_INTEREST only)"),
        income_type: z.string().optional().describe("DIVIDEND or INTEREST (FIXED_INTEREST only)"),
        payment_frequency: z.string().optional().describe("ON_MATURITY, YEARLY, TWICE_YEARLY, QUARTERLY, MONTHLY (FIXED_INTEREST only)"),
        first_payment_date: z.string().optional().describe("First payment date YYYY-MM-DD (FIXED_INTEREST only)"),
        maturity_date: z.string().optional().describe("Maturity date YYYY-MM-DD (FIXED_INTEREST only)"),
        auto_calc_income: z.boolean().optional().describe("Auto-populate income payments (FIXED_INTEREST only)"),
      }),
    },
    async (args) => {
      try {
        const result = await client.createCustomInvestment(args);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "update_custom_investment",
    {
    description: "Updates an existing custom investment",
      inputSchema: z.object({
        id: z.number().describe("The custom investment ID"),
        code: z.string().optional().describe("The investment code"),
        name: z.string().optional().describe("The name of the custom investment"),
        portfolio_id: z.number().optional().describe("Portfolio ID to associate with"),
        face_value: z.number().optional().describe("Face value per unit"),
        interest_rate: z.number().optional().describe("Interest rate"),
        income_type: z.string().optional().describe("DIVIDEND or INTEREST"),
        payment_frequency: z.string().optional().describe("Payment frequency"),
        first_payment_date: z.string().optional().describe("First payment date YYYY-MM-DD"),
        maturity_date: z.string().optional().describe("Maturity date YYYY-MM-DD"),
        auto_calc_income: z.boolean().optional().describe("Auto-populate income payments"),
      }),
    },
    async (args) => {
      try {
        const { id, ...updateData } = args;
        const result = await client.updateCustomInvestment(id, updateData);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "delete_custom_investment",
    {
    description: "Deletes a custom investment",
      inputSchema: z.object({
        id: z.number().describe("The custom investment ID to delete"),
      }),
    },
    async (args) => {
      try {
        const result = await client.deleteCustomInvestment(args.id);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ==================== Custom Investment Prices ====================

  server.registerTool(
    "list_custom_investment_prices",
  {
    description: "Retrieves prices for a custom investment",
      inputSchema: z.object({
        custom_investment_id: z.number().describe("The custom investment ID"),
        start_date: z.string().optional().describe("Start date YYYY-MM-DD"),
        end_date: z.string().optional().describe("End date YYYY-MM-DD"),
        page: z.string().optional().describe("Pagination pointer"),
        per_page: z.number().optional().describe("Items per page (max 100)"),
      }),
    },
    async (args) => {
      try {
        const result = await client.listCustomInvestmentPrices(args.custom_investment_id, {
          start_date: args.start_date,
          end_date: args.end_date,
          page: args.page,
          per_page: args.per_page,
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "create_custom_investment_price",
    {
    description: "Creates a price entry for a custom investment",
      inputSchema: z.object({
        custom_investment_id: z.number().describe("The custom investment ID"),
        last_traded_price: z.number().describe("The price in instrument currency"),
        last_traded_on: z.string().describe("The date YYYY-MM-DD"),
      }),
    },
    async (args) => {
      try {
        const result = await client.createCustomInvestmentPrice(args.custom_investment_id, {
          last_traded_price: args.last_traded_price,
          last_traded_on: args.last_traded_on,
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "update_custom_investment_price",
    {
    description: "Updates a price for a custom investment",
      inputSchema: z.object({
        price_id: z.number().describe("The price ID"),
        last_traded_price: z.number().optional().describe("The price in instrument currency"),
        last_traded_on: z.string().optional().describe("The date YYYY-MM-DD"),
      }),
    },
    async (args) => {
      try {
        const result = await client.updateCustomInvestmentPrice(args.price_id, {
          last_traded_price: args.last_traded_price,
          last_traded_on: args.last_traded_on,
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "delete_custom_investment_price",
    {
    description: "Deletes a price for a custom investment",
      inputSchema: z.object({
        price_id: z.number().describe("The price ID to delete"),
      }),
    },
    async (args) => {
      try {
        const result = await client.deleteCustomInvestmentPrice(args.price_id);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ==================== Coupon Rates ====================

  server.registerTool(
    "list_coupon_rates",
    {
      description: "Retrieves coupon rates for a fixed interest custom investment",
      inputSchema: z.object({
        instrument_id: z.number().describe("The custom investment instrument ID"),
        start_date: z.string().optional().describe("Start date YYYY-MM-DD"),
        end_date: z.string().optional().describe("End date YYYY-MM-DD"),
        page: z.string().optional().describe("Pagination pointer"),
        per_page: z.number().optional().describe("Items per page (max 100)"),
      }),
    },
    async (args) => {
      try {
        const result = await client.listCouponRates(args.instrument_id, {
          start_date: args.start_date,
          end_date: args.end_date,
          page: args.page,
          per_page: args.per_page,
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "create_coupon_rate",
    {
      description: "Creates a coupon rate for a custom investment",
      inputSchema: z.object({
        instrument_id: z.number().describe("The custom investment instrument ID"),
        interest_rate: z.number().describe("The interest rate as a percentage"),
        date: z.string().describe("The date from which the rate applies YYYY-MM-DD"),
      }),
    },
    async (args) => {
      try {
        const result = await client.createCouponRate(args.instrument_id, {
          coupon_rate: {
            interest_rate: args.interest_rate,
            date: args.date,
          },
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "update_coupon_rate",
    {
      description: "Updates a coupon rate",
      inputSchema: z.object({
        id: z.number().describe("The coupon rate ID"),
        interest_rate: z.number().describe("The interest rate as a percentage"),
        date: z.string().describe("The date from which the rate applies YYYY-MM-DD"),
      }),
    },
    async (args) => {
      try {
        const result = await client.updateCouponRate(args.id, {
          coupon_rate: {
            interest_rate: args.interest_rate,
            date: args.date,
          },
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "delete_coupon_rate",
    {
      description: "Deletes a coupon rate",
      inputSchema: z.object({
        id: z.number().describe("The coupon rate ID to delete"),
      }),
    },
    async (args) => {
      try {
        const result = await client.deleteCouponRate(args.id);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ==================== Coupon Codes ====================

  server.registerTool(
    "show_coupon_code",
    {
      description: "Returns the coupon code applied to the current user",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const result = await client.showCouponCode();

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "apply_coupon_code",
    {
      description: "Applies a coupon code to the current user",
      inputSchema: z.object({
        code: z.string().describe("The coupon code to apply"),
      }),
    },
    async (args) => {
      try {
        const result = await client.applyCouponCode(args.code);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "delete_coupon_code",
    {
      description: "Removes the coupon code from the current user",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const result = await client.deleteCouponCode();

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ==================== Reports ====================

  server.registerTool(
    "get_performance_report",
    {
      description: "Retrieves the performance report for a portfolio with gains, holdings breakdown, and benchmarks",
      inputSchema: z.object({
        portfolio_id: z.number().describe("The portfolio ID"),
        start_date: z.string().optional().describe("Start date YYYY-MM-DD (defaults to portfolio inception)"),
        end_date: z.string().optional().describe("End date YYYY-MM-DD (defaults to today)"),
        consolidated: z.boolean().optional().describe("Set to true for consolidated portfolio views"),
        include_sales: z.boolean().optional().describe("Include or exclude sales"),
        report_combined: z.boolean().optional().describe("Receive combined totals for same instruments across portfolios"),
        grouping: z.string().optional().describe("Group by: country, currency, custom_group, industry_classification, investment_type, market, portfolio, sector_classification, ungrouped"),
        custom_group_id: z.number().optional().describe("Custom group ID (requires grouping=custom_group)"),
        include_limited: z.boolean().optional().describe("Include holdings limited by user plan"),
        benchmark_code: z.string().optional().describe("Benchmark code and market (e.g., SPY.NYSE)"),
      }),
    },
    async (args) => {
      try {
        const result = await client.getPerformanceReport(args.portfolio_id, {
          start_date: args.start_date,
          end_date: args.end_date,
          consolidated: args.consolidated,
          include_sales: args.include_sales,
          report_combined: args.report_combined,
          grouping: args.grouping,
          custom_group_id: args.custom_group_id,
          include_limited: args.include_limited,
          benchmark_code: args.benchmark_code,
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_performance_index_chart",
    {
      description: "Returns performance index chart data points for visualizing portfolio performance over time",
      inputSchema: z.object({
        portfolio_id: z.number().describe("The portfolio ID"),
        consolidated: z.boolean().optional().describe("True if consolidated view is requested"),
        start_date: z.string().optional().describe("Start date YYYY-MM-DD (defaults to inception)"),
        end_date: z.string().optional().describe("End date YYYY-MM-DD (defaults to today)"),
        grouping: z.string().optional().describe("Group by: country, currency, custom_group, industry_classification, investment_type, market, portfolio, sector_classification, ungrouped"),
        custom_group_id: z.number().optional().describe("Custom group ID (requires grouping=custom_group)"),
        benchmark_code: z.string().optional().describe("Benchmark code and market (e.g., SPY.NYSE)"),
      }),
    },
    async (args) => {
      try {
        const result = await client.getPerformanceIndexChart(args.portfolio_id, {
          consolidated: args.consolidated,
          start_date: args.start_date,
          end_date: args.end_date,
          grouping: args.grouping,
          custom_group_id: args.custom_group_id,
          benchmark_code: args.benchmark_code,
        });

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ==================== Metadata ====================

  server.registerTool(
    "list_countries",
    {
      description: "Retrieves Sharesight country definitions",
      inputSchema: z.object({
        supported: z.boolean().optional().describe("Filter by supported status (omit for all)"),
      }),
    },
    async (args) => {
      try {
        const result = await client.listCountries(args.supported);

        return formatResult(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ==================== OAuth ====================

  server.registerTool(
    "revoke_api_access",
    {
      description: "Disconnects API access for the user. Invalidates ALL access and refresh tokens.",
      inputSchema: z.object({
        client_id: z.string().describe("The client application ID"),
      }),
    },
    async (args) => {
      try {
        const result = await client.revokeApiAccess(args.client_id);

        return formatResult(result);
  } catch (error) {
        return formatError(error);
      }
    }
  );
}

async function main(): Promise<void> {
  const clientId = process.env.SHARESIGHT_CLIENT_ID;
  const clientSecret = process.env.SHARESIGHT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      "Error: Missing credentials. Set SHARESIGHT_CLIENT_ID and SHARESIGHT_CLIENT_SECRET environment variables."
    );
    process.exit(1);
  }

  const oauth = new OAuthManager({ clientId, clientSecret });
  const client = new SharesightClient(oauth);

  const server = new McpServer({
    name: "sharesight-mcp",
    version: "1.0.0",
  });

  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sharesight MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

/**
 * Sharesight API v3 Client
 *
 * @see https://api.sharesight.com/doc/api/v3
 * @module sharesight-client
 */

import {
  PerformanceReportResponse,
  PortfoliosResponse,
} from "./types.js";
import { OAuthManager } from "./oauth.js";

const API_BASE_URL = "https://api.sharesight.com/api/v3";

export class SharesightClient {
  private oauth: OAuthManager;

  constructor(oauth: OAuthManager) {
    this.oauth = oauth;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const accessToken = await this.oauth.getValidAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const options: RequestInit = { method, headers };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { reason: errorText };
      }
      throw new Error(
        `Sharesight API error (${response.status}): ${errorData.reason || errorData.error || errorText}`
      );
    }

    return response.json() as Promise<T>;
  }

  async listPortfolios(options?: {
    consolidated?: boolean;
    instrument_id?: number;
  }): Promise<PortfoliosResponse> {
    return this.request<PortfoliosResponse>("GET", "/portfolios", undefined, options);
  }

  async getPerformanceReport(
    portfolioId: number,
    options?: {
      start_date?: string;
      end_date?: string;
      consolidated?: boolean;
      include_sales?: boolean;
      report_combined?: boolean;
      grouping?: string;
      custom_group_id?: number;
      include_limited?: boolean;
      benchmark_code?: string;
    }
  ): Promise<PerformanceReportResponse> {
    return this.request<PerformanceReportResponse>(
      "GET",
      `/portfolios/${portfolioId}/performance`,
      undefined,
      options
    );
  }
}

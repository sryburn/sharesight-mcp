/**
 * OAuth 2.0 Manager for Sharesight API
 *
 * Handles token acquisition and caching using the client_credentials grant type.
 * Tokens are held in memory and refreshed automatically when they expire.
 *
 * @module oauth
 */

const TOKEN_URL = "https://api.sharesight.com/oauth2/token";

interface CachedToken {
  access_token: string;
  expires_at: number;
}

export interface OAuthManagerOpts {
  clientId: string;
  clientSecret: string;
}

export class OAuthManager {
  private clientId: string;
  private clientSecret: string;
  private cached: CachedToken | null = null;

  constructor({ clientId, clientSecret }: OAuthManagerOpts) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async fetchToken(): Promise<void> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
      token_type: string;
    };

    this.cached = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000 - 60000, // 1 minute buffer
    };
  }

  async getValidAccessToken(): Promise<string> {
    if (!this.cached || Date.now() >= this.cached.expires_at) {
      await this.fetchToken();
    }
    return this.cached!.access_token;
  }
}

/**
 * Sharesight API v3 Types
 *
 * @see https://api.sharesight.com/doc/api/v3
 * @module types
 */

export interface ApiTransaction {
  id: number;
  version: number;
  action: string;
  timestamp: string;
}

export interface Links {
  self?: string;
  portfolio?: string;
}

export interface Currency {
  code: string;
  id: number;
  symbol: string;
  qualified_symbol: string;
}

export interface Portfolio {
  id: number;
  consolidated: boolean;
  name: string;
  external_identifier?: string;
  holding_id?: number;
  tz_name?: string;
  default_sale_allocation_method?: string;
  cg_discount?: string | null;
  financial_year_end?: string;
  interest_method?: string;
  country_code?: string;
  currency_code?: string;
  inception_date?: string;
  access_level?: string;
  user_id?: number;
  owner_name?: string;
  rwtr_rate?: number;
  trader?: boolean;
  disable_automatic_transactions?: boolean;
  tax_entity_type?: string;
  trade_sync_cash_account_id?: number | null;
  payout_sync_cash_account_id?: number | null;
}

export interface InstrumentLogo {
  light_url: string | null;
  dark_url: string | null;
}

export interface Instrument {
  code: string;
  country_id: number;
  crypto: boolean;
  currency_code: string;
  expires_on: string | null;
  expired: boolean;
  id: number;
  market_code: string;
  name: string;
  supported_denominations: object | null;
  tz_name: string;
  industry_classification_name?: string;
  sector_classification_name?: string;
  friendly_instrument_description?: string;
  friendly_instrument_description_code?: string;
  logo?: InstrumentLogo;
}

export interface Attachment {
  id: number;
  type: string;
  file_name: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface Document {
  id: number;
  file_name: string;
  content_type: string;
  file_size: number;
  created_at: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  holding_ids: number[];
  portfolio_ids: number[];
}

export interface CostBase {
  total_value: number;
  value_per_share: number;
}

export interface ValueOverTime {
  timestamp: string;
  value: number;
}

export interface Holding {
  id: number;
  drp_setting?: string;
  drp_mode_setting?: string;
  payout_type?: string;
  foreign_tax_credits_supported?: boolean;
  trust_income?: boolean;
  instrument: Instrument;
  instrument_currency: Currency;
  payout_currency?: Currency;
  symbol: string;
  valid_position: boolean;
  portfolio: Portfolio;
  documents?: Document[];
  attachments?: Attachment[];
  inception_date?: string;
  average_purchase_price?: number;
  cost_base?: CostBase;
  values_over_time?: ValueOverTime[];
  labels?: Label[];
  group_id?: number;
  group_name?: string;
  quantity?: number;
  value?: number;
  instrument_price?: number;
  capital_gain?: number;
  capital_gain_percent?: number;
  payout_gain?: number;
  payout_gain_percent?: number;
  currency_gain?: number;
  currency_gain_percent?: number;
  total_gain?: number;
  total_gain_percent?: number;
  number_of_unconfirmed_transactions?: number;
  limited?: boolean;
}

export interface Benchmark {
  code: string;
  market_code: string;
  name: string;
  capital_gain_percentage: number;
  dividend_gain_percentage: number;
  currency_gain_percentage: number;
  total_gain_percentage: number;
  percentages_annualised: boolean;
}

export interface SubTotal {
  value: number;
  group_id: number;
  group_name: string;
  capital_gain: number;
  capital_gain_percent: number;
  payout_gain: number;
  payout_gain_percent: number;
  currency_gain: number;
  currency_gain_percent: number;
  total_gain: number;
  total_gain_percent: number;
}

export interface CashAccount {
  id: number;
  key: string;
  name: string;
  source: string | null;
  value: number;
  currency: Currency;
  portfolio: Portfolio;
}

export interface CustomGroup {
  id: number;
  name: string;
}

export interface PerformanceReport {
  id: string;
  portfolio_id: number;
  portfolio_tz_name: string;
  value: number;
  grouping: string;
  currency: Currency;
  start_date: string;
  end_date: string;
  include_sales: boolean;
  capital_gain: number;
  capital_gain_percent: number;
  payout_gain: number;
  payout_gain_percent: number;
  currency_gain: number;
  currency_gain_percent: number;
  total_gain: number;
  total_gain_percent: number;
  percentages_annualised: boolean;
  holdings: Holding[];
  sub_totals: SubTotal[];
  combined_holdings?: Holding[];
  cash_accounts: CashAccount[];
  custom_group?: CustomGroup;
  benchmark?: Benchmark;
}

export interface BaseResponse {
  api_transaction: ApiTransaction;
  links?: Links;
}

export interface PortfoliosResponse extends BaseResponse {
  portfolios?: Portfolio[];
  portfolio?: Portfolio;
}

export interface PerformanceReportResponse extends BaseResponse {
  report: PerformanceReport;
}

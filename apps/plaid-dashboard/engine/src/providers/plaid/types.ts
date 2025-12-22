import type { AccountBase, Transaction as PlaidTransaction } from "plaid";

// ============================================================================
// Plaid API Types
// ============================================================================

export interface PlaidConfig {
  clientId: string;
  secret: string;
  environment: "sandbox" | "production";
}

export interface LinkTokenCreateParams {
  userId: string;
  accessToken?: string; // For reconnection
}

export interface LinkTokenResponse {
  linkToken: string;
  expiration: string;
}

export interface TokenExchangeResponse {
  accessToken: string;
  itemId: string;
}

// ============================================================================
// Account Types
// ============================================================================

export interface PlaidAccount {
  accountId: string;
  name: string;
  officialName: string | null;
  type: "depository" | "credit" | "loan" | "investment" | "other";
  subtype: string | null;
  mask: string | null;
  currency: string;
  currentBalance: number | null;
  availableBalance: number | null;
}

export interface PlaidInstitution {
  institutionId: string;
  name: string;
  logoUrl: string | null;
}

export interface GetAccountsResponse {
  accounts: PlaidAccount[];
  institution: PlaidInstitution;
}

// ============================================================================
// Transaction Types
// ============================================================================

export type TransactionMethod =
  | "payment"
  | "card_purchase"
  | "card_payment"
  | "transfer"
  | "ach"
  | "wire"
  | "atm"
  | "fee"
  | "interest"
  | "deposit"
  | "withdrawal"
  | "other";

export interface TransformedTransaction {
  plaidTransactionId: string;
  accountId: string;
  date: string;
  name: string;
  description: string | null;
  merchantName: string | null;
  amount: number;
  currency: string;
  category: string | null;
  categoryDetailed: string | null;
  method: TransactionMethod;
  status: "pending" | "posted";
}

export interface GetTransactionsResponse {
  transactions: TransformedTransaction[];
  hasMore: boolean;
  cursor?: string;
}

// ============================================================================
// Sync Types
// ============================================================================

export interface SyncResult {
  added: TransformedTransaction[];
  modified: TransformedTransaction[];
  removed: string[]; // transaction IDs
  hasMore: boolean;
  nextCursor: string;
}

// ============================================================================
// Connection Status
// ============================================================================

export interface ConnectionStatus {
  connected: boolean;
  error?: string;
  lastRefresh?: string;
}

// Re-export Plaid types for convenience
export type { AccountBase, PlaidTransaction };

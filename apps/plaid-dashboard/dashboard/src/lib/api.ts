import { getEngineUrl } from "./utils";

const ENGINE_URL = getEngineUrl();

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LinkTokenData {
  linkToken: string;
  expiration: string;
}

interface TokenExchangeData {
  accessToken: string;
  itemId: string;
}

interface Account {
  accountId: string;
  name: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  currency: string;
  currentBalance: number | null;
  availableBalance: number | null;
}

interface Institution {
  institutionId: string;
  name: string;
  logoUrl: string | null;
}

interface GetAccountsData {
  accounts: Account[];
  institution: Institution;
}

interface Transaction {
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
  method: string;
  status: "pending" | "posted";
}

interface GetTransactionsData {
  transactions: Transaction[];
  hasMore: boolean;
}

interface SaveConnectionData {
  connectionId: string;
  accountsCount: number;
  transactionsAdded: number;
}

// ============================================================================
// Local Storage Helpers (for MVP persistence)
// ============================================================================

const STORAGE_KEY = "plaid_connection";

interface StoredConnection {
  accessToken: string;
  itemId: string;
  institutionName: string;
  accounts: Account[];
  institution: Institution;
  savedAt: string;
}

export function saveConnectionLocally(data: StoredConnection): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function getStoredConnection(): StoredConnection | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearStoredConnection(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a Plaid Link token
 */
export async function createLinkToken(
  userId: string
): Promise<ApiResponse<LinkTokenData>> {
  const response = await fetch(`${ENGINE_URL}/auth/plaid/link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return response.json();
}

/**
 * Exchange public token for access token
 */
export async function exchangePublicToken(
  publicToken: string
): Promise<ApiResponse<TokenExchangeData>> {
  const response = await fetch(`${ENGINE_URL}/auth/plaid/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicToken }),
  });
  return response.json();
}

/**
 * Get accounts for an access token
 */
export async function getAccounts(
  accessToken: string
): Promise<ApiResponse<GetAccountsData>> {
  const params = new URLSearchParams({ accessToken });
  const response = await fetch(`${ENGINE_URL}/accounts?${params}`);
  return response.json();
}

/**
 * Get transactions for an access token
 * Includes retry logic for PRODUCT_NOT_READY errors
 */
export async function getTransactions(
  params: {
    accessToken: string;
    accountId?: string;
    latest?: boolean;
  },
  retries = 3
): Promise<ApiResponse<GetTransactionsData>> {
  const searchParams = new URLSearchParams({
    accessToken: params.accessToken,
  });

  if (params.accountId) {
    searchParams.set("accountId", params.accountId);
  }

  if (params.latest) {
    searchParams.set("latest", "true");
  }

  const response = await fetch(`${ENGINE_URL}/transactions?${searchParams}`);
  const result = await response.json();

  // Retry on PRODUCT_NOT_READY (Plaid needs time after connection)
  if (
    !result.success &&
    result.error?.includes("not yet ready") &&
    retries > 0
  ) {
    console.log(`Transactions not ready, retrying in 3s... (${retries} left)`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return getTransactions(params, retries - 1);
  }

  return result;
}

/**
 * Save connection to database (for persistence)
 */
export async function saveConnection(params: {
  accessToken: string;
  itemId: string;
}): Promise<ApiResponse<SaveConnectionData>> {
  const response = await fetch(`${ENGINE_URL}/sync/connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return response.json();
}

// Export types for use in components
export type {
  ApiResponse,
  LinkTokenData,
  TokenExchangeData,
  Account,
  Institution,
  GetAccountsData,
  Transaction,
  GetTransactionsData,
  StoredConnection,
};

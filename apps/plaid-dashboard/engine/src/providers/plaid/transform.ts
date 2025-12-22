import type { AccountBase, Transaction as PlaidTransaction } from "plaid";
import type {
  PlaidAccount,
  TransformedTransaction,
  TransactionMethod,
} from "./types";

// ============================================================================
// Transaction Method Mapping (from Midday)
// ============================================================================

const PAYMENT_CHANNEL_MAP: Record<string, TransactionMethod> = {
  online: "card_purchase",
  in_store: "card_purchase",
  other: "other",
};

const TRANSACTION_TYPE_MAP: Record<string, TransactionMethod> = {
  place: "card_purchase",
  digital: "card_purchase",
  special: "other",
  unresolved: "other",
};

/**
 * Maps Plaid transaction to our internal method type
 * Following Midday's mapping logic
 */
export function mapTransactionMethod(
  transaction: PlaidTransaction
): TransactionMethod {
  const paymentChannel = transaction.payment_channel;
  const transactionType = transaction.transaction_type;

  // Check payment channel first
  if (paymentChannel && PAYMENT_CHANNEL_MAP[paymentChannel]) {
    return PAYMENT_CHANNEL_MAP[paymentChannel];
  }

  // Check transaction type
  if (transactionType && TRANSACTION_TYPE_MAP[transactionType]) {
    return TRANSACTION_TYPE_MAP[transactionType];
  }

  // Check for specific categories
  const category = transaction.personal_finance_category?.primary;

  if (category === "TRANSFER_IN" || category === "TRANSFER_OUT") {
    return "transfer";
  }

  if (category === "LOAN_PAYMENTS") {
    return "payment";
  }

  if (category === "BANK_FEES") {
    return "fee";
  }

  if (category === "INCOME") {
    return "deposit";
  }

  return "other";
}

// ============================================================================
// Category Mapping (from Midday)
// ============================================================================

const CATEGORY_MAP: Record<string, string> = {
  INCOME: "income",
  TRANSFER_IN: "transfer",
  TRANSFER_OUT: "transfer",
  LOAN_PAYMENTS: "loans",
  BANK_FEES: "fees",
  ENTERTAINMENT: "entertainment",
  FOOD_AND_DRINK: "food",
  GENERAL_MERCHANDISE: "shopping",
  HOME_IMPROVEMENT: "home",
  MEDICAL: "health",
  PERSONAL_CARE: "personal",
  GENERAL_SERVICES: "services",
  GOVERNMENT_AND_NON_PROFIT: "government",
  TRANSPORTATION: "transport",
  TRAVEL: "travel",
  RENT_AND_UTILITIES: "utilities",
};

/**
 * Maps Plaid category to simplified category
 */
export function mapCategory(transaction: PlaidTransaction): string | null {
  const primary = transaction.personal_finance_category?.primary;
  if (!primary) return null;
  return CATEGORY_MAP[primary] || primary.toLowerCase();
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform Plaid account to our internal format
 */
export function transformAccount(account: AccountBase): PlaidAccount {
  return {
    accountId: account.account_id,
    name: account.name,
    officialName: account.official_name ?? null,
    type: mapAccountType(account.type),
    subtype: account.subtype ?? null,
    mask: account.mask ?? null,
    currency: account.balances.iso_currency_code ?? "USD",
    currentBalance: account.balances.current ?? null,
    availableBalance: account.balances.available ?? null,
  };
}

/**
 * Map Plaid account type to our enum
 */
function mapAccountType(
  type: string
): "depository" | "credit" | "loan" | "investment" | "other" {
  switch (type) {
    case "depository":
      return "depository";
    case "credit":
      return "credit";
    case "loan":
      return "loan";
    case "investment":
      return "investment";
    default:
      return "other";
  }
}

/**
 * Transform Plaid transaction to our internal format
 * Key difference from Plaid: We invert the amount sign
 * Plaid: positive = money out, negative = money in
 * Our format: positive = money in, negative = money out
 */
export function transformTransaction(
  transaction: PlaidTransaction
): TransformedTransaction {
  // Get the best description available
  const description = getTransactionDescription(transaction);

  return {
    plaidTransactionId: transaction.transaction_id,
    accountId: transaction.account_id,
    date: transaction.date,
    name: transaction.name,
    description,
    merchantName: transaction.merchant_name ?? null,
    // IMPORTANT: Invert amount sign (Midday pattern)
    // Plaid: positive = outflow, negative = inflow
    // Our format: positive = inflow, negative = outflow
    amount: transaction.amount * -1,
    currency: transaction.iso_currency_code ?? "USD",
    category: mapCategory(transaction),
    categoryDetailed: transaction.personal_finance_category?.detailed ?? null,
    method: mapTransactionMethod(transaction),
    status: transaction.pending ? "pending" : "posted",
  };
}

/**
 * Get the best available description for a transaction
 * Priority: original_description > merchant_name > name
 */
function getTransactionDescription(
  transaction: PlaidTransaction
): string | null {
  // @ts-ignore - original_description exists but may not be in types
  if (transaction.original_description) {
    // @ts-ignore
    return transaction.original_description;
  }

  if (transaction.merchant_name) {
    return transaction.merchant_name;
  }

  return null;
}

/**
 * Transform multiple transactions
 */
export function transformTransactions(
  transactions: PlaidTransaction[]
): TransformedTransaction[] {
  return transactions.map(transformTransaction);
}

/**
 * Transform multiple accounts
 */
export function transformAccounts(accounts: AccountBase[]): PlaidAccount[] {
  return accounts.map(transformAccount);
}

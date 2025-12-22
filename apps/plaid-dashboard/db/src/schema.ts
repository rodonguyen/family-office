import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const connectionStatusEnum = pgEnum("connection_status", [
  "connected",
  "disconnected",
]);

export const accountTypeEnum = pgEnum("account_type", [
  "depository",
  "credit",
  "loan",
  "investment",
  "other",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "posted",
]);

export const transactionMethodEnum = pgEnum("transaction_method", [
  "payment",
  "card_purchase",
  "card_payment",
  "transfer",
  "ach",
  "wire",
  "atm",
  "fee",
  "interest",
  "deposit",
  "withdrawal",
  "other",
]);

// ============================================================================
// TABLES
// ============================================================================

/**
 * Bank Connections - Stores Plaid Link connections
 * Each connection represents a linked financial institution
 */
export const bankConnections = pgTable("bank_connections", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Plaid identifiers
  institutionId: text("institution_id").notNull(),
  itemId: text("item_id").notNull().unique(), // Plaid's item_id
  accessToken: text("access_token").notNull(), // Encrypted in production

  // Display info
  name: text("name").notNull(), // Institution name
  logoUrl: text("logo_url"),

  // Status
  status: connectionStatusEnum("status").notNull().default("connected"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  errorDetails: text("error_details"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Bank Accounts - Individual accounts within a connection
 * One connection (institution) can have multiple accounts
 */
export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to connection
  bankConnectionId: uuid("bank_connection_id")
    .notNull()
    .references(() => bankConnections.id, { onDelete: "cascade" }),

  // Plaid identifiers
  accountId: text("account_id").notNull().unique(), // Plaid's account_id

  // Account details
  name: text("name").notNull(),
  officialName: text("official_name"),
  type: accountTypeEnum("type").notNull(),
  subtype: text("subtype"), // checking, savings, credit card, etc.
  mask: text("mask"), // Last 4 digits

  // Balance
  currency: text("currency").notNull().default("USD"),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }),
  availableBalance: decimal("available_balance", { precision: 12, scale: 2 }),

  // Sync settings
  enabled: boolean("enabled").notNull().default(true),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Transactions - Individual financial transactions
 */
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign key to account
  bankAccountId: uuid("bank_account_id")
    .notNull()
    .references(() => bankAccounts.id, { onDelete: "cascade" }),

  // Plaid identifiers
  plaidTransactionId: text("plaid_transaction_id").notNull().unique(),

  // Transaction details
  date: date("date").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  merchantName: text("merchant_name"),

  // Amount (positive = money in, negative = money out)
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),

  // Categorization
  category: text("category"), // Plaid's primary category
  categoryDetailed: text("category_detailed"), // Plaid's detailed category

  // Transaction metadata
  method: transactionMethodEnum("method").default("other"),
  status: transactionStatusEnum("status").notNull().default("posted"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const bankConnectionsRelations = relations(bankConnections, ({ many }) => ({
  accounts: many(bankAccounts),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  connection: one(bankConnections, {
    fields: [bankAccounts.bankConnectionId],
    references: [bankConnections.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(bankAccounts, {
    fields: [transactions.bankAccountId],
    references: [bankAccounts.id],
  }),
}));

// ============================================================================
// TYPES (exported for use in engine/dashboard)
// ============================================================================

export type BankConnection = typeof bankConnections.$inferSelect;
export type NewBankConnection = typeof bankConnections.$inferInsert;

export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

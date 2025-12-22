// Re-export schema from db package
// This is a simplified copy for the engine

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

export const bankConnections = pgTable("bank_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: text("institution_id").notNull(),
  itemId: text("item_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  status: connectionStatusEnum("status").notNull().default("connected"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  errorDetails: text("error_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankConnectionId: uuid("bank_connection_id")
    .notNull()
    .references(() => bankConnections.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull().unique(),
  name: text("name").notNull(),
  officialName: text("official_name"),
  type: accountTypeEnum("type").notNull(),
  subtype: text("subtype"),
  mask: text("mask"),
  currency: text("currency").notNull().default("USD"),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }),
  availableBalance: decimal("available_balance", { precision: 12, scale: 2 }),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankAccountId: uuid("bank_account_id")
    .notNull()
    .references(() => bankAccounts.id, { onDelete: "cascade" }),
  plaidTransactionId: text("plaid_transaction_id").notNull().unique(),
  date: date("date").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  merchantName: text("merchant_name"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  category: text("category"),
  categoryDetailed: text("category_detailed"),
  method: transactionMethodEnum("method").default("other"),
  status: transactionStatusEnum("status").notNull().default("posted"),
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
// TYPES
// ============================================================================

export type BankConnection = typeof bankConnections.$inferSelect;
export type NewBankConnection = typeof bankConnections.$inferInsert;

export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

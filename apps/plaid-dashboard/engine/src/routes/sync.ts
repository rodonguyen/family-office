import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  createConnection,
  createAccounts,
  syncTransactions,
  getConnections,
  getAccountTransactions,
} from "../services/sync-service";
import { getPlaidClient } from "../providers/plaid";

const sync = new Hono();

// ============================================================================
// Schemas
// ============================================================================

const saveConnectionSchema = z.object({
  accessToken: z.string().min(1),
  itemId: z.string().min(1),
});

const syncConnectionSchema = z.object({
  connectionId: z.string().uuid(),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /sync/connection
 * Save a new bank connection after Plaid Link completion
 * This fetches account info and stores everything in the database
 */
sync.post(
  "/connection",
  zValidator("json", saveConnectionSchema),
  async (c) => {
    const { accessToken, itemId } = c.req.valid("json");

    try {
      const plaid = getPlaidClient();

      // Get accounts and institution info from Plaid
      const accountsData = await plaid.getAccounts(accessToken);

      // Create the connection
      const connectionId = await createConnection({
        accessToken,
        itemId,
        institutionId: accountsData.institution.institutionId,
        institutionName: accountsData.institution.name,
        logoUrl: accountsData.institution.logoUrl ?? undefined,
      });

      // Create the accounts
      await createAccounts(
        connectionId,
        accountsData.accounts.map((acc) => ({
          accountId: acc.accountId,
          name: acc.name,
          officialName: acc.officialName ?? undefined,
          type: acc.type,
          subtype: acc.subtype ?? undefined,
          mask: acc.mask ?? undefined,
          currency: acc.currency,
          currentBalance: acc.currentBalance ?? undefined,
          availableBalance: acc.availableBalance ?? undefined,
        }))
      );

      // Trigger initial sync
      const syncResult = await syncTransactions(connectionId);

      return c.json({
        success: true,
        data: {
          connectionId,
          accountsCount: accountsData.accounts.length,
          transactionsAdded: syncResult.added,
        },
      });
    } catch (error: any) {
      console.error("Failed to save connection:", error);
      return c.json(
        {
          success: false,
          error: error.message ?? "Failed to save connection",
        },
        500
      );
    }
  }
);

/**
 * POST /sync/refresh
 * Refresh transactions for an existing connection
 */
sync.post(
  "/refresh",
  zValidator("json", syncConnectionSchema),
  async (c) => {
    const { connectionId } = c.req.valid("json");

    try {
      const result = await syncTransactions(connectionId);

      return c.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Failed to sync transactions:", error);
      return c.json(
        {
          success: false,
          error: error.message ?? "Failed to sync transactions",
        },
        500
      );
    }
  }
);

/**
 * GET /sync/connections
 * Get all saved connections with their accounts
 */
sync.get("/connections", async (c) => {
  try {
    const connections = await getConnections();

    return c.json({
      success: true,
      data: connections,
    });
  } catch (error: any) {
    console.error("Failed to get connections:", error);
    return c.json(
      {
        success: false,
        error: error.message ?? "Failed to get connections",
      },
      500
    );
  }
});

/**
 * GET /sync/transactions/:accountId
 * Get transactions from database for an account
 */
sync.get("/transactions/:accountId", async (c) => {
  const accountId = c.req.param("accountId");

  try {
    const txns = await getAccountTransactions(accountId);

    return c.json({
      success: true,
      data: txns,
    });
  } catch (error: any) {
    console.error("Failed to get transactions:", error);
    return c.json(
      {
        success: false,
        error: error.message ?? "Failed to get transactions",
      },
      500
    );
  }
});

export { sync };

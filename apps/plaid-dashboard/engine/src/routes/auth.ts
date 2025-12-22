import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getPlaidClient } from "../providers/plaid";

const auth = new Hono();

// ============================================================================
// Schemas
// ============================================================================

const linkTokenSchema = z.object({
  userId: z.string().min(1),
  accessToken: z.string().optional(), // For reconnection
});

const exchangeTokenSchema = z.object({
  publicToken: z.string().min(1),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /auth/plaid/link
 * Create a Plaid Link token for initializing Plaid Link
 */
auth.post("/plaid/link", zValidator("json", linkTokenSchema), async (c) => {
  const { userId, accessToken } = c.req.valid("json");

  try {
    const plaid = getPlaidClient();
    const result = await plaid.createLinkToken({ userId, accessToken });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Failed to create link token:", error);
    return c.json(
      {
        success: false,
        error: error.message ?? "Failed to create link token",
      },
      500
    );
  }
});

/**
 * POST /auth/plaid/exchange
 * Exchange a public token for an access token after Plaid Link completion
 */
auth.post(
  "/plaid/exchange",
  zValidator("json", exchangeTokenSchema),
  async (c) => {
    const { publicToken } = c.req.valid("json");

    try {
      const plaid = getPlaidClient();
      const result = await plaid.exchangePublicToken(publicToken);

      return c.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Failed to exchange token:", error);
      return c.json(
        {
          success: false,
          error: error.message ?? "Failed to exchange token",
        },
        500
      );
    }
  }
);

export { auth };

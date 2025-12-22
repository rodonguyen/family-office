"use server";

import { getEngineUrl } from "@/lib/utils";

interface ExchangeTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    itemId: string;
  };
  error?: string;
}

/**
 * Server action to exchange a Plaid public token for an access token
 * This is called after the user completes the Plaid Link flow
 */
export async function exchangePublicToken(
  publicToken: string
): Promise<ExchangeTokenResponse> {
  const engineUrl = getEngineUrl();

  try {
    const response = await fetch(`${engineUrl}/auth/plaid/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicToken }),
    });

    if (!response.ok) {
      throw new Error(`Engine API error: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("Failed to exchange public token:", error);
    return {
      success: false,
      error: error.message ?? "Failed to exchange public token",
    };
  }
}

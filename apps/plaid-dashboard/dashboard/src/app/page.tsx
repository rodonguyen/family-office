"use client";

import { useState, useEffect } from "react";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import { AccountsList } from "@/components/accounts-list";
import {
  getAccounts,
  saveConnectionLocally,
  getStoredConnection,
  clearStoredConnection,
  type Account,
  type Institution,
} from "@/lib/api";

// For MVP, we'll use a simple user ID
const USER_ID = "local-user-1";

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stored connection on mount
  useEffect(() => {
    const stored = getStoredConnection();
    if (stored) {
      setAccessToken(stored.accessToken);
      setItemId(stored.itemId);
      setAccounts(stored.accounts);
      setInstitution(stored.institution);
      setIsConnected(true);
    }
    setIsLoading(false);
  }, []);

  const handlePlaidSuccess = async (
    token: string,
    itemIdFromPlaid: string,
    metadata: any
  ) => {
    setAccessToken(token);
    setItemId(itemIdFromPlaid);
    setIsLoading(true);
    setError(null);

    try {
      // Fetch accounts after successful connection
      const result = await getAccounts(token);

      if (result.success && result.data) {
        setAccounts(result.data.accounts);
        setInstitution(result.data.institution);
        setIsConnected(true);

        // Save to localStorage for persistence
        saveConnectionLocally({
          accessToken: token,
          itemId: itemIdFromPlaid,
          institutionName: result.data.institution.name,
          accounts: result.data.accounts,
          institution: result.data.institution,
          savedAt: new Date().toISOString(),
        });
      } else {
        setError(result.error ?? "Failed to fetch accounts");
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearStoredConnection();
    setIsConnected(false);
    setAccessToken(null);
    setItemId(null);
    setAccounts([]);
    setInstitution(null);
  };

  // Initial loading state
  if (isLoading && !isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect your bank accounts to view balances and transactions
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Connect Button or Accounts */}
      {!isConnected ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Connect Your Bank
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Securely connect your bank account using Plaid to view your balances
            and transactions in one place.
          </p>
          <PlaidLinkButton userId={USER_ID} onSuccess={handlePlaidSuccess} />
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="mt-2 text-gray-500">Loading your accounts...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Bank connected: {institution?.name}
          </div>

          {/* Accounts List */}
          {institution && (
            <AccountsList accounts={accounts} institution={institution} />
          )}

          {/* Navigation Hints */}
          <div className="flex gap-4">
            <a
              href="/transactions"
              className="flex-1 bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-gray-900">View Transactions</h3>
              <p className="text-sm text-gray-500">
                See your recent transactions
              </p>
            </a>
            <button
              onClick={handleDisconnect}
              className="flex-1 bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
            >
              <h3 className="font-medium text-gray-900">Disconnect</h3>
              <p className="text-sm text-gray-500">
                Remove this bank connection
              </p>
            </button>
          </div>

          {/* Debug Info (for development) */}
          {accessToken && (
            <details className="bg-gray-100 rounded-lg p-4">
              <summary className="cursor-pointer text-sm text-gray-600">
                Debug: Connection Info
              </summary>
              <pre className="mt-2 text-xs overflow-x-auto">
                Token: {accessToken.substring(0, 40)}...
                {"\n"}Item ID: {itemId}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

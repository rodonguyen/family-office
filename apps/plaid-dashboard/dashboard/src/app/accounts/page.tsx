"use client";

import { useState } from "react";
import { AccountsList } from "@/components/accounts-list";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import { getAccounts, type Account, type Institution } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const USER_ID = "local-user-1";

export default function AccountsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaidSuccess = async (token: string) => {
    setAccessToken(token);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAccounts(token);

      if (result.success && result.data) {
        setAccounts(result.data.accounts);
        setInstitution(result.data.institution);
      } else {
        setError(result.error ?? "Failed to fetch accounts");
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch accounts");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.currentBalance ?? 0),
    0
  );

  // Not connected yet
  if (!accessToken) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect a bank account to view your balances
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">
            Connect your bank to see accounts
          </p>
          <PlaidLinkButton userId={USER_ID} onSuccess={handlePlaidSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {accounts.length} accounts connected
          </p>
        </div>
        <PlaidLinkButton
          userId={USER_ID}
          onSuccess={handlePlaidSuccess}
          className="text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-6 text-white">
        <p className="text-blue-100 text-sm font-medium">Total Balance</p>
        <p className="text-3xl font-bold mt-1">
          {formatCurrency(totalBalance)}
        </p>
        <p className="text-blue-100 text-sm mt-2">
          Across {accounts.length} accounts
        </p>
      </div>

      {/* Accounts List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="mt-2 text-gray-500">Loading accounts...</p>
        </div>
      ) : institution ? (
        <AccountsList accounts={accounts} institution={institution} />
      ) : null}
    </div>
  );
}

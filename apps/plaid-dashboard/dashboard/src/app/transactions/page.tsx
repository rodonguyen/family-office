"use client";

import { useState, useEffect } from "react";
import { TransactionsTable } from "@/components/transactions-table";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import {
  getAccounts,
  getTransactions,
  getStoredConnection,
  saveConnectionLocally,
  type Transaction,
  type Account,
  type Institution,
} from "@/lib/api";

const USER_ID = "local-user-1";

export default function TransactionsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored connection on mount
  useEffect(() => {
    const stored = getStoredConnection();
    if (stored) {
      setAccessToken(stored.accessToken);
      setAccounts(stored.accounts);
      setInstitution(stored.institution);
    }
    setIsLoading(false);
  }, []);

  // Fetch transactions when access token is available
  useEffect(() => {
    if (!accessToken) return;

    async function fetchTransactions() {
      setIsLoadingTx(true);
      setError(null);

      try {
        // Retry logic built into getTransactions for PRODUCT_NOT_READY
        const result = await getTransactions({
          accessToken: accessToken!,
          accountId: selectedAccountId ?? undefined,
        });

        if (result.success && result.data) {
          setTransactions(result.data.transactions);
        } else {
          setError(result.error ?? "Failed to fetch transactions");
        }
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch transactions");
      } finally {
        setIsLoadingTx(false);
      }
    }

    fetchTransactions();
  }, [accessToken, selectedAccountId]);

  const handlePlaidSuccess = async (token: string, itemId: string) => {
    setAccessToken(token);

    // Fetch accounts
    const accountsResult = await getAccounts(token);
    if (accountsResult.success && accountsResult.data) {
      setAccounts(accountsResult.data.accounts);
      setInstitution(accountsResult.data.institution);

      // Save to localStorage
      saveConnectionLocally({
        accessToken: token,
        itemId,
        institutionName: accountsResult.data.institution.name,
        accounts: accountsResult.data.accounts,
        institution: accountsResult.data.institution,
        savedAt: new Date().toISOString(),
      });
    }
  };

  // Initial loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not connected yet
  if (!accessToken) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect a bank account to view transactions
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">
            Connect your bank to see transactions
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {institution?.name ?? "Your bank"} •{" "}
            {isLoadingTx ? "Loading..." : `${transactions.length} transactions`}
          </p>
        </div>

        {/* Account Filter */}
        <select
          value={selectedAccountId ?? "all"}
          onChange={(e) =>
            setSelectedAccountId(
              e.target.value === "all" ? null : e.target.value
            )
          }
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Accounts</option>
          {accounts.map((account) => (
            <option key={account.accountId} value={account.accountId}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          {error.includes("not yet ready") && (
            <p className="text-sm mt-1">
              Plaid is still processing your data. Try refreshing in a few
              seconds.
            </p>
          )}
          <button
            onClick={() => {
              setError(null);
              setIsLoadingTx(true);
              getTransactions({ accessToken: accessToken! }).then((result) => {
                if (result.success && result.data) {
                  setTransactions(result.data.transactions);
                } else {
                  setError(result.error ?? "Failed to fetch transactions");
                }
                setIsLoadingTx(false);
              });
            }}
            className="mt-2 text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <TransactionsTable transactions={transactions} isLoading={isLoadingTx} />
    </div>
  );
}

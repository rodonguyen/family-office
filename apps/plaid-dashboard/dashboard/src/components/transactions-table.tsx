"use client";

import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Transaction } from "@/lib/api";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

/**
 * Display a table of transactions
 */
export function TransactionsTable({
  transactions,
  isLoading,
}: TransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="mt-2 text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.plaidTransactionId} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(tx.date)}
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {tx.merchantName ?? tx.name}
                </p>
                {tx.description && tx.description !== tx.name && (
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    {tx.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {tx.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {tx.category}
                  </span>
                )}
              </td>
              <td
                className={cn(
                  "px-4 py-3 whitespace-nowrap text-sm font-medium text-right",
                  tx.amount >= 0 ? "text-green-600" : "text-gray-900"
                )}
              >
                {tx.amount >= 0 ? "+" : ""}
                {formatCurrency(tx.amount, tx.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

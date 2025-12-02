import * as React from "react";
import type { WorkspaceTransaction, WorkspaceViewOption } from "../viewTypes";

type TransactionsViewProps = {
  transactions: WorkspaceTransaction[];
  loading: boolean;
  error: string | null;
  categoryLabelMap: Map<string, string>;
  paymentTypes: WorkspaceViewOption[];
  currencies: WorkspaceViewOption[];
};

export default function TransactionsView({
  transactions,
  loading,
  error,
  categoryLabelMap,
  paymentTypes,
  currencies,
}: TransactionsViewProps) {
  const showEmptyState = !loading && !error && transactions.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {showEmptyState ? (
        <div className="p-8 text-center text-sm text-[hsl(var(--fg-muted))]">
          <h3 className="text-base font-semibold text-[hsl(var(--fg))]">No transactions yet</h3>
          <p className="mt-2 text-[hsl(var(--fg-muted))]">You have not added any records yet.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--card))] text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Currency</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Comment</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="border-t border-[hsl(var(--border))]">
                <td className="px-4 py-3" colSpan={4}>
                  Loading transactions...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr className="border-t border-[hsl(var(--border))]">
                <td className="px-4 py-3 text-red-600" colSpan={4}>
                  {error}
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              transactions.map((row) => (
                <tr key={row.id} className="border-t border-[hsl(var(--border))]">
                  <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-2">{row.categoryName || categoryLabelMap.get(row.categoryId) || row.categoryId}</td>
                  <td className="px-4 py-2">{findLabel(paymentTypes, row.paymentTypeId)}</td>
                  <td className="px-4 py-2">{findLabel(currencies, row.currencyId)}</td>
                  <td className="px-4 py-2 tabular-nums">
                    <span className={row.amount < 0 ? "text-red-600" : "text-green-600"}>
                      {row.amount < 0 ? "-" : "+"}
                      {Math.abs(row.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[hsl(var(--fg-muted))]">{row.comment || "-"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function findLabel(options: WorkspaceViewOption[], id?: string) {
  if (!id) return "-";
  return options.find((opt) => opt.id === id)?.label ?? id ?? "-";
}

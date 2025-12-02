import * as React from "react";

export type AnalyticsSummary = {
  count: number;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
};

export default function AnalyticsView({ summary }: { summary: AnalyticsSummary }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsStatCard label="Transactions" value={summary.count.toLocaleString()} />
        <AnalyticsStatCard label="Total expenses" value={formatCurrency(Math.abs(summary.totalExpenses))} valueClass="text-red-600" />
        <AnalyticsStatCard label="Total income" value={formatCurrency(Math.abs(summary.totalIncome))} valueClass="text-green-600" />
        <AnalyticsStatCard
          label="Balance"
          value={formatCurrency(summary.balance)}
          valueClass={summary.balance >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-sm text-[hsl(var(--fg))]">
        <h3 className="text-base font-semibold text-[hsl(var(--fg))]">Coming soon</h3>
        <p className="mt-2 text-[hsl(var(--fg-muted))]">
          Detailed analytics will appear here: trend charts, category breakdowns, and recurring payments.
        </p>
      </div>
    </div>
  );
}

function AnalyticsStatCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <p className="text-xs uppercase tracking-wide text-[hsl(var(--fg-muted))]">{label}</p>
      <div className={`mt-2 text-2xl font-semibold text-[hsl(var(--fg))] ${valueClass ?? ""}`}>{value}</div>
    </div>
  );
}

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

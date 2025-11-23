"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";

type Tx = {
  id: string;
  date: string; // ISO or human
  category: string;
  amount: number;
  comment?: string | null;
};

export default function WorkspacePage({
  params,
}: {
  params: { workspace_id: string };
}) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [tx, setTx] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session?.user?.id) {
        setTx([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/transactions?workspaceId=${params.workspace_id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
        });
        if (!res.ok) {
          const msg = (await res.text().catch(() => "")) || `Request failed (${res.status})`;
          throw new Error(msg);
        }
        const list = (await res.json()) as any[];
        if (cancelled) return;
        const mapped: Tx[] = list.map((t) => {
          const amt = parseFloat(t.amount);
          const signed = t.is_decrease ? -Math.abs(amt) : Math.abs(amt);
          return {
            id: String(t.id),
            date: new Date(t.date).toISOString().slice(0, 10),
            category: String(t.category_id),
            amount: signed,
            comment: t.comment ?? null,
          };
        });
        setTx(mapped);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load transactions");
        setTx([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.workspace_id, session?.access_token, session?.user?.id]);

  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <Header user={session} />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Workspace {params.workspace_id}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert("Settings not implemented yet")}
              className="h-9 rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))]"
            >
              Manage Settings
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-9 rounded-xl bg-[hsl(var(--color-primary))] px-3 text-sm text-white"
            >
              ADD transaction
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--card))] text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="border-t border-[hsl(var(--border))]">
                  <td className="px-4 py-3" colSpan={4}>
                    Loading transactions…
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
                tx.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[hsl(var(--border))]"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-2">{row.category}</td>
                    <td className="px-4 py-2 tabular-nums">
                      <span
                        className={
                          row.amount < 0 ? "text-red-600" : "text-green-600"
                        }
                      >
                        {row.amount < 0 ? "-" : "+"}
                        {Math.abs(row.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[hsl(var(--fg-muted))]">
                      {row.comment || "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {open && (
          <CreateTransactionDialog
            onClose={() => setOpen(false)}
            onAdd={(item) => setTx((p) => [item, ...p])}
          />
        )}
      </main>
    </div>
  );
}

function CreateTransactionDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (tx: Tx) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = useState("General");
  const [amount, setAmount] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit() {
    const value = parseFloat(amount);
    if (Number.isNaN(value)) return;
    const item: Tx = {
      id: Math.random().toString(36).slice(2),
      date,
      category,
      amount: value,
      comment: comment || null,
    };
    onAdd(item);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={ref}
        className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 shadow-xl"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">Add Transaction</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[hsl(var(--fg-muted))] hover:bg-[hsl(var(--card))]"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. -120.50 for expense, 500 for income"
              className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Comment</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional"
              className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="h-9 rounded-xl bg-[hsl(var(--color-primary))] px-3 text-sm text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

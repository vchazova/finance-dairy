"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";

type Tx = {
  id: string;
  date: string; // ISO or human
  categoryId: string;
  categoryName?: string;
  paymentTypeId?: string;
  currencyId?: string;
  isDecrease?: boolean;
  amount: number;
  comment?: string | null;
};

type Option = { id: string; label: string };

export default function WorkspaceClientPage({
  workspaceId,
  initialCategories = [],
  initialPaymentTypes = [],
  initialCurrencies = [],
}: {
  workspaceId: string;
  initialCategories?: Option[];
  initialPaymentTypes?: Option[];
  initialCurrencies?: Option[];
}) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [tx, setTx] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Option[]>(initialCategories);
  const [paymentTypes, setPaymentTypes] = useState<Option[]>(initialPaymentTypes);
  const [currencies, setCurrencies] = useState<Option[]>(initialCurrencies);

  useEffect(() => {
    let cancelled = false;
    async function loadDictionaries() {
      if (!session?.user?.id) {
        setCategories([]);
        setPaymentTypes([]);
        setCurrencies([]);
        return;
      }
      try {
        const [cats, ptypes, currs] = await Promise.all([
          fetch(`/api/dictionaries/categories?workspaceId=${workspaceId}`, {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
              ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
          }),
          fetch(`/api/dictionaries/payment_types?workspaceId=${workspaceId}`, {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
              ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
          }),
          fetch(`/api/dictionaries/currencies`, {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
              ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
          }),
        ]);

        const [catsJson, ptypesJson, currsJson] = await Promise.all([
          cats.ok ? cats.json() : Promise.resolve([]),
          ptypes.ok ? ptypes.json() : Promise.resolve([]),
          currs.ok ? currs.json() : Promise.resolve([]),
        ]);

        if (cancelled) return;
        setCategories((catsJson as any[]).map((c) => ({ id: String(c.id), label: c.name as string })));
        setPaymentTypes((ptypesJson as any[]).map((p) => ({ id: String(p.id), label: p.name as string })));
        setCurrencies(
          (currsJson as any[]).map((c) => ({
            id: String(c.id),
            label: `${c.code} (${c.symbol ?? ""})`.trim(),
          }))
        );
      } catch {
        if (cancelled) return;
        setCategories([]);
        setPaymentTypes([]);
        setCurrencies([]);
      }
    }

    async function load() {
      if (!session?.user?.id) {
        setTx([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/transactions?workspaceId=${workspaceId}`, {
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
            categoryId: String(t.category_id),
            paymentTypeId: String(t.payment_type_id),
            currencyId: String(t.currency_id),
            isDecrease: t.is_decrease,
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
    loadDictionaries();
    load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, session?.access_token, session?.user?.id]);

  const categoryLabels = new Map(categories.map((c) => [c.id, c.label]));

  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <Header user={session} />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Workspace {workspaceId}
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
                    <td className="px-4 py-2">
                      {row.categoryName || categoryLabels.get(row.categoryId) || row.categoryId}
                    </td>
                    <td className="px-4 py-2">
                      {paymentTypes.find((p) => p.id === row.paymentTypeId)?.label || row.paymentTypeId || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {currencies.find((c) => c.id === row.currencyId)?.label || row.currencyId || "—"}
                    </td>
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
            categories={categories}
            paymentTypes={paymentTypes}
            currencies={currencies}
            workspaceId={workspaceId}
            accessToken={session?.access_token ?? null}
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
  categories,
  paymentTypes,
  currencies,
  workspaceId,
  accessToken,
}: {
  onClose: () => void;
  onAdd: (tx: Tx) => void;
  categories: Option[];
  paymentTypes: Option[];
  currencies: Option[];
  workspaceId: string;
  accessToken: string | null;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [categoryId, setCategoryId] = useState<string>("");
  const [paymentTypeId, setPaymentTypeId] = useState<string>("");
  const [currencyId, setCurrencyId] = useState<string>("");
  const [isDecrease, setIsDecrease] = useState(true);
  const [amount, setAmount] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId && categories.length) setCategoryId(categories[0].id);
    if (!paymentTypeId && paymentTypes.length) setPaymentTypeId(paymentTypes[0].id);
    if (!currencyId && currencies.length) setCurrencyId(currencies[0].id);
  }, [categories, paymentTypes, currencies, categoryId, paymentTypeId, currencyId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit() {
    if (submitting) return;
    const value = parseFloat(amount);
    if (Number.isNaN(value) || !categoryId || !paymentTypeId || !currencyId) return;
    setSubmitting(true);
    setSubmitError(null);
    (async () => {
      try {
        const payload = {
          workspace_id: Number(workspaceId),
          payment_type_id: Number(paymentTypeId),
          category_id: Number(categoryId),
          currency_id: Number(currencyId),
          amount: String(Math.abs(value)),
          date,
          comment: comment || null,
          is_decrease: isDecrease,
        };
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const json = (await res.json().catch(() => ({}))) as any;
        if (!res.ok || !json?.ok) {
          throw new Error(json?.message || `Failed (${res.status})`);
        }

        const item: Tx = {
          id: String(json.id ?? Math.random().toString(36).slice(2)),
          date,
          categoryId,
          categoryName: categories.find((c) => c.id === categoryId)?.label,
          paymentTypeId,
          currencyId,
          isDecrease,
          amount: isDecrease ? -Math.abs(value) : Math.abs(value),
          comment: comment || null,
        };
        onAdd(item);
        onClose();
      } catch (err: any) {
        setSubmitError(err?.message || "Failed to create transaction");
      } finally {
        setSubmitting(false);
      }
    })();
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
          {submitError && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Payment Type</label>
              <select
                value={paymentTypeId}
                onChange={(e) => setPaymentTypeId(e.target.value)}
                className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2"
              >
                {paymentTypes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Currency</label>
              <select
                value={currencyId}
                onChange={(e) => setCurrencyId(e.target.value)}
                className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2"
              >
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Type</label>
              <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <label className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    checked={isDecrease}
                    onChange={() => setIsDecrease(true)}
                  />
                  Expense
                </label>
                <label className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    checked={!isDecrease}
                    onChange={() => setIsDecrease(false)}
                  />
                  Income
                </label>
              </div>
            </div>
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
              disabled={submitting}
              className="h-9 rounded-xl bg-[hsl(var(--color-primary))] px-3 text-sm text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

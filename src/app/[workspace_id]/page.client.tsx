"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";
import { useApiFetch } from "@/lib/api/client";
import { normalizeTransactionRow, toSignedAmount } from "@/entities/transactions/normalize";
import {
  normalizeCategoryRow,
  normalizePaymentTypeRow,
  normalizeCurrencyRow,
  type NormalizedCategory,
  type NormalizedPaymentType,
  type NormalizedCurrency,
} from "@/entities/dictionaries/normalize";
import { queryKeys } from "@/lib/queryKeys";
import type { WorkspaceListItem } from "@/types/workspaces";

type Tx = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  categoryId: string;
  categoryName?: string;
  paymentTypeId?: string;
  currencyId?: string;
  isDecrease?: boolean;
  amount: number;
  comment?: string | null;
};

type Option = { id: string; label: string };

export default function WorkspaceClientPage({ workspaceSlug }: { workspaceSlug: string }) {
  const { session } = useAuth();
  const apiFetch = useApiFetch();
  const queryClient = useQueryClient();

  const workspaceQuery = useQuery({
    queryKey: queryKeys.workspace(workspaceSlug),
    queryFn: async () => {
      const list = await apiFetch<WorkspaceListItem[]>(`/api/workspaces?slug=${workspaceSlug}`);
      return (list ?? [])[0] ?? null;
    },
    enabled: !!session?.user?.id && Boolean(workspaceSlug),
  });

  const workspace = workspaceQuery.data ?? null;
  const workspaceIdForQueries = workspace?.id ?? null;

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(workspaceSlug),
    queryFn: async () => {
      if (!workspaceIdForQueries) throw new Error("Workspace not resolved");
      const catsJson = await apiFetch<any[]>(
        `/api/dictionaries/categories?workspaceId=${workspaceIdForQueries}`
      );
      return (catsJson as any[]).map((c) => {
        const normalized = normalizeCategoryRow(c as NormalizedCategory);
        return { id: normalized.id, label: normalized.name };
      });
    },
    enabled: !!session?.user?.id && Boolean(workspaceIdForQueries),
  });

  const paymentTypesQuery = useQuery({
    queryKey: queryKeys.paymentTypes(workspaceSlug),
    queryFn: async () => {
      if (!workspaceIdForQueries) throw new Error("Workspace not resolved");
      const list = await apiFetch<any[]>(
        `/api/dictionaries/payment_types?workspaceId=${workspaceIdForQueries}`
      );
      return (list as any[]).map((p) => {
        const normalized = normalizePaymentTypeRow(p as NormalizedPaymentType);
        return { id: normalized.id, label: normalized.name };
      });
    },
    enabled: !!session?.user?.id && Boolean(workspaceIdForQueries),
  });

  const currenciesQuery = useQuery({
    queryKey: queryKeys.currencies,
    queryFn: async () => {
      const list = await apiFetch<any[]>(`/api/dictionaries/currencies`);
      return (list as any[]).map((c) => {
        const normalized = normalizeCurrencyRow(c as NormalizedCurrency);
        return { id: normalized.id, label: `${normalized.code} (${normalized.symbol ?? ""})`.trim() };
      });
    },
    enabled: !!session?.user?.id,
  });

  const categoryLabelMap = useMemo(
    () => new Map((categoriesQuery.data ?? []).map((c) => [c.id, c.label])),
    [categoriesQuery.data]
  );

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions(workspaceSlug),
    queryFn: async () => {
      if (!workspaceIdForQueries) throw new Error("Workspace not resolved");
      const list = await apiFetch<any[]>(`/api/transactions?workspaceId=${workspaceIdForQueries}`);
      return list.map((t) => {
        const n = normalizeTransactionRow(t);
        return {
          id: n.id,
          date: n.date,
          categoryId: n.categoryId,
          categoryName: categoryLabelMap.get(n.categoryId),
          paymentTypeId: n.paymentTypeId,
          currencyId: n.currencyId,
          isDecrease: n.isDecrease,
          amount: n.amount,
          comment: n.comment,
        } satisfies Tx;
      });
    },
    enabled: !!session?.user?.id && Boolean(workspaceIdForQueries),
  });

  const loading = transactionsQuery.isPending;
  const error = (transactionsQuery.error as Error | null)?.message ?? null;
  const tx = transactionsQuery.data ?? [];
  const workspaceError = workspaceQuery.error as Error | null;
  const workspacePending = workspaceQuery.isPending;

  let mainContent: React.ReactNode;

  if (workspacePending) {
    mainContent = (
      <div className="rounded-2xl border border-[hsl(var(--border))] p-6 text-center text-sm text-[hsl(var(--fg-muted))]">
        Loading workspace…
      </div>
    );
  } else if (workspaceError) {
    mainContent = (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        Failed to load workspace: {workspaceError.message}
      </div>
    );
  } else if (!workspace) {
    mainContent = (
      <div className="rounded-2xl border border-[hsl(var(--border))] p-6 text-center text-sm text-[hsl(var(--fg-muted))]">
        Workspace not found or you do not have access.
      </div>
    );
  } else {
    const resolvedWorkspaceId = workspace.id;
    mainContent = (
      <>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{workspace.name}</h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/${workspaceSlug}/settings`}
              className="inline-flex h-9 items-center rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))]">
              Manage Settings
            </Link>
            <AddTransactionButton
              workspaceId={resolvedWorkspaceId}
              workspaceSlug={workspaceSlug}
              categories={categoriesQuery.data ?? []}
              paymentTypes={paymentTypesQuery.data ?? []}
              currencies={currenciesQuery.data ?? []}
            />
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
                  <tr key={row.id} className="border-t border-[hsl(var(--border))]">
                    <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-2">
                      {row.categoryName || categoryLabelMap.get(row.categoryId) || row.categoryId}
                    </td>
                    <td className="px-4 py-2">
                      {paymentTypesQuery.data?.find((p) => p.id === row.paymentTypeId)?.label ||
                        row.paymentTypeId ||
                        "—"}
                    </td>
                    <td className="px-4 py-2">
                      {currenciesQuery.data?.find((c) => c.id === row.currencyId)?.label ||
                        row.currencyId ||
                        "—"}
                    </td>
                    <td className="px-4 py-2 tabular-nums">
                      <span className={row.amount < 0 ? "text-red-600" : "text-green-600"}>
                        {row.amount < 0 ? "-" : "+"}
                        {Math.abs(row.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[hsl(var(--fg-muted))]">{row.comment || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <Header user={session} />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">{mainContent}</main>
    </div>
  );
}

function AddTransactionButton({
  workspaceId,
  workspaceSlug,
  categories,
  paymentTypes,
  currencies,
}: {
  workspaceId: string;
  workspaceSlug: string;
  categories: Option[];
  paymentTypes: Option[];
  currencies: Option[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-9 rounded-xl bg-[hsl(var(--color-primary))] px-3 text-sm text-white"
      >
        ADD transaction
      </button>
      {open && (
        <CreateTransactionDialog
          onClose={() => setOpen(false)}
          categories={categories}
          paymentTypes={paymentTypes}
          currencies={currencies}
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
        />
      )}
    </>
  );
}

function CreateTransactionDialog({
  onClose,
  categories,
  paymentTypes,
  currencies,
  workspaceId,
  workspaceSlug,
}: {
  onClose: () => void;
  categories: Option[];
  paymentTypes: Option[];
  currencies: Option[];
  workspaceId: string;
  workspaceSlug: string;
}) {
  const apiFetch = useApiFetch();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<string>("");
  const [paymentTypeId, setPaymentTypeId] = useState<string>("");
  const [currencyId, setCurrencyId] = useState<string>("");
  const [isDecrease, setIsDecrease] = useState(true);
  const [amount, setAmount] = useState<string>("");
  const [comment, setComment] = useState<string>("");
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

  const createTransactionMutation = useMutation({
    mutationFn: (body: any) =>
      apiFetch<any>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (json, variables: any) => {
      const item: Tx = {
        id: String(json?.id ?? Math.random().toString(36).slice(2)),
        date: variables.date,
        categoryId: String(variables.category_id),
        categoryName: categories.find((c) => c.id === String(variables.category_id))?.label,
        paymentTypeId: String(variables.payment_type_id),
        currencyId: String(variables.currency_id),
        isDecrease: variables.is_decrease,
        amount: toSignedAmount(Number(variables.amount), variables.is_decrease),
        comment: variables.comment ?? null,
      };
      queryClient.setQueryData<Tx[]>(queryKeys.transactions(workspaceSlug), (prev = []) => [item, ...(prev ?? [])]);
    },
  });

  const submitting = createTransactionMutation.isPending;

  async function submit() {
    if (submitting) return;
    const value = parseFloat(amount);
    if (Number.isNaN(value) || !categoryId || !paymentTypeId || !currencyId) return;
    setSubmitError(null);
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
      await createTransactionMutation.mutateAsync(payload);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to create transaction");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 shadow-xl">
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
                  <input type="radio" checked={isDecrease} onChange={() => setIsDecrease(true)} />
                  Expense
                </label>
                <label className="inline-flex items-center gap-1 text-sm">
                  <input type="radio" checked={!isDecrease} onChange={() => setIsDecrease(false)} />
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

"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { WorkspaceLayout } from "@/components/ui/layout/WorkspaceLayout";
import { Button, Input, TextArea, Select, DatePicker } from "@/components/ui";
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
import type { WorkspaceTransaction as Tx, WorkspaceViewOption as Option } from "./viewTypes";
import TransactionsView from "./views/TransactionsView";
import AnalyticsView, { type AnalyticsSummary } from "./views/AnalyticsView";
import SettingsView from "./views/SettingsView";
type WorkspaceViewMode = "transactions" | "analytics" | "settings";
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export default function WorkspaceClientPage({ workspaceSlug }: { workspaceSlug: string }) {
  const { session } = useAuth();
  const apiFetch = useApiFetch();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [headerError, setHeaderError] = useState<string | null>(null);

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
  const isOwner = workspace?.role === "owner";

  useEffect(() => {
    if (workspace) {
      setNameDraft(workspace.name);
      setDescriptionDraft(workspace.description ?? "");
    }
  }, [workspace?.name, workspace?.description]);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(workspaceSlug),
    queryFn: async () => {
      if (!workspaceIdForQueries) throw new Error("Workspace not resolved");
      const rows = await apiFetch<any[]>(`/api/dictionaries/categories?workspaceId=${workspaceIdForQueries}`);
      return rows.map((row) => {
        const normalized = normalizeCategoryRow(row as NormalizedCategory);
        return { id: normalized.id, label: normalized.name };
      });
    },
    enabled: !!session?.user?.id && Boolean(workspaceIdForQueries),
    staleTime: THIRTY_MINUTES_MS,
  });

  const paymentTypesQuery = useQuery({
    queryKey: queryKeys.paymentTypes(workspaceSlug),
    queryFn: async () => {
      if (!workspaceIdForQueries) throw new Error("Workspace not resolved");
      const rows = await apiFetch<any[]>(`/api/dictionaries/payment_types?workspaceId=${workspaceIdForQueries}`);
      return rows.map((row) => {
        const normalized = normalizePaymentTypeRow(row as NormalizedPaymentType);
        return { id: normalized.id, label: normalized.name };
      });
    },
    enabled: !!session?.user?.id && Boolean(workspaceIdForQueries),
    staleTime: THIRTY_MINUTES_MS,
  });

  const currenciesQuery = useQuery({
    queryKey: queryKeys.currencies,
    queryFn: async () => {
      const rows = await apiFetch<any[]>(`/api/dictionaries/currencies`);
      return rows.map((row) => {
        const normalized = normalizeCurrencyRow(row as NormalizedCurrency);
        return {
          id: normalized.id,
          label: `${normalized.code} (${normalized.symbol ?? ""})`.trim(),
        };
      });
    },
    enabled: !!session?.user?.id,
    staleTime: THIRTY_MINUTES_MS,
  });

  const categoryLabelMap = useMemo(
    () => new Map((categoriesQuery.data ?? []).map((c) => [c.id, c.label])),
    [categoriesQuery.data]
  );

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions(workspaceSlug),
    queryFn: async () => {
      if (!workspaceIdForQueries) throw new Error("Workspace not resolved");
      const rows = await apiFetch<any[]>(`/api/transactions?workspaceId=${workspaceIdForQueries}`);
      return rows.map((row) => {
        const normalized = normalizeTransactionRow(row);
        return {
          id: normalized.id,
          date: normalized.date,
          categoryId: normalized.categoryId,
          categoryName: categoryLabelMap.get(normalized.categoryId),
          paymentTypeId: normalized.paymentTypeId,
          currencyId: normalized.currencyId,
          isDecrease: normalized.isDecrease,
          amount: normalized.amount,
          comment: normalized.comment,
        } satisfies Tx;
      });
    },
    enabled: !!session?.user?.id && Boolean(workspaceIdForQueries),
  });

  const transactions = transactionsQuery.data ?? [];
  const analyticsSummary: AnalyticsSummary = useMemo(() => {
    const count = transactions.length;
    const totalExpenses = transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalIncome + totalExpenses;
    return { count, totalExpenses, totalIncome, balance };
  }, [transactions]);
  const loadingTransactions = transactionsQuery.isPending;
  const transactionsError = (transactionsQuery.error as Error | null)?.message ?? null;
  const workspaceError = workspaceQuery.error as Error | null;
  const workspacePending = workspaceQuery.isPending;

  type UpdateWorkspacePayload = { name: string; description: string | null };
  const updateWorkspaceMutation = useMutation({
    mutationFn: async (payload: UpdateWorkspacePayload) => {
      if (!workspace) throw new Error("Workspace not found");
      const response = await apiFetch<{ ok: boolean; slug?: string }>(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return { ...payload, slug: response?.slug ?? workspace.slug };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<WorkspaceListItem | null>(queryKeys.workspace(workspaceSlug), (prev) =>
        prev ? { ...prev, name: result.name, description: result.description ?? null, slug: result.slug } : prev
      );
      setIsEditingHeader(false);
      setHeaderError(null);
      if (result.slug && result.slug !== workspaceSlug) {
        router.replace(`/${result.slug}`);
      }
    },
    onError: (err: any) => {
      setHeaderError(err?.message ?? "Failed to update workspace");
    },
  });

  const savingHeader = updateWorkspaceMutation.isPending;

  function handleSaveHeader() {
    if (!workspace) return;
    const trimmedName = nameDraft.trim();
    if (trimmedName.length < 2) {
      setHeaderError("Name must be at least 2 characters");
      return;
    }
    const trimmedDescription = descriptionDraft.trim();
    setHeaderError(null);
    updateWorkspaceMutation.mutate({
      name: trimmedName,
      description: trimmedDescription.length ? trimmedDescription : null,
    });
  }

  function handleCancelHeader() {
    if (!workspace) return;
    setIsEditingHeader(false);
    setHeaderError(null);
    setNameDraft(workspace.name);
    setDescriptionDraft(workspace.description ?? "");
  }

  let mainContent: React.ReactNode;

  if (workspacePending) {
    mainContent = (
      <div className="rounded-2xl border border-[hsl(var(--border))] p-6 text-center text-sm text-[hsl(var(--fg-muted))]">
        Loading workspace...
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

    const requestedMode = searchParams?.get("mode");
    const mode: WorkspaceViewMode =
      requestedMode === "analytics"
        ? "analytics"
        : requestedMode === "settings" && isOwner
        ? "settings"
        : "transactions";

    const buildModeHref = (nextMode: WorkspaceViewMode) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (nextMode === "transactions") {
        params.delete("mode");
      } else {
        params.set("mode", nextMode);
      }
      const query = params.toString();
      return query ? `/${workspaceSlug}?${query}` : `/${workspaceSlug}`;
    };

    const tabs = (
      <div className="flex flex-wrap items-center gap-2">
        {[
          { mode: "transactions" as WorkspaceViewMode, label: "Transactions" },
          { mode: "analytics" as WorkspaceViewMode, label: "Analytics" },
          ...(isOwner ? ([{ mode: "settings" as WorkspaceViewMode, label: "Settings" }] as const) : []),
        ].map((tab) => (
          <Link
            key={tab.mode}
            href={buildModeHref(tab.mode)}
            className={`rounded-xl px-3 py-1.5 text-sm transition ${
              mode === tab.mode
                ? "bg-[hsl(var(--color-primary)/0.2)] text-[hsl(var(--color-primary))] font-semibold"
                : "text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] hover:bg-[hsl(var(--border))]/40"
            }`}
            aria-current={mode === tab.mode ? "page" : undefined}>
            {tab.label}
          </Link>
        ))}
      </div>
    );

    const actions = (
      <AddTransactionButton
        workspaceId={resolvedWorkspaceId}
        workspaceSlug={workspaceSlug}
        categories={categoriesQuery.data ?? []}
        paymentTypes={paymentTypesQuery.data ?? []}
        currencies={currenciesQuery.data ?? []}
      />
    );

    const fallbackDescription =
      workspace.description && workspace.description.trim().length > 0
        ? workspace.description
        : "Review your workspace transactions and manage spending.";

    const headerNode = isOwner ? (
      <WorkspaceHeaderEditor
        isEditing={isEditingHeader}
        displayName={workspace.name}
        displayDescription={fallbackDescription}
        createdAt={workspace.createdAt}
        nameValue={nameDraft}
        descriptionValue={descriptionDraft}
        onNameChange={setNameDraft}
        onDescriptionChange={setDescriptionDraft}
        onStartEdit={() => {
          setIsEditingHeader(true);
          setNameDraft(workspace.name);
          setDescriptionDraft(workspace.description ?? "");
          setHeaderError(null);
        }}
        onCancel={handleCancelHeader}
        onSave={handleSaveHeader}
        saving={savingHeader}
        error={headerError}
      />
    ) : (
      <div>
        <div className="text-xl font-semibold text-[hsl(var(--fg))]">{workspace.name}</div>
        <p className="text-sm text-[hsl(var(--fg-muted))]">
          Created on {new Date(workspace.createdAt).toLocaleDateString()}
        </p>
      </div>
    );

    const layoutDescription = isOwner ? undefined : fallbackDescription;

    const contentByMode: Record<WorkspaceViewMode, React.ReactNode> = {
      transactions: (
        <TransactionsView
          transactions={transactions}
          loading={loadingTransactions}
          error={transactionsError}
          categoryLabelMap={categoryLabelMap}
          paymentTypes={paymentTypesQuery.data ?? []}
          currencies={currenciesQuery.data ?? []}
        />
      ),
      analytics: <AnalyticsView summary={analyticsSummary} />,
      settings: <SettingsView workspaceSlug={workspaceSlug} />,
    };

    mainContent = (
      <WorkspaceLayout
        title={headerNode}
        description={layoutDescription}
        tabs={tabs}
        actions={actions}>
        {contentByMode[mode]}
      </WorkspaceLayout>
    );
  }

  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <Header user={session} />
      <main className="mx-auto max-w-6xl px-4 py-8">{mainContent}</main>
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
      <Button onClick={() => setOpen(true)}>
        ADD transaction
      </Button>
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

type WorkspaceHeaderEditorProps = {
  isEditing: boolean;
  displayName: string;
  displayDescription: string;
  createdAt: string;
  nameValue: string;
  descriptionValue: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
};

function WorkspaceHeaderEditor({
  isEditing,
  displayName,
  displayDescription,
  createdAt,
  nameValue,
  descriptionValue,
  onNameChange,
  onDescriptionChange,
  onStartEdit,
  onCancel,
  onSave,
  saving,
  error,
}: WorkspaceHeaderEditorProps) {
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xl font-semibold text-[hsl(var(--fg))]">{displayName}</span>
        <Button size="sm" variant="ghost" onClick={onStartEdit} className="gap-1">
          <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-[hsl(var(--fg-muted))]">{displayDescription}</p>
        <p className="text-xs text-[hsl(var(--fg-muted))]">Created on {new Date(createdAt).toLocaleDateString()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-[hsl(var(--fg))]">
      <Input value={nameValue} onChange={(event) => onNameChange(event.target.value)} placeholder="Workspace name" />
      <TextArea
        value={descriptionValue}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Description"
        rows={3}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
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
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.label })),
    [categories]
  );
  const paymentTypeOptions = useMemo(
    () => paymentTypes.map((p) => ({ value: p.id, label: p.label })),
    [paymentTypes]
  );
  const currencyOptions = useMemo(
    () => currencies.map((c) => ({ value: c.id, label: c.label })),
    [currencies]
  );
  const typeOptions = useMemo(
    () => [
      { value: "expense", label: "Expense" },
      { value: "income", label: "Income" },
    ],
    []
  );

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
            aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {submitError && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <DatePicker label="Date" value={date} onChange={(val) => setDate(val)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select label="Category" value={categoryId} onChange={setCategoryId} options={categoryOptions} />
            <Select
              label="Payment Type"
              value={paymentTypeId}
              onChange={setPaymentTypeId}
              options={paymentTypeOptions}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select label="Currency" value={currencyId} onChange={setCurrencyId} options={currencyOptions} />
            <Select
              label="Type"
              value={isDecrease ? "expense" : "income"}
              onChange={(val) => setIsDecrease(val === "expense")}
              options={typeOptions}
            />
          </div>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. -120.50 for expense, 500 for income"
          />
          <TextArea
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional"
            rows={3}
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";
import { useApiFetch } from "@/lib/api/client";
import {
  normalizeCategoryRow,
  normalizeCurrencyRow,
  normalizePaymentTypeRow,
  type NormalizedCategory,
  type NormalizedCurrency,
  type NormalizedPaymentType,
} from "@/entities/dictionaries/normalize";
import { Select } from "@/components/ui/field/Select";
import { AddCategoryForm, type CategoryDraft } from "@/components/settings/AddCategoryForm";
import { AddCurrencyForm, type CurrencyDraft } from "@/components/settings/AddCurrencyForm";
import { EditPaymentTypeRow, type PaymentTypeDraft } from "@/components/settings/EditPaymentTypeRow";
import {
  DictionaryRow,
  DictionaryTable,
  InlineButton,
  InlineInput,
  SectionShell,
  type SectionStatus,
} from "@/components/settings/DictionaryUI";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";
import { queryKeys } from "@/lib/queryKeys";

export default function WorkspaceSettingsClient({
  workspaceId,
  initialCategories = [],
  initialPaymentTypes = [],
  initialCurrencies = [],
}: {
  workspaceId: string;
  initialCategories?: NormalizedCategory[];
  initialPaymentTypes?: NormalizedPaymentType[];
  initialCurrencies?: NormalizedCurrency[];
}) {
  const { session } = useAuth();
  const apiFetch = useApiFetch();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(workspaceId),
    queryFn: async () => {
      const rows = await apiFetch<any[]>(`/api/dictionaries/categories?workspaceId=${workspaceId}`);
      return rows.map((row) => normalizeCategoryRow(row));
    },
    initialData: initialCategories,
    enabled: !!session?.access_token,
  });

  const paymentTypesQuery = useQuery({
    queryKey: queryKeys.paymentTypes(workspaceId),
    queryFn: async () => {
      const rows = await apiFetch<any[]>(`/api/dictionaries/payment_types?workspaceId=${workspaceId}`);
      return rows.map((row) => normalizePaymentTypeRow(row));
    },
    initialData: initialPaymentTypes,
    enabled: !!session?.access_token,
  });

  const currenciesQuery = useQuery({
    queryKey: queryKeys.currencies,
    queryFn: async () => {
      const rows = await apiFetch<any[]>(`/api/dictionaries/currencies`);
      return rows.map((row) => normalizeCurrencyRow(row));
    },
    initialData: initialCurrencies,
    enabled: !!session?.access_token,
  });

  const categoryStatus: SectionStatus = {
    loading: categoriesQuery.isPending || categoriesQuery.isRefetching,
    error: (categoriesQuery.error as Error | null)?.message ?? null,
  };
  const paymentTypeStatus: SectionStatus = {
    loading: paymentTypesQuery.isPending || paymentTypesQuery.isRefetching,
    error: (paymentTypesQuery.error as Error | null)?.message ?? null,
  };
  const currencyStatus: SectionStatus = {
    loading: currenciesQuery.isPending || currenciesQuery.isRefetching,
    error: (currenciesQuery.error as Error | null)?.message ?? null,
  };

  const reloadCategories = () => queryClient.invalidateQueries({ queryKey: queryKeys.categories(workspaceId) });
  const reloadPaymentTypes = () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypes(workspaceId) });
  const reloadCurrencies = () => queryClient.invalidateQueries({ queryKey: queryKeys.currencies });

  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <Header user={session} />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--fg-muted))]">Workspace settings</p>
              <h1 className="text-2xl font-semibold leading-tight">Dictionaries</h1>
              <p className="text-sm text-[hsl(var(--fg-muted))]">
                Manage categories, payment types and currencies for this workspace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/${workspaceId}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))]">
                Back
              </Link>
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--fg-muted))]">
                Workspace #{workspaceId}
              </span>
            </div>
          </div>
        </div>

        <CategoriesBlock
          workspaceId={workspaceId}
          data={categoriesQuery.data ?? []}
          status={categoryStatus}
          onReload={reloadCategories}
          apiFetch={apiFetch}
        />

        <PaymentTypesBlock
          workspaceId={workspaceId}
          data={paymentTypesQuery.data ?? []}
          status={paymentTypeStatus}
          currencies={currenciesQuery.data ?? []}
          currencyStatus={currencyStatus}
          onReload={reloadPaymentTypes}
          onReloadCurrencies={reloadCurrencies}
          apiFetch={apiFetch}
        />

        <CurrenciesBlock
          data={currenciesQuery.data ?? []}
          status={currencyStatus}
          onReload={reloadCurrencies}
          apiFetch={apiFetch}
        />
      </main>
    </div>
  );
}

function CategoriesBlock({
  workspaceId,
  data,
  status,
  onReload,
  apiFetch,
}: {
  workspaceId: string;
  data: NormalizedCategory[];
  status: SectionStatus;
  onReload: () => Promise<void>;
  apiFetch: ReturnType<typeof useApiFetch>;
}) {
  const queryClient = useQueryClient();
  const [editDraft, setEditDraft] = useState<CategoryDraft>({ name: "", icon: "", color: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const createCategoryMutation = useMutation({
    mutationFn: (draft: CategoryDraft) =>
      apiFetch("/api/dictionaries/categories", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: Number(workspaceId),
          name: draft.name,
          icon: draft.icon || null,
          color: draft.color || null,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories(workspaceId) }),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: CategoryDraft }) =>
      apiFetch(`/api/dictionaries/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: draft.name.trim(),
          icon: draft.icon.trim() || null,
          color: draft.color.trim() || null,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories(workspaceId) }),
  });

  const removeCategoryMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/dictionaries/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories(workspaceId) }),
  });

  async function createCategory(draft: CategoryDraft) {
    setMutatingId("new");
    try {
      await createCategoryMutation.mutateAsync(draft);
    } catch (e: any) {
      setActionError(e?.message || "Failed to create category");
    } finally {
      setMutatingId(null);
    }
  }

  async function updateCategory(id: string) {
    if (!editDraft.name.trim()) {
      setActionError("Имя категории обязательно");
      return;
    }
    setActionError(null);
    setMutatingId(id);
    try {
      await updateCategoryMutation.mutateAsync({ id, draft: editDraft });
      setEditId(null);
    } catch (e: any) {
      setActionError(e?.message || "Failed to update category");
    } finally {
      setMutatingId(null);
    }
  }

  async function removeCategory(id: string) {
    const row = data.find((c) => c.id === id);
    if (!row) return;
    setActionError(null);
    setMutatingId(id);
    try {
      await removeCategoryMutation.mutateAsync(id);
    } catch (e: any) {
      setActionError(e?.message || "Failed to delete category");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Категории"
      description="Добавляйте и редактируйте категории расходов и доходов."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <AddCategoryForm onSubmit={createCategory} />

        <DictionaryTable
          columns={["Название", "Иконка", "Цвет"]}
          loading={status.loading}
          emptyText="Категории пока не добавлены."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  isEditing ? (
                    <InlineInput value={editDraft.name} onChange={(v) => setEditDraft((p) => ({ ...p, name: v }))} />
                  ) : (
                    <span className="font-medium">{row.name}</span>
                  ),
                  isEditing ? (
                    <InlineInput value={editDraft.icon} onChange={(v) => setEditDraft((p) => ({ ...p, icon: v }))} />
                  ) : (
                    row.icon || "—"
                  ),
                  isEditing ? (
                    <InlineInput value={editDraft.color} onChange={(v) => setEditDraft((p) => ({ ...p, color: v }))} />
                  ) : (
                    row.color || "—"
                  ),
                ]}
                actions={
                  isEditing ? (
                    <>
                      <InlineButton onClick={() => setEditId(null)} text="Отмена" variant="ghost" />
                      <InlineButton
                        onClick={() => updateCategory(row.id)}
                        text={mutatingId === row.id ? "Сохранение..." : "Сохранить"}
                        disabled={mutatingId === row.id}
                        variant="primary"
                      />
                    </>
                  ) : (
                    <>
                      <InlineButton
                        onClick={() => {
                          setEditId(row.id);
                          setEditDraft({
                            name: row.name,
                            icon: row.icon || "",
                            color: row.color || "",
                          });
                        }}
                        text="Изменить"
                      />
                      <InlineButton
                        onClick={() => setConfirmDeleteId(row.id)}
                        text={mutatingId === row.id ? "..." : "Удалить"}
                        disabled={mutatingId === row.id}
                        variant="danger"
                      />
                    </>
                  )
                }
              />
            );
          })}
        />
      </div>
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Удалить категорию?"
        description="Категория и связанные данные могут быть недоступны после удаления."
        confirmText="Удалить"
        cancelText="Отмена"
        loading={!!confirmDeleteId && mutatingId === confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            const id = confirmDeleteId;
            setConfirmDeleteId(null);
            removeCategory(id);
          }
        }}
      />
      {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
    </SectionShell>
  );
}

function PaymentTypesBlock({
  workspaceId,
  data,
  status,
  currencies,
  currencyStatus,
  onReload,
  onReloadCurrencies,
  apiFetch,
}: {
  workspaceId: string;
  data: NormalizedPaymentType[];
  status: SectionStatus;
  currencies: NormalizedCurrency[];
  currencyStatus: SectionStatus;
  onReload: () => Promise<void>;
  onReloadCurrencies: () => Promise<void>;
  apiFetch: ReturnType<typeof useApiFetch>;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<PaymentTypeDraft>({ name: "", icon: "", defaultCurrencyId: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const currencyOptions = currencies.map((c) => ({ value: c.id, label: `${c.code} • ${c.name}` }));

  const createPaymentTypeMutation = useMutation({
    mutationFn: (input: PaymentTypeDraft) =>
      apiFetch("/api/dictionaries/payment_types", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: Number(workspaceId),
          name: input.name.trim(),
          icon: input.icon.trim() || null,
          default_currency_id: input.defaultCurrencyId ? Number(input.defaultCurrencyId) : null,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypes(workspaceId) }),
  });

  const updatePaymentTypeMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PaymentTypeDraft }) =>
      apiFetch(`/api/dictionaries/payment_types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: input.name.trim(),
          icon: input.icon.trim() || null,
          default_currency_id: input.defaultCurrencyId ? Number(input.defaultCurrencyId) : null,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypes(workspaceId) }),
  });

  const removePaymentTypeMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/dictionaries/payment_types/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypes(workspaceId) }),
  });

  async function createPaymentType() {
    if (!draft.name.trim()) {
      setActionError("Имя платежа обязательно");
      return;
    }
    setActionError(null);
    setMutatingId("new");
    try {
      await createPaymentTypeMutation.mutateAsync(draft);
      setDraft({ name: "", icon: "", defaultCurrencyId: "" });
    } catch (e: any) {
      setActionError(e?.message || "Failed to create payment type");
    } finally {
      setMutatingId(null);
    }
  }

  async function updatePaymentType(id: string, input: PaymentTypeDraft) {
    if (!input.name.trim()) {
      setActionError("Имя платежа обязательно");
      return;
    }
    setActionError(null);
    setMutatingId(id);
    try {
      await updatePaymentTypeMutation.mutateAsync({ id, input });
      setEditId(null);
    } catch (e: any) {
      setActionError(e?.message || "Failed to update payment type");
    } finally {
      setMutatingId(null);
    }
  }

  async function removePaymentType(id: string) {
    const row = data.find((c) => c.id === id);
    if (!row) return;
    setActionError(null);
    setMutatingId(id);
    try {
      await removePaymentTypeMutation.mutateAsync(id);
    } catch (e: any) {
      setActionError(e?.message || "Failed to delete payment type");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Способы оплаты"
      description="Настройте наличные, карты, кошельки и их валюту по умолчанию."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Добавить способ</h3>
            <button
              type="button"
              onClick={() => onReloadCurrencies()}
              disabled={currencyStatus.loading}
              className="text-xs text-[hsl(var(--fg-muted))] underline-offset-4 hover:underline disabled:opacity-60"
            >
              {currencyStatus.loading ? "Обновление..." : "Обновить валюты"}
            </button>
          </div>
          <div className="mt-3 space-y-3">
            <LabeledField
              label="Название"
              value={draft.name}
              onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
              placeholder="Карта, наличные..."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledField
                label="Иконка"
                value={draft.icon}
                onChange={(v) => setDraft((p) => ({ ...p, icon: v }))}
                placeholder="emoji или icon name"
              />
              <Select
                label="Валюта по умолчанию"
                options={[{ value: "", label: "Не назначать" }, ...currencyOptions]}
                value={draft.defaultCurrencyId}
                onChange={(val) => setDraft((p) => ({ ...p, defaultCurrencyId: val }))}
              />
            </div>
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            <div className="flex items-center justify-end gap-2">
              <InlineButton
                text="Сбросить"
                variant="ghost"
                onClick={() => setDraft({ name: "", icon: "", defaultCurrencyId: "" })}
              />
              <InlineButton
                text={mutatingId === "new" ? "Создание..." : "Добавить"}
                variant="primary"
                disabled={mutatingId === "new"}
                onClick={createPaymentType}
              />
            </div>
          </div>
        </div>

        <DictionaryTable
          columns={["Название", "Иконка", "Валюта по умолчанию"]}
          loading={status.loading}
          emptyText="Платежные методы пока не добавлены."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            const currentCurrency = row.defaultCurrencyId
              ? currencies.find((c) => c.id === row.defaultCurrencyId)?.code || row.defaultCurrencyId
              : "—";
            if (isEditing) {
              return (
                <EditPaymentTypeRow
                  key={row.id}
                  row={row}
                  currencies={currencies}
                  savingId={mutatingId}
                  onCancel={() => setEditId(null)}
                  onDelete={() => setConfirmDeleteId(row.id)}
                  onSave={(draftUpdate) => updatePaymentType(row.id, draftUpdate)}
                />
              );
            }

            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  <span className="font-medium" key="name">
                    {row.name}
                  </span>,
                  row.icon || "—",
                  currentCurrency,
                ]}
                actions={
                  <>
                    <InlineButton
                      onClick={() => {
                        setEditId(row.id);
                        setDraft({
                          name: row.name,
                          icon: row.icon || "",
                          defaultCurrencyId: row.defaultCurrencyId || "",
                        });
                      }}
                      text="Изменить"
                    />
                    <InlineButton
                      onClick={() => setConfirmDeleteId(row.id)}
                      text={mutatingId === row.id ? "..." : "Удалить"}
                      disabled={mutatingId === row.id}
                      variant="danger"
                    />
                  </>
                }
              />
            );
          })}
        />
      </div>
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Удалить способ оплаты?"
        description="Будут убраны записи об этом способе оплаты."
        confirmText="Удалить"
        cancelText="Отмена"
        loading={!!confirmDeleteId && mutatingId === confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            const id = confirmDeleteId;
            setConfirmDeleteId(null);
            removePaymentType(id);
          }
        }}
      />
      {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
    </SectionShell>
  );
}

function CurrenciesBlock({
  data,
  status,
  onReload,
  apiFetch,
}: {
  data: NormalizedCurrency[];
  status: SectionStatus;
  onReload: () => Promise<void>;
  apiFetch: ReturnType<typeof useApiFetch>;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<CurrencyDraft>({ code: "", name: "", symbol: "" });
  const [editDraft, setEditDraft] = useState<CurrencyDraft>({ code: "", name: "", symbol: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const createCurrencyMutation = useMutation({
    mutationFn: (d: CurrencyDraft) =>
      apiFetch("/api/dictionaries/currencies", {
        method: "POST",
        body: JSON.stringify({
          code: d.code.trim().toUpperCase(),
          name: d.name.trim(),
          symbol: d.symbol.trim(),
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
  });

  const updateCurrencyMutation = useMutation({
    mutationFn: ({ id, draft: d }: { id: string; draft: CurrencyDraft }) =>
      apiFetch(`/api/dictionaries/currencies/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          code: d.code.trim().toUpperCase(),
          name: d.name.trim(),
          symbol: d.symbol.trim(),
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
  });

  const removeCurrencyMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/dictionaries/currencies/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
  });

  async function createCurrency(d: CurrencyDraft) {
    setMutatingId("new");
    try {
      await createCurrencyMutation.mutateAsync(d);
      setDraft({ code: "", name: "", symbol: "" });
    } catch (e: any) {
      setActionError(e?.message || "Failed to create currency");
    } finally {
      setMutatingId(null);
    }
  }

  async function updateCurrency(id: string) {
    if (!editDraft.code.trim() || !editDraft.name.trim() || !editDraft.symbol.trim()) {
      setActionError("Все поля обязательны");
      return;
    }
    setActionError(null);
    setMutatingId(id);
    try {
      await updateCurrencyMutation.mutateAsync({ id, draft: editDraft });
      setEditId(null);
    } catch (e: any) {
      setActionError(e?.message || "Failed to update currency");
    } finally {
      setMutatingId(null);
    }
  }

  async function removeCurrency(id: string) {
    const row = data.find((c) => c.id === id);
    if (!row) return;
    setActionError(null);
    setMutatingId(id);
    try {
      await removeCurrencyMutation.mutateAsync(id);
    } catch (e: any) {
      setActionError(e?.message || "Failed to delete currency");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Валюты"
      description="Добавляйте национальные валюты, их код и символ."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <AddCurrencyForm onSubmit={createCurrency} />

        <DictionaryTable
          columns={["Код", "Название", "Символ"]}
          loading={status.loading}
          emptyText="Валюты пока не добавлены."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  isEditing ? (
                    <InlineInput value={editDraft.code} onChange={(v) => setEditDraft((p) => ({ ...p, code: v }))} />
                  ) : (
                    <span className="font-medium">{row.code}</span>
                  ),
                  isEditing ? (
                    <InlineInput value={editDraft.name} onChange={(v) => setEditDraft((p) => ({ ...p, name: v }))} />
                  ) : (
                    row.name
                  ),
                  isEditing ? (
                    <InlineInput value={editDraft.symbol} onChange={(v) => setEditDraft((p) => ({ ...p, symbol: v }))} />
                  ) : (
                    row.symbol
                  ),
                ]}
                actions={
                  isEditing ? (
                    <>
                      <InlineButton onClick={() => setEditId(null)} text="Отмена" variant="ghost" />
                      <InlineButton
                        onClick={() => updateCurrency(row.id)}
                        text={mutatingId === row.id ? "Сохранение..." : "Сохранить"}
                        disabled={mutatingId === row.id}
                        variant="primary"
                      />
                    </>
                  ) : (
                    <>
                      <InlineButton
                        onClick={() => {
                          setEditId(row.id);
                          setEditDraft({ code: row.code, name: row.name, symbol: row.symbol });
                        }}
                        text="Изменить"
                      />
                      <InlineButton
                        onClick={() => setConfirmDeleteId(row.id)}
                        text={mutatingId === row.id ? "..." : "Удалить"}
                        disabled={mutatingId === row.id}
                        variant="danger"
                      />
                    </>
                  )
                }
              />
            );
          })}
        />
      </div>
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Удалить валюту?"
        description="Валюта будет недоступна после удаления."
        confirmText="Удалить"
        cancelText="Отмена"
        loading={!!confirmDeleteId && mutatingId === confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            const id = confirmDeleteId;
            setConfirmDeleteId(null);
            removeCurrency(id);
          }
        }}
      />
      {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
    </SectionShell>
  );
}

function LabeledField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-[hsl(var(--fg-muted))]">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
      />
    </div>
  );
}

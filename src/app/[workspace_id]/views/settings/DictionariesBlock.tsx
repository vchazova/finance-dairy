"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColorPicker,
  EmojiPicker,
  PAYMENT_TYPE_EMOJIS,
} from "@/components/ui";
import { Select } from "@/components/ui/field/Select";
import {
  AddCategoryForm,
  type CategoryDraft,
} from "@/components/settings/AddCategoryForm";
import {
  AddCurrencyForm,
  type CurrencyDraft,
} from "@/components/settings/AddCurrencyForm";
import {
  EditPaymentTypeRow,
  type PaymentTypeDraft,
} from "@/components/settings/EditPaymentTypeRow";
import {
  DictionaryRow,
  DictionaryTable,
  InlineButton,
  InlineInput,
  SectionShell,
  type SectionStatus,
} from "@/components/settings/DictionaryUI";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";
import { useAuth } from "@/providers/AuthProvider";
import { useApiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";
import {
  normalizeCategoryRow,
  normalizeCurrencyRow,
  normalizePaymentTypeRow,
  type NormalizedCategory,
  type NormalizedCurrency,
  type NormalizedPaymentType,
} from "@/entities/dictionaries/normalize";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function WorkspaceDictionariesBlock({
  workspaceId,
  workspaceSlug,
  initialCategories = [],
  initialPaymentTypes = [],
  initialCurrencies = [],
}: {
  workspaceId: string;
  workspaceSlug: string;
  initialCategories: NormalizedCategory[];
  initialPaymentTypes: NormalizedPaymentType[];
  initialCurrencies: NormalizedCurrency[];
}) {
  const { session } = useAuth();
  const apiFetch = useApiFetch();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(workspaceSlug),
    queryFn: async () => {
      const rows = await apiFetch<any[]>(
        `/api/dictionaries/categories-workspaceId=${workspaceId}`
      );
      return rows.map((row) => normalizeCategoryRow(row));
    },
    initialData: initialCategories.length ? initialCategories : undefined,
    enabled: !!session?.user?.id,
    staleTime: THIRTY_MINUTES_MS,
  });

  const paymentTypesQuery = useQuery({
    queryKey: queryKeys.paymentTypes(workspaceSlug),
    queryFn: async () => {
      const rows = await apiFetch<any[]>(
        `/api/dictionaries/payment_types-workspaceId=${workspaceId}`
      );
      return rows.map((row) => normalizePaymentTypeRow(row));
    },
    initialData: initialPaymentTypes.length ? initialPaymentTypes : undefined,
    enabled: !!session?.user?.id,
    staleTime: THIRTY_MINUTES_MS,
  });

  const currenciesQuery = useQuery({
    queryKey: queryKeys.currencies,
    queryFn: async () => {
      const rows = await apiFetch<any[]>(`/api/dictionaries/currencies`);
      return rows.map((row) => normalizeCurrencyRow(row));
    },
    initialData: initialCurrencies.length ? initialCurrencies : undefined,
    enabled: !!session?.user?.id,
    staleTime: THIRTY_MINUTES_MS,
  });

  const categoryStatus: SectionStatus = {
    loading: categoriesQuery.isPending || categoriesQuery.isRefetching,
    error: (categoriesQuery.error as Error | null)?.message ?? null,
  };
  const paymentStatus: SectionStatus = {
    loading: paymentTypesQuery.isPending || paymentTypesQuery.isRefetching,
    error: (paymentTypesQuery.error as Error | null)?.message ?? null,
  };
  const currencyStatus: SectionStatus = {
    loading: currenciesQuery.isPending || currenciesQuery.isRefetching,
    error: (currenciesQuery.error as Error | null)?.message ?? null,
  };

  const reloadCategories = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.categories(workspaceSlug),
    });
  const reloadPaymentTypes = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.paymentTypes(workspaceSlug),
    });
  const reloadCurrencies = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.currencies });

  return (
    <div className="space-y-6">
      <CategoriesSection
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        data={categoriesQuery.data ?? []}
        status={categoryStatus}
        onReload={reloadCategories}
        apiFetch={apiFetch}
      />

      <PaymentTypesSection
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        data={paymentTypesQuery.data ?? []}
        status={paymentStatus}
        currencies={currenciesQuery.data ?? []}
        currencyStatus={currencyStatus}
        onReload={reloadPaymentTypes}
        onReloadCurrencies={reloadCurrencies}
        apiFetch={apiFetch}
      />

      <CurrenciesSection
        data={currenciesQuery.data ?? []}
        status={currencyStatus}
        onReload={reloadCurrencies}
        apiFetch={apiFetch}
      />
    </div>
  );
}

function CategoriesSection({
  workspaceId,
  workspaceSlug,
  data,
  status,
  onReload,
  apiFetch,
}: {
  workspaceId: string;
  workspaceSlug: string;
  data: NormalizedCategory[];
  status: SectionStatus;
  onReload: () => Promise<void>;
  apiFetch: ReturnType<typeof useApiFetch>;
}) {
  const queryClient = useQueryClient();
  const [editDraft, setEditDraft] = useState<CategoryDraft>({
    name: "",
    icon: "",
    color: "",
  });
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
          name: draft.name.trim(),
          icon: draft.icon.trim() || null,
          color: draft.color.trim() || null,
        }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(workspaceSlug),
      }),
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
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(workspaceSlug),
      }),
  });

  const archiveCategoryMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/dictionaries/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_archive: true }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(workspaceSlug),
      }),
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
      setActionError("Name is required");
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
      await archiveCategoryMutation.mutateAsync(id);
    } catch (e: any) {
      setActionError(e?.message || "Failed to delete category");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Categories"
      description="Manage expense and income categories."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <AddCategoryForm onSubmit={createCategory} />

        <DictionaryTable
          columns={["Name", "Icon", "Color"]}
          loading={status.loading}
          emptyText="No categories yet."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  isEditing ? (
                    <InlineInput
                      value={editDraft.name}
                      onChange={(v) => setEditDraft((p) => ({ ...p, name: v }))}
                    />
                  ) : (
                    <span className="font-medium">{row.name}</span>
                  ),
                  isEditing ? (
                    <InlineInput
                      value={editDraft.icon}
                      onChange={(v) => setEditDraft((p) => ({ ...p, icon: v }))}
                    />
                  ) : (
                    row.icon || "-"
                  ),
                  isEditing ? (
                    <div className="max-w-[280px]">
                      <ColorPicker
                        value={editDraft.color}
                        onChange={(color) =>
                          setEditDraft((p) => ({ ...p, color }))
                        }
                        allowCustom
                        className="w-full"
                      />
                    </div>
                  ) : row.color ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-[hsl(var(--border))]"
                        style={{ backgroundColor: row.color }}
                        aria-hidden
                      />
                      {row.color}
                    </span>
                  ) : (
                    "-"
                  ),
                ]}
                actions={
                  isEditing ? (
                    <>
                      <InlineButton
                        onClick={() => setEditId(null)}
                        text="Cancel"
                        variant="ghost"
                      />
                      <InlineButton
                        onClick={() => updateCategory(row.id)}
                        text={mutatingId === row.id ? "Saving..." : "Save"}
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
                        text="Edit"
                      />
                      <InlineButton
                        onClick={() => setConfirmDeleteId(row.id)}
                        text={mutatingId === row.id ? "..." : "Delete"}
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
        title="Delete category-"
        description="The category will be unavailable for future transactions."
        confirmText="Delete"
        cancelText="Cancel"
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
      {actionError && (
        <p className="mt-3 text-sm text-red-600">{actionError}</p>
      )}
    </SectionShell>
  );
}

function PaymentTypesSection({
  workspaceId,
  workspaceSlug,
  data,
  status,
  currencies,
  currencyStatus,
  onReload,
  onReloadCurrencies,
  apiFetch,
}: {
  workspaceId: string;
  workspaceSlug: string;
  data: NormalizedPaymentType[];
  status: SectionStatus;
  currencies: NormalizedCurrency[];
  currencyStatus: SectionStatus;
  onReload: () => Promise<void>;
  onReloadCurrencies: () => Promise<void>;
  apiFetch: ReturnType<typeof useApiFetch>;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<PaymentTypeDraft>({
    name: "",
    icon: "",
    defaultCurrencyId: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const currencyOptions = useMemo(
    () => [
      { value: "", label: "Not selected" },
      ...currencies.map((c) => ({
        value: c.id,
        label: `${c.code} - ${c.name}`,
      })),
    ],
    [currencies]
  );

  const createPaymentTypeMutation = useMutation({
    mutationFn: (input: PaymentTypeDraft) =>
      apiFetch("/api/dictionaries/payment_types", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: Number(workspaceId),
          name: input.name.trim(),
          icon: input.icon.trim() || null,
          default_currency_id: input.defaultCurrencyId
            ? Number(input.defaultCurrencyId)
            : null,
        }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes(workspaceSlug),
      }),
  });

  const updatePaymentTypeMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PaymentTypeDraft }) =>
      apiFetch(`/api/dictionaries/payment_types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: input.name.trim(),
          icon: input.icon.trim() || null,
          default_currency_id: input.defaultCurrencyId
            ? Number(input.defaultCurrencyId)
            : null,
        }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes(workspaceSlug),
      }),
  });

  const archivePaymentTypeMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/dictionaries/payment_types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_archive: true }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes(workspaceSlug),
      }),
  });

  async function createPaymentType() {
    if (!draft.name.trim()) {
      setActionError("Name is required");
      return;
    }
    setActionError(null);
    setMutatingId("new");
    try {
      await createPaymentTypeMutation.mutateAsync(draft);
      setDraft({ name: "", icon: "", defaultCurrencyId: "" });
    } catch (e: any) {
      setActionError(e?.message || "Failed to create payment method");
    } finally {
      setMutatingId(null);
    }
  }

  async function updatePaymentType(id: string, input: PaymentTypeDraft) {
    if (!input.name.trim()) {
      setActionError("Name is required");
      return;
    }
    setActionError(null);
    setMutatingId(id);
    try {
      await updatePaymentTypeMutation.mutateAsync({ id, input });
      setEditId(null);
    } catch (e: any) {
      setActionError(e?.message || "Failed to update payment method");
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
      await archivePaymentTypeMutation.mutateAsync(id);
    } catch (e: any) {
      setActionError(e?.message || "Failed to delete payment method");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Payment methods"
      description="Manage cards, wallets, and the default currency used for each."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Create payment method</h3>
            <button
              type="button"
              onClick={() => onReloadCurrencies()}
              disabled={currencyStatus.loading}
              className="text-xs text-[hsl(var(--fg-muted))] underline-offset-4 hover:underline disabled:opacity-60"
            >
              {currencyStatus.loading ? "Refreshing..." : "Refresh currencies"}
            </button>
          </div>
          <div className="mt-3 space-y-3">
            <LabeledField
              label="Name"
              value={draft.name}
              onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
              placeholder="Card, Cash..."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EmojiPicker
                label="Icon"
                value={draft.icon}
                onChange={(icon) => setDraft((p) => ({ ...p, icon }))}
                options={PAYMENT_TYPE_EMOJIS}
              />
              <Select
                label="Default currency"
                options={currencyOptions}
                value={draft.defaultCurrencyId}
                onChange={(val) =>
                  setDraft((p) => ({ ...p, defaultCurrencyId: val }))
                }
              />
            </div>
            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}
            <div className="flex items-center justify-end gap-2">
              <InlineButton
                text="Reset"
                variant="ghost"
                onClick={() =>
                  setDraft({ name: "", icon: "", defaultCurrencyId: "" })
                }
              />
              <InlineButton
                text={mutatingId === "new" ? "Creating..." : "Create"}
                variant="primary"
                disabled={mutatingId === "new"}
                onClick={createPaymentType}
              />
            </div>
          </div>
        </div>

        <DictionaryTable
          columns={["Name", "Icon", "Default currency"]}
          loading={status.loading}
          emptyText="No payment methods yet."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            const currentCurrency = row.defaultCurrencyId
              ? currencies.find((c) => c.id === row.defaultCurrencyId)?.code ||
                row.defaultCurrencyId
              : "-";
            if (isEditing) {
              return (
                <EditPaymentTypeRow
                  key={row.id}
                  row={row}
                  currencies={currencies}
                  savingId={mutatingId}
                  onCancel={() => setEditId(null)}
                  onDelete={() => setConfirmDeleteId(row.id)}
                  onSave={(draftUpdate) =>
                    updatePaymentType(row.id, draftUpdate)
                  }
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
                  row.icon || "-",
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
                      text="Edit"
                    />
                    <InlineButton
                      onClick={() => setConfirmDeleteId(row.id)}
                      text={mutatingId === row.id ? "..." : "Delete"}
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
        title="Delete payment method-"
        description="The payment method will be unavailable after deletion."
        confirmText="Delete"
        cancelText="Cancel"
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
      {actionError && (
        <p className="mt-3 text-sm text-red-600">{actionError}</p>
      )}
    </SectionShell>
  );
}

function CurrenciesSection({
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
  const [draft, setDraft] = useState<CurrencyDraft>({
    code: "",
    name: "",
    symbol: "",
  });
  const [editDraft, setEditDraft] = useState<CurrencyDraft>({
    code: "",
    name: "",
    symbol: "",
  });
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
  });

  const archiveCurrencyMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/dictionaries/currencies/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_archive: true }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
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
    if (
      !editDraft.code.trim() ||
      !editDraft.name.trim() ||
      !editDraft.symbol.trim()
    ) {
      setActionError("All fields are mandatory.");
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
      await archiveCurrencyMutation.mutateAsync(id);
    } catch (e: any) {
      setActionError(e?.message || "Failed to delete currency");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Currencies"
      description="Maintain the currency list used across payment methods."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <AddCurrencyForm onSubmit={createCurrency} />

        <DictionaryTable
          columns={["Code", "Name", "Symbol"]}
          loading={status.loading}
          emptyText="No currencies yet."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  isEditing ? (
                    <InlineInput
                      value={editDraft.code}
                      onChange={(v) => setEditDraft((p) => ({ ...p, code: v }))}
                    />
                  ) : (
                    <span className="font-medium">{row.code}</span>
                  ),
                  isEditing ? (
                    <InlineInput
                      value={editDraft.name}
                      onChange={(v) => setEditDraft((p) => ({ ...p, name: v }))}
                    />
                  ) : (
                    row.name
                  ),
                  isEditing ? (
                    <InlineInput
                      value={editDraft.symbol}
                      onChange={(v) =>
                        setEditDraft((p) => ({ ...p, symbol: v }))
                      }
                    />
                  ) : (
                    row.symbol
                  ),
                ]}
                actions={
                  isEditing ? (
                    <>
                      <InlineButton
                        onClick={() => setEditId(null)}
                        text="Cancel"
                        variant="ghost"
                      />
                      <InlineButton
                        onClick={() => updateCurrency(row.id)}
                        text={mutatingId === row.id ? "Saving..." : "Save"}
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
                            code: row.code,
                            name: row.name,
                            symbol: row.symbol,
                          });
                        }}
                        text="Edit"
                      />
                      <InlineButton
                        onClick={() => setConfirmDeleteId(row.id)}
                        text={mutatingId === row.id ? "..." : "Delete"}
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
        title="Delete currency-"
        description="After deletion the currency will not be available for selection."
        confirmText="Delete"
        cancelText="Cancel"
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
      {actionError && (
        <p className="mt-3 text-sm text-red-600">{actionError}</p>
      )}
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
      <label className="mb-1 block text-xs uppercase tracking-wide text-[hsl(var(--fg-muted))]">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
      />
    </div>
  );
}

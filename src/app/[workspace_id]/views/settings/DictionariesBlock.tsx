"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColorPicker, EmojiPicker, CATEGORY_EMOJIS, PAYMENT_TYPE_EMOJIS, Modal } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/field/Input";
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
  DictionaryRow,
  DictionaryTable,
  InlineButton,
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

type PaymentTypeDraft = { name: string; icon: string; defaultCurrencyId: string };

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const SECTION_SPACING = "space-y-4 sm:space-y-5";
const COMPACT_GRID = "grid gap-4 sm:gap-5 lg:grid-cols-[280px,1fr]";
const CELL_TEXT = "block max-w-[220px] truncate text-[0.95em]";

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
        `/api/dictionaries/categories?workspaceId=${workspaceId}`
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
        `/api/dictionaries/payment_types?workspaceId=${workspaceId}`
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

  const invalidateCategories = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(workspaceSlug),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryOptions(workspaceSlug),
      }),
    ]);
  const invalidatePaymentTypes = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes(workspaceSlug),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypeOptions(workspaceSlug),
      }),
    ]);
  const invalidateCurrencies = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
      queryClient.invalidateQueries({ queryKey: queryKeys.currencyOptions }),
    ]);

  const reloadCategories = async () => {
    await invalidateCategories();
  };
  const reloadPaymentTypes = async () => {
    await invalidatePaymentTypes();
  };
  const reloadCurrencies = async () => {
    await invalidateCurrencies();
  };

  return (
    <div className={SECTION_SPACING}>
      <CategoriesSection
        workspaceId={workspaceId}
        data={categoriesQuery.data ?? []}
        status={categoryStatus}
        onReload={reloadCategories}
        apiFetch={apiFetch}
      />

      <PaymentTypesSection
        workspaceId={workspaceId}
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
  const [editDraft, setEditDraft] = useState<CategoryDraft>({
    name: "",
    icon: "",
    color: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editModalSaving, setEditModalSaving] = useState(false);
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
    onSuccess: onReload,
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
    onSuccess: onReload,
  });

  const archiveCategoryMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/dictionaries/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_archive: true }),
      }),
    onSuccess: onReload,
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

  const openEditCategory = (row: NormalizedCategory) => {
    setEditId(row.id);
    setEditDraft({
      name: row.name,
      icon: row.icon || "",
      color: row.color || "",
    });
    setEditModalError(null);
  };

  const closeEditCategory = () => {
    setEditId(null);
    setEditDraft({ name: "", icon: "", color: "" });
    setEditModalError(null);
  };

  async function saveCategoryEdit() {
    if (!editId) return;
    if (!editDraft.name.trim()) {
      setEditModalError("Name is required");
      return;
    }
    setEditModalError(null);
    setEditModalSaving(true);
    try {
      await updateCategoryMutation.mutateAsync({ id: editId, draft: editDraft });
      closeEditCategory();
    } catch (e: any) {
      setEditModalError(e?.message || "Failed to update category");
    } finally {
      setEditModalSaving(false);
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
      <div className={COMPACT_GRID}>
        <AddCategoryForm onSubmit={createCategory} />

        <DictionaryTable
          columns={["Name", "Icon", "Color"]}
          loading={status.loading}
          emptyText="No categories yet."
          rows={data.map((row) => (
            <DictionaryRow
              key={row.id}
              cells={[
                <span key="name" className={`font-medium ${CELL_TEXT}`}>
                  {row.name}
                </span>,
                <span key="icon" className={CELL_TEXT}>
                  {row.icon || "-"}
                </span>,
                row.color ? (
                  <span
                    key="color"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-[hsl(var(--border))]"
                      style={{ backgroundColor: row.color }}
                      aria-hidden
                    />
                    <span className={CELL_TEXT}>{row.color}</span>
                  </span>
                ) : (
                  <span key="color-empty">-</span>
                ),
              ]}
              actions={
                <>
                  <InlineButton
                    onClick={() => openEditCategory(row)}
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
          ))}
        />
      </div>
      <Modal
        open={Boolean(editId)}
        onClose={closeEditCategory}
        title="Edit category"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeEditCategory} disabled={editModalSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveCategoryEdit} disabled={editModalSaving}>
              {editModalSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Name"
            value={editDraft.name}
            onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <EmojiPicker
              label="Icon"
              value={editDraft.icon}
              onChange={(icon) => setEditDraft((p) => ({ ...p, icon }))}
              options={CATEGORY_EMOJIS}
            />
            <ColorPicker
              label="Color"
              value={editDraft.color}
              onChange={(color) => setEditDraft((p) => ({ ...p, color }))}
              allowCustom
            />
          </div>
          {editModalError && (
            <p className="text-sm text-red-600">{editModalError}</p>
          )}
        </div>
      </Modal>
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
  const [createDraft, setCreateDraft] = useState<PaymentTypeDraft>({
    name: "",
    icon: "",
    defaultCurrencyId: "",
  });
  const [editDraft, setEditDraft] = useState<PaymentTypeDraft>({
    name: "",
    icon: "",
    defaultCurrencyId: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editModalSaving, setEditModalSaving] = useState(false);
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
    onSuccess: onReload,
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
    onSuccess: onReload,
  });

  const archivePaymentTypeMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/dictionaries/payment_types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_archive: true }),
      }),
    onSuccess: onReload,
  });

  async function createPaymentType() {
    if (!createDraft.name.trim()) {
      setActionError("Name is required");
      return;
    }
    setActionError(null);
    setMutatingId("new");
    try {
      await createPaymentTypeMutation.mutateAsync(createDraft);
      setCreateDraft({ name: "", icon: "", defaultCurrencyId: "" });
    } catch (e: any) {
      setActionError(e?.message || "Failed to create payment method");
    } finally {
      setMutatingId(null);
    }
  }

  const openEditPaymentType = (row: NormalizedPaymentType) => {
    setEditId(row.id);
    setEditDraft({
      name: row.name,
      icon: row.icon || "",
      defaultCurrencyId: row.defaultCurrencyId || "",
    });
    setEditModalError(null);
  };

  const closeEditPaymentType = () => {
    setEditId(null);
    setEditDraft({ name: "", icon: "", defaultCurrencyId: "" });
    setEditModalError(null);
  };

  async function savePaymentTypeEdit() {
    if (!editId) return;
    if (!editDraft.name.trim()) {
      setEditModalError("Name is required");
      return;
    }
    setEditModalError(null);
    setEditModalSaving(true);
    try {
      await updatePaymentTypeMutation.mutateAsync({ id: editId, input: editDraft });
      closeEditPaymentType();
    } catch (e: any) {
      setEditModalError(e?.message || "Failed to update payment method");
    } finally {
      setEditModalSaving(false);
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
      <div className={COMPACT_GRID}>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:p-4">
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
              value={createDraft.name}
              onChange={(v) => setCreateDraft((p) => ({ ...p, name: v }))}
              placeholder="Card, Cash..."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EmojiPicker
                label="Icon"
                value={createDraft.icon}
                onChange={(icon) => setCreateDraft((p) => ({ ...p, icon }))}
                options={PAYMENT_TYPE_EMOJIS}
              />
              <Select
                label="Default currency"
                options={currencyOptions}
                value={createDraft.defaultCurrencyId}
                onChange={(val) =>
                  setCreateDraft((p) => ({ ...p, defaultCurrencyId: val }))
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
                  setCreateDraft({ name: "", icon: "", defaultCurrencyId: "" })
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
            const currentCurrency = row.defaultCurrencyId
              ? currencies.find((c) => c.id === row.defaultCurrencyId)?.code ||
                row.defaultCurrencyId
              : "-";

            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  <span className={`font-medium ${CELL_TEXT}`} key="name">
                    {row.name}
                  </span>,
                  <span key="icon" className={CELL_TEXT}>
                    {row.icon || "-"}
                  </span>,
                  <span key="currency" className={CELL_TEXT}>
                    {currentCurrency}
                  </span>,
                ]}
                actions={
                  <>
                    <InlineButton
                      onClick={() => openEditPaymentType(row)}
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
      <Modal
        open={Boolean(editId)}
        onClose={closeEditPaymentType}
        title="Edit payment method"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeEditPaymentType} disabled={editModalSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={savePaymentTypeEdit} disabled={editModalSaving}>
              {editModalSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Name"
            value={editDraft.name}
            onChange={(e) =>
              setEditDraft((p) => ({ ...p, name: e.target.value }))
            }
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <EmojiPicker
              label="Icon"
              value={editDraft.icon}
              onChange={(icon) => setEditDraft((p) => ({ ...p, icon }))}
              options={PAYMENT_TYPE_EMOJIS}
            />
            <Select
              label="Default currency"
              options={currencyOptions}
              value={editDraft.defaultCurrencyId}
              onChange={(val) =>
                setEditDraft((p) => ({ ...p, defaultCurrencyId: val }))
              }
            />
          </div>
          {editModalError && (
            <p className="text-sm text-red-600">{editModalError}</p>
          )}
        </div>
      </Modal>
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
  const [editDraft, setEditDraft] = useState<CurrencyDraft>({
    code: "",
    name: "",
    symbol: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editModalSaving, setEditModalSaving] = useState(false);
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
    onSuccess: onReload,
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
    onSuccess: onReload,
  });

  const archiveCurrencyMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/dictionaries/currencies/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_archive: true }),
      }),
    onSuccess: onReload,
  });

  async function createCurrency(d: CurrencyDraft) {
    setMutatingId("new");
    try {
      await createCurrencyMutation.mutateAsync(d);
    } catch (e: any) {
      setActionError(e?.message || "Failed to create currency");
    } finally {
      setMutatingId(null);
    }
  }

  const openEditCurrency = (row: NormalizedCurrency) => {
    setEditId(row.id);
    setEditDraft({
      code: row.code,
      name: row.name,
      symbol: row.symbol,
    });
    setEditModalError(null);
  };

  const closeEditCurrency = () => {
    setEditId(null);
    setEditDraft({ code: "", name: "", symbol: "" });
    setEditModalError(null);
  };

  async function saveCurrencyEdit() {
    if (!editId) return;
    if (
      !editDraft.code.trim() ||
      !editDraft.name.trim() ||
      !editDraft.symbol.trim()
    ) {
      setEditModalError("All fields are mandatory.");
      return;
    }
    setEditModalError(null);
    setEditModalSaving(true);
    try {
      await updateCurrencyMutation.mutateAsync({ id: editId, draft: editDraft });
      closeEditCurrency();
    } catch (e: any) {
      setEditModalError(e?.message || "Failed to update currency");
    } finally {
      setEditModalSaving(false);
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
      <div className={COMPACT_GRID}>
        <AddCurrencyForm onSubmit={createCurrency} />

        <DictionaryTable
          columns={["Code", "Name", "Symbol"]}
          loading={status.loading}
          emptyText="No currencies yet."
          rows={data.map((row) => (
            <DictionaryRow
              key={row.id}
              cells={[
                <span key="code" className={`font-medium ${CELL_TEXT}`}>
                  {row.code}
                </span>,
                <span key="name" className={CELL_TEXT}>
                  {row.name}
                </span>,
                <span key="symbol" className={CELL_TEXT}>
                  {row.symbol}
                </span>,
              ]}
              actions={
                <>
                  <InlineButton
                    onClick={() => openEditCurrency(row)}
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
          ))}
        />
        <Modal
          open={Boolean(editId)}
          onClose={closeEditCurrency}
          title="Edit currency"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={closeEditCurrency}
                disabled={editModalSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={saveCurrencyEdit}
                disabled={editModalSaving}
              >
                {editModalSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <Input
              label="Code"
              value={editDraft.code}
              onChange={(e) =>
                setEditDraft((p) => ({
                  ...p,
                  code: e.target.value.toUpperCase(),
                }))
              }
            />
            <Input
              label="Name"
              value={editDraft.name}
              onChange={(e) =>
                setEditDraft((p) => ({ ...p, name: e.target.value }))
              }
            />
            <Input
              label="Symbol"
              value={editDraft.symbol}
              onChange={(e) =>
                setEditDraft((p) => ({ ...p, symbol: e.target.value }))
              }
            />
            {editModalError && (
              <p className="text-sm text-red-600">{editModalError}</p>
            )}
          </div>
        </Modal>
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

"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/field/Input";
import { Select } from "@/components/ui/field/Select";
import { EmojiPicker, PAYMENT_TYPE_EMOJIS, Modal } from "@/components/ui";
import {
  DictionaryRow,
  DictionaryTable,
  InlineButton,
  SectionShell,
  type SectionStatus,
} from "@/components/settings/DictionaryUI";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";
import type { NormalizedCurrency, NormalizedPaymentType } from "@/entities/dictionaries/normalize";
import { COMPACT_GRID, CELL_TEXT, FORM_COLUMN, TABLE_COLUMN } from "./constants";
import type { ApiFetcher } from "./types";

export type PaymentTypeDraft = {
  name: string;
  icon: string;
  defaultCurrencyId: string;
};

export type PaymentTypesSectionProps = {
  workspaceId: string;
  data: NormalizedPaymentType[];
  status: SectionStatus;
  currencies: NormalizedCurrency[];
  currencyStatus: SectionStatus;
  onReload: () => Promise<void>;
  onReloadCurrencies: () => Promise<void>;
  apiFetch: ApiFetcher;
};

export function PaymentTypesSection({
  workspaceId,
  data,
  status,
  currencies,
  currencyStatus,
  onReload,
  onReloadCurrencies,
  apiFetch,
}: PaymentTypesSectionProps) {
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
        <div className={FORM_COLUMN}>
          <div className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:p-4">
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
              <div className="flex flex-wrap items-center justify-end gap-2">
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
        </div>

        <div className={TABLE_COLUMN}>
          <DictionaryTable
            columns={["Name", "Icon", "Default currency"]}
            loading={status.loading}
            emptyText="No payment methods yet."
            mobileVisibleColumns={[0, 2]}
            rows={data.map((row) => {
              const currentCurrency = row.defaultCurrencyId
                ? currencies.find((c) => c.id === row.defaultCurrencyId)?.code ||
                  row.defaultCurrencyId
                : "-";

              return (
                <DictionaryRow
                  key={row.id}
                  mobileVisibleColumns={[0, 2]}
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
                        icon={<Pencil className="h-4 w-4" aria-hidden />}
                        iconOnly
                      />
                      <InlineButton
                        onClick={() => setConfirmDeleteId(row.id)}
                        text="Delete"
                        disabled={mutatingId === row.id}
                        variant="danger"
                        icon={<Trash2 className="h-4 w-4" aria-hidden />}
                        iconOnly
                        loading={mutatingId === row.id}
                      />
                    </>
                  }
                />
              );
            })}
          />
        </div>
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

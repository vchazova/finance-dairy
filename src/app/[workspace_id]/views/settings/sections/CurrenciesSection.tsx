"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/field/Input";
import { Modal } from "@/components/ui";
import {
  DictionaryRow,
  DictionaryTable,
  InlineButton,
  SectionShell,
  type SectionStatus,
} from "@/components/settings/DictionaryUI";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";
import { AddCurrencyForm, type CurrencyDraft } from "@/components/settings/AddCurrencyForm";
import type { NormalizedCurrency } from "@/entities/dictionaries/normalize";
import { COMPACT_GRID, CELL_TEXT } from "./constants";
import type { ApiFetcher } from "./types";

export type CurrenciesSectionProps = {
  data: NormalizedCurrency[];
  status: SectionStatus;
  onReload: () => Promise<void>;
  apiFetch: ApiFetcher;
};

export function CurrenciesSection({
  data,
  status,
  onReload,
  apiFetch,
}: CurrenciesSectionProps) {
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
      </div>
      <Modal
        open={Boolean(editId)}
        onClose={closeEditCurrency}
        title="Edit currency"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeEditCurrency} disabled={editModalSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveCurrencyEdit} disabled={editModalSaving}>
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
            onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Symbol"
            value={editDraft.symbol}
            onChange={(e) => setEditDraft((p) => ({ ...p, symbol: e.target.value }))}
          />
          {editModalError && (
            <p className="text-sm text-red-600">{editModalError}</p>
          )}
        </div>
      </Modal>
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

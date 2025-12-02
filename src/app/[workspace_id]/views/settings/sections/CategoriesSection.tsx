"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/field/Input";
import { Button } from "@/components/ui/button/Button";
import { ColorPicker, EmojiPicker, CATEGORY_EMOJIS, Modal } from "@/components/ui";
import {
  DictionaryRow,
  DictionaryTable,
  InlineButton,
  SectionShell,
  type SectionStatus,
} from "@/components/settings/DictionaryUI";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";
import { AddCategoryForm, type CategoryDraft } from "@/components/settings/AddCategoryForm";
import { queryKeys } from "@/lib/queryKeys";
import type { NormalizedCategory } from "@/entities/dictionaries/normalize";
import { COMPACT_GRID, CELL_TEXT } from "./constants";
import type { ApiFetcher } from "./types";

export type CategoriesSectionProps = {
  workspaceId: string;
  workspaceSlug: string;
  data: NormalizedCategory[];
  status: SectionStatus;
  onReload: () => Promise<void>;
  apiFetch: ApiFetcher;
};

export function CategoriesSection({
  workspaceId,
  workspaceSlug,
  data,
  status,
  onReload,
  apiFetch,
}: CategoriesSectionProps) {
  const queryClient = useQueryClient();
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
                  <InlineButton onClick={() => openEditCategory(row)} text="Edit" />
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

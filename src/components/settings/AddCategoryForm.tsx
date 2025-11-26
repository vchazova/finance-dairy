"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/field/Input";
import { ColorPicker, EmojiPicker } from "@/components/ui";

export type CategoryDraft = { name: string; icon: string; color: string };

export function AddCategoryForm({
  onSubmit,
}: {
  onSubmit: (draft: CategoryDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<CategoryDraft>({ name: "", icon: "", color: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!draft.name.trim()) {
      setError("Название обязательно");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: draft.name.trim(),
        icon: draft.icon.trim(),
        color: draft.color.trim(),
      });
      setDraft({ name: "", icon: "", color: "" });
    } catch (e: any) {
      setError(e?.message || "Не удалось создать категорию");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <h3 className="text-sm font-semibold">Добавить категорию</h3>
      <div className="mt-3 space-y-3">
        <Input
          label="Название"
          placeholder="Еда, Транспорт..."
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EmojiPicker
            label="Иконка"
            value={draft.icon}
            onChange={(icon) => setDraft((p) => ({ ...p, icon }))}
          />
          <ColorPicker
            label="Цвет"
            value={draft.color}
            onChange={(color) => setDraft((p) => ({ ...p, color }))}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-[hsl(var(--border))]"
            onClick={() => setDraft({ name: "", icon: "", color: "" })}
          >
            Сбросить
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Сохранение..." : "Добавить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

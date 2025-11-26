"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/field/Input";

export type CurrencyDraft = { code: string; name: string; symbol: string };

export function AddCurrencyForm({ onSubmit }: { onSubmit: (draft: CurrencyDraft) => Promise<void> }) {
  const [draft, setDraft] = useState<CurrencyDraft>({ code: "", name: "", symbol: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!draft.code.trim() || !draft.name.trim() || !draft.symbol.trim()) {
      setError("Код, название и символ обязательны");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        code: draft.code.trim().toUpperCase(),
        name: draft.name.trim(),
        symbol: draft.symbol.trim(),
      });
      setDraft({ code: "", name: "", symbol: "" });
    } catch (e: any) {
      setError(e?.message || "Не удалось создать валюту");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <h3 className="text-sm font-semibold">Добавить валюту</h3>
      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Код"
            placeholder="USD"
            value={draft.code}
            onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value }))}
          />
          <Input
            label="Символ"
            placeholder="$"
            value={draft.symbol}
            onChange={(e) => setDraft((p) => ({ ...p, symbol: e.target.value }))}
          />
        </div>
        <Input
          label="Название"
          placeholder="Доллар США"
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-[hsl(var(--border))]"
            onClick={() => setDraft({ code: "", name: "", symbol: "" })}
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
            {loading ? "Сохраняем..." : "Добавить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

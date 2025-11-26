"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/field/Select";
import { InlineButton, InlineInput } from "@/components/settings/DictionaryUI";
import type { NormalizedCurrency, NormalizedPaymentType } from "@/entities/dictionaries/normalize";

export type PaymentTypeDraft = { name: string; icon: string; defaultCurrencyId: string };

export function EditPaymentTypeRow({
  row,
  currencies,
  onSave,
  onCancel,
  onDelete,
  savingId,
}: {
  row: NormalizedPaymentType;
  currencies: NormalizedCurrency[];
  onSave: (draft: PaymentTypeDraft) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
  savingId: string | null;
}) {
  const [draft, setDraft] = useState<PaymentTypeDraft>({
    name: row.name,
    icon: row.icon || "",
    defaultCurrencyId: row.defaultCurrencyId || "",
  });

  const currencyOptions = useMemo(
    () => [{ value: "", label: "Не выбрана" }, ...currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))],
    [currencies]
  );

  return (
    <tr className="border-t border-[hsl(var(--border))]">
      <td className="px-4 py-2 align-middle">
        <InlineInput value={draft.name} onChange={(v) => setDraft((p) => ({ ...p, name: v }))} />
      </td>
      <td className="px-4 py-2 align-middle text-[hsl(var(--fg-muted))]">
        <InlineInput value={draft.icon} onChange={(v) => setDraft((p) => ({ ...p, icon: v }))} />
      </td>
      <td className="px-4 py-2 align-middle text-[hsl(var(--fg-muted))]">
        <Select
          options={currencyOptions}
          value={draft.defaultCurrencyId}
          onChange={(val) => setDraft((p) => ({ ...p, defaultCurrencyId: val }))}
        />
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex justify-end gap-2 text-xs">
          <InlineButton text="Отмена" variant="ghost" onClick={onCancel} />
          <InlineButton
            text={savingId === row.id ? "Сохраняем..." : "Сохранить"}
            variant="primary"
            disabled={savingId === row.id}
            onClick={() => onSave(draft)}
          />
          <InlineButton
            text={savingId === row.id ? "..." : "Удалить"}
            variant="danger"
            disabled={savingId === row.id}
            onClick={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

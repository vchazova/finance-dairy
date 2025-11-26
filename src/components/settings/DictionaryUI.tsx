"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/field/Input";
import { cn } from "@/components/ui/utils/cn";

export type SectionStatus = { loading: boolean; error: string | null };

export function SectionShell({
  title,
  description,
  count,
  status,
  onReload,
  children,
}: {
  title: string;
  description: string;
  count: number;
  status: SectionStatus;
  onReload: () => void | Promise<void>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-[hsl(var(--fg-muted))]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => onReload()}
            disabled={status.loading}
            size="sm"
            className="border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--card))]"
          >
            {status.loading ? "Обновляем..." : "Обновить"}
          </Button>
          <span className="rounded-full bg-[hsl(var(--card))] px-3 py-1 text-xs text-[hsl(var(--fg-muted))]">
            {count} шт.
          </span>
        </div>
      </div>
      <div className="mt-5">{children}</div>
      {status.error && <p className="mt-3 text-sm text-red-600">{status.error}</p>}
    </section>
  );
}

export function DictionaryTable({
  columns,
  rows,
  loading,
  emptyText,
}: {
  columns: string[];
  rows: ReactNode[];
  loading: boolean;
  emptyText: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--card))]">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left">
                {col}
              </th>
            ))}
            <th className="px-4 py-2 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr className="border-t border-[hsl(var(--border))]">
              <td className="px-4 py-3" colSpan={columns.length + 1}>
                Загрузка...
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr className="border-t border-[hsl(var(--border))]">
              <td className="px-4 py-3 text-[hsl(var(--fg-muted))]" colSpan={columns.length + 1}>
                {emptyText}
              </td>
            </tr>
          )}
          {!loading && rows}
        </tbody>
      </table>
    </div>
  );
}

export function DictionaryRow({ cells, actions }: { cells: ReactNode | ReactNode[]; actions: ReactNode }) {
  const list = Array.isArray(cells) ? cells : [cells];
  return (
    <tr className="border-t border-[hsl(var(--border))]">
      {list.map((cell, idx) => (
        <td key={idx} className="px-4 py-2 align-middle text-[hsl(var(--fg))]">
          {cell}
        </td>
      ))}
      <td className="px-4 py-2 text-right">
        <div className="flex justify-end gap-2 text-xs">{actions}</div>
      </td>
    </tr>
  );
}

export function InlineInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-lg bg-transparent px-2 py-1 text-sm"
    />
  );
}

export function InlineButton({
  text,
  variant = "default",
  disabled,
  onClick,
}: {
  text: string;
  variant?: "primary" | "default" | "ghost" | "danger";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={disabled}
      className={cn(
        variant === "danger" && "border-red-200 text-red-600",
        variant === "default" && "border border-[hsl(var(--border))]"
      )}
      onClick={onClick}
    >
      {text}
    </Button>
  );
}

"use client";

import { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
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
            variant="default"
            loading={status.loading}
            leftIcon={!status.loading ? <RotateCcw className="h-4 w-4" aria-hidden /> : undefined}
          >
            {status.loading ? "Refreshing..." : "Refresh"}
          </Button>
          <span className="rounded-full bg-[hsl(var(--card))] px-3 py-1 text-xs text-[hsl(var(--fg-muted))]">
            {count} items
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
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead className="bg-[hsl(var(--card))]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-semibold text-[hsl(var(--fg))]"
                >
                  {col}
                </th>
              ))}
              <th className="w-[72px] px-3 py-2 text-right font-semibold text-[hsl(var(--fg))] sm:w-[120px]">
                <span className="hidden sm:inline">Actions</span>
                <span className="text-base leading-none sm:hidden" aria-hidden>
                  &middot;&middot;&middot;
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="border-t border-[hsl(var(--border))]">
                <td className="px-3 py-3" colSpan={columns.length + 1}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr className="border-t border-[hsl(var(--border))]">
                <td
                  className="px-3 py-3 text-[hsl(var(--fg-muted))]"
                  colSpan={columns.length + 1}
                >
                  {emptyText}
                </td>
              </tr>
            )}
            {!loading && rows}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DictionaryRow({
  cells,
  actions,
}: {
  cells: ReactNode | ReactNode[];
  actions: ReactNode;
}) {
  const list = Array.isArray(cells) ? cells : [cells];
  return (
    <tr className="border-t border-[hsl(var(--border))]">
      {list.map((cell, idx) => (
        <td
          key={idx}
          className="relative overflow-visible px-3 py-2 align-middle text-[hsl(var(--fg))]"
        >
          <div className="relative z-10">{cell}</div>
        </td>
      ))}
      <td className="w-[72px] px-3 py-2 text-right sm:w-[120px]">
        <div className="flex justify-end gap-1.5 text-xs sm:gap-2">{actions}</div>
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
  icon,
  iconOnly,
  loading,
}: {
  text: string;
  variant?: "primary" | "default" | "ghost" | "danger";
  disabled?: boolean;
  onClick: () => void;
  icon?: ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={disabled}
      loading={loading}
      className={cn(
        "px-2 text-[0.85rem] sm:px-3",
        iconOnly && "h-9 w-9 rounded-full p-0",
        variant === "danger" && "border-red-200 text-red-600",
        variant === "default" && "border border-[hsl(var(--border))]"
      )}
      onClick={onClick}
      aria-label={iconOnly ? text : undefined}
    >
      {!loading && icon && (
        <span className={cn(!iconOnly && "-ml-0.5", "text-current")}>{icon}</span>
      )}
      {iconOnly ? <span className="sr-only">{text}</span> : text}
    </Button>
  );
}

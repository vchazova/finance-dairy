"use client";

import * as React from "react";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type EmojiOption = { value: string; label: string };

const defaultEmojis: EmojiOption[] = [
  { value: "🏦", label: "Bank" },
  { value: "📈", label: "Growth" },
  { value: "💰", label: "Cash" },
  { value: "💳", label: "Card" },
  { value: "🧾", label: "Bills" },
  { value: "📊", label: "Reports" },
  { value: "🎯", label: "Goal" },
  { value: "🛍️", label: "Shopping" },
  { value: "🚗", label: "Car" },
  { value: "🏠", label: "Home" },
  { value: "🍽️", label: "Food" },
  { value: "✈️", label: "Travel" },
];

export type EmojiPickerProps = FieldProps & {
  value: string;
  onChange: (value: string) => void;
  options?: EmojiOption[];
  disabled?: boolean;
  searchPlaceholder?: string;
  className?: string;
  id?: string;
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  value,
  onChange,
  options = defaultEmojis,
  disabled,
  label,
  hint,
  error,
  searchPlaceholder = "Search emoji...",
  className,
  id,
}) => {
  const fieldId = React.useId();
  const inputId = id ?? fieldId;
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  const handleSelect = (emoji: string) => {
    if (disabled) return;
    onChange(emoji);
  };

  return (
    <FieldWrapper label={label} hint={hint} error={error} id={inputId}>
      <div
        className={cn(
          "space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-[hsl(var(--border))] bg-white/70 text-2xl">
              {value || "🙂"}
            </div>
            <div className="text-sm text-[hsl(var(--fg-muted))]">
              {value ? "Selected emoji" : "Pick an emoji"}
            </div>
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className={cn(
                "text-xs text-[hsl(var(--fg-muted))] underline-offset-4 hover:underline",
                tokens.disabled
              )}
              disabled={disabled}
            >
              Clear
            </button>
          )}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          id={inputId}
          className={cn(
            "h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 text-sm",
            tokens.focusInput,
            tokens.disabled
          )}
          disabled={disabled}
        />

        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {filtered.map((opt) => {
            const isActive = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                title={opt.label}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "relative flex h-12 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-white/70 text-2xl transition",
                  isActive && "ring-2 ring-[hsl(var(--color-primary))]",
                  tokens.disabled
                )}
                aria-pressed={isActive}
                disabled={disabled}
              >
                <span>{opt.value}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm text-[hsl(var(--fg-muted))]">
              No emoji found.
            </div>
          )}
        </div>
      </div>
    </FieldWrapper>
  );
};

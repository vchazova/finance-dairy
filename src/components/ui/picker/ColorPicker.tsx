"use client";

import * as React from "react";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

const defaultColors = [
  "#1F6FEB",
  "#E11D48",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#0EA5E9",
  "#F97316",
  "#22C55E",
  "#111827",
];

export type ColorPickerProps = FieldProps & {
  value: string;
  onChange: (value: string) => void;
  colors?: string[];
  disabled?: boolean;
  allowCustom?: boolean;
  className?: string;
  id?: string;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  colors = defaultColors,
  disabled,
  allowCustom = true,
  label,
  hint,
  error,
  className,
  id,
}) => {
  const fieldId = React.useId();
  const inputId = id ?? fieldId;
  const [custom, setCustom] = React.useState(value);

  React.useEffect(() => {
    setCustom(value);
  }, [value]);

  const handleSelect = (color: string) => {
    if (disabled) return;
    onChange(color);
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
          <div className="flex items-center gap-3 text-sm text-[hsl(var(--fg-muted))]">
            <div
              className="h-10 w-10 rounded-full border border-[hsl(var(--border))]"
              style={{ backgroundColor: value || "transparent" }}
              aria-hidden
            />
            {value ? `Selected: ${value}` : "Pick a color"}
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

        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const isActive = value.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => handleSelect(color)}
                className={cn(
                  "relative h-10 w-10 rounded-full border border-[hsl(var(--border))] transition",
                  isActive && "ring-2 ring-[hsl(var(--color-primary))]",
                  tokens.disabled
                )}
                style={{ backgroundColor: color }}
                aria-pressed={isActive}
                disabled={disabled}
              >
                {isActive && (
                  <span className="absolute inset-0 grid place-items-center text-xs text-white drop-shadow">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {allowCustom && (
          <div className="flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onBlur={() => onChange(custom.trim())}
              placeholder="#RRGGBB or name"
              id={inputId}
              className={cn(
                "h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 text-sm",
                tokens.focusInput,
                tokens.disabled
              )}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => onChange(custom.trim())}
              className={cn(
                "h-10 rounded-xl border border-[hsl(var(--border))] px-3 text-sm",
                tokens.focusButton,
                tokens.disabled
              )}
              disabled={disabled}
            >
              Use
            </button>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

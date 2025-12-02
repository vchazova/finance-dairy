"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export const DEFAULT_CATEGORY_COLORS = [
  "#E7717D", // soft coral
  "#F28C5B", // warm orange
  "#F2C45A", // muted golden yellow
  "#AFD275", // light fresh green
  "#6BB58D", // sage green
  "#3BAFB6", // teal
  "#4F82C0", // soft blue
  "#5B5AAE", // indigo
  "#9D7BD8", // soft violet
  "#D98BB8", // muted pink
  "#A9745A", // warm brown
  "#7B8FA6", // blue-grey
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
  colors = DEFAULT_CATEGORY_COLORS,
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
  const hexInputId = `${inputId}-custom`;
  const [custom, setCustom] = React.useState(value ?? "");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setCustom(value ?? "");
  }, [value]);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (event.target instanceof Node && containerRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const normalizedValue = (value ?? "").trim();

  const handleSelect = (color: string) => {
    if (disabled) return;
    onChange(color);
    setOpen(false);
  };

  const applyCustomColor = (options?: { closePanel?: boolean }) => {
    if (disabled) return;
    const formatted = custom.trim();
    onChange(formatted && formatted !== "#" ? formatted : "");
    if (options?.closePanel !== false) {
      setOpen(false);
    }
  };

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  return (
    <FieldWrapper label={label} hint={hint} error={error} id={inputId}>
      <div ref={containerRef} className={cn("relative", className)}>
        <button
          type="button"
          id={inputId}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-left text-sm",
            tokens.focusButton,
            tokens.disabled
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggleOpen}
          disabled={disabled}
        >
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-8 rounded border border-[hsl(var(--border))]"
              style={{ backgroundColor: normalizedValue || "transparent" }}
              aria-hidden
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[hsl(var(--fg))]">
                {normalizedValue ? normalizedValue.toUpperCase() : "Pick a color"}
              </span>
              <span className="text-[0.7rem] text-[hsl(var(--fg-muted))]">
                Palette or HEX input
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[hsl(var(--fg-muted))] transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        {open && (
          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-72 space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[hsl(var(--fg-muted))]">
                Palette
              </span>
              {normalizedValue && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setCustom("");
                    setOpen(false);
                  }}
                  className="text-xs text-[hsl(var(--fg-muted))] underline-offset-4 hover:text-[hsl(var(--fg))]"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-3">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {colors.map((color) => {
                  const isActive = normalizedValue.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      onClick={() => handleSelect(color)}
                      className={cn(
                        "relative h-8 w-full rounded border border-transparent transition",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]",
                        isActive
                          ? "border-[hsl(var(--color-primary))]"
                          : "hover:border-[hsl(var(--border))]",
                        tokens.disabled
                      )}
                      style={{ backgroundColor: color }}
                      aria-pressed={isActive}
                      disabled={disabled}
                    >
                      <span className="sr-only">{color}</span>
                      {isActive && (
                        <span className="absolute inset-0 flex items-center justify-center text-[0.65rem] font-semibold text-white">
                          {"\u2713"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {allowCustom && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={hexInputId}
                  className="text-[0.65rem] uppercase tracking-[0.2em] text-[hsl(var(--fg-muted))]"
                >
                  Custom HEX
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-[hsl(var(--fg-muted))]">
                      #
                    </span>
                    <input
                      type="text"
                      value={custom.replace(/^#/, "")}
                      onChange={(event) => {
                        const sanitized = event.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                        setCustom(sanitized ? `#${sanitized}` : "");
                      }}
                      onBlur={() => applyCustomColor({ closePanel: false })}
                      placeholder="RRGGBB"
                      id={hexInputId}
                      className={cn(
                        "h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-transparent pl-6 pr-3 text-sm uppercase",
                        tokens.focusInput,
                        tokens.disabled
                      )}
                      disabled={disabled}
                      inputMode="text"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => applyCustomColor({ closePanel: true })}
                    className={cn(
                      "h-10 min-w-[4.5rem] rounded-lg border border-[hsl(var(--border))] px-4 text-sm font-medium text-[hsl(var(--fg))]",
                      tokens.focusButton,
                      tokens.disabled
                    )}
                    disabled={disabled}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

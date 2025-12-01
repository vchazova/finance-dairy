import * as React from "react";
import { tokens } from "@/components/ui/theme/tokens";
import { cn } from "@/components/ui/utils/cn";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";
import type { SelectOption } from "./Select";

function useOutside(handler: () => void) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target))
        handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);
  return ref;
}

export type MultiSelectProps = FieldProps & {
  options: SelectOption[];
  values?: string[];
  defaultValues?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  menuClassName?: string;
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  hint,
  options,
  values,
  defaultValues,
  onChange,
  placeholder = "Select values",
  disabled,
  id,
  className,
  menuClassName,
  labelClassName,
  errorClassName,
  hintClassName,
}) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;

  const isControlled = Array.isArray(values);
  const [internal, setInternal] = React.useState<string[]>(defaultValues ?? []);
  const selectedValues = isControlled ? values ?? [] : internal;
  const selectedOptions = React.useMemo(
    () => options.filter((o) => selectedValues.includes(o.value)),
    [options, selectedValues]
  );

  const [open, setOpen] = React.useState(false);
  const rootRef = useOutside(() => setOpen(false));

  function toggle(value: string) {
    setOpen(true);
    const next = new Set(selectedValues);
    next.has(value) ? next.delete(value) : next.add(value);
    const result = Array.from(next);
    if (!isControlled) setInternal(result);
    onChange?.(result);
  }

  function onKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement | HTMLDivElement>
  ) {
    switch (e.key) {
      case " ":
      case "Enter":
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      labelClassName={labelClassName}
      errorClassName={errorClassName}
      hintClassName={hintClassName}
    >
      <div ref={rootRef} className="relative">
        <button
          id={fieldId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${fieldId}-listbox`}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full text-left",
            tokens.radius,
            "border bg-[hsl(var(--card))]",
            "border-[hsl(var(--border))]",
            "text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-muted))]",
            "px-3 py-2 pr-9",
            "cursor-pointer",
            tokens.focusInput,
            tokens.disabled,
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {selectedOptions.length === 0 && (
              <span className="text-[hsl(var(--fg-muted))]">{placeholder}</span>
            )}
            {selectedOptions.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 rounded-lg bg-black/5 px-2 py-1 text-xs text-[hsl(var(--fg))]"
              >
                {o.label}
              </span>
            ))}
          </div>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-block">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M5.5 7.5l4.5 5 4.5-5H5.5z"
                fill="currentColor"
                className="text-[hsl(var(--fg-muted))]"
              />
            </svg>
          </span>
        </button>
        {open && (
          <div
            id={`${fieldId}-listbox`}
            role="listbox"
            aria-multiselectable="true"
            tabIndex={-1}
            className={cn(
              "absolute z-50 mt-2 w-full overflow-hidden",
              tokens.radius,
              "border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg",
              "max-h-64 overflow-y-auto",
              menuClassName
            )}
            onKeyDown={onKeyDown}
          >
            {options.map((o) => {
              const isSelected = selectedValues.includes(o.value);
              return (
                <div
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={o.disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !o.disabled && toggle(o.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                    isSelected &&
                      "bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]",
                    !isSelected && "hover:bg-black/5",
                    o.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={isSelected}
                    className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--color-primary))]"
                  />
                  <span>{o.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

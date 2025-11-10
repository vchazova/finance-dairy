import * as React from "react";
import { tokens } from "@/components/ui/theme/tokens";
import { cn } from "@/components/ui/utils/cn";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";

export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectProps = FieldProps & {
  options: SelectOption[];
  value?: string; // controlled
  defaultValue?: string; // uncontrolled
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  menuClassName?: string;
};

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

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Выберите…",
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

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string | undefined>(
    defaultValue
  );
  const selected = isControlled ? value : internal;

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const rootRef = useOutside(() => setOpen(false));

  const currentLabel = React.useMemo(
    () => options.find((o) => o.value === selected)?.label,
    [options, selected]
  );

  function commit(val: string) {
    if (!isControlled) setInternal(val);
    onChange?.(val);
    setOpen(false);
  }

  function onKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement | HTMLDivElement>
  ) {
    const enabled = options.filter((o) => !o.disabled);
    const enabledIndexes = options
      .map((o, i) => (!o.disabled ? i : -1))
      .filter((i) => i !== -1);
    const currentIdx =
      activeIndex >= 0
        ? activeIndex
        : selected
        ? options.findIndex((o) => o.value === selected)
        : -1;

    switch (e.key) {
      case " ":
      case "Enter":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setActiveIndex(
            currentIdx >= 0 ? currentIdx : enabledIndexes[0] ?? -1
          );
        } else if (activeIndex >= 0) {
          const o = options[activeIndex];
          if (o && !o.disabled) commit(o.value);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        {
          const start = currentIdx >= 0 ? currentIdx : -1;
          let next = start;
          for (let i = 0; i < options.length; i++) {
            next = (next + 1) % options.length;
            if (!options[next].disabled) {
              setActiveIndex(next);
              break;
            }
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        {
          const start = currentIdx >= 0 ? currentIdx : 0;
          let prev = start;
          for (let i = 0; i < options.length; i++) {
            prev = (prev - 1 + options.length) % options.length;
            if (!options[prev].disabled) {
              setActiveIndex(prev);
              break;
            }
          }
        }
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(enabledIndexes[0] ?? -1);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1);
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
        {/* Trigger */}
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
          <span className={cn(!currentLabel && "text-[hsl(var(--fg-muted))]")}>
            {currentLabel ?? placeholder}
          </span>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-block">
            {/* caret */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
            >
              <path
                d="M5.5 7.5l4.5 5 4.5-5H5.5z"
                fill="currentColor"
                className="text-[hsl(var(--fg-muted))]"
              />
            </svg>
          </span>
        </button>
        {/* Dropdown */}
        {open && (
          <div
            id={`${fieldId}-listbox`}
            role="listbox"
            aria-activedescendant={
              activeIndex >= 0 ? `${fieldId}-opt-${activeIndex}` : undefined
            }
            tabIndex={-1}
            className={cn(
              "absolute z-50 mt-2 w-full overflow-hidden",
              tokens.radius,
              "border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg",
              "max-h-64 overflow-y-auto",
              menuClassName
            )}
          >
            {options.map((o, i) => {
              const isSelected = selected === o.value;
              const isActive = activeIndex === i;
              return (
                <div
                  id={`${fieldId}-opt-${i}`}
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={o.disabled}
                  onMouseEnter={() => !o.disabled && setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()} // чтобы не терять фокус до клика
                  onClick={() => !o.disabled && commit(o.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                    isSelected &&
                      "bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]",
                    isActive && !isSelected && "bg-black/5",
                    o.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
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

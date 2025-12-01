import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";
import { FieldWrapper, type FieldProps } from "./FieldWrapper";

const baseInput = cn(
  "w-full",
  tokens.radius,
  "border bg-[hsl(var(--card))]",
  "border-[hsl(var(--border))]",
  "text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-muted))]",
  "px-3 py-2",
  tokens.focusInput,
  tokens.disabled
);

type CalendarDate = Date | null;

function formatDateISO(d: Date | null | undefined) {
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function parseISO(value?: string): CalendarDate {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

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

export type DatePickerProps = FieldProps & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  id?: string;
  className?: string;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  className,
  label,
  error,
  hint,
  labelClassName,
  errorClassName,
  hintClassName,
  id,
  value,
  defaultValue,
  onChange,
  disabled,
  min,
  max,
  placeholder = "Select date",
}) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string | undefined>(
    defaultValue
  );
  const currentValue = isControlled ? value : internal;
  const parsed = parseISO(currentValue);

  const [open, setOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState<Date>(() => {
    return parsed ?? new Date();
  });
  const rootRef = useOutside(() => setOpen(false));

  const days = React.useMemo(() => {
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const startOffset = (start.getDay() + 6) % 7; // Monday-first
    const total = startOffset + end.getDate();
    const grid: Array<Date | null> = [];
    for (let i = 0; i < total; i++) {
      const dayNum = i - startOffset + 1;
      grid.push(dayNum > 0 && dayNum <= end.getDate() ? new Date(viewMonth.getFullYear(), viewMonth.getMonth(), dayNum) : null);
    }
    return grid;
  }, [viewMonth]);

  const setValue = (val: string) => {
    if (!isControlled) setInternal(val);
    onChange?.(val);
  };

  const handleSelect = (day: Date | null) => {
    if (!day) return;
    const iso = formatDateISO(day);
    setValue(iso);
    setOpen(false);
  };

  function nextMonth(delta: number) {
    setViewMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + delta);
      return d;
    });
  }

  const monthLabel = viewMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

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
          type="button"
          id={fieldId}
          className={cn(
            baseInput,
            "rounded-2xl text-left flex items-center justify-between",
            "cursor-pointer",
            className
          )}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
        >
          <span className={cn(!currentValue && "text-[hsl(var(--fg-muted))]")}>
            {currentValue
              ? new Date(currentValue).toLocaleDateString()
              : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-[hsl(var(--fg-muted))]" />
        </button>

        {open && (
          <div
            className={cn(
              "absolute z-50 mt-2 w-full min-w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg",
              "p-3 space-y-3"
            )}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-full p-1 hover:bg-black/5"
                onClick={() => nextMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-sm font-medium capitalize">{monthLabel}</div>
              <button
                type="button"
                className="rounded-full p-1 hover:bg-black/5"
                onClick={() => nextMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-[hsl(var(--fg-muted))]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const iso = formatDateISO(day ?? undefined);
                const selected = iso && iso === currentValue;
                const inRangeMin = min ? iso && iso < min : false;
                const inRangeMax = max ? iso && iso > max : false;
                const blocked = !day || inRangeMin || inRangeMax;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={blocked}
                    onClick={() => handleSelect(day)}
                    className={cn(
                      "h-9 rounded-xl text-sm transition-colors",
                      "hover:bg-black/5",
                      selected &&
                        "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-fg))] hover:bg-[hsl(var(--color-primary))]/90",
                      blocked &&
                        "opacity-40 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    {day?.getDate() ?? ""}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

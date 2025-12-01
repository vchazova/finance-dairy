import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";
import { FieldWrapper, type FieldProps } from "./FieldWrapper";

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

export type DateRange = { start?: string; end?: string };

export type DateRangePickerProps = FieldProps & {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (value: DateRange) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  startLabel?: string;
  endLabel?: string;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  error,
  hint,
  labelClassName,
  errorClassName,
  hintClassName,
  value,
  defaultValue,
  onChange,
  min,
  max,
  disabled,
  id,
  className,
  startLabel,
  endLabel,
}) => {
  const autoId = React.useId();
  const baseId = id ?? autoId;

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<DateRange>(
    defaultValue ?? { start: undefined, end: undefined }
  );
  const current = isControlled ? value ?? {} : internal;

  const startDate = parseISO(current.start);
  const endDate = parseISO(current.end);

  const [open, setOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState<Date>(() => {
    return startDate ?? new Date();
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

  const setValue = (next: DateRange) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const handleSelect = (day: Date | null) => {
    if (!day) return;
    const iso = formatDateISO(day);
    if (!current.start || current.end) {
      setValue({ start: iso, end: undefined });
    } else if (current.start && !current.end) {
      const start = new Date(current.start);
      if (day < start) {
        setValue({ start: iso, end: formatDateISO(start) });
      } else {
        setValue({ start: current.start, end: iso });
      }
      setOpen(false);
    }
  };

  function nextMonth(delta: number) {
    setViewMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + delta);
      return d;
    });
  }

  const inRange = (day: Date | null) => {
    if (!day || !startDate || !endDate) return false;
    return day >= startDate && day <= endDate;
  };

  const monthLabel = viewMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const startPlaceholder = startLabel ?? "Start";
  const endPlaceholder = endLabel ?? "End";

  return (
    <FieldWrapper
      id={baseId}
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
          className={cn(
            "w-full rounded-2xl border bg-[hsl(var(--card))] px-3 py-2 text-left",
            "border-[hsl(var(--border))] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-muted))]",
            "flex items-center justify-between gap-2",
            tokens.focusInput,
            tokens.disabled,
            className
          )}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
        >
          <span className={cn(!current.start && "text-[hsl(var(--fg-muted))]")}>
            {current.start
              ? `${new Date(current.start).toLocaleDateString()}`
              : startPlaceholder}
          </span>
          <span className="text-[hsl(var(--fg-muted))]">—</span>
          <span className={cn(!current.end && "text-[hsl(var(--fg-muted))]")}>
            {current.end
              ? `${new Date(current.end).toLocaleDateString()}`
              : endPlaceholder}
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
                const isStart = iso && iso === current.start;
                const isEnd = iso && iso === current.end;
                const inRangeMid = inRange(day) && !isStart && !isEnd;
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
                      "relative h-9 rounded-xl text-sm transition-colors",
                      "hover:bg-black/5",
                      inRangeMid && "bg-[hsl(var(--color-primary))]/10",
                      isStart &&
                        "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-fg))] hover:bg-[hsl(var(--color-primary))]/90",
                      isEnd &&
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

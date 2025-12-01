import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  description?: string;
  error?: string;
};

export const Switch: React.FC<SwitchProps> = ({
  label,
  description,
  error,
  className,
  id,
  disabled,
  ...props
}) => {
  const autoId = React.useId();
  const inputId = id ?? autoId;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className={cn("peer sr-only", className)}
          disabled={disabled}
          aria-invalid={!!error}
          {...props}
        />
        <span
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-black/10 transition-colors duration-200",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[hsl(var(--color-primary))]/40 peer-focus-visible:ring-offset-2",
            "peer-checked:bg-[hsl(var(--color-primary))]",
            "peer-disabled:opacity-60 peer-disabled:cursor-not-allowed",
            "before:absolute before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:shadow before:transition-transform before:duration-200 before:translate-x-0",
            "peer-checked:before:translate-x-5"
          )}
          aria-hidden
        />
        <div className="space-y-1">
          {label && (
            <span className="text-sm font-medium text-[hsl(var(--fg))]">
              {label}
            </span>
          )}
          {description && (
            <p className="text-sm text-[hsl(var(--fg-muted))]">{description}</p>
          )}
        </div>
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

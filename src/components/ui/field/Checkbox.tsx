import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  description?: string;
  error?: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  error,
  className,
  id,
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
          className={cn(
            "mt-1 h-4 w-4 cursor-pointer rounded border-[hsl(var(--border))] text-[hsl(var(--color-primary))]",
            "transition-colors",
            tokens.focusInput,
            tokens.disabled,
            className
          )}
          aria-invalid={!!error}
          {...props}
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

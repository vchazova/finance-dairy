import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type FieldProps = {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  hintClassName?: string;
};

export function FieldWrapper({
  id,
  label,
  error,
  hint,
  children,
  labelClassName,
  errorClassName,
  hintClassName,
}: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "mb-1 block text-sm font-medium text-gray-700",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <div className={cn("mt-1 text-xs text-gray-500", hintClassName)}>
          {hint}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className={cn("mt-1 text-xs text-red-600", errorClassName)}
        >
          {error}
        </div>
      )}
    </div>
  );
}

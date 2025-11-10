import * as React from "react";
import { tokens } from "@/components/ui/theme/tokens";
import { cn } from "@/components/ui/utils/cn";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";

const fieldBase = cn(
  "w-full",
  tokens.radius,
  "border bg-[hsl(var(--card))]",
  "border-[hsl(var(--border))]",
  "text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-muted))]",
  "px-3 py-2",
  tokens.focus,
  tokens.disabled
);

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  FieldProps;

export const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  hint,
  labelClassName,
  errorClassName,
  hintClassName,
  id,
  ...props
}) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
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
      <input
        id={fieldId}
        className={cn(
          "rounded-2xl",
          fieldBase,
          error && "border-red-500 focus:ring-red-600",
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
    </FieldWrapper>
  );
};

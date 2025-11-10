import * as React from "react";
import { tokens } from "@/components/ui/theme/tokens";
import { cn } from "@/components/ui/utils/cn";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";
const fieldBaseTA = cn(
  "w-full",
  tokens.radius,
  "border bg-[hsl(var(--card))]",
  "border-[hsl(var(--border))]",
  "text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-muted))]",
  "px-3 py-2",
  tokens.focus,
  tokens.disabled
);

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldProps;

export const TextArea: React.FC<TextAreaProps> = ({
  className,
  label,
  error,
  hint,
  labelClassName,
  errorClassName,
  hintClassName,
  id,
  rows = 4,
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
      <textarea
        id={fieldId}
        rows={rows}
        className={cn(
          "rounded-2xl",
          fieldBaseTA,
          "min-h-[2.75rem]",
          error && "border-red-500 focus:ring-red-600",
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
    </FieldWrapper>
  );
};

import * as React from "react";
import { tokens } from "@/components/ui/theme/tokens";
import { cn } from "@/components/ui/utils/cn";
import {
  FieldWrapper,
  type FieldProps,
} from "@/components/ui/field/FieldWrapper";

export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> &
  FieldProps & { options?: SelectOption[] };

const selectBase = cn(
  "w-full",
  tokens.radius,
  "border bg-[hsl(var(--card))]",
  "border-[hsl(var(--border))]",
  "text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-muted))]",
  "px-3 py-2 pr-8",
  tokens.focus,
  tokens.disabled
);

export const Select: React.FC<SelectProps> = ({
  className,
  label,
  error,
  hint,
  labelClassName,
  errorClassName,
  hintClassName,
  id,
  options = [],
  children,
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
      <select
        id={fieldId}
        className={cn(
          "rounded-2xl",
          selectBase,
          "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path fill='%23666' d='M5.5 7.5l4.5 5 4.5-5H5.5z'/></svg>')] bg-[length:1rem_1rem] bg-no-repeat bg-[right_0.5rem_center]",
          error && "border-red-500 focus:ring-red-600",
          className
        )}
        aria-invalid={!!error}
        {...props}
      >
        {options.length > 0
          ? options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))
          : children}
      </select>
    </FieldWrapper>
  );
};

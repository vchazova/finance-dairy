import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { Input, type InputProps } from "./Input";

export type NumberInputProps = Omit<
  InputProps,
  "type" | "inputMode" | "pattern"
> & {
  allowNegative?: boolean;
};

export const NumberInput: React.FC<NumberInputProps> = ({
  className,
  allowNegative,
  min,
  step = "0.01",
  inputMode,
  pattern,
  ...props
}) => {
  const resolvedMin = min ?? (allowNegative ? undefined : 0);
  return (
    <Input
      type="number"
      inputMode={inputMode ?? "decimal"}
      pattern={pattern ?? "[0-9]*"}
      step={step}
      min={resolvedMin}
      className={cn("appearance-none", className)}
      {...props}
    />
  );
};

import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

const variants = {
  neutral: "bg-black/5 text-[hsl(var(--fg))]",
  primary:
    "bg-[hsl(var(--color-primary))]/15 text-[hsl(var(--color-primary))]",
  success:
    "bg-[hsl(var(--color-success))]/15 text-[hsl(var(--color-success))]",
  warning:
    "bg-[hsl(var(--color-warning))]/15 text-[hsl(var(--color-warning))]",
  danger: "bg-[hsl(var(--color-danger))]/15 text-[hsl(var(--color-danger))]",
} as const;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

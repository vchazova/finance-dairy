import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "default" | "ghost"; // ghost = без рамок
  size?: "sm" | "md" | "lg";
  block?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "default",
  size = "md",
  block,
  ...props
}) => {
  const base = cn(
    "inline-flex items-center justify-center whitespace-nowrap select-none cursor-pointer",
    tokens.radius,
    tokens.shadow,
    tokens.focusButton,
    tokens.disabled
  );

  const byVariant = {
    primary:
      "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-fg))] hover:brightness-95 active:brightness-90",
    default:
      "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border border-[hsl(var(--border))] hover:bg-black/5 active:bg-black/10",
    ghost: "bg-transparent text-[hsl(var(--fg))] hover:bg-black/5",
  } as const;

  const bySize = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-5 text-base",
  } as const;

  return (
    <button
      className={cn(
        base,
        byVariant[variant],
        bySize[size],
        block && "w-full",
        className
      )}
      {...props}
    />
  );
};

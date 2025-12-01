import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";
import type { ButtonVariant } from "./Button";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  variant = "ghost",
  size = "md",
  fullWidth,
  disabled,
  children,
  ...props
}) => {
  const byVariant: Record<ButtonVariant, string> = {
    primary:
      "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-fg))] hover:brightness-95 active:brightness-90",
    secondary:
      "bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-fg))] hover:brightness-95 active:brightness-90",
    default:
      "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border border-[hsl(var(--border))] hover:bg-black/5 active:bg-black/10",
    ghost:
      "bg-transparent text-[hsl(var(--fg))] border border-transparent hover:bg-black/5",
    danger:
      "border border-red-200 text-red-600 bg-[hsl(var(--bg))] hover:bg-red-50 active:bg-red-100",
    link: "bg-transparent text-[hsl(var(--color-primary))] shadow-none hover:underline px-0",
  };

  const bySize = {
    sm: "h-9 w-9 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-base",
  } as const;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center select-none transition-colors",
        tokens.radius,
        tokens.shadow,
        tokens.focusButton,
        tokens.disabled,
        byVariant[variant],
        bySize[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

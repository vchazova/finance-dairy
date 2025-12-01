import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "link"
  | "default";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  block?: boolean; // backward compat
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  block,
  loading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}) => {
  const base = cn(
    "inline-flex items-center justify-center whitespace-nowrap select-none cursor-pointer gap-2 font-medium transition-colors",
    tokens.radius,
    tokens.shadow,
    tokens.focusButton,
    tokens.disabled
  );

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
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-5 text-base",
  } as const;

  const isFullWidth = fullWidth ?? block;
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        base,
        byVariant[variant],
        bySize[size],
        isFullWidth && "w-full",
        loading && "cursor-wait",
        className
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span
          className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
          aria-hidden
        />
      )}
      {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
      <span
        className={cn(loading && "opacity-80")}
        style={{
          display: "inherit",
          flexDirection: "inherit",
          alignItems: "inherit",
          justifyContent: "inherit",
          gap: "inherit",
          textAlign: "inherit",
        }}
      >
        {children}
      </span>
      {rightIcon && (
        <span className="inline-flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};

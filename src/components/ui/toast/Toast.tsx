"use client";
import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  onDismiss?: () => void;
};

const variantMap = {
  default: "border-[hsl(var(--border))]",
  success: "border-[hsl(var(--color-success))]/60",
  warning: "border-[hsl(var(--color-warning))]/60",
  danger: "border-[hsl(var(--color-danger))]/60",
} as const;

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  action,
  onDismiss,
  variant = "default",
}) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border bg-[hsl(var(--card))] px-4 py-3 shadow-lg",
        tokens.shadow,
        variantMap[variant]
      )}
    >
      <div className="flex-1">
        <div className="text-sm font-semibold text-[hsl(var(--fg))]">
          {title}
        </div>
        {description && (
          <p className="text-sm text-[hsl(var(--fg-muted))]">{description}</p>
        )}
      </div>
      {action}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))]"
          aria-label="Dismiss toast"
        >
          ×
        </button>
      )}
    </div>
  );
};

export type ToastContainerProps = {
  toasts: ToastProps[];
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
};

const positionMap: Record<
  NonNullable<ToastContainerProps["position"]>,
  string
> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = "top-right",
}) => {
  return (
    <div className={cn("fixed z-50 flex flex-col gap-2", positionMap[position])}>
      {toasts.map((toast) => (
        <Toast key={toast.id ?? toast.title} {...toast} />
      ))}
    </div>
  );
};

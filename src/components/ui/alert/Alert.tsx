import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

const variants = {
  info: {
    bg: "bg-[hsl(var(--color-info))]/10",
    text: "text-[hsl(var(--color-info))]",
  },
  success: {
    bg: "bg-[hsl(var(--color-success))]/10",
    text: "text-[hsl(var(--color-success))]",
  },
  warning: {
    bg: "bg-[hsl(var(--color-warning))]/10",
    text: "text-[hsl(var(--color-warning))]",
  },
  danger: {
    bg: "bg-[hsl(var(--color-danger))]/10",
    text: "text-[hsl(var(--color-danger))]",
  },
} as const;

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  description,
  action,
  className,
  children,
  ...props
}) => {
  const styles = variants[variant];
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-[hsl(var(--border))] p-4",
        styles.bg,
        className
      )}
      role="alert"
      {...props}
    >
      {title && (
        <div className={cn("text-sm font-semibold", styles.text)}>{title}</div>
      )}
      {description && (
        <p className="text-sm text-[hsl(var(--fg))]">{description}</p>
      )}
      {children}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

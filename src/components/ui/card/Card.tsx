import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: "sm" | "md" | "lg";
};

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export const Card: React.FC<CardProps> = ({
  className,
  title,
  description,
  footer,
  padding = "md",
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
        tokens.radius,
        tokens.shadow,
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-base font-semibold text-[hsl(var(--fg))]">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-[hsl(var(--fg-muted))]">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="flex-1">{children}</div>
      {footer && (
        <div className="pt-4 border-t border-[hsl(var(--border))]">{footer}</div>
      )}
    </div>
  );
};

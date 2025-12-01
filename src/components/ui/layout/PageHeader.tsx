import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
}) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-4",
      className
    )}
  >
    {(title || description) && (
      <div>
        {title && (
          <div className="text-2xl font-semibold text-[hsl(var(--fg))]">
            {title}
          </div>
        )}
        {description && (
          <p className="text-sm text-[hsl(var(--fg-muted))]">{description}</p>
        )}
      </div>
    )}
    {actions && (
      <div className="flex flex-wrap items-center gap-3">{actions}</div>
    )}
  </div>
);

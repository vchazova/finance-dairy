import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type WorkspaceLayoutProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  tabs?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  title,
  description,
  tabs,
  actions,
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold text-[hsl(var(--fg))]">
              {title}
            </div>
            {description && (
              <p className="text-sm text-[hsl(var(--fg-muted))]">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {tabs && <div className="mt-4">{tabs}</div>}
      </div>
      {children}
    </div>
  );
};

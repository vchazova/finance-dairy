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
  const titleIsPrimitive = typeof title === "string" || typeof title === "number";
  const descriptionValue =
    typeof description === "string" ? (description.trim().length > 0 ? description : null) : description ?? null;
  const descriptionIsPrimitive = typeof descriptionValue === "string" || typeof descriptionValue === "number";

  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div
              className={cn(
                titleIsPrimitive ? "text-xl font-semibold text-[hsl(var(--fg))]" : undefined
              )}
            >
              {title}
            </div>
            {descriptionValue !== null && (
              <div
                className={cn(
                  "mt-1",
                  descriptionIsPrimitive ? "text-sm text-[hsl(var(--fg-muted))]" : undefined
                )}
              >
                {descriptionValue}
              </div>
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

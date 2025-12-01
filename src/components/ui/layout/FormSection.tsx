import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type FormSectionProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <section
    className={cn(
      "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6",
      className
    )}
  >
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-[hsl(var(--fg))]">{title}</h3>
      {description && (
        <p className="text-sm text-[hsl(var(--fg-muted))]">{description}</p>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

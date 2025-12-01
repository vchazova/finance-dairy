import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type AppLayoutProps = {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  header,
  children,
  className,
  fullHeight = true,
}) => {
  return (
    <div
      className={cn(
        "bg-[hsl(var(--bg))] flex flex-col",
        fullHeight && "min-h-screen",
        className
      )}
    >
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {header}
        </div>
      </header>
      <main
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8",
          fullHeight && "justify-center"
        )}
      >
        {children}
      </main>
    </div>
  );
};

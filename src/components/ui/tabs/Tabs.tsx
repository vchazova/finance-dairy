import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

type TabsContextValue = {
  value: string | undefined;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs subcomponents must be used within <Tabs>");
  }
  return ctx;
}

export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

export function Tabs({
  value,
  defaultValue,
  onChange,
  className,
  children,
}: TabsProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const currentValue = isControlled ? value : internal;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export const TabsList: React.FC<TabsListProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "inline-flex w-full flex-wrap items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1",
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const { value: current, setValue } = useTabsContext();
  const isActive = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={cn(
        "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
        tokens.focusButton,
        isActive
          ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-fg))]"
          : "text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))]"
        ,
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const { value: current } = useTabsContext();
  if (current !== value) return null;
  return (
    <div className={cn("rounded-2xl border border-[hsl(var(--border))] p-4", className)} {...props}>
      {children}
    </div>
  );
};

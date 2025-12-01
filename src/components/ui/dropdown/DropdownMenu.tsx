"use client";
import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown components must be inside <DropdownMenu>");
  return ctx;
}

function useOutside(handler: () => void) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target))
        handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);
  return ref;
}

export type DropdownMenuProps = { children: React.ReactNode };

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const ref = useOutside(() => setOpen(false));
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export type DropdownMenuTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  className,
  ...props
}) => {
  const { open, setOpen } = useDropdownContext();
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm",
        tokens.focusButton,
        className
      )}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  );
};

export type DropdownMenuContentProps =
  React.HTMLAttributes<HTMLDivElement>;

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  className,
  children,
  ...props
}) => {
  const { open } = useDropdownContext();
  if (!open) return null;
  return (
    <div
      role="menu"
      className={cn(
        "absolute right-0 z-50 mt-2 min-w-[180px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export type DropdownMenuItemProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  className,
  children,
  ...props
}) => {
  const { setOpen } = useDropdownContext();
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center justify-between px-4 py-2 text-sm text-left text-[hsl(var(--fg))] hover:bg-black/5",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

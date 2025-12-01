"use client";
import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<
    HTMLButtonElement | HTMLSpanElement | null
  >;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be within <Tooltip>");
  return ctx;
}

export type TooltipProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export const Tooltip: React.FC<TooltipProps> = ({ children, defaultOpen }) => {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const triggerRef =
    React.useRef<HTMLButtonElement | HTMLSpanElement | null>(null);

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef }}>
      <span className="relative inline-block">{children}</span>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
> = ({ children, asChild, ...props }) => {
  const { setOpen, triggerRef } = useTooltipContext();
  const child = React.Children.only(children);

  const triggerProps = {
    ref: triggerRef as React.Ref<any>,
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    ...props,
  };

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child as React.ReactElement, triggerProps);
  }

  return (
    <span tabIndex={0} {...triggerProps}>
      {children}
    </span>
  );
};

export const TooltipContent: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className, children, ...props }) => {
  const { open } = useTooltipContext();
  if (!open) return null;
  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-40 mt-2 min-w-[160px] rounded-xl bg-black/90 px-3 py-2 text-xs text-white shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

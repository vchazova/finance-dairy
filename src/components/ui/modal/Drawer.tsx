"use client";
import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";
import { H2 } from "@/components/ui/typography";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg";
  className?: string;
};

const widthMap = {
  sm: "w-full max-w-sm",
  md: "w-full max-w-md",
  lg: "w-full max-w-lg",
} as const;

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  width = "md",
  className,
}) => {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={onOverlayClick}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "h-full border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl",
          tokens.radius,
          "flex flex-col",
          widthMap[width],
          className
        )}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
            {title && <H2 className="text-[hsl(var(--fg))]">{title}</H2>}
            <button
              type="button"
              className="rounded-full p-2 text-[hsl(var(--fg-muted))] hover:bg-black/5"
              onClick={onClose}
              aria-label="Close drawer"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-[hsl(var(--border))] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

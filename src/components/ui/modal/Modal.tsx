"use client";
import * as React from "react";
import { H2 } from "@/components/ui/typography";
import { tokens } from "@/components/ui/theme/tokens";
import { cn } from "@/components/ui/utils/cn";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={cn(
          "mx-4 w-full max-w-lg bg-white",
          tokens.radius,
          tokens.shadow,
          "border border-gray-200",
          className
        )}
      >
        {title && (
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <H2 className="text-gray-900">{title}</H2>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-gray-100">{footer}</div>
        )}
      </div>
    </div>
  );
};

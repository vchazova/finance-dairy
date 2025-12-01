import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onChange?: (page: number) => void;
  className?: string;
};

function getPages(current: number, total: number) {
  const pages: Array<number | string> = [];
  const maxVisible = 5;
  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onChange,
  className,
}) => {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const pages = getPages(page, totalPages);

  function go(next: number) {
    if (next < 1 || next > totalPages || next === page) return;
    onChange?.(next);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-[hsl(var(--fg))]",
        className
      )}
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={!canPrev}
        className={cn(
          "rounded-xl border border-[hsl(var(--border))] px-3 py-1",
          tokens.focusButton,
          tokens.disabled
        )}
      >
        Prev
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              type="button"
              key={p}
              onClick={() => go(p)}
              className={cn(
                "h-8 w-8 rounded-xl text-sm font-medium transition-colors",
                tokens.focusButton,
                p === page
                  ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-fg))]"
                  : "text-[hsl(var(--fg))] hover:bg-black/5"
              )}
            >
              {p}
            </button>
          ) : (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-[hsl(var(--fg-muted))]"
            >
              …
            </span>
          )
        )}
      </div>
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={!canNext}
        className={cn(
          "rounded-xl border border-[hsl(var(--border))] px-3 py-1",
          tokens.focusButton,
          tokens.disabled
        )}
      >
        Next
      </button>
    </div>
  );
};

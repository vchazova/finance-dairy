import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
  thickness?: "thin" | "normal";
};

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  size = "md",
  thickness = "thin",
  ...props
}) => {
  return (
    <div
      className={cn(
        "inline-flex animate-spin rounded-full border-t-transparent border-[hsl(var(--color-primary))]",
        sizeMap[size],
        thickness === "thin" ? "border-2" : "border-[3px]",
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading</span>
    </div>
  );
};

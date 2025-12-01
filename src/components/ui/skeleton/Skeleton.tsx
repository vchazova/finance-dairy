import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  rounded?: "md" | "lg" | "full";
};

const roundedMap = {
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
} as const;

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  rounded = "lg",
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-[hsl(var(--border))]",
        roundedMap[rounded],
        className
      )}
      {...props}
    />
  );
};

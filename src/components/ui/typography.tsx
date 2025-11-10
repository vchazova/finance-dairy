import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export const H1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h1
    className={cn(
      "text-3xl md:text-4xl font-semibold tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
);

export const H2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2
    className={cn(
      "text-2xl md:text-3xl font-semibold tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
);

export const Text: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn("text-base leading-relaxed text-gray-700", className)}
    {...props}
  />
);

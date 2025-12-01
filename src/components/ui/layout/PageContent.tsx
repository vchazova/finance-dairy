import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type PageContentProps = React.HTMLAttributes<HTMLDivElement>;

export const PageContent: React.FC<PageContentProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn("mx-auto w-full max-w-5xl space-y-6 py-6", className)}
    {...props}
  />
);

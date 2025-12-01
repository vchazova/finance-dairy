import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

export type SplitPaneProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: string;
  className?: string;
};

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  ratio = "1fr 2fr",
  className,
}) => (
  <div
    className={cn(
      "grid gap-6",
      className
    )}
    style={{ gridTemplateColumns: ratio }}
  >
    <div>{left}</div>
    <div>{right}</div>
  </div>
);

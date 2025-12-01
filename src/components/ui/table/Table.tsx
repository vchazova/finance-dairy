import * as React from "react";
import { cn } from "@/components/ui/utils/cn";
import { tokens } from "@/components/ui/theme/tokens";

export type TableProps = React.HTMLAttributes<HTMLTableElement>;

export const Table: React.FC<TableProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
      )}
    >
      <table
        className={cn("w-full border-collapse text-sm text-[hsl(var(--fg))]", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader: React.FC<TableHeaderProps> = ({
  className,
  children,
  ...props
}) => (
  <thead className={cn("bg-black/5 text-xs uppercase text-[hsl(var(--fg-muted))]", className)} {...props}>
    {children}
  </thead>
);

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export const TableRow: React.FC<TableRowProps> = ({
  className,
  children,
  ...props
}) => (
  <tr
    className={cn(
      "border-b border-[hsl(var(--border))] last:border-none hover:bg-black/3",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  header?: boolean;
};

export const TableCell: React.FC<TableCellProps> = ({
  className,
  children,
  header,
  ...props
}) =>
  header ? (
    <th className={cn("px-4 py-3 text-left font-medium", className)} {...props}>
      {children}
    </th>
  ) : (
    <td className={cn("px-4 py-3 align-middle", className)} {...props}>
      {children}
    </td>
  );

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableBody: React.FC<TableBodyProps> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={cn("bg-[hsl(var(--card))]", className)} {...props}>
    {children}
  </tbody>
);

export type TableEmptyStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  title = "Nothing here yet",
  description = "Try adjusting filters or add a new item.",
  action,
}) => (
  <div className="flex flex-col items-center gap-2 py-10 text-center text-[hsl(var(--fg-muted))]">
    <div className="text-base font-medium text-[hsl(var(--fg))]">{title}</div>
    <p className="text-sm">{description}</p>
    {action}
  </div>
);

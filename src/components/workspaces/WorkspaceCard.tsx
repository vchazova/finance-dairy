import Link from "next/link";
import type { WorkspaceListItem } from "@/types/workspaces";

export default function WorkspaceCard({
  workspace,
}: {
  workspace: WorkspaceListItem;
}) {
  const href = workspace.slug
    ? `/workspaces/${workspace.slug}`
    : `/workspaces/${workspace.id}`;
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h2 className="line-clamp-2 text-lg font-medium leading-tight group-hover:underline">
          {workspace.name}
        </h2>
      </div>
      <div className="text-sm text-[hsl(var(--fg-muted))]">
        Ваша роль:{" "}
        <span className="font-medium text-[hsl(var(--fg))]">
          {workspace.role}
        </span>
      </div>
    </Link>
  );
}

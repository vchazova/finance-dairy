import Link from "next/link";
import type { WorkspaceListItem } from "@/types/workspaces";

export default function WorkspaceCard({
  workspace,
}: {
  workspace: WorkspaceListItem;
}) {
  const workspacePath = workspace.slug?.trim() || workspace.id;
  const href = `/${workspacePath}`;
  const description =
    workspace.description?.trim() || "Описание пока не указано.";
  const createdAtFormatted = formatWorkspaceCreatedAt(workspace.createdAt);
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
      <p className="mb-3 text-sm text-[hsl(var(--fg-muted))] line-clamp-2">
        {description}
      </p>
      {createdAtFormatted && (
        <p className="mb-4 text-xs text-[hsl(var(--fg-muted))]">
          created at {createdAtFormatted}
        </p>
      )}
      <div className="text-sm text-[hsl(var(--fg-muted))]">
        Ваша роль:{" "}
        <span className="font-medium text-[hsl(var(--fg))]">
          {workspace.role}
        </span>
      </div>
    </Link>
  );
}

function formatWorkspaceCreatedAt(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

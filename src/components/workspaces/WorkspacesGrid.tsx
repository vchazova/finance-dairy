import WorkspaceCard from "@/components/workspaces/WorkspaceCard";
import type { WorkspaceListItem } from "@/types/workspaces";

export default function WorkspacesGrid({
  items,
}: {
  items: WorkspaceListItem[];
}) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-[hsl(var(--fg-muted))]">
        У вас пока нет пространств. Создайте первое, чтобы начать вести
        транзакции.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((ws) => (
        <WorkspaceCard key={ws.id} workspace={ws} />
      ))}
    </div>
  );
}

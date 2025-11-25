import type {
  WorkspacesRepo,
  CreateWorkspaceInput,
  CreateWorkspaceResult,
} from "@/data/workspaces/workspaces.repo";
import type { WorkspaceListItem } from "@/types/workspaces";
import { store } from "@/mocks/store";

export const workspacesRepo: WorkspacesRepo = {
  async listForUser(userId: string): Promise<WorkspaceListItem[]> {
    const memberships = store.getMembers().filter((m) => m.user_id === userId);
    if (memberships.length === 0) return [];

    const workspacesIndex = new Map(
      store.getWorkspaces().map((w) => [w.id, w])
    );

    const items: WorkspaceListItem[] = memberships
      .map((m) => {
        const ws = workspacesIndex.get(m.workspace_id);
        if (!ws) return null;
        return {
          id: String(ws.id),
          name: ws.name,
          role: m.role,
        } as WorkspaceListItem;
      })
      .filter((x): x is WorkspaceListItem => Boolean(x));

    // Optional: deterministic order
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  },

  async create(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult> {
    const name = (input.name ?? "").trim();
    if (name.length < 2)
      return { ok: false, message: "Name must be at least 2 characters" };

    const ws = store.addWorkspace({ name, admin_user_id: input.userId });
    store.addMember({
      user_id: input.userId,
      workspace_id: ws.id,
      role: "owner",
    });

    return { ok: true, id: String(ws.id) };
  },

  async update(): Promise<{ ok: true } | { ok: false; message: string }> {
    return { ok: true };
  },

  async remove(): Promise<{ ok: true } | { ok: false; message: string }> {
    return { ok: true };
  },
};

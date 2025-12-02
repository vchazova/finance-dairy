import type {
  WorkspacesRepo,
  CreateWorkspaceInput,
  CreateWorkspaceResult,
  WorkspaceListFilters,
} from "@/data/workspaces/workspaces.repo";
import type { WorkspaceListItem } from "@/types/workspaces";
import { store } from "@/mocks/store";

export const workspacesRepo: WorkspacesRepo = {
  async listForUser(userId: string, filters?: WorkspaceListFilters): Promise<WorkspaceListItem[]> {
    let memberships = store.getMembers().filter((m) => m.user_id === userId);
    if (filters?.role) {
      const role = filters.role.trim();
      if (role) memberships = memberships.filter((m) => m.role === role);
    }
    if (memberships.length === 0) return [];

    const workspacesIndex = new Map(
      store.getWorkspaces().map((w) => [w.id, w])
    );

    let items: WorkspaceListItem[] = memberships
      .map((m) => {
        const ws = workspacesIndex.get(m.workspace_id);
        if (!ws) return null;
        return {
          id: String(ws.id),
          name: ws.name,
          slug: ws.slug,
          description: ws.description ?? null,
          createdAt: ws.created_at,
          role: m.role,
        } as WorkspaceListItem;
      })
      .filter((x): x is WorkspaceListItem => Boolean(x));

    if (filters?.slug) {
      const slug = filters.slug.trim().toLowerCase();
      if (slug) items = items.filter((ws) => ws.slug.toLowerCase() === slug);
    }

    if (filters?.search) {
      const query = filters.search.trim().toLowerCase();
      if (query) {
        items = items.filter((ws) => {
          const name = ws.name.toLowerCase();
          const slug = ws.slug.toLowerCase();
          return name.includes(query) || slug.includes(query);
        });
      }
    }

    // Optional: deterministic order
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  },

  async create(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult> {
    const name = (input.name ?? "").trim();
    if (name.length < 2)
      return { ok: false, message: "Name must be at least 2 characters" };

    const ws = store.addWorkspace({
      name,
      slug: input.slug,
      description: input.description ?? null,
      admin_user_id: input.userId,
    });
    store.addMember({
      user_id: input.userId,
      user_email: input.userEmail,
      workspace_id: ws.id,
      role: "owner",
    });

    return { ok: true, id: String(ws.id), slug: ws.slug };
  },

  async update(): Promise<{ ok: true } | { ok: false; message: string }> {
    return { ok: true };
  },

  async slugExists(slug: string): Promise<boolean> {
    return store.getWorkspaces().some((ws) => ws.slug === slug);
  },

  async remove(): Promise<{ ok: true } | { ok: false; message: string }> {
    return { ok: true };
  },
};

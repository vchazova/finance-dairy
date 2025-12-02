import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase/client";
import type {
  WorkspacesRepo,
  CreateWorkspaceInput,
  CreateWorkspaceResult,
  WorkspaceListFilters,
} from "@/data/workspaces/workspaces.repo";
import type { WorkspaceListItem } from "@/types/workspaces";

function getClient(client?: SupabaseClient) {
  return client ?? defaultClient;
}

function escapeIlikePattern(value: string) {
  return value
    .replace(/[%_]/g, (match) => `\\${match}`)
    .replace(/,/g, " ");
}

export function createWorkspacesSupabaseRepo(client?: SupabaseClient): WorkspacesRepo {
  const supabase = getClient(client);

  return {
    // List workspaces current user belongs to, including role.
    async listForUser(userId: string, filters?: WorkspaceListFilters): Promise<WorkspaceListItem[]> {
      // Avoid nested selects to prevent recursive RLS: first memberships, then workspaces
      let membershipQuery = supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", userId);

      const roleFilter = filters?.role?.trim();
      if (roleFilter) membershipQuery = membershipQuery.eq("role", roleFilter);

      const { data: memberships, error: memErr } = await membershipQuery;

      if (memErr) {
        console.warn("[workspacesRepo] listForUser memberships failed", memErr);
        return [];
      }

      const ids = Array.from(new Set((memberships ?? []).map((m: any) => m.workspace_id)));
      if (ids.length === 0) return [];

      let workspaceQuery = supabase
        .from("workspaces")
        .select("id, name, slug, description, created_at")
        .in("id", ids);

      const slugFilter = filters?.slug?.trim();
      if (slugFilter) workspaceQuery = workspaceQuery.eq("slug", slugFilter);

      const searchFilter = filters?.search?.trim();
      if (searchFilter) {
        const pattern = `%${escapeIlikePattern(searchFilter)}%`;
        workspaceQuery = workspaceQuery.or(`name.ilike.${pattern},slug.ilike.${pattern}`);
      }

      const { data: workspaces, error: wsErr } = await workspaceQuery;
      if (wsErr) {
        console.warn("[workspacesRepo] listForUser workspaces failed", wsErr);
        return [];
      }

      const wsMap = new Map((workspaces ?? []).map((w: any) => [w.id, w]));
      const items = (memberships ?? [])
        .map((m: any) => {
          const ws = wsMap.get(m.workspace_id);
          if (!ws) return null;
          return {
            id: String(ws.id),
            name: ws.name as string,
            slug: ws.slug as string,
            description: (ws.description as string | null) ?? null,
            createdAt: ws.created_at as string,
            role: m.role as string,
          };
        })
        .filter(Boolean) as WorkspaceListItem[];

      return items;
    },

    // Create workspace and owner membership for current user.
    async create(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult> {
      const { data: ws, error: wsErr } = await supabase
        .from("workspaces")
        .insert({
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          admin_user_id: input.userId,
        })
        .select("id, slug")
        .single();

      if (wsErr || !ws) {
        return { ok: false, message: wsErr?.message ?? "Failed to create workspace" };
      }

      const { error: memErr } = await supabase
        .from("workspace_members")
        .insert({ workspace_id: ws.id, user_id: input.userId, role: "owner" });

      if (memErr) {
        return { ok: false, message: memErr.message };
      }

      return { ok: true, id: String(ws.id), slug: ws.slug as string };
    },

    async update(id, payload) {
      const patch: Record<string, any> = {};
      if (payload.name !== undefined) patch.name = payload.name;
      if (payload.slug !== undefined) patch.slug = payload.slug;
      if (payload.description !== undefined) patch.description = payload.description ?? null;
      if (Object.keys(patch).length === 0) return { ok: true } as const;

      const { error } = await supabase.from("workspaces").update(patch).eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },

    async slugExists(slug: string): Promise<boolean> {
      const { data, error } = await supabase
        .from("workspaces")
        .select("id")
        .eq("slug", slug)
        .limit(1);
      if (error) {
        console.warn("[workspacesRepo] slugExists failed", error);
        return true;
      }
      return Boolean(data && data.length > 0);
    },

    async remove(id) {
      const { error } = await supabase.from("workspaces").delete().eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },
  };
}

// Default instance for environments where a global Supabase client is available.
export const workspacesRepo = createWorkspacesSupabaseRepo();

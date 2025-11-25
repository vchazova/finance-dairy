import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase/client";
import type {
  WorkspacesRepo,
  CreateWorkspaceInput,
  CreateWorkspaceResult,
} from "@/data/workspaces/workspaces.repo";
import type { WorkspaceListItem } from "@/types/workspaces";

function getClient(client?: SupabaseClient) {
  return client ?? defaultClient;
}

export function createWorkspacesSupabaseRepo(client?: SupabaseClient): WorkspacesRepo {
  const supabase = getClient(client);

  return {
    // List workspaces current user belongs to, including role.
    async listForUser(userId: string): Promise<WorkspaceListItem[]> {
      // Avoid nested selects to prevent recursive RLS: first memberships, then workspaces
      const { data: memberships, error: memErr } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", userId);

      if (memErr) {
        console.warn("[workspacesRepo] listForUser memberships failed", memErr);
        return [];
      }

      const ids = Array.from(new Set((memberships ?? []).map((m: any) => m.workspace_id)));
      if (ids.length === 0) return [];

      const { data: workspaces, error: wsErr } = await supabase.from("workspaces").select("id, name").in("id", ids);
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
        .insert({ name: input.name, admin_user_id: input.userId })
        .select("id")
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

      return { ok: true, id: String(ws.id) };
    },
  };
}

// Default instance for environments where a global Supabase client is available.
export const workspacesRepo = createWorkspacesSupabaseRepo();

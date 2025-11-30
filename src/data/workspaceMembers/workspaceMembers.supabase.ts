import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase/client";
import type { WorkspaceMembersRepo, WorkspaceMemberInput, WorkspaceMemberListItem } from "@/data/workspaceMembers/workspaceMembers.repo";
import { workspaceMemberRowSchema } from "@/entities/workspaceMembers";

function getClient(client?: SupabaseClient) {
  return client ?? defaultClient;
}

export function createWorkspaceMembersSupabaseRepo(client?: SupabaseClient): WorkspaceMembersRepo {
  const supabase = getClient(client);

  return {
    async list(workspaceId: string | number): Promise<WorkspaceMemberListItem[]> {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", workspaceId);
      if (error) {
        console.warn("[workspaceMembersRepo] list failed", error);
        return [];
      }
      return (data ?? []).map((row) => {
        const parsed = workspaceMemberRowSchema.parse(row);
        return {
          id: String(parsed.id),
          userId: parsed.user_id,
          role: parsed.role,
        };
      });
    },

    async add(input: WorkspaceMemberInput) {
      const payload = {
        workspace_id: input.workspaceId,
        user_id: input.userId,
        role: input.role ?? "member",
      };
      const { data, error } = await supabase.from("workspace_members").insert(payload).select("id").single();
      if (error || !data) return { ok: false, message: error?.message ?? "Failed to add member" } as const;
      return { ok: true, id: String(data.id) } as const;
    },

    async update(id, input) {
      const { error } = await supabase.from("workspace_members").update({ role: input.role }).eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },

    async remove(id: string | number) {
      const { error } = await supabase.from("workspace_members").delete().eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },
  };
}

export const workspaceMembersRepo = createWorkspaceMembersSupabaseRepo();

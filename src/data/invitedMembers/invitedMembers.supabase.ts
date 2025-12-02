import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase/client";
import { invitedMemberRowSchema } from "@/entities/invitedMembers";
import type {
  InvitedMembersRepo,
  WorkspaceInviteListItem,
  CreateInviteInput,
  InviteListFilters,
  UpdateInviteInput,
} from "@/data/invitedMembers/invitedMembers.repo";

function getClient(client?: SupabaseClient) {
  return client ?? defaultClient;
}

function toIso(input?: Date | string | null) {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

export function createInvitedMembersSupabaseRepo(client?: SupabaseClient): InvitedMembersRepo {
  const supabase = getClient(client);

  return {
    async list(workspaceId: string | number, filters?: InviteListFilters): Promise<WorkspaceInviteListItem[]> {
      let query = supabase
        .from("invited_members")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      const statusFilter = filters?.status;
      if (statusFilter) query = query.eq("status", statusFilter);

      const { data, error } = await query;
      if (error) {
        console.warn("[invitedMembersRepo] list failed", error);
        return [];
      }

      return (data ?? []).map((row) => {
        const parsed = invitedMemberRowSchema.parse(row);
        return {
          id: String(parsed.id),
          workspaceId: String(parsed.workspace_id),
          inviterUserId: parsed.inviter_user_id,
          inviteeEmail: parsed.invitee_email,
          inviteeUserId: parsed.invitee_user_id ?? null,
          role: parsed.role,
          status: parsed.status,
          createdAt: parsed.created_at.toISOString(),
          acceptedAt: parsed.accepted_at ? parsed.accepted_at.toISOString() : null,
          expiresAt: parsed.expires_at ? parsed.expires_at.toISOString() : null,
          message: parsed.message ?? null,
        };
      });
    },

    async create(input: CreateInviteInput) {
      const payload = {
        workspace_id: input.workspaceId,
        inviter_user_id: input.inviterUserId,
        invitee_email: input.inviteeEmail,
        role: input.role ?? "member",
        status: "pending",
        expires_at: toIso(input.expiresAt),
        message: input.message ?? null,
      };

      const { data, error } = await supabase
        .from("invited_members")
        .insert(payload)
        .select("*")
        .single();

      if (error || !data) {
        return { ok: false, message: error?.message ?? "Failed to create invite" } as const;
      }

      const parsed = invitedMemberRowSchema.parse(data);
      const invite: WorkspaceInviteListItem = {
        id: String(parsed.id),
        workspaceId: String(parsed.workspace_id),
        inviterUserId: parsed.inviter_user_id,
        inviteeEmail: parsed.invitee_email,
        inviteeUserId: parsed.invitee_user_id ?? null,
        role: parsed.role,
        status: parsed.status,
        createdAt: parsed.created_at.toISOString(),
        acceptedAt: parsed.accepted_at ? parsed.accepted_at.toISOString() : null,
        expiresAt: parsed.expires_at ? parsed.expires_at.toISOString() : null,
        message: parsed.message ?? null,
      };

      return { ok: true, invite } as const;
    },

    async update(id, input) {
      const patch: Record<string, any> = {};
      if (input.status !== undefined) patch.status = input.status;
      if (input.inviteeUserId !== undefined) patch.invitee_user_id = input.inviteeUserId;
      if (input.acceptedAt !== undefined) patch.accepted_at = toIso(input.acceptedAt);
      if (input.expiresAt !== undefined) patch.expires_at = toIso(input.expiresAt);
      if (input.message !== undefined) patch.message = input.message;

      if (Object.keys(patch).length === 0) {
        return { ok: true } as const;
      }

      const { error } = await supabase.from("invited_members").update(patch).eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },

    async remove(id) {
      const { error } = await supabase.from("invited_members").delete().eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },
    async listByInviteeEmail(email, filters) {
      let query = supabase
        .from("invited_members")
        .select("*")
        .eq("invitee_email", email.toLowerCase())
        .order("created_at", { ascending: false });
      const statusFilter = filters?.status;
      if (statusFilter) query = query.eq("status", statusFilter);

      const { data, error } = await query;
      if (error) {
        console.warn("[invitedMembersRepo] listByInviteeEmail failed", error);
        return [];
      }

      return (data ?? []).map((row) => {
        const parsed = invitedMemberRowSchema.parse(row);
        return {
          id: String(parsed.id),
          workspaceId: String(parsed.workspace_id),
          inviterUserId: parsed.inviter_user_id,
          inviteeEmail: parsed.invitee_email,
          inviteeUserId: parsed.invitee_user_id ?? null,
          role: parsed.role,
          status: parsed.status,
          createdAt: parsed.created_at.toISOString(),
          acceptedAt: parsed.accepted_at ? parsed.accepted_at.toISOString() : null,
          expiresAt: parsed.expires_at ? parsed.expires_at.toISOString() : null,
          message: parsed.message ?? null,
        };
      });
    },
    async getById(id) {
      const { data, error } = await supabase.from("invited_members").select("*").eq("id", id).maybeSingle();
      if (error) {
        console.warn("[invitedMembersRepo] getById failed", error);
        return null;
      }
      if (!data) return null;
      const parsed = invitedMemberRowSchema.parse(data);
      return {
        id: String(parsed.id),
        workspaceId: String(parsed.workspace_id),
        inviterUserId: parsed.inviter_user_id,
        inviteeEmail: parsed.invitee_email,
        inviteeUserId: parsed.invitee_user_id ?? null,
        role: parsed.role,
        status: parsed.status,
        createdAt: parsed.created_at.toISOString(),
        acceptedAt: parsed.accepted_at ? parsed.accepted_at.toISOString() : null,
        expiresAt: parsed.expires_at ? parsed.expires_at.toISOString() : null,
        message: parsed.message ?? null,
      };
    },
  };
}

export const invitedMembersRepo = createInvitedMembersSupabaseRepo();

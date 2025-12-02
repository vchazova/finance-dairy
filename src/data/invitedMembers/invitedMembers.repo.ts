import type { InviteStatus } from "@/entities/invitedMembers";
import type { MemberRole } from "@/entities/workspaceMembers";

export type WorkspaceInviteListItem = {
  id: string;
  workspaceId: string;
  inviterUserId: string;
  inviteeEmail: string;
  inviteeUserId: string | null;
  role: MemberRole;
  status: InviteStatus;
  createdAt: string;
  acceptedAt: string | null;
  expiresAt: string | null;
  message: string | null;
};

export type InviteListFilters = {
  status?: InviteStatus;
};

export type CreateInviteInput = {
  workspaceId: string | number;
  inviterUserId: string;
  inviteeEmail: string;
  role?: MemberRole;
  expiresAt?: Date | string | null;
  message?: string | null;
};

export type UpdateInviteInput = {
  status?: InviteStatus;
  inviteeUserId?: string | null;
  acceptedAt?: Date | string | null;
  expiresAt?: Date | string | null;
  message?: string | null;
};

export interface InvitedMembersRepo {
  list(workspaceId: string | number, filters?: InviteListFilters): Promise<WorkspaceInviteListItem[]>;
  create(
    input: CreateInviteInput
  ): Promise<{ ok: true; invite: WorkspaceInviteListItem } | { ok: false; message: string }>;
  update(id: string | number, input: UpdateInviteInput): Promise<{ ok: true } | { ok: false; message: string }>;
  remove(id: string | number): Promise<{ ok: true } | { ok: false; message: string }>;
  listByInviteeEmail(email: string, filters?: InviteListFilters): Promise<WorkspaceInviteListItem[]>;
  getById(id: string | number): Promise<WorkspaceInviteListItem | null>;
}

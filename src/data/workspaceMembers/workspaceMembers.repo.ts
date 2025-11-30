import type { MemberRole } from "@/entities/workspaceMembers";

export type WorkspaceMemberInput = {
  workspaceId: string | number;
  userId: string;
  role?: MemberRole;
};

export type WorkspaceMemberListItem = {
  id: string;
  userId: string;
  role: MemberRole;
};

export interface WorkspaceMembersRepo {
  list(workspaceId: string | number): Promise<WorkspaceMemberListItem[]>;
  add(input: WorkspaceMemberInput): Promise<{ ok: true; id: string } | { ok: false; message: string }>;
  update(
    id: string | number,
    input: { role: MemberRole }
  ): Promise<{ ok: true } | { ok: false; message: string }>;
  remove(id: string | number): Promise<{ ok: true } | { ok: false; message: string }>;
}

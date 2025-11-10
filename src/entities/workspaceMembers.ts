import { z } from "zod";
import { dbId, uuid, dbDate } from "./_shared";

export const MemberRole = ["owner", "member", "viewer"] as const;
export type MemberRole = (typeof MemberRole)[number];

export const workspaceMemberRowSchema = z.object({
  id: dbId,
  created_at: dbDate,
  user_id: uuid,
  workspace_id: dbId,
  role: z.enum(MemberRole),
});

export type WorkspaceMember = z.infer<typeof workspaceMemberRowSchema>;

export const workspaceMemberInsertSchema = z.object({
  user_id: uuid,
  workspace_id: dbId,
  role: z.enum(MemberRole).default("member"),
});
export type WorkspaceMemberInsert = z.infer<typeof workspaceMemberInsertSchema>;

export const workspaceMemberUpdateSchema = z.object({
  role: z.enum(MemberRole),
});
export type WorkspaceMemberUpdate = z.infer<typeof workspaceMemberUpdateSchema>;

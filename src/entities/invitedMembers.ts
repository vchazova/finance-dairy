import { z } from "zod";
import { dbDate, dbId, uuid } from "./_shared";
import { MemberRole } from "./workspaceMembers";

export const InviteStatus = ["pending", "accepted", "cancelled", "expired"] as const;
export type InviteStatus = (typeof InviteStatus)[number];

export const invitedMemberRowSchema = z.object({
  id: dbId,
  created_at: dbDate,
  workspace_id: dbId,
  inviter_user_id: uuid,
  invitee_email: z.string().email(),
  invitee_user_id: uuid.nullable(),
  role: z.enum(MemberRole),
  status: z.enum(InviteStatus),
  accepted_at: z.coerce.date().nullable(),
  expires_at: z.coerce.date().nullable(),
  message: z.string().nullable(),
});

export type InvitedMember = z.infer<typeof invitedMemberRowSchema>;

export const invitedMemberInsertSchema = z.object({
  workspace_id: dbId,
  inviter_user_id: uuid,
  invitee_email: z.string().email(),
  invitee_user_id: uuid.nullable().optional(),
  role: z.enum(MemberRole),
  status: z.enum(InviteStatus),
  accepted_at: z.coerce.date().nullable().optional(),
  expires_at: z.coerce.date().nullable().optional(),
  message: z.string().nullable().optional(),
});

export type InvitedMemberInsert = z.infer<typeof invitedMemberInsertSchema>;

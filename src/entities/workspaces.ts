import { z } from "zod";
import { dbId, uuid, dbDate } from "./_shared";

export const workspaceRowSchema = z.object({
  id: dbId,
  created_at: dbDate,
  name: z.string().min(2).max(80),
  admin_user_id: uuid, // владелец/админ
});
export type Workspace = z.infer<typeof workspaceRowSchema>;

export const workspaceInsertSchema = z.object({
  name: z.string().min(2).max(80),
  admin_user_id: uuid,
});
export type WorkspaceInsert = z.infer<typeof workspaceInsertSchema>;

export const workspaceUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  admin_user_id: uuid.optional(),
});
export type WorkspaceUpdate = z.infer<typeof workspaceUpdateSchema>;

export const workspaceFormSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(80),
});
export type WorkspaceForm = z.infer<typeof workspaceFormSchema>;

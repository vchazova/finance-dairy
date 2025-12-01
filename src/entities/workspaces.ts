import { z } from "zod";
import { dbId, uuid, dbDate } from "./_shared";

const workspaceDescriptionField = z.string().max(280).nullable();
const workspaceFormDescriptionField = z
  .string()
  .trim()
  .max(280, "???????? ?? ?????? ????????? 280 ????????.")
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  });
const workspaceSlugField = z
  .string()
  .trim()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug должен содержать только латинские буквы, цифры и дефисы.");

export const workspaceRowSchema = z.object({
  id: dbId,
  created_at: dbDate,
  name: z.string().min(2).max(80),
  slug: workspaceSlugField,
  description: workspaceDescriptionField,
  admin_user_id: uuid, // ???????????/??????????
});
export type Workspace = z.infer<typeof workspaceRowSchema>;

export const workspaceInsertSchema = z.object({
  name: z.string().min(2).max(80),
  slug: workspaceSlugField,
  description: workspaceDescriptionField.optional(),
  admin_user_id: uuid,
});
export type WorkspaceInsert = z.infer<typeof workspaceInsertSchema>;

export const workspaceUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  slug: workspaceSlugField.optional(),
  description: workspaceDescriptionField.optional(),
  admin_user_id: uuid.optional(),
});
export type WorkspaceUpdate = z.infer<typeof workspaceUpdateSchema>;

export const workspaceFormSchema = z.object({
  name: z.string().trim().min(2, "???????? ?????? ???? ?? ?????? 2 ????????").max(80),
  description: workspaceFormDescriptionField,
});
export type WorkspaceForm = z.infer<typeof workspaceFormSchema>;

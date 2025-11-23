import { z } from "zod";
import { dbId, dbDate, uuid, DecimalString } from "./_shared";

export const transactionRowSchema = z.object({
  id: dbId,
  created_at: dbDate,
  updated_at: dbDate,
  workspace_id: dbId,
  user_id: uuid,
  payment_type_id: dbId,
  category_id: dbId,
  currency_id: dbId,
  amount: DecimalString, // store as string when moving through app boundary
  date: dbDate,
  comment: z.string().nullable().optional(),
  is_decrease: z.boolean(),
});
export type Transaction = z.infer<typeof transactionRowSchema>;

export const transactionInsertSchema = z.object({
  workspace_id: dbId,
  user_id: uuid,
  payment_type_id: dbId,
  category_id: dbId,
  currency_id: dbId,
  amount: DecimalString,
  date: dbDate,
  comment: z.string().nullable().optional(),
  is_decrease: z.boolean().default(true),
});
export type TransactionInsert = z.infer<typeof transactionInsertSchema>;

export const transactionUpdateSchema = z.object({
  payment_type_id: dbId.optional(),
  category_id: dbId.optional(),
  currency_id: dbId.optional(),
  amount: DecimalString.optional(),
  date: dbDate.optional(),
  comment: z.string().nullable().optional(),
  is_decrease: z.boolean().optional(),
});
export type TransactionUpdate = z.infer<typeof transactionUpdateSchema>;


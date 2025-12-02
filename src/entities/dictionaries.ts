import { z } from "zod";
import { dbId, dbDate } from "./_shared";

// CURRENCIES
export const currencyRowSchema = z.object({
  id: dbId,
  created_at: dbDate,
  code: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().min(1),
  is_archive: z.boolean(),
});
export type Currency = z.infer<typeof currencyRowSchema>;

export const currencyInsertSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().min(1),
  is_archive: z.boolean().optional(),
});
export type CurrencyInsert = z.infer<typeof currencyInsertSchema>;

export const currencyUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  symbol: z.string().min(1).optional(),
  is_archive: z.boolean().optional(),
});
export type CurrencyUpdate = z.infer<typeof currencyUpdateSchema>;

// CATEGORIES
export const categoryRowSchema = z.object({
  id: dbId,
  created_at: dbDate,
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  workspace_id: dbId,
  is_archive: z.boolean(),
});
export type Category = z.infer<typeof categoryRowSchema>;

export const categoryInsertSchema = z.object({
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  workspace_id: dbId,
  is_archive: z.boolean().optional(),
});
export type CategoryInsert = z.infer<typeof categoryInsertSchema>;

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  is_archive: z.boolean().optional(),
});
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;

// PAYMENT TYPES
export const paymentTypeRowSchema = z.object({
  id: dbId,
  created_at: dbDate,
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  default_currency_id: dbId.nullable().optional(),
  workspace_id: dbId,
  is_archive: z.boolean(),
});
export type PaymentType = z.infer<typeof paymentTypeRowSchema>;

export const paymentTypeInsertSchema = z.object({
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  default_currency_id: dbId.nullable().optional(),
  workspace_id: dbId,
  is_archive: z.boolean().optional(),
});
export type PaymentTypeInsert = z.infer<typeof paymentTypeInsertSchema>;

export const paymentTypeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().nullable().optional(),
  default_currency_id: dbId.nullable().optional(),
  is_archive: z.boolean().optional(),
});
export type PaymentTypeUpdate = z.infer<typeof paymentTypeUpdateSchema>;

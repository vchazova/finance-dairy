import { z } from "zod";

export const dbId = z.coerce.number().int().nonnegative();
export const uuid = z.uuid();
export const dbDate = z.coerce.date();

export const DecimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Число в формате 1234.56");

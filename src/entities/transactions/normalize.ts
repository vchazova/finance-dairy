import {
  transactionRowSchema,
  type Transaction,
} from "@/entities/transactions";

export type NormalizedTransaction = {
  id: string;
  date: string; // yyyy-mm-dd
  categoryId: string;
  paymentTypeId: string;
  currencyId: string;
  isDecrease: boolean;
  amount: number; // signed number for UI
  comment: string | null;
  raw: Transaction;
};

export function toSignedAmount(amount: string | number, isDecrease: boolean) {
  const num = parseFloat(String(amount));
  return isDecrease ? -Math.abs(num) : Math.abs(num);
}

/**
 * Parse DB/API row and return normalized shape for UI.
 */
export function normalizeTransactionRow(input: any): NormalizedTransaction {
  const parsed = transactionRowSchema.parse({
    ...input,
    amount: String(input.amount),
  });
  return {
    id: String(parsed.id),
    date: new Date(parsed.date).toISOString().slice(0, 10),
    categoryId: String(parsed.category_id),
    paymentTypeId: String(parsed.payment_type_id),
    currencyId: String(parsed.currency_id),
    isDecrease: parsed.is_decrease,
    amount: toSignedAmount(parsed.amount, parsed.is_decrease),
    comment: parsed.comment ?? null,
    raw: parsed,
  };
}

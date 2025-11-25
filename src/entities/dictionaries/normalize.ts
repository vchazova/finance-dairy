import {
  currencyRowSchema,
  categoryRowSchema,
  paymentTypeRowSchema,
  type Currency,
  type Category,
  type PaymentType,
} from "@/entities/dictionaries";

export type NormalizedCurrency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  raw: Currency;
};

export type NormalizedCategory = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  workspaceId: string;
  raw: Category;
};

export type NormalizedPaymentType = {
  id: string;
  name: string;
  icon: string | null;
  defaultCurrencyId: string | null;
  workspaceId: string;
  raw: PaymentType;
};

export function normalizeCurrencyRow(input: any): NormalizedCurrency {
  const parsed = currencyRowSchema.parse(input);
  return {
    id: String(parsed.id),
    code: parsed.code,
    name: parsed.name,
    symbol: parsed.symbol,
    raw: parsed,
  };
}

export function normalizeCategoryRow(input: any): NormalizedCategory {
  const parsed = categoryRowSchema.parse(input);
  return {
    id: String(parsed.id),
    name: parsed.name,
    icon: parsed.icon ?? null,
    color: parsed.color ?? null,
    workspaceId: String(parsed.workspace_id),
    raw: parsed,
  };
}

export function normalizePaymentTypeRow(input: any): NormalizedPaymentType {
  const parsed = paymentTypeRowSchema.parse(input);
  return {
    id: String(parsed.id),
    name: parsed.name,
    icon: parsed.icon ?? null,
    defaultCurrencyId:
      parsed.default_currency_id === null || parsed.default_currency_id === undefined
        ? null
        : String(parsed.default_currency_id),
    workspaceId: String(parsed.workspace_id),
    raw: parsed,
  };
}

import { z } from "zod";
import type {
  Currency,
  CurrencyInsert,
  CurrencyUpdate,
  Category,
  CategoryInsert,
  CategoryUpdate,
  PaymentType,
  PaymentTypeInsert,
  PaymentTypeUpdate,
} from "@/entities/dictionaries";

export type CategoryLite = {
  id: number | string;
  name: string;
  icon?: string | null;
  color?: string | null;
};

export type PaymentTypeLite = {
  id: number | string;
  name: string;
  icon?: string | null;
  default_currency_id?: number | null;
};

export interface DictionariesRepo {
  // Currencies
  listCurrencies(): Promise<Currency[]>;
  getCurrency(id: number | string): Promise<Currency | null>;
  createCurrency(input: CurrencyInsert): Promise<{ ok: true; id: number } | { ok: false; message: string }>;
  updateCurrency(id: number | string, input: CurrencyUpdate): Promise<{ ok: true } | { ok: false; message: string }>;
  removeCurrency(id: number | string): Promise<{ ok: true } | { ok: false; message: string }>;

  // Categories (scoped by workspace)
  listCategories(workspaceId: number | string): Promise<CategoryLite[]>;
  getCategory(id: number | string): Promise<Category | null>;
  createCategory(input: CategoryInsert): Promise<{ ok: true; id: number } | { ok: false; message: string }>;
  updateCategory(id: number | string, input: CategoryUpdate): Promise<{ ok: true } | { ok: false; message: string }>;
  removeCategory(id: number | string): Promise<{ ok: true } | { ok: false; message: string }>;

  // Payment types (scoped by workspace)
  listPaymentTypes(workspaceId: number | string): Promise<PaymentTypeLite[]>;
  getPaymentType(id: number | string): Promise<PaymentType | null>;
  createPaymentType(input: PaymentTypeInsert): Promise<{ ok: true; id: number } | { ok: false; message: string }>;
  updatePaymentType(id: number | string, input: PaymentTypeUpdate): Promise<{ ok: true } | { ok: false; message: string }>;
  removePaymentType(id: number | string): Promise<{ ok: true } | { ok: false; message: string }>;
}

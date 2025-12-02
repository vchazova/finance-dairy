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

export type CategoryLite = Pick<
  Category,
  "id" | "name" | "icon" | "color" | "workspace_id" | "is_archive"
>;

export type PaymentTypeLite = Pick<
  PaymentType,
  "id" | "name" | "icon" | "default_currency_id" | "workspace_id" | "is_archive"
>;

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

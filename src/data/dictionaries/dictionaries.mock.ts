import type { DictionariesRepo, CategoryLite, PaymentTypeLite } from "@/data/dictionaries/dictionaries.repo";
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
import { store } from "@/mocks/store";
import {
  currencyRowSchema,
  categoryRowSchema,
  paymentTypeRowSchema,
} from "@/entities/dictionaries";

export const dictionariesRepo: DictionariesRepo = {
  async listCurrencies(): Promise<Currency[]> {
    return store.getCurrencies().map((c) => currencyRowSchema.parse(c));
  },
  async getCurrency(id): Promise<Currency | null> {
    const idNum = typeof id === "string" ? Number(id) : id;
    const row = store.getCurrencies().find((c) => c.id === idNum);
    return row ? currencyRowSchema.parse(row) : null;
  },
  async createCurrency(input: CurrencyInsert) {
    const exists = store.getCurrencies().some((c) => c.code === input.code);
    if (exists) return { ok: false, message: "Currency code already exists" } as const;
    const row = store.addCurrency(input);
    return { ok: true, id: row.id } as const;
  },
  async updateCurrency(id, input: CurrencyUpdate) {
    const idNum = typeof id === "string" ? Number(id) : id;
    const row = store.updateCurrency(idNum, input);
    return row ? ({ ok: true } as const) : ({ ok: false, message: "Not found" } as const);
  },
  async removeCurrency(id) {
    const idNum = typeof id === "string" ? Number(id) : id;
    return store.removeCurrency(idNum) ? ({ ok: true } as const) : ({ ok: false, message: "Not found" } as const);
  },

  async listCategories(workspaceId: number | string): Promise<CategoryLite[]> {
    const idNum = typeof workspaceId === "string" ? Number(workspaceId) : workspaceId;
    return store
      .getCategories()
      .filter((c) => c.workspace_id === idNum)
      .map((c) => ({ id: c.id, name: c.name, icon: c.icon ?? null, color: c.color ?? null }));
  },
  async getCategory(id): Promise<Category | null> {
    const idNum = typeof id === "string" ? Number(id) : id;
    const row = store.getCategories().find((c) => c.id === idNum);
    return row ? categoryRowSchema.parse(row) : null;
  },
  async createCategory(input: CategoryInsert) {
    const row = store.addCategory({
      name: input.name,
      icon: (input as any).icon ?? null,
      color: (input as any).color ?? null,
      workspace_id: input.workspace_id as any,
    });
    return { ok: true, id: row.id } as const;
  },
  async updateCategory(id, input: CategoryUpdate) {
    const idNum = typeof id === "string" ? Number(id) : id;
    const row = store.updateCategory(idNum, input as any);
    return row ? ({ ok: true } as const) : ({ ok: false, message: "Not found" } as const);
  },
  async removeCategory(id) {
    const idNum = typeof id === "string" ? Number(id) : id;
    return store.removeCategory(idNum) ? ({ ok: true } as const) : ({ ok: false, message: "Not found" } as const);
  },

  async listPaymentTypes(workspaceId: number | string): Promise<PaymentTypeLite[]> {
    const idNum = typeof workspaceId === "string" ? Number(workspaceId) : workspaceId;
    return store
      .getPaymentTypes()
      .filter((p) => p.workspace_id === idNum)
      .map((p) => ({
        id: p.id,
        name: p.name,
        icon: p.icon ?? null,
        default_currency_id: p.default_currency_id ?? null,
      }));
  },
  async getPaymentType(id): Promise<PaymentType | null> {
    const idNum = typeof id === "string" ? Number(id) : id;
    const row = store.getPaymentTypes().find((p) => p.id === idNum);
    return row ? paymentTypeRowSchema.parse(row) : null;
  },
  async createPaymentType(input: PaymentTypeInsert) {
    const row = store.addPaymentType({
      name: input.name,
      icon: (input as any).icon ?? null,
      default_currency_id: (input as any).default_currency_id ?? null,
      workspace_id: input.workspace_id as any,
    });
    return { ok: true, id: row.id } as const;
  },
  async updatePaymentType(id, input: PaymentTypeUpdate) {
    const idNum = typeof id === "string" ? Number(id) : id;
    const row = store.updatePaymentType(idNum, input as any);
    return row ? ({ ok: true } as const) : ({ ok: false, message: "Not found" } as const);
  },
  async removePaymentType(id) {
    const idNum = typeof id === "string" ? Number(id) : id;
    return store.removePaymentType(idNum) ? ({ ok: true } as const) : ({ ok: false, message: "Not found" } as const);
  },
};

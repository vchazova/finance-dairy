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
import {
  currencyRowSchema,
  categoryRowSchema,
  paymentTypeRowSchema,
} from "@/entities/dictionaries";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const api = (p: string) => (APP_URL ? `${APP_URL}${p}` : p);

export const dictionariesRepo: DictionariesRepo = {
  async listCurrencies(): Promise<Currency[]> {
    // Placeholder: implement API route later. For now, fallback to empty.
    const res = await fetch(api("/api/dictionaries/currencies"), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return [];
    const json = (await res.json()) as any[];
    return json.map((row) => currencyRowSchema.parse(row));
  },
  async getCurrency(id) {
    const res = await fetch(api(`/api/dictionaries/currencies/${id}`), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return null as any;
    const json = await res.json();
    return currencyRowSchema.parse(json);
  },
  async createCurrency(input: CurrencyInsert) {
    const res = await fetch(api(`/api/dictionaries/currencies`), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },
  async updateCurrency(id, input: CurrencyUpdate) {
    const res = await fetch(api(`/api/dictionaries/currencies/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },
  async removeCurrency(id) {
    const res = await fetch(api(`/api/dictionaries/currencies/${id}`), {
      method: "DELETE",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },

  async listCategories(workspaceId: number | string): Promise<CategoryLite[]> {
    const res = await fetch(api(`/api/dictionaries/categories?workspaceId=${workspaceId}`), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return [];
    return (await res.json()) as CategoryLite[];
  },
  async getCategory(id) {
    const res = await fetch(api(`/api/dictionaries/categories/${id}`), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return null as any;
    const json = await res.json();
    return categoryRowSchema.parse(json);
  },
  async createCategory(input: CategoryInsert) {
    const res = await fetch(api(`/api/dictionaries/categories`), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },
  async updateCategory(id, input: CategoryUpdate) {
    const res = await fetch(api(`/api/dictionaries/categories/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },
  async removeCategory(id) {
    const res = await fetch(api(`/api/dictionaries/categories/${id}`), {
      method: "DELETE",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },

  async listPaymentTypes(workspaceId: number | string): Promise<PaymentTypeLite[]> {
    const res = await fetch(api(`/api/dictionaries/payment_types?workspaceId=${workspaceId}`), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return [];
    return (await res.json()) as PaymentTypeLite[];
  },
  async getPaymentType(id) {
    const res = await fetch(api(`/api/dictionaries/payment_types/${id}`), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return null as any;
    const json = await res.json();
    return paymentTypeRowSchema.parse(json);
  },
  async createPaymentType(input: PaymentTypeInsert) {
    const res = await fetch(api(`/api/dictionaries/payment_types`), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },
  async updatePaymentType(id, input: PaymentTypeUpdate) {
    const res = await fetch(api(`/api/dictionaries/payment_types/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },
  async removePaymentType(id) {
    const res = await fetch(api(`/api/dictionaries/payment_types/${id}`), {
      method: "DELETE",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },
};

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase/client";
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

function getClient(client?: SupabaseClient) {
  return client ?? defaultClient;
}

export function createDictionariesSupabaseRepo(client?: SupabaseClient): DictionariesRepo {
  const supabase = getClient(client);

  return {
    // Global (unscoped) dictionaries: currencies
    async listCurrencies(): Promise<Currency[]> {
      const { data, error } = await supabase.from("currencies").select("*").order("code", { ascending: true });
      if (error) {
        console.warn("[dictionariesRepo] listCurrencies failed", error);
        return [];
      }
      return (data ?? []).map((row) => currencyRowSchema.parse(row));
    },
    async getCurrency(id) {
      const { data, error } = await supabase.from("currencies").select("*").eq("id", id).single();
      if (error && error.code !== "PGRST116") {
        console.warn("[dictionariesRepo] getCurrency failed", error);
        return null;
      }
      if (!data) return null as any;
      return currencyRowSchema.parse(data);
    },
    async createCurrency(input: CurrencyInsert) {
      const { data, error } = await supabase.from("currencies").insert(input).select("id").single();
      if (error || !data) return { ok: false, message: error?.message ?? "Failed to create" } as const;
      return { ok: true, id: Number(data.id) } as const;
    },
    async updateCurrency(id, input: CurrencyUpdate) {
      const { error } = await supabase.from("currencies").update(input).eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },
    async removeCurrency(id) {
      const { error } = await supabase.from("currencies").delete().eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },

    // Workspace-scoped dictionaries: categories
    async listCategories(workspaceId: number | string): Promise<CategoryLite[]> {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true });
      if (error) {
        console.warn("[dictionariesRepo] listCategories failed", error);
        return [];
      }
      return (data ?? []).map((r: any) => categoryRowSchema.parse(r));
    },
    async getCategory(id) {
      const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();
      if (error && error.code !== "PGRST116") {
        console.warn("[dictionariesRepo] getCategory failed", error);
        return null;
      }
      if (!data) return null as any;
      return categoryRowSchema.parse(data);
    },
    async createCategory(input: CategoryInsert) {
      const payload = {
        ...input,
        icon: (input as any).icon ?? null,
        color: (input as any).color ?? null,
      };
      const { data, error } = await supabase.from("categories").insert(payload).select("id").single();
      if (error || !data) return { ok: false, message: error?.message ?? "Failed to create" } as const;
      return { ok: true, id: Number(data.id) } as const;
    },
    async updateCategory(id, input: CategoryUpdate) {
      const { error } = await supabase.from("categories").update(input).eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },
    async removeCategory(id) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },

    // Workspace-scoped dictionaries: payment types
    async listPaymentTypes(workspaceId: number | string): Promise<PaymentTypeLite[]> {
      const { data, error } = await supabase
        .from("payment_types")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true });
      if (error) {
        console.warn("[dictionariesRepo] listPaymentTypes failed", error);
        return [];
      }
      return (data ?? []).map((r: any) => paymentTypeRowSchema.parse(r));
    },
    async getPaymentType(id) {
      const { data, error } = await supabase.from("payment_types").select("*").eq("id", id).single();
      if (error && error.code !== "PGRST116") {
        console.warn("[dictionariesRepo] getPaymentType failed", error);
        return null;
      }
      if (!data) return null as any;
      return paymentTypeRowSchema.parse(data);
    },
    async createPaymentType(input: PaymentTypeInsert) {
      const payload = {
        ...input,
        icon: (input as any).icon ?? null,
        default_currency_id: (input as any).default_currency_id ?? null,
      };
      const { data, error } = await supabase.from("payment_types").insert(payload).select("id").single();
      if (error || !data) return { ok: false, message: error?.message ?? "Failed to create" } as const;
      return { ok: true, id: Number(data.id) } as const;
    },
    async updatePaymentType(id, input: PaymentTypeUpdate) {
      const { error } = await supabase.from("payment_types").update(input).eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },
    async removePaymentType(id) {
      const { error } = await supabase.from("payment_types").delete().eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },
  };
}

// Default instance for environments where a global Supabase client is available.
export const dictionariesRepo = createDictionariesSupabaseRepo();

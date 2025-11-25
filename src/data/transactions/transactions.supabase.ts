import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase/client";
import type { TransactionsRepo } from "@/data/transactions/transactions.repo";
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from "@/entities/transactions";
import { transactionRowSchema } from "@/entities/transactions";

function parseRow(row: any): Transaction {
  return transactionRowSchema.parse({ ...row, amount: String(row.amount) });
}

function getClient(client?: SupabaseClient) {
  return client ?? defaultClient;
}

export function createTransactionsSupabaseRepo(client?: SupabaseClient): TransactionsRepo {
  const supabase = getClient(client);

  return {
    // List all transactions for workspace (ordered by date desc).
    async list(workspaceId: number | string): Promise<Transaction[]> {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("date", { ascending: false });

      if (error) {
        console.warn("[transactionsRepo] list failed", error);
        return [];
      }
      return (data ?? []).map((row) => parseRow(row));
    },

    // Get single transaction by id.
    async get(id: number | string): Promise<Transaction | null> {
      const { data, error } = await supabase.from("transactions").select("*").eq("id", id).single();
      if (error && error.code !== "PGRST116") {
        console.warn("[transactionsRepo] get failed", error);
        return null;
      }
      if (!data) return null;
      return parseRow(data);
    },

    // Create transaction record; normalizes amount/date to DB types.
    async create(input: TransactionInsert) {
      const payload = {
        ...input,
        amount: String(input.amount),
        date: new Date(input.date as any).toISOString(),
      };
      const { data, error } = await supabase
        .from("transactions")
        .insert(payload)
        .select("id")
        .single();

      if (error || !data) return { ok: false, message: error?.message ?? "Failed to create" } as const;
      return { ok: true, id: Number(data.id) } as const;
    },

    // Partial update of transaction by id.
    async update(id: number | string, input: TransactionUpdate) {
      const patch: Record<string, any> = { ...input, updated_at: new Date().toISOString() };
      if (patch.amount !== undefined) patch.amount = String(patch.amount);
      if (patch.date !== undefined) patch.date = new Date(patch.date as any).toISOString();

      const { error } = await supabase.from("transactions").update(patch).eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },

    // Delete transaction by id.
    async remove(id: number | string) {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) return { ok: false, message: error.message } as const;
      return { ok: true } as const;
    },
  };
}

// Default instance for environments where a global Supabase client is available.
export const transactionsRepo = createTransactionsSupabaseRepo();

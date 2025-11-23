import type { TransactionsRepo } from "@/data/transactions/transactions.repo";
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from "@/entities/transactions";
import { transactionRowSchema } from "@/entities/transactions";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const api = (path: string) => (APP_URL ? `${APP_URL}${path}` : path);

function parseRow(row: any): Transaction {
  return transactionRowSchema.parse({ ...row, amount: String(row.amount) });
}

export const transactionsRepo: TransactionsRepo = {
  async list(workspaceId: number | string): Promise<Transaction[]> {
    const res = await fetch(api(`/api/transactions?workspaceId=${workspaceId}`), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return [];
    const json = (await res.json()) as any[];
    return json.map((row) => parseRow(row));
  },

  async get(id: number | string): Promise<Transaction | null> {
    const res = await fetch(api(`/api/transactions/${id}`), {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return null;
    const json = await res.json();
    return parseRow(json);
  },

  async create(input: TransactionInsert) {
    const res = await fetch(api(`/api/transactions`), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },

  async update(id: number | string, input: TransactionUpdate) {
    const res = await fetch(api(`/api/transactions/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },

  async remove(id: number | string) {
    const res = await fetch(api(`/api/transactions/${id}`), {
      method: "DELETE",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).catch(() => null);
    if (!res) return { ok: false, message: "Network error" } as const;
    return (await res.json()) as any;
  },
};

import type { TransactionListFilters, TransactionsRepo } from "@/data/transactions/transactions.repo";
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from "@/entities/transactions";
import { transactionRowSchema } from "@/entities/transactions";
import { store } from "@/mocks/store";

export const transactionsRepo: TransactionsRepo = {
  async list(workspaceId: number | string, filters?: TransactionListFilters): Promise<Transaction[]> {
    const idNum = typeof workspaceId === "string" ? Number(workspaceId) : workspaceId;
    return store
      .getTransactions()
      .filter((t) => {
        if (t.workspace_id !== idNum) return false;
        if (filters?.startDate && new Date(t.date as any) < new Date(filters.startDate as any)) return false;
        if (filters?.endDate && new Date(t.date as any) > new Date(filters.endDate as any)) return false;
        if (filters?.categoryId !== undefined && t.category_id !== filters.categoryId) return false;
        if (filters?.paymentTypeId !== undefined && t.payment_type_id !== filters.paymentTypeId) return false;
        if (filters?.currencyId !== undefined && t.currency_id !== filters.currencyId) return false;
        if (filters?.isDecrease !== undefined && t.is_decrease !== filters.isDecrease) return false;
        return true;
      })
      .map((t) => transactionRowSchema.parse(t));
  },

  async get(id: number | string): Promise<Transaction | null> {
    const idNum = typeof id === "string" ? Number(id) : id;
    const row = store.getTransactions().find((t) => t.id === idNum);
    return row ? transactionRowSchema.parse(row) : null;
  },

  async create(input: TransactionInsert) {
    const row = store.addTransaction({
      workspace_id: input.workspace_id as any,
      user_id: input.user_id,
      payment_type_id: input.payment_type_id as any,
      category_id: input.category_id as any,
      currency_id: input.currency_id as any,
      amount: String(input.amount),
      date: input.date as any,
      comment: input.comment ?? null,
      is_decrease: input.is_decrease ?? true,
    });
    return { ok: true, id: row.id } as const;
  },

  async update(id: number | string, input: TransactionUpdate) {
    const idNum = typeof id === "string" ? Number(id) : id;
    const row = store.updateTransaction(idNum, {
      payment_type_id: input.payment_type_id as any,
      category_id: input.category_id as any,
      currency_id: input.currency_id as any,
      amount: input.amount !== undefined ? String(input.amount) : undefined,
      date: input.date as any,
      comment: input.comment ?? undefined,
      is_decrease: input.is_decrease ?? undefined,
    });
    return row ? ({ ok: true } as const) : ({ ok: false, message: "Not found" } as const);
  },

  async remove(id: number | string) {
    const idNum = typeof id === "string" ? Number(id) : id;
    return store.removeTransaction(idNum) ? ({ ok: true } as const) : ({ ok: false, message: "Not found" } as const);
  },
};

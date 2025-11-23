import type { TransactionsRepo } from "@/data/transactions/transactions.repo";
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from "@/entities/transactions";
import { transactionRowSchema } from "@/entities/transactions";
import { store } from "@/mocks/store";

export const transactionsRepo: TransactionsRepo = {
  async list(workspaceId: number | string): Promise<Transaction[]> {
    const idNum = typeof workspaceId === "string" ? Number(workspaceId) : workspaceId;
    return store
      .getTransactions()
      .filter((t) => t.workspace_id === idNum)
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

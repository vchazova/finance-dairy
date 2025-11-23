import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from "@/entities/transactions";

export interface TransactionsRepo {
  list(workspaceId: number | string): Promise<Transaction[]>;
  get(id: number | string): Promise<Transaction | null>;
  create(
    input: TransactionInsert
  ): Promise<{ ok: true; id: number } | { ok: false; message: string }>;
  update(
    id: number | string,
    input: TransactionUpdate
  ): Promise<{ ok: true } | { ok: false; message: string }>;
  remove(id: number | string): Promise<{ ok: true } | { ok: false; message: string }>;
}

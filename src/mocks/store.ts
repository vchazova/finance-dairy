import {
  WORKSPACES as SEED_WORKSPACES,
  WORKSPACE_MEMBERS as SEED_MEMBERS,
  CURRENCIES as SEED_CURRENCIES,
  PAYMENT_TYPES as SEED_PAYMENT_TYPES,
  CATEGORIES as SEED_CATEGORIES,
  TRANSACTIONS as SEED_TRANSACTIONS,
} from "@/mocks/seed";

type WorkspaceRow = {
  id: number;
  created_at: string;
  name: string;
  slug: string;
  description: string | null;
  admin_user_id: string;
};

type WorkspaceMemberRow = {
  id: number;
  created_at: string;
  user_id: string;
  workspace_id: number;
  role: string; // keep flexible for mocks
};

type CurrencyRow = {
  id: number;
  created_at: string;
  code: string;
  name: string;
  symbol: string;
  is_archive: boolean;
};

type CategoryRow = {
  id: number;
  created_at: string;
  name: string;
  icon: string | null;
  color: string | null;
  workspace_id: number;
  is_archive: boolean;
};

type PaymentTypeRow = {
  id: number;
  created_at: string;
  name: string;
  icon: string | null;
  default_currency_id: number | null;
  workspace_id: number;
  is_archive: boolean;
};

type TransactionRow = {
  id: number;
  created_at: string;
  updated_at: string;
  workspace_id: number;
  user_id: string;
  payment_type_id: number;
  category_id: number;
  currency_id: number;
  amount: string;
  date: string;
  comment: string | null;
  is_decrease: boolean;
};

const workspaces: WorkspaceRow[] = [...SEED_WORKSPACES];
const members: WorkspaceMemberRow[] = [...SEED_MEMBERS];
const currencies: CurrencyRow[] = [...SEED_CURRENCIES];
const paymentTypes: PaymentTypeRow[] = [...SEED_PAYMENT_TYPES];
const categories: CategoryRow[] = [...SEED_CATEGORIES];
const transactions: TransactionRow[] = SEED_TRANSACTIONS.map((t) => ({
  ...t,
  amount: String(t.amount),
  date: new Date(t.date).toISOString(),
})) as any;

function nowIso() {
  return new Date().toISOString();
}

function nextId(list: { id: number }[]): number {
  return list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
}

export const store = {
  // Readers (return shallow copies to avoid accidental external mutation)
  getWorkspaces(): WorkspaceRow[] {
    return [...workspaces];
  },
  getMembers(): WorkspaceMemberRow[] {
    return [...members];
  },
  getCurrencies() {
    return [...currencies];
  },
  getPaymentTypes() {
    return [...paymentTypes];
  },
  getCategories() {
    return [...categories];
  },
  getTransactions() {
    return [...transactions];
  },

  // Writers
  addWorkspace(input: {
    name: string;
    slug: string;
    description?: string | null;
    admin_user_id: string;
  }): WorkspaceRow {
    const row: WorkspaceRow = {
      id: nextId(workspaces),
      created_at: nowIso(),
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      admin_user_id: input.admin_user_id,
    };
    workspaces.push(row);
    return row;
  },

  addMember(input: {
    user_id: string;
    workspace_id: number;
    role: string;
  }): WorkspaceMemberRow {
    const row: WorkspaceMemberRow = {
      id: nextId(members),
      created_at: nowIso(),
      user_id: input.user_id,
      workspace_id: input.workspace_id,
      role: input.role,
    };
    members.push(row);
    return row;
  },

  // Currencies CRUD
  addCurrency(input: { code: string; name: string; symbol: string }): CurrencyRow {
    const row: CurrencyRow = {
      id: nextId(currencies),
      created_at: nowIso(),
      code: input.code,
      name: input.name,
      symbol: input.symbol,
      is_archive: false,
    };
    currencies.push(row);
    return row;
  },
  updateCurrency(
    id: number,
    patch: Partial<Pick<CurrencyRow, "code" | "name" | "symbol" | "is_archive">>
  ): CurrencyRow | null {
    const idx = currencies.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    currencies[idx] = { ...currencies[idx], ...patch };
    return currencies[idx];
  },
  removeCurrency(id: number): boolean {
    const idx = currencies.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    currencies[idx] = { ...currencies[idx], is_archive: true };
    return true;
  },

  // Categories CRUD
  addCategory(input: {
    name: string;
    icon?: string | null;
    color?: string | null;
    workspace_id: number;
  }): CategoryRow {
    const row: CategoryRow = {
      id: nextId(categories),
      created_at: nowIso(),
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      workspace_id: input.workspace_id,
      is_archive: false,
    };
    categories.push(row);
    return row;
  },
  updateCategory(
    id: number,
    patch: Partial<Pick<CategoryRow, "name" | "icon" | "color" | "is_archive">>
  ): CategoryRow | null {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    categories[idx] = { ...categories[idx], ...patch };
    return categories[idx];
  },
  removeCategory(id: number): boolean {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    categories[idx] = { ...categories[idx], is_archive: true };
    return true;
  },

  // Payment Types CRUD
  addPaymentType(input: {
    name: string;
    icon?: string | null;
    default_currency_id?: number | null;
    workspace_id: number;
  }): PaymentTypeRow {
    const row: PaymentTypeRow = {
      id: nextId(paymentTypes),
      created_at: nowIso(),
      name: input.name,
      icon: input.icon ?? null,
      default_currency_id: input.default_currency_id ?? null,
      workspace_id: input.workspace_id,
      is_archive: false,
    };
    paymentTypes.push(row);
    return row;
  },
  updatePaymentType(
    id: number,
    patch: Partial<Pick<PaymentTypeRow, "name" | "icon" | "default_currency_id" | "is_archive">>
  ): PaymentTypeRow | null {
    const idx = paymentTypes.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    paymentTypes[idx] = { ...paymentTypes[idx], ...patch };
    return paymentTypes[idx];
  },
  removePaymentType(id: number): boolean {
    const idx = paymentTypes.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    paymentTypes[idx] = { ...paymentTypes[idx], is_archive: true };
    return true;
  },

  // Transactions CRUD
  addTransaction(input: {
    workspace_id: number;
    user_id: string;
    payment_type_id: number;
    category_id: number;
    currency_id: number;
    amount: string;
    date: string | Date;
    comment?: string | null;
    is_decrease?: boolean;
  }): TransactionRow {
    const row: TransactionRow = {
      id: nextId(transactions),
      created_at: nowIso(),
      updated_at: nowIso(),
      workspace_id: input.workspace_id,
      user_id: input.user_id,
      payment_type_id: input.payment_type_id,
      category_id: input.category_id,
      currency_id: input.currency_id,
      amount: String(input.amount),
      date:
        input.date instanceof Date
          ? input.date.toISOString()
          : new Date(input.date).toISOString(),
      comment: input.comment ?? null,
      is_decrease: input.is_decrease ?? true,
    };
    transactions.push(row);
    return row;
  },
  updateTransaction(
    id: number,
    patch: Partial<
      Pick<
        TransactionRow,
        | "payment_type_id"
        | "category_id"
        | "currency_id"
        | "amount"
        | "date"
        | "comment"
        | "is_decrease"
      >
    >
  ): TransactionRow | null {
    const idx = transactions.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const current = transactions[idx];
    transactions[idx] = {
      ...current,
      ...patch,
      amount: patch.amount !== undefined ? String(patch.amount) : current.amount,
      date:
        patch.date !== undefined
          ? new Date(patch.date as any).toISOString()
          : current.date,
      updated_at: nowIso(),
    };
    return transactions[idx];
  },
  removeTransaction(id: number): boolean {
    const idx = transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    transactions.splice(idx, 1);
    return true;
  },
};

export type {
  WorkspaceRow,
  WorkspaceMemberRow,
  CurrencyRow,
  CategoryRow,
  PaymentTypeRow,
  TransactionRow,
};

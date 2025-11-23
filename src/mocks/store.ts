import {
  WORKSPACES as SEED_WORKSPACES,
  WORKSPACE_MEMBERS as SEED_MEMBERS,
  CURRENCIES as SEED_CURRENCIES,
  PAYMENT_TYPES as SEED_PAYMENT_TYPES,
  CATEGORIES as SEED_CATEGORIES,
} from "@/mocks/seed";

type WorkspaceRow = {
  id: number;
  created_at: string;
  name: string;
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
};

type CategoryRow = {
  id: number;
  created_at: string;
  name: string;
  icon: string | null;
  color: string | null;
  workspace_id: number;
};

type PaymentTypeRow = {
  id: number;
  created_at: string;
  name: string;
  icon: string | null;
  default_currency_id: number | null;
  workspace_id: number;
};

const workspaces: WorkspaceRow[] = [...SEED_WORKSPACES];
const members: WorkspaceMemberRow[] = [...SEED_MEMBERS];
const currencies: CurrencyRow[] = [...SEED_CURRENCIES] as any;
const paymentTypes: PaymentTypeRow[] = [...SEED_PAYMENT_TYPES] as any;
const categories: CategoryRow[] = [...SEED_CATEGORIES] as any;

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

  // Writers
  addWorkspace(input: { name: string; admin_user_id: string }): WorkspaceRow {
    const row: WorkspaceRow = {
      id: nextId(workspaces),
      created_at: nowIso(),
      name: input.name,
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
    };
    currencies.push(row);
    return row;
  },
  updateCurrency(
    id: number,
    patch: Partial<Pick<CurrencyRow, "code" | "name" | "symbol">>
  ): CurrencyRow | null {
    const idx = currencies.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    currencies[idx] = { ...currencies[idx], ...patch };
    return currencies[idx];
  },
  removeCurrency(id: number): boolean {
    const idx = currencies.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    currencies.splice(idx, 1);
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
    };
    categories.push(row);
    return row;
  },
  updateCategory(
    id: number,
    patch: Partial<Pick<CategoryRow, "name" | "icon" | "color">>
  ): CategoryRow | null {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    categories[idx] = { ...categories[idx], ...patch };
    return categories[idx];
  },
  removeCategory(id: number): boolean {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    categories.splice(idx, 1);
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
    };
    paymentTypes.push(row);
    return row;
  },
  updatePaymentType(
    id: number,
    patch: Partial<Pick<PaymentTypeRow, "name" | "icon" | "default_currency_id">>
  ): PaymentTypeRow | null {
    const idx = paymentTypes.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    paymentTypes[idx] = { ...paymentTypes[idx], ...patch };
    return paymentTypes[idx];
  },
  removePaymentType(id: number): boolean {
    const idx = paymentTypes.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    paymentTypes.splice(idx, 1);
    return true;
  },
};

export type { WorkspaceRow, WorkspaceMemberRow, CurrencyRow, CategoryRow, PaymentTypeRow };

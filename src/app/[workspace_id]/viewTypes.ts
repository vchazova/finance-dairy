export type WorkspaceViewOption = {
  id: string;
  label: string;
  icon?: string | null;
  defaultCurrencyId?: string | null;
};

export type WorkspaceTransaction = {
  id: string;
  date: string;
  categoryId: string;
  categoryName?: string;
  paymentTypeId?: string;
  currencyId?: string;
  isDecrease?: boolean;
  amount: number;
  comment?: string | null;
};

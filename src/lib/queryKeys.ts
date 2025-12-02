export const queryKeys = {
  workspace: (workspaceSlug: string) => ["workspace", workspaceSlug] as const,
  categories: (workspaceSlug: string) => ["workspace", workspaceSlug, "categories"] as const,
  categoryOptions: (workspaceSlug: string) => ["workspace", workspaceSlug, "categories", "options"] as const,
  paymentTypes: (workspaceSlug: string) => ["workspace", workspaceSlug, "payment-types"] as const,
  paymentTypeOptions: (workspaceSlug: string) => ["workspace", workspaceSlug, "payment-types", "options"] as const,
  currencyOptions: ["dictionaries", "currencies", "options"] as const,
  currencies: ["dictionaries", "currencies"] as const,
  transactions: (workspaceSlug: string) => ["workspace", workspaceSlug, "transactions"] as const,
};

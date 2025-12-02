export const queryKeys = {
  workspace: (workspaceSlug: string) => ["workspace", workspaceSlug] as const,
  categories: (workspaceSlug: string) => ["workspace", workspaceSlug, "categories"] as const,
  paymentTypes: (workspaceSlug: string) => ["workspace", workspaceSlug, "payment-types"] as const,
  currencies: ["dictionaries", "currencies"] as const,
  transactions: (workspaceSlug: string) => ["workspace", workspaceSlug, "transactions"] as const,
};

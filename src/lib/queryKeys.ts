export const queryKeys = {
  workspace: (workspaceId: string | number) => ["workspace", String(workspaceId)] as const,
  categories: (workspaceId: string | number) =>
    ["workspace", String(workspaceId), "categories"] as const,
  paymentTypes: (workspaceId: string | number) =>
    ["workspace", String(workspaceId), "payment-types"] as const,
  currencies: ["dictionaries", "currencies"] as const,
  transactions: (workspaceId: string | number) =>
    ["workspace", String(workspaceId), "transactions"] as const,
};

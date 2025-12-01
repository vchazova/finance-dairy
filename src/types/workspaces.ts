export type WorkspaceListItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  role: string; // e.g., 'owner' | 'admin' | 'viewer'
};

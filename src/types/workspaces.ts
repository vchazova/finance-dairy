export type WorkspaceListItem = {
  id: string;
  name: string;
  slug: string | null;
  role: string; // e.g., 'owner' | 'admin' | 'viewer'
};

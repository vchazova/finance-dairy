import type { WorkspaceListItem } from "@/types/workspaces";

export type WorkspaceListFilters = {
  /**
   * Case-insensitive search across workspace name and slug.
   */
  search?: string;
  /**
   * Exact match against workspace slug.
   */
  slug?: string;
  /**
   * Filter by membership role (owner, member, etc.).
   */
  role?: string;
};

export type CreateWorkspaceInput = {
  name: string;
  slug: string;
  description?: string | null;
  userId: string;
};

export type CreateWorkspaceResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; message: string };

export interface WorkspacesRepo {
  /**
   * List workspaces for user with role.
   */
  listForUser(userId: string, filters?: WorkspaceListFilters): Promise<WorkspaceListItem[]>;

  /**
   * Create workspace and return id.
   */
  create(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult>;

  /**
   * Check if slug already exists.
   */
  slugExists(slug: string): Promise<boolean>;

  /**
   * Update workspace (name only for now).
   */
  update(
    id: string | number,
    payload: { name?: string; slug?: string; description?: string | null }
  ): Promise<{ ok: true } | { ok: false; message: string }>;

  /**
   * Delete workspace by id.
   */
  remove(id: string | number): Promise<{ ok: true } | { ok: false; message: string }>;
}

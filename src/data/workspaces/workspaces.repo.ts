import type { WorkspaceListItem } from "@/types/workspaces";

export type CreateWorkspaceInput = {
  name: string;
  userId: string;
};

export type CreateWorkspaceResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

export interface WorkspacesRepo {
  /**
   * List workspaces for user with role.
   */
  listForUser(userId: string): Promise<WorkspaceListItem[]>;

  /**
   * Create workspace and return id.
   */
  create(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult>;

  /**
   * Update workspace (name only for now).
   */
  update(
    id: string | number,
    payload: { name?: string }
  ): Promise<{ ok: true } | { ok: false; message: string }>;

  /**
   * Delete workspace by id.
   */
  remove(id: string | number): Promise<{ ok: true } | { ok: false; message: string }>;
}

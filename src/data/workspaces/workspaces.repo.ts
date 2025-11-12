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
   * Возвращает список рабочих пространств пользователя
   * в формате, удобном для UI.
   */
  listForUser(userId: string): Promise<WorkspaceListItem[]>;

  /**
   * Создает новое рабочее пространство и добавляет текущего пользователя
   * как владельца/админа (детали — внутри реализации).
   */
  create(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult>;
}

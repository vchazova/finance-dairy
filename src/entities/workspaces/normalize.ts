import { workspaceRowSchema, type Workspace } from "@/entities/workspaces";
import {
  workspaceMemberRowSchema,
  type WorkspaceMember,
} from "@/entities/workspaceMembers";
import type { WorkspaceListItem } from "@/types/workspaces";

export type NormalizedWorkspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  adminUserId: string;
  raw: Workspace;
};

export type NormalizedWorkspaceMember = {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceMember["role"];
  raw: WorkspaceMember;
};

export function normalizeWorkspaceRow(input: any): NormalizedWorkspace {
  const parsed = workspaceRowSchema.parse(input);
  return {
    id: String(parsed.id),
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description ?? null,
    createdAt: parsed.created_at.toISOString(),
    adminUserId: parsed.admin_user_id,
    raw: parsed,
  };
}

export function normalizeWorkspaceMemberRow(input: any): NormalizedWorkspaceMember {
  const parsed = workspaceMemberRowSchema.parse(input);
  return {
    id: String(parsed.id),
    userId: parsed.user_id,
    workspaceId: String(parsed.workspace_id),
    role: parsed.role,
    raw: parsed,
  };
}

// Helper to combine workspace + membership into list item DTO.
export function toWorkspaceListItem(
  workspace: NormalizedWorkspace,
  membership: NormalizedWorkspaceMember
): WorkspaceListItem {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    description: workspace.description ?? undefined,
    createdAt: workspace.createdAt,
    role: membership.role,
  };
}

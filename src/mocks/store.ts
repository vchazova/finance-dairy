import { WORKSPACES as SEED_WORKSPACES, WORKSPACE_MEMBERS as SEED_MEMBERS } from "@/mocks/seed";

type WorkspaceRow = {
  id: number;
  created_at: string;
  name: string;
  admin_user_id: string;
};

type WorkspaceMemberRow = {
  id: number;
  created_at: string;
  user_id: string;
  workspace_id: number;
  role: string; // keep flexible for mocks
};

const workspaces: WorkspaceRow[] = [...SEED_WORKSPACES];
const members: WorkspaceMemberRow[] = [...SEED_MEMBERS];

function nowIso() {
  return new Date().toISOString();
}

function nextId(list: { id: number }[]): number {
  return list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
}

export const store = {
  // Readers (return shallow copies to avoid accidental external mutation)
  getWorkspaces(): WorkspaceRow[] {
    return [...workspaces];
  },
  getMembers(): WorkspaceMemberRow[] {
    return [...members];
  },

  // Writers
  addWorkspace(input: { name: string; admin_user_id: string }): WorkspaceRow {
    const row: WorkspaceRow = {
      id: nextId(workspaces),
      created_at: nowIso(),
      name: input.name,
      admin_user_id: input.admin_user_id,
    };
    workspaces.push(row);
    return row;
  },

  addMember(input: {
    user_id: string;
    workspace_id: number;
    role: string;
  }): WorkspaceMemberRow {
    const row: WorkspaceMemberRow = {
      id: nextId(members),
      created_at: nowIso(),
      user_id: input.user_id,
      workspace_id: input.workspace_id,
      role: input.role,
    };
    members.push(row);
    return row;
  },
};

export type { WorkspaceRow, WorkspaceMemberRow };

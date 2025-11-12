import type {
  WorkspacesRepo,
  CreateWorkspaceInput,
  CreateWorkspaceResult,
} from "@/data/workspaces/workspaces.repo";

// Ensure this module is only used on the server when implemented
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("server-only");
} catch {}

export const workspacesRepo: WorkspacesRepo = {
  async listForUser(_userId: string) {
    throw new Error("workspaces.supabase: not implemented yet");
  },

  async create(_input: CreateWorkspaceInput): Promise<CreateWorkspaceResult> {
    return { ok: false, message: "workspaces.supabase: not implemented yet" };
  },
};

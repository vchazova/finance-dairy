import type {
  WorkspacesRepo,
  CreateWorkspaceInput,
  CreateWorkspaceResult,
} from "@/data/workspaces/workspaces.repo";
import type { WorkspaceListItem } from "@/types/workspaces";

// This implementation talks to our Next.js API routes.
// It works best in the browser (client). For server usage, set NEXT_PUBLIC_APP_URL.
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const api = (path: string) => (APP_URL ? `${APP_URL}${path}` : path);

export const workspacesRepo: WorkspacesRepo = {
  async listForUser(userId: string): Promise<WorkspaceListItem[]> {
    const res = await fetch(api("/api/workspaces"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        // For dev mocks compatibility; ignored by supabase-protected routes
        "x-user-id": userId,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET /api/workspaces failed: ${res.status} ${text}`);
    }
    return (await res.json()) as WorkspaceListItem[];
  },

  async create(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult> {
    const res = await fetch(api("/api/workspaces"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // For dev mocks compatibility
        "x-user-id": input.userId,
      },
      credentials: "include",
      body: JSON.stringify({ name: input.name }),
    });
    // API returns { ok, id? | message? }
    const json = (await res.json().catch(() => null)) as CreateWorkspaceResult | null;
    if (!json) {
      return { ok: false, message: `Invalid response (${res.status})` };
    }
    return json;
  },
};

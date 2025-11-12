import type { WorkspacesRepo } from "@/data/workspaces/workspaces.repo";
import { workspacesRepo as mockWorkspacesRepo } from "@/data/workspaces/workspaces.mock";
import { workspacesRepo as supabaseWorkspacesRepo } from "@/data/workspaces/workspaces.supabase";

const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? "mock"; // mock | supabase

function pickWorkspacesRepo(): WorkspacesRepo {
  if (mode === "supabase") {
    try {
      return supabaseWorkspacesRepo;
    } catch (e) {
      if (typeof console !== "undefined") {
        console.warn("[data] supabase repo unavailable; falling back to mock");
      }
      return mockWorkspacesRepo;
    }
  }
  return mockWorkspacesRepo;
}

export const dataMode = mode;
export const workspacesRepo: WorkspacesRepo = pickWorkspacesRepo();

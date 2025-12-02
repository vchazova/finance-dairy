import type { SupabaseClient } from "@supabase/supabase-js";
import { workspacesRepo as mockWorkspacesRepo } from "@/data/workspaces/workspaces.mock";
import { createWorkspacesSupabaseRepo } from "@/data/workspaces/workspaces.supabase";
import { dictionariesRepo as mockDictionariesRepo } from "@/data/dictionaries/dictionaries.mock";
import { createDictionariesSupabaseRepo } from "@/data/dictionaries/dictionaries.supabase";
import { transactionsRepo as mockTransactionsRepo } from "@/data/transactions/transactions.mock";
import { createTransactionsSupabaseRepo } from "@/data/transactions/transactions.supabase";
import { createWorkspaceMembersSupabaseRepo } from "@/data/workspaceMembers/workspaceMembers.supabase";
import type { WorkspaceMembersRepo } from "@/data/workspaceMembers/workspaceMembers.repo";
import { createInvitedMembersSupabaseRepo } from "@/data/invitedMembers/invitedMembers.supabase";
import type { InvitedMembersRepo } from "@/data/invitedMembers/invitedMembers.repo";

type Mode = "mock" | "supabase";
const mode: Mode = (process.env.NEXT_PUBLIC_DATA_MODE as Mode) ?? "mock";

// For environments where we have a global Supabase client (e.g. browser) we can rely on default clients
// provided by each factory. If a custom client is available (e.g. server-side), pass it in.
export function createDataRepos(client?: SupabaseClient) {
  const workspacesRepo =
    mode === "supabase"
      ? createWorkspacesSupabaseRepo(client)
      : mockWorkspacesRepo;
  const dictionariesRepo =
    mode === "supabase"
      ? createDictionariesSupabaseRepo(client)
      : mockDictionariesRepo;
  const transactionsRepo =
    mode === "supabase"
      ? createTransactionsSupabaseRepo(client)
      : mockTransactionsRepo;
  const workspaceMembersRepo: WorkspaceMembersRepo | undefined =
    mode === "supabase" ? createWorkspaceMembersSupabaseRepo(client) : undefined;
  const invitedMembersRepo: InvitedMembersRepo | undefined =
    mode === "supabase" ? createInvitedMembersSupabaseRepo(client) : undefined;

  return { workspacesRepo, dictionariesRepo, transactionsRepo, workspaceMembersRepo, invitedMembersRepo };
}

export const dataMode = mode;
// Default client-bound repos for places that import data layer on the client.
const { workspacesRepo, dictionariesRepo, transactionsRepo, workspaceMembersRepo, invitedMembersRepo } =
  createDataRepos();
export { workspacesRepo, dictionariesRepo, transactionsRepo, workspaceMembersRepo, invitedMembersRepo };

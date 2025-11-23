import type { WorkspacesRepo } from "@/data/workspaces/workspaces.repo";
import { workspacesRepo as mockWorkspacesRepo } from "@/data/workspaces/workspaces.mock";
import { workspacesRepo as supabaseWorkspacesRepo } from "@/data/workspaces/workspaces.supabase";
import type { DictionariesRepo } from "@/data/dictionaries/dictionaries.repo";
import { dictionariesRepo as mockDictionariesRepo } from "@/data/dictionaries/dictionaries.mock";
import { dictionariesRepo as supabaseDictionariesRepo } from "@/data/dictionaries/dictionaries.supabase";
import type { TransactionsRepo } from "@/data/transactions/transactions.repo";
import { transactionsRepo as mockTransactionsRepo } from "@/data/transactions/transactions.mock";
import { transactionsRepo as supabaseTransactionsRepo } from "@/data/transactions/transactions.supabase";

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
export const dictionariesRepo: DictionariesRepo =
  mode === "supabase" ? supabaseDictionariesRepo : mockDictionariesRepo;
export const transactionsRepo: TransactionsRepo =
  mode === "supabase" ? supabaseTransactionsRepo : mockTransactionsRepo;

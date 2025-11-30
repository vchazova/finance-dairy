import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { MemberRole } from "@/entities/workspaceMembers";

/** Create Supabase client inside Next.js route handler with cookie + auth forwarding. */
export async function createRouteSupabase(req: Request): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
      global: {
        headers: {
          Authorization: req.headers.get("authorization") || "",
        },
      },
    }
  );
}

/** Verify that user is member of workspace; throws on invalid/forbidden. Returns numeric workspace id. */
export async function assertWorkspaceMembership(
  supabase: SupabaseClient,
  workspaceId: number | string,
  userId: string
): Promise<number> {
  const workspaceIdNum = typeof workspaceId === "string" ? Number(workspaceId) : workspaceId;
  if (Number.isNaN(workspaceIdNum)) throw new Error("Invalid workspace");

  const { data, error } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceIdNum)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Forbidden");

  return workspaceIdNum;
}

/** Fetch role for a user in a workspace; returns null when not a member. */
export async function getWorkspaceRole(
  supabase: SupabaseClient,
  workspaceId: number | string,
  userId: string
): Promise<MemberRole | null> {
  const workspaceIdNum = typeof workspaceId === "string" ? Number(workspaceId) : workspaceId;
  if (Number.isNaN(workspaceIdNum)) throw new Error("Invalid workspace");

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceIdNum)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return data.role as MemberRole;
}

/** Ensure the user is the workspace owner; throws when not a member/owner. */
export async function assertWorkspaceOwner(
  supabase: SupabaseClient,
  workspaceId: number | string,
  userId: string
): Promise<number> {
  const workspaceIdNum = await assertWorkspaceMembership(supabase, workspaceId, userId);
  const role = await getWorkspaceRole(supabase, workspaceIdNum, userId);
  if (role !== "owner") throw new Error("Forbidden");
  return workspaceIdNum;
}

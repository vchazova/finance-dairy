import { NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/supabase/api";
import { createInvitedMembersSupabaseRepo } from "@/data/invitedMembers/invitedMembers.supabase";
import { InviteStatuses } from "@/entities/invitedMembers";

function parseStatus(value?: string | null) {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  return (InviteStatuses as readonly string[]).includes(normalized as any) ? normalized : undefined;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const supabase = await createRouteSupabase(req);
    const repo = createInvitedMembersSupabaseRepo(supabase);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = parseStatus(url.searchParams.get("status"));

    const invites = await repo.listByInviteeEmail(user.email.toLowerCase(), status ? { status: status as any } : undefined);
    if (invites.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const workspaceIds = Array.from(new Set(invites.map((invite) => Number(invite.workspaceId))));
    const { data: workspaces, error: workspacesError } = await supabase
      .from("workspaces")
      .select("id, name, slug")
      .in("id", workspaceIds);
    if (workspacesError) {
      console.warn("[invitesRoute] failed to fetch workspaces", workspacesError);
    }
    const workspaceMap = new Map((workspaces ?? []).map((ws) => [String(ws.id), ws]));

    const result = invites.map((invite) => {
      const workspace = workspaceMap.get(invite.workspaceId);
      return {
        ...invite,
        workspaceName: workspace?.name ?? "Workspace",
        workspaceSlug: workspace?.slug ?? invite.workspaceId,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to load invites";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

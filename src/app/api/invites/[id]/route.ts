import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteSupabase } from "@/lib/supabase/api";
import { createInvitedMembersSupabaseRepo } from "@/data/invitedMembers/invitedMembers.supabase";
import { createWorkspaceMembersSupabaseRepo } from "@/data/workspaceMembers/workspaceMembers.supabase";

const respondSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const invitesRepo = createInvitedMembersSupabaseRepo(supabase);
    const workspaceMembersRepo = createWorkspaceMembersSupabaseRepo(supabase);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user || !user.email) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const invite = await invitesRepo.getById(id);
    if (!invite) {
      return NextResponse.json({ ok: false, message: "Invite not found" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ ok: false, message: "Invite already processed" }, { status: 400 });
    }

    if (invite.inviteeEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const json = await req.json().catch(() => ({}));
    const parsed = respondSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid action", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    if (parsed.data.action === "accept") {
      const membershipResult = await workspaceMembersRepo.add({
        workspaceId: invite.workspaceId,
        userId: user.id,
        userEmail: user.email.toLowerCase(),
        role: invite.role,
      });
      if (!membershipResult.ok) {
        return NextResponse.json({ ok: false, message: membershipResult.message }, { status: 400 });
      }

      const updateResult = await invitesRepo.update(id, {
        status: "accepted",
        inviteeUserId: user.id,
        acceptedAt: new Date().toISOString(),
      });
      if (!updateResult.ok) {
        return NextResponse.json({ ok: false, message: updateResult.message }, { status: 400 });
      }

      return NextResponse.json({ ok: true, status: "accepted" }, { status: 200 });
    }

    const declineResult = await invitesRepo.update(id, {
      status: "cancelled",
      inviteeUserId: user.id,
    });
    if (!declineResult.ok) {
      return NextResponse.json({ ok: false, message: declineResult.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, status: "cancelled" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Failed to update invite" },
      { status: 500 }
    );
  }
}

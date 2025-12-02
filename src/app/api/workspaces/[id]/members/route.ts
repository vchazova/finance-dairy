import { NextResponse } from "next/server";
import { assertWorkspaceMembership, assertWorkspaceOwner, createRouteSupabase } from "@/lib/supabase/api";
import { createWorkspaceMembersSupabaseRepo } from "@/data/workspaceMembers/workspaceMembers.supabase";
import type { MemberRole } from "@/entities/workspaceMembers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/workspaces/[id]/members - list members (requires membership).
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const repo = createWorkspaceMembersSupabaseRepo(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await assertWorkspaceMembership(supabase, idNum, user.id);

    const list = await repo.list(idNum);
    return NextResponse.json(list, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to load members";
    const status = message === "Forbidden" ? 403 : message === "Invalid id" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/workspaces/[id]/members - add member (owner only).
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const repo = createWorkspaceMembersSupabaseRepo(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    await assertWorkspaceOwner(supabase, idNum, user.id);

    const json = await req.json().catch(() => ({}));
    const userId = json.user_id as string | undefined;
    const userEmail = json.user_email as string | undefined;
    const role = json.role as MemberRole | undefined;
    if (!userId) return NextResponse.json({ ok: false, message: "user_id required" }, { status: 400 });
    if (!userEmail) return NextResponse.json({ ok: false, message: "user_email required" }, { status: 400 });

    const result = await repo.add({ workspaceId: idNum, userId, userEmail, role });
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: result.id }, { status: 201 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to add member";
    const status = message === "Forbidden" ? 403 : message === "Invalid id" ? 400 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

// DELETE /api/workspaces/[id]/members?memberId= - remove member (owner only).
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const repo = createWorkspaceMembersSupabaseRepo(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");
    if (!memberId) return NextResponse.json({ ok: false, message: "memberId required" }, { status: 400 });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    await assertWorkspaceOwner(supabase, idNum, user.id);

    const result = await repo.remove(memberId);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to remove member";
    const status = message === "Forbidden" ? 403 : message === "Invalid id" ? 400 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

// PATCH /api/workspaces/[id]/members - update member role (owner only).
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const repo = createWorkspaceMembersSupabaseRepo(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const json = await req.json().catch(() => ({}));
    const memberId = json.member_id as string | undefined;
    const role = json.role as MemberRole | undefined;
    if (!memberId) return NextResponse.json({ ok: false, message: "member_id required" }, { status: 400 });
    if (!role) return NextResponse.json({ ok: false, message: "role required" }, { status: 400 });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    await assertWorkspaceOwner(supabase, idNum, user.id);

    const result = await repo.update(memberId, { role });
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to update member";
    const status = message === "Forbidden" ? 403 : message === "Invalid id" ? 400 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

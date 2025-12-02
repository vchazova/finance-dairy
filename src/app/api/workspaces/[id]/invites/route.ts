import { NextResponse } from "next/server";
import { z } from "zod";
import { assertWorkspaceMembership, assertWorkspaceOwner, createRouteSupabase } from "@/lib/supabase/api";
import { createInvitedMembersSupabaseRepo } from "@/data/invitedMembers/invitedMembers.supabase";
import { InviteStatuses } from "@/entities/invitedMembers";
import type { InviteStatus } from "@/entities/invitedMembers";
import { MemberRole } from "@/entities/workspaceMembers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(MemberRole).optional(),
  expires_at: z.union([z.string(), z.date()]).optional().nullable(),
  message: z.string().max(500).optional().nullable(),
});

function parseDate(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function parseStatus(value?: string | null): InviteStatus | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  return (InviteStatuses as readonly string[]).includes(normalized as any) ? (normalized as InviteStatus) : undefined;
}

// GET /api/workspaces/[id]/invites
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const repo = createInvitedMembersSupabaseRepo(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await assertWorkspaceMembership(supabase, idNum, user.id);

    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const status = parseStatus(statusParam);

    const list = await repo.list(idNum, status ? { status } : undefined);
    return NextResponse.json(list, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to load invites";
    const status = message === "Forbidden" ? 403 : message === "Invalid id" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/workspaces/[id]/invites
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const repo = createInvitedMembersSupabaseRepo(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    await assertWorkspaceOwner(supabase, idNum, user.id);

    const json = await req.json().catch(() => ({}));
    const parsed = inviteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const expiresAt = parseDate(parsed.data.expires_at ?? null);
    const result = await repo.create({
      workspaceId: idNum,
      inviterUserId: user.id,
      inviteeEmail: parsed.data.email,
      role: parsed.data.role ?? "member",
      expiresAt,
      message: parsed.data.message ?? null,
    });

    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true, invite: result.invite }, { status: 201 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to create invite";
    const status = message === "Forbidden" ? 403 : message === "Invalid id" ? 400 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

// DELETE /api/workspaces/[id]/invites?inviteId=
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const repo = createInvitedMembersSupabaseRepo(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const url = new URL(req.url);
    const inviteId = url.searchParams.get("inviteId");
    if (!inviteId) return NextResponse.json({ ok: false, message: "inviteId required" }, { status: 400 });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    await assertWorkspaceOwner(supabase, idNum, user.id);

    const result = await repo.remove(inviteId);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to delete invite";
    const status = message === "Forbidden" ? 403 : message === "Invalid id" ? 400 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

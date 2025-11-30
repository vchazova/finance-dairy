import { NextResponse } from "next/server";
import { transactionUpdateSchema } from "@/entities/transactions";
import { assertWorkspaceMembership, createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getAuthUser(supabase: any) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return user;
}

async function ensureAccess(supabase: any, repo: any, idNum: number, userId: string) {
  const existing = await repo.get(idNum);
  if (!existing) {
    const err: any = new Error("Not found");
    err.status = 404;
    throw err;
  }
  await assertWorkspaceMembership(supabase, existing.workspace_id, userId);
  return existing;
}

// GET /api/transactions/[id] - fetch single transaction with membership check.
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const supabase = await createRouteSupabase(req);
    const { transactionsRepo: repo } = createDataRepos(supabase);
    const user = await getAuthUser(supabase);
    const existing = await ensureAccess(supabase, repo, idNum, user.id);
    return NextResponse.json(existing, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to load transaction";
    const status = err?.status ?? (message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : message === "Invalid workspace" ? 400 : 500);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/transactions/[id] - update transaction fields.
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const supabase = await createRouteSupabase(req);
    const { transactionsRepo: repo } = createDataRepos(supabase);
    const user = await getAuthUser(supabase);
    await ensureAccess(supabase, repo, idNum, user.id);

    const json = await req.json().catch(() => ({}));
    const parsed = transactionUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await repo.update(idNum, parsed.data);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to update transaction";
    const status = err?.status ?? (message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : message === "Invalid workspace" ? 400 : 500);
    return NextResponse.json({ ok: false, message }, { status });
  }
}

// DELETE /api/transactions/[id] - remove transaction (membership required).
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const supabase = await createRouteSupabase(req);
    const { transactionsRepo: repo } = createDataRepos(supabase);
    const user = await getAuthUser(supabase);
    await ensureAccess(supabase, repo, idNum, user.id);

    const result = await repo.remove(idNum);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to delete transaction";
    const status = err?.status ?? (message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : message === "Invalid workspace" ? 400 : 500);
    return NextResponse.json({ ok: false, message }, { status });
  }
}

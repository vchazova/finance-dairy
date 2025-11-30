import { NextResponse } from "next/server";
import { categoryUpdateSchema } from "@/entities/dictionaries";
import { assertWorkspaceOwner, createRouteSupabase } from "@/lib/supabase/api";
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

async function getExisting(repo: any, idNum: number) {
  const existing = await repo.getCategory(idNum);
  if (!existing) {
    const err: any = new Error("Not found");
    err.status = 404;
    throw err;
  }
  return existing;
}

// PATCH /api/dictionaries/categories/[id] - update category (owner only).
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
    const user = await getAuthUser(supabase);
    const existing = await getExisting(repo, idNum);
    await assertWorkspaceOwner(supabase, existing.workspace_id, user.id);

    const json = await req.json().catch(() => ({}));
    const parsed = categoryUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await repo.updateCategory(idNum, parsed.data);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to update category";
    const status = err?.status ?? (message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500);
    return NextResponse.json({ ok: false, message }, { status });
  }
}

// DELETE /api/dictionaries/categories/[id] - delete category (owner only).
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
    const user = await getAuthUser(supabase);
    const existing = await getExisting(repo, idNum);
    await assertWorkspaceOwner(supabase, existing.workspace_id, user.id);

    const result = await repo.removeCategory(idNum);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to delete category";
    const status = err?.status ?? (message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500);
    return NextResponse.json({ ok: false, message }, { status });
  }
}

import { NextResponse } from "next/server";
import { workspaceFormSchema } from "@/entities/workspaces";
import { createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/workspaces/[id] - update workspace (name).
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const { workspacesRepo: repo } = createDataRepos(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    const json = await req.json().catch(() => ({}));
    const parsed = workspaceFormSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const result = await repo.update(idNum, { name: parsed.data.name });
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Failed to update workspace" },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[id] - delete workspace.
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const { workspacesRepo: repo } = createDataRepos(supabase);
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const result = await repo.remove(idNum);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Failed to delete workspace" },
      { status: 500 }
    );
  }
}

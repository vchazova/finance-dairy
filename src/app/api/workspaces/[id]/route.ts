import { NextResponse } from "next/server";
import { workspaceFormSchema } from "@/entities/workspaces";
import { assertWorkspaceMembership, assertWorkspaceOwner, createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";
import { slugifyWorkspaceName } from "@/lib/slug";
import type { SupabaseClient } from "@supabase/supabase-js";

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

    await assertWorkspaceMembership(supabase, idNum, user.id);

    const {
      data: existing,
      error: existingErr,
    } = await supabase.from("workspaces").select("id, name, slug").eq("id", idNum).single();
    if (existingErr || !existing) {
      return NextResponse.json({ ok: false, message: "Workspace not found" }, { status: 404 });
    }

    const trimmedName = parsed.data.name.trim();
    const nameChanged = trimmedName !== existing.name;
    const nextSlug = nameChanged
      ? await generateUniqueWorkspaceSlugForUpdate(trimmedName, supabase, idNum)
      : undefined;

    const result = await repo.update(idNum, {
      name: trimmedName,
      slug: nextSlug,
      description: parsed.data.description ?? null,
    });
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true, slug: nextSlug ?? existing.slug }, { status: 200 });
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

    await assertWorkspaceOwner(supabase, idNum, user.id);

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

async function generateUniqueWorkspaceSlugForUpdate(
  name: string,
  supabase: SupabaseClient,
  workspaceId: number
): Promise<string> {
  const base = slugifyWorkspaceName(name);
  let candidate = base;
  let attempts = 1;
  while (await slugTaken(candidate, supabase, workspaceId)) {
    candidate = `${base}-${attempts}`;
    attempts += 1;
  }
  return candidate;
}

async function slugTaken(slug: string, supabase: SupabaseClient, workspaceId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", slug)
    .neq("id", workspaceId)
    .limit(1);
  if (error) throw error;
  return Boolean(data && data.length > 0);
}

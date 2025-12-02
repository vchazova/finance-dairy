import { NextResponse } from "next/server";
import { workspaceFormSchema } from "@/entities/workspaces";
import { createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";
import type { WorkspacesRepo, WorkspaceListFilters } from "@/data/workspaces/workspaces.repo";
import { slugifyWorkspaceName } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

//TODO дл удаления воркспейса настроить каскадное удаление всех связанных данных в таблице участников воркспейса и т.д.

// GET /api/workspaces - list workspaces current user belongs to.
export async function GET(req: Request) {
  try {
    const filters = extractWorkspaceListFilters(req);
    const supabase = await createRouteSupabase(req);
    const { workspacesRepo: repo } = createDataRepos(supabase);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await repo.listForUser(user.id, filters);
    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to load workspaces" },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - create workspace and owner membership for current user.
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = workspaceFormSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createRouteSupabase(req);
    const { workspacesRepo: repo } = createDataRepos(supabase);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const userEmail = user.email?.trim();
    if (!userEmail) {
      return NextResponse.json(
        { ok: false, message: "User email is required to create workspace" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueWorkspaceSlug(parsed.data.name, repo);

    const result = await repo.create({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      userId: user.id,
      userEmail,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: String(result.id), slug: result.slug }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Failed to create workspace" },
      { status: 500 }
    );
  }
}

async function generateUniqueWorkspaceSlug(name: string, repo: WorkspacesRepo) {
  const base = slugifyWorkspaceName(name);
  let candidate = base;
  let attempts = 1;
  while (await repo.slugExists(candidate)) {
    candidate = `${base}-${attempts}`;
    attempts += 1;
  }
  return candidate;
}

function extractWorkspaceListFilters(req: Request): WorkspaceListFilters | undefined {
  const url = new URL(req.url);
  const filters: WorkspaceListFilters = {};

  const search = url.searchParams.get("search");
  if (search) {
    const trimmed = search.trim();
    if (trimmed) filters.search = trimmed;
  }

  const slug = url.searchParams.get("slug");
  if (slug) {
    const trimmed = slug.trim();
    if (trimmed) filters.slug = trimmed;
  }

  const role = url.searchParams.get("role");
  if (role) {
    const trimmed = role.trim();
    if (trimmed) filters.role = trimmed;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

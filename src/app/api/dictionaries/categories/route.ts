import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { categoryInsertSchema, categoryRowSchema } from "@/entities/dictionaries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function createSupabase(req: Request): Promise<SupabaseClient> {
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

async function assertMembership(
  supabase: SupabaseClient,
  workspaceId: number | string,
  userId: string
) {
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  const workspaceIdNum = Number(workspaceId);
  if (Number.isNaN(workspaceIdNum)) return NextResponse.json({ error: "workspaceId invalid" }, { status: 400 });

  try {
    const supabase = await createSupabase(req);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertMembership(supabase, workspaceIdNum, user.id);

    const { data: rows, error } = await supabase
      .from("categories")
      .select("*")
      .eq("workspace_id", workspaceIdNum)
      .order("name", { ascending: true });
    if (error) throw error;

    const list = (rows ?? []).map((r: any) => categoryRowSchema.parse(r));
    return NextResponse.json(list, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed to load";
    const status = msg === "Forbidden" ? 403 : msg === "Invalid workspace" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabase(req);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json().catch(() => ({}));
    const parsed = categoryInsertSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const workspaceIdNum = await assertMembership(supabase, parsed.data.workspace_id, user.id);

    const payload = {
      name: parsed.data.name,
      icon: (parsed.data as any).icon ?? null,
      color: (parsed.data as any).color ?? null,
      workspace_id: workspaceIdNum,
    };

    const { data: row, error } = await supabase.from("categories").insert(payload).select("id").single();
    if (error || !row) {
      return NextResponse.json(
        { ok: false, message: error?.message || "Failed to create" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, id: Number(row.id) }, { status: 201 });
  } catch (e: any) {
    const msg = e?.message || "Failed to create";
    const status = msg === "Forbidden" ? 403 : msg === "Invalid workspace" ? 400 : 500;
    return NextResponse.json({ ok: false, message: msg }, { status });
  }
}

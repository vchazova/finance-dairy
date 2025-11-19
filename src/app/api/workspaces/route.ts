import { NextResponse } from "next/server";
import { workspaceFormSchema } from "@/entities/workspaces";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

//TODO дл удаления воркспейса настроить каскадное удаление всех связанных данных в таблице участников воркспейса и т.д.

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Avoid nested selects to prevent recursive RLS: first memberships, then workspaces
    const { data: memberships, error: memErr } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id);

    if (memErr) throw memErr;

    const ids = Array.from(
      new Set((memberships ?? []).map((m: any) => m.workspace_id))
    );
    if (ids.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const { data: workspaces, error: wsErr } = await supabase
      .from("workspaces")
      .select("id, name")
      .in("id", ids);

    if (wsErr) throw wsErr;

    const wsMap = new Map((workspaces ?? []).map((w: any) => [w.id, w]));
    const items = (memberships ?? [])
      .map((m: any) => {
        const ws = wsMap.get(m.workspace_id);
        if (!ws) return null;
        return {
          id: String(ws.id),
          name: ws.name as string,
          role: m.role as string,
        };
      })
      .filter(Boolean);

    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to load workspaces" },
      { status: 500 }
    );
  }
}

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

    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    // 1) create workspace
    const { data: ws, error: wsErr } = await supabase
      .from("workspaces")
      .insert({ name: parsed.data.name, admin_user_id: user.id })
      .select("id")
      .single();

    if (wsErr || !ws) {
      return NextResponse.json(
        { ok: false, message: wsErr?.message ?? "Failed to create workspace" },
        { status: 400 }
      );
    }

    // 2) add membership for current user
    const { error: memErr } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: ws.id, user_id: user.id, role: "owner" });

    if (memErr) {
      return NextResponse.json(
        { ok: false, message: memErr.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, id: String(ws.id) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Failed to create workspace" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  transactionInsertSchema,
  transactionRowSchema,
} from "@/entities/transactions";

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
  const workspaceIdNum =
    typeof workspaceId === "string" ? Number(workspaceId) : workspaceId;
  if (Number.isNaN(workspaceIdNum)) throw new Error("Invalid workspace");
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceIdNum)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Forbidden");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId required" },
      { status: 400 }
    );
  }
  const workspaceIdNum = Number(workspaceId);
  if (Number.isNaN(workspaceIdNum)) {
    return NextResponse.json({ error: "workspaceId invalid" }, { status: 400 });
  }

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
      .from("transactions")
      .select("*")
      .eq("workspace_id", workspaceIdNum)
      .order("date", { ascending: false });

    if (error) throw error;

    const items = (rows ?? []).map((row: any) =>
      transactionRowSchema.parse({ ...row, amount: String(row.amount) })
    );
    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to load transactions";
    const status =
      message === "Forbidden"
        ? 403
        : message === "Invalid workspace"
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
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
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = transactionInsertSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await assertMembership(supabase, parsed.data.workspace_id, user.id);

    const payload = {
      workspace_id: parsed.data.workspace_id,
      user_id: user.id,
      payment_type_id: parsed.data.payment_type_id,
      category_id: parsed.data.category_id,
      currency_id: parsed.data.currency_id,
      amount: String(parsed.data.amount),
      date: new Date(parsed.data.date as any).toISOString(),
      comment: parsed.data.comment ?? null,
      is_decrease: parsed.data.is_decrease ?? true,
      updated_at: new Date().toISOString(),
    };

    const { data: row, error } = await supabase
      .from("transactions")
      .insert(payload)
      .select("id")
      .single();

    if (error || !row) {
      return NextResponse.json(
        { ok: false, message: error?.message ?? "Failed to create" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, id: Number(row.id) }, { status: 201 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to create transaction";
    const status =
      message === "Forbidden"
        ? 403
        : message === "Invalid workspace"
        ? 400
        : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

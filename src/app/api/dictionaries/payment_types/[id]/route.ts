import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { paymentTypeRowSchema, paymentTypeUpdateSchema } from "@/entities/dictionaries";

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

async function fetchPaymentType(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase.from("payment_types").select("*").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
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
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabase(req);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idNum = Number(params.id);
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const row = await fetchPaymentType(supabase, idNum);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await assertMembership(supabase, row.workspace_id, user.id);
    const parsed = paymentTypeRowSchema.parse(row);
    return NextResponse.json(parsed, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed to load";
    const status = msg === "Forbidden" ? 403 : msg === "Invalid workspace" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabase(req);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const idNum = Number(params.id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const existing = await fetchPaymentType(supabase, idNum);
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    await assertMembership(supabase, existing.workspace_id, user.id);

    const json = await req.json().catch(() => ({}));
    const parsed = paymentTypeUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const patch: Record<string, any> = { ...parsed.data };
    const { error } = await supabase.from("payment_types").update(patch).eq("id", idNum);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed to update";
    const status = msg === "Forbidden" ? 403 : msg === "Invalid workspace" ? 400 : 500;
    return NextResponse.json({ ok: false, message: msg }, { status });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabase(req);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const idNum = Number(params.id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const existing = await fetchPaymentType(supabase, idNum);
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    await assertMembership(supabase, existing.workspace_id, user.id);

    const { error } = await supabase.from("payment_types").delete().eq("id", idNum);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed to delete";
    const status = msg === "Forbidden" ? 403 : msg === "Invalid workspace" ? 400 : 500;
    return NextResponse.json({ ok: false, message: msg }, { status });
  }
}

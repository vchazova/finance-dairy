import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { currencyRowSchema, currencyUpdateSchema } from "@/entities/dictionaries";

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

async function fetchCurrency(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase.from("currencies").select("*").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
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

    const row = await fetchCurrency(supabase, idNum);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const parsed = currencyRowSchema.parse(row);
    return NextResponse.json(parsed, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load" }, { status: 500 });
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

    const existing = await fetchCurrency(supabase, idNum);
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    const json = await req.json().catch(() => ({}));
    const parsed = currencyUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const patch: Record<string, any> = { ...parsed.data };
    const { error } = await supabase.from("currencies").update(patch).eq("id", idNum);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to update" }, { status: 500 });
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

    const existing = await fetchCurrency(supabase, idNum);
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    const { error } = await supabase.from("currencies").delete().eq("id", idNum);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to delete" }, { status: 500 });
  }
}

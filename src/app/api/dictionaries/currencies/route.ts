import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { currencyInsertSchema, currencyRowSchema } from "@/entities/dictionaries";

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

export async function GET(req: Request) {
  try {
    const supabase = await createSupabase(req);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rows, error } = await supabase.from("currencies").select("*").order("code", { ascending: true });
    if (error) throw error;
    const list = (rows ?? []).map((r: any) => currencyRowSchema.parse(r));
    return NextResponse.json(list, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load" }, { status: 500 });
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
    const parsed = currencyInsertSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const payload = {
      code: parsed.data.code,
      name: parsed.data.name,
      symbol: parsed.data.symbol,
    };
    const { data: row, error } = await supabase.from("currencies").insert(payload).select("id").single();
    if (error || !row) {
      return NextResponse.json(
        { ok: false, message: error?.message || "Failed to create" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, id: Number(row.id) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to create" }, { status: 500 });
  }
}

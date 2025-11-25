import { NextResponse } from "next/server";
import { currencyInsertSchema } from "@/entities/dictionaries";
import { createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/dictionaries/currencies - list currencies (global).
export async function GET(req: Request) {
  try {
    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await repo.listCurrencies();
    return NextResponse.json(list, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load" }, { status: 500 });
  }
}

// POST /api/dictionaries/currencies - create currency (global).
export async function POST(req: Request) {
  try {
    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
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

    const result = await repo.createCurrency(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message || "Failed to create" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, id: Number(result.id) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to create" }, { status: 500 });
  }
}

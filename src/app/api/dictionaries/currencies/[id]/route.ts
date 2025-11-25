import { NextResponse } from "next/server";
import { currencyUpdateSchema } from "@/entities/dictionaries";
import { createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/dictionaries/currencies/[id] - fetch currency by id.
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const row = await repo.getCurrency(idNum);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(row, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load" }, { status: 500 });
  }
}

// PATCH /api/dictionaries/currencies/[id] - update currency.
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const existing = await repo.getCurrency(idNum);
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    const json = await req.json().catch(() => ({}));
    const parsed = currencyUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await repo.updateCurrency(idNum, parsed.data);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/dictionaries/currencies/[id] - delete currency.
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const existing = await repo.getCurrency(idNum);
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    const result = await repo.removeCurrency(idNum);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to delete" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { currencyUpdateSchema } from "@/entities/dictionaries";
import { createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getAuthUser(supabase: any) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return user;
}

// PATCH /api/dictionaries/currencies/[id] - update currency (auth required).
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
    await getAuthUser(supabase);

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
  } catch (err: any) {
    const message = err?.message ?? "Failed to update currency";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

// DELETE /api/dictionaries/currencies/[id] - delete currency (auth required).
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const supabase = await createRouteSupabase(req);
    const { dictionariesRepo: repo } = createDataRepos(supabase);
    await getAuthUser(supabase);

    const result = await repo.removeCurrency(idNum);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message ?? "Failed to delete currency";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

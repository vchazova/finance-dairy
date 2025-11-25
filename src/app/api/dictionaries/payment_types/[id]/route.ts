import { NextResponse } from "next/server";
import { paymentTypeUpdateSchema } from "@/entities/dictionaries";
import { assertWorkspaceMembership, createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/dictionaries/payment_types/[id] - fetch payment type with membership check.
export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    const idNum = Number(params.id);
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const row = await repo.getPaymentType(idNum);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await assertWorkspaceMembership(supabase, row.workspace_id, user.id);
    return NextResponse.json(row, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed to load";
    const status = msg === "Forbidden" ? 403 : msg === "Invalid workspace" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

// PATCH /api/dictionaries/payment_types/[id] - update payment type.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const idNum = Number(params.id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const existing = await repo.getPaymentType(idNum);
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    await assertWorkspaceMembership(supabase, existing.workspace_id, user.id);

    const json = await req.json().catch(() => ({}));
    const parsed = paymentTypeUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await repo.updatePaymentType(idNum, parsed.data);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed to update";
    const status = msg === "Forbidden" ? 403 : msg === "Invalid workspace" ? 400 : 500;
    return NextResponse.json({ ok: false, message: msg }, { status });
  }
}

// DELETE /api/dictionaries/payment_types/[id] - delete payment type.
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    const idNum = Number(params.id);
    if (Number.isNaN(idNum)) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

    const existing = await repo.getPaymentType(idNum);
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    await assertWorkspaceMembership(supabase, existing.workspace_id, user.id);

    const result = await repo.removePaymentType(idNum);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed to delete";
    const status = msg === "Forbidden" ? 403 : msg === "Invalid workspace" ? 400 : 500;
    return NextResponse.json({ ok: false, message: msg }, { status });
  }
}

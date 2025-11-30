import { NextResponse } from "next/server";
import { transactionInsertSchema } from "@/entities/transactions";
import { assertWorkspaceMembership, createRouteSupabase } from "@/lib/supabase/api";
import { createDataRepos } from "@/data";
import type { TransactionListFilters } from "@/data/transactions/transactions.repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/transactions - list workspace transactions after auth + membership.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }
  const workspaceIdNum = Number(workspaceId);
  if (Number.isNaN(workspaceIdNum)) {
    return NextResponse.json({ error: "workspaceId invalid" }, { status: 400 });
  }

  const filters: TransactionListFilters = {};
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const categoryId = url.searchParams.get("categoryId");
  const paymentTypeId = url.searchParams.get("paymentTypeId");
  const currencyId = url.searchParams.get("currencyId");
  const isDecrease = url.searchParams.get("isDecrease");

  if (startDate && Number.isNaN(new Date(startDate).valueOf())) {
    return NextResponse.json({ error: "startDate invalid" }, { status: 400 });
  }
  if (endDate && Number.isNaN(new Date(endDate).valueOf())) {
    return NextResponse.json({ error: "endDate invalid" }, { status: 400 });
  }
  if (categoryId && Number.isNaN(Number(categoryId))) {
    return NextResponse.json({ error: "categoryId invalid" }, { status: 400 });
  }
  if (paymentTypeId && Number.isNaN(Number(paymentTypeId))) {
    return NextResponse.json({ error: "paymentTypeId invalid" }, { status: 400 });
  }
  if (currencyId && Number.isNaN(Number(currencyId))) {
    return NextResponse.json({ error: "currencyId invalid" }, { status: 400 });
  }
  if (isDecrease && !["true", "false"].includes(isDecrease)) {
    return NextResponse.json({ error: "isDecrease invalid" }, { status: 400 });
  }

  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (categoryId) filters.categoryId = Number(categoryId);
  if (paymentTypeId) filters.paymentTypeId = Number(paymentTypeId);
  if (currencyId) filters.currencyId = Number(currencyId);
  if (isDecrease) filters.isDecrease = isDecrease === "true";

  try {
    const supabase = await createRouteSupabase(req);
    const { transactionsRepo: repo } = createDataRepos(supabase);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertWorkspaceMembership(supabase, workspaceIdNum, user.id);

    const items = await repo.list(workspaceIdNum, filters);
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

// POST /api/transactions - create transaction for workspace and current user.
export async function POST(req: Request) {
  try {
    const supabase = await createRouteSupabase(req);
    const { transactionsRepo: repo } = createDataRepos(supabase);
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

    const body = await req.json().catch(() => ({}));
    const json = { ...body, user_id: user.id };
    const parsed = transactionInsertSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const workspaceIdNum = await assertWorkspaceMembership(
      supabase,
      parsed.data.workspace_id,
      user.id
    );

    const result = await repo.create({
      ...parsed.data,
      workspace_id: workspaceIdNum,
      user_id: user.id,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message ?? "Failed to create" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, id: Number(result.id) }, { status: 201 });
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

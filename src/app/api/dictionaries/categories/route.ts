import { NextResponse } from "next/server";
import { dictionariesRepo } from "@/data";
import { categoryInsertSchema } from "@/entities/dictionaries";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  try {
    const list = await dictionariesRepo.listCategories(workspaceId);
    return NextResponse.json(list, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = categoryInsertSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const res = await dictionariesRepo.createCategory(parsed.data);
    return NextResponse.json(res, { status: res.ok ? 201 : 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to create" }, { status: 500 });
  }
}


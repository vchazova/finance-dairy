import { NextResponse } from "next/server";
import { dictionariesRepo } from "@/data";
import { categoryUpdateSchema } from "@/entities/dictionaries";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await dictionariesRepo.getCategory(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item, { status: 200 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = categoryUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const res = await dictionariesRepo.updateCategory(params.id, parsed.data);
    return NextResponse.json(res, { status: res.ok ? 200 : 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const res = await dictionariesRepo.removeCategory(params.id);
  return NextResponse.json(res, { status: res.ok ? 200 : 404 });
}


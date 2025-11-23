import { NextResponse } from "next/server";
import { dictionariesRepo } from "@/data";
import { currencyInsertSchema, currencyUpdateSchema } from "@/entities/dictionaries";

export async function GET() {
  try {
    const list = await dictionariesRepo.listCurrencies();
    return NextResponse.json(list, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = currencyInsertSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }
    const res = await dictionariesRepo.createCurrency(parsed.data);
    return NextResponse.json(res, { status: res.ok ? 201 : 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed to create" }, { status: 500 });
  }
}


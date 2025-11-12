import { NextResponse } from "next/server";
import { workspacesRepo } from "@/data";
import { workspaceFormSchema } from "@/entities/workspaces";

function getUserIdFromRequest(req: Request): string {
  // Temporary while on mocks: allow override via header, else default seed user
  return (
    req.headers.get("x-user-id") ?? "11111111-1111-4111-8111-111111111111"
  );
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    const items = await workspacesRepo.listForUser(userId);
    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to load workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    const json = await req.json().catch(() => ({}));
    const parsed = workspaceFormSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const res = await workspacesRepo.create({ name: parsed.data.name, userId });
    return NextResponse.json(res, { status: res.ok ? 201 : 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Failed to create workspace" },
      { status: 500 }
    );
  }
}


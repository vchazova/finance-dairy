"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function createWorkspace({ name }: { name: string }) {
  const supabase = createSupabaseServer();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, message: "Не авторизовано" } as const;
  }

  // 1) create workspace
  const { data: ws, error: wsErr } = await supabase
    .from("workspaces")
    .insert({ name })
    .select("id")
    .single();

  if (wsErr || !ws) {
    return {
      ok: false,
      message: wsErr?.message ?? "Не удалось создать пространство",
    } as const;
  }

  // 2) add membership for current user as 'owner' (or 'admin')
  const { error: memErr } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: ws.id, user_id: user.id, role: "owner" });

  if (memErr) {
    return { ok: false, message: memErr.message } as const;
  }

  revalidatePath("/");
  return { ok: true } as const;
}

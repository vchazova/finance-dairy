"use client";

// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import WorkspacesGrid from "@/components/workspaces/WorkspacesGrid";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { WorkspaceListItem } from "@/types/workspaces";
import { useAuth } from "@/providers/AuthProvider";

export default function HomePage() {
  // const supabase = createSupabaseServer();
  const { session } = useAuth();

  const items: WorkspaceListItem[] = []
    .filter((m: any) => m.workspace)
    .map((m: any) => ({
      id: m.workspace.id as string,
      name: m.workspace.name as string,
      slug: (m.workspace.slug as string) ?? null,
      role: m.role as string,
    }));

  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <Header user={session} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Мои рабочие пространства
          </h1>
          {/* Placeholder for future filters/search */}
        </div>

        <WorkspacesGrid items={items} />
      </main>
    </div>
  );
}

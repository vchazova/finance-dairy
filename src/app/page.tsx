"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import WorkspacesGrid from "@/components/workspaces/WorkspacesGrid";
import type { WorkspaceListItem } from "@/types/workspaces";
import { useAuth } from "@/providers/AuthProvider";

export default function HomePage() {
  const { session } = useAuth();

  const [list, setList] = useState<WorkspaceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session?.user?.id) {
        setList([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/workspaces", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
        });
        if (!res.ok) {
          const msg =
            (await res.text().catch(() => "")) ||
            `Request failed (${res.status})`;
          throw new Error(msg);
        }
        const data = (await res.json()) as WorkspaceListItem[];
        if (!cancelled) setList(data ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load workspaces");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const items: WorkspaceListItem[] = []
    .filter((m: any) => m.workspace)
    .map((m: any) => ({
      id: m.workspace.id as string,
      name: m.workspace.name as string,
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

        {loading ? (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-[hsl(var(--fg-muted))]">
            Загрузка...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300 p-4 text-center text-red-600">
            {error}
          </div>
        ) : (
          <WorkspacesGrid items={list} />
        )}
      </main>
    </div>
  );
}

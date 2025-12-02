"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";
import type {
  NormalizedCategory,
  NormalizedCurrency,
  NormalizedPaymentType,
} from "@/entities/dictionaries/normalize";
import { WorkspaceDictionariesBlock } from "@/app/[workspace_id]/views/settings/DictionariesBlock";
import { WorkspaceMembersBlock } from "@/app/[workspace_id]/views/settings/MembersBlock";

export default function WorkspaceSettingsClient({
  workspaceId,
  initialCategories = [],
  initialPaymentTypes = [],
  initialCurrencies = [],
}: {
  workspaceId: string;
  initialCategories?: NormalizedCategory[];
  initialPaymentTypes?: NormalizedPaymentType[];
  initialCurrencies?: NormalizedCurrency[];
}) {
  const { session } = useAuth();
  const workspaceSlug = workspaceId;

  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <Header user={session} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--fg-muted))]">
                Workspace settings
              </p>
              <h1 className="text-2xl font-semibold leading-tight">Dictionaries</h1>
              <p className="text-sm text-[hsl(var(--fg-muted))]">
                Manage categories, payment types, currencies, and members for this workspace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/${workspaceSlug}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))]"
              >
                Back
              </Link>
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--fg-muted))]">
                Workspace #{workspaceId}
              </span>
            </div>
          </div>
        </div>

        <WorkspaceDictionariesBlock
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
          initialCategories={initialCategories}
          initialPaymentTypes={initialPaymentTypes}
          initialCurrencies={initialCurrencies}
        />

        <WorkspaceMembersBlock workspaceSlug={workspaceSlug} />
      </main>
    </div>
  );
}


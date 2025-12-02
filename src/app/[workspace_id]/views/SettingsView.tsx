import Link from "next/link";
import * as React from "react";

export default function SettingsView({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-sm text-[hsl(var(--fg))]">
      <h3 className="text-lg font-semibold">Workspace settings</h3>
      <p className="mt-2 text-[hsl(var(--fg-muted))]">
        Manage categories, payment types, members, and other workspace preferences.
      </p>
      <Link
        href={`/${workspaceSlug}/settings`}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-[hsl(var(--border))] px-4 text-sm font-medium hover:bg-[hsl(var(--border))]/30">
        Open settings page
      </Link>
    </div>
  );
}

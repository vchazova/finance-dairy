"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/Button";

export function WorkspaceMembersBlock({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <div className="space-y-3">
        <p className="text-sm text-[hsl(var(--fg-muted))]">
          Member management is coming soon. You will be able to invite teammates, assign roles, and
          monitor invitation statuses directly on this page.
        </p>
        <p className="text-xs text-[hsl(var(--fg-muted))]">
          For now you can use the full settings page to view the current list of workspace members.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled
            className="bg-[hsl(var(--border))]/40 text-[hsl(var(--fg-muted))]"
          >
            Add member
          </Button>
          <Link
            href={`/${workspaceSlug}/settings`}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-[hsl(var(--border))] px-3 text-sm font-medium hover:bg-[hsl(var(--border))]/30"
          >
            Open full settings
          </Link>
        </div>
      </div>
    </div>
  );
}


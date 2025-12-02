import { useState, type PropsWithChildren } from "react";
import { ChevronDown } from "lucide-react";
import { WorkspaceDictionariesBlock } from "./settings/DictionariesBlock";
import { WorkspaceMembersBlock } from "./settings/MembersBlock";

export default function SettingsView({
  workspaceId,
  workspaceSlug,
}: {
  workspaceId: string;
  workspaceSlug: string;
}) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Dictionaries"
        description="Manage workspace categories, payment methods, and currencies without leaving this page."
        defaultOpen
      >
        <WorkspaceDictionariesBlock workspaceId={workspaceId} workspaceSlug={workspaceSlug} />
      </SettingsCard>

      <SettingsCard
        title="Members"
        description="Keep an eye on access levels. Dedicated member management will arrive soon."
        defaultOpen={false}
      >
        <WorkspaceMembersBlock workspaceSlug={workspaceSlug} />
      </SettingsCard>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  children,
  defaultOpen = true,
}: PropsWithChildren<{ title: string; description: string; defaultOpen?: boolean }>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">{title}</h2>
          <p className="text-sm text-[hsl(var(--fg-muted))]">{description}</p>
        </div>
        <span className="rounded-full border border-[hsl(var(--border))] p-1 text-[hsl(var(--fg-muted))] transition">
          <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
        </span>
      </button>
      {open && <div className="mt-4 space-y-6">{children}</div>}
    </section>
  );
}


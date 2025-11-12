"use client";

import { useState, useTransition } from "react";
import CreateWorkspaceDialog from "@/components/workspaces/CreateWorkspaceDialog";

export default function CreateWorkspaceButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
      >
        Новое пространство
      </button>
      {open && (
        <CreateWorkspaceDialog
          open={open}
          onOpenChange={setOpen}
          isPending={isPending}
          startTransition={startTransition}
        />
      )}
    </>
  );
}

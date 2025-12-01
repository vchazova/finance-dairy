"use client";

import * as React from "react";
import { Button } from "@/components/ui";
import CreateWorkspaceDialog from "@/components/workspaces/CreateWorkspaceDialog";

export type CreateWorkspaceButtonProps = {
  onCreated?: (workspaceId: string) => void;
};

export default function CreateWorkspaceButton({
  onCreated,
}: CreateWorkspaceButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--fg))] shadow-none hover:bg-black/5"
      >
        New workspace
      </Button>
      <CreateWorkspaceDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(payload) => {
          if (!payload) return;
          onCreated?.(payload.id);
        }}
      />
    </>
  );
}

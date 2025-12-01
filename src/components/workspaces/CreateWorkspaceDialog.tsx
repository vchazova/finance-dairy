"use client";

import * as React from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useApiFetch } from "@/lib/api/client";

export type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (payload: { id: string; name: string }) => void;
};

type CreateWorkspaceResponse = {
  ok: boolean;
  id?: string;
  message?: string;
};

export default function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const apiFetch = useApiFetch();
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setName("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleClose = React.useCallback(() => {
    if (submitting) return;
    onOpenChange(false);
  }, [onOpenChange, submitting]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;

      const trimmed = name.trim();
      if (trimmed.length < 2) {
        setError("Workspace name must be at least 2 characters.");
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        const data = await apiFetch<CreateWorkspaceResponse>(
          "/api/workspaces",
          {
            method: "POST",
            body: JSON.stringify({ name: trimmed }),
          }
        );

        if (!data?.ok || !data.id) {
          throw new Error(
            data?.message || "Failed to create workspace. Try again."
          );
        }

        onCreated?.({ id: data.id, name: trimmed });
        onOpenChange(false);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to create workspace. Please try again.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [apiFetch, name, onCreated, onOpenChange, submitting]
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create workspace"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="create-workspace-form"
            loading={submitting}
            disabled={name.trim().length < 2}
          >
            Create workspace
          </Button>
        </div>
      }
    >
      <form
        id="create-workspace-form"
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <Input
          label="Workspace name"
          placeholder="Finance HQ"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error ?? undefined}
          disabled={submitting}
        />
        <p className="text-sm text-[hsl(var(--fg-muted))]">
          Use workspaces to separate individual families, trips, or long-term
          goals.
        </p>
      </form>
    </Modal>
  );
}

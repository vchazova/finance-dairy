"use client";

import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  title = "Confirm action",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[hsl(var(--fg-muted))]">{description}</p>
    </Modal>
  );
}

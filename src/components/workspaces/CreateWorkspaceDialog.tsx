"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/providers/AuthProvider";

const schema = z.object({
  name: z
    .string()
    .min(2, "Минимум 2 символа")
    .max(80, "Слишком длинное название"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateWorkspaceDialog({
  open,
  onOpenChange,
  isPending,
  startTransition,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}) {
  const { session } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Portal mount node
  const mountNode = useMemo(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.setAttribute("data-portal", "create-workspace");
    return el;
  }, []);

  useEffect(() => {
    if (!mountNode) return;
    document.body.appendChild(mountNode);
    return () => {
      mountNode.remove();
    };
  }, [mountNode]);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    // Lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first focusable element
    const container = dialogRef.current;
    const focusables = container?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const list = Array.from(
        container?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || []
      ).filter((el) => !el.hasAttribute("disabled"));
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      setServerError(null);
      try {
        const res = await fetch("/api/workspaces", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({ name: values.name }),
        });
        const data = (await res.json().catch(() => null)) as
          | { ok: true; id: string }
          | { ok: false; message?: string }
          | null;
        if (!res.ok) {
          setServerError((data as any)?.message || `Request failed (${res.status})`);
          return;
        }
        if (data && "ok" in data && data.ok && (data as any).id) {
          onOpenChange(false);
        } else {
          setServerError((data as any)?.message || "Не удалось создать пространство");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unexpected error";
        setServerError(msg);
      }
    });
  }

  if (!open || !mountNode) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4 shadow-xl"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">Новое пространство</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 text-[hsl(var(--fg-muted))] hover:bg-[hsl(var(--card))]"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Название</label>
            <input
              type="text"
              placeholder="Например: Семейный бюджет"
              className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
            {serverError && !errors.name && (
              <p className="mt-1 text-sm text-red-600">{serverError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))]"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-9 rounded-xl bg-[hsl(var(--color-primary))] px-3 text-sm text-white disabled:opacity-60"
            >
              {isPending ? "Создание…" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    mountNode
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function AvatarMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { logout } = useAuth();

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      user?.email || user?.id || "user"
    )}`;
  const label = user?.user_metadata?.full_name || user?.email || "Аккаунт";

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-2 py-1 hover:bg-[hsl(var(--card))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
      >
        <span className="sr-only">Меню пользователя</span>
        <div className="relative size-8 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={label} className="size-full object-cover" />
        </div>
      </button>

      {open && (
        <div
          role="menu"
          tabIndex={-1}
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-1 shadow-lg"
        >
          <div className="px-3 py-2 text-sm text-[hsl(var(--fg-muted))]">
            {label}
          </div>
          <Link
            role="menuitem"
            href="/account"
            className="block cursor-pointer rounded-xl px-3 py-2 text-sm hover:bg-[hsl(var(--card))]"
            onClick={() => setOpen(false)}
          >
            Личный кабинет
          </Link>
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Выйти
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

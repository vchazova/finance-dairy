"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import UserMenu from "@/components/shared/UserMenu";

type HeaderProps = {
  user: Session | null;
  actions?: ReactNode;
};

export default function Header({ user, actions }: HeaderProps) {
  const currentUser = user?.user ?? null;

  return (
    <header className="sticky w-full top-0 z-40 bg-[hsl(var(--card))]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold text-[hsl(var(--fg))]">
          Family finance dairy
        </Link>
        <div className="flex items-center gap-3">
          {actions}
          <UserMenu user={currentUser} />
        </div>
      </div>
    </header>
  );
}

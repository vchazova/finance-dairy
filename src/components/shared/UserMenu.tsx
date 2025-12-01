"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { cn } from "@/components/ui/utils/cn";
import { useAuth } from "@/providers/AuthProvider";

export type UserMenuProps = {
  user: User | null;
  className?: string;
};

export default function UserMenu({ user, className }: UserMenuProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [pendingLogout, setPendingLogout] = React.useState(false);

  const meta = (user?.user_metadata as Record<string, any>) || {};
  const displayName = meta.full_name || user?.email || "Guest";
  const email = user?.email;
  const avatarUrl =
    meta.avatar_url ||
    (email
      ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          email
        )}`
      : undefined);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "rounded-full p-1 hover:bg-black/5 transition",
          className
        )}
        borderless
        aria-label="User menu"
      >
        <Avatar size="sm" src={avatarUrl} name={displayName} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 space-y-1 p-2">
        <div className="rounded-2xl px-4 py-2 text-sm">
          <p className="text-[hsl(var(--fg-muted))]">{displayName}</p>
        </div>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          disabled={pendingLogout}
          onClick={() => {
            setPendingLogout(true);
            void logout().finally(() => setPendingLogout(false));
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import Link from "next/link";
import AvatarMenu from "@/components/shared/AvatarMenu";

export default function Header({ user }: { user: any }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))]/80 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--bg))]/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Family Finance
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/workspaces/create"
            className="inline-flex h-9 items-center rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))]"
          >
            Новое пространство
          </Link>
          <AvatarMenu user={user} />
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import CreateWorkspaceButton from "@/components/workspaces/CreateWorkspaceButton";
import AvatarMenu from "@/components/shared/AvatarMenu";

export default function Header({ user }: { user: any }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))]/80 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--bg))]/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Family Finance
        </Link>
        <nav className="flex items-center gap-2">
          <CreateWorkspaceButton />
          <AvatarMenu user={user} />
        </nav>
      </div>
    </header>
  );
}

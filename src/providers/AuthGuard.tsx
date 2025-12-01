"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui";

const PUBLIC_ROUTES = ["/auth"];

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, initializing } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname
    ? PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
    : false;

  useEffect(() => {
    if (initializing) return;

    if (!session && !isAuthPage) {
      router.replace("/auth");
      return;
    }

    if (session && isAuthPage) {
      router.replace("/");
    }
  }, [session, initializing, isAuthPage, router]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg))]">
        <Spinner />
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}

import type { Metadata } from "next";
import "@/styles/globals.css";
import AuthProvider from "@/providers/AuthProvider";
import AuthGuard from "@/providers/AuthGuard";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Family finance dairy",
  description: "An application to track family finances collaboratively.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <AuthGuard>{children}</AuthGuard>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

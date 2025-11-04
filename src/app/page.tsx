"use client";
import { useAuth } from "@/providers/AuthProvider";

export default function Home() {
  const { logout } = useAuth();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          My Workspaces
        </h1>
        <p className="text-center">
          You don't have any workspaces yet. Create a new one below
        </p>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <button
          onClick={logout}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          LogOut
        </button>
      </footer>
    </div>
  );
}

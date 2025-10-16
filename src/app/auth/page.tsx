"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import router from "next/navigation";

// --- Types ---
type AuthMode = "login" | "signup";

interface AuthResponse {
  error?: { message: string } | null;
}

// --- Component ---
export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { session, login, signUp } = useAuth();

  async function handleAuth() {
    // TODO: refactoring
    setLoading(true);
    setMessage(null);

    try {
      let response: AuthResponse;

      if (mode === "login") {
        response = await login({ email, password });
      } else {
        response = await signUp({ email, password });
      }

      if (response.error) throw new Error(response.error.message);

      setMessage(
        mode === "login"
          ? "Logged in successfully!"
          : "Sign-up successful! Check your email for confirmation."
      );
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("Current session:", session);
    if (session) {
      router.redirect("/");
    }
  }, [session]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white shadow-md rounded-2xl p-6 space-y-5">
        <h1 className="text-2xl font-semibold text-gray-800 text-center">
          {mode === "login" ? "Log In" : "Sign Up"}
          {session && (
            <span className="block text-sm text-green-600 mt-2">
              You are logged in!
            </span>
          )}
        </h1>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleAuth}
          disabled={loading}
          className={`w-full py-2 text-white rounded-lg transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Processing..." : mode === "login" ? "Log In" : "Sign Up"}
        </button>

        {message && (
          <p className="text-sm text-center text-gray-600">{message}</p>
        )}

        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-gray-500 text-sm">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </p>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-2 text-indigo-600 hover:underline text-sm font-medium"
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}

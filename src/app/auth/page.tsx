"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { H1, Text, Input, Button } from "@/components/ui";

type AuthMode = "login" | "signup";

interface AuthResponse {
  error?: { message: string } | null;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { session, login, signUp } = useAuth();
  const router = useRouter();

  async function handleAuth() {
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
      setMessage(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <header className="text-center space-y-1">
          <H1 className="!text-2xl">
            {mode === "login" ? "Log In" : "Sign Up"}
          </H1>
          {session && (
            <Text className="text-[hsl(var(--color-success))] text-sm">
              You are logged in!
            </Text>
          )}
        </header>

        <div className="mt-5 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            variant="primary"
            block
            onClick={handleAuth}
            disabled={loading || !email || !password}
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Log In"
              : "Sign Up"}
          </Button>

          {message && (
            <Text className="text-center text-sm text-[hsl(var(--fg-muted))]">
              {message}
            </Text>
          )}
        </div>

        <div className="mt-6 border-t border-[hsl(var(--border))] pt-4 text-center">
          <Text className="text-sm text-[hsl(var(--fg-muted))]">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            disabled={loading}
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </Button>
        </div>
      </div>
    </div>
  );
}

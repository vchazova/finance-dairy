"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Alert,
  Badge,
  Button,
  Card,
  H1,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@/components/ui";
import type { LucideIcon } from "lucide-react";
import { LineChart, Users, Settings } from "lucide-react";

type AuthMode = "login" | "signup";

interface AuthResponse {
  error?: { message: string } | null;
}

type FeedbackState = {
  variant: "success" | "danger";
  text: string;
} | null;

const AUTH_TABS: Array<{
  value: AuthMode;
  label: string;
  headline: string;
  description: string;
}> = [
  {
    value: "login",
    label: "Log in",
    headline: "Welcome back",
    description: "Log in to continue managing your family budget.",
  },
  {
    value: "signup",
    label: "Create account",
    headline: "Get started",
    description: "Sign up to start managing your family budget in easy way.",
  },
];

const HERO_HIGHLIGHTS: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Users,
    title: "Shared workspaces",
    description:
      "Run a shared budget with your partner or family, with clear roles and access.",
  },
  {
    icon: LineChart,
    title: "Clear charts and insights",
    description:
      "Track income and spending trends with simple, readable graphs and reports.",
  },
  {
    icon: Settings,
    title: "Flexible settings that fit you",
    description:
      "Customize categories, member roles and limits to match how your family handles money.",
  },
];

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const { session, login, signUp } = useAuth();
  const router = useRouter();

  const activeTab = useMemo(
    () => AUTH_TABS.find((tab) => tab.value === mode),
    [mode]
  );

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  useEffect(() => {
    setFeedback(null);
  }, [mode]);

  async function handleAuth() {
    setLoading(true);
    setFeedback(null);
    try {
      let response: AuthResponse;
      if (mode === "login") {
        response = await login({ email, password });
      } else {
        response = await signUp({ email, password });
      }
      if (response.error) throw new Error(response.error.message);

      setFeedback({
        variant: "success",
        text:
          mode === "login"
            ? "Logged in successfully. Redirecting to your workspace..."
            : "Sign-up successful. Check your inbox to confirm the account.",
      });
    } catch (err: any) {
      setFeedback({
        variant: "danger",
        text: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) {
      void handleAuth();
    }
  }

  const actionLabel = mode === "login" ? "Log in" : "Create account";
  const passwordAutocomplete =
    mode === "login" ? "current-password" : "new-password";
  const isDisabled = !email || !password || loading;

  return (
    <div className="min-h-screen h-full flex items-center bg-[hsl(var(--bg))]">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden space-y-8 lg:flex lg:flex-col">
          <Badge variant="primary" className="w-fit">
            Finance Diary
          </Badge>
          <div className="space-y-4">
            <H1 className="text-[hsl(var(--fg))]">
              Shared finances with clarity and trust
            </H1>
            <Text className="text-lg text-[hsl(var(--fg-muted))]">
              Consolidate income, spending, and budgets into one secure space.
              Every member sees what matters, updates stay in sync, and alerts
              keep your family on track.
            </Text>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {HERO_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-[hsl(var(--fg))]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--fg))]">
                    {title}
                  </p>
                  <p className="text-sm text-[hsl(var(--fg-muted))]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex w-full justify-center lg:justify-end">
          <Card padding="lg" className="w-full max-w-md">
            <Tabs
              value={mode}
              onChange={(value) => setMode(value as AuthMode)}
              className="space-y-6"
            >
              <TabsList>
                {AUTH_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 flex-col items-start justify-start gap-0.5 text-left"
                  >
                    <span className="block text-sm text-center font-semibold">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-5">
                <div>
                  <H1 className="text-2xl text-[hsl(var(--fg))]">
                    {activeTab?.headline}
                  </H1>
                  <Text className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
                    {activeTab?.description}
                  </Text>
                </div>

                {session && (
                  <Alert
                    variant="info"
                    description="You are already authenticated. Redirecting you to the workspace..."
                  />
                )}

                {feedback && (
                  <Alert
                    variant={feedback.variant}
                    description={feedback.text}
                  />
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="email"
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete={passwordAutocomplete}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    disabled={isDisabled}
                  >
                    {actionLabel}
                  </Button>
                </form>

                <Text className="text-xs text-[hsl(var(--fg-muted))]">
                  {mode === "login" ? (
                    <>
                      Don’t have an account yet?{" "}
                      <button
                        type="button"
                        className="font-medium text-[hsl(var(--color-primary))] underline"
                        onClick={() => setMode("signup")}
                      >
                        Sign up
                      </button>{" "}
                      now.
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="font-medium text-[hsl(var(--color-primary))] underline"
                        onClick={() => setMode("login")}
                      >
                        Log in
                      </button>{" "}
                      here.
                    </>
                  )}
                </Text>
              </div>
            </Tabs>
          </Card>
        </section>
      </div>
    </div>
  );
}

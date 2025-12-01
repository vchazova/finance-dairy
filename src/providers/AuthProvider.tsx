"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AuthResponse, Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  initializing: boolean;
  logout: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<AuthResponse>;
  signUp: (data: { email: string; password: string }) => Promise<AuthResponse>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data.session);
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push("/auth");
  };

  const login = async (data: { email: string; password: string }) => {
    const response = await supabase.auth.signInWithPassword(data);
    if (response.error) throw new Error(response.error.message);
    if (response.data.session) {
      setSession(response.data.session);
    }
    return response;
  };

  const signUp = async (data: { email: string; password: string }) => {
    const signUpResponse = await supabase.auth.signUp(data);
    if (signUpResponse.error) throw new Error(signUpResponse.error.message);

    const response = await login(data);
    return response;
  };

  return (
    <AuthContext.Provider
      value={{ session, initializing, logout, login, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

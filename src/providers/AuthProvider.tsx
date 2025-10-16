"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
// import { useUserStore } from "@/store/userStore";
import router from "next/navigation";
import { AuthResponse, Session } from "@supabase/supabase-js";
import { log } from "console";

type AuthContextType = {
  session: any | null;
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
  // const { setSession, session } = useUserStore();
  //TODO: найти корректный тип для session
  const [session, setSession] = useState<null | Session>(null);

  useEffect(() => {
    // Получаем текущую сессию при старте
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Подписываемся на изменения (login/logout/refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Отписка при размонтировании
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.redirect("/auth");
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
    <AuthContext.Provider value={{ session, logout, login, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

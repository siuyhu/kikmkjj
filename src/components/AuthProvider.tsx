"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type SessionContextValue = {
  user: User | null;
  loading: boolean;
  nickname: string;
  setNickname: (n: string) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);
const NICKNAME_KEY = "kikmkjj:nickname";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNicknameState] = useState("");

  useEffect(() => {
    setNicknameState(localStorage.getItem(NICKNAME_KEY) ?? "");

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        setLoading(false);
        return;
      }
      // 免注册：匿名登录，获得一个仅本设备有效的身份（用于「只能删自己发的」）
      supabase.auth.signInAnonymously().then(({ data }) => {
        setUser(data.user ?? null);
        setLoading(false);
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const setNickname = useCallback((n: string) => {
    setNicknameState(n);
    localStorage.setItem(NICKNAME_KEY, n);
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, nickname, setNickname }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}

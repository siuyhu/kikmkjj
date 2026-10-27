"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

type SessionContextValue = {
  deviceId: string;
  nickname: string;
  setNickname: (n: string) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);
const NICKNAME_KEY = "kikmkjj:nickname";
const DEVICE_KEY = "kikmkjj:device";

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceId] = useState("");
  const [nickname, setNicknameState] = useState("");

  useEffect(() => {
    setNicknameState(localStorage.getItem(NICKNAME_KEY) ?? "");
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(DEVICE_KEY, id);
    }
    setDeviceId(id);
  }, []);

  const setNickname = useCallback((n: string) => {
    setNicknameState(n);
    localStorage.setItem(NICKNAME_KEY, n);
  }, []);

  return (
    <SessionContext.Provider value={{ deviceId, nickname, setNickname }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}

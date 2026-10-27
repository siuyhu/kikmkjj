"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";

const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE ?? "kikmkjj";

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const nickname =
    (user?.user_metadata?.nickname as string | undefined) ??
    user?.email?.split("@")[0] ??
    "家人";

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-bold tracking-tight text-stone-800">
          {SITE_TITLE}
        </h1>
        <span className="hidden text-sm text-stone-400 sm:inline">
          家人朋友的小空间
        </span>
      </div>

      <div className="flex items-center gap-2">
        {loading ? (
          <span className="text-sm text-stone-400">…</span>
        ) : user ? (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
              {nickname.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-[8rem] truncate text-sm text-stone-600 sm:inline">
              {nickname}
            </span>
            <button
              onClick={signOut}
              className="rounded-full border border-stone-200 px-3 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-100"
            >
              退出
            </button>
          </>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            登录 / 注册
          </button>
        )}
      </div>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

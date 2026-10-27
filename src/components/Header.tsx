"use client";

import { useAuth } from "@/components/AuthProvider";

const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE ?? "kikmkjj";

export default function Header() {
  const { nickname, setNickname } = useAuth();

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-bold tracking-tight text-stone-800">
          {SITE_TITLE}
        </h1>
        <span className="hidden text-sm text-stone-400 sm:inline">
          家人朋友的小空间 · 免注册
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-stone-500">我是</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="填个昵称"
          className="w-28 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-rose-300"
        />
      </div>
    </header>
  );
}

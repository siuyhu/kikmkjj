"use client";

import { useState } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import CountdownSection from "@/components/CountdownSection";
import PhotosSection from "@/components/PhotosSection";
import DiarySection from "@/components/DiarySection";
import WishesSection from "@/components/WishesSection";

type Tab = "countdown" | "photos" | "diary" | "wishes";

const TABS: { key: Tab; label: string }[] = [
  { key: "countdown", label: "⏳ 倒计时" },
  { key: "photos", label: "📷 照片" },
  { key: "diary", label: "📔 日记" },
  { key: "wishes", label: "⭐ 心愿" },
];

function Shell() {
  const [tab, setTab] = useState<Tab>("countdown");

  return (
    <div className="min-h-screen">
      <Header />

      {/* 标签导航 */}
      <nav className="sticky top-0 z-40 mx-auto mt-2 flex w-full max-w-5xl gap-1 px-4">
        <div className="flex gap-1 rounded-full border border-white/60 bg-white/70 p-1 shadow-sm backdrop-blur">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-stone-500 hover:bg-rose-50 hover:text-rose-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6">
        {tab === "countdown" && <CountdownSection />}
        {tab === "photos" && <PhotosSection />}
        {tab === "diary" && <DiarySection />}
        {tab === "wishes" && <WishesSection />}
      </main>

      <footer className="pb-8 text-center text-xs text-stone-400">
        kikmkjj.com · 家人朋友的小空间
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

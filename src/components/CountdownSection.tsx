"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { supabase } from "@/lib/supabase";
import type { Countdown } from "@/lib/types";
import { countdownParts, formatTargetDate } from "@/lib/format";

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[3.5rem] rounded-xl bg-white/70 px-2 py-2 text-center text-3xl font-bold tabular-nums text-stone-800 shadow-sm">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs text-stone-500">{label}</span>
    </div>
  );
}

export default function CountdownSection() {
  const { user } = useAuth();
  const { rows: list, loading } = useRealtimeTable<Countdown>("countdowns");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 每秒刷新一次，让倒计时真正「实时」跳动
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const sorted = [...list].sort((a, b) =>
    a.target_date.localeCompare(b.target_date),
  );
  const next = sorted.find((c) => !countdownParts(c.target_date).isPast);
  const others = next ? list.filter((c) => c.id !== next.id) : list;

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !title.trim() || !date) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("countdowns").insert({
      user_id: user.id,
      author_name: (user.user_metadata?.nickname as string) ?? "匿名",
      title: title.trim(),
      target_date: date,
    });
    setBusy(false);
    if (error) setMsg(error.message);
    else {
      setTitle("");
      setDate("");
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("countdowns").delete().eq("id", id);
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">⏳ 倒计时</h2>
        <span className="text-xs text-stone-400">
          {list.length} 个日子，实时同步
        </span>
      </div>

      {/* 最近的倒计时大卡片 */}
      {next ? (
        <CountdownHero item={next} />
      ) : (
        !loading && (
          <div className="mb-5 rounded-2xl border border-dashed border-rose-200 bg-white/50 p-8 text-center text-sm text-stone-400">
            还没有进行中的倒计时，添加一个值得期待的日子吧 ✨
          </div>
        )
      )}

      {/* 添加倒计时 */}
      {user ? (
        <form
          onSubmit={handleAdd}
          className="mb-6 flex flex-col gap-2 rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给这个日子起个名字，如：结婚纪念日"
            className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
          >
            {busy ? "添加中…" : "添加"}
          </button>
        </form>
      ) : (
        <p className="mb-6 rounded-2xl bg-white/60 p-4 text-center text-sm text-stone-400">
          登录后即可添加自己的倒计时
        </p>
      )}
      {msg && <p className="mb-3 text-sm text-red-500">{msg}</p>}

      {/* 其余倒计时列表 */}
      {others.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {others.map((c) => {
            const p = countdownParts(c.target_date);
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white/80 p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-stone-800">{c.title}</p>
                  <p className="mt-1 text-xs text-stone-400">
                    {formatTargetDate(c.target_date)}
                    {p.isPast
                      ? ` · 已过 ${p.days} 天`
                      : p.days === 0
                        ? " · 就是今天 🎉"
                        : ` · 还有 ${p.days} 天`}
                  </p>
                </div>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-full p-1.5 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-400"
                    aria-label="删除"
                  >
                    🗑
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CountdownHero({ item }: { item: Countdown }) {
  const p = countdownParts(item.target_date);
  return (
    <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 via-orange-300 to-amber-200 p-8 text-white shadow-lg">
      <p className="text-sm text-white/80">距离</p>
      <h3 className="mt-1 text-2xl font-bold">{item.title}</h3>
      <p className="mt-1 text-sm text-white/80">
        {formatTargetDate(item.target_date)}
      </p>

      {p.isPast ? (
        <p className="mt-6 text-3xl font-bold">已经到达啦 🎉</p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <TimeUnit value={p.days} label="天" />
          <TimeUnit value={p.hours} label="时" />
          <TimeUnit value={p.mins} label="分" />
          <TimeUnit value={p.secs} label="秒" />
        </div>
      )}
    </div>
  );
}

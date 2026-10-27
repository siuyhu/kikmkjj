"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePollingTable } from "@/lib/usePollingTable";
import { createItem, deleteItem } from "@/lib/api";
import type { DiaryEntry } from "@/lib/types";
import { timeAgo } from "@/lib/format";

const MOODS = ["😊", "🙂", "😐", "😢", "😡", "🥰", "😴", "🤩"];

export default function DiarySection() {
  const { deviceId, nickname } = useAuth();
  const { rows: entries, loading } = usePollingTable<DiaryEntry>("diary");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("🙂");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!deviceId || !content.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await createItem("diary", {
        author_name: nickname || "匿名",
        content: content.trim(),
        mood,
      });
      setContent("");
      setMood("🙂");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    }
    setBusy(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteItem("diary", id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">📔 日记</h2>
        <span className="text-xs text-stone-400">
          {entries.length} 篇，自动同步
        </span>
      </div>

      {/* 写日记 */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-1.5">
          <span className="mr-1 text-sm text-stone-500">今天的心情：</span>
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition-all ${
                mood === m
                  ? "bg-rose-100 ring-2 ring-rose-300"
                  : "hover:bg-stone-100"
              }`}
              aria-label={`心情 ${m}`}
            >
              {m}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天发生了什么？写下来吧…"
          rows={3}
          className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-rose-300"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={busy || !content.trim()}
            className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
          >
            {busy ? "发布中…" : "发布"}
          </button>
        </div>
      </form>
      {msg && <p className="mb-3 text-sm text-red-500">{msg}</p>}

      {/* 日记列表 */}
      {loading ? (
        <p className="py-10 text-center text-sm text-stone-400">加载中…</p>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white/50 p-10 text-center text-sm text-stone-400">
          还没有日记，写下第一篇吧 📝
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((e) => (
            <article
              key={e.id}
              className="rounded-2xl border border-stone-100 bg-white/80 p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{e.mood}</span>
                  <span className="text-sm font-medium text-stone-700">
                    {e.author_name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400">
                    {timeAgo(e.created_at)}
                  </span>
                  {deviceId === e.device_id && (
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-stone-300 transition-colors hover:text-red-400"
                      aria-label="删除"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                {e.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

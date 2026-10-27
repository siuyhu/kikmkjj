"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePollingTable } from "@/lib/usePollingTable";
import { createItem, updateItem, deleteItem } from "@/lib/api";
import type { Wish } from "@/lib/types";
import { timeAgo } from "@/lib/format";

export default function WishesSection() {
  const { deviceId, nickname } = useAuth();
  const { rows: wishes, loading } = usePollingTable<Wish>("wishes");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const doneCount = wishes.filter((w) => w.done).length;

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!deviceId || !content.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await createItem("wishes", {
        author_name: nickname || "匿名",
        content: content.trim(),
      });
      setContent("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    }
    setBusy(false);
  }

  async function handleToggle(wish: Wish) {
    if (!deviceId || deviceId !== wish.device_id) return;
    try {
      await updateItem("wishes", wish.id, { done: !wish.done });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteItem("wishes", id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">⭐ 心愿清单</h2>
        <span className="text-xs text-stone-400">
          已实现 {doneCount} / {wishes.length}
        </span>
      </div>

      {/* 添加心愿 */}
      <form
        onSubmit={handleAdd}
        className="mb-6 flex gap-2 rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下一个小愿望，如：去海边看一次日出"
          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300"
        />
        <button
          type="submit"
          disabled={busy || !content.trim()}
          className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
        >
          {busy ? "添加中…" : "许愿"}
        </button>
      </form>
      {msg && <p className="mb-3 text-sm text-red-500">{msg}</p>}

      {/* 心愿列表 */}
      {loading ? (
        <p className="py-10 text-center text-sm text-stone-400">加载中…</p>
      ) : wishes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white/50 p-10 text-center text-sm text-stone-400">
          还没有心愿，写下第一个吧 🌟
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {wishes.map((w) => (
            <li
              key={w.id}
              className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white/80 px-4 py-3 shadow-sm"
            >
              <button
                onClick={() => handleToggle(w)}
                disabled={!deviceId || deviceId !== w.device_id}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-colors ${
                  w.done
                    ? "border-rose-400 bg-rose-400 text-white"
                    : "border-stone-300 text-transparent hover:border-rose-300"
                }`}
                aria-label={w.done ? "标记未完成" : "标记完成"}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm ${
                    w.done
                      ? "text-stone-400 line-through"
                      : "text-stone-700"
                  }`}
                >
                  {w.content}
                </p>
                <p className="text-xs text-stone-400">
                  {w.author_name} · {timeAgo(w.created_at)}
                  {w.done && " · 已实现 🎉"}
                </p>
              </div>
              {deviceId === w.device_id && (
                <button
                  onClick={() => handleDelete(w.id)}
                  className="text-stone-300 transition-colors hover:text-red-400"
                  aria-label="删除"
                >
                  🗑
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

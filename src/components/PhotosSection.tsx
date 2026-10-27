"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePollingTable } from "@/lib/usePollingTable";
import { uploadPhoto, deleteItem, photoUrl } from "@/lib/api";
import type { Photo } from "@/lib/types";
import { timeAgo } from "@/lib/format";

export default function PhotosSection() {
  const { deviceId, nickname } = useAuth();
  const { rows: photos, loading } = usePollingTable<Photo>("photos");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [view, setView] = useState<Photo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许重复选同一张图
    if (!file || !deviceId) return;
    setBusy(true);
    setMsg(null);
    try {
      await uploadPhoto(file, caption.trim(), nickname || "匿名");
      setCaption("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    }
    setBusy(false);
  }

  async function handleDelete(photo: Photo) {
    try {
      await deleteItem("photos", photo.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">📷 照片墙</h2>
        <span className="text-xs text-stone-400">
          {photos.length} 张照片，自动同步
        </span>
      </div>

      {/* 上传区 */}
      <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="给照片写句话（可选）"
          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
        >
          {busy ? "上传中…" : "上传照片"}
        </button>
      </div>
      {msg && <p className="mb-3 text-sm text-red-500">{msg}</p>}

      {/* 照片网格 */}
      {loading ? (
        <p className="py-10 text-center text-sm text-stone-400">加载中…</p>
      ) : photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white/50 p-10 text-center text-sm text-stone-400">
          还没有照片，上传第一张记录此刻吧 📸
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <figure
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm"
            >
              <button
                onClick={() => setView(p)}
                className="block aspect-square w-full overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(p.storage_path)}
                  alt={p.caption || "照片"}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
              {(p.caption || p.author_name) && (
                <figcaption className="px-3 py-2">
                  {p.caption && (
                    <p className="truncate text-sm text-stone-700">
                      {p.caption}
                    </p>
                  )}
                  <p className="text-xs text-stone-400">
                    {p.author_name} · {timeAgo(p.created_at)}
                  </p>
                </figcaption>
              )}
              {deviceId === p.device_id && (
                <button
                  onClick={() => handleDelete(p)}
                  className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                  aria-label="删除"
                >
                  🗑
                </button>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* 大图预览 */}
      {view && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4"
          onClick={() => setView(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl(view.storage_path)}
            alt={view.caption || "照片"}
            className="max-h-[80vh] max-w-full rounded-xl object-contain"
          />
          {view.caption && (
            <p className="mt-4 max-w-lg text-center text-sm text-white/90">
              {view.caption}
            </p>
          )}
          <button
            onClick={() => setView(null)}
            className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/20"
          >
            关闭
          </button>
        </div>
      )}
    </section>
  );
}

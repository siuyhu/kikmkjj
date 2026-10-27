// 客户端数据访问层：所有读写都走本项目的 /api 中转接口，
// 由 Vercel 服务端去连 Supabase，从而在国内也能正常访问。

const DEVICE_KEY = "kikmkjj:device";

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** 每台设备一个固定标识，持久化在 localStorage，用于「只能删自己发的」 */
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

async function request(path: string, init: RequestInit = {}): Promise<{ data?: unknown; error?: string }> {
  const headers = new Headers(init.headers);
  headers.set("x-device-id", getDeviceId());
  const res = await fetch(path, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error || `请求失败 (${res.status})`);
  }
  return json as { data?: unknown };
}

export async function listItems<T>(table: string): Promise<T[]> {
  const json = await request(`/api/items?table=${encodeURIComponent(table)}`);
  return (json.data ?? []) as T[];
}

export async function createItem(
  table: string,
  data: Record<string, unknown>,
): Promise<void> {
  await request("/api/items", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ table, data }),
  });
}

export async function updateItem(
  table: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await request("/api/items", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ table, id, data }),
  });
}

export async function deleteItem(table: string, id: string): Promise<void> {
  await request(`/api/items?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** 上传照片（客户端先压缩，再经中转上传） */
export async function uploadPhoto(
  file: File,
  caption: string,
  authorName: string,
): Promise<void> {
  const compressed = await compressImage(file);
  const form = new FormData();
  form.append("file", compressed, "photo.jpg");
  form.append("caption", caption);
  form.append("author_name", authorName);
  await request("/api/photos", { method: "POST", body: form });
}

/** 照片展示地址：走中转接口，避免浏览器直接连 Supabase 被墙 */
export function photoUrl(storagePath: string): string {
  return `/api/photo/${storagePath}`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败"));
    };
    img.src = url;
  });
}

// 压缩图片：最长边 2048px、JPEG 0.85，通常能压到 1MB 以内，
// 避免超出 Vercel 免费档请求体上限，也更快。
async function compressImage(file: File, maxDim = 2048, quality = 0.85): Promise<Blob> {
  const img = await loadImage(file);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("图片压缩失败"))),
      "image/jpeg",
      quality,
    );
  });
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** 是否已经配置了 Supabase（用于在页面上提示尚未配置） */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// 用占位值兜底，避免未配置时在构建期抛错；浏览器里运行时用的是 .env.local 的真实值
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const PHOTOS_BUCKET = "photos";

/** 由 storage_path 拼出照片的公开访问地址 */
export function photoUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${PHOTOS_BUCKET}/${storagePath}`;
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ⚠️ 仅限服务端（API Route）使用，切勿在客户端组件中 import。
// 这里用 service_role key，会绕过 RLS；「只能删自己发的」由各 API 路由自行校验 device_id。

let _admin: SupabaseClient | null = null;

export function getAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "服务端未配置 Supabase：需要 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  _admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

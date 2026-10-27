import { NextRequest, NextResponse } from "next/server";

// 照片中转：浏览器访问 /api/photo/<storage_path>，由服务端去 Supabase 取回图片字节，
// 避免国内浏览器直接连 Supabase 被墙。
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const key = path.join("/");
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return new NextResponse("未配置", { status: 500 });

  const url = `${base}/storage/v1/object/public/photos/${key}`;
  const res = await fetch(url);
  if (!res.ok) return new NextResponse("Not found", { status: 404 });

  const headers = new Headers();
  const ct = res.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, { headers });
}

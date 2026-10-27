import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/serverSupabase";

function err(msg: string, status = 500) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id");
  if (!deviceId) return err("缺少设备标识", 400);

  const form = await req.formData().catch(() => null);
  if (!form) return err("请求体不是表单", 400);
  const file = form.get("file");
  if (!(file instanceof File)) return err("缺少文件", 400);

  const caption = String(form.get("caption") ?? "");
  const authorName = String(form.get("author_name") ?? "匿名");
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${deviceId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  const admin = getAdmin();

  const { error: upErr } = await admin.storage
    .from("photos")
    .upload(path, bytes, { contentType: file.type || "image/jpeg" });
  if (upErr) return err(upErr.message);

  const { error: insErr } = await admin.from("photos").insert({
    device_id: deviceId,
    author_name: authorName,
    caption,
    storage_path: path,
  });
  if (insErr) {
    await admin.storage.from("photos").remove([path]);
    return err(insErr.message);
  }

  return NextResponse.json({ data: { path } });
}

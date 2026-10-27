import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/serverSupabase";

const TABLES = ["diary", "photos", "wishes", "countdowns"] as const;
type Table = (typeof TABLES)[number];

const isTable = (t: string | null | undefined): t is Table =>
  TABLES.includes(t as Table);

function ok(data: unknown) {
  return NextResponse.json({ data });
}
function err(e: unknown, status = 500) {
  let msg = "未知错误";
  if (e instanceof Error) {
    msg = e.message;
  } else if (e && typeof e === "object" && "message" in e) {
    msg = String((e as { message: unknown }).message ?? "未知错误");
  } else {
    msg = String(e ?? "未知错误");
  }
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: NextRequest) {
  const table = req.nextUrl.searchParams.get("table");
  if (!isTable(table)) return err(new Error("无效的表名"), 400);
  const admin = getAdmin();
  const { data, error } = await admin
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return err(error);
  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id");
  if (!deviceId) return err(new Error("缺少设备标识"), 400);
  const body = await req.json().catch(() => null);
  const table = body?.table;
  if (!isTable(table)) return err(new Error("无效的表名"), 400);
  const admin = getAdmin();
  const { error } = await admin
    .from(table)
    .insert({ ...body.data, device_id: deviceId });
  if (error) return err(error);
  return ok({});
}

export async function PATCH(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id");
  if (!deviceId) return err(new Error("缺少设备标识"), 400);
  const body = await req.json().catch(() => null);
  const table = body?.table;
  const id = body?.id;
  if (!isTable(table) || !id) return err(new Error("参数错误"), 400);
  const admin = getAdmin();
  const { error } = await admin
    .from(table)
    .update(body.data)
    .eq("id", id)
    .eq("device_id", deviceId);
  if (error) return err(error);
  return ok({ id });
}

export async function DELETE(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id");
  if (!deviceId) return err(new Error("缺少设备标识"), 400);
  const table = req.nextUrl.searchParams.get("table");
  const id = req.nextUrl.searchParams.get("id");
  if (!isTable(table) || !id) return err(new Error("参数错误"), 400);
  const admin = getAdmin();

  // 照片还要连存储对象一起删
  if (table === "photos") {
    const { data: photo } = await admin
      .from("photos")
      .select("storage_path")
      .eq("id", id)
      .eq("device_id", deviceId)
      .single();
    if (photo?.storage_path) {
      await admin.storage.from("photos").remove([photo.storage_path]);
    }
  }

  const { error } = await admin
    .from(table)
    .delete()
    .eq("id", id)
    .eq("device_id", deviceId);
  if (error) return err(error);
  return ok({ id });
}

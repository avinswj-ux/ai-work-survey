import { NextResponse } from "next/server";
import { deleteResponses } from "@/lib/storage";
import { isAdmin } from "@/lib/validation";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  if (!isAdmin(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ message: "后台密码错误" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id: unknown): id is string => typeof id === "string")
    : [];
  if (!ids.length) {
    return NextResponse.json({ message: "请选择要删除的答卷" }, { status: 400 });
  }
  return NextResponse.json(await deleteResponses(ids));
}

import { NextResponse } from "next/server";
import { getStats } from "@/lib/storage";
import { isAdmin } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdmin(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ message: "后台密码错误" }, { status: 401 });
  }
  return NextResponse.json(await getStats());
}

import { NextResponse } from "next/server";
import { createResponse, DuplicateUsernameError } from "@/lib/storage";
import { validateSurvey } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = validateSurvey(await request.json());
    const response = await createResponse(input);
    return NextResponse.json({ ok: true, id: response.id }, { status: 201 });
  } catch (error) {
    const isDuplicate = error instanceof DuplicateUsernameError;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "提交失败，请稍后重试" },
      { status: isDuplicate ? 409 : 400 }
    );
  }
}

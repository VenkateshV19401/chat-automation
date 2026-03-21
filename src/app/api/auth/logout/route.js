import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { SessionService } from "@/lib/services/SessionService";

export async function POST(request) {
  await connectDb();
  const cookieHeader = request.headers.get("cookie") || "";
  const result = await SessionService.clearSession(cookieHeader);

  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", result.clearCookieHeader);
  return response;
}

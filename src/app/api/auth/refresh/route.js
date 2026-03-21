import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { SessionService } from "@/lib/services/SessionService";

export async function POST(request) {
  await connectDb();
  const cookieHeader = request.headers.get("cookie") || "";

  try {
    console.log("[auth] Refresh token request, cookie present:", !!cookieHeader);
    const session = await SessionService.refreshAccessToken(cookieHeader);
    console.log("[auth] Refresh successful, new token issued");

    const response = NextResponse.json({ token: session.accessToken });
    response.headers.set("Set-Cookie", session.cookieHeader);
    return response;
  } catch (error) {
    console.error("[auth] Refresh failed:", error.message);
    const response = NextResponse.json(
      { error: error.message || "Failed to refresh session" },
      { status: error.status || 500 }
    );
    if (error.clearCookieHeader) {
      response.headers.set("Set-Cookie", error.clearCookieHeader);
    }
    return response;
  }
}

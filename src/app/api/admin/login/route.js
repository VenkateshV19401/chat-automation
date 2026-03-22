import { NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminToken } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createAdminToken();

    const response = NextResponse.json({ success: true, token });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}

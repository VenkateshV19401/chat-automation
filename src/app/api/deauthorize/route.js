import { NextResponse } from "next/server";

export async function GET(request) {
  console.log("[app] Deauthorize GET request received");
  return NextResponse.json({ ok: true, message: "Deauthorization callback received" });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  console.log("[app] Deauthorize POST request received:", body);
  return NextResponse.json({ ok: true, message: "Deauthorization callback received" });
}

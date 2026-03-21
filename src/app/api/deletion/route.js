import { NextResponse } from "next/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return NextResponse.json({
    url: `${appUrl}/data-deletion`,
    confirmation_code: `insta-delete-${Date.now()}`,
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  console.log("[app] Data deletion request received:", body);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return NextResponse.json({
    url: `${appUrl}/data-deletion`,
    confirmation_code: `insta-delete-${Date.now()}`,
  });
}

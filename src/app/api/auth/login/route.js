import { NextResponse } from "next/server";
import { buildInstagramLoginUrl } from "@/lib/services/instagramAuthService";

export async function GET() {
  const loginUrl = buildInstagramLoginUrl();
  console.log("[oauth] Redirecting to Instagram login");
  return NextResponse.redirect(loginUrl);
}

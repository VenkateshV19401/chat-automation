import { NextResponse } from "next/server";
import { getPublicPlans } from "@/lib/config/plans";

export async function GET() {
  return NextResponse.json(getPublicPlans());
}

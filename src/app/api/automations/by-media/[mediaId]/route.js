import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { AutomationService } from "@/lib/services/AutomationService";
import { requireAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const { mediaId } = await params;
  const automation = await AutomationService.getAutomationForMedia(authUser.id, mediaId);
  if (!automation) return NextResponse.json({ error: "Automation not found" }, { status: 404 });
  return NextResponse.json(automation);
}

import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { AutomationService } from "@/lib/services/AutomationService";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const { id } = await params;
  const body = await request.json();
  const automation = await AutomationService.updateAutomation(authUser.id, id, body);
  if (!automation) return NextResponse.json({ error: "Automation not found" }, { status: 404 });
  return NextResponse.json(automation);
}

export async function DELETE(request, { params }) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const { id } = await params;
  const automation = await AutomationService.deleteAutomation(authUser.id, id);
  if (!automation) return NextResponse.json({ error: "Automation not found" }, { status: 404 });
  return NextResponse.json({ success: true, automation });
}

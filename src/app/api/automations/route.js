import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { AutomationService } from "@/lib/services/AutomationService";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const automations = await AutomationService.getAutomations(authUser.id);
  return NextResponse.json(automations);
}

export async function POST(request) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  try {
    const body = await request.json();
    const automation = await AutomationService.createAutomation(authUser.id, body);
    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    if (error.code === "PLAN_LIMIT_REACHED") {
      return NextResponse.json({ error: error.message, code: "PLAN_LIMIT_REACHED" }, { status: 403 });
    }
    if (error.code === "AUTOMATION_EXISTS") {
      return NextResponse.json({ error: error.message, automation: error.automation }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

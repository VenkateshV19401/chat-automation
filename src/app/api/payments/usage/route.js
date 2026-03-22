import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { UsageRepository } from "@/lib/repositories/UsageRepository";
import { getPlan } from "@/lib/config/plans";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const user = await UserRepository.findUserById(authUser.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const plan = await getPlan(user.plan);
  const usage = await UsageRepository.getMonthlyUsage(user.id);

  return NextResponse.json({
    plan: user.plan || "free",
    planName: plan.name,
    usage: {
      repliesSent: usage.repliesSent,
      maxRepliesPerMonth: plan.maxRepliesPerMonth === Infinity ? null : plan.maxRepliesPerMonth,
      automationsCount: 0,
      maxAutomations: plan.maxAutomations === Infinity ? null : plan.maxAutomations,
    },
  });
}

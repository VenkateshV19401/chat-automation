import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { requireAdmin } from "@/lib/adminAuth";
import { PlanConfig } from "@/lib/models/PlanConfig";
import { DEFAULT_PLANS } from "@/lib/config/plans";

export async function GET(request) {
  try {
    requireAdmin(request);
    await connectDb();

    const docs = await PlanConfig.find().lean();

    if (docs.length === 0) {
      const defaults = Object.entries(DEFAULT_PLANS).map(([key, plan]) => ({
        planId: key,
        ...plan,
        maxAutomations: plan.maxAutomations === Infinity ? -1 : plan.maxAutomations,
        maxRepliesPerMonth: plan.maxRepliesPerMonth === Infinity ? -1 : plan.maxRepliesPerMonth,
      }));
      return NextResponse.json(defaults);
    }

    const result = docs.map((d) => ({
      id: d._id.toString(),
      planId: d.planId,
      name: d.name,
      maxAutomations: d.maxAutomations,
      maxRepliesPerMonth: d.maxRepliesPerMonth,
      canSendDM: d.canSendDM,
      stripePriceId: d.stripePriceId,
      priceInr: d.priceInr,
      features: d.features,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    requireAdmin(request);
    await connectDb();

    const plans = await request.json();

    for (const plan of plans) {
      await PlanConfig.findOneAndUpdate(
        { planId: plan.planId },
        {
          planId: plan.planId,
          name: plan.name,
          maxAutomations: plan.maxAutomations,
          maxRepliesPerMonth: plan.maxRepliesPerMonth,
          canSendDM: plan.canSendDM,
          stripePriceId: plan.stripePriceId || "",
          priceInr: plan.priceInr,
          features: plan.features,
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

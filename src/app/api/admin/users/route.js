import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { requireAdmin } from "@/lib/adminAuth";
import { User } from "@/lib/models/User";
import { Automation } from "@/lib/models/Automation";
import { Usage } from "@/lib/models/Usage";

export async function GET(request) {
  try {
    requireAdmin(request);
    await connectDb();

    const users = await User.find().sort({ createdAt: -1 }).lean();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [automationCounts, usageDocs] = await Promise.all([
      Automation.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
      Usage.find({ month: currentMonth }).lean(),
    ]);

    const automationMap = {};
    for (const a of automationCounts) automationMap[a._id] = a.count;

    const usageMap = {};
    for (const u of usageDocs) usageMap[u.userId] = u.repliesSent || 0;

    const result = users.map((u) => ({
      id: u._id.toString(),
      username: u.username,
      instagramUserId: u.instagramUserId,
      accountType: u.accountType,
      plan: u.plan || "free",
      isManualGrant: u.isManualGrant || false,
      automationCount: automationMap[u._id.toString()] || 0,
      repliesThisMonth: usageMap[u._id.toString()] || 0,
      connectedAt: u.connectedAt,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

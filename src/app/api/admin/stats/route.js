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

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalAutomations, activeAutomations, newUsersThisWeek, usageDocs] = await Promise.all([
      User.countDocuments(),
      Automation.countDocuments(),
      Automation.countDocuments({ active: true }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Usage.find({ month: currentMonth }),
    ]);

    const totalRepliesThisMonth = usageDocs.reduce((sum, u) => sum + (u.repliesSent || 0), 0);

    const planCounts = await User.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]);

    const planBreakdown = {};
    for (const p of planCounts) {
      planBreakdown[p._id || "free"] = p.count;
    }

    return NextResponse.json({
      totalUsers,
      totalAutomations,
      activeAutomations,
      newUsersThisWeek,
      totalRepliesThisMonth,
      planBreakdown,
      currentMonth,
    });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

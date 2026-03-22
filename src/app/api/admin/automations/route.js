import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { requireAdmin } from "@/lib/adminAuth";
import { Automation } from "@/lib/models/Automation";
import { User } from "@/lib/models/User";

export async function GET(request) {
  try {
    requireAdmin(request);
    await connectDb();

    const automations = await Automation.find().sort({ createdAt: -1 }).lean();

    const userIds = [...new Set(automations.map((a) => a.userId))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = {};
    const userPicMap = {};
    for (const u of users) {
      userMap[u._id.toString()] = u.username;
      userPicMap[u._id.toString()] = u.profilePictureUrl || "";
    }

    const result = automations.map((a) => ({
      id: a._id.toString(),
      userId: a.userId,
      username: userMap[a.userId] || "Unknown",
      profilePictureUrl: userPicMap[a.userId] || "",
      triggerKeyword: a.triggerKeyword,
      matchType: a.matchType,
      replyType: a.replyType,
      replyMessage: a.replyMessage,
      targetMediaId: a.targetMediaId,
      active: a.active,
      commentReplies: a.commentReplies || 0,
      dmReplies: a.dmReplies || 0,
      createdAt: a.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { requireAdmin } from "@/lib/adminAuth";
import { User } from "@/lib/models/User";
import { Automation } from "@/lib/models/Automation";
import { Usage } from "@/lib/models/Usage";

export async function PATCH(request, { params }) {
  try {
    requireAdmin(request);
    await connectDb();

    const { id } = await params;
    const updates = await request.json();

    const allowed = ["plan", "isManualGrant"];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    const user = await User.findByIdAndUpdate(id, filtered, { new: true });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ id: user._id.toString(), username: user.username, plan: user.plan, isManualGrant: user.isManualGrant });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    await connectDb();

    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await Automation.deleteMany({ userId: id });
    await Usage.deleteMany({ userId: id });

    return NextResponse.json({ success: true, deletedUser: user.username });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

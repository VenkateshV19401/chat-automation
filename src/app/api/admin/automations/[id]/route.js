import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { requireAdmin } from "@/lib/adminAuth";
import { Automation } from "@/lib/models/Automation";

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    await connectDb();

    const { id } = await params;
    const automation = await Automation.findByIdAndDelete(id);
    if (!automation) return NextResponse.json({ error: "Automation not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    requireAdmin(request);
    await connectDb();

    const { id } = await params;
    const updates = await request.json();

    const allowed = ["active"];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    const automation = await Automation.findByIdAndUpdate(id, filtered, { new: true });
    if (!automation) return NextResponse.json({ error: "Automation not found" }, { status: 404 });

    return NextResponse.json({ id: automation._id.toString(), active: automation.active });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

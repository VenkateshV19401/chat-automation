import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const user = await UserRepository.findUserById(authUser.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    accountType: user.accountType,
    instagramUserId: user.instagramUserId,
    permissions: user.permissions,
    connectedAt: user.connectedAt,
  });
}

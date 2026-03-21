import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { InstagramService } from "@/lib/services/InstagramService";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const user = await UserRepository.findUserById(authUser.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const media = await InstagramService.getAccountMedia(user);
    return NextResponse.json(media);
  } catch (error) {
    if (error.status === 401) {
      return NextResponse.json({
        error: "Instagram session expired. Please log in again.",
        code: error.code || "INSTAGRAM_AUTH_EXPIRED",
      }, { status: 401 });
    }
    console.error("[users] Media load failed:", error.details || error.message);
    return NextResponse.json({ error: "Failed to load Instagram media" }, { status: 500 });
  }
}

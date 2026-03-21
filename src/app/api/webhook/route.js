import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { AutomationEngine } from "@/lib/services/AutomationEngine";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("[webhook] Verification request:", { mode, token, challenge });

  if (mode === "subscribe" && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    console.log("[webhook] Verification successful");
    return new Response(challenge, { status: 200 });
  }

  console.error("[webhook] Verification failed");
  return new Response(null, { status: 403 });
}

export async function POST(request) {
  await connectDb();
  const body = await request.json();

  console.log("\n===== INSTAGRAM WEBHOOK RECEIVED =====");
  console.log("Time:", new Date().toISOString());
  console.log("Object:", body.object || "<missing>");

  for (const entry of body.entry || []) {
    const user = entry.id ? await UserRepository.findUserByAnyInstagramId(String(entry.id)) : null;

    for (const change of entry.changes || []) {
      if (change.field === "comments" || (change.field === "feed" && change.value?.item === "comment")) {
        const comment = change.value || {};
        console.log("--- COMMENT EVENT ---");
        console.log("Comment ID:", comment.id || "<missing>");
        console.log("Media ID:", comment.media?.id || comment.media_id || "<missing>");
        console.log("From:", comment.from?.username || "<unknown>");
        console.log("Text:", comment.text || "<empty>");

        if (!user) {
          console.warn(`[webhook] No user found for entry id ${entry.id}`);
          continue;
        }

        await AutomationEngine.processCommentEvent({
          commentId: comment.id,
          text: comment.text || "",
          mediaId: comment.media?.id || comment.media_id || "",
          fromId: comment.from?.id ? String(comment.from.id) : "",
          fromUsername: comment.from?.username || "",
        }, user);
      }
    }

    for (const event of entry.messaging || []) {
      console.log("--- MESSAGING EVENT ---");
      console.log("Sender:", event.sender?.id || "<missing>");
      console.log("Text:", event.message?.text || "<none>");
    }
  }

  console.log("======================================\n");
  return NextResponse.json({ received: true });
}

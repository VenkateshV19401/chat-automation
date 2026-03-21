import { config } from "../config/config.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { AutomationEngine } from "../services/AutomationEngine.js";

export function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("[webhook] Verification request:", { mode, token, challenge });

  if (mode === "subscribe" && token === config.webhookVerifyToken) {
    console.log("[webhook] Verification successful");
    return res.status(200).send(challenge);
  }

  console.error("[webhook] Verification failed");
  return res.sendStatus(403);
}

function logCommentChange(entry, change) {
  const comment = change.value || {};
  console.log("--- COMMENT EVENT ---");
  console.log("Entry ID:", entry.id);
  console.log("Field:", change.field);
  console.log("Comment ID:", comment.id || "<missing>");
  console.log("Media ID:", comment.media?.id || comment.media_id || "<missing>");
  console.log("From:", comment.from?.username || comment.from?.id || "<unknown>");
  console.log("Text:", comment.text || "<empty>");
}

function logMessagingEvent(entry, event) {
  const message = event.message || {};
  console.log("--- MESSAGING EVENT ---");
  console.log("Entry ID:", entry.id);
  console.log("Sender:", event.sender?.id || "<missing>");
  console.log("Recipient:", event.recipient?.id || "<missing>");
  console.log("Timestamp:", event.timestamp || "<missing>");
  console.log("Message ID:", message.mid || "<missing>");
  console.log("Is Echo:", message.is_echo === true ? "yes" : "no");
  console.log("Text:", message.text || "<none>");
  if (Array.isArray(message.attachments) && message.attachments.length > 0) {
    console.log("Attachments:", message.attachments.map((item) => item.type).join(", "));
  }
}

export async function receiveWebhook(req, res) {
  const body = req.body || {};

  console.log("\n===== INSTAGRAM WEBHOOK RECEIVED =====");
  console.log("Time:", new Date().toISOString());
  console.log("Object:", body.object || "<missing>");

  for (const entry of body.entry || []) {
    const user = entry.id ? UserRepository.findUserByAnyInstagramId(String(entry.id)) : null;

    for (const change of entry.changes || []) {
      if (change.field === "comments" || (change.field === "feed" && change.value?.item === "comment")) {
        logCommentChange(entry, change);

        if (!user) {
          console.warn(`[webhook] No user found for entry id ${entry.id}`);
          continue;
        }

        const comment = change.value || {};
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
      logMessagingEvent(entry, event);
    }
  }

  console.log("Raw Payload:");
  console.log(JSON.stringify(body, null, 2));
  console.log("======================================\n");
  res.sendStatus(200);
}

import { AutomationRepository } from "../repositories/AutomationRepository.js";
import { UsageRepository } from "../repositories/UsageRepository.js";
import { getPlan } from "../config/plans.js";
import { InstagramService } from "./InstagramService.js";

const RECENT_EVENT_TTL_MS = 2 * 60 * 1000;
const recentCommentEvents = new Map();

function markCommentEventProcessed(key) {
  recentCommentEvents.set(key, Date.now() + RECENT_EVENT_TTL_MS);
}

function hasRecentCommentEvent(key) {
  const expiresAt = recentCommentEvents.get(key);
  if (!expiresAt) return false;

  if (expiresAt <= Date.now()) {
    recentCommentEvents.delete(key);
    return false;
  }

  return true;
}

export const AutomationEngine = {
  async processCommentEvent(commentEvent, user) {
    const { commentId, text, mediaId, fromId, fromUsername } = commentEvent;

    if (!text) {
      console.log("[engine] Empty comment text, skipping");
      return;
    }

    if (!commentId) {
      console.log("[engine] Missing comment id, skipping");
      return;
    }

    const recentEventKey = `${user.id}:${commentId}`;
    if (hasRecentCommentEvent(recentEventKey)) {
      console.log(`[engine] Duplicate comment event ignored for ${commentId}`);
      return;
    }

    if (fromUsername && fromUsername === user.username) {
      console.log("[engine] Ignoring self-authored comment by username");
      return;
    }

    if (fromId && [user.instagramUserId, user.instagramLoginId, user.instagramTokenUserId].includes(fromId)) {
      console.log("[engine] Ignoring self-authored comment by user id");
      return;
    }

    const userAutomations = AutomationRepository.getAutomationsByUser(user.id).filter((automation) => {
      return automation.active !== false &&
        automation.triggerType === "comment" &&
        (!automation.targetMediaId || automation.targetMediaId === "any" || automation.targetMediaId === mediaId);
    });

    if (userAutomations.length === 0) {
      console.log(`[engine] No active automations found for user ${user.username}`);
      return;
    }

    const lowerText = text.toLowerCase();
    const matchedAutomation = userAutomations.find((rule) => {
      const triggerWord = rule.triggerKeyword.toLowerCase();
      if (rule.matchType === "exact") return lowerText === triggerWord;
      return lowerText.includes(triggerWord);
    });

    if (!matchedAutomation) {
      console.log("[engine] No trigger word found, skipping automation");
      return;
    }

    console.log(`[engine] Trigger matched \"${matchedAutomation.triggerKeyword}\" for ${user.username}`);
    const replyMessage = matchedAutomation.compiledReplyMessage || matchedAutomation.replyMessage;
    const plan = getPlan(user.plan);
    const usage = UsageRepository.getMonthlyUsage(user.id);
    if (plan.maxRepliesPerMonth !== Infinity && usage.repliesSent >= plan.maxRepliesPerMonth) {
      console.log(`[engine] Monthly reply limit (${plan.maxRepliesPerMonth}) reached for ${user.username}, skipping`);
      return;
    }

    markCommentEventProcessed(recentEventKey);

    if (matchedAutomation.replyType === "comment" || matchedAutomation.replyType === "both") {
      await InstagramService.replyToComment(commentId, replyMessage, user);
    }

    if (matchedAutomation.replyType === "dm" || matchedAutomation.replyType === "both") {
      await InstagramService.sendPrivateReply(commentId, replyMessage, user);
    }

    UsageRepository.incrementReplies(user.id);
  },
};

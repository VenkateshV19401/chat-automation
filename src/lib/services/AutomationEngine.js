import { AutomationRepository } from "../repositories/AutomationRepository.js";
import { UsageRepository } from "../repositories/UsageRepository.js";
import { ProcessedEvent } from "../models/ProcessedEvent.js";
import { getPlan } from "../config/plans.js";
import { InstagramService } from "./InstagramService.js";

async function hasRecentCommentEvent(key) {
  const doc = await ProcessedEvent.findOne({ key });
  return !!doc;
}

async function markCommentEventProcessed(key) {
  await ProcessedEvent.updateOne({ key }, { key, createdAt: new Date() }, { upsert: true });
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
    if (await hasRecentCommentEvent(recentEventKey)) {
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

    const allAutomations = await AutomationRepository.getAutomationsByUser(user.id);
    const userAutomations = allAutomations.filter((automation) => {
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

    console.log(`[engine] Trigger matched "${matchedAutomation.triggerKeyword}" for ${user.username}`);
    const replyMessage = matchedAutomation.compiledReplyMessage || matchedAutomation.replyMessage;
    const plan = getPlan(user.plan);
    const usage = await UsageRepository.getMonthlyUsage(user.id);
    if (plan.maxRepliesPerMonth !== Infinity && usage.repliesSent >= plan.maxRepliesPerMonth) {
      console.log(`[engine] Monthly reply limit (${plan.maxRepliesPerMonth}) reached for ${user.username}, skipping`);
      return;
    }

    await markCommentEventProcessed(recentEventKey);

    let commentSent = false;
    let dmSent = false;

    if (matchedAutomation.replyType === "comment" || matchedAutomation.replyType === "both") {
      commentSent = await InstagramService.replyToComment(commentId, replyMessage, user);
    }

    if (matchedAutomation.replyType === "dm" || matchedAutomation.replyType === "both") {
      dmSent = await InstagramService.sendPrivateReply(commentId, replyMessage, user);
    }

    const statsUpdate = {};
    if (commentSent) statsUpdate.commentReplies = 1;
    if (dmSent) statsUpdate.dmReplies = 1;
    if (Object.keys(statsUpdate).length > 0) {
      console.log(`[engine] Updating stats for automation ${matchedAutomation.id}:`, statsUpdate);
      await AutomationRepository.incrementStats(matchedAutomation.id, statsUpdate);
    }

    await UsageRepository.incrementReplies(user.id);
  },
};

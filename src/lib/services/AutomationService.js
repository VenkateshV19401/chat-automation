import { AutomationRepository } from "../repositories/AutomationRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { getPlan } from "../config/plans.js";

function buildCompiledReplyMessage(replyMessage, productLink) {
  if (!productLink) return replyMessage;
  return `${replyMessage}\n\n${productLink}`.trim();
}

function toAutomationRecord(userId, payload) {
  const replyMessage = payload.replyMessage?.trim() || "";
  const productLink = payload.productLink?.trim() || "";

  return {
    userId,
    triggerType: "comment",
    triggerKeyword: payload.triggerKeyword?.trim() || "",
    matchType: payload.matchType || "contains",
    replyType: payload.replyType || "both",
    replyMessage,
    productLink,
    compiledReplyMessage: buildCompiledReplyMessage(replyMessage, productLink),
    targetMediaId: payload.targetMediaId || "any",
    targetMediaCaption: payload.targetMediaCaption || "",
    targetMediaUrl: payload.targetMediaUrl || "",
    targetMediaType: payload.targetMediaType || "",
    active: payload.active !== false,
  };
}

export const AutomationService = {
  async getAutomations(userId) {
    return AutomationRepository.getAutomationsByUser(userId);
  },

  async getAutomationForMedia(userId, mediaId) {
    if (!mediaId) return null;
    return AutomationRepository.findAutomationByUserAndMediaId(userId, mediaId);
  },

  async createAutomation(userId, payload) {
    if (!payload.targetMediaId) throw new Error("targetMediaId is required");
    if (!payload.triggerKeyword?.trim()) throw new Error("triggerKeyword is required");

    const user = await UserRepository.findUserById(userId);
    const plan = await getPlan(user?.plan);
    const automations = await AutomationRepository.getAutomationsByUser(userId);
    if (automations.length >= plan.maxAutomations) {
      const error = new Error(`Your ${plan.name} plan allows up to ${plan.maxAutomations} automations. Upgrade to add more.`);
      error.code = "PLAN_LIMIT_REACHED";
      throw error;
    }

    const existing = await AutomationRepository.findAutomationByUserAndMediaId(userId, payload.targetMediaId);
    if (existing) {
      const error = new Error("Automation already exists for this media");
      error.code = "AUTOMATION_EXISTS";
      error.automation = existing;
      throw error;
    }

    return AutomationRepository.createAutomation(toAutomationRecord(userId, payload));
  },

  async updateAutomation(userId, automationId, payload) {
    const existing = await AutomationRepository.findAutomationById(automationId);
    if (!existing || existing.userId !== userId) return null;

    const updates = toAutomationRecord(userId, {
      ...existing,
      ...payload,
      targetMediaId: existing.targetMediaId,
    });

    return AutomationRepository.updateAutomation(automationId, updates);
  },

  async toggleAutomation(userId, automationId) {
    const existing = await AutomationRepository.findAutomationById(automationId);
    if (!existing || existing.userId !== userId) return null;
    return AutomationRepository.updateAutomation(automationId, { active: !existing.active });
  },

  async deleteAutomation(userId, automationId) {
    const existing = await AutomationRepository.findAutomationById(automationId);
    if (!existing || existing.userId !== userId) return null;
    return AutomationRepository.deleteAutomation(automationId);
  },
};

import { Automation } from "../models/Automation.js";

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export const AutomationRepository = {
  async createAutomation(automation) {
    const doc = await Automation.create(automation);
    return toPlain(doc);
  },

  async getAutomationsByUser(userId) {
    const docs = await Automation.find({ userId });
    return docs.map(toPlain);
  },

  async findAutomationById(id) {
    const doc = await Automation.findById(id);
    return toPlain(doc);
  },

  async findAutomationByUserAndMediaId(userId, mediaId) {
    const doc = await Automation.findOne({ userId, targetMediaId: mediaId });
    return toPlain(doc);
  },

  async updateAutomation(id, updates) {
    const doc = await Automation.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return toPlain(doc);
  },

  async deleteAutomation(id) {
    const doc = await Automation.findByIdAndDelete(id);
    return toPlain(doc);
  },
};

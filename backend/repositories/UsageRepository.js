import { Usage } from "../models/Usage.js";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const UsageRepository = {
  async getMonthlyUsage(userId) {
    const month = currentMonth();
    const doc = await Usage.findOne({ userId, month });
    if (!doc) return { userId, month, repliesSent: 0 };
    return { userId: doc.userId, month: doc.month, repliesSent: doc.repliesSent };
  },

  async incrementReplies(userId) {
    const month = currentMonth();
    await Usage.findOneAndUpdate(
      { userId, month },
      { $inc: { repliesSent: 1 } },
      { upsert: true }
    );
  },
};

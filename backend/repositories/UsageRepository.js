import { readDb, writeDb } from "./DatabaseRepository.js";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const UsageRepository = {
  getMonthlyUsage(userId) {
    const db = readDb();
    const month = currentMonth();
    return db.usage.find((u) => u.userId === userId && u.month === month) || { userId, month, repliesSent: 0 };
  },

  incrementReplies(userId) {
    const db = readDb();
    const month = currentMonth();
    const index = db.usage.findIndex((u) => u.userId === userId && u.month === month);
    if (index === -1) {
      db.usage.push({ userId, month, repliesSent: 1 });
    } else {
      db.usage[index].repliesSent += 1;
    }
    writeDb(db);
  },
};

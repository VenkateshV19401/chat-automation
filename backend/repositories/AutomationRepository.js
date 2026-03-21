import crypto from "node:crypto";
import { readDb, writeDb } from "./DatabaseRepository.js";

export const AutomationRepository = {
  createAutomation(automation) {
    const db = readDb();
    const newAutomation = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...automation,
    };
    db.automations.push(newAutomation);
    writeDb(db);
    return newAutomation;
  },

  getAutomationsByUser(userId) {
    const db = readDb();
    return db.automations.filter((automation) => automation.userId === userId);
  },

  findAutomationById(id) {
    const db = readDb();
    return db.automations.find((automation) => automation.id === id) || null;
  },

  findAutomationByUserAndMediaId(userId, mediaId) {
    const db = readDb();
    return db.automations.find((automation) => automation.userId === userId && automation.targetMediaId === mediaId) || null;
  },

  updateAutomation(id, updates) {
    const db = readDb();
    const index = db.automations.findIndex((automation) => automation.id === id);
    if (index === -1) return null;
    db.automations[index] = {
      ...db.automations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.automations[index];
  },

  deleteAutomation(id) {
    const db = readDb();
    const index = db.automations.findIndex((automation) => automation.id === id);
    if (index === -1) return null;
    const deleted = db.automations.splice(index, 1)[0];
    writeDb(db);
    return deleted;
  },
};

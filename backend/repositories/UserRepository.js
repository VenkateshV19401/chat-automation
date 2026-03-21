import crypto from "node:crypto";
import { readDb, writeDb } from "./DatabaseRepository.js";

export const UserRepository = {
  createUser(user) {
    const db = readDb();
    const newUser = {
      id: crypto.randomUUID(),
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },

  updateUser(id, updates) {
    const db = readDb();
    const index = db.users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    db.users[index] = {
      ...db.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.users[index];
  },

  findUserById(id) {
    const db = readDb();
    return db.users.find((user) => user.id === id) || null;
  },

  findUserByInstagramUserId(instagramUserId) {
    const db = readDb();
    return db.users.find((user) => user.instagramUserId === instagramUserId) || null;
  },

  findUserByAnyInstagramId(candidateId) {
    const db = readDb();
    return db.users.find((user) => [
      user.instagramUserId,
      user.instagramLoginId,
      user.instagramTokenUserId,
    ].includes(candidateId)) || null;
  },

  findUserByRefreshTokenHash(refreshTokenHash) {
    const db = readDb();
    return db.users.find((user) => user.refreshTokenHash === refreshTokenHash) || null;
  },

  findUserByStripeCustomerId(stripeCustomerId) {
    const db = readDb();
    return db.users.find((user) => user.stripeCustomerId === stripeCustomerId) || null;
  },
};

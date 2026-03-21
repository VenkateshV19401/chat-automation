import { User } from "../models/User.js";

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export const UserRepository = {
  async createUser(user) {
    const doc = await User.create(user);
    return toPlain(doc);
  },

  async updateUser(id, updates) {
    const doc = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return toPlain(doc);
  },

  async findUserById(id) {
    const doc = await User.findById(id);
    return toPlain(doc);
  },

  async findUserByInstagramUserId(instagramUserId) {
    const doc = await User.findOne({ instagramUserId });
    return toPlain(doc);
  },

  async findUserByAnyInstagramId(candidateId) {
    const doc = await User.findOne({
      $or: [
        { instagramUserId: candidateId },
        { instagramLoginId: candidateId },
        { instagramTokenUserId: candidateId },
      ],
    });
    return toPlain(doc);
  },

  async findUserByRefreshTokenHash(refreshTokenHash) {
    const doc = await User.findOne({ refreshTokenHash });
    return toPlain(doc);
  },

  async findUserByStripeCustomerId(stripeCustomerId) {
    const doc = await User.findOne({ stripeCustomerId });
    return toPlain(doc);
  },
};

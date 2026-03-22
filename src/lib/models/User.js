import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    instagramUserId: { type: String, index: true },
    instagramLoginId: { type: String },
    instagramTokenUserId: { type: String },
    username: { type: String },
    profilePictureUrl: { type: String },
    accountType: { type: String },
    accessToken: { type: String },
    permissions: [{ type: String }],
    tokenType: { type: String, default: "bearer" },
    tokenExpiresIn: { type: Number },
    tokenExpiresAt: { type: String },
    refreshTokenHash: { type: String, index: true },
    refreshTokenExpiresAt: { type: String },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String },
    plan: { type: String, default: "free" },
    planActivatedAt: { type: String },
    connectedAt: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

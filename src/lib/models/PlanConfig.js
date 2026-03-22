import mongoose from "mongoose";

const planConfigSchema = new mongoose.Schema(
  {
    planId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    maxAutomations: { type: Number, default: 2 },
    maxRepliesPerMonth: { type: Number, default: 100 },
    canSendDM: { type: Boolean, default: true },
    stripePriceId: { type: String, default: "" },
    priceInr: { type: Number, default: 0 },
    features: [{ type: String }],
  },
  { timestamps: true }
);

export const PlanConfig = mongoose.models.PlanConfig || mongoose.model("PlanConfig", planConfigSchema);

import mongoose from "mongoose";

const automationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    triggerType: { type: String },
    triggerKeyword: { type: String },
    matchType: { type: String },
    replyType: { type: String },
    replyMessage: { type: String },
    compiledReplyMessage: { type: String },
    productLink: { type: String },
    targetMediaId: { type: String },
    targetMediaCaption: { type: String },
    targetMediaUrl: { type: String },
    targetMediaType: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Automation = mongoose.model("Automation", automationSchema);

import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  month: { type: String, required: true },
  repliesSent: { type: Number, default: 0 },
});

usageSchema.index({ userId: 1, month: 1 }, { unique: true });

export const Usage = mongoose.model("Usage", usageSchema);

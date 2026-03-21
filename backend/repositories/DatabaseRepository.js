import mongoose from "mongoose";
import { config } from "../config/config.js";

let isConnected = false;

export async function connectDb() {
  if (isConnected) return;

  try {
    await mongoose.connect(config.mongodbUri);
    isConnected = true;
    console.log("[database] Connected to MongoDB");
  } catch (error) {
    console.error("[database] MongoDB connection error:", error.message);
    process.exit(1);
  }
}

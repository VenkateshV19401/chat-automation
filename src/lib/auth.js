import jwt from "jsonwebtoken";
import { config } from "./config/config.js";

export function requireAuth(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    const error = new Error("Missing bearer token");
    error.status = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return { id: decoded.userId };
  } catch (_error) {
    const error = new Error("Invalid or expired token");
    error.status = 401;
    throw error;
  }
}

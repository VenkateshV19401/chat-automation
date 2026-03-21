import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = { id: decoded.userId };
    next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

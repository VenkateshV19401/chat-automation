import jwt from "jsonwebtoken";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "vvv7052@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "venkatesh";
const ADMIN_JWT_SECRET = process.env.JWT_SECRET + "_admin";

export function verifyAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function createAdminToken() {
  return jwt.sign({ role: "admin", email: ADMIN_EMAIL }, ADMIN_JWT_SECRET, { expiresIn: "1h" });
}

export function requireAdmin(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    if (!match) throw new Error("Unauthorized");
    const cookieToken = match[1];
    const decoded = jwt.verify(cookieToken, ADMIN_JWT_SECRET);
    if (decoded.role !== "admin") throw new Error("Unauthorized");
    return decoded;
  }

  const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Unauthorized");
  return decoded;
}

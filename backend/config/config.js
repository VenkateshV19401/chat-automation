import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");

dotenv.config({ path: envPath });

const requiredEnv = [
  "INSTAGRAM_APP_ID",
  "INSTAGRAM_APP_SECRET",
  "INSTAGRAM_REDIRECT_URI",
  "INSTAGRAM_WEBHOOK_VERIFY_TOKEN",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`[config] Missing environment variable: ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "",
  jwtSecret: process.env.JWT_SECRET || "INSTAGRAM_AUTOMATION_SECRET_CHANGE_ME",
  appAccessTokenExpiresIn: process.env.APP_ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenTtlDays: Number(process.env.APP_REFRESH_TOKEN_TTL_DAYS || 30),
  refreshCookieName: process.env.APP_REFRESH_COOKIE_NAME || "insta_refresh_token",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  appId: process.env.INSTAGRAM_APP_ID || "",
  appSecret: process.env.INSTAGRAM_APP_SECRET || "",
  redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:4000/auth/callback",
  webhookVerifyToken: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "",
  tokenRefreshLeadSeconds: Number(process.env.INSTAGRAM_TOKEN_REFRESH_LEAD_SECONDS || 86400),
  scopes: (process.env.INSTAGRAM_SCOPES || "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

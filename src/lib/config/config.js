const requiredEnv = [
  "MONGODB_URI",
  "INSTAGRAM_APP_ID",
  "INSTAGRAM_APP_SECRET",
  "INSTAGRAM_REDIRECT_URI",
  "INSTAGRAM_WEBHOOK_VERIFY_TOKEN",
  "JWT_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`[config] Missing environment variable: ${key}`);
  }
}

export const config = {
  mongodbUri: process.env.MONGODB_URI || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  jwtSecret: process.env.JWT_SECRET || "INSTAGRAM_AUTOMATION_SECRET_CHANGE_ME",
  appAccessTokenExpiresIn: process.env.APP_ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenTtlDays: Number(process.env.APP_REFRESH_TOKEN_TTL_DAYS || 30),
  refreshCookieName: process.env.APP_REFRESH_COOKIE_NAME || "insta_refresh_token",
  cookieSecure: process.env.NODE_ENV === "production",
  appId: process.env.INSTAGRAM_APP_ID || "",
  appSecret: process.env.INSTAGRAM_APP_SECRET || "",
  redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3001/api/auth/callback",
  webhookVerifyToken: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "",
  tokenRefreshLeadSeconds: Number(process.env.INSTAGRAM_TOKEN_REFRESH_LEAD_SECONDS || 86400),
  scopes: (process.env.INSTAGRAM_SCOPES || "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

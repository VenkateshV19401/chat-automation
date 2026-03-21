import express from "express";
import cors from "cors";
import { config } from "./config/config.js";
import { requireAuth } from "./middlewares/authMiddleware.js";
import appRoutes from "./routes/appRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

const app = express();

app.use(cors({ origin: config.frontendUrl || true, credentials: true }));

// Stripe webhook needs raw body — must come before express.json()
app.post("/payments/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());

app.use("/", appRoutes);
app.use("/auth", authRoutes);
app.use("/users", requireAuth, userRoutes);
app.use("/automations", requireAuth, automationRoutes);
app.use("/webhook", webhookRoutes);
app.use("/payments", paymentRoutes);

app.listen(config.port, () => {
  console.log(`Instagram automation server running on http://localhost:${config.port}`);
  console.log(`[startup] Login route: http://localhost:${config.port}/auth/login`);
  console.log(`[startup] Webhook route: http://localhost:${config.port}/webhook`);
  console.log(`[startup] Redirect URI: ${config.redirectUri}`);
  console.log(`[startup] Verify token: ${config.webhookVerifyToken || "<empty>"}`);
});

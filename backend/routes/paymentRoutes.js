import { Router } from "express";
import { getPlans, getUsage, createCheckoutSession, createPortalSession } from "../controllers/paymentController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/plans", getPlans);
router.get("/usage", requireAuth, getUsage);
router.post("/checkout", requireAuth, createCheckoutSession);
router.post("/portal", requireAuth, createPortalSession);

export default router;

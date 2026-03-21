import express from "express";
import {
  handleInstagramCallback,
  logout,
  refreshSession,
  startInstagramLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/login", startInstagramLogin);
router.get("/callback", handleInstagramCallback);
router.post("/refresh", refreshSession);
router.post("/logout", logout);

export default router;

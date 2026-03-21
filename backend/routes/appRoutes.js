import express from "express";
import {
  getDataDeletionPage,
  getHealth,
  getHomePage,
  getPrivacyPage,
  getTermsPage,
  handleDeauthorize,
  handleDeletionRequest,
} from "../controllers/appController.js";

const router = express.Router();

router.get("/", getHomePage);
router.get("/health", getHealth);
router.get("/privacy", getPrivacyPage);
router.get("/terms", getTermsPage);
router.get("/data-deletion", getDataDeletionPage);
router.get("/deauthorize", handleDeauthorize);
router.post("/deauthorize", handleDeauthorize);
router.get("/deletion", handleDeletionRequest);
router.post("/deletion", handleDeletionRequest);

export default router;

import express from "express";
import {
  createAutomation,
  deleteAutomation,
  getAutomationForMedia,
  getAutomations,
  toggleAutomation,
  updateAutomation,
} from "../controllers/automationController.js";

const router = express.Router();

router.get("/", getAutomations);
router.get("/by-media/:mediaId", getAutomationForMedia);
router.post("/", createAutomation);
router.patch("/:id", updateAutomation);
router.patch("/:id/toggle", toggleAutomation);
router.delete("/:id", deleteAutomation);

export default router;

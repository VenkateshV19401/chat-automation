import express from "express";
import { getMe, getMedia } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", getMe);
router.get("/media", getMedia);

export default router;

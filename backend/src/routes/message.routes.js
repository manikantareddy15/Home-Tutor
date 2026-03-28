import { Router } from "express";
import { sendMessage, getConversations } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/", protect, sendMessage);
router.get("/", protect, getConversations);
export default router;

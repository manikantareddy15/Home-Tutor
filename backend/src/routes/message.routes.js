import { Router } from "express";
import { sendMessage, getConversations, getConversationsList, deleteMessage } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, sendMessage);
router.get("/conversations/list", protect, getConversationsList);
router.get("/", protect, getConversations);
router.delete("/:id", protect, deleteMessage);

export default router;

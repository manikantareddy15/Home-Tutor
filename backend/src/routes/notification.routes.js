import { Router } from "express";
import { getNotifications, markRead, deleteNotification } from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markRead);
router.delete("/:id", protect, deleteNotification);
export default router;

import { Router } from "express";
import { getTutors, getTutorById, approveTutor } from "../controllers/tutor.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { ROLES } from "../utils/constants.js";
const router = Router();
router.get("/", getTutors);
router.get("/:id", getTutorById);
router.patch("/:id/approve", protect, authorize(ROLES.ADMIN), approveTutor);
export default router;

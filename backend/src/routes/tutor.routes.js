import { Router } from "express";
import { getTutors, getTutorById, approveTutor, updateTutorProfile } from "../controllers/tutor.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.get("/", getTutors);
router.patch("/profile", protect, authorize(ROLES.TUTOR), updateTutorProfile);
router.get("/:id", getTutorById);
router.patch("/:id/approve", protect, authorize(ROLES.ADMIN), approveTutor);

export default router;

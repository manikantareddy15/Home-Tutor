import { Router } from "express";
import {
  dashboardStats,
  students,
  tutors,
  getPendingTutors,
  approveTutor,
  rejectTutor
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get("/dashboard", dashboardStats);
router.get("/students", students);
router.get("/tutors", tutors);
router.get("/pending-tutors", getPendingTutors);
router.patch("/tutors/:tutorId/approve", approveTutor);
router.delete("/tutors/:tutorId/reject", rejectTutor);

export default router;

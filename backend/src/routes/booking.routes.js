import { Router } from "express";
import { createBooking, getBookings, updateBookingStatus } from "../controllers/booking.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { ROLES } from "../utils/constants.js";
const router = Router();
router.post("/", protect, authorize(ROLES.STUDENT), createBooking);
router.get("/", protect, getBookings);
router.patch("/:id/status", protect, authorize(ROLES.TUTOR, ROLES.ADMIN), updateBookingStatus);
export default router;

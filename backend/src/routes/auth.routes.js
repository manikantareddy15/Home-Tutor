import { Router } from "express";
import { register, login, adminLogin, me, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../config/multer.js";

const router = Router();

router.post("/register", upload.fields([
  { name: 'cert11th', maxCount: 1 },
  { name: 'cert12th', maxCount: 1 },
  { name: 'certGraduation', maxCount: 1 },
  { name: 'profileIcon', maxCount: 1 }
]), register);

router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/me", protect, me);
router.put("/profile", protect, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'profileIcon', maxCount: 1 }
]), updateProfile);

export default router;

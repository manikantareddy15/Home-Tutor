import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { ROLES } from "../utils/constants.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });
const run = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Booking.deleteMany({})]);
  const student = await User.create({ fullName: "Aanya Student", email: "student@hometutor.com", password: "Student@123", role: ROLES.STUDENT, isApproved: true });
  const tutor = await User.create({ fullName: "Rohit Tutor", email: "tutor@hometutor.com", password: "Tutor@123", role: ROLES.TUTOR, subjects: ["Math","Physics"], experienceYears: 4, hourlyRate: 500, rating: 4.8, isApproved: true });
  await Booking.create({ student: student._id, tutor: tutor._id, subject: "Math", mode: "online", startTime: new Date(Date.now()+3600000), endTime: new Date(Date.now()+7200000), hourlyRate: 500, totalPrice: 500, status: "confirmed" });
  process.exit(0);
};
run().catch((e)=>{ console.error(e); process.exit(1); });

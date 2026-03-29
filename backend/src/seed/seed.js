import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { ROLES } from "../utils/constants.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });
const run = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Booking.deleteMany({}), Notification.deleteMany({})]);
  const student = await User.create({ fullName: "Aanya Student", email: "student@hometutor.com", password: "Student@123", role: ROLES.STUDENT, isApproved: true });
  const tutor = await User.create({ fullName: "Rohit Tutor", email: "tutor@hometutor.com", password: "Tutor@123", role: ROLES.TUTOR, subjects: ["Math","Physics"], experienceYears: 4, hourlyRate: 500, rating: 4.8, isApproved: true });
  const booking = await Booking.create({ student: student._id, tutor: tutor._id, subject: "Math", mode: "online", startTime: new Date(Date.now()+3600000), endTime: new Date(Date.now()+7200000), hourlyRate: 500, totalPrice: 500, status: "confirmed" });
  
  // Create sample notifications for student
  await Notification.create([
    {
      user: student._id,
      title: "New Session Scheduled",
      message: "Your session with Rohit Tutor has been scheduled for tomorrow at 2:00 PM",
      type: "booking",
      read: false
    },
    {
      user: student._id,
      title: "Message from Tutor",
      message: "Hi! I'm looking forward to our session. Please prepare chapter 5 of your textbook.",
      type: "message",
      read: false
    },
    {
      user: student._id,
      title: "Session Completed",
      message: "Your previous session with Rohit Tutor has been marked as completed",
      type: "completed",
      read: true
    },
    {
      user: student._id,
      title: "Payment Processed",
      message: "Payment of ₹500 has been successfully processed",
      type: "payment",
      read: true
    }
  ]);

  // Create sample notifications for tutor
  await Notification.create([
    {
      user: tutor._id,
      title: "New Session Request",
      message: "Aanya Student booked a session with you for tomorrow at 2:00 PM",
      type: "booking",
      read: false
    },
    {
      user: tutor._id,
      title: "Message from Student",
      message: "Thank you for the great session! Can we discuss part 2 next time?",
      type: "message",
      read: false
    },
    {
      user: tutor._id,
      title: "Session Completed",
      message: "Your session with Aanya Student was successfully completed",
      type: "completed",
      read: true
    },
    {
      user: tutor._id,
      title: "Payment Received",
      message: "You received ₹500 for the completed session",
      type: "payment",
      read: true
    }
  ]);

  process.exit(0);
};
run().catch((e)=>{ console.error(e); process.exit(1); });

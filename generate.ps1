$ErrorActionPreference = "Stop"

$files = @{
  "backend/.env.example" = @"
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hometutor
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@hometutor.com
ADMIN_PASSWORD=Admin@123
CLIENT_URL=http://localhost:5173
"@
  "backend/package.json" = @"
{
  "name": "hometutor-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed/seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.6.2",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
"@
  "backend/src/config/db.js" = @"
import mongoose from "mongoose";
export const connectDB = async () => mongoose.connect(process.env.MONGO_URI);
"@
  "backend/src/utils/constants.js" = @"
export const ROLES = { STUDENT: "student", TUTOR: "tutor", ADMIN: "admin" };
export const BOOKING_STATUS = {
  PENDING: "pending", CONFIRMED: "confirmed", ONGOING: "ongoing",
  COMPLETED: "completed", CANCELLED: "cancelled", REJECTED: "rejected"
};
"@
  "backend/src/models/User.js" = @"
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../utils/constants.js";
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT },
  subjects: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  bio: { type: String, default: "" }
}, { timestamps: true });
userSchema.pre("save", async function(next){ if(!this.isModified("password")) return next(); this.password = await bcrypt.hash(this.password, 10); next(); });
userSchema.methods.matchPassword = function(candidate){ return bcrypt.compare(candidate, this.password); };
export const User = mongoose.model("User", userSchema);
"@
  "backend/src/models/Booking.js" = @"
import mongoose from "mongoose";
import { BOOKING_STATUS } from "../utils/constants.js";
const bookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: String, mode: { type: String, enum: ["online", "offline"] },
  startTime: Date, endTime: Date, hourlyRate: Number, totalPrice: Number,
  status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
  otp: { type: String, default: "" }
}, { timestamps: true });
export const Booking = mongoose.model("Booking", bookingSchema);
"@
  "backend/src/models/Message.js" = @"
import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({ from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, to: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, content: String }, { timestamps: true });
export const Message = mongoose.model("Message", messageSchema);
"@
  "backend/src/models/Notification.js" = @"
import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, title: String, message: String, type: String, read: { type: Boolean, default: false } }, { timestamps: true });
export const Notification = mongoose.model("Notification", notificationSchema);
"@
  "backend/src/middleware/auth.middleware.js" = @"
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
export const protect = async (req,res,next) => {
  const auth = req.headers.authorization;
  if(!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  try{
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select("-password");
    if(!req.user) return res.status(401).json({ message: "Unauthorized" });
    next();
  }catch{ res.status(401).json({ message: "Invalid token" }); }
};
export const authorize = (...roles) => (req,res,next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ message: "Forbidden" });
"@
  "backend/src/middleware/error.middleware.js" = @"
export const notFound = (req,res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
export const errorHandler = (err,req,res,next) => res.status(err.status || 500).json({ message: err.message || "Internal server error" });
"@
  "backend/src/utils/jwt.js" = @"
import jwt from "jsonwebtoken";
export const generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
"@
  "backend/src/controllers/auth.controller.js" = @"
import { User } from "../models/User.js";
import { ROLES } from "../utils/constants.js";
import { generateToken } from "../utils/jwt.js";
const sanitize = (u) => ({ id: u._id, fullName: u.fullName, email: u.email, role: u.role, subjects: u.subjects, experienceYears: u.experienceYears, hourlyRate: u.hourlyRate, rating: u.rating, isApproved: u.isApproved, bio: u.bio });
export const register = async (req,res) => {
  const { fullName,email,password,role,subjects,experienceYears,hourlyRate } = req.body;
  if(![ROLES.STUDENT,ROLES.TUTOR].includes(role)) return res.status(400).json({ message: "Invalid role" });
  if(await User.findOne({ email })) return res.status(409).json({ message: "Email already exists" });
  const user = await User.create({ fullName,email,password,role,subjects: role===ROLES.TUTOR ? subjects || [] : [], experienceYears: Number(experienceYears || 0), hourlyRate: Number(hourlyRate || 0), isApproved: role===ROLES.STUDENT });
  res.status(201).json({ token: generateToken({ id: user._id, role: user.role }), user: sanitize(user) });
};
export const login = async (req,res) => {
  const { email,password } = req.body;
  const user = await User.findOne({ email });
  if(!user || !(await user.matchPassword(password))) return res.status(401).json({ message: "Invalid credentials" });
  if(user.role===ROLES.TUTOR && !user.isApproved) return res.status(403).json({ message: "Tutor pending approval" });
  res.json({ token: generateToken({ id: user._id, role: user.role }), user: sanitize(user) });
};
export const adminLogin = async (req,res) => {
  const { email,password } = req.body;
  if(email!==process.env.ADMIN_EMAIL || password!==process.env.ADMIN_PASSWORD) return res.status(401).json({ message: "Invalid admin credentials" });
  let admin = await User.findOne({ email, role: ROLES.ADMIN });
  if(!admin) admin = await User.create({ fullName: "Platform Admin", email, password, role: ROLES.ADMIN, isApproved: true });
  res.json({ token: generateToken({ id: admin._id, role: admin.role }), user: sanitize(admin) });
};
export const me = async (req,res) => res.json({ user: sanitize(req.user) });
"@
  "backend/src/controllers/tutor.controller.js" = @"
import { User } from "../models/User.js";
import { ROLES } from "../utils/constants.js";
export const getTutors = async (req,res) => {
  const { subject,minPrice,maxPrice,minExperience } = req.query;
  const q = { role: ROLES.TUTOR, isApproved: true, isActive: true };
  if(subject) q.subjects = subject;
  if(minExperience) q.experienceYears = { `$gte`: Number(minExperience) };
  if(minPrice || maxPrice){ q.hourlyRate = {}; if(minPrice) q.hourlyRate.`$gte` = Number(minPrice); if(maxPrice) q.hourlyRate.`$lte` = Number(maxPrice); }
  const tutors = await User.find(q).select("-password");
  res.json({ tutors });
};
export const getTutorById = async (req,res) => {
  const tutor = await User.findOne({ _id: req.params.id, role: ROLES.TUTOR }).select("-password");
  if(!tutor) return res.status(404).json({ message: "Tutor not found" });
  res.json({ tutor });
};
export const approveTutor = async (req,res) => {
  const tutor = await User.findOne({ _id: req.params.id, role: ROLES.TUTOR });
  if(!tutor) return res.status(404).json({ message: "Tutor not found" });
  tutor.isApproved = req.body.approved !== false;
  await tutor.save();
  res.json({ tutor });
};
"@
  "backend/src/controllers/booking.controller.js" = @"
import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { BOOKING_STATUS, ROLES } from "../utils/constants.js";
const notify = (user,title,message,type="booking") => Notification.create({ user,title,message,type });
export const createBooking = async (req,res) => {
  const { tutorId,subject,mode,startTime,endTime } = req.body;
  const tutor = await User.findOne({ _id: tutorId, role: ROLES.TUTOR, isApproved: true });
  if(!tutor) return res.status(404).json({ message: "Tutor unavailable" });
  if(!tutor.subjects.includes(subject)) return res.status(400).json({ message: "Subject not offered by tutor" });
  const start = new Date(startTime), end = new Date(endTime), hours = Math.max(1, (end-start)/(1000*60*60));
  const booking = await Booking.create({ student: req.user._id, tutor: tutor._id, subject, mode, startTime: start, endTime: end, hourlyRate: tutor.hourlyRate, totalPrice: tutor.hourlyRate * hours });
  await notify(tutor._id, "New booking request", `Booking request for ${subject}`);
  res.status(201).json({ booking });
};
export const getBookings = async (req,res) => {
  const q = {};
  if(req.user.role===ROLES.STUDENT) q.student = req.user._id;
  if(req.user.role===ROLES.TUTOR) q.tutor = req.user._id;
  if(req.query.status) q.status = req.query.status;
  if(req.query.mode) q.mode = req.query.mode;
  const bookings = await Booking.find(q).populate("student","fullName").populate("tutor","fullName subjects hourlyRate").sort({ createdAt: -1 });
  res.json({ bookings });
};
export const updateBookingStatus = async (req,res) => {
  const booking = await Booking.findById(req.params.id);
  if(!booking) return res.status(404).json({ message: "Booking not found" });
  if(req.user.role===ROLES.TUTOR && String(booking.tutor)!==String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
  booking.status = req.body.status;
  if(req.body.status===BOOKING_STATUS.ONGOING) booking.otp = String(Math.floor(100000 + Math.random()*900000));
  await booking.save();
  await notify(booking.student, "Booking updated", `Status -> ${booking.status}`);
  res.json({ booking });
};
"@
  "backend/src/controllers/message.controller.js" = @"
import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
export const sendMessage = async (req,res) => {
  const msg = await Message.create({ from: req.user._id, to: req.body.to, content: req.body.content });
  await Notification.create({ user: req.body.to, title: "New message", message: `Message from ${req.user.fullName}`, type: "message" });
  res.status(201).json({ message: msg });
};
export const getConversations = async (req,res) => {
  const withUser = req.query.withUser;
  const messages = await Message.find({ `$or`: [{ from: req.user._id, to: withUser }, { from: withUser, to: req.user._id }] }).populate("from","fullName").sort({ createdAt: 1 });
  res.json({ messages });
};
"@
  "backend/src/controllers/notification.controller.js" = @"
import { Notification } from "../models/Notification.js";
export const getNotifications = async (req,res) => res.json({ notifications: await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }) });
export const markRead = async (req,res) => res.json({ notification: await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true }) });
export const deleteNotification = async (req,res) => { await Notification.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ message: "Deleted" }); };
"@
  "backend/src/controllers/admin.controller.js" = @"
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { ROLES } from "../utils/constants.js";
export const dashboardStats = async (req,res) => {
  const [totalTutors,totalStudents,pendingApprovals,sessionsToday] = await Promise.all([
    User.countDocuments({ role: ROLES.TUTOR }),
    User.countDocuments({ role: ROLES.STUDENT }),
    User.countDocuments({ role: ROLES.TUTOR, isApproved: false }),
    Booking.countDocuments({ startTime: { `$gte`: new Date(new Date().setHours(0,0,0,0)), `$lte`: new Date(new Date().setHours(23,59,59,999)) } })
  ]);
  const recentSessions = await Booking.find().sort({ createdAt: -1 }).limit(10).populate("student tutor","fullName");
  res.json({ stats: { totalTutors,totalStudents,pendingApprovals,sessionsToday }, recentSessions });
};
export const students = async (req,res) => res.json({ students: await User.find({ role: ROLES.STUDENT }).select("-password") });
export const tutors = async (req,res) => res.json({ tutors: await User.find({ role: ROLES.TUTOR }).select("-password") });
"@
  "backend/src/routes/auth.routes.js" = @"
import { Router } from "express";
import { register, login, adminLogin, me } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/me", protect, me);
export default router;
"@
  "backend/src/routes/tutor.routes.js" = @"
import { Router } from "express";
import { getTutors, getTutorById, approveTutor } from "../controllers/tutor.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { ROLES } from "../utils/constants.js";
const router = Router();
router.get("/", getTutors);
router.get("/:id", getTutorById);
router.patch("/:id/approve", protect, authorize(ROLES.ADMIN), approveTutor);
export default router;
"@
  "backend/src/routes/booking.routes.js" = @"
import { Router } from "express";
import { createBooking, getBookings, updateBookingStatus } from "../controllers/booking.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { ROLES } from "../utils/constants.js";
const router = Router();
router.post("/", protect, authorize(ROLES.STUDENT), createBooking);
router.get("/", protect, getBookings);
router.patch("/:id/status", protect, authorize(ROLES.TUTOR, ROLES.ADMIN), updateBookingStatus);
export default router;
"@
  "backend/src/routes/message.routes.js" = @"
import { Router } from "express";
import { sendMessage, getConversations } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/", protect, sendMessage);
router.get("/", protect, getConversations);
export default router;
"@
  "backend/src/routes/notification.routes.js" = @"
import { Router } from "express";
import { getNotifications, markRead, deleteNotification } from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markRead);
router.delete("/:id", protect, deleteNotification);
export default router;
"@
  "backend/src/routes/admin.routes.js" = @"
import { Router } from "express";
import { dashboardStats, students, tutors } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { ROLES } from "../utils/constants.js";
const router = Router();
router.use(protect, authorize(ROLES.ADMIN));
router.get("/dashboard", dashboardStats);
router.get("/students", students);
router.get("/tutors", tutors);
export default router;
"@
  "backend/src/app.js" = @"
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.get("/api/health", (_req,res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
"@
  "backend/src/server.js" = @"
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
dotenv.config();
const start = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on ${port}`));
};
start().catch((e) => { console.error(e); process.exit(1); });
"@
  "backend/src/seed/seed.js" = @"
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { ROLES } from "../utils/constants.js";
dotenv.config();
const run = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Booking.deleteMany({})]);
  const student = await User.create({ fullName: "Aanya Student", email: "student@hometutor.com", password: "Student@123", role: ROLES.STUDENT, isApproved: true });
  const tutor = await User.create({ fullName: "Rohit Tutor", email: "tutor@hometutor.com", password: "Tutor@123", role: ROLES.TUTOR, subjects: ["Math","Physics"], experienceYears: 4, hourlyRate: 500, rating: 4.8, isApproved: true });
  await Booking.create({ student: student._id, tutor: tutor._id, subject: "Math", mode: "online", startTime: new Date(Date.now()+3600000), endTime: new Date(Date.now()+7200000), hourlyRate: 500, totalPrice: 500, status: "confirmed" });
  console.log("Seed completed");
  process.exit(0);
};
run().catch((e)=>{ console.error(e); process.exit(1); });
"@
  "frontend/package.json" = @"
{
  "name": "hometutor-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "vite": "^5.4.8"
  }
}
"@
  "frontend/index.html" = @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HomeTutor</title>
  </head>
  <body class="bg-slate-50">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"@
  "frontend/vite.config.js" = @"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()] });
"@
  "frontend/tailwind.config.js" = @"
/** @type {import('tailwindcss').Config} */
export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] };
"@
  "frontend/postcss.config.js" = @"
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
"@
  "frontend/src/index.css" = @"
@tailwind base;
@tailwind components;
@tailwind utilities;
body { @apply text-slate-800; }
.card { @apply rounded-xl bg-white p-4 shadow-sm border border-slate-100; }
"@
  "frontend/src/main.jsx" = @"
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./store/AuthContext";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
"@
  "frontend/src/services/api.js" = @"
import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hometutor_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
"@
  "frontend/src/store/AuthContext.jsx" = @"
import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("hometutor_user") || "null"));
  const login = async (payload, isAdmin = false) => {
    const { data } = await api.post(isAdmin ? "/auth/admin/login" : "/auth/login", payload);
    localStorage.setItem("hometutor_token", data.token);
    localStorage.setItem("hometutor_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("hometutor_token", data.token);
    localStorage.setItem("hometutor_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const logout = () => { localStorage.removeItem("hometutor_token"); localStorage.removeItem("hometutor_user"); setUser(null); };
  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
"@
  "frontend/src/components/StatCard.jsx" = @"
const StatCard = ({ title, value, hint }) => (
  <div className="card">
    <p className="text-sm text-slate-500">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
    {hint ? <p className="text-xs text-slate-400 mt-1">{hint}</p> : null}
  </div>
);
export default StatCard;
"@
  "frontend/src/components/ProtectedRoute.jsx" = @"
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
};
export default ProtectedRoute;
"@
  "frontend/src/components/Navbar.jsx" = @"
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
const Navbar = ({ links }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="card flex items-center justify-between">
      <h1 className="font-bold text-indigo-600">HomeTutor</h1>
      <div className="flex gap-3 text-sm">
        {links.map((l) => <Link key={l.to} to={l.to} className="hover:text-indigo-600">{l.label}</Link>)}
      </div>
      <button className="text-sm text-rose-600" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
    </div>
  );
};
export default Navbar;
"@
  "frontend/src/layouts/StudentLayout.jsx" = @"
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
const links = [{ to: "/student", label: "Home" }, { to: "/student/find-tutors", label: "Find Tutors" }, { to: "/student/bookings", label: "Bookings" }, { to: "/student/messages", label: "Messages" }];
const StudentLayout = () => <div className="p-4 md:p-8 space-y-4"><Navbar links={links} /><Outlet /></div>;
export default StudentLayout;
"@
  "frontend/src/layouts/TutorLayout.jsx" = @"
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
const links = [{ to: "/tutor", label: "Dashboard" }, { to: "/tutor/schedule", label: "Schedule" }, { to: "/tutor/requests", label: "Booking Requests" }, { to: "/tutor/earnings", label: "Earnings" }, { to: "/tutor/history", label: "History" }, { to: "/tutor/messages", label: "Messages" }];
const TutorLayout = () => <div className="p-4 md:p-8 space-y-4"><Navbar links={links} /><Outlet /></div>;
export default TutorLayout;
"@
  "frontend/src/layouts/AdminLayout.jsx" = @"
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
const links = [{ to: "/admin", label: "Dashboard" }, { to: "/admin/tutors", label: "Tutors" }, { to: "/admin/students", label: "Students" }, { to: "/admin/approvals", label: "Tutor Approvals" }, { to: "/admin/sessions", label: "All Sessions" }, { to: "/admin/bookings", label: "Bookings" }];
const AdminLayout = () => <div className="p-4 md:p-8 space-y-4"><Navbar links={links} /><Outlet /></div>;
export default AdminLayout;
"@
  "frontend/src/pages/auth/LoginPage.jsx" = @"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";
const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const { login } = useAuth(); const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email: form.email, password: form.password }, form.role === "admin");
      navigate(`/${user.role}`);
    } catch (e) { toast.error(e.response?.data?.message || "Login failed"); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-3">
        <h2 className="text-xl font-bold">HomeTutor Login</h2>
        <select className="w-full border p-2 rounded" value={form.role} onChange={(e)=>setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option><option value="tutor">Tutor</option><option value="admin">Admin</option>
        </select>
        <input className="w-full border p-2 rounded" placeholder="Email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm({ ...form, password: e.target.value })} />
        <button className="w-full rounded bg-indigo-600 text-white py-2">Login</button>
      </form>
    </div>
  );
};
export default LoginPage;
"@
  "frontend/src/pages/auth/RegisterPage.jsx" = @"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";
const RegisterPage = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "student", subjects: "Math", experienceYears: 1, hourlyRate: 300 });
  const { register } = useAuth(); const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, subjects: form.role === "tutor" ? form.subjects.split(",").map((s)=>s.trim()) : [] };
      const user = await register(payload);
      toast.success(user.role === "tutor" ? "Registered. Await admin approval." : "Registered");
      navigate(`/${user.role}`);
    } catch (e) { toast.error(e.response?.data?.message || "Registration failed"); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-3">
        <h2 className="text-xl font-bold">Create account</h2>
        <input className="w-full border p-2 rounded" placeholder="Full name" value={form.fullName} onChange={(e)=>setForm({ ...form, fullName: e.target.value })}/>
        <input className="w-full border p-2 rounded" placeholder="Email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })}/>
        <input type="password" className="w-full border p-2 rounded" placeholder="Password" value={form.password} onChange={(e)=>setForm({ ...form, password: e.target.value })}/>
        <select className="w-full border p-2 rounded" value={form.role} onChange={(e)=>setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="tutor">Tutor</option></select>
        {form.role === "tutor" ? <><input className="w-full border p-2 rounded" placeholder="Subjects (comma separated)" value={form.subjects} onChange={(e)=>setForm({ ...form, subjects: e.target.value })}/><input type="number" className="w-full border p-2 rounded" placeholder="Experience years" value={form.experienceYears} onChange={(e)=>setForm({ ...form, experienceYears: Number(e.target.value) })}/><input type="number" className="w-full border p-2 rounded" placeholder="Hourly rate" value={form.hourlyRate} onChange={(e)=>setForm({ ...form, hourlyRate: Number(e.target.value) })}/></> : null}
        <button className="w-full rounded bg-indigo-600 text-white py-2">Register</button>
      </form>
    </div>
  );
};
export default RegisterPage;
"@
  "frontend/src/pages/student/StudentHomePage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
const StudentHomePage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r) => setBookings(r.data.bookings)).catch(() => {}); }, []);
  const today = bookings.slice(0, 3);
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Sessions" value={bookings.length} />
        <StatCard title="Spent" value={`₹${bookings.reduce((a,b)=>a+(b.totalPrice||0),0)}`} />
        <StatCard title="Hours" value={bookings.length * 1} />
      </div>
      <div className="card"><h3 className="font-semibold mb-3">Today's Sessions</h3>{today.map((b)=><div key={b._id} className="border rounded p-3 mb-2 text-sm"><div>{b.tutor?.fullName} - {b.subject}</div><div>{new Date(b.startTime).toLocaleString()} | {b.mode}</div>{b.mode==="online" && b.status==="ongoing" ? <button className="mt-2 px-3 py-1 rounded bg-indigo-600 text-white">Join Session</button> : null}</div>)}</div>
    </div>
  );
};
export default StudentHomePage;
"@
  "frontend/src/pages/student/FindTutorsPage.jsx" = @"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
const FindTutorsPage = () => {
  const [subject, setSubject] = useState(""); const [tutors, setTutors] = useState([]);
  useEffect(() => { api.get("/tutors", { params: subject ? { subject } : {} }).then((r)=>setTutors(r.data.tutors)); }, [subject]);
  return (
    <div className="space-y-4">
      <div className="card"><input className="w-full border p-2 rounded" placeholder="Filter by subject" value={subject} onChange={(e)=>setSubject(e.target.value)} /></div>
      <div className="grid md:grid-cols-2 gap-4">{tutors.map((t)=><div key={t._id} className="card"><h3 className="font-semibold">{t.fullName}</h3><p className="text-sm text-slate-500">{t.subjects.join(", ")}</p><p className="text-sm mt-1">₹{t.hourlyRate}/hr | {t.experienceYears} yrs | ⭐{t.rating}</p><Link to={`/student/tutor/${t._id}`} className="text-indigo-600 text-sm mt-2 inline-block">View Profile</Link></div>)}</div>
    </div>
  );
};
export default FindTutorsPage;
"@
  "frontend/src/pages/student/TutorProfilePage.jsx" = @"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
const TutorProfilePage = () => {
  const { id } = useParams(); const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [form, setForm] = useState({ subject: "", mode: "online", startTime: "", endTime: "" });
  useEffect(() => { api.get(`/tutors/${id}`).then((r)=>{ setTutor(r.data.tutor); setForm((f)=>({ ...f, subject: r.data.tutor.subjects[0] || "" })); }); }, [id]);
  const book = async () => { try { await api.post("/bookings", { tutorId: id, ...form }); toast.success("Booking requested"); navigate("/student/bookings"); } catch (e) { toast.error(e.response?.data?.message || "Booking failed"); } };
  if (!tutor) return <div className="card">Loading...</div>;
  return <div className="card space-y-2"><h2 className="text-xl font-bold">{tutor.fullName}</h2><p className="text-sm">{tutor.bio || "Experienced tutor"}</p><select className="w-full border p-2 rounded" value={form.subject} onChange={(e)=>setForm({ ...form, subject: e.target.value })}>{tutor.subjects.map((s)=><option key={s}>{s}</option>)}</select><select className="w-full border p-2 rounded" value={form.mode} onChange={(e)=>setForm({ ...form, mode: e.target.value })}><option value="online">Online</option><option value="offline">Offline</option></select><input type="datetime-local" className="w-full border p-2 rounded" value={form.startTime} onChange={(e)=>setForm({ ...form, startTime: e.target.value })}/><input type="datetime-local" className="w-full border p-2 rounded" value={form.endTime} onChange={(e)=>setForm({ ...form, endTime: e.target.value })}/><p className="text-sm">Rate: ₹{tutor.hourlyRate}/hr</p><button onClick={book} className="px-4 py-2 rounded bg-indigo-600 text-white">Confirm Booking</button></div>;
};
export default TutorProfilePage;
"@
  "frontend/src/pages/student/StudentBookingsPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const StudentBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings)); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">Bookings</h3>{bookings.map((b)=><div key={b._id} className="border rounded p-2 mb-2 text-sm">{b.subject} with {b.tutor?.fullName} - <span className="font-medium">{b.status}</span></div>)}</div>;
};
export default StudentBookingsPage;
"@
  "frontend/src/pages/student/StudentMessagesPage.jsx" = @"
import { useState } from "react";
import api from "../../services/api";
const StudentMessagesPage = () => {
  const [withUser, setWithUser] = useState(""); const [messages, setMessages] = useState([]); const [content, setContent] = useState("");
  const load = async () => { const { data } = await api.get("/messages", { params: { withUser } }); setMessages(data.messages); };
  const send = async () => { await api.post("/messages", { to: withUser, content }); setContent(""); load(); };
  return <div className="card space-y-2"><input className="w-full border p-2 rounded" placeholder="Tutor/Student user id" value={withUser} onChange={(e)=>setWithUser(e.target.value)} /><button className="px-3 py-1 rounded bg-slate-200" onClick={load}>Load Chat</button><div className="h-64 overflow-auto border rounded p-2 bg-slate-50">{messages.map((m)=><div key={m._id} className="text-sm mb-1">{m.from?.fullName}: {m.content}</div>)}</div><div className="flex gap-2"><input className="flex-1 border p-2 rounded" value={content} onChange={(e)=>setContent(e.target.value)} /><button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={send}>Send</button></div></div>;
};
export default StudentMessagesPage;
"@
  "frontend/src/pages/tutor/TutorDashboardPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
const TutorDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings)); }, []);
  const ongoing = bookings.filter((b)=>b.status==="ongoing");
  return <div className="space-y-4"><div className="grid md:grid-cols-3 gap-4"><StatCard title="Requests" value={bookings.filter((b)=>b.status==="pending").length} /><StatCard title="Today Sessions" value={bookings.length} /><StatCard title="Earnings" value={`₹${bookings.reduce((a,b)=>a+(b.totalPrice||0),0)}`} /></div><div className="card"><h3 className="font-semibold mb-2">Today's Sessions</h3>{bookings.map((b)=><div key={b._id} className="border rounded p-2 mb-2 text-sm">{b.subject} - {b.mode} - {b.status} {b.mode==="online" && b.status==="ongoing" ? <button className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded">JOIN</button> : null}</div>)}{ongoing.length ? <p className="text-xs text-slate-500">OTP is generated when session set to ongoing.</p> : null}</div></div>;
};
export default TutorDashboardPage;
"@
  "frontend/src/pages/tutor/TutorSchedulePage.jsx" = @"
const TutorSchedulePage = () => <div className='card'><h3 className='font-semibold mb-2'>Weekly Schedule</h3><div className='grid grid-cols-7 gap-2 text-xs'>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div key={d} className='border rounded p-4 text-center bg-slate-50'>{d}</div>)}</div></div>;
export default TutorSchedulePage;
"@
  "frontend/src/pages/tutor/TutorRequestsPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const TutorRequestsPage = () => {
  const [bookings, setBookings] = useState([]);
  const load = () => api.get("/bookings").then((r)=>setBookings(r.data.bookings.filter((b)=>b.status==="pending")));
  useEffect(load, []);
  const action = async (id, status) => { await api.patch(`/bookings/${id}/status`, { status }); load(); };
  return <div className="card"><h3 className="font-semibold mb-2">Booking Requests</h3>{bookings.map((b)=><div key={b._id} className="border rounded p-2 mb-2 text-sm">{b.student?.fullName} - {b.subject}<button className="ml-2 px-2 py-1 rounded bg-emerald-600 text-white" onClick={()=>action(b._id,"confirmed")}>Accept</button><button className="ml-2 px-2 py-1 rounded bg-rose-600 text-white" onClick={()=>action(b._id,"rejected")}>Reject</button></div>)}</div>;
};
export default TutorRequestsPage;
"@
  "frontend/src/pages/tutor/TutorEarningsPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const TutorEarningsPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings)); }, []);
  const total = bookings.filter((b)=>b.status==="completed").reduce((a,b)=>a+(b.totalPrice||0),0);
  return <div className="card"><h3 className="font-semibold mb-2">Earnings</h3><p className="text-2xl font-bold">₹{total}</p><div className="mt-3 space-y-2">{bookings.map((b)=><div key={b._id} className="text-sm border rounded p-2">{b.subject} - ₹{b.totalPrice} - {b.status}</div>)}</div></div>;
};
export default TutorEarningsPage;
"@
  "frontend/src/pages/tutor/TutorHistoryPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const TutorHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings.filter((b)=>["completed","cancelled","rejected"].includes(b.status)))); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">Session History</h3>{bookings.map((b)=><div key={b._id} className="border rounded p-2 mb-2 text-sm">{b.subject} - {b.status}</div>)}</div>;
};
export default TutorHistoryPage;
"@
  "frontend/src/pages/tutor/TutorMessagesPage.jsx" = @"
import StudentMessagesPage from "../student/StudentMessagesPage";
export default StudentMessagesPage;
"@
  "frontend/src/pages/admin/AdminDashboardPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
const AdminDashboardPage = () => {
  const [data, setData] = useState({ stats: {}, recentSessions: [] });
  useEffect(() => { api.get("/admin/dashboard").then((r)=>setData(r.data)); }, []);
  const s = data.stats || {};
  return <div className="space-y-4"><div className="grid md:grid-cols-4 gap-4"><StatCard title="Total Tutors" value={s.totalTutors || 0}/><StatCard title="Total Students" value={s.totalStudents || 0}/><StatCard title="Sessions Today" value={s.sessionsToday || 0}/><StatCard title="Pending Approvals" value={s.pendingApprovals || 0}/></div><div className="card"><h3 className="font-semibold mb-2">Live & Recent Sessions</h3>{(data.recentSessions||[]).map((x)=><div key={x._id} className="text-sm border rounded p-2 mb-2">{x.subject} | {x.student?.fullName} with {x.tutor?.fullName}</div>)}</div></div>;
};
export default AdminDashboardPage;
"@
  "frontend/src/pages/admin/AdminTutorsPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminTutorsPage = () => {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/admin/tutors").then((r)=>setList(r.data.tutors)); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">Tutors</h3>{list.map((t)=><div key={t._id} className="text-sm border rounded p-2 mb-2">{t.fullName} | {t.subjects?.join(", ")} | {t.isApproved ? "approved" : "pending"}</div>)}</div>;
};
export default AdminTutorsPage;
"@
  "frontend/src/pages/admin/AdminStudentsPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminStudentsPage = () => {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/admin/students").then((r)=>setList(r.data.students)); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">Students</h3>{list.map((s)=><div key={s._id} className="text-sm border rounded p-2 mb-2">{s.fullName} | {s.email}</div>)}</div>;
};
export default AdminStudentsPage;
"@
  "frontend/src/pages/admin/AdminApprovalsPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminApprovalsPage = () => {
  const [list, setList] = useState([]);
  const load = () => api.get("/admin/tutors").then((r)=>setList(r.data.tutors.filter((t)=>!t.isApproved)));
  useEffect(load, []);
  const action = async (id, approved) => { await api.patch(`/tutors/${id}/approve`, { approved }); load(); };
  return <div className="card"><h3 className="font-semibold mb-2">Tutor Approvals</h3>{list.map((t)=><div key={t._id} className="text-sm border rounded p-2 mb-2">{t.fullName}<button className="ml-2 px-2 py-1 rounded bg-emerald-600 text-white" onClick={()=>action(t._id,true)}>Accept</button><button className="ml-2 px-2 py-1 rounded bg-rose-600 text-white" onClick={()=>action(t._id,false)}>Reject</button></div>)}</div>;
};
export default AdminApprovalsPage;
"@
  "frontend/src/pages/admin/AdminSessionsPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminSessionsPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings)); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">All Sessions</h3>{bookings.map((b)=><div key={b._id} className="text-sm border rounded p-2 mb-2">{b.subject} - {b.mode} - {b.status}</div>)}</div>;
};
export default AdminSessionsPage;
"@
  "frontend/src/pages/admin/AdminBookingsPage.jsx" = @"
import AdminSessionsPage from "./AdminSessionsPage";
export default AdminSessionsPage;
"@
  "frontend/src/pages/common/NotificationsPage.jsx" = @"
import { useEffect, useState } from "react";
import api from "../../services/api";
const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const load = () => api.get("/notifications").then((r)=>setItems(r.data.notifications));
  useEffect(load, []);
  const read = async (id) => { await api.patch(`/notifications/${id}/read`); load(); };
  const del = async (id) => { await api.delete(`/notifications/${id}`); load(); };
  return <div className="card"><h3 className="font-semibold mb-2">Notifications</h3>{items.map((n)=><div key={n._id} className="text-sm border rounded p-2 mb-2"><div>{n.title}</div><div className="text-slate-500">{n.message}</div><div className="mt-1"><button className="text-xs text-indigo-600 mr-3" onClick={()=>read(n._id)}>Mark read</button><button className="text-xs text-rose-600" onClick={()=>del(n._id)}>Delete</button></div></div>)}</div>;
};
export default NotificationsPage;
"@
  "frontend/src/routes/AppRoutes.jsx" = @"
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import StudentLayout from "../layouts/StudentLayout";
import TutorLayout from "../layouts/TutorLayout";
import AdminLayout from "../layouts/AdminLayout";
import StudentHomePage from "../pages/student/StudentHomePage";
import FindTutorsPage from "../pages/student/FindTutorsPage";
import TutorProfilePage from "../pages/student/TutorProfilePage";
import StudentBookingsPage from "../pages/student/StudentBookingsPage";
import StudentMessagesPage from "../pages/student/StudentMessagesPage";
import TutorDashboardPage from "../pages/tutor/TutorDashboardPage";
import TutorSchedulePage from "../pages/tutor/TutorSchedulePage";
import TutorRequestsPage from "../pages/tutor/TutorRequestsPage";
import TutorEarningsPage from "../pages/tutor/TutorEarningsPage";
import TutorHistoryPage from "../pages/tutor/TutorHistoryPage";
import TutorMessagesPage from "../pages/tutor/TutorMessagesPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminTutorsPage from "../pages/admin/AdminTutorsPage";
import AdminStudentsPage from "../pages/admin/AdminStudentsPage";
import AdminApprovalsPage from "../pages/admin/AdminApprovalsPage";
import AdminSessionsPage from "../pages/admin/AdminSessionsPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import NotificationsPage from "../pages/common/NotificationsPage";
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
      <Route index element={<StudentHomePage />} />
      <Route path="find-tutors" element={<FindTutorsPage />} />
      <Route path="tutor/:id" element={<TutorProfilePage />} />
      <Route path="bookings" element={<StudentBookingsPage />} />
      <Route path="messages" element={<StudentMessagesPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>
    <Route path="/tutor" element={<ProtectedRoute role="tutor"><TutorLayout /></ProtectedRoute>}>
      <Route index element={<TutorDashboardPage />} />
      <Route path="schedule" element={<TutorSchedulePage />} />
      <Route path="requests" element={<TutorRequestsPage />} />
      <Route path="earnings" element={<TutorEarningsPage />} />
      <Route path="history" element={<TutorHistoryPage />} />
      <Route path="messages" element={<TutorMessagesPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>
    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="tutors" element={<AdminTutorsPage />} />
      <Route path="students" element={<AdminStudentsPage />} />
      <Route path="approvals" element={<AdminApprovalsPage />} />
      <Route path="sessions" element={<AdminSessionsPage />} />
      <Route path="bookings" element={<AdminBookingsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>
  </Routes>
);
export default AppRoutes;
"@
  "frontend/src/App.jsx" = @"
import AppRoutes from "./routes/AppRoutes";
const App = () => <AppRoutes />;
export default App;
"@
  "README.md" = @"
# HomeTutor

Production-style full-stack tutoring marketplace:

- `backend`: Express + MongoDB + JWT auth + RBAC + booking/message/notification/admin APIs
- `frontend`: React + Vite + Tailwind + role-based SaaS dashboards

## Quick Start

### Backend
1. `cd backend`
2. `npm install`
3. copy `.env.example` to `.env` and update values
4. `npm run seed`
5. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. create `.env` with `VITE_API_URL=http://localhost:5000/api`
4. `npm run dev`

## Test Accounts
- Student: `student@hometutor.com` / `Student@123`
- Tutor: `tutor@hometutor.com` / `Tutor@123`
- Admin: from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
"@
}

foreach ($entry in $files.GetEnumerator()) {
  $path = Join-Path $PSScriptRoot $entry.Key
  $dir = Split-Path -Parent $path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($path, ($entry.Value.TrimStart("`r", "`n") + "`n"))
}

Write-Output "Generated $($files.Count) files."

import mongoose from "mongoose";
import { BOOKING_STATUS } from "../utils/constants.js";
const bookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: String,
  mode: { type: String, enum: ["online", "offline"] },
  startTime: Date,
  endTime: Date,
  date: String,
  sessionTime: { type: String, default: "10:00" },
  duration: { type: Number, default: 1 },
  hourlyRate: Number,
  totalPrice: Number,
  status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
  otp: { type: String, default: "" },
  sessionCode: { type: String, default: "" }
}, { timestamps: true });
export const Booking = mongoose.model("Booking", bookingSchema);

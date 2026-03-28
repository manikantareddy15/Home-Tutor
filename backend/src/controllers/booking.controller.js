import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { BOOKING_STATUS, ROLES } from "../utils/constants.js";
const notify = (user,title,message,type="booking") => Notification.create({ user,title,message,type });
export const createBooking = async (req,res) => {
  try {
    const { tutorId,subject,mode,startTime,endTime } = req.body;
    const tutor = await User.findOne({ _id: tutorId, role: ROLES.TUTOR, isApproved: true });
    if(!tutor) return res.status(404).json({ message: "Tutor unavailable" });
    if(!tutor.subjects.includes(subject)) return res.status(400).json({ message: "Subject not offered by tutor" });
    const start = new Date(startTime), end = new Date(endTime), hours = Math.max(1, (end-start)/(1000*60*60));
    const booking = await Booking.create({ student: req.user._id, tutor: tutor._id, subject, mode, startTime: start, endTime: end, hourlyRate: tutor.hourlyRate, totalPrice: tutor.hourlyRate * hours });
    await notify(tutor._id, "New booking request", `Booking request for ${subject}`);
    res.status(201).json({ booking });
  } catch(err) { res.status(500).json({ message: err.message || "Booking creation failed" }); }
};
export const getBookings = async (req,res) => {
  try {
    const q = {};
    if(req.user.role===ROLES.STUDENT) q.student = req.user._id;
    if(req.user.role===ROLES.TUTOR) q.tutor = req.user._id;
    if(req.query.status) q.status = req.query.status;
    if(req.query.mode) q.mode = req.query.mode;
    const bookings = await Booking.find(q).populate("student","fullName").populate("tutor","fullName subjects hourlyRate").sort({ createdAt: -1 });
    res.json({ bookings });
  } catch(err) { res.status(500).json({ message: err.message || "Error fetching bookings" }); }
};
export const updateBookingStatus = async (req,res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if(!booking) return res.status(404).json({ message: "Booking not found" });
    if(req.user.role===ROLES.TUTOR && String(booking.tutor)!==String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
    booking.status = req.body.status;
    if(req.body.status===BOOKING_STATUS.ONGOING) booking.otp = String(Math.floor(100000 + Math.random()*900000));
    await booking.save();
    await notify(booking.student, "Booking updated", `Status -> ${booking.status}`);
    res.json({ booking });
  } catch(err) { res.status(500).json({ message: err.message || "Error updating booking" }); }
};

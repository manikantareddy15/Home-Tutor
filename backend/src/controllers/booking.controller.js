import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { BOOKING_STATUS, ROLES } from "../utils/constants.js";

const notify = async (userId, title, message, type = "booking") => {
  try {
    await Notification.create({ user: userId, title, message, type });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

export const createBooking = async (req, res) => {
  try {
    const { tutorId, subject, mode, startTime, endTime } = req.body;

    // Validation
    if (!tutorId || !subject || !mode || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["online", "offline"].includes(mode)) {
      return res.status(400).json({ message: "Invalid mode. Must be 'online' or 'offline'" });
    }

    const tutor = await User.findOne({ 
      _id: tutorId, 
      role: ROLES.TUTOR, 
      isApproved: true 
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor unavailable or not approved" });
    }

    if (!tutor.subjects.includes(subject)) {
      return res.status(400).json({ message: "Subject not offered by tutor" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    const hours = Math.max(1, (end - start) / (1000 * 60 * 60));

    const booking = await Booking.create({
      student: req.user._id,
      tutor: tutor._id,
      subject,
      mode,
      startTime: start,
      endTime: end,
      hourlyRate: tutor.hourlyRate,
      totalPrice: tutor.hourlyRate * hours,
      status: BOOKING_STATUS.PENDING
    });

    await notify(tutor._id, "New booking request", `${req.user.fullName} requested a booking for ${subject}`);

    const populatedBooking = await booking.populate("student", "fullName email").populate("tutor", "fullName subjects hourlyRate");
    res.status(201).json({ booking: populatedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message || "Booking creation failed" });
  }
};

export const getBookings = async (req, res) => {
  try {
    // Prevent caching for bookings data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const q = {};

    // Filter by role
    if (req.user.role === ROLES.STUDENT) {
      q.student = req.user._id;
    } else if (req.user.role === ROLES.TUTOR) {
      q.tutor = req.user._id;
    }
    // Admins see all bookings

    // Additional filters
    if (req.query.status) {
      if (!Object.values(BOOKING_STATUS).includes(req.query.status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      q.status = req.query.status;
    }

    if (req.query.mode) {
      if (!["online", "offline"].includes(req.query.mode)) {
        return res.status(400).json({ message: "Invalid mode filter" });
      }
      q.mode = req.query.mode;
    }

    const bookings = await Booking.find(q)
      .populate("student", "fullName email class")
      .populate("tutor", "fullName subjects hourlyRate rating")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching bookings" });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!Object.values(BOOKING_STATUS).includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Permission check: Tutors can only update their own bookings, Admins can update any
    if (req.user.role === ROLES.TUTOR && String(booking.tutor) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update your own bookings" });
    }

    booking.status = status;

    // Generate OTP when booking is marked as ongoing
    if (status === BOOKING_STATUS.ONGOING) {
      booking.otp = String(Math.floor(100000 + Math.random() * 900000));
    }

    await booking.save();

    const student = await User.findById(booking.student);
    await notify(
      booking.student,
      "Booking status updated",
      `Your booking status has been updated to: ${status}`
    );

    const updatedBooking = await booking.populate("student", "fullName email").populate("tutor", "fullName subjects hourlyRate");
    res.json({ booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating booking" });
  }
};

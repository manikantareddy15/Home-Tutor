import { Booking } from "../models/Booking.js";
import { Review } from "../models/Review.js";
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
    const { tutorId, subject, mode, date, sessionTime, duration, totalPrice, startTime, endTime } = req.body;

    // Validation - accept both old and new formats
    if (!tutorId || !subject || !mode) {
      return res.status(400).json({ message: "tutorId, subject, and mode are required" });
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

    // Support both old (startTime/endTime) and new (date/duration) formats
    let bookingData = {
      student: req.user._id,
      tutor: tutor._id,
      subject,
      mode,
      hourlyRate: tutor.hourlyRate,
      status: BOOKING_STATUS.PENDING,
      sessionCode: String(Math.floor(1000 + Math.random() * 9000))
    };

    // New format with date and duration (sessionTime is optional)
    if (date && duration) {
      bookingData.date = date;
      bookingData.sessionTime = sessionTime || "10:00";
      bookingData.duration = duration;
      bookingData.totalPrice = totalPrice || tutor.hourlyRate * duration;
    }
    // Old format with startTime and endTime
    else if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return res.status(400).json({ message: "Start time must be before end time" });
      }

      const hours = Math.max(1, (end - start) / (1000 * 60 * 60));

      bookingData.startTime = start;
      bookingData.endTime = end;
      bookingData.duration = hours;
      bookingData.totalPrice = tutor.hourlyRate * hours;
    }
    else {
      return res.status(400).json({ message: "Either (date, duration) or (startTime, endTime) must be provided" });
    }

    const booking = await Booking.create(bookingData);

    await notify(tutor._id, "New booking request", `${req.user.fullName} requested a booking for ${subject}`);

    const populatedBooking = await Booking.findById(booking._id)
      .populate("student", "fullName email class")
      .populate("tutor", "fullName subjects hourlyRate");
    res.status(201).json({ booking: populatedBooking });
  } catch (err) {
    console.error("Booking creation error:", err);
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

    // Ensure all bookings have sessionTime set (for backwards compatibility with old bookings)
    const bookingsWithDefaults = bookings.map(booking => {
      if (!booking.sessionTime || booking.sessionTime.trim() === "") {
        booking.sessionTime = "10:00";
      }
      return booking;
    });

    res.status(200).json({ bookings: bookingsWithDefaults });
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
    const tutor = await User.findById(booking.tutor);

    if (status === BOOKING_STATUS.CONFIRMED) {
      await notify(
        booking.student,
        "Booking Accepted! 🎉",
        `${tutor?.fullName || "Your tutor"} has accepted your booking for ${booking.subject}. Get ready for your session!`
      );
    } else if (status === BOOKING_STATUS.REJECTED) {
      await notify(
        booking.student,
        "Booking Rejected",
        `${tutor?.fullName || "Your tutor"} has rejected your booking for ${booking.subject}.`
      );
    } else if (status === BOOKING_STATUS.ONGOING) {
      await notify(
        booking.student,
        "Session Started",
        `Your session for ${booking.subject} with ${tutor?.fullName || "your tutor"} has started.`
      );
    } else {
      await notify(
        booking.student,
        "Booking status updated",
        `Your booking for ${booking.subject} has been updated to: ${status}`
      );
    }

    const updatedBooking = await Booking.findById(req.params.id)
      .populate("student", "fullName email")
      .populate("tutor", "fullName subjects hourlyRate");
    res.json({ booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating booking" });
  }
};

export const verifySessionCode = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { code } = req.body;

    if (!bookingId || !code) {
      return res.status(400).json({ message: "Booking ID and code are required" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Permission check: Only tutors can verify session codes for their own bookings
    if (req.user.role !== ROLES.TUTOR || String(booking.tutor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the tutor can verify the session code" });
    }

    // If booking doesn't have a sessionCode, generate one now
    if (!booking.sessionCode || booking.sessionCode === "") {
      booking.sessionCode = String(Math.floor(1000 + Math.random() * 9000));
      await booking.save();
      console.log(`Generated new sessionCode for booking ${bookingId}: ${booking.sessionCode}`);
    }

    // Verify the code - trim and compare as strings
    const trimmedCode = String(code).trim();
    const storedCode = String(booking.sessionCode).trim();

    console.log(`Verifying code: input="${trimmedCode}" (length=${trimmedCode.length}) vs stored="${storedCode}" (length=${storedCode.length})`);

    if (trimmedCode !== storedCode) {
      return res.status(400).json({
        message: "Invalid session code",
        debug: process.env.NODE_ENV === "development" ? { input: trimmedCode, stored: storedCode } : undefined
      });
    }

    // Mark session as completed
    booking.status = BOOKING_STATUS.COMPLETED;
    await booking.save();

    // Notify student
    await notify(
      booking.student,
      "Session Completed",
      "Your session has been marked as completed"
    );

    const updatedBooking = await Booking.findById(bookingId).populate("student", "fullName email").populate("tutor", "fullName subjects hourlyRate");
    res.json({ booking: updatedBooking, message: "Session completed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error verifying session code" });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Permission check: Only the student who booked can leave a review
    if (String(booking.student) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the student can leave a review" });
    }

    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return res.status(400).json({ message: "Can only review completed sessions" });
    }

    // Find or create review document for this tutor
    let tutorReview = await Review.findOne({ tutor: booking.tutor });

    if (!tutorReview) {
      tutorReview = new Review({ tutor: booking.tutor, reviews: [] });
    }

    // Add new review to reviews array
    tutorReview.reviews.push({
      student: req.user._id,
      rating,
      comment,
      bookingId,
      submittedAt: new Date()
    });

    await tutorReview.save();

    // Notify tutor about the review
    await notify(
      booking.tutor,
      "New Review",
      `${req.user.fullName} left a ${rating}-star review: "${comment.substring(0, 50)}..."`
    );

    const populatedReview = await Review.findOne({ tutor: booking.tutor })
      .populate("tutor", "fullName subjects hourlyRate")
      .populate("reviews.student", "fullName");

    res.json({ review: populatedReview, message: "Review submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error submitting review" });
  }
};

export const getTutorReviews = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const tutorReview = await Review.findOne({ tutor: tutorId })
      .populate("tutor", "fullName subjects hourlyRate avatar")
      .populate("reviews.student", "fullName avatar");

    if (!tutorReview) {
      return res.json({ review: null, averageRating: 0, totalReviews: 0 });
    }

    res.json({
      review: tutorReview,
      averageRating: tutorReview.averageRating,
      totalReviews: tutorReview.totalReviews
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching reviews" });
  }
};

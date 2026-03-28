import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { ROLES } from "../utils/constants.js";

export const dashboardStats = async (req, res) => {
  try {
    const [totalTutors, totalStudents, pendingApprovals, sessionsToday] =
      await Promise.all([
        User.countDocuments({ role: ROLES.TUTOR }),
        User.countDocuments({ role: ROLES.STUDENT }),
        User.countDocuments({
          role: ROLES.TUTOR,
          isApproved: false
        }),
        Booking.countDocuments({
          startTime: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        })
      ]);

    const recentSessions = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("student tutor", "fullName");

    res.json({
      stats: {
        totalTutors,
        totalStudents,
        pendingApprovals,
        sessionsToday
      },
      recentSessions
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Error fetching dashboard stats"
    });
  }
};

export const getPendingTutors = async (req, res) => {
  try {
    const pendingTutors = await User.find({
      role: ROLES.TUTOR,
      isApproved: false
    }).select("-password");

    res.json({ pendingTutors });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Error fetching pending tutors"
    });
  }
};

export const approveTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const tutor = await User.findByIdAndUpdate(
      tutorId,
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.json({
      message: "Tutor approved successfully",
      tutor
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Error approving tutor"
    });
  }
};

export const rejectTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const tutor = await User.findByIdAndDelete(tutorId);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.json({
      message: "Tutor application rejected and deleted"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Error rejecting tutor"
    });
  }
};

export const students = async (req, res) => {
  try {
    res.json({
      students: await User.find({ role: ROLES.STUDENT }).select("-password")
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching students" });
  }
};

export const tutors = async (req, res) => {
  try {
    res.json({
      tutors: await User.find({ role: ROLES.TUTOR }).select("-password")
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching tutors" });
  }
};

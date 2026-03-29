import { User } from "../models/User.js";
import { ROLES } from "../utils/constants.js";

export const getTutors = async (req, res) => {
  try {
    // Prevent caching for tutors list
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const { search, subjects, modes, minPrice, maxPrice, minExp, maxExp } = req.query;
    const q = { role: ROLES.TUTOR, isApproved: true, isActive: true };

    // Search by name or email
    if (search) {
      q.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by subjects (multiple)
    if (subjects) {
      const subjectArray = Array.isArray(subjects) ? subjects : [subjects];
      q.subjects = { $in: subjectArray };
    }

    // Filter by teaching modes
    if (modes) {
      const modesArray = Array.isArray(modes) ? modes : [modes];
      q.teachingModes = { $in: modesArray };
    }

    // Filter by experience range
    if (minExp || maxExp) {
      q.experienceYears = {};
      if (minExp) q.experienceYears.$gte = Number(minExp);
      if (maxExp) q.experienceYears.$lte = Number(maxExp);
    }

    // Filter by hourly rate range
    if (minPrice || maxPrice) {
      q.hourlyRate = {};
      if (minPrice) q.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) q.hourlyRate.$lte = Number(maxPrice);
    }

    const tutors = await User.find(q).select("-password -cert11th -cert12th -certGraduation").sort({ rating: -1 });
    res.status(200).json({ tutors });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching tutors" });
  }
};

export const getTutorById = async (req, res) => {
  try {
    const tutor = await User.findOne({ _id: req.params.id, role: ROLES.TUTOR }).select("-password");

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.json({ tutor });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching tutor" });
  }
};

export const updateTutorProfile = async (req, res) => {
  try {
    if (req.user.role !== ROLES.TUTOR) {
      return res.status(403).json({ message: "Only tutors can update their profile" });
    }

    const { fullName, email, password, aboutMe, subjects } = req.body;
    const tutor = await User.findById(req.user._id);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Update profile fields
    if (fullName) tutor.fullName = fullName;
    if (email) tutor.email = email;
    if (password) tutor.password = password; // Password will be hashed by pre-save hook
    if (aboutMe !== undefined) tutor.aboutMe = aboutMe;
    if (subjects) tutor.subjects = subjects;

    await tutor.save();
    res.json({ tutor, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating profile" });
  }
};

export const approveTutor = async (req, res) => {
  try {
    const { approved } = req.body;

    if (typeof approved !== "boolean") {
      return res.status(400).json({ message: "Approved field must be a boolean" });
    }

    const tutor = await User.findOne({ _id: req.params.id, role: ROLES.TUTOR });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    tutor.isApproved = approved;
    await tutor.save();

    res.json({ tutor, message: `Tutor ${approved ? "approved" : "rejected"} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error approving tutor" });
  }
};

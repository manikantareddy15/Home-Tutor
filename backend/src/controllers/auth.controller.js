import { User } from "../models/User.js";
import { ROLES } from "../utils/constants.js";
import { generateToken } from "../utils/jwt.js";
import fs from "fs";
import path from "path";


const sanitize = (u) => ({
  id: u._id,
  fullName: u.fullName,
  email: u.email,
  profilePicture: u.profilePicture,
  role: u.role,
  class: u.class,
  subjects: u.subjects,
  experienceYears: u.experienceYears,
  hourlyRate: u.hourlyRate,
  teachingModes: u.teachingModes,
  rating: u.rating,
  isApproved: u.isApproved,
  bio: u.bio,
  aboutMe: u.aboutMe,
  cert11th: u.cert11th,
  cert12th: u.cert12th,
  certGraduation: u.certGraduation
});

export const register = async (req, res) => {
  try {
    const { fullName, email, password, role, class: studentClass, subjects, experienceYears, hourlyRate, teachingModes } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields (fullName, email, password)" });
    }

    if (![ROLES.STUDENT, ROLES.TUTOR].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const userData = {
      fullName,
      email,
      password,
      role,
      isApproved: role === ROLES.STUDENT
    };

    if (role === ROLES.STUDENT) {
      userData.class = studentClass || "";
    } else if (role === ROLES.TUTOR) {
      // Handle tutor profile fields
      if (subjects) {
        userData.subjects = Array.isArray(subjects) ? subjects : JSON.parse(subjects || "[]");
      }
      if (experienceYears) {
        userData.experienceYears = parseInt(experienceYears);
      }
      if (hourlyRate) {
        userData.hourlyRate = parseInt(hourlyRate);
      }
      if (teachingModes) {
        userData.teachingModes = Array.isArray(teachingModes) ? teachingModes : JSON.parse(teachingModes || "[]");
      }
      
      // Handle tutor certificate uploads
      if (req.files?.cert11th) {
        userData.cert11th = req.files.cert11th[0].path;
      }
      if (req.files?.cert12th) {
        userData.cert12th = req.files.cert12th[0].path;
      }
      if (req.files?.certGraduation) {
        userData.certGraduation = req.files.certGraduation[0].path;
      }
    }

    const user = await User.create(userData);

    res.status(201).json({
      token: generateToken({ id: user._id, role: user.role }),
      user: sanitize(user),
      message: role === ROLES.TUTOR ? "Tutor registered successfully. Your documents are pending admin approval." : "Student registered successfully."
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      message: err.message || "Registration failed",
      error: process.env.NODE_ENV === "development" ? err.toString() : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role === ROLES.TUTOR && !user.isApproved) {
      return res.status(403).json({ message: "Tutor pending approval" });
    }

    res.json({
      token: generateToken({ id: user._id, role: user.role }),
      user: sanitize(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Login failed" });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    let admin = await User.findOne({ email, role: ROLES.ADMIN });
    if (!admin) {
      admin = await User.create({
        fullName: "Platform Admin",
        email,
        password,
        role: ROLES.ADMIN,
        isApproved: true
      });
    }

    res.json({
      token: generateToken({ id: admin._id, role: admin.role }),
      user: sanitize(admin)
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Admin login failed" });
  }
};

export const me = async (req, res) => {
  try {
    res.json({ user: sanitize(req.user) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching user" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, password, aboutMe, subjects } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) user.password = password; // Password will be hashed by pre-save hook
    if (aboutMe !== undefined) user.aboutMe = aboutMe;
    if (subjects) {
      // Accept both array and JSON string
      if (typeof subjects === "string") {
        try {
          user.subjects = JSON.parse(subjects);
        } catch {
          user.subjects = [];
        }
      } else {
        user.subjects = subjects;
      }
    }

    // Handle profile picture removal
    if (req.body.removeProfilePicture === "true" || req.body.removeProfilePicture === true) {
      // If we want to physically delete the file
      if (user.profilePicture) {
        try {
          const filePath = path.join(process.cwd(), user.profilePicture);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error("Error deleting old profile picture file:", err);
        }
      }
      user.profilePicture = "";
    }

    // Handle profile picture upload
    if (req.files?.profilePicture) {
      // Delete old file if it exists before saving new one
      if (user.profilePicture && !req.body.removeProfilePicture) {
        try {
          const oldPath = path.join(process.cwd(), user.profilePicture);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (err) {}
      }
      user.profilePicture = req.files.profilePicture[0].path;
    }

    await user.save();
    console.log("User updated in DB, profilePicture:", user.profilePicture);
    res.json({ user: sanitize(user), message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating profile" });
  }
};

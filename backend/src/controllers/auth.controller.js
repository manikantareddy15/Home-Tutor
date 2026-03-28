import { User } from "../models/User.js";
import { ROLES } from "../utils/constants.js";
import { generateToken } from "../utils/jwt.js";

const sanitize = (u) => ({
  id: u._id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  class: u.class,
  subjects: u.subjects,
  experienceYears: u.experienceYears,
  hourlyRate: u.hourlyRate,
  rating: u.rating,
  isApproved: u.isApproved,
  bio: u.bio,
  cert11th: u.cert11th,
  cert12th: u.cert12th,
  certGraduation: u.certGraduation
});

export const register = async (req, res) => {
  try {
    console.log("Register endpoint hit with body:", req.body);
    console.log("Files received:", req.files);
    
    const { fullName, email, password, role, class: studentClass } = req.body;
    
    if (!fullName || !email || !password) {
      console.log("Missing fields:", { fullName, email, password });
      return res.status(400).json({ message: "Missing required fields (fullName, email, password)" });
    }

    if (![ROLES.STUDENT, ROLES.TUTOR].includes(role)) {
      console.log("Invalid role:", role);
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already exists:", email);
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

    console.log("Creating user with:", userData);
    const user = await User.create(userData);
    console.log("User created:", user._id);

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

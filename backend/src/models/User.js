import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../utils/constants.js";
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT },
  class: { type: String, default: "" },
  subjects: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  teachingModes: [{ type: String, enum: ["Online", "Offline"] }],
  rating: { type: Number, default: 4.5 },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  bio: { type: String, default: "" },
  aboutMe: { type: String, default: "" },
  cert11th: { type: String, default: "" },
  cert12th: { type: String, default: "" },
  certGraduation: { type: String, default: "" }
}, { timestamps: true });
userSchema.pre("save", async function(next){ if(!this.isModified("password")) return next(); this.password = await bcrypt.hash(this.password, 10); next(); });
userSchema.methods.matchPassword = function(candidate){ return bcrypt.compare(candidate, this.password); };
export const User = mongoose.model("User", userSchema);

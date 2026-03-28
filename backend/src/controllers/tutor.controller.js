import { User } from "../models/User.js";
import { ROLES } from "../utils/constants.js";
export const getTutors = async (req,res) => {
  try {
    const { subject,minPrice,maxPrice,minExperience } = req.query;
    const q = { role: ROLES.TUTOR, isApproved: true, isActive: true };
    if(subject) q.subjects = subject;
    if(minExperience) q.experienceYears = { $gte: Number(minExperience) };
    if(minPrice || maxPrice){ q.hourlyRate = {}; if(minPrice) q.hourlyRate.$gte = Number(minPrice); if(maxPrice) q.hourlyRate.$lte = Number(maxPrice); }
    const tutors = await User.find(q).select("-password");
    res.json({ tutors });
  } catch(err) { res.status(500).json({ message: err.message || "Error fetching tutors" }); }
};
export const getTutorById = async (req,res) => {
  try {
    const tutor = await User.findOne({ _id: req.params.id, role: ROLES.TUTOR }).select("-password");
    if(!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.json({ tutor });
  } catch(err) { res.status(500).json({ message: err.message || "Error fetching tutor" }); }
};
export const approveTutor = async (req,res) => {
  try {
    const tutor = await User.findOne({ _id: req.params.id, role: ROLES.TUTOR });
    if(!tutor) return res.status(404).json({ message: "Tutor not found" });
    tutor.isApproved = req.body.approved !== false;
    await tutor.save();
    res.json({ tutor });
  } catch(err) { res.status(500).json({ message: err.message || "Error approving tutor" }); }
};

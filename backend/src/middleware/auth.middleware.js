import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
export const protect = async (req,res,next) => {
  const auth = req.headers.authorization;
  if(!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  try{
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select("-password");
    if(!req.user) return res.status(401).json({ message: "Unauthorized" });
    next();
  }catch{ res.status(401).json({ message: "Invalid token" }); }
};
export const authorize = (...roles) => (req,res,next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ message: "Forbidden" });

import { Notification } from "../models/Notification.js";
export const getNotifications = async (req,res) => {
  try {
    res.json({ notifications: await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }) });
  } catch(err) { res.status(500).json({ message: err.message || "Error fetching notifications" }); }
};
export const markRead = async (req,res) => {
  try {
    res.json({ notification: await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true }) });
  } catch(err) { res.status(500).json({ message: err.message || "Error marking notification" }); }
};
export const deleteNotification = async (req,res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Deleted" });
  } catch(err) { res.status(500).json({ message: err.message || "Error deleting notification" }); }
};

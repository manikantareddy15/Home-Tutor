import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
export const sendMessage = async (req,res) => {
  try {
    const msg = await Message.create({ from: req.user._id, to: req.body.to, content: req.body.content });
    await Notification.create({
      user: req.body.to,
      title: "New message",
      message: `Message from ${req.user.fullName}`,
      type: "message"
    });
    res.status(201).json({ message: msg });
  } catch(err) { res.status(500).json({ message: err.message || "Error sending message" }); }
};
export const getConversations = async (req,res) => {
  try {
    const withUser = req.query.withUser;
    const messages = await Message.find({ $or: [{ from: req.user._id, to: withUser }, { from: withUser, to: req.user._id }] }).populate("from","fullName").sort({ createdAt: 1 });
    res.json({ messages });
  } catch(err) { res.status(500).json({ message: err.message || "Error fetching conversations" }); }
};

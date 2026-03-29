import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

export const sendMessage = async (req, res) => {
  try {
    const { to, content } = req.body;

    if (!to || !content) {
      return res.status(400).json({ message: "Recipient and message content are required" });
    }

    // Validate recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (String(req.user._id) === String(to)) {
      return res.status(400).json({ message: "Cannot send message to yourself" });
    }

    const message = await Message.create({
      from: req.user._id,
      to,
      content
    });

    // Create notification
    await Notification.create({
      user: to,
      title: "New message",
      message: `Message from ${req.user.fullName}`,
      type: "message"
    });

    const populatedMessage = await message.populate("from", "fullName email");
    res.status(201).json({ message: populatedMessage });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error sending message" });
  }
};

export const getConversations = async (req, res) => {
  try {
    // Prevent caching for messages
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const { withUser } = req.query;

    if (!withUser) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }

    // Validate recipient exists
    const recipient = await User.findById(withUser);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { from: req.user._id, to: withUser },
        { from: withUser, to: req.user._id }
      ]
    })
      .populate("from", "fullName email")
      .populate("to", "fullName email")
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching conversations" });
  }
};

export const getConversationsList = async (req, res) => {
  try {
    // Prevent caching for conversations list
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // Get unique conversations (last message from each user)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: req.user._id },
            { to: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", req.user._id] },
              "$to",
              "$from"
            ]
          },
          lastMessage: { $last: "$$ROOT" },
          createdAt: { $last: "$createdAt" }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "otherUser"
        }
      },
      {
        $unwind: "$otherUser"
      },
      {
        $project: {
          _id: 1,
          otherUser: {
            _id: "$otherUser._id",
            fullName: "$otherUser.fullName",
            email: "$otherUser.email"
          },
          lastMessage: "$lastMessage.content",
          lastMessageTime: {
            $dateToString: {
              format: "%H:%M",
              date: "$createdAt"
            }
          },
          createdAt: 1
        }
      }
    ]);

    res.status(200).json({ conversations });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching conversations" });
  }
};

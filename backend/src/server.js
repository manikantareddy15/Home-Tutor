import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Store user socket connections
const userSockets = new Map();

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  socket.token = token;
  next();
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Extract user ID from token (you may need to decode it based on your JWT structure)
  socket.on("identify", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} identified with socket ${socket.id}`);
  });

// Handle sending messages
  socket.on("send_message", (data) => {
    const recipientSocketId = userSockets.get(data.to);
    console.log("Send message event:", {
      from: data.from,
      to: data.to,
      recipientSocketId: recipientSocketId,
      availableSockets: Array.from(userSockets.entries())
    });
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new_message", {
        _id: data._id,
        from: data.from,
        to: data.to,
        content: data.content,
        createdAt: data.createdAt
      });
      console.log("Message delivered to recipient");
    } else {
      console.log("Recipient socket not found. Available users:", Array.from(userSockets.keys()));
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove user from map
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
      }
    }
  });
});

const start = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});

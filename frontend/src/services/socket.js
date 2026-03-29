import io from "socket.io-client";

let socket = null;

export const initSocket = (token, userId) => {
  // If socket exists and user ID matches, return it
  if (socket && socket.userId === userId) {
    return socket;
  }

  // Close existing socket if switching users
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.userId = userId;

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    // Identify the user to the server
    if (userId) {
      socket.emit("identify", userId);
      console.log("User identified:", userId);
    }
  });

  socket.on("reconnect", () => {
    console.log("Socket reconnected");
    if (userId) {
      socket.emit("identify", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocket,
  getSocket,
  closeSocket
};

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";
import { initSocket, getSocket } from "../../services/socket";

const TutorMessagesPage = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const [searchParams] = useSearchParams();
  const [searchName, setSearchName] = useState("");
  const [withUser, setWithUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load available students on mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        // Fetch all bookings to get students
        const res = await api.get("/bookings");
        const bookings = res.data.bookings || [];

        // Extract unique students from bookings
        const uniqueStudents = [];
        const seenIds = new Set();

        for (const booking of bookings) {
          if (booking.student && !seenIds.has(booking.student._id)) {
            seenIds.add(booking.student._id);
            uniqueStudents.push(booking.student);
          }
        }

        setStudents(uniqueStudents);
      } catch (err) {
        console.error("Failed to load students:", err);
      }
    };
    loadStudents();
  }, []);

  // Load recent conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await api.get("/messages/conversations/list");
        if (res.data.conversations) {
          setConversations(res.data.conversations);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };
    loadConversations();

    // Refresh conversations every 30 seconds to show latest messages
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize socket
  useEffect(() => {
    const token = sessionStorage.getItem("hometutor_token");
    if (token && user?._id) {
      console.log("Initializing socket for user:", userId);
      const socket = initSocket(token, userId);

      // Listen for new messages
      const handleNewMessage = (message) => {
        console.log("New message received:", message);
        setMessages((prev) => {
          // Avoid duplicates
          const isDuplicate = prev.some(m => m._id === message._id);
          if (isDuplicate) return prev;
          return [...prev, message];
        });
      };

      socket.on("new_message", handleNewMessage);

      return () => {
        socket.off("new_message", handleNewMessage);
      };
    }
  }, [userId]);

  // Auto-populate from URL params
  useEffect(() => {
    const studentId = searchParams.get("student");

    if (studentId) {
      // Find student by ID and set search name
      const student = students.find(s => s._id === studentId);
      if (student) {
        setSearchName("");
        setWithUser(studentId);
        loadMessages(studentId);
      }
    }
  }, [searchParams, students]);

  // Filter students based on search name
  useEffect(() => {
    if (searchName.trim()) {
      const filtered = students.filter(student =>
        student.fullName.toLowerCase().includes(searchName.toLowerCase())
      );
      setFilteredStudents(filtered);
      setShowDropdown(true);
    } else {
      setFilteredStudents([]);
      setShowDropdown(false);
    }
  }, [searchName, students]);

  const handleSelectStudent = (student) => {
    setSearchName("");
    setWithUser(student._id);
    setShowDropdown(false);
    loadMessages(student._id);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (userId = withUser) => {
    if (!userId.trim()) {
      toast.error("Please select a student");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/messages", { params: { withUser: userId } });
      setMessages(data.messages || []);

      // Fetch recipient info
      try {
        // Try to get student info from message data
        const senderInfo = data.messages?.[0]?.from;
        if (senderInfo && String(senderInfo._id) !== String(userId)) {
          setRecipientInfo(senderInfo);
        } else {
          const receiverInfo = data.messages?.[0]?.to;
          if (receiverInfo && String(receiverInfo._id) !== String(userId)) {
            setRecipientInfo(receiverInfo);
          }
        }
      } catch (error) {
        console.error("Error fetching recipient info:", error);
      }
    } catch (err) {
      toast.error("Failed to load messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!content.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    if (!withUser.trim()) {
      toast.error("Please select a student first");
      return;
    }
    try {
      const response = await api.post("/messages", { to: withUser, content });

      // Add message to local state
      const newMessage = {
        ...response.data.message,
        _id: response.data.message._id || new Date().getTime(),
        from: {
          _id: userId,
          fullName: user.fullName,
          email: user.email
        }
      };
      setMessages((prev) => [...prev, newMessage]);

      // Emit message via socket to recipient
      const socket = getSocket();
      if (socket) {
        socket.emit("send_message", {
          to: withUser,
          from: {
            _id: userId,
            fullName: user.fullName,
            email: user.email
          },
          content: content,
          _id: newMessage._id,
          createdAt: newMessage.createdAt || new Date()
        });
      }

      // Refresh conversations list to show new message
      try {
        const res = await api.get("/messages/conversations/list");
        if (res.data.conversations) {
          setConversations(res.data.conversations);
        }
      } catch (err) {
        console.error("Failed to refresh conversations:", err);
      }

      setContent("");
      toast.success("Message sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Conversations List */}
      <div className="w-full sm:w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Messages</h1>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm"
            />

            {/* Dropdown List */}
            {showDropdown && filteredStudents.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => handleSelectStudent(student)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold flex-shrink-0 overflow-hidden">
                      {student.profilePicture ? (
                        <img src={student.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                      ) : (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate text-sm">{student.fullName}</p>
                      <p className="text-xs text-gray-600 truncate">{student.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-4">
              <div>
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-600 text-sm font-medium">No conversations</p>
                <p className="text-gray-400 text-xs mt-1">Search and start chatting</p>
              </div>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => {
                  setWithUser(conv._id);
                  setSearchName("");
                  loadMessages(conv._id);
                  setShowDropdown(false);
                }}
                className={`w-full px-3 py-3 border-b border-gray-100 transition hover:bg-gray-50 text-left ${withUser === conv._id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold flex-shrink-0 overflow-hidden">
                    {conv.otherUser?.profilePicture ? (
                      <img src={conv.otherUser.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                    ) : (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-sm">{conv.otherUser?.fullName}</p>
                    <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{conv.lastMessageTime}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="hidden sm:flex flex-1 flex-col bg-white">
        {withUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold overflow-hidden">
                {recipientInfo?.profilePicture ? (
                  <img src={recipientInfo.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                ) : (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{recipientInfo?.fullName}</p>
                <p className="text-xs text-gray-600">{recipientInfo?.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No messages yet</p>
                    <p className="text-gray-400 text-sm">Start the conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, index) => {
                    const isOwn = String(m.from?._id) === String(userId);
                    const showName = !isOwn && (index === 0 || messages[index - 1]?.from?._id !== m.from?._id);

                    return (
                      <div key={m._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 group`}>
                        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                          {showName && !isOwn && (
                            <p className="text-xs text-gray-600 font-semibold mb-1 ml-2">
                              {m.from?.fullName || "User"}
                            </p>
                          )}
                          <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                            {/* 3-dot menu */}
                            <div className="relative flex-shrink-0" ref={menuOpenId === m._id ? menuRef : null}>
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === m._id ? null : m._id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-0.5"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                              {menuOpenId === m._id && (
                                <div className={`absolute ${isOwn ? "right-0" : "left-0"} bottom-6 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 min-w-[120px]`}>
                                  <button
                                    onClick={() => { navigator.clipboard.writeText(m.content); toast.success("Copied!"); setMenuOpenId(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    Copy
                                  </button>
                                  {isOwn && (
                                    <button
                                      onClick={async () => { try { await api.delete(`/messages/${m._id}`); setMessages((prev) => prev.filter((msg) => msg._id !== m._id)); toast.success("Deleted"); } catch { toast.error("Failed to delete"); } setMenuOpenId(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div
                              className={`px-4 py-2.5 rounded-2xl max-w-xs lg:max-w-md shadow-sm transition-all ${isOwn
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-900 rounded-bl-none"
                                }`}
                            >
                              <p className="text-sm break-words leading-relaxed">{m.content}</p>
                            </div>
                          </div>
                          <p
                            className={`text-xs mt-1 px-2 ${isOwn ? "text-gray-500" : "text-gray-600"
                              }`}
                          >
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
              <div className="flex gap-3">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="2"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 resize-none transition"
                />
                <button
                  onClick={send}
                  disabled={!content.trim() || !withUser.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-fit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 font-medium">Select a conversation</p>
              <p className="text-gray-400 text-sm mt-1">Choose a student to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorMessagesPage;

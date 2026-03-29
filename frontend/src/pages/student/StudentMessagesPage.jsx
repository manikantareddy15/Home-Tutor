import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";
import { initSocket, getSocket } from "../../services/socket";

const StudentMessagesPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchName, setSearchName] = useState("");
  const [withUser, setWithUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  // Load available tutors on mount
  useEffect(() => {
    const loadTutors = async () => {
      try {
        const res = await api.get("/tutors");
        setTutors(res.data.tutors || []);
      } catch (err) {
        console.error("Failed to load tutors:", err);
      }
    };
    loadTutors();
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
      console.log("Initializing socket for user:", user._id);
      const socket = initSocket(token, user._id);

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
  }, [user?._id]);

  // Auto-populate from URL params
  useEffect(() => {
    const tutorId = searchParams.get("tutor");
    const studentId = searchParams.get("student");
    const userId = tutorId || studentId;
    
    if (userId) {
      // Find tutor by ID and set search name
      const tutor = tutors.find(t => t._id === userId);
      if (tutor) {
        setSearchName(tutor.fullName);
        setWithUser(userId);
        loadMessages(userId);
      }
    }
  }, [searchParams, tutors]);

  // Filter tutors based on search name
  useEffect(() => {
    if (searchName.trim()) {
      const filtered = tutors.filter(tutor =>
        tutor.fullName.toLowerCase().includes(searchName.toLowerCase())
      );
      setFilteredTutors(filtered);
      setShowDropdown(true);
    } else {
      setFilteredTutors([]);
      setShowDropdown(false);
    }
  }, [searchName, tutors]);

  const handleSelectTutor = (tutor) => {
    setSearchName(tutor.fullName);
    setWithUser(tutor._id);
    setShowDropdown(false);
    loadMessages(tutor._id);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (userId = withUser) => {
    if (!userId.trim()) {
      toast.error("Please select a tutor");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/messages", { params: { withUser: userId } });
      setMessages(data.messages || []);

      // Fetch recipient info
      try {
        // Try to get tutor first
        try {
          const userRes = await api.get(`/tutors/${userId}`);
          if (userRes.data.tutor) {
            setRecipientInfo(userRes.data.tutor);
            return;
          }
        } catch {
          // If not a tutor, it might be a student - get from message data
        }

        // Fallback - try to get user info from messages
        const senderInfo = data.messages?.[0]?.from;
        if (senderInfo && String(senderInfo._id) !== String(user?._id)) {
          setRecipientInfo(senderInfo);
        } else {
          const receiverInfo = data.messages?.[0]?.to;
          if (receiverInfo && String(receiverInfo._id) !== String(user?._id)) {
            setRecipientInfo(receiverInfo);
          }
        }
      } catch (error) {
        console.error("Error fetching recipient info:", error);
        // Fallback - try to get user info from messages
        const senderInfo = data.messages?.[0]?.from;
        if (senderInfo && String(senderInfo._id) !== String(user?._id)) {
          setRecipientInfo(senderInfo);
        } else {
          const receiverInfo = data.messages?.[0]?.to;
          if (receiverInfo && String(receiverInfo._id) !== String(user?._id)) {
            setRecipientInfo(receiverInfo);
          }
        }
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
      toast.error("Please select a tutor first");
      return;
    }
    try {
      const response = await api.post("/messages", { to: withUser, content });
      
      // Add message to local state
      const newMessage = {
        ...response.data.message,
        _id: response.data.message._id || new Date().getTime(),
        from: {
          _id: user._id,
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
            _id: user._id,
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
              placeholder="Search tutors..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 text-sm"
            />
            
            {/* Dropdown List */}
            {showDropdown && filteredTutors.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredTutors.map((tutor) => (
                  <button
                    key={tutor._id}
                    onClick={() => handleSelectTutor(tutor)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                      {tutor.fullName?.charAt(0) || "T"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate text-sm">{tutor.fullName}</p>
                      <p className="text-xs text-gray-600 truncate">{tutor.email}</p>
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
                  setSearchName(conv.otherUser?.fullName || "");
                  loadMessages(conv._id);
                  setShowDropdown(false);
                }}
                className={`w-full px-3 py-3 border-b border-gray-100 transition hover:bg-gray-50 text-left ${
                  withUser === conv._id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    {conv.otherUser?.fullName?.charAt(0) || "T"}
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
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                {recipientInfo?.fullName?.charAt(0) || "T"}
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
                    const isOwn = m.from?._id === user?._id;
                    const showName = !isOwn && (index === 0 || messages[index - 1]?.from?._id !== m.from?._id);
                    
                    return (
                      <div key={m._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
                        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                          {showName && !isOwn && (
                            <p className="text-xs text-gray-600 font-semibold mb-1 ml-2">
                              {m.from?.fullName || "User"}
                            </p>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-xs lg:max-w-md shadow-sm transition-all ${
                              isOwn
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-900 rounded-bl-none"
                            }`}
                          >
                            <p className="text-sm break-words leading-relaxed">{m.content}</p>
                          </div>
                          <p
                            className={`text-xs mt-1 px-2 ${
                              isOwn ? "text-gray-500" : "text-gray-600"
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

            {/* Input */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex gap-3">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows="2"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 resize-none text-sm"
                />
                <button
                  onClick={send}
                  disabled={!content.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-fit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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
              <p className="text-gray-400 text-sm mt-1">Choose a tutor to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default StudentMessagesPage;

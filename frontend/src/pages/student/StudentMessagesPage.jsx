import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";
import { initSocket, getSocket } from "../../services/socket";

const StudentMessagesPage = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const EMOJIS = [
    "😀", "😂", "😍", "🥰", "😊", "😎", "🤔", "😅", "😭", "😡",
    "👍", "👎", "🙌", "👏", "🤝", "🙏", "💪", "✌️", "🤞", "👋",
    "❤️", "🔥", "✨", "💯", "🎉", "🎊", "👀", "💡", "📚", "⏰",
    "😴", "🤩", "🥳", "😇", "🤗", "😬", "🫡", "🫂", "💬", "🗓️",
  ];

  // Close emoji picker and menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    api.get("/tutors").then((r) => setTutors(r.data.tutors || [])).catch(() => { });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/messages/conversations/list");
        if (r.data.conversations) setConversations(r.data.conversations);
      } catch { }
    };
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("hometutor_token");
    if (token && user?._id) {
      const socket = initSocket(token, userId);
      const handler = (msg) => {
        setMessages((prev) =>
          prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
        );
      };
      socket.on("new_message", handler);
      return () => socket.off("new_message", handler);
    }
  }, [userId]);

  useEffect(() => {
    const tutorId = searchParams.get("tutor") || searchParams.get("student");
    if (tutorId) {
      const t = tutors.find((x) => x._id === tutorId);
      if (t) { setSearchName(t.fullName); setWithUser(tutorId); loadMessages(tutorId); }
    }
  }, [searchParams, tutors]);

  useEffect(() => {
    if (searchName.trim()) {
      setFilteredTutors(tutors.filter((t) => t.fullName.toLowerCase().includes(searchName.toLowerCase())));
      setShowDropdown(true);
    } else {
      setFilteredTutors([]);
      setShowDropdown(false);
    }
  }, [searchName, tutors]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (userId = withUser) => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await api.get("/messages", { params: { withUser: userId } });
      setMessages(data.messages || []);
      // Resolve recipient name
      try {
        const r = await api.get(`/tutors/${userId}`);
        if (r.data.tutor) { setRecipientInfo(r.data.tutor); return; }
      } catch { }
      const msgs = data.messages || [];
      const other = msgs[0]
        ? String(msgs[0].from?._id) !== String(userId) ? msgs[0].from : msgs[0].to
        : null;
      if (other) setRecipientInfo(other);
    } catch { toast.error("Failed to load messages"); }
    finally { setLoading(false); }
  };

  const send = async () => {
    if (!content.trim()) return;
    if (!withUser) { toast.error("Select a tutor first"); return; }
    try {
      const res = await api.post("/messages", { to: withUser, content });
      const newMsg = {
        ...res.data.message,
        _id: res.data.message._id || Date.now(),
        from: { _id: userId, fullName: user.fullName }
      };
      setMessages((p) => [...p, newMsg]);
      const socket = getSocket();
      if (socket) socket.emit("send_message", { to: withUser, from: { _id: userId, fullName: user.fullName }, content, _id: newMsg._id, createdAt: newMsg.createdAt || new Date() });
      setContent("");
      // Refresh sidebar
      const r = await api.get("/messages/conversations/list");
      if (r.data.conversations) setConversations(r.data.conversations);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to send"); }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const deleteMessage = async (msgId) => {
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  // Group messages by date
  const groupedMessages = messages.reduce((acc, m) => {
    const day = m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Today";
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  return (
    <div style={{ height: "calc(100vh - 130px)" }} className="flex rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white">

      {/* ─── LEFT SIDEBAR ─── */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">

        {/* Sidebar Header */}
        <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="text-blue-800 font-semibold text-base">Chats</span>
          </div>
        </div>

        {/* Search inside sidebar */}
        <div className="px-3 py-2 bg-white border-b border-gray-100 relative">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {/* Search dropdown */}
          {showDropdown && filteredTutors.length > 0 && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-52 overflow-y-auto">
              {filteredTutors.map((t) => (
                <button
                  key={t._id}
                  onClick={() => { setSearchName(t.fullName); setWithUser(t._id); setShowDropdown(false); loadMessages(t._id); }}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-50 transition text-left border-b border-gray-50 last:border-0"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {t.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{t.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{t.subjects?.join(", ") || "Tutor"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-400 text-sm">No conversations yet</p>
              <p className="text-gray-300 text-xs mt-1">Search a tutor to start chatting</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => { setWithUser(conv._id); setSearchName(conv.otherUser?.fullName || ""); loadMessages(conv._id); setShowDropdown(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition text-left ${withUser === conv._id ? "bg-blue-50" : ""}`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {conv.otherUser?.fullName?.charAt(0)?.toUpperCase() || "T"}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800 text-sm truncate">{conv.otherUser?.fullName}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── RIGHT CHAT PANEL ─── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundImage: "radial-gradient(circle, #dbeafe 1px, transparent 1px)", backgroundSize: "20px 20px", backgroundColor: "#f0f4ff" }}>
        {withUser ? (
          <>
            {/* Chat Header — light blue bar (no search icon) */}
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-base">
                {recipientInfo?.fullName?.charAt(0)?.toUpperCase() || "T"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{recipientInfo?.fullName || searchName || "Chat"}</p>
                <p className="text-blue-500 text-xs truncate">{recipientInfo?.email || ""}</p>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-white bg-opacity-80 rounded-2xl px-6 py-4 text-center shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                    <p className="text-gray-400 text-xs mt-1">Say hi to start the conversation 👋</p>
                  </div>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([day, dayMsgs]) => (
                  <div key={day}>
                    {/* Day separator */}
                    <div className="flex items-center justify-center my-3">
                      <span className="bg-white bg-opacity-80 text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-100">{day}</span>
                    </div>
                    {dayMsgs.map((m, i) => {
                      const isOwn = String(m.from?._id) === String(userId);
                      const prevSame = i > 0 && String(dayMsgs[i - 1].from?._id) === String(m.from?._id);
                      return (
                        <div key={m._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} group ${prevSame ? "mt-0.5" : "mt-3"}`}>

                          {/* Avatar — left side for received, only first in group */}
                          {!isOwn && !prevSame && (
                            <div className="w-7 h-7 rounded-full bg-blue-400 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mr-1.5 mt-auto mb-1">
                              {m.from?.fullName?.charAt(0)?.toUpperCase() || "T"}
                            </div>
                          )}
                          {!isOwn && prevSame && <div className="w-7 mr-1.5 flex-shrink-0" />}

                          {/* Bubble column */}
                          <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-xs lg:max-w-sm xl:max-w-md`}>

                            {/* Bubble row: bubble + 3-dot menu */}
                            <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>

                              {/* 3-dot menu — shows on hover */}
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
                                        onClick={() => { deleteMessage(m._id); setMenuOpenId(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Bubble */}
                              <div className={`relative px-3 py-2 rounded-2xl shadow-sm text-sm leading-relaxed break-words ${isOwn
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                                }`}>
                                {m.content}

                                {/* Tail: SVG triangle — blue for sent, white for received */}
                                {isOwn ? (
                                  <svg className="absolute -bottom-0 -right-2 w-3 h-3 text-blue-600" viewBox="0 0 10 10" fill="currentColor">
                                    <path d="M0 0 L10 0 L0 10 Z" />
                                  </svg>
                                ) : (
                                  <svg className="absolute -bottom-0 -left-2 w-3 h-3 text-white" viewBox="0 0 10 10" fill="currentColor">
                                    <path d="M10 0 L0 0 L10 10 Z" />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Timestamp */}
                            <p className="text-[10px] mt-1 px-1 text-gray-400">
                              {fmtTime(m.createdAt)}
                              {isOwn && <span className="ml-1 text-blue-400">✓✓</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="bg-white border-t border-gray-200 px-3 py-2.5 flex items-end gap-2 flex-shrink-0">
              {/* Emoji button + picker */}
              <div className="relative flex-shrink-0" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className={`text-gray-400 hover:text-blue-500 transition pb-1 ${showEmojiPicker ? "text-blue-500" : ""}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {/* Emoji grid */}
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 w-64 z-50">
                    <p className="text-xs text-gray-400 font-semibold mb-2 px-1">Emojis</p>
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => { setContent((c) => c + emoji); setShowEmojiPicker(false); }}
                          className="text-xl hover:bg-blue-50 rounded-lg p-1 transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text input */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={handleKey}
                placeholder="Type a message"
                rows={1}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none overflow-hidden border-0"
                style={{ minHeight: "42px", maxHeight: "120px" }}
                onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              />

              {/* Send button */}
              <button
                onClick={send}
                disabled={!content.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition ${content.trim() ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" : "bg-gray-200 text-gray-400"
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          /* No chat selected — WhatsApp welcome screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="bg-white bg-opacity-80 rounded-3xl p-10 shadow-sm border border-blue-100 max-w-sm">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-gray-700 font-semibold text-lg mb-2">HomeTutor Chat</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Select a conversation from the left or search for a tutor to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMessagesPage;

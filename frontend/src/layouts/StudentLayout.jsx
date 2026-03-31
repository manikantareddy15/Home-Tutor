import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const res = await api.get("/notifications");
        if (res.data.notifications) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err.response?.data || err.message);
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    const userId = user?.id || user?._id;
    if (userId) {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, user?._id]);

  const links = [
    { to: "/student", label: "Home", icon: "home" },
    { to: "/student/find-tutors", label: "Find Tutors", icon: "search" },
    { to: "/student/bookings", label: "Bookings", icon: "calendar" },
    { to: "/student/messages", label: "Messages", icon: "message" }
  ];

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate("/login");
  };

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-7 9 7v7a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" />
        </svg>
      ),
      search: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-1.405-1.405A2.032 2.032 0 0118 18.158V17a6.002 6.002 0 00-4-5.659V11a2 2 0 10-4 0v.341C7.67 12.165 6 14.388 6 17v1.159c0 .538-.214 1.055-.595 1.436L4 21h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      message: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Hero Header Section */}
      <div className="bg-white shadow-md border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo and HomeTutor */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/home_logo.jpg"
              alt="HomeTutor"
              className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover flex-shrink-0"
            />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">HomeTutor</h1>
          </div>

          {/* Notification and Profile */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-full relative transition"
              >
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                    {notifications.filter(n => !n.read).length || notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80 max-h-96 overflow-y-auto">
                  <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-3">
                    <h3 className="font-bold text-gray-800">Recent Updates</h3>
                  </div>

                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notif) => {
                        const timeAgo = notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "Just now";
                        return (
                          <button
                            key={notif._id}
                            onClick={() => setShowNotifications(false)}
                            className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition ${notif.read ? "opacity-60" : "bg-blue-50 font-medium"
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${notif.type === "booking" ? "bg-blue-500" :
                                  notif.type === "message" ? "bg-green-500" :
                                    notif.type === "completed" ? "bg-purple-500" :
                                      "bg-amber-500"
                                }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{notif.title}</p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-gray-500 text-sm">No notifications yet</p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
                    <button
                      onClick={() => {
                        navigate("/student/notifications");
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-2 transition"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-gray-200 relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition flex-shrink-0 overflow-hidden"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </button>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex flex-col min-w-0 text-left hover:opacity-80 transition"
              >
                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{user?.fullName}</span>
                <span className="text-xs text-gray-500">Student</span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48">
                  <button
                    onClick={() => {
                      navigate('/student/profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 flex items-center gap-2 transition"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="font-medium text-gray-800">My Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 transition text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Navigation Section */}
      <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 flex justify-center">
        <nav className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full sm:max-w-3xl">
          <div className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-8 py-3 sm:py-4 overflow-x-auto">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  aria-label={link.label}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                >
                  <span className={isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}>
                    {getIcon(link.icon)}
                  </span>
                  <span className="font-medium">{link.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;

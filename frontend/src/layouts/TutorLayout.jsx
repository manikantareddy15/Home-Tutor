import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

const TutorLayout = () => {
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
        console.log("Fetching notifications for tutor:", user?._id);
        const res = await api.get("/notifications");
        console.log("Notifications response:", res.data);
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

    if (user?._id) {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const getNotificationColor = (type) => {
    const colors = {
      booking: "bg-blue-100",
      message: "bg-green-100",
      completed: "bg-purple-100",
      payment: "bg-amber-100",
    };
    return colors[type] || "bg-gray-100";
  };

  const getNotificationDotColor = (type) => {
    const colors = {
      booking: "bg-blue-500",
      message: "bg-green-500",
      completed: "bg-purple-500",
      payment: "bg-amber-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const links = [
    { to: "/tutor", label: "Dashboard", icon: "dashboard" },
    { to: "/tutor/schedule", label: "Schedule", icon: "calendar" },
    { to: "/tutor/requests", label: "Requests", icon: "bell" },
    { to: "/tutor/earnings", label: "Earnings", icon: "earnings" },
    { to: "/tutor/history", label: "History", icon: "history" },
    { to: "/tutor/messages", label: "Messages", icon: "message" }
  ];

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate("/login");
  };

  const getIcon = (iconName) => {
    const icons = {
      dashboard: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 4l4 2m-9-2l4-2" /></svg>,
      calendar: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      bell: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
      earnings: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm0 2a10 10 0 100 20 10 10 0 000-20zm0 8a2 2 0 110 4 2 2 0 010-4zm0-2c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" /></svg>,
      history: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      message: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
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
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 relative">
            {/* Notification Bell with Dropdown Panel */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-full relative transition"
              >
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Recent Updates</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                      const timeAgo = notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Just now";
                      return (
                        <div
                          key={notification._id}
                          onClick={() => setShowNotifications(false)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                            notification.read ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${getNotificationDotColor(notification.type)}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{notification.message}</p>
                              <p className="text-gray-500 text-xs mt-2">{timeAgo}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button
                      onClick={() => {
                        navigate("/tutor/notifications");
                        setShowNotifications(false);
                      }}
                      className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Icon with Dropdown Menu */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-gray-200 relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition flex-shrink-0"
              >
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{user?.fullName}</span>
                <span className="text-xs text-gray-500">Tutor</span>
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <button
                    onClick={() => {
                      navigate("/tutor/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition font-medium text-sm border-b border-gray-100"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Navigation Section */}
      <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 flex justify-center">
        <nav className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full sm:max-w-4xl">
          <div className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-8 py-3 sm:py-4 overflow-x-auto">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  <span className={isActive ? "text-purple-600" : "text-gray-600 hover:text-purple-600"}>
                    {getIcon(link.icon)}
                  </span>
                  <span className="font-medium hidden sm:inline">{link.label}</span>
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

export default TutorLayout;

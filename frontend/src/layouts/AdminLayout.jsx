import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

const AdminLayout = () => {
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
        console.log("Fetching notifications for admin:", user?._id);
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
    { to: "/admin", label: "Dashboard", icon: "home" },
    { to: "/admin/tutors", label: "Tutors", icon: "user" },
    { to: "/admin/students", label: "Students", icon: "users" },
    { to: "/admin/approvals", label: "Approvals", icon: "check" },
    { to: "/admin/sessions", label: "Sessions", icon: "calendar" },
    { to: "/admin/bookings", label: "Requests", icon: "book" }
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
      user: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4" strokeWidth="2" />
          <path strokeWidth="2" d="M5.5 21a7.5 7.5 0 0113 0" />
        </svg>
      ),
      users: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="7" r="4" strokeWidth="2" />
          <circle cx="17" cy="7" r="4" strokeWidth="2" />
          <path strokeWidth="2" d="M2 21a7 7 0 0114 0M8 21a7 7 0 0114 0" />
        </svg>
      ),
      check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
          <path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      book: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4.5A2.5 2.5 0 016.5 7H20v13H6.5A2.5 2.5 0 014 17.5v-13z" />
        </svg>
      )
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
                        navigate("/admin/notifications");
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
                className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition flex-shrink-0 overflow-hidden"
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
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{user?.fullName}</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <button
                    onClick={() => {
                      navigate("/admin/profile");
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
        <nav className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full sm:max-w-5xl">
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
      <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

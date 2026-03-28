import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/student", label: "Home", icon: "home" },
    { to: "/student/find-tutors", label: "Find Tutors", icon: "search" },
    { to: "/student/bookings", label: "Bookings", icon: "calendar" },
    { to: "/student/messages", label: "Messages", icon: "message" },
    { to: "/student/profile", label: "Profile", icon: "user" }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getIcon = (iconName) => {
    const icons = {
      home: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 4l4 2m-9-2l4-2" /></svg>,
      search: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
      calendar: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      message: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      user: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
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
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-gray-200">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{user?.fullName}</span>
                <span className="text-xs text-gray-500">Student</span>
              </div>
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
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <span className={isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}>
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>

      {/* Logout Button - Fixed at bottom right */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StudentLayout;

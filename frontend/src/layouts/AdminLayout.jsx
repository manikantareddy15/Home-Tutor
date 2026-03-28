import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/admin", label: "Dashboard", icon: "home" },
    { to: "/admin/tutors", label: "Tutors", icon: "user" },
    { to: "/admin/students", label: "Students", icon: "users" },
    { to: "/admin/approvals", label: "Approvals", icon: "check" },
    { to: "/admin/sessions", label: "Sessions", icon: "calendar" },
    { to: "/admin/bookings", label: "Bookings", icon: "book" }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getIcon = (iconName) => {
    const icons = {
      home: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 4l4 2m-9-2l4-2" /></svg>,
      user: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      users: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 8H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>,
      check: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      calendar: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      book: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.596 6.253 2 10.849 2 16.5S6.596 26.747 12 26.747s10-4.596 10-10.247S17.404 6.253 12 6.253z" /></svg>
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
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-gray-200">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{user?.fullName}</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
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

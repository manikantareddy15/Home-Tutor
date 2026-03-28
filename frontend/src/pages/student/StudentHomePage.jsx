import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../store/AuthContext";

const StudentHomePage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalSpent: 0,
    learningHours: 0
  });

  useEffect(() => {
    api.get("/bookings")
      .then((r) => {
        const bookingsData = r.data.bookings || [];
        setBookings(bookingsData);
        
        // Calculate stats
        setStats({
          totalSessions: bookingsData.length,
          totalSpent: bookingsData.reduce((a, b) => a + (b.totalPrice || 0), 0),
          learningHours: bookingsData.length * 1
        });
      })
      .catch(() => {});
  }, []);

  const today = new Date().toDateString();
  const todaySessions = bookings.filter((b) => new Date(b.startTime).toDateString() === today);
  const upcomingSessions = bookings.filter((b) => new Date(b.startTime) > new Date()).slice(0, 5);

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.fullName}!
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Here's your learning overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 px-4 sm:px-0">
        {/* Total Sessions Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-blue-200 border-t-4 border-t-blue-500 p-3 sm:p-4 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Total Sessions</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">{stats.totalSessions}</p>
              <p className="text-blue-500 text-xs mt-1 font-medium">This month</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 sm:p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C6.596 6.253 2 10.849 2 16.5S6.596 26.747 12 26.747s10-4.596 10-10.247S17.404 6.253 12 6.253z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-200">
            <p className="text-blue-600 text-xs font-semibold">↑ 12% from last month</p>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-green-200 border-t-4 border-t-green-500 p-3 sm:p-4 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Total Spent</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1 sm:mt-2">${(stats.totalSpent / 100).toFixed(2)}</p>
              <p className="text-green-500 text-xs mt-1 font-medium">Well managed</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 sm:p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm0 2a10 10 0 100 20 10 10 0 000-20zm0 8a2 2 0 110 4 2 2 0 010-4zm0-2c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-green-200">
            <p className="text-green-600 text-xs font-semibold">↓ 8% from last month</p>
          </div>
        </div>

        {/* Learning Hours Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-yellow-200 border-t-4 border-t-yellow-500 p-3 sm:p-4 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-yellow-600 text-xs font-bold uppercase tracking-wider">Learning Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mt-1 sm:mt-2">{stats.learningHours}</p>
              <p className="text-yellow-500 text-xs mt-1 font-medium">Keep it up!</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-2 sm:p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-yellow-200">
            <p className="text-yellow-600 text-xs font-semibold">↑ 24% from last month</p>
          </div>
        </div>
      </div>

      {/* Today's Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 mx-4 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Today's Schedule</h3>
        {todaySessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {todaySessions.map((booking) => (
              <div
                key={booking._id}
                className="bg-gradient-to-br from-slate-50 to-white border-2 border-blue-300 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-400"
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg flex-shrink-0">
                    {booking.tutor?.fullName?.charAt(0) || "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-semibold truncate text-sm sm:text-base">{booking.tutor?.fullName}</p>
                    <p className="text-blue-600 text-xs font-medium">{booking.subject || "Subject"}</p>
                  </div>
                </div>
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700 font-medium flex-wrap">
                    <span>{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="text-gray-400">→</span>
                    <span>{new Date(new Date(booking.startTime).getTime() + 60*60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{booking.mode || "Mode"}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-gray-200">
                  <p className="text-green-600 font-bold text-base sm:text-lg">${(booking.totalPrice / 100).toFixed(2)}</p>
                  {booking.mode === "online" && booking.status === "ongoing" && (
                    <button className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-green-600 transition">
                      JOIN SESSION
                    </button>
                  )}
                  {booking.status !== "ongoing" && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Confirmed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No sessions scheduled for today</p>
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mx-4 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Upcoming Sessions</h3>
        {upcomingSessions.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessions.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 sm:p-5 border-l-4 border-l-blue-500 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg flex-shrink-0">
                  {booking.tutor?.fullName?.charAt(0) || "T"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-2">
                    <p className="text-gray-800 font-semibold text-sm sm:text-base truncate">{booking.tutor?.fullName}</p>
                    <span className="text-xs text-gray-500 font-medium truncate">{booking.subject || "Subject"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
                    <span className="font-medium">{new Date(booking.startTime).toLocaleDateString()}</span>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <span className="font-medium">{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <span className="capitalize text-blue-600 font-medium">{booking.mode || "Mode"}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0 sm:ml-auto w-full sm:w-auto">
                  <p className="text-green-600 font-bold text-base sm:text-lg">${(booking.totalPrice / 100).toFixed(2)}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHomePage;

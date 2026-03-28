import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../store/AuthContext";

const TutorDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    todaySessions: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    api.get("/bookings")
      .then((r) => {
        const bookingsData = r.data.bookings || [];
        setBookings(bookingsData);
        
        // Calculate stats
        setStats({
          totalRequests: bookingsData.filter((b) => b.status === "pending").length,
          todaySessions: bookingsData.length,
          totalEarnings: bookingsData.reduce((a, b) => a + (b.totalPrice || 0), 0)
        });
      })
      .catch(() => {});
  }, []);

  const ongoing = bookings.filter((b) => b.status === "ongoing");

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.fullName}!
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Here's your teaching overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 px-4 sm:px-0">
        {/* Requests Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-blue-200 border-t-4 border-t-blue-500 p-3 sm:p-4 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Requests</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">{stats.totalRequests}</p>
              <p className="text-blue-500 text-xs mt-1 font-medium">Pending approval</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 sm:p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-200">
            <p className="text-blue-600 text-xs font-semibold">Review pending requests</p>
          </div>
        </div>

        {/* Today Sessions Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-purple-200 border-t-4 border-t-purple-500 p-3 sm:p-4 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-purple-600 text-xs font-bold uppercase tracking-wider">Today Sessions</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1 sm:mt-2">{stats.todaySessions}</p>
              <p className="text-purple-500 text-xs mt-1 font-medium">Total sessions</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 sm:p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-purple-200">
            <p className="text-purple-600 text-xs font-semibold">Keep teaching!</p>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-green-200 border-t-4 border-t-green-500 p-3 sm:p-4 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Total Earnings</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1 sm:mt-2">₹{stats.totalEarnings}</p>
              <p className="text-green-500 text-xs mt-1 font-medium">Keep it growing</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 sm:p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm0 2a10 10 0 100 20 10 10 0 000-20zm0 8a2 2 0 110 4 2 2 0 010-4zm0-2c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-green-200">
            <p className="text-green-600 text-xs font-semibold">↑ Earnings active</p>
          </div>
        </div>
      </div>

      {/* Today's Sessions Section */}
      <div className="mt-6 sm:mt-8 px-4 sm:px-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Today's Sessions</h3>
        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{b.subject}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                        {b.mode}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                        b.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : b.status === "ongoing"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                  {b.mode === "online" && b.status === "ongoing" && (
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex-shrink-0">
                      JOIN
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No sessions scheduled for today</p>
        )}
        {ongoing.length > 0 && (
          <p className="text-xs text-slate-500 mt-4 text-center">OTP is generated when session set to ongoing.</p>
        )}
      </div>
    </div>
  );
};

export default TutorDashboardPage;

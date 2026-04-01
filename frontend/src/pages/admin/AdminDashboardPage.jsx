import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../store/AuthContext";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: {}, recentSessions: [] });

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setData(r.data)).catch(() => {});
  }, []);

  const s = data.stats || {};

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.fullName}!
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Platform overview and management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 px-4 sm:px-0">
        {/* Total Tutors Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-purple-200 border-t-4 border-t-purple-500 p-4 sm:p-7 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-purple-600 text-xs font-bold uppercase tracking-wider">Total Tutors</p>
              <p className="text-3xl sm:text-4xl font-bold text-purple-900 mt-2 sm:mt-3">{s.totalTutors || 0}</p>
              <p className="text-purple-500 text-xs mt-2 font-medium">Active & Verified</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-200">
            <p className="text-purple-600 text-xs font-semibold">↑ 8% from last month</p>
          </div>
        </div>

        {/* Total Students Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-blue-200 border-t-4 border-t-blue-500 p-4 sm:p-7 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Total Students</p>
              <p className="text-3xl sm:text-4xl font-bold text-blue-900 mt-2 sm:mt-3">{s.totalStudents || 0}</p>
              <p className="text-blue-500 text-xs mt-2 font-medium">Registered Users</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
            <p className="text-blue-600 text-xs font-semibold">↑ 15% from last month</p>
          </div>
        </div>

        {/* Sessions Today Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-green-200 border-t-4 border-t-green-500 p-4 sm:p-7 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Sessions Today</p>
              <p className="text-3xl sm:text-4xl font-bold text-green-900 mt-2 sm:mt-3">{s.sessionsToday || 0}</p>
              <p className="text-green-500 text-xs mt-2 font-medium">Active & Ongoing</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 11h2v6h-2zm0-6h2v2h-2zM19.03 4.98l1.42-1.42c-2.05-2.05-5.38-2.05-7.43 0l-1.41 1.41 6.42 6.42 1.42-1.42c2.04-2.05 2.04-5.37 0-7.39zM5.07 17.l1.41-1.41-6.42-6.42L-1.36 10.6C-3.41 12.65-3.41 15.97-1.36 18.02l1.42 1.42 6.42-6.42 1.41-1.42 5.07 5.07 1.41 1.41 6.42 6.42 1.42 1.42c2.05-2.05 2.05-5.37 0-7.39l-1.42-1.42-6.42-6.42-1.41-1.41L5.07 17z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-200">
            <p className="text-green-600 text-xs font-semibold">↑ 5% from yesterday</p>
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-orange-200 border-t-4 border-t-orange-500 p-4 sm:p-7 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-orange-600 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
              <p className="text-3xl sm:text-4xl font-bold text-orange-900 mt-2 sm:mt-3">{s.pendingApprovals || 0}</p>
              <p className="text-orange-500 text-xs mt-2 font-medium">Requires Action</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-orange-200">
            <p className="text-orange-600 text-xs font-semibold">Review Now</p>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 mx-4 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Recent Sessions</h3>
        {data.recentSessions && data.recentSessions.filter(s => s.status !== "pending").length > 0 ? (
          <div className="space-y-3">
            {data.recentSessions.filter(s => s.status !== "pending").map((session) => (
              <div
                key={session._id}
                className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 sm:p-5 border-l-4 border-l-blue-500 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg flex-shrink-0">
                  {session.subject?.charAt(0) || "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-2">
                    <p className="text-gray-800 font-semibold text-sm sm:text-base truncate">{session.subject || "Subject"}</p>
                    <span className="text-xs text-gray-500 font-medium truncate">
                      {session.student?.fullName} with {session.tutor?.fullName}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
                    <span className="font-medium capitalize">{session.mode || "Mode"}</span>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <span className="capitalize font-medium">{session.status || "Status"}</span>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <span className="font-medium">${(session.totalPrice / 100).toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0 sm:ml-auto w-full sm:w-auto">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full capitalize">
                    {session.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No recent sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

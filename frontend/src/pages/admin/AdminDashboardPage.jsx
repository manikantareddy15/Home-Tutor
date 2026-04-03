import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../store/AuthContext";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: {}, recentSessions: [] });

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setData(r.data)).catch(() => { });
  }, []);

  const s = data.stats || {};

  return (
    <div className="max-w-5xl mx-auto">
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
          <div>
            <p className="text-purple-600 text-xs font-bold uppercase tracking-wider">Total Tutors</p>
            <p className="text-3xl sm:text-4xl font-bold text-purple-900 mt-2 sm:mt-3">{s.totalTutors || 0}</p>
            <p className="text-purple-500 text-xs mt-2 font-medium">Active & Verified</p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-200">
            <p className="text-purple-600 text-xs font-semibold">↑ 8% from last month</p>
          </div>
        </div>

        {/* Total Students Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-blue-200 border-t-4 border-t-blue-500 p-4 sm:p-7 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Total Students</p>
            <p className="text-3xl sm:text-4xl font-bold text-blue-900 mt-2 sm:mt-3">{s.totalStudents || 0}</p>
            <p className="text-blue-500 text-xs mt-2 font-medium">Registered Users</p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
            <p className="text-blue-600 text-xs font-semibold">↑ 15% from last month</p>
          </div>
        </div>

        {/* Sessions Today Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-green-200 border-t-4 border-t-green-500 p-4 sm:p-7 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div>
            <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Sessions Today</p>
            <p className="text-3xl sm:text-4xl font-bold text-green-900 mt-2 sm:mt-3">{s.sessionsToday || 0}</p>
            <p className="text-green-500 text-xs mt-2 font-medium">Active & Ongoing</p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-200">
            <p className="text-green-600 text-xs font-semibold">↑ 5% from yesterday</p>
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-orange-200 border-t-4 border-t-orange-500 p-4 sm:p-7 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div>
            <p className="text-orange-600 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
            <p className="text-3xl sm:text-4xl font-bold text-orange-900 mt-2 sm:mt-3">{s.pendingApprovals || 0}</p>
            <p className="text-orange-500 text-xs mt-2 font-medium">Requires Action</p>
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

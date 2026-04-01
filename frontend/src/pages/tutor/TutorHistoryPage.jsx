import { useEffect, useState } from "react";
import api from "../../services/api";

const TutorHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/bookings").then((r) => {
      const filteredBookings = r.data.bookings.filter((b) =>
        ["completed", "cancelled", "rejected"].includes(b.status)
      );
      setBookings(filteredBookings);
    });
  }, []);

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
  const rejectedBookings = bookings.filter((b) => b.status === "rejected");
  
  const totalSpent = completedBookings.reduce((a, b) => a + (b.totalPrice || 0), 0);

  const getFilteredBookings = () => {
    if (filter === "completed") return completedBookings;
    if (filter === "cancelled") return cancelledBookings;
    if (filter === "rejected") return rejectedBookings;
    return bookings;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Session History</h1>
        <p className="text-gray-600 text-sm mt-1">View your completed, cancelled, and rejected sessions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Total Spent (Completed)</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">Rs {totalSpent.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">{completedBookings.length} sessions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium">Cancelled</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{cancelledBookings.length}</p>
          <p className="text-gray-500 text-xs mt-1">Sessions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{rejectedBookings.length}</p>
          <p className="text-gray-500 text-xs mt-1">Sessions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total History</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
          <p className="text-gray-500 text-xs mt-1">Sessions</p>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow mx-auto" style={{ maxWidth: "1000px" }}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Session History Details</h2>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4">
            {["all", "completed", "cancelled", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          {getFilteredBookings().length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Student</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Subject</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Mode</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Hours</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getFilteredBookings().map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-lg text-gray-900 font-medium">{booking.student?.fullName || "N/A"}</td>
                    <td className="px-6 py-4 text-lg text-gray-600">{booking.subject}</td>
                    <td className="px-6 py-4 text-lg text-gray-600">{booking.mode || "N/A"}</td>
                    <td className="px-6 py-4 text-lg text-gray-600">{formatDate(booking.date)}</td>
                    <td className="px-6 py-4 text-lg text-gray-600">{booking.duration ? `${booking.duration}hr` : "N/A"}</td>
                    <td className="px-6 py-4 text-lg font-semibold text-gray-900">Rs {booking.totalPrice}</td>
                    <td className="px-6 py-4 text-lg">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "cancelled"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No sessions found</p>
              <p className="text-sm mt-1">No history data for the selected filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorHistoryPage;

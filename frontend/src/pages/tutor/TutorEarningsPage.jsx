import { useEffect, useState } from "react";
import api from "../../services/api";

const TutorEarningsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("completed");

  useEffect(() => {
    api.get("/bookings").then((r) => setBookings(r.data.bookings || []));
  }, []);

  const getFilteredBookings = () => {
    return bookings.filter((b) => b.status === filter);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600 text-sm mt-1">Track your tutoring income and session details</p>
      </div>

      {/* Earnings List */}
      <div className="bg-white rounded-lg shadow mx-auto" style={{ maxWidth: "1200px" }}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4">
            {["pending", "confirmed", "rejected", "completed"].map((status) => (
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

        {/* Earnings Table */}
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
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Rupees</th>
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
                    <td className="px-6 py-4 text-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-lg font-semibold text-gray-900">Rs {booking.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No sessions found</p>
              <p className="text-sm mt-1">No sessions with {filter} status</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorEarningsPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

const TutorRequestsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("pending");
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      toast.error("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getFilteredBookings = () => {
    return bookings.filter((b) => b.status === filter);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAction = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(status === "confirmed" ? "Booking accepted!" : "Booking rejected!");
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} booking`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMessageStudent = (studentId) => {
    navigate(`/tutor/messages?student=${studentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading booking requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your incoming booking requests from students</p>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow mx-auto" style={{ maxWidth: "1200px" }}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Request Details</h2>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4">
            {["pending", "confirmed", "rejected"].map((status) => (
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

        {/* Requests Table */}
        <div className="overflow-x-auto">
          {getFilteredBookings().length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Student Name</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Subject</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Time</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Hours</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getFilteredBookings().map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-lg text-gray-900 font-medium">{booking.student?.fullName || "N/A"}</td>
                    <td className="px-6 py-4 text-lg text-gray-600">{booking.subject}</td>
                    <td className="px-6 py-4 text-lg text-gray-600">{formatDate(booking.date)}</td>
                    <td className="px-6 py-4 text-lg text-gray-600">{formatTime(booking.sessionTime)}</td>
                    <td className="px-6 py-4 text-lg text-gray-600">{booking.duration || 1}hr</td>
                    <td className="px-6 py-4 text-lg font-semibold text-gray-900">Rs {booking.totalPrice || 0}</td>
                    <td className="px-6 py-4 text-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-lg">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMessageStudent(booking.student?._id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                        >
                          Message
                        </button>
                        {filter === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(booking._id, "rejected")}
                              disabled={actionLoading === booking._id}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === booking._id ? "..." : "Reject"}
                            </button>
                            <button
                              onClick={() => handleAction(booking._id, "confirmed")}
                              disabled={actionLoading === booking._id}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === booking._id ? "..." : "Accept"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No requests found</p>
              <p className="text-sm mt-1">No {filter} requests at this time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorRequestsPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

const TutorRequestsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      const pendingBookings = res.data.bookings.filter(b => b.status === "pending");
      setBookings(pendingBookings);
    } catch (err) {
      toast.error("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            📋 Booking Requests
          </h2>
          <p className="text-gray-600">
            {bookings.length} pending request{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg font-medium mb-2">No pending requests</p>
            <p className="text-gray-500">Students will send booking requests here</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(booking => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Left Column - Student Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 border-r border-gray-200">
                    <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">Student Details</h3>
                    
                    {/* Student Card */}
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {booking.student?.fullName?.charAt(0).toUpperCase() || "S"}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{booking.student?.fullName || "Unknown"}</p>
                          <p className="text-xs text-gray-600">{booking.student?.email || "N/A"}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-600">Class/Grade:</p>
                          <p className="font-semibold text-gray-800">{booking.student?.class || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Request Status Badge */}
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
                      <p className="text-xs text-yellow-700 font-semibold">⏳ Pending Your Response</p>
                    </div>
                  </div>

                  {/* Middle Column - Session Details */}
                  <div className="p-6 border-r border-gray-200">
                    <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">Session Details</h3>

                    <div className="space-y-4">
                      {/* Subject */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Subject</p>
                        <p className="text-lg font-bold text-purple-700">{booking.subject || "N/A"}</p>
                      </div>

                      {/* Date & Time */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-2">📅 Date & Time</p>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="font-semibold text-gray-800">
                            {booking.date ? new Date(booking.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }) : "N/A"}
                          </p>
                          <p className="text-sm text-gray-700">
                            ⏰ {booking.sessionTime || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Duration & Mode */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Duration</p>
                          <p className="font-bold text-green-700">{booking.duration || 1} hour{booking.duration > 1 ? "s" : ""}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Mode</p>
                          <p className="font-bold text-orange-700 capitalize">{booking.mode || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Price & Actions */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">Pricing & Action</h3>

                    {/* Price Card */}
                    <div className="bg-white rounded-xl p-4 mb-6 flex-1">
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Rate/Hour:</span>
                          <span className="font-semibold text-gray-800">₹{booking.totalPrice / booking.duration || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Duration:</span>
                          <span className="font-semibold text-gray-800">{booking.duration || 1}h</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-800">Total Price:</span>
                            <span className="font-bold text-2xl text-green-600">₹{booking.totalPrice || 0}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 text-center py-2">
                        Payment will be processed on session completion
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleMessageStudent(booking.student?._id)}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <span>💬</span>
                        Message
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(booking._id, "rejected")}
                          disabled={actionLoading === booking._id}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <span>❌</span>
                          {actionLoading === booking._id ? "Processing..." : "Reject"}
                        </button>
                        <button
                          onClick={() => handleAction(booking._id, "confirmed")}
                          disabled={actionLoading === booking._id}
                          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <span>✅</span>
                          {actionLoading === booking._id ? "Processing..." : "Accept"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorRequestsPage;

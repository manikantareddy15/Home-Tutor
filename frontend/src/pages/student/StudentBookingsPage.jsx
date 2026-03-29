import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUS_TABS = ["all", "ongoing", "completed", "cancelled"];

const StudentBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get("/bookings").then((r) => {
      setBookings(r.data.bookings || []);
    });
  }, []);

  useEffect(() => {
    let filtered = [...bookings];
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.tutor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortBy === "latest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, sortBy, bookings]);

  const formatTime = (booking) => {
    if (booking.startTime) {
      return new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    }
    if (booking.sessionTime) {
      const [h, m] = booking.sessionTime.split(":");
      return new Date(0, 0, 0, parseInt(h), parseInt(m)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    }
    return "Time";
  };

  const formatDate = (booking) => {
    const d = booking.date ? new Date(booking.date) : booking.startTime ? new Date(booking.startTime) : null;
    if (!d) return "Date";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ongoing":    return "bg-blue-100 text-blue-600 border border-blue-200";
      case "completed":  return "bg-gray-100 text-gray-600 border border-gray-200";
      case "cancelled":  return "bg-red-100 text-red-500 border border-red-200";
      case "pending":    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "confirmed":  return "bg-green-100 text-green-600 border border-green-200";
      case "rejected":   return "bg-red-100 text-red-500 border border-red-200";
      default:           return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: "cancelled" });
      toast.success("Booking cancelled");
      setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b)));
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const handleLeaveReview = (booking) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) { toast.error("Please write a comment"); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/bookings/${selectedBookingForReview._id}/review`, { rating, comment });
      toast.success("Review submitted!");
      setShowReviewModal(false);
      setBookings(bookings.map((b) => (b._id === selectedBookingForReview._id ? { ...b, hasReview: true } : b)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">

      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm transition"
          />
        </div>
      </div>

      {/* Filter Tabs + Sort */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                statusFilter === tab
                  ? "bg-blue-50 text-blue-600 border-blue-400"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-500"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:border-blue-400"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-6"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left — Avatar + Tutor name + details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base flex-shrink-0 border border-blue-200">
                    {booking.tutor?.fullName?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{booking.tutor?.fullName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {booking.subject}
                      <span className="mx-1.5">·</span>
                      {formatDate(booking)}
                      <span className="mx-1.5">·</span>
                      {formatTime(booking)}
                      <span className="mx-1.5">·</span>
                      {booking.mode ? booking.mode.charAt(0).toUpperCase() + booking.mode.slice(1) : "Mode"}
                    </p>
                  </div>
                </div>

                {/* Right — Price + Status badge + Action */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <p className="text-blue-600 font-bold text-base">₹{booking.totalPrice}</p>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>

                  {/* Action button */}
                  {booking.status === "ongoing" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="px-3 py-1 text-xs font-semibold rounded-full border border-red-400 text-red-500 hover:bg-red-50 transition"
                    >
                      Cancel
                    </button>
                  )}
                  {booking.status === "completed" && !booking.hasReview && (
                    <button
                      onClick={() => handleLeaveReview(booking)}
                      className="px-3 py-1 text-xs font-semibold rounded-full border border-blue-400 text-blue-500 hover:bg-blue-50 transition"
                    >
                      Leave Review
                    </button>
                  )}
                  {booking.status === "cancelled" && (
                    <button className="px-3 py-1 text-xs font-semibold rounded-full border border-blue-400 text-blue-500 hover:bg-blue-50 transition">
                      Rebook
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No bookings found</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBookingForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Leave a Review</h3>
            <p className="text-gray-500 text-sm mb-6">
              How was your session with <span className="font-semibold text-gray-700">{selectedBookingForReview.tutor?.fullName}</span>?
            </p>

            {/* Stars */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="text-2xl transition-transform hover:scale-110">
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your feedback about the session..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none text-sm"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !comment.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 text-sm"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBookingsPage;

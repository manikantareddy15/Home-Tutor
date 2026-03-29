import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

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
    let filtered = bookings;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((b) =>
        b.tutor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "latest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, sortBy, bookings]);

  const getStatusColor = (status) => {
    if (status === "ongoing") return "bg-green-100 text-green-700";
    if (status === "completed") return "bg-gray-100 text-gray-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleCancel = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled successfully");
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: "cancelled" } : b));
    } catch (err) {
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
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/bookings/${selectedBookingForReview._id}/review`, {
        rating,
        comment
      });
      toast.success("Review submitted successfully!");
      setShowReviewModal(false);
      setBookings(bookings.map(b => 
        b._id === selectedBookingForReview._id 
          ? { ...b, hasReview: true } 
          : b
      ));
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* Filter Tabs and Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {["all", "ongoing", "completed", "cancelled"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition ${
                statusFilter === filter
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-300 max-w-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left - Tutor Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg flex-shrink-0">
                    {booking.tutor?.fullName?.charAt(0) || "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{booking.tutor?.fullName}</h4>
                    <p className="text-gray-600 text-sm">{booking.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {booking.date ? new Date(booking.date).toLocaleDateString() : (booking.startTime ? new Date(booking.startTime).toLocaleDateString() : "Date")} •{" "}
                      {(() => {
                        if (booking.startTime) {
                          return new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
                        } else if (booking.sessionTime) {
                          const [hours, minutes] = booking.sessionTime.split(':');
                          const date = new Date(0, 0, 0, parseInt(hours), parseInt(minutes));
                          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
                        } else {
                          return "Time";
                        }
                      })()} • {booking.mode ? booking.mode.charAt(0).toUpperCase() + booking.mode.slice(1) : "Mode"}
                    </p>
                  </div>
                </div>

                {/* Right - Price and Status */}
                <div className="text-right flex flex-col items-end gap-3">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{booking.totalPrice}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
                {booking.status === "ongoing" && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                )}
                {booking.status === "completed" && (
                  <button
                    onClick={() => handleLeaveReview(booking)}
                    className="px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
                  >
                    Leave Review
                  </button>
                )}
                {booking.status === "cancelled" && (
                  <button className="px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm">
                    Rebook
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBookingForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</h3>
            <p className="text-gray-600 text-sm mb-6">
              How was your session with <span className="font-semibold">{selectedBookingForReview.tutor?.fullName}</span>?
            </p>

            {/* Rating Stars */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{rating} out of 5 stars</p>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your feedback about the session..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !comment.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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

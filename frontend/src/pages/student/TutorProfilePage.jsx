import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

const TutorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingData, setBookingData] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  const [form, setForm] = useState({
    subject: "Telugu",
    date: "",
    sessionTime: "10:00",
    duration: 1,
    mode: "online"
  });

  const durationOptions = [1, 2, 3, 4, 5];

  useEffect(() => {
    fetchTutor();
  }, [id]);

  const fetchTutor = async () => {
    try {
      const res = await api.get(`/tutors/${id}`);
      setTutor(res.data.tutor);
      setForm(prev => ({
        ...prev,
        subject: res.data.tutor?.subjects?.[0] || "Telugu"
      }));
    } catch (err) {
      toast.error("Failed to load tutor profile");
      navigate("/student/find-tutors");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for this tutor
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await api.get(`/bookings/tutor/${id}/reviews`);
        setReviews(res.data.review);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setReviews(null);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleConfirmBooking = () => {
    if (!form.date || !form.subject) {
      toast.error("Please fill all required fields");
      return;
    }

    const ratePerHour = tutor?.hourlyRate || 0;
    const totalPrice = ratePerHour * form.duration;
    
    setBookingData({
      ...form,
      ratePerHour,
      totalPrice,
      tutorId: id
    });
    setTotalPrice(totalPrice);
    setShowModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsBooking(true);
    try {
      const payload = {
        tutorId: id,
        subject: form.subject,
        date: form.date,
        sessionTime: form.sessionTime,
        duration: form.duration,
        mode: form.mode,
        totalPrice: totalPrice
      };

      await api.post("/bookings", payload);
      toast.success("Booking request sent to tutor!");
      setShowModal(false);
      setTotalPrice(0);
      setForm({
        subject: tutor?.subjects?.[0] || "Telugu",
        date: "",
        sessionTime: "10:00",
        duration: 1,
        mode: "online"
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading tutor profile...</p>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Tutor not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate("/student/find-tutors")}
          className="text-blue-600 font-semibold text-sm mb-8 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back to Find Tutors
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Tutor Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-8">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center border-4 border-blue-400 shadow-lg flex-shrink-0 overflow-hidden">
                  {tutor.profilePicture ? (
                    <img src={tutor.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                  ) : (
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* Name */}
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
                {tutor.fullName}
              </h1>

              {/* Rating */}
              <div className="flex justify-center items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
                <span className="font-semibold text-gray-700 text-sm">
                  {reviews?.averageRating ? reviews.averageRating.toFixed(1) : "No ratings"} 
                  {reviews?.totalReviews ? ` (${reviews.totalReviews} reviews)` : " (0 reviews)"}
                </span>
              </div>

              {/* Subjects */}
              <div className="flex flex-wrap gap-2 justify-center mb-8 pb-8 border-b border-gray-200">
                {tutor.subjects && tutor.subjects.map(subject => (
                  <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                    {subject}
                  </span>
                ))}
              </div>

              {/* Details List */}
              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Experience</span>
                  <span className="font-semibold text-gray-900">{tutor.experienceYears || 5} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Price/hr</span>
                  <span className="font-semibold text-blue-600">₹{tutor.hourlyRate || 50}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Mode</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                    {tutor.teachingModes?.[0] || "Online"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Distance</span>
                  <span className="font-semibold text-gray-900">2.4 km away</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 text-sm leading-relaxed">
                {tutor.aboutMe || tutor.bio || "Experienced mathematics tutor specializing in Algebra, Calculus, and competitive exam prep. 5+ years teaching students from grade 8 to university level."}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-md p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Student Reviews</h3>
              
              {reviewsLoading ? (
                <p className="text-gray-500 text-center py-8">Loading reviews...</p>
              ) : reviews?.reviews && reviews.reviews.length > 0 ? (
                <div className="space-y-5 border-l-4 border-blue-600 pl-4">
                  {reviews.reviews.map((review, idx) => (
                    <div key={idx}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {review.student?.fullName || "Anonymous Student"}
                        </h4>
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <span key={i} className="text-gray-300">★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(review.submittedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                <span className="text-xl">📅</span>
                Book a Session
              </h2>

              <div className="space-y-6">
                {/* Session Mode */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Session Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["online", "offline"].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setForm({ ...form, mode })}
                        className={`py-3 rounded-lg font-semibold transition text-sm ${
                          form.mode === mode
                            ? mode === "online"
                              ? "bg-blue-100 text-blue-600 border-2 border-blue-400"
                              : "bg-red-100 text-red-600 border-2 border-red-400"
                            : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {mode === "online" ? "💻 Online" : "❤️ Offline"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Select Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition text-sm text-gray-700"
                    />
                    <svg className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Session Time */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Session Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={form.sessionTime}
                      onChange={(e) => setForm({ ...form, sessionTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition text-sm text-gray-700"
                    />
                    <svg className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Duration</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition text-sm text-gray-700"
                  >
                    <option value={1}>1 Hour</option>
                    <option value={2}>2 Hours</option>
                    <option value={3}>3 Hours</option>
                    <option value={4}>4 Hours</option>
                    <option value={5}>5 Hours</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition text-sm text-gray-700"
                  >
                    {tutor.subjects && tutor.subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Price Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 font-medium">Rate</span>
                    <span className="text-gray-900 font-semibold">₹{tutor.hourlyRate || 50}/hr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Estimated Total</span>
                    <span className="text-2xl font-bold text-blue-600">₹{(tutor.hourlyRate || 50) * form.duration}</span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-6 flex items-center justify-center gap-2"
                >
                  Review & Confirm Booking →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Booking Summary</h3>

            <div className="space-y-4 mb-8 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between">
                <span className="text-gray-700">Subject:</span>
                <span className="font-semibold text-gray-800">{form.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Date:</span>
                <span className="font-semibold text-gray-800">{new Date(form.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Time:</span>
                <span className="font-semibold text-gray-800">
                  {(() => {
                    const [hours, minutes] = form.sessionTime.split(':');
                    const date = new Date(0, 0, 0, parseInt(hours), parseInt(minutes));
                    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true});
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Duration:</span>
                <span className="font-semibold text-gray-800">{form.duration} hour{form.duration > 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Mode:</span>
                <span className="font-semibold text-gray-800 capitalize">{form.mode}</span>
              </div>
            </div>

            <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Rate/Hour:</span>
                <span className="font-bold text-gray-800">₹{bookingData?.ratePerHour || 0}</span>
              </div>
              <div className="border-t border-blue-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total Price:</span>
                  <span className="font-bold text-3xl text-blue-600">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600 mb-8">
              A request will be sent to the tutor. Once accepted, you can start the session.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isBooking}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? "Booking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfilePage;

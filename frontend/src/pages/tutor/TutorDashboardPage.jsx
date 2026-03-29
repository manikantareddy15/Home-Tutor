import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../store/AuthContext";
import toast from "react-hot-toast";

const TutorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    todaySessions: 0,
    totalEarnings: 0
  });
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    api.get("/bookings")
      .then((r) => {
        const bookingsData = r.data.bookings || [];
        setBookings(bookingsData);
        
        // Calculate stats
        const todaysBookings = bookingsData.filter((b) => {
          const sessionDate = b.date ? new Date(b.date).toDateString() : (b.startTime ? new Date(b.startTime).toDateString() : null);
          return sessionDate === new Date().toDateString();
        });
        
        setStats({
          totalRequests: bookingsData.filter((b) => b.status === "pending").length,
          todaySessions: todaysBookings.length,
          totalEarnings: bookingsData.reduce((a, b) => a + (b.totalPrice || 0), 0)
        });
      })
      .catch(() => {});
  }, []);

  const today = new Date().toDateString();
  const todaysBookings = bookings.filter((b) => {
    // Support both old (startTime) and new (date) formats
    const sessionDate = b.date ? new Date(b.date).toDateString() : (b.startTime ? new Date(b.startTime).toDateString() : null);
    return sessionDate === today;
  });
  const ongoing = bookings.filter((b) => b.status === "ongoing");

  const getSessionStatus = (booking) => {
    // If booking status is explicitly completed, show completed
    if (booking.status === "completed") {
      return "completed";
    }

    // Calculate session timing
    const sessionDate = booking.date ? new Date(booking.date) : (booking.startTime ? new Date(booking.startTime) : null);
    if (!sessionDate) return "pending";

    // Parse session time (HH:MM format)
    const [hours, minutes] = (booking.sessionTime || "10:00").split(':');
    const startTime = new Date(sessionDate);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate end time based on duration
    const duration = booking.duration || 1;
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + duration);

    const now = new Date();

    // Determine status based on current time
    if (now < startTime) {
      return "pending";
    } else if (now >= startTime && now < endTime) {
      return "ongoing";
    } else {
      return "completed";
    }
  };

  const handleVerifyCode = async () => {
    if (!codeInput) {
      toast.error("Please enter the code");
      return;
    }

    setVerifying(true);
    try {
      await api.post(`/bookings/${selectedBookingId}/verify-code`, {
        code: codeInput
      });
      toast.success("Session completed successfully!");
      setShowCodeModal(false);
      setCodeInput("");
      
      // Refresh bookings
      const res = await api.get("/bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  const handleMessageStudent = (studentId) => {
    navigate(`/tutor/messages?student=${studentId}`);
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 px-4 sm:px-0">
        {/* Requests Card */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md border border-blue-200 border-t-4 border-t-blue-500 p-2 sm:p-3 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Requests</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-0.5 sm:mt-1">{stats.totalRequests}</p>
              <p className="text-blue-500 text-xs mt-0.5 font-medium">Pending approval</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-1.5 sm:p-2 shadow-md transition-all duration-300 flex-shrink-0">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
              </svg>
            </div>
          </div>
          <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-blue-200">
            <p className="text-blue-600 text-xs font-semibold">Review pending requests</p>
          </div>
        </div>

        {/* Today Sessions Card */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md border border-purple-200 border-t-4 border-t-purple-500 p-2 sm:p-3 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-purple-600 text-xs font-bold uppercase tracking-wider">Today Sessions</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900 mt-0.5 sm:mt-1">{stats.todaySessions}</p>
              <p className="text-purple-500 text-xs mt-0.5 font-medium">Total sessions</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-1.5 sm:p-2 shadow-md transition-all duration-300 flex-shrink-0">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
          </div>
          <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-purple-200">
            <p className="text-purple-600 text-xs font-semibold">Keep teaching!</p>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md border border-green-200 border-t-4 border-t-green-500 p-2 sm:p-3 transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Total Earnings</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 mt-0.5 sm:mt-1">₹{stats.totalEarnings}</p>
              <p className="text-green-500 text-xs mt-0.5 font-medium">Keep it growing</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-1.5 sm:p-2 shadow-md transition-all duration-300 flex-shrink-0">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm0 2a10 10 0 100 20 10 10 0 000-20zm0 8a2 2 0 110 4 2 2 0 010-4zm0-2c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-green-200">
            <p className="text-green-600 text-xs font-semibold">↑ Earnings active</p>
          </div>
        </div>
      </div>

      {/* Today's Sessions Section */}
      <div className="mt-6 sm:mt-8 px-4 sm:px-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Today's Sessions</h3>
        {todaysBookings.length > 0 ? (
          <div className="space-y-3">
            {todaysBookings.map((b) => (
              <div
                key={b._id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{b.subject}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {b.startTime 
                        ? new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true}) 
                        : (() => {
                            if (!b.sessionTime) return 'N/A';
                            const [hours, minutes] = b.sessionTime.split(':');
                            const date = new Date(0, 0, 0, parseInt(hours), parseInt(minutes));
                            return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true});
                          })()
                      }
                      {b.duration && ` • ${b.duration} hour${b.duration > 1 ? 's' : ''}`}
                    </p>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                        {b.mode}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        getSessionStatus(b) === "completed"
                          ? "bg-green-100 text-green-700"
                          : getSessionStatus(b) === "ongoing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {getSessionStatus(b) === "completed" ? "Completed" : getSessionStatus(b) === "ongoing" ? "Ongoing" : "Not Started"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getSessionStatus(b) !== "completed" && (
                      <button
                        onClick={() => {
                          setSelectedBookingId(b._id);
                          setCodeInput("");
                          setShowCodeModal(true);
                        }}
                        disabled={getSessionStatus(b) !== "ongoing"}
                        className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-shrink-0 ${
                          getSessionStatus(b) === "ongoing"
                            ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                        }`}
                      >
                        Code
                      </button>
                    )}
                    {b.student?._id && (
                      <button
                        onClick={() => handleMessageStudent(b.student._id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex-shrink-0 flex items-center gap-1"
                      >
                        💬 Message
                      </button>
                    )}
                    {b.mode === "online" && getSessionStatus(b) === "ongoing" && (
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex-shrink-0">
                        JOIN
                      </button>
                    )}
                  </div>
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

      {/* Code Verification Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Verify Session Code</h3>
            <p className="text-gray-600 text-sm mb-6">Enter the 4-digit code from the student to complete the session:</p>
            
            <input
              type="text"
              maxLength="4"
              placeholder="0000"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-3xl font-bold tracking-widest focus:outline-none focus:border-purple-400 transition mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCodeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={verifying || codeInput.length !== 4}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboardPage;

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
    totalSessions: 0,
    totalEarnings: 0,
    teachingHours: 0
  });
  const [monthlyChanges, setMonthlyChanges] = useState({
    sessions: null,
    earnings: null,
    hours: null
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalSessions: 0,
    totalEarnings: 0,
    teachingHours: 0
  });
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Fetch bookings and stats
  const fetchBookings = () => {
    api.get("/bookings")
      .then((r) => {
        const bookingsData = r.data.bookings || [];
        setBookings(bookingsData);

        // Compute current month vs last month stats
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const thisMonth = bookingsData.filter(b => {
          const d = new Date(b.createdAt || b.date || b.startTime);
          return d >= thisMonthStart;
        });
        const lastMonth = bookingsData.filter(b => {
          const d = new Date(b.createdAt || b.date || b.startTime);
          return d >= lastMonthStart && d <= lastMonthEnd;
        });

        const calcChange = (curr, prev) => {
          if (prev === 0) return curr > 0 ? 100 : null;
          return Math.round(((curr - prev) / prev) * 100);
        };

        const thisSessions = thisMonth.length;
        const lastSessions = lastMonth.length;
        const thisEarnings = thisMonth.filter(b => b.status === 'completed').reduce((a, b) => a + (b.totalPrice || 0), 0);
        const lastEarnings = lastMonth.filter(b => b.status === 'completed').reduce((a, b) => a + (b.totalPrice || 0), 0);
        const thisHours = thisMonth.reduce((a, b) => a + (b.duration || 1), 0);
        const lastHours = lastMonth.reduce((a, b) => a + (b.duration || 1), 0);

        setMonthlyChanges({
          sessions: calcChange(thisSessions, lastSessions),
          earnings: calcChange(thisEarnings, lastEarnings),
          hours: calcChange(thisHours, lastHours)
        });

        // Total Earnings = only completed sessions
        const completedBookings = bookingsData.filter(b => b.status === 'completed');
        const totalEarningsCalc = completedBookings.reduce((a, b) => a + (Number(b.totalPrice) || 0), 0);

        setStats({
          totalSessions: bookingsData.length,
          totalEarnings: totalEarningsCalc,
          teachingHours: bookingsData.reduce((a, b) => a + (b.duration || 1), 0)
        });
      })
      .catch(() => { });
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 15000);
    const onFocus = () => fetchBookings();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Animate stats numbers on load
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
    const animateStats = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      setAnimatedStats({
        totalSessions: Math.floor(stats.totalSessions * eased),
        totalEarnings: stats.totalEarnings * eased,
        teachingHours: Math.floor(stats.teachingHours * eased)
      });
      if (progress < 1) {
        requestAnimationFrame(animateStats);
      }
    };
    animateStats();
  }, [stats]);

  const today = new Date().toDateString();
  const todaySessions = bookings.filter((b) => {
    const sessionDate = b.date ? new Date(b.date).toDateString() : (b.startTime ? new Date(b.startTime).toDateString() : null);
    return sessionDate === today && b.status === "confirmed";
  });
  const upcomingSessions = bookings.filter((b) => {
    const sessionDate = b.date ? new Date(b.date) : (b.startTime ? new Date(b.startTime) : null);
    return sessionDate && sessionDate > new Date();
  }).slice(0, 5);

  const getSessionStatus = (booking) => {
    if (booking.status === "completed") return "completed";
    
    // Check for "not attended" status - confirmed but OTP not verified and session time passed
    if (booking.status === "confirmed") {
      const sessionDate = booking.date ? new Date(booking.date) : (booking.startTime ? new Date(booking.startTime) : null);
      if (sessionDate) {
        const [hours, minutes] = (booking.sessionTime || "10:00").split(":");
        const startTime = new Date(sessionDate);
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const duration = booking.duration || 1;
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + duration);
        const now = new Date();
        
        // If session time has passed and OTP is not verified, mark as not attended
        if (now > endTime && !booking.otp) {
          return "not attended";
        }
      }
    }
    
    const sessionDate = booking.date ? new Date(booking.date) : (booking.startTime ? new Date(booking.startTime) : null);
    if (!sessionDate) return "pending";
    const [hours, minutes] = (booking.sessionTime || "10:00").split(":");
    const startTime = new Date(sessionDate);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const duration = booking.duration || 1;
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + duration);
    const now = new Date();
    if (now < startTime) return "pending";
    else if (now >= startTime && now < endTime) return "ongoing";
    else return "completed";
  };

  const handleVerifyCode = async () => {
    if (!codeInput) {
      toast.error("Please enter the code");
      return;
    }
    setVerifying(true);
    try {
      await api.post(`/bookings/${selectedBookingId}/verify-code`, { code: codeInput });
      toast.success("Session completed successfully!");
      setShowCodeModal(false);
      setCodeInput("");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  const handleMessageStudent = (studentId) => {
    navigate(`/tutor/messages?student=${studentId}`);
  };

  // Helper to render the monthly change badge
  const renderChange = (value, colorUp, colorDown) => {
    if (value === null || value === undefined) return <span className={`text-xs font-semibold ${colorUp}`}>— no prior data</span>;
    if (value >= 0) return <span className={`text-xs font-semibold ${colorUp}`}>↑ {value}% from last month</span>;
    return <span className={`text-xs font-semibold ${colorDown}`}>↓ {Math.abs(value)}% from last month</span>;
  };

  return (
    <div>
      {/* Animations */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stat-card { animation: slideInUp 0.6s ease-out forwards; opacity: 0; }
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-number { transition: all 0.3s ease-in-out; }
      `}</style>

      {/* Unified width wrapper */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.fullName}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Here's your teaching overview</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Sessions Card */}
          <div className="stat-card bg-white rounded-xl shadow-md hover:shadow-lg border border-blue-200 border-t-4 border-t-blue-500 p-4 sm:p-5 transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Total Sessions</p>
              <p className="stat-number text-3xl sm:text-4xl font-bold text-blue-900 mt-2 sm:mt-3">{animatedStats.totalSessions}</p>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
              {renderChange(monthlyChanges.sessions, "text-blue-600", "text-red-500")}
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="stat-card bg-white rounded-xl shadow-md hover:shadow-lg border border-green-200 border-t-4 border-t-green-500 p-4 sm:p-5 transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div>
              <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Total Earnings</p>
              <p className="stat-number text-3xl sm:text-4xl font-bold text-green-900 mt-2 sm:mt-3">₹{(animatedStats.totalEarnings).toFixed(0)}</p>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-200">
              {renderChange(monthlyChanges.earnings, "text-green-600", "text-red-500")}
            </div>
          </div>

          {/* Teaching Hours Card */}
          <div className="stat-card bg-white rounded-xl shadow-md hover:shadow-lg border border-yellow-200 border-t-4 border-t-yellow-500 p-4 sm:p-5 transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div>
              <p className="text-yellow-600 text-xs font-bold uppercase tracking-wider">Teaching Hours</p>
              <p className="stat-number text-3xl sm:text-4xl font-bold text-yellow-900 mt-2 sm:mt-3">{animatedStats.teachingHours}</p>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-yellow-200">
              {renderChange(monthlyChanges.hours, "text-yellow-600", "text-red-500")}
            </div>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Today's Sessions</h3>
          {todaySessions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {todaySessions.map((b) => (
                <div
                  key={b._id}
                  className="bg-gradient-to-br from-slate-50 to-white border-2 border-blue-300 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-400"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4 justify-between">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg flex-shrink-0 overflow-hidden">
                        {b.student?.profilePicture ? (
                          <img src={b.student.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                        ) : (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-semibold truncate text-sm sm:text-base">{b.student?.fullName}</p>
                        <p className="text-blue-600 text-xs font-medium">{b.subject || "Subject"}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getSessionStatus(b) === "completed"
                        ? "bg-green-100 text-green-700"
                        : getSessionStatus(b) === "ongoing"
                          ? "bg-blue-100 text-blue-700"
                          : getSessionStatus(b) === "not attended"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {getSessionStatus(b) === "completed" ? "Completed" : getSessionStatus(b) === "ongoing" ? "Ongoing" : getSessionStatus(b) === "not attended" ? "Not Attended" : "Not Started"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 my-3"></div>
                  <div className="mb-3 sm:mb-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-semibold uppercase">Starting Time:</span>
                        <span className="text-sm sm:text-base font-bold text-blue-600">
                          {b.startTime
                            ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                            : (() => {
                              if (!b.sessionTime) return 'TBD';
                              const [hours, minutes] = b.sessionTime.split(':');
                              const date = new Date(0, 0, 0, parseInt(hours), parseInt(minutes));
                              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                            })()
                          }
                        </span>
                      </div>
                      {(b.startTime || b.sessionTime) && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <span className="text-gray-400">Duration:</span>
                          <span>{b.duration || 1} hour{b.duration > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      b.mode === 'online'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        b.mode === 'online' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></span>
                      {b.mode || 'Mode'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-gray-200">
                    <p className="text-green-600 font-bold text-base sm:text-lg">₹{b.totalPrice}</p>
                    <div className="flex gap-2 w-full sm:w-auto">
                      {getSessionStatus(b) !== "completed" && (
                        <button
                          onClick={() => {
                            setSelectedBookingId(b._id);
                            setCodeInput("");
                            setShowCodeModal(true);
                          }}
                          disabled={getSessionStatus(b) !== "ongoing"}
                          className={`flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${getSessionStatus(b) === "ongoing"
                            ? "bg-purple-500 text-white hover:bg-purple-600 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                            }`}
                        >
                          Code
                        </button>
                      )}
                      {b.student?._id && (
                        <button
                          onClick={() => handleMessageStudent(b.student._id)}
                          className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition bg-blue-500 text-white hover:bg-blue-600"
                        >
                          Message
                        </button>
                      )}
                      {b.mode === "online" && getSessionStatus(b) === "ongoing" && (
                        <button className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-green-600 transition">
                          JOIN SESSION
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No sessions scheduled for today</p>
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Upcoming Sessions</h3>
          {
          upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((b) => (
                <div
                  key={b._id}
                  className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 sm:p-5 border-l-4 border-l-blue-500 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg flex-shrink-0 overflow-hidden">
                    {b.student?.profilePicture ? (
                      <img src={b.student.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                    ) : (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-2">
                      <p className="text-gray-800 font-semibold text-sm sm:text-base truncate">{b.student?.fullName}</p>
                      <span className="text-xs text-gray-500 font-medium truncate">{b.subject || "Subject"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
                      <span className="font-medium">{b.date ? new Date(b.date).toLocaleDateString() : (b.startTime ? new Date(b.startTime).toLocaleDateString() : "Date")}</span>
                      <span className="hidden sm:inline text-gray-400">•</span>
                      <span className="font-medium">{b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Time"}</span>
                      <span className="hidden sm:inline text-gray-400">•</span>
                      <span className="capitalize text-blue-600 font-medium">{b.mode || "Mode"}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0 sm:ml-auto w-full sm:w-auto">
                    <p className="text-green-600 font-bold text-base sm:text-lg">₹{b.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No upcoming sessions</p>
            </div>
          )
          }
        </div>
      </div>

      {/* Code Verification Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
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

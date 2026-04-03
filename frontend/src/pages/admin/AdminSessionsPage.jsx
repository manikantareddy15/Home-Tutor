import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminSessionsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    api.get("/bookings").then((r) => setBookings(r.data.bookings));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Sessions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((session) => (
          <div
            key={session._id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                <svg className="w-7 h-7 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-800 truncate">{session.subject}</div>
                <div className="text-xs text-gray-500">{session.mode}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {session.status}
              </span>
              {session.price && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  ₹{session.price}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <span className="text-gray-600">Student:</span>
              <span className="text-gray-800 font-semibold">{session.student?.fullName || session.studentName || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <span className="text-gray-600">Tutor:</span>
              <span className="text-gray-800 font-semibold">{session.tutor?.fullName || session.tutorName || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Date:</span>
              <span>{session.date ? new Date(session.date).toLocaleDateString() : "-"}</span>
              <span className="ml-2">Time:</span>
              <span>{session.time || "-"}</span>
            </div>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => setSelectedSession(session)}
                className="flex-1 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      {bookings.length === 0 && (
        <div className="text-center text-gray-500 py-16">No sessions found.</div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 rounded-t-2xl border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedSession.subject || "Session"}</h3>
                  <p className="text-sm text-gray-500 mt-1">Session Details</p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600 transition p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Status Badge */}
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${selectedSession.status === "completed" ? "bg-green-100 text-green-700" :
                  selectedSession.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                    selectedSession.status === "ongoing" ? "bg-emerald-100 text-emerald-700" :
                      selectedSession.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        selectedSession.status === "cancelled" ? "bg-red-100 text-red-700" :
                          selectedSession.status === "not_attended" ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-700"
                }`}>
                {selectedSession.status?.replace(/_/g, " ") || "Unknown"}
              </span>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Student & Tutor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Student</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {selectedSession.student?.profilePicture ? (
                        <img src={selectedSession.student.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{selectedSession.student?.fullName || "-"}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedSession.student?.email || ""}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Tutor</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {selectedSession.tutor?.profilePicture ? (
                        <img src={selectedSession.tutor.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{selectedSession.tutor?.fullName || "-"}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedSession.tutor?.email || ""}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Subject</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedSession.subject || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Mode</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{selectedSession.mode || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedSession.date ? new Date(selectedSession.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Time</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedSession.sessionTime || selectedSession.time || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Duration</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedSession.duration ? `${selectedSession.duration} hr${selectedSession.duration > 1 ? "s" : ""}` : "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Hourly Rate</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedSession.hourlyRate ? `₹${selectedSession.hourlyRate}` : "-"}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Total Price</p>
                  <p className="text-2xl font-bold text-green-700">
                    {selectedSession.totalPrice != null ? `₹${(selectedSession.totalPrice / 100).toFixed(2)}` : selectedSession.price ? `₹${selectedSession.price}` : "-"}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${selectedSession.status === "completed" ? "bg-green-200 text-green-800" :
                    selectedSession.status === "confirmed" ? "bg-blue-200 text-blue-800" :
                      "bg-gray-200 text-gray-700"
                  }`}>
                  {selectedSession.status?.replace(/_/g, " ") || "Unknown"}
                </span>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Created: </span>
                  {selectedSession.createdAt ? new Date(selectedSession.createdAt).toLocaleString() : "-"}
                </div>
                <div>
                  <span className="font-medium">Updated: </span>
                  {selectedSession.updatedAt ? new Date(selectedSession.updatedAt).toLocaleString() : "-"}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setSelectedSession(null)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSessionsPage;

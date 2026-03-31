import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminSessionsPage = () => {
  const [bookings, setBookings] = useState([]);
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
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
                className="flex-1 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold transition"
                title="View Details (not implemented)"
                disabled
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
    </div>
  );
};
export default AdminSessionsPage;

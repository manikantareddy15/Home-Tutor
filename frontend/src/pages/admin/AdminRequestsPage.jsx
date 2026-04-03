import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    api.get("/admin/requests").then((r) => setRequests(r.data.requests || []));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student-Tutor Requests</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div
            key={req._id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                <svg className="w-7 h-7 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-800 truncate">{req.student?.fullName || req.studentName || "-"}</div>
                <div className="text-xs text-gray-500">Student</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <span className="text-gray-600">Requested Tutor:</span>
              <span className="text-gray-800 font-semibold">{req.tutor?.fullName || req.tutorName || "-"}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {req.subject || "-"}
              </span>
              {req.status && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${req.status === "pending" ? "bg-yellow-100 text-yellow-700" : req.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Date:</span>
              <span>{req.date ? new Date(req.date).toLocaleDateString() : "-"}</span>
              <span className="ml-2">Time:</span>
              <span>{req.time || "-"}</span>
            </div>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => setSelectedRequest(req)}
                className="flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      {requests.length === 0 && (
        <div className="text-center text-gray-500 py-16">No requests found.</div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 rounded-t-2xl border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Request Details</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedRequest.subject || "Session Request"}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 transition p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Status Badge */}
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${selectedRequest.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  selectedRequest.status === "accepted" || selectedRequest.status === "confirmed" ? "bg-green-100 text-green-700" :
                    selectedRequest.status === "rejected" || selectedRequest.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                }`}>
                {selectedRequest.status || "Unknown"}
              </span>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Student & Tutor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Student</p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {selectedRequest.student?.profilePicture ? (
                        <img src={selectedRequest.student.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{selectedRequest.student?.fullName || "-"}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedRequest.student?.email || ""}</p>
                    </div>
                  </div>
                  {selectedRequest.student?.class && (
                    <p className="text-xs text-gray-500 mt-2">Class: <span className="font-medium text-gray-700">{selectedRequest.student.class}</span></p>
                  )}
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Tutor</p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {selectedRequest.tutor?.profilePicture ? (
                        <img src={selectedRequest.tutor.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{selectedRequest.tutor?.fullName || "-"}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedRequest.tutor?.email || ""}</p>
                    </div>
                  </div>
                  {selectedRequest.tutor?.subjects?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">Subjects: <span className="font-medium text-gray-700">{selectedRequest.tutor.subjects.join(", ")}</span></p>
                  )}
                </div>
              </div>

              {/* Request Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Subject</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedRequest.subject || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Mode</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{selectedRequest.mode || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedRequest.date ? new Date(selectedRequest.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Time</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedRequest.sessionTime || selectedRequest.time || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Duration</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedRequest.duration ? `${selectedRequest.duration} hr${selectedRequest.duration > 1 ? "s" : ""}` : "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Hourly Rate</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedRequest.hourlyRate ? `₹${selectedRequest.hourlyRate}` : "-"}</p>
                </div>
              </div>

              {/* Pricing */}
              {(selectedRequest.totalPrice != null || selectedRequest.price) && (
                <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Total Price</p>
                    <p className="text-2xl font-bold text-green-700">
                      {selectedRequest.totalPrice != null ? `₹${(selectedRequest.totalPrice / 100).toFixed(2)}` : `₹${selectedRequest.price}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Created: </span>
                  {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "-"}
                </div>
                <div>
                  <span className="font-medium">Updated: </span>
                  {selectedRequest.updatedAt ? new Date(selectedRequest.updatedAt).toLocaleString() : "-"}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setSelectedRequest(null)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;

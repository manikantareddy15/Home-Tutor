import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminStudentsPage = () => {
  const [list, setList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBookings, setStudentBookings] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    api.get("/admin/students").then((r) => setList(r.data.students));
  }, []);

  const openDetails = async (student) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    try {
      const res = await api.get("/bookings", { params: { student: student._id } });
      const bookings = (res.data.bookings || []).filter(
        (b) => String(b.student?._id) === String(student._id)
      );
      setStudentBookings(bookings);
    } catch {
      setStudentBookings([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedStudent(null);
    setStudentBookings([]);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Students</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((student) => (
          <div
            key={student._id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {student.profilePicture ? (
                  <img
                    src={student.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-800 truncate">{student.fullName}</div>
                <div className="text-xs text-gray-500">{student.email}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {student.class ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Class: {student.class}
                </span>
              ) : (
                <span className="text-xs text-gray-400">No class info</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <span className="text-gray-600">Joined:</span>
              <span className="text-gray-800 font-semibold">{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "-"}</span>
            </div>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => openDetails(student)}
                className="flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && (
        <div className="text-center text-gray-500 py-16">No students found.</div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closeDetails}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 rounded-t-2xl border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shadow-md">
                    {selectedStudent.profilePicture ? (
                      <img src={selectedStudent.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-9 h-9 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedStudent.fullName}</h3>
                    <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                  </div>
                </div>
                <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600 transition p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Class</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedStudent.class || "Not specified"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${selectedStudent.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {selectedStudent.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Joined</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Subjects</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedStudent.subjects?.length > 0 ? selectedStudent.subjects.join(", ") : "None"}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {selectedStudent.bio && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Bio</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedStudent.bio}</p>
                </div>
              )}

              {/* Bookings Section */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">Booking History</p>
                {loadingDetails ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : studentBookings.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {studentBookings.map((b) => (
                      <div key={b._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{b.subject || "Session"}</p>
                          <p className="text-xs text-gray-500">
                            with {b.tutor?.fullName || "Tutor"} • {b.mode || ""}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ml-2 capitalize ${b.status === "completed" ? "bg-green-100 text-green-700" :
                            b.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                              b.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                b.status === "cancelled" ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                          }`}>
                          {b.status || "Unknown"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-3">No bookings found</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={closeDetails} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminStudentsPage;

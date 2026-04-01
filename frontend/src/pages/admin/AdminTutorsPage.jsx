import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AdminTutorsPage = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/tutors").then((r) => setList(r.data.tutors));
  }, []);

  const handleViewDetails = (tutorId) => {
    navigate(`/admin/tutors/${tutorId}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Tutors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((tutor) => (
          <div
            key={tutor._id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                {tutor.profilePicture ? (
                  <img
                    src={tutor.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-800 truncate">{tutor.fullName}</div>
                <div className="text-xs text-gray-500">{tutor.email}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tutor.subjects && tutor.subjects.length > 0 ? (
                tutor.subjects.slice(0, 3).map((subject) => (
                  <span
                    key={subject}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                  >
                    {subject}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No subjects</span>
              )}
              {tutor.subjects && tutor.subjects.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  +{tutor.subjects.length - 3} more
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <span className={`font-semibold ${tutor.isApproved ? "text-green-600" : "text-yellow-600"}`}>
                {tutor.isApproved ? "Approved" : "Pending"}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{tutor.experienceYears || 0} yrs exp</span>
              <span className="text-gray-400">•</span>
              <span className="text-green-700 font-semibold">₹{tutor.hourlyRate || 0}/hr</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Joined: {tutor.createdAt ? new Date(tutor.createdAt).toLocaleDateString() : "-"}
            </div>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => handleViewDetails(tutor._id)}
                className="flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition"
              >
                View Details
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${tutor.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                disabled
              >
                {tutor.isApproved ? "Approved" : "Pending"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && (
        <div className="text-center text-gray-500 py-16">No tutors found.</div>
      )}
    </div>
  );
};
export default AdminTutorsPage;

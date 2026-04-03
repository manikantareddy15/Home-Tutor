import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminTutorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/tutors/${id}`);
        setTutor(res.data.tutor);
        setCompletedSessions(res.data.completedSessions || 0);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load tutor details");
        setTimeout(() => navigate("/admin/tutors"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading tutor details...</p>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Tutor not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/tutors")}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition"
      >
        <span>←</span> Back to Tutors
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden shadow-lg">
              {tutor.profilePicture ? (
                <img
                  src={tutor.profilePicture}
                  alt={tutor.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-16 h-16 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            {/* Status Badge */}
            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${tutor.isApproved
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
              }`}>
              {tutor.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
            </span>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{tutor.fullName}</h1>
            <p className="text-gray-600 text-lg mb-4">{tutor.email}</p>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Experience */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Experience</p>
                <p className="text-2xl font-bold text-blue-600">{tutor.experienceYears || 0} <span className="text-lg">yrs</span></p>
              </div>

              {/* Completed Sessions */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Sessions</p>
                <p className="text-2xl font-bold text-purple-600">{completedSessions}</p>
              </div>

              {/* Rating */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-600">{(tutor.rating || 0).toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < Math.round(tutor.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Hourly Rate</p>
                <p className="text-2xl font-bold text-green-600">₹{tutor.hourlyRate || 0}<span className="text-lg">/hr</span></p>
              </div>
            </div>

            {/* Contact & Join Info */}
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Email:</strong> {tutor.email || "Not provided"}</p>
              <p><strong>Joined:</strong> {tutor.createdAt ? new Date(tutor.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {(tutor.aboutMe || tutor.bio) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 text-lg leading-relaxed">{tutor.aboutMe || tutor.bio}</p>
        </div>
      )}

      {/* Subjects Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Subjects</h2>
        {tutor.subjects && tutor.subjects.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {tutor.subjects.map((subject) => (
              <span
                key={subject}
                className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg text-base"
              >
                {subject}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-lg">No subjects listed</p>
        )}
      </div>

      {/* Class & Teaching Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teaching Modes */}
        {tutor.teachingModes && tutor.teachingModes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Teaching Modes</h2>
            <div className="flex flex-wrap gap-2">
              {tutor.teachingModes.map((mode) => (
                <span
                  key={mode}
                  className="px-3 py-1 bg-purple-100 text-purple-700 font-medium rounded-lg text-sm"
                >
                  {mode}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
          <div className="space-y-2">
            {tutor.cert11th && <p className="text-gray-700 text-base">→ 11th Grade Certified</p>}
            {tutor.cert12th && <p className="text-gray-700 text-base">→ 12th Grade Certified</p>}
            {tutor.certGraduation && <p className="text-gray-700 text-base">→ Graduation Certified</p>}
            {!tutor.cert11th && !tutor.cert12th && !tutor.certGraduation && (
              <p className="text-gray-500">No certifications uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Account Status</p>
            <p className={`font-semibold ${tutor.isActive ? "text-green-600" : "text-red-600"}`}>
              {tutor.isActive ? "✓ Active" : "✗ Inactive"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Email Verified</p>
            <p className="text-green-600 font-semibold">✓ Yes</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Class Teaching</p>
            <p className="text-gray-900 font-semibold">{tutor.class || "Not specified"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTutorDetailsPage;

import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminApprovalsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingTutors();
  }, []);

  const loadPendingTutors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pending-tutors");
      setTutors(res.data.pendingTutors || []);
    } catch (err) {
      console.error("Error loading tutors:", err);
      toast.error("Failed to load pending tutors");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tutorId) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/tutors/${tutorId}/approve`, { approved: true });
      toast.success("Tutor approved successfully!");
      loadPendingTutors();
      if (selectedTutor?._id === tutorId) {
        setShowDocsModal(false);
        setSelectedTutor(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve tutor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (tutorId) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/tutors/${tutorId}/approve`, { approved: false });
      toast.success("Tutor rejected successfully!");
      loadPendingTutors();
      if (selectedTutor?._id === tutorId) {
        setShowDocsModal(false);
        setSelectedTutor(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject tutor");
    } finally {
      setActionLoading(false);
    }
  };

  const viewDocuments = (tutor) => {
    setSelectedTutor(tutor);
    setShowDocsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading approvals...</p>
      </div>
    );
  }

  if (tutors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Approvals Yet</h3>
        <p className="text-gray-500">All pending tutor applications have been reviewed</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Tutor Approvals</h2>
        <p className="text-sm sm:text-base text-gray-600">Review and approve pending tutor applications</p>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Applicant Name</th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Subjects</th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Experience</th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Price/Hr</th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Documents</th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Applied Date</th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tutors.map((tutor) => (
                <tr key={tutor._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  {/* Name */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-xs">
                          {tutor.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 truncate">{tutor.fullName}</span>
                    </div>
                  </td>

                  {/* Subjects */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {tutor.subjects && tutor.subjects.slice(0, 2).map((subject) => (
                        <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {subject}
                        </span>
                      ))}
                      {tutor.subjects && tutor.subjects.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          +{tutor.subjects.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Experience */}
                  <td className="px-4 sm:px-6 py-4">
                    <span className="font-medium text-gray-800">{tutor.experienceYears || 0} yrs</span>
                  </td>

                  {/* Price */}
                  <td className="px-4 sm:px-6 py-4">
                    <span className="font-semibold text-green-600">₹{tutor.hourlyRate || 0}/hr</span>
                  </td>

                  {/* View Documents Button */}
                  <td className="px-4 sm:px-6 py-4">
                    <button
                      onClick={() => viewDocuments(tutor)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </td>

                  {/* Applied Date */}
                  <td className="px-4 sm:px-6 py-4">
                    <span className="text-gray-600 text-xs">
                      {new Date(tutor.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleApprove(tutor._id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xs font-semibold rounded transition flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(tutor._id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-xs font-semibold rounded transition flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Modal */}
      {showDocsModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedTutor.fullName}</h3>
                <p className="text-sm text-gray-500">Application Documents</p>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Application Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{selectedTutor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applied Date</p>
                  <p className="font-medium text-gray-800">{new Date(selectedTutor.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-medium text-gray-800">{selectedTutor.experienceYears || 0} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                  <p className="font-medium text-gray-800">₹{selectedTutor.hourlyRate || 0}/hr</p>
                </div>
              </div>

              <hr className="my-4" />

              {/* Documents Section */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Certificates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 11th Certificate */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">11th Certificate</p>
                    {selectedTutor.cert11th ? (
                      <div className="space-y-2">
                        <div className="bg-gray-100 rounded p-3 text-center">
                          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-600">Document</p>
                        </div>
                        <a
                          href={`http://localhost:5000/${selectedTutor.cert11th}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-3 py-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded hover:bg-blue-200 transition text-center"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-4 text-center">Not uploaded</p>
                    )}
                  </div>

                  {/* 12th Certificate */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">12th Certificate</p>
                    {selectedTutor.cert12th ? (
                      <div className="space-y-2">
                        <div className="bg-gray-100 rounded p-3 text-center">
                          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-600">Document</p>
                        </div>
                        <a
                          href={`http://localhost:5000/${selectedTutor.cert12th}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-3 py-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded hover:bg-blue-200 transition text-center"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-4 text-center">Not uploaded</p>
                    )}
                  </div>

                  {/* Graduation Certificate */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Graduation Certificate</p>
                    {selectedTutor.certGraduation ? (
                      <div className="space-y-2">
                        <div className="bg-gray-100 rounded p-3 text-center">
                          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-600">Document</p>
                        </div>
                        <a
                          href={`http://localhost:5000/${selectedTutor.certGraduation}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-3 py-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded hover:bg-blue-200 transition text-center"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-4 text-center">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowDocsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleApprove(selectedTutor._id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept Tutor
              </button>
              <button
                onClick={() => handleReject(selectedTutor._id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Tutor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalsPage;

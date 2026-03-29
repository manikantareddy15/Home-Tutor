import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const StudentProfilePage = () => {
  const { user, logout } = useAuth();
  const [editingFields, setEditingFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
    grade: user?.grade || "",
    location: user?.location || ""
  });

  const toggleEditField = (fieldName) => {
    setEditingFields({
      ...editingFields,
      [fieldName]: !editingFields[fieldName]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const isAnyFieldEditing = Object.values(editingFields).some((val) => val);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        fullName: form.fullName,
        email: form.email,
        grade: form.grade,
        location: form.location
      };

      if (form.password) {
        updateData.password = form.password;
      }

      await api.put("/profile", updateData);
      toast.success("Profile updated successfully!");
      setEditingFields({});
      setForm({ ...form, password: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            My Profile
          </h2>
          <p className="text-gray-600">Manage your profile information and learning preferences</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <div className="space-y-8">
            
            {/* Personal Information Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Personal Information
              </h3>
              
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleInputChange}
                      disabled={!editingFields.fullName}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingFields.fullName
                          ? "border-blue-400 bg-white"
                          : "border-gray-300 bg-gray-50 cursor-not-allowed"
                      }`}
                    />
                    <button
                      onClick={() => toggleEditField("fullName")}
                      className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                      title="Edit Full Name"
                    >
                      ✏️
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      disabled={!editingFields.email}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingFields.email
                          ? "border-blue-400 bg-white"
                          : "border-gray-300 bg-gray-50 cursor-not-allowed"
                      }`}
                    />
                    <button
                      onClick={() => toggleEditField("email")}
                      className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                      title="Edit Email"
                    >
                      ✏️
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Change Password
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      name="password"
                      placeholder="Leave empty to keep current password"
                      value={form.password}
                      onChange={handleInputChange}
                      disabled={!editingFields.password}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingFields.password
                          ? "border-blue-400 bg-white"
                          : "border-gray-300 bg-gray-50 cursor-not-allowed"
                      }`}
                    />
                    <button
                      onClick={() => toggleEditField("password")}
                      className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                      title="Edit Password"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Information Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Learning Information
              </h3>
              
              <div className="space-y-5">
                {/* Grade */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade / Level
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      name="grade"
                      placeholder="e.g., 10th, 12th, Graduation"
                      value={form.grade}
                      onChange={handleInputChange}
                      disabled={!editingFields.grade}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingFields.grade
                          ? "border-blue-400 bg-white"
                          : "border-gray-300 bg-gray-50 cursor-not-allowed"
                      }`}
                    />
                    <button
                      onClick={() => toggleEditField("grade")}
                      className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                      title="Edit Grade"
                    >
                      ✏️
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      name="location"
                      placeholder="Your city or area"
                      value={form.location}
                      onChange={handleInputChange}
                      disabled={!editingFields.location}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingFields.location
                          ? "border-blue-400 bg-white"
                          : "border-gray-300 bg-gray-50 cursor-not-allowed"
                      }`}
                    />
                    <button
                      onClick={() => toggleEditField("location")}
                      className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                      title="Edit Location"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                Account Information
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Account Type:</strong> Student
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Email:</strong> {form.email}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => {
                setEditingFields({});
                setForm({
                  fullName: user?.fullName || "",
                  email: user?.email || "",
                  password: "",
                  grade: user?.grade || "",
                  location: user?.location || ""
                });
              }}
              disabled={!isAnyFieldEditing}
              className={`flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg transition ${
                isAnyFieldEditing
                  ? "hover:bg-gray-50 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !isAnyFieldEditing}
              className={`flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                !loading && isAnyFieldEditing
                  ? "hover:bg-blue-700 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

          {!isAnyFieldEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm">Click the edit icon on any field to make changes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;

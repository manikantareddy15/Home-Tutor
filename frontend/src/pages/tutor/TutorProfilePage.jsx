import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const TutorProfilePage = () => {
  const { user, logout } = useAuth();
  const [editingFields, setEditingFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
    aboutMe: user?.aboutMe || "",
    subjects: user?.subjects || []
  });

  const subjectOptions = ["Telugu", "Hindi", "English", "Maths"];

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

  const handleSubjectToggle = (subject) => {
    setForm({
      ...form,
      subjects: form.subjects.includes(subject)
        ? form.subjects.filter((s) => s !== subject)
        : [...form.subjects, subject]
    });
  };

  const isAnyFieldEditing = Object.values(editingFields).some((val) => val);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        fullName: form.fullName,
        email: form.email,
        aboutMe: form.aboutMe,
        subjects: form.subjects
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            My Profile
          </h2>
          <p className="text-gray-600">Manage your profile information and teaching details</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
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
                    Password
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      placeholder={editingFields.password ? "Enter new password (optional)" : "••••••••"}
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

            {/* About Me Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                About Me
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <div className="flex gap-3">
                  <textarea
                    name="aboutMe"
                    value={form.aboutMe}
                    onChange={handleInputChange}
                    disabled={!editingFields.aboutMe}
                    placeholder="Tell students about your teaching style, experience, and background..."
                    rows="5"
                    className={`flex-1 px-4 py-3 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                      editingFields.aboutMe
                        ? "border-green-400 bg-white"
                        : "border-gray-300 bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  <button
                    onClick={() => toggleEditField("aboutMe")}
                    className="p-3 h-fit bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition"
                    title="Edit About Me"
                  >
                    ✏️
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {form.aboutMe.length}/500 characters
                </p>
              </div>
            </div>

            {/* Subjects Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Subjects
              </h3>
              
              <div className="space-y-3">
                {subjectOptions.map((subject) => (
                  <label
                    key={subject}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                      form.subjects.includes(subject)
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    } ${!editingFields.subjects ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.subjects.includes(subject)}
                      onChange={() => editingFields.subjects && handleSubjectToggle(subject)}
                      disabled={!editingFields.subjects}
                      className="w-5 h-5 text-orange-600 rounded cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>

              {!editingFields.subjects && (
                <button
                  onClick={() => toggleEditField("subjects")}
                  className="mt-4 w-full py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition font-semibold flex items-center justify-center gap-2"
                >
                  ✏️ Edit Subjects
                </button>
              )}
            </div>

            {/* Save Button - Below All Fields */}
            {isAnyFieldEditing && (
              <div className="border-t border-gray-200 pt-8 flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setEditingFields({});
                    setForm({
                      fullName: user?.fullName || "",
                      email: user?.email || "",
                      password: "",
                      aboutMe: user?.aboutMe || "",
                      subjects: user?.subjects || []
                    });
                  }}
                  className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfilePage;

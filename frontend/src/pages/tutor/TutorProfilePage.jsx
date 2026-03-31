import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const TutorProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const [editingFields, setEditingFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
    aboutMe: user?.aboutMe || "",
    subjects: user?.subjects || []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [removePicture, setRemovePicture] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profilePicture || "");
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRemovePicture(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const isAnyFieldEditing = Object.values(editingFields).some((val) => val) || !!selectedFile || removePicture;

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("aboutMe", form.aboutMe);
      if (form.subjects) {
        formData.append("subjects", JSON.stringify(form.subjects));
      }
      if (form.password) {
        formData.append("password", form.password);
      }
      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }
      if (removePicture) {
        formData.append("removeProfilePicture", "true");
      }
      const { data } = await api.put("/auth/profile", formData);
      if (data.user) {
        updateUser(data.user);
      }
      toast.success("Profile updated successfully!");
      setEditingFields({});
      setSelectedFile(null);
      setRemovePicture(false);
      setForm({ ...form, password: "" });
      if (data.user?.profilePicture) {
        setPreviewImage(data.user.profilePicture);
      }
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
            
            {/* Profile Picture Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Profile Picture</h3>
              <div className="text-center mb-6 flex justify-center">
                {previewImage ? (
                  <div className="relative group">
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-md"
                    />
                    <label
                      htmlFor="profilePictureInput"
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      title="Change Profile Picture"
                    >
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                        <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="profilePictureInput"
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-blue-200 shadow-md flex items-center justify-center cursor-pointer hover:from-blue-200 hover:to-indigo-200 transition relative group"
                    title="Upload Profile Picture"
                  >
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span className="block text-xs text-gray-500">Upload</span>
                    </div>
                  </label>
                )}
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {previewImage && (
                <button
                  onClick={() => {
                    setPreviewImage("");
                    setSelectedFile(null);
                    setRemovePicture(true);
                  }}
                  className="mb-4 text-sm text-red-600 hover:text-red-700 font-semibold flex items-center justify-center gap-1 mx-auto transition"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Remove Photo
                </button>
              )}
              <p className="text-sm text-gray-600 mb-4">JPG, PNG, GIF or WebP • Max 5MB</p>
              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-900">
                    <strong>New file selected:</strong> {selectedFile.name}
                  </p>
                </div>
              )}
            </div>

            {/* Personal Information Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">
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
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                        <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
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
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                        <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
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
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                        <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* About Me Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
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
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                      <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {form.aboutMe.length}/500 characters
                </p>
              </div>
            </div>
"
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                    <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Edit Subjects
                </button>
              )}
            </div>

            {/* Save Button - Below All Fields */}
            {isAnyFieldEditing && (
              <div className="border-t border-gray-200 pt-8 flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setEditingFields({});
                    setRemovePicture(false);
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

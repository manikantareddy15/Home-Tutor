
import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editingFields, setEditingFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [removePicture, setRemovePicture] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profilePicture || "");
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
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


  const isAnyFieldEditing = Object.values(editingFields).some((val) => val) || !!selectedFile || removePicture;

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
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
            

            {/* Profile Picture Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Profile Picture</h3>
              <div className="text-center">
                <div className="mb-6 flex justify-center">
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
                        <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 group-hover:bg-blue-700 transition">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                            <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
                {previewImage && (
                  <button
                    onClick={() => {
                      setPreviewImage("");
                      setSelectedFile(null);
                      setRemovePicture(true);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold flex items-center justify-center gap-1 mx-auto transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Remove Photo
                  </button>
                )}
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-600 mb-4">JPG, PNG, GIF or WebP • Max 5MB</p>
                {selectedFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-900">
                      <strong>New file selected:</strong> {selectedFile.name}
                    </p>
                  </div>
                )}
              </div>
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
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                        <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Information Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Learning Information
              </h3>
              
              <div className="space-y-5">
              </div>
            </div>

            {/* Account Information */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
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
                setSelectedFile(null);
                setRemovePicture(false);
                setPreviewImage(user?.profilePicture || "");
                setForm({
                  fullName: user?.fullName || "",
                  email: user?.email || "",
                  password: ""
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

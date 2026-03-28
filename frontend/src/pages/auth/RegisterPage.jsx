import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    class: "",
    cert11th: null,
    cert12th: null,
    certGraduation: null,
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", form.role);

      if (form.role === "student") {
        formData.append("class", form.class);
      } else {
        if (form.cert11th) formData.append("cert11th", form.cert11th);
        if (form.cert12th) formData.append("cert12th", form.cert12th);
        if (form.certGraduation) formData.append("certGraduation", form.certGraduation);
      }

      const user = await register(formData);
      toast.success(
        user.role === "tutor"
          ? "Registered successfully! Your documents are pending admin approval."
          : "Registered successfully!"
      );
      navigate(`/${user.role}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Side - Welcome Section */}
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-8 md:p-12 flex flex-col justify-center items-center text-white">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img
                  src="/home_logo.jpg"
                  alt="HomeTutor Logo"
                  className="w-32 h-32 rounded-full object-cover shadow-lg"
                />
              </div>
              <h1 className="text-4xl font-bold mb-6">HomeTutor</h1>
              <h2 className="text-2xl font-semibold mb-6">Join Our Community</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold">Expert Tutors</p>
                    <p className="text-sm text-blue-100">Learn from experienced professionals</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold">Personalized Learning</p>
                    <p className="text-sm text-blue-100">Tailored sessions for your needs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold">Flexible Schedule</p>
                    <p className="text-sm text-blue-100">Learn at your own pace</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold">Affordable Learning</p>
                    <p className="text-sm text-blue-100">Quality education for everyone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center overflow-y-auto max-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Create Account</h2>

            <form onSubmit={submit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Register As
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ 
                      ...form, 
                      role: e.target.value, 
                      class: "", 
                      cert11th: null, 
                      cert12th: null, 
                      certGraduation: null 
                    })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700"
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>

              {/* Conditional Fields Based on Role */}
              {form.role === "student" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class
                  </label>
                  <input
                    type="text"
                    placeholder="Class (e.g., 10th, 12th, College)"
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-400"
                  />
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700">
                    Upload Certificates
                  </p>

                  {/* 11th Certificate */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      11th Certificate
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={(e) =>
                        setForm({ ...form, cert11th: e.target.files[0] })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                    />
                  </div>

                  {/* 12th Certificate */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      12th Certificate
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={(e) =>
                        setForm({ ...form, cert12th: e.target.files[0] })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                    />
                  </div>

                  {/* Graduation Certificate */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Graduation Certificate
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={(e) =>
                        setForm({ ...form, certGraduation: e.target.files[0] })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              )}

              {/* Create Account Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-6"
              >
                Create Account
              </button>

              {/* Sign In Link */}
              <div className="text-center pt-4">
                <p className="text-gray-700 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

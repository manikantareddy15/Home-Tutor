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
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <img
              src="/home_logo.jpg"
              alt="HomeTutor Logo"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">HomeTutor</h1>
          <h2 className="text-2xl font-bold text-gray-700">Create Account</h2>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Full Name */}
          <div>
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
              Role
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-6"
          >
            Create Account
          </button>

          {/* Sign In Link */}
          <div className="text-center pt-2">
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
  );
};

export default RegisterPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(
        { email: form.email, password: form.password },
        form.role === "admin"
      );
      navigate(`/${user.role}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
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
              <h2 className="text-2xl font-semibold mb-6">Welcome Back</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold">Quality Education</p>
                    <p className="text-sm text-blue-100">Learn from expert tutors</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold">Online Sessions</p>
                    <p className="text-sm text-blue-100">Study at your own pace</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold">Live Tutoring</p>
                    <p className="text-sm text-blue-100">Connect with tutors anytime</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold">Affordable Rates</p>
                    <p className="text-sm text-blue-100">Quality education within reach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Sign In</h2>

            <form onSubmit={submit} className="space-y-4">
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

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-6"
              >
                Sign In
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-gray-700 text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Create one
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

export default LoginPage;

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
          <h1 className="text-3xl font-bold text-gray-800">HomeTutor</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
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

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-6"
          >
            Sign in
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-2">
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
  );
};

export default LoginPage;

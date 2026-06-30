import React, { useState } from "react";
import signupimage from "../../assets/Signup-image.png";
import logowhite from "../../assets/Logo-white.svg";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email: email,
        password: password
      });

        const userData = response.data;

      // Store the user data in the Context API
      login(userData);

      navigate("/dashboard");

    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left side */}
      <div className="relative bg-gradient-to-b from-indigo-500 to-purple-600 text-white flex flex-col justify-end px-10 py-12">
        <div className="h-full w-full max-w-11/12 self-center">
          <img src={logowhite} alt="GatePass" className="max-w-18"/>
        </div>
        <div className="w-full max-w-11/12 self-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Welcome Back</h1>
          <p className="text-lg text-white mb-10 max-w-sm">
            Login to your account to seamlessly manage your event{" "}
          </p>

          {/* Image mockup */}
          <div className="rounded-2xl overflow-hidden shadow-lg relative border mt-22">
            <img
              src={signupimage}
              alt="A team planning an event illustration"
              className="w-full h-80 object-cover"
            />
            <div className="absolute bottom-0 left-4 pb-2.5 max-w-md inset-shadow-sm">
              <h2 className="text-lg md:text-3xl text-white font-bold mb-3">
                Create Events Effortlessly
              </h2>
              <p className="text-sm text-white">
                Our smart Event Wizard helps you design, organize, and publish
                events faster than ever.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-gray-800">
            Login to Your Account
          </h2>

          {/* Error Message Display */}
          {error && (
            <div className="w-fit p-4 mb-6 text-sm text-[#DB2F40] bg-[#DB2F40]/10 rounded-xl border border-[#DB2F40]/20">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter a valid email address"
                className="w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:ring-2 focus:outline-[#6B4EFF] focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password here"
                  className="w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:ring-2 focus:text-[#6B4EFF] focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-start justify-end gap-2 w-full">
              <Link to="#" className="text-[#6B4EFF] font-bold hover:underline">
                Forgot Password
              </Link>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#6B4EFF] hover:bg-indigo-700 disabled:bg-[#6B4EFF]/70 cursor-pointer text-white py-3.5 rounded-lg font-semibold shadow-lg transition-all"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? "Logging in..." : "Continue"}
              </button>
            </div>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account yet?{" "}
            <Link
              to="/signup"
              className="text-[#6B4EFF] font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logowhite from "../../assets/Logo-white.svg";

import api from "../../utils/api";

const Signup = () => {
  const navigate = useNavigate();

  // States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop",
      title: "Create Events Effortlessly",
      desc: "Our smart Event Wizard helps you design, organize, and publish events faster than ever.",
    },
    {
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
      title: "Manage Guests Seamlessly",
      desc: "Keep track of RSVPs, send automated reminders, and manage access with ease.",
    },
    {
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop",
      title: "Track Real-Time Analytics",
      desc: "Get deep insights into attendance, ticket sales, and guest engagement instantly.",
    },
    {
      image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=2070&auto=format&fit=crop",
      title: "Secure Access Control",
      desc: "Ensure smooth entry with verifiable QR codes and secure check-in systems.",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agreed) return setError("You must agree to the Terms & Conditions.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Password must be at least 8 characters long.");

    setLoading(true);

    try {
      const generatedUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + Math.floor(Math.random() * 1000);

      const payload = {
        email: email,
        password: password,
        username: generatedUsername,
        first_name: firstName.trim(),
        last_name: lastName.trim()
      };

      await api.post("/users/register", payload);

      setSuccess("Account created successfully. Redirecting...");
      
      try {
        await api.patch(`/users/dev/verify/${email}`);
      } catch (verifyErr) {
        console.warn("Dev auto-verify failed, but registration succeeded.", verifyErr);
      }

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left side (Slideshow) */}
      <div className="relative bg-gradient-to-b from-indigo-500 to-purple-600 text-white flex flex-col justify-center px-10 py-12 overflow-hidden">
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 h-full w-full max-w-lg mx-auto flex flex-col justify-center">
          <div className="mb-12">
            <img src={logowhite} alt="GatePass" className="h-8 mb-16" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Create an Account
            </h1>
            <p className="text-lg text-white/90 max-w-sm">
              Create an account to seamlessly manage your event
            </p>
          </div>

          <div className="rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/20 h-80 bg-slate-900 group">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-90"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-8 pt-20">
                  <h2 className="text-xl md:text-2xl text-white font-extrabold mb-2 transform transition-all duration-500 translate-y-0">
                    {slide.title}
                  </h2>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {slide.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right side (Form) */}
      <div className="flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold mb-8 text-slate-900">
            Let's Get Started
          </h2>

          {/* Feedback Messages */}
          {error && <div className="w-fit p-4 mb-6 text-sm text-[#DB2F40] bg-[#DB2F40]/10 rounded-xl border border-[#DB2F40]/20">{error}</div>}
          {success && <div className="w-fit p-4 mb-6 text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200">{success}</div>}

          {/* Signup Form */}
          <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                />
              </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter a valid email address"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password here"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-[11px] italic text-[#DB2F40]/80 mt-2 font-medium">
                <span className="text-[#DB2F40] font-bold">*</span> must contain at least
                8 characters — upper + lower case, number, special symbol
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password here"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input 
                type="checkbox" 
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#6B4EFF] focus:ring-[#6B4EFF] cursor-pointer" 
              />
              <label className="text-sm text-slate-600">
                I agree to the{" "}
                <Link to="#" className="text-[#6B4EFF] font-bold hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-[#6B4EFF] font-bold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-[#6B4EFF] hover:bg-[#583DD9] disabled:bg-[#6B4EFF]/70 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? "Creating Account..." : "Continue"}
              </button>
            </div>
          </form>

          <p className="text-sm text-slate-600 text-center mt-8 font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#6B4EFF] font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
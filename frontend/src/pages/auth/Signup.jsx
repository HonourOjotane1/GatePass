import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import logowhite from "../../assets/Logo-white.svg";
import Slide1 from "../../assets/Signup-image.png";

const Signup = () => {
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow data (Replace images with your local assets if preferred)
  const slides = [
    {
      image: Slide1,
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
    },
  ];

  // Auto-play slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000); // Changes slide every 3 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="font-poppins min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left side */}
      <div className="relative bg-gradient-to-b from-indigo-500 to-purple-600 text-white flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-12 overflow-hidden">
        {/* Abstract Background Graphic (Optional fallback for the poly background) */}
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 h-full w-full max-w-full mx-auto flex flex-col justify-center">
          <div className="mb-12">
            <img src={logowhite} alt="GatePass" className="max-w-18 mb-16" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Create an Account
            </h1>
            <p className="text-lg text-white/90 max-w-sm">
              Create an account to seamlessly manage your event
            </p>
          </div>

          {/* Slideshow Card */}
          <div className="rounded-2xl overflow-hidden shadow-2xl relative border border-white/20 h-80 bg-slate-900 group">
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
                {/* Gradient Overlay for text readability */}
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

          {/* Slideshow Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
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

      {/* Right side */}
      <div className="flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold mb-10 text-slate-900">
            Let's Get Started
          </h2>

          {/* Signup Form */}
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter name here"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
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
                  placeholder="Enter password here"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                  placeholder="Re-enter password here"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input 
                type="checkbox" 
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

            <Link to="/otp" className="block pt-4">
              <button
                type="submit"
                className="w-full bg-[#6B4EFF] hover:bg-[#583DD9] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Continue
              </button>
            </Link>
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
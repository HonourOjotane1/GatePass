import signupimage from "../../assets/Signup-image.png";
import logowhite from "../../assets/Logo-white.svg";
import { Eye } from "lucide-react";
import { Link } from "react-router";

const Signup = () => {
  return (
    <div className="font-poppins min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left side */}
      <div className="relative bg-gradient-to-b from-indigo-500 to-purple-600 text-white flex flex-col justify-end px-10 py-12">
        <div className="h-full w-full max-w-11/12 self-center">
          <img src={logowhite} alt="GatePass" />
        </div>
        <div className="w-full max-w-11/12 self-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            Create an Account
          </h1>
          <p className="text-lg text-white mb-10 max-w-sm">
            Create an account to seamlessly manage your event
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
            Let's Get Started
          </h2>

          {/* Signup Form */}
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter name here"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focs:outline-[#6B4EFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter a valid email address"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:outline-[#6B4EFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter password here"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:text-[#6B4EFF] focus:outline-none"
                />
                <span className="absolute right-3 top-3 text-gray-400 cursor-pointer">
                  <Eye />
                </span>
              </div>
              <p className="text-xs text-[#8F8F8F] mt-1">
                <span className="text-[#DB2F40]">*</span> must contain at least
                8 characters — upper + lower case, number, special symbol
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Re-enter password here"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="absolute right-3 top-3 text-gray-400 cursor-pointer">
                  <Eye />
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 cursor-pointer" />
              <label className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-[#6B4EFF] font-medium">
                  Terms & Conditions
                </a>{" "}
                and
                <a href="#" className="text-[#6B4EFF] font-medium">
                  {" "}
                  Privacy Policy
                </a>
              </label>
            </div>

            <Link to="/otp">
              <button
                type="submit"
                className="w-full bg-[#6B4EFF] hover:bg-indigo-700 cursor-pointer text-white py-3 rounded-lg font-semibold shadow-lg transition"
              >
                Continue
              </button>
            </Link>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#6B4EFF] font-semibold hover:underline"
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

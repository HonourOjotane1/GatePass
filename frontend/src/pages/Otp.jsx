import React, { useRef, useState, useEffect } from "react";
import logopurple from "../assets/Logo-purple.svg";
import { Link } from "react-router";

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([])

  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input automatically
      if (value && index < 5) inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

   // TIMER COUNTDOWN LOGIC
  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (!canResend) return;

    // Reset timer and disable resend again
    setTimer(59);
    setCanResend(false);

    // TODO — Call your resend API here
    console.log("Code resent!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 font-poppins">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-20">
        <img src={logopurple} alt="GatePass" />
      </div>

      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enter Verification Code
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          We sent a 6-digit code to your.email@gmail.com
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between mb-8 gap-2 ">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-8 h-10 sm:w-12 sm:h-14 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
           ))} 
        </div>

        {/* Verify Button */}
        <Link to="/verificationsuccessfull">
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition cursor-pointer">
          Verify
        </button>
        </Link>

        {/* Timer */}
        <p className="text-gray-500 text-sm mt-6">
          Resend code in{" "}
           <span className="font-semibold text-gray-700">
            00:{timer < 10 ? `0${timer}` : timer}
          </span>
        </p>

        {/* Resend Link */}
        <p className="text-gray-500 text-sm mt-2">
          Didn't get the code?{" "}
          {/* <span className="text-purple-600 font-medium cursor-pointer">
            Resend
          </span> */}
           <button
            onClick={handleResend}
            disabled={!canResend}
            className={`font-medium ${
              canResend ? "text-purple-600" : "text-gray-400 cursor-not-allowed"
            }`}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default Otp;

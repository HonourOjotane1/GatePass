import { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import logopurple from "../../assets/Logo-purple.svg";
import { Link, Navigate, useNavigate } from 'react-router';


const Verificationsuccessful = () => {

    const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate()

  // Countdown and progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
      setProgress((prev) => Math.min(prev + 20, 100));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

    // Navigate when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      navigate('/dashboard')
    }
  }, [countdown])


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-poppins">
      {/* Logo */}
      <div className="p-6 md:p-8">
       <img src={logopurple} alt="GatePass" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCheck className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" strokeWidth={2.5} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            Verification Successful!
          </h1>

          {/* Subheading */}
          <p className="text-gray-500 text-center mb-12 text-sm md:text-base leading-relaxed px-2">
            Your identity has been confirmed. You will now be redirected to your dashboard.
          </p>

          {/* Redirecting Section */}
          <div className="mb-8">
            <p className="text-gray-900 font-medium mb-3 text-sm md:text-base">
              Redirecting.......
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className="h-full bg-[#6B4EFF] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Countdown */}
            <p className="text-gray-400 text-sm">
              in {countdown} sec
            </p>
          </div>

          {/* Dashboard Button */}
          <Link to="/dashboard">
          <button className="w-full bg-[#6B4EFF] hover:bg-[#5a3ee6] active:bg-[#4d35c9] text-white font-semibold py-4 rounded-xl transition-colors duration-200 text-base md:text-lg">
            Go to Dashboard
          </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Verificationsuccessful

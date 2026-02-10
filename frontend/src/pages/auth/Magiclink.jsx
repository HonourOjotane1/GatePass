
// import React, { useState } from 'react'
// import { Mail } from 'lucide-react'
// import logopurple from "../../assets/Logo-purple.svg"

// const MagicLink = () => {
//    const [email] = useState('youremail@gmail.com');

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col font-poppins">
//       {/* Logo */}
//       <div className="p-6 md:p-8">
//             <img src={logopurple} alt="GatePass" />
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex items-center justify-center px-4 py-8">
//         <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8 md:p-12">
//           {/* Mail Icon */}
//           <div className="flex justify-center mb-6">
//             <div className="w-16 h-16 md:w-20 md:h-20 bg-[#6B4EFF]/10 rounded-2xl flex items-center justify-center">
//               <Mail className="w-8 h-8 md:w-10 md:h-10 text-[#6B4EFF]" strokeWidth={2} />
//             </div>
//           </div>

//           {/* Heading */}
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
//             Check Your Inbox
//           </h1>

//           {/* Subheading */}
//           <p className="text-gray-500 text-center mb-8 text-sm md:text-base">
//             We've sent a magic link to <span className="font-medium text-gray-900">{email}</span>
//           </p>

//           {/* Info Box */}
//           <div className="bg-gray-50 rounded-xl p-5 mb-6">
//             <h2 className="text-gray-900 font-semibold mb-2 text-sm md:text-base">
//               How do magic links work?
//             </h2>
//             <p className="text-gray-500 text-sm md:text-base leading-relaxed">
//               Click the link in the mail we sent you to securely log in. No password needed!
//             </p>
//           </div>

//           {/* Verify Button */}
//           <button className="w-full bg-[#6B4EFF] hover:bg-[#5a3ee6] active:bg-[#4d35c9] text-white font-semibold py-4 rounded-xl transition-colors duration-200 mb-4 text-base md:text-lg cursor-pointer">
//             Verify
//           </button>

//           {/* Resend Link */}
//           <p className="text-center text-gray-500 text-sm md:text-base">
//             Didn't receive the mail?{' '}
//             <button className="text-[#6B4EFF] font-semibold hover:underline cursor-pointer">
//               Resend Link
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MagicLink

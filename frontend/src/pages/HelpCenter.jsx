import { Link } from 'react-router-dom'
import { Search, Bell, ChevronDown } from 'lucide-react'
import userAvatar from '../assets/user.png'

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFF] font-poppins flex flex-col">
      
      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm py-4 px-10 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-2xl font-bold whitespace-nowrap text-slate-900">Help Center</h1>

        <div className="flex items-center gap-6 ml-4">
          <button className="relative p-2.5 bg-[#F3F4F6] text-slate-600 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
            <Bell size={20} fill="#6B4EFF" stroke="none" />
          </button>
          <div className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img src={userAvatar} alt="User" className="w-9 h-9 rounded-full object-cover" />
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="p-8 lg:p-10 flex-1 flex flex-col">
        
        {/* Main White Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex-1 flex flex-col items-center justify-center p-12 min-h-[600px]">
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3 text-center">
            How May We Help You?
          </h2>
          
          <p className="text-slate-500 mb-10 text-center max-w-md">
            Find answers, guides, and support to manage your events seamlessly.
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-xl mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder='Search for help... (e.g. "create event")'
              className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] rounded-xl border border-transparent focus:border-[#6B4EFF] focus:bg-white focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all text-base placeholder:text-slate-400"
            />
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard/create-event" className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all cursor-pointer bg-white">
              Create Event
            </Link>
            <Link to="/dashboard/guest-management" className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all cursor-pointer bg-white">
              Manage Guests
            </Link>
            
          </div>

        </div>
      </div>

    </div>
  );
};

export default HelpCenter;
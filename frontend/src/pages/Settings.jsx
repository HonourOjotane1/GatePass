import { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  User, 
  Lock, 
  LayoutGrid, 
  LogOut, 
  Camera, 
  PenLine, 
  Eye, 
  ChevronLeft, 
  Mail 
} from 'lucide-react';
import userAvatar from '../assets/user.png'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')

  // --- TAB RENDERERS ---

  const renderProfile = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Avatar Section */}
      <div className="flex items-center gap-8 mb-10">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=1035&auto=format&fit=crop" 
            alt="Profile Avatar" 
            className="w-32 h-32 rounded-full object-cover shadow-sm border border-slate-100"
          />
          <button className="absolute bottom-0 right-0 bg-[#6B4EFF] text-white p-2 rounded-full border-4 border-white hover:bg-[#583DD9] transition-colors cursor-pointer shadow-sm">
            <Camera size={16} />
          </button>
        </div>
        <button className="bg-[#6B4EFF] text-white px-8 py-3.5 rounded-full font-semibold shadow-sm hover:shadow-md hover:bg-[#583DD9] transition-all cursor-pointer">
          Upload New
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                defaultValue="Honour Ojotane"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all pr-12"
              />
              <PenLine size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Email</label>
            <div className="relative">
              <input 
                type="email" 
                defaultValue="honourojotane@gmail.com"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all pr-12"
              />
              <PenLine size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2 max-w-[50%] pr-3">
          <label className="text-sm font-bold text-slate-900">Phone Number</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center gap-2 pointer-events-none">
              <span className="text-lg">🇳🇬</span>
            </div>
            <input 
              type="tel" 
              defaultValue="807 890 1212"
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all"
            />
            <PenLine size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="pt-10">
          <button className="w-full md:w-[50%] bg-[#6B4EFF] text-white px-8 py-4 rounded-xl font-bold shadow-sm hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer text-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderPassword = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-xl">
      
      <div className="flex items-center gap-5 mb-10">
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Change Password</h2>
          <p className="text-sm text-slate-400">Update password for enhanced security</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Current Password</label>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Enter password here"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <Eye size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">New Password</label>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Enter password here"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <Eye size={20} />
            </button>
          </div>
          <p className="text-[11px] italic text-[#DB2F40]/80 mt-1.5 font-medium">
            <span className="text-[#DB2F40] font-bold">*</span> must contain at least 8 characters — upper + lower case, number, special symbol
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Confirm New Password</label>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Enter password here"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none text-slate-700 transition-all placeholder:text-slate-400"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <Eye size={20} />
            </button>
          </div>
        </div>

        <div className="pt-8">
          <button className="w-full bg-[#6B4EFF] text-white px-8 py-4 rounded-xl font-bold shadow-sm hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer text-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const render2FA = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-xl">
      
      <div className="flex items-center gap-5 mb-10">
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Two Factor Authentication</h2>
          <p className="text-sm text-slate-400">Use at least one method of 2FA to secure your account.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 2FA Option Box */}
        <div className="flex items-center justify-between p-6 bg-[#6B4EFF]/5 border border-[#6B4EFF]/10 rounded-2xl cursor-pointer hover:bg-[#6B4EFF]/10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#6B4EFF] shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-0.5">Email</h3>
              <p className="text-xs text-slate-500">Send OTP to my mail</p>
            </div>
          </div>
          {/* Radio Unselected Mock */}
          <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
        </div>

        <div className="pt-6">
          <button className="w-full bg-[#6B4EFF] text-white px-8 py-4 rounded-xl font-bold shadow-sm hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer text-lg">
            Continue
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-poppins flex flex-col">
      
      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm py-4 px-10 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-2xl font-bold whitespace-nowrap text-slate-900">Settings</h1>

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
      <div className="p-8 lg:p-10 flex-1">
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto h-full">
          
          {/* LEFT SIDEBAR - NAVIGATION */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-lg border border-slate-100 shadow-sm py-6 overflow-hidden">
              <nav className="flex flex-col space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-4 px-8 py-4 text-sm font-semibold transition-all border-l-4 ${
                    activeTab === 'profile' 
                    ? 'border-[#6B4EFF] bg-[#6B4EFF]/5 text-[#6B4EFF]' 
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <User size={20} />
                  Profile
                </button>
                
                <button 
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center gap-4 px-8 py-4 text-sm font-semibold transition-all border-l-4 ${
                    activeTab === 'password' 
                    ? 'border-[#6B4EFF] bg-[#6B4EFF]/5 text-[#6B4EFF]' 
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Lock size={20} />
                  Password
                </button>
                
                <button 
                  onClick={() => setActiveTab('2fa')}
                  className={`w-full flex items-center gap-4 px-8 py-4 text-sm font-semibold transition-all border-l-4 ${
                    activeTab === '2fa' 
                    ? 'border-[#6B4EFF] bg-[#6B4EFF]/5 text-[#6B4EFF]' 
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid size={20} />
                  2FA
                </button>
                
                <div className="my-2 border-t border-slate-50"></div>
                
                <button className="w-full flex items-center gap-4 px-8 py-4 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors border-l-4 border-transparent">
                  <LogOut size={20} />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* RIGHT SIDE - DYNAMIC CONTENT */}
          <div className="flex-1 bg-white rounded-lg border border-slate-100 shadow-sm p-8 lg:p-12 min-h-[600px]">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'password' && renderPassword()}
            {activeTab === '2fa' && render2FA()}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
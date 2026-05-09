import { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Search, 
  PlusCircle, 
  Users, 
  HelpCircle, 
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft,
  Paperclip,
  Mic,
  Send
} from 'lucide-react';
import userAvatar from '../assets/user.png';
import { Link } from 'react-router-dom';
import helpImg from '../assets/HelpCenterImg.png'

const HelpCenter = () => {
  // State to manage which view is active: 'main', 'faqs', or 'chatbot'
  const [activeView, setActiveView] = useState('main');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: "What is GatePass all about?",
      answer: "GatePass is an event management and gate access platform designed to help organizers seamlessly plan, publish, and manage events — from ticket creation to on-the-ground check-in. With GatePass, organizers can build event listings, control guest visibility, invite co-hosts, and manage attendee access all from a centralized dashboard. Whether you're running a private corporate gathering or a large public event, GatePass gives you the tools to handle registration, guest lists, and entry validation in one place."
    },
    {
      question: "How do I create a new event?",
      answer: "Creating an event on GatePass is done through the Event Creation Wizard, which walks you through the process step by step. You'll be able to: Set your event name, date, location, and description. Auto-generate a unique event slug (URL). Save your event as a draft and return to finish it later. Configure visibility settings (public, private, or invite-only). Invite co-hosts to help manage the event. Once you're satisfied with your setup, you can publish the event directly from the wizard or your Organizer Dashboard."   
    },
    {
      question: "Can I import guests from an Excel file?",
      answer: "Yes, you can import guests from an Excel file. Go to your event management page, select the 'Guests' tab, and click on 'Import Guests'. Upload your Excel file following the provided template."
    },
    {
      question: "How does the QR code check-in work?",
      answer: "GatePass uses QR code-based entry validation to make gate check-in fast and reliable. Here's how it works: Guest Registration — When a guest is added to an event, they receive a unique QR code tied to their entry pass. At the Gate — Your check-in team scans the guest's QR code using the GatePass check-in interface. Instant Validation — The system verifies the code in real time, confirms the guest's eligibility, and marks them as checked in. Duplicate Prevention — Each QR code can only be used once per event, preventing duplicate or fraudulent entries. No internet delays, no paper lists — just scan and go."
    }
  ];

  // --- VIEW 1: MAIN HELP CENTER ---
  const renderMain = () => (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative w-full h-[320px] rounded-3xl overflow-hidden mb-12 flex flex-col items-center justify-center">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 bg-[#6B4EFF] z-0">
          <img 
            src={helpImg}
            alt="Help Center Background" 
            className="w-full h-full object-cover mix-blend-overlay opacity-40"
          />
        </div>
        
        <div className="relative z-10 w-full max-w-2xl px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-3">
            How May We Help You?
          </h2>
          <p className="text-white/90 mb-8 font-medium">
            Find answers, guides, and support to manage your events seamlessly.
          </p>

          <div className="relative w-full shadow-lg">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder='Search for help... (e.g. "create event")'
              className="w-full pl-14 pr-6 py-4 bg-white rounded-xl outline-none text-slate-700 transition-all text-base placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="flex items-center justify-center gap-6 mb-16">
        <Link to="/dashboard/create-event" className="w-56 h-48 bg-white rounded-3xl flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-[#6B4EFF]/10 hover:border-[#6B4EFF]/20">
          <div className="w-12 h-12 rounded-full border-2 border-[#6B4EFF] text-[#6B4EFF] flex items-center justify-center">
            <PlusCircle size={24} />
          </div>
          <span className="font-bold text-slate-900">Create Event</span>
        </Link>

        <Link to="/dashboard/my-events" className="w-56 h-48 bg-white rounded-3xl flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-[#6B4EFF]/10 hover:border-[#6B4EFF]/20">
          <div className="w-12 h-12 rounded-full border-2 border-[#6B4EFF] text-[#6B4EFF] flex items-center justify-center">
            <Users size={24} />
          </div>
          <span className="font-bold text-slate-900">Manage Event</span>
        </Link>

        <button 
          onClick={() => setActiveView('faqs')}
          className="w-56 h-48 bg-white rounded-3xl flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-[#6B4EFF]/10 hover:border-[#6B4EFF]/20"
        >
          <div className="w-12 h-12 rounded-full border-2 border-[#6B4EFF] text-[#6B4EFF] flex items-center justify-center">
            <HelpCircle size={24} />
          </div>
          <span className="font-bold text-slate-900">FAQs</span>
        </button>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Didn't find an answer to your question?</h3>
        <p className="text-slate-500 mb-8 font-medium">Get in touch with us for details on additional services.</p>
        
        <button
          onClick={() => setActiveView('chatbot')}
          className="bg-[#6B4EFF] text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:bg-[#583DD9] transition-colors mb-10 cursor-pointer"
        >
          Contact Us
        </button>

        {/* Social Icons */}
        <div className="flex items-center gap-4 text-slate-400">
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"><Instagram size={20} /></button>
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"><Facebook size={20} /></button>
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"><Twitter size={20} /></button>
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"><Linkedin size={20} /></button>
          {/* Custom SVG for TikTok fallback */}
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setActiveView('chatbot')}
        className="fixed bottom-10 right-10 w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#6B4EFF] hover:scale-105 transition-transform cursor-pointer border border-slate-50"
      >
        <MessageSquare size={32} />
      </button>
    </div>
  );

  // --- VIEW 2: FAQs ---
  const renderFaqs = () => (
    <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-12 animate-in slide-in-from-right-8 duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">
        Frequently Asked Questions
      </h2>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-slate-100 last:border-0 pb-4">
            <button 
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
            >
              <span className="text-slate-600 font-medium text-lg group-hover:text-slate-900 transition-colors">
                {faq.question}
              </span>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <ChevronDown 
                  size={20} 
                  className={`transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`} 
                />
              </div>
            </button>
            {/* Expanded Content Placeholder */}
            {expandedFaq === index && (
              <div className="pb-4 text-slate-500 pr-12 animate-in fade-in duration-200 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // --- VIEW 3: CHATBOT ---
  const renderChatbot = () => (
    <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col h-[calc(100vh-160px)] animate-in slide-in-from-right-8 duration-300">
      
      <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">
        Welcome Honour! How May I Help You?
      </h2>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6">
        {/* Bot Message */}
        <div className="flex justify-start">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 max-w-xl text-slate-700 text-lg">
            Please briefly describe your problem
          </div>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-[#E2D4F0] rounded-2xl p-6 max-w-xl text-slate-800 text-lg">
            Please briefly describe your problem
          </div>
        </div>

        {/* Bot Message */}
        <div className="flex justify-start">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 max-w-xl text-slate-700 text-lg">
            Please briefly describe your problem
          </div>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-[#E2D4F0] rounded-2xl p-6 max-w-xl text-slate-800 text-lg">
            Please briefly describe your problem
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-4 mt-auto">
        <button className="w-16 h-16 shrink-0 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#6B4EFF] hover:bg-slate-50 transition-colors cursor-pointer">
          <Paperclip size={24} />
        </button>
        <button className="w-16 h-16 shrink-0 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#6B4EFF] hover:bg-slate-50 transition-colors cursor-pointer">
          <Mic size={24} />
        </button>
        
        <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-full flex items-center pr-2 pl-6 h-16">
          <input 
            type="text" 
            placeholder="Please briefly describe your problem"
            className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
          />
          <button className="w-12 h-12 rounded-full bg-[#6B4EFF] text-white flex items-center justify-center hover:bg-[#583DD9] transition-colors cursor-pointer shrink-0">
            <Send size={20} className="-ml-1" />
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-poppins flex flex-col">
      
      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm py-4 px-10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          {/* Show Back Arrow if we are not on the main view */}
          {activeView !== 'main' && (
            <button 
              onClick={() => setActiveView('main')}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-2xl font-bold whitespace-nowrap text-slate-900">
            {activeView === 'faqs' ? 'FAQs' : activeView === 'chatbot' ? 'Chat Support' : 'Help Center'}
          </h1>
        </div>

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
        {activeView === 'main' && renderMain()}
        {activeView === 'faqs' && renderFaqs()}
        {activeView === 'chatbot' && renderChatbot()}
      </div>

    </div>
  );
};

export default HelpCenter;
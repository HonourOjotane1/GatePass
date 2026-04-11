import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Bell, 
  ChevronDown, 
  Users, 
  UserCheck, 
  Clock, 
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import userAvatar from '../assets/user.png'; 
import emptyStateImg from '../assets/guest-empty-state.svg'; 
import FeedbackModal from '../components/FeedbackModal'
import questionIcon from '../assets/icons/question-circle.svg'
import successIcon from '../assets/icons/success-badge.svg'

// --- Helper to Generate Random Mock Data ---
const generateMockGuests = () => {
  const events = [
    "Startup Connect Meetup",
    "Lagos Tech Summit",
    "Creative Designers Meetup"
  ];
  const statuses = ["Confirmed", "Pending", "Declined"];
  const baseNames = ["David Daniel", "Sarah Connor", "Michael Johnson", "Emily Davis", "Chris Martin", "Jessica Jones", "Matthew Clark", "Ashley Taylor"];
  
  const guests = [];
  for (let i = 1; i <= 65; i++) {
    const eventName = events[Math.floor(Math.random() * events.length)];
    const name = baseNames[Math.floor(Math.random() * baseNames.length)] + ` ${i}`;
    const email = name.toLowerCase().replace(' ', '') + "@gmail.com";
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    guests.push({
      id: i,
      name,
      email,
      event: eventName,
      category: "Regular",
      channel: "Email",
      date: "2025-10-21",
      status
    });
  }
  return guests;
};

const GuestManagement = () => {
  const [isEmpty, setIsEmpty] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // NEW: State to manage which modal is currently open
  const [modalState, setModalState] = useState(null); // 'removeConfirm' | 'removeSuccess' | 'resendConfirm' | 'resendSuccess' | null

  const itemsPerPage = 6;

  // Initialize mock data once
  const allGuests = useMemo(() => generateMockGuests(), []);

  // Filter Data
  const filteredGuests = useMemo(() => {
    if (isEmpty) return [];
    let filtered = allGuests;
    if (selectedEvent !== 'All Events') {
      filtered = filtered.filter(g => g.event === selectedEvent);
    }
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [allGuests, selectedEvent, searchTerm, isEmpty]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage) || 1;
  const currentGuests = filteredGuests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedEvent, searchTerm, isEmpty]);

  const eventOptions = [
    "All Events",
    "Startup Connect Meetup",
    "Lagos Tech Summit",
    "Creative Designers Meetup"
  ];

  const renderPaginationNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`text-sm px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              currentPage === i 
              ? 'font-bold bg-[#6B4EFF]/10 text-[#6B4EFF]' 
              : 'font-medium text-slate-400 hover:text-slate-900'
            }`}
          >
            {i}
          </button>
        );
      } else if (pages[pages.length - 1]?.key !== 'dots-' + i && pages[pages.length - 1]?.props?.children !== '...') {
        pages.push(<span key={'dots-' + i} className="text-sm font-medium text-slate-400 px-1">...</span>);
      }
    }
    return pages;
  };

  // --- MODAL RENDERING LOGIC ---
  const renderModalContent = () => {
    switch (modalState) {
      case 'removeConfirm':
        return (
          <FeedbackModal 
            icon={questionIcon}
            title="Are you sure you want to remove this guest?"
            buttons={[
              { label: "Cancel", variant: "solid", onClick: () => setModalState(null) },
              { label: "Remove", variant: "outline", onClick: () => setModalState('removeSuccess') }
            ]}
          />
        );
      case 'removeSuccess':
        return (
          <FeedbackModal 
            icon={successIcon}
            title="Guest Removed!"
            buttons={[
              { label: "Go Back", variant: "solid", onClick: () => setModalState(null)}
            ]}
          />
        );
      case 'resendConfirm':
        return (
          <FeedbackModal 
            icon={questionIcon}
            title="Are you sure you want to resend invitation to this guest?"
            buttons={[
              { label: "Send Invitation", variant: "solid", onClick: () => setModalState('resendSuccess') },
              { label: "Cancel", variant: "outline", onClick: () => setModalState(null) }
            ]}
          />
        );
      case 'resendSuccess':
        return (
          <FeedbackModal 
            icon={successIcon}
            title="Invitation Resent!"
            buttons={[
              { label: "Go Back", variant: "solid", onClick: () => setModalState(null) }
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* MODAL OVERLAY */}
      {modalState && (
        <>
            {renderModalContent()}
          </>
      )}

      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm py-4 px-10 flex items-center justify-between sticky top-0 z-30 font-poppins">
        <div className="flex items-center gap-8 flex-1">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold whitespace-nowrap text-slate-900">Guest Management</h1>
          </div>
          
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search guest by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl border-none focus:ring-2 focus:ring-[#6B4EFF]/20 text-sm outline-none transition-all"
            />
          </div>
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

      {/* CONTENT */}
      <div className="p-10 font-poppins space-y-8">
        
        {/* TEMPORARY DEV TOGGLE (Remove in production) */}
        <div className="flex justify-end">
           <button 
             onClick={() => setIsEmpty(!isEmpty)} 
             className="text-xs bg-slate-200 px-3 py-1 rounded hover:bg-slate-300 cursor-pointer"
           >
             {isEmpty ? "Show Filled State" : "Show Empty State"}
           </button>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard 
            icon={<Users size={24} />} 
            iconBg="bg-[#6B4EFF]/10" 
            iconColor="text-[#6B4EFF]" 
            value={isEmpty ? "-" : filteredGuests.length} 
            label="Total Guests Added" 
          />
          <StatCard 
            icon={<UserCheck size={24} />} 
            iconBg="bg-emerald-50" 
            iconColor="text-emerald-500" 
            value={isEmpty ? "-" : filteredGuests.filter(g => g.status === 'Confirmed').length} 
            label="Confirmed RSVPs" 
          />
          <StatCard 
            icon={<Clock size={24} />} 
            iconBg="bg-orange-50" 
            iconColor="text-orange-500" 
            value={isEmpty ? "-" : filteredGuests.filter(g => g.status === 'Pending').length} 
            label="Pending RSVPs" 
          />
          <StatCard 
            icon={<UserX size={24} />} 
            iconBg="bg-red-50" 
            iconColor="text-red-500" 
            value={isEmpty ? "-" : filteredGuests.filter(g => g.status === 'Declined').length} 
            label="Declined" 
          />
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          
          {isEmpty || filteredGuests.length === 0 ? (
            /* --- EMPTY STATE --- */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <img 
                src={emptyStateImg} 
                alt="No Guests" 
                className="w-64 h-64 object-contain mb-6 opacity-80"
              />
              <h3 className="text-xl font-bold text-slate-900 mb-8">
                {searchTerm && !isEmpty ? "No guests match your search" : "No Guest Added"}
              </h3>
              {!searchTerm && (
                <Link to="/dashboard/add-guest" className="bg-[#6B4EFF] text-white px-10 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer">
                  Add Guest Now
                </Link>
              )}
            </div>
          ) : (
            /* --- FILLED STATE --- */
            <>
              {/* Card Header & Dynamic Filters */}
              <div className="p-8 flex flex-row items-center justify-between gap-6 border-b border-slate-50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {selectedEvent === 'All Events' ? 'Guest Management' : selectedEvent}
                  </h2>
                  <p className="text-sm text-slate-400">Manage guest lists, RSVP statuses, and event access.</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between gap-4 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 min-w-[180px] transition-colors cursor-pointer"
                    >
                      <span className="truncate max-w-[120px]">
                        {selectedEvent === 'All Events' ? 'All Events' : selectedEvent}
                      </span>
                      <ChevronDown size={16} className="text-slate-400 shrink-0" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-lg z-10 py-2 animate-in fade-in zoom-in-95 duration-200">
                        {eventOptions.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedEvent(option);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-2.5 text-sm transition-colors cursor-pointer ${
                              selectedEvent === option ? 'bg-[#6B4EFF]/5 text-[#6B4EFF] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Action Buttons */}
                  {selectedEvent !== 'All Events' && (
                    <>
                      <Link to="/dashboard/add-guest" className="bg-[#6B4EFF] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#583DD9] transition-all cursor-pointer">
                        Add Guest
                      </Link>
                      <button className="bg-white border border-[#6B4EFF] text-[#6B4EFF] px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#6B4EFF]/5 transition-all cursor-pointer">
                        Import Guest List
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Table Area */}
              <div className="flex-1 overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-8 py-5 text-sm font-semibold text-slate-400">Name</th>
                      <th className="px-4 py-5 text-sm font-semibold text-slate-400">Email</th>
                      {selectedEvent === 'All Events' && (
                         <th className="px-4 py-5 text-sm font-semibold text-slate-400">Event</th>
                      )}
                      <th className="px-4 py-5 text-sm font-semibold text-slate-400">Category</th>
                      <th className="px-4 py-5 text-sm font-semibold text-slate-400">Channel</th>
                      <th className="px-4 py-5 text-sm font-semibold text-slate-400">Date</th>
                      <th className="px-4 py-5 text-sm font-semibold text-slate-400">Status</th>
                      <th className="px-8 py-5 text-sm font-semibold text-slate-400 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-medium text-slate-700 whitespace-nowrap">{guest.name}</td>
                        <td className="px-4 py-5 text-sm text-slate-600 whitespace-nowrap">{guest.email}</td>
                        {selectedEvent === 'All Events' && (
                           <td className="px-4 py-5 text-sm text-slate-600 whitespace-nowrap">{guest.event}</td>
                        )}
                        <td className="px-4 py-5 text-sm text-slate-600 whitespace-nowrap">{guest.category}</td>
                        <td className="px-4 py-5 text-sm text-slate-600 whitespace-nowrap">{guest.channel}</td>
                        <td className="px-4 py-5 text-sm text-slate-600 whitespace-nowrap">{guest.date}</td>
                        <td className="px-4 py-5 whitespace-nowrap">
                          <div className={`flex items-center gap-2 text-sm font-semibold ${
                            guest.status === 'Confirmed' ? 'text-emerald-500' : 
                            guest.status === 'Declined' ? 'text-red-500' : 'text-orange-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              guest.status === 'Confirmed' ? 'bg-emerald-500' : 
                              guest.status === 'Declined' ? 'bg-red-500' : 'bg-orange-400'
                            }`} />
                            {guest.status}
                          </div>
                        </td>
                        <td className="px-8 py-5 flex items-center justify-end gap-3 whitespace-nowrap">
                          {guest.status === 'Pending' ? (
                            <button 
                              onClick={() => setModalState('resendConfirm')} // TRIGGERS RESEND MODAL
                              className="px-4 py-1.5 rounded-lg border border-[#6B4EFF] text-[#6B4EFF] text-xs font-semibold hover:bg-[#6B4EFF]/5 transition-colors cursor-pointer"
                            >
                              Resend
                            </button>
                          ) : (
                            <button className="px-4 py-1.5 rounded-lg border border-[#6B4EFF] text-[#6B4EFF] text-xs font-semibold hover:bg-[#6B4EFF]/5 transition-colors cursor-pointer">
                              Edit
                            </button>
                          )}
                          <button 
                            onClick={() => setModalState('removeConfirm')} // TRIGGERS REMOVE MODAL
                            className="px-4 py-1.5 rounded-lg border border-red-500 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-8 border-t border-slate-100 flex flex-row items-center justify-between gap-4">
                <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                
                <div className="flex items-center gap-1 overflow-x-auto">
                  {renderPaginationNumbers()}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-4 py-2 border rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                      currentPage === 1 
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed' 
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-4 py-2 border rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                      currentPage === totalPages 
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed' 
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, iconBg, iconColor, value, label }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
    <div className={`w-14 h-14 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="truncate">
      <h4 className="text-3xl font-extrabold text-slate-900 leading-tight">{value}</h4>
      <p className="text-[11px] font-medium text-slate-400 uppercase mt-1 tracking-wide truncate">{label}</p>
    </div>
  </div>
);

export default GuestManagement;
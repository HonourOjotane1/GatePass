import React, { useState, useEffect } from "react";
import Checkins from "../assets/icons/Checkins.svg";
import RSVPrate from "../assets/icons/RSVPrate.svg";
import Totalevents from "../assets/icons/Totalevents.svg";
import Totalguests from "../assets/icons/Totalguests.svg";
import dashboardbanner from "../assets/dashboardbanner.png";
import Eventsaround from "../assets/Eventsaround.png";
import rafiki from "../assets/rafiki.svg";
import userImg from "../assets/user.png";
import emptyStateImg from "../assets/guest-empty-state.svg";

import {
  Search,
  Bell,
  Calendar,
  MapPin,
  ChevronDown,
  TimerIcon,
  Loader2
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Dashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    total_events: 0,
    total_guests: 0,
    upcoming_events_count: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Determine if the user has any events
  const isEmpty = stats.total_events === 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const statsResponse = await api.get('/events/dashboard');
        setStats(statsResponse.data);

        if (statsResponse.data.total_events > 0) {
            const eventsResponse = await api.get('/events/');
            setUpcomingEvents(eventsResponse.data.events || []); 
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#6B4EFF] w-10 h-10" />
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <header className="h-20 bg-white shadow py-4 px-10 flex items-center justify-between sticky top-0 z-20 font-poppins">
        <div className="flex items-center gap-8 flex-1">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.first_name || user?.username || 'Organizer'}
          </h1>
          <div className="relative w-full max-w-lg">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search events or guests..."
              className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl border-none focus:ring-2 focus:ring-[#6B4EFF]/20 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2.5 bg-[#F3F4F6] text-slate-600 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
            <Bell size={20} fill="#6B4EFF" stroke="false" />
          </button>
          <div className="flex items-center gap-3 pl-2 cursor-pointer">
            <img src={userImg} alt="User" className="w-9 h-9 rounded-full object-cover" />
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <div className="relative p-10 space-y-8 font-poppins">
        
        {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
            </div>
        )}

        {/* STATS SECTION */}
        <div className="grid grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-12 h-12 bg-[#6B4EFF]/10 rounded-xl flex items-center justify-center shrink-0">
               <img src={Totalevents} alt="Events" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{stats.total_events}</h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase mt-0.5">
                Total Events
              </p>
              {!isEmpty && (
                <p className="text-[10px] mt-1 text-slate-400">
                  <span className="text-emerald-500 font-bold">Top 75%</span> of all users
                </p>
              )}
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
               <img src={Totalguests} alt="Guests" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{stats.total_guests ? stats.total_guests : "-"}</h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase mt-0.5">
                Total Guests Invited
              </p>
              {!isEmpty && (
                <p className="text-[10px] mt-1 text-slate-400">
                  0 guest invite this week
                </p>
              )}
            </div>
          </div>

          {/* Stat 3 (Placeholder data until API provides the data) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
               <img src={RSVPrate} alt="RSVP" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{isEmpty ? "-" : "86%"}</h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase mt-0.5">
                Overall RSVP Rate
              </p>
              {!isEmpty && (
                <p className="text-[10px] mt-1 text-slate-400">
                  <span className="text-emerald-500 font-bold">Top 75%</span> of all users
                </p>
              )}
            </div>
          </div>

          {/* Stat 4 (Placeholder data until API provides the data) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-12 h-12 bg-[#6B4EFF]/10 rounded-xl flex items-center justify-center shrink-0">
               <img src={Checkins} alt="Checkin" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{isEmpty ? "-" : "100%"}</h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase mt-0.5">
                Check-ins
              </p>
              {!isEmpty && (
                <p className="text-[10px] mt-1 text-slate-400">
                  <span className="text-emerald-500 font-bold">Top 1%</span> of all users
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CONDITIONALLY RENDER EMPTY OR FILLED STATE */}
        {isEmpty ? (
          
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 mt-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[500px]">
            <img 
              src={emptyStateImg || "https://via.placeholder.com/400x300/ffffff/e2e8f0?text=No+Event+Illustration"} 
              alt="No Events" 
              className="w-72 h-72 object-contain mb-8 opacity-90"
            />
            <h3 className="text-2xl font-semibold text-slate-900 mb-10">No Event Yet!</h3>
            
            <div className="flex flex-col w-full max-w-sm gap-4">
              <Link 
                to="/dashboard/create-event" 
                className="w-full bg-[#6B4EFF] text-white py-4 rounded-xl font-bold text-center hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer"
              >
                Create an Event Now
              </Link>
              <button 
                className="w-full bg-white border border-[#6B4EFF] text-[#6B4EFF] py-4 rounded-xl font-bold hover:bg-[#6B4EFF]/5 transition-all cursor-pointer"
              >
                Download RSVP Template
              </button>
            </div>
          </div>

        ) : (
          
          /* FILLED STATE */
          <>
            {/* MIDDLE SECTION */}
            <div className="flex gap-4">
              {/* Banner Card - Using the first upcoming event as the featured event */}
              <div className="w-full max-w-3/5 col-span-2 relative rounded-3xl overflow-hidden bg-slate-900 min-h-[280px] flex group shadow-sm">
                <img
                  src={upcomingEvents[0]?.cover_image_url || dashboardbanner}
                  alt="Event Banner"
                  className="absolute w-full h-full object-cover"
                />
                <div className="relative z-10 py-6 px-8 flex flex-col justify-between text-white w-full bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-3xl font-semibold mb-4">
                      {upcomingEvents[0]?.title || "Upcoming Event"}
                    </h2>
                    <span className="text-xs font-semibold uppercase tracking-widest mb-2">
                      Your Next Event
                    </span>
                  </div>
                  <p className="text-sm opacity-70 max-w-md leading-relaxed line-clamp-2">
                    {upcomingEvents[0]?.description || "Get ready for your upcoming event."}
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex gap-5">
                      <span className="flex items-center gap-2">
                        <Calendar size={16} /> 
                        {upcomingEvents[0]?.start_datetime ? new Date(upcomingEvents[0].start_datetime).toLocaleDateString() : 'TBD'}
                      </span>
                      <span className="flex items-center gap-2">
                        <TimerIcon size={16} /> 
                        {upcomingEvents[0]?.start_datetime ? new Date(upcomingEvents[0].start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
                      </span>
                    </div>
                    <span className="flex items-center gap-2">
                      <MapPin size={16} /> {upcomingEvents[0]?.location || 'TBD'}
                    </span>
                  </div>
                  <Link 
                    to={`/dashboard/event/${upcomingEvents[0]?.id}`}
                    className="absolute right-10 bottom-10 bg-white text-[#6B4EFF] px-8 py-3 rounded-xl font-bold text-xs hover:shadow-xl transition-all cursor-pointer"
                  >
                    Event Details
                  </Link>
                </div>
              </div>

              {/* Template Card */}
              <div className="w-full max-w-2/5 bg-white shadow-sm border border-slate-100 rounded-3xl p-8 flex gap-4 flex-row-reverse items-center">
                <div className="w-1/2 flex items-center justify-center">
                  <img src={rafiki} alt="RSVP Template" />
                </div>
                <div className="flex flex-col text-start w-1/2">
                  <h3 className="font-bold text-xl mb-3">RSVP Template</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-8">
                    Before creating a new event, make sure your guest list is ready.
                    Download the official GatePass RSVP template and fill in the
                    details of your invitees.
                  </p>
                  <button className="w-full bg-[#6B4EFF] text-white text-xs py-3 rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer">
                    Download Template Now
                  </button>
                </div>
              </div>
            </div>

            {/* LOWER GRID */}
            <div className="grid grid-cols-3 gap-4">
              {/* Upcoming Events List */}
              <div className="col-span-2 bg-white border border-slate-100 shadow-sm rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Upcoming Events</h3>
                    <p className="text-xs text-slate-400">
                      Here are your upcoming events
                    </p>
                  </div>
                  <NavLink to="create-event" className="bg-[#6B4EFF] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#583DD9] transition-colors cursor-pointer">
                    Create Event
                  </NavLink>
                </div>

                <div className="divide-y divide-slate-50">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.slice(0, 5).map((event) => (
                      <EventItem
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        date={new Date(event.start_datetime).toLocaleDateString()}
                        loc={event.location || "TBA"}
                        // Placeholder RSVP logic until endpoint is connected
                        rsvp="0/0" 
                        progress={0}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 py-4">No upcoming events found.</p>
                  )}
                </div>
              </div>

              {/* Discover Card */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-3xl py-5 px-3 flex flex-col">
                <h3 className="text-xl font-semibold mb-1 ml-2">Events Around You</h3>
                <p className="text-xs text-slate-400 mb-6 ml-2">
                  Based on your current location
                </p>

                <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[350px]">
                  <img
                    src={Eventsaround}
                    alt="A group of people partying in an intimate concert atmosphere"
                    className="absolute w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 py-5 px-8 flex flex-col justify-end text-white bg-gradient-to-t from-slate-900 to-transparent opacity-90">
                    <h4 className="text-xl font-bold mb-2">
                      Lagos Afrobeats Night
                    </h4>
                    <p className="text-[8px] mb-4 text-slate-200">
                      A high-energy live performance featuring top Afrobeats artists
                      in an intimate concert atmosphere. Perfect for music lovers
                      looking for a vibrant Friday night.
                    </p>
                    <div className="flex gap-2 text-[8px] text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} /> Thur,28th Nov, 2025
                      </span>
                      <span className="flex items-center gap-1.5">
                        <TimerIcon size={12} /> 2:00pm
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} /> Hard Rock Café, Lagos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const EventItem = ({ id, title, date, loc, rsvp, progress }) => (
  <div className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
    <div className="max-w-[40%]">
      <h4 className="mb-1 truncate font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-400 truncate">
        {date} • {loc}
      </p>
    </div>
    <div className="flex items-center gap-10">
      <div className="w-40 hidden md:block">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
          <span className="font-medium text-[#474747]">RSVPs</span>
          <span className="text-[#151033]">{rsvp}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#6B4EFF] h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <Link 
        to={`/dashboard/event/${id}`}
        className="cursor-pointer border-2 border-[#6B4EFF] px-5 py-2 rounded-xl text-xs font-semibold text-[#6B4EFF] hover:bg-[#6B4EFF]/5 transition-colors whitespace-nowrap"
      >
        Manage Event
      </Link>
    </div>
  </div>
);

export default Dashboard;
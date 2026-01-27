import { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { NavLink, Link } from "react-router";

import techSummitImg from "../assets/tech-summit.png";
import healthTechImg from "../assets/healthtech.png";
import musicFestImg from "../assets/music-fest.png";
import weddingExpoImg from "../assets/wedding-expo.png";
import startupMeetupImg from "../assets/startup-meetup.png";
import techInnoImg from "../assets/tech-inno.png";
import aiConferenceImg from "../assets/ai-conference.png";

const MyEvents = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Sample events data
  const allEvents = [
    {
      id: 1,
      title: "Tech Innovators Summit 2025",
      date: "Fri, 19 Dec 2025",
      location: "Oriental Hotel, Lagos",
      image: techSummitImg,
      status: "upcoming",
    },
    {
      id: 2,
      title: "HealthTech Innovation Forum",
      date: "Wed, 10 Dec 2025",
      location: "Civic Centre, Lagos",
      image: healthTechImg,
      status: "upcoming",
    },
    {
      id: 3,
      title: "Lagos Live Music Fest",
      date: "Sat, 6 Dec 2025",
      location: "Tafawa Balewa Square, Lagos",
      image: musicFestImg,
      status: "upcoming",
    },
    {
      id: 4,
      title: "Wedding Expo Africa 2025",
      date: "Thu, 27 Nov 2025",
      location: "Radisson Blu, Victoria Island",
      image: weddingExpoImg,
      status: "upcoming",
    },
    {
      id: 5,
      title: "Startup Connect Meetup",
      date: "Sat, 23 Nov 2025",
      location: "Landmark Event Centre, Lagos",
      image: startupMeetupImg,
      status: "upcoming",
    },
    {
      id: 6,
      title: "Tech Innovators Summit 2025",
      date: "Fri, 15 Nov 2025",
      location: "Eko Hotel, Lagos",
      image: techSummitImg,
      status: "past",
    },
    {
      id: 7,
      title: "Africa Fashion Week Showcase",
      date: "Fri, 19 Dec 2025",
      location: "Oriental Hotel, Lagos",
      image: techInnoImg,
      status: "upcoming",
    },
    {
      id: 8,
      title: "AI & Future Tech Conference 2025",
      date: "Thu, 25 Sep 2025",
      location: "Muson Centre, Lagos",
      image: aiConferenceImg,
      status: "past",
    },
  ];

  // Filter events based on active tab
  const filteredEvents =
    activeTab === "all"
      ? allEvents
      : allEvents.filter((event) => event.status === activeTab);

  return (
    <>
      {/* HEADER */}
      <header className="h-20 bg-white shadow py-4 px-10 flex items-center justify-between sticky top-0 z-20 font-poppins">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">My Events</h1>
          </div>
        </div>
        <div className="relative w-full max-w-lg">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search name, date, or location..."
            className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl border-none focus:ring-2 focus:ring-[#6B4EFF]/20 text-sm"
          />
        </div>

        <div className="flex items-center gap-6">
          <NavLink
            to="/dashboard/create-event"
            className="bg-[#6B4EFF] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#5a3ee6] transition-colors"
          >
            Create Event
          </NavLink>
        </div>
      </header>

      {/* CONTENT */}
      <div className="p-10">
        {/* FILTER TABS */}
        <div className="flex items-center gap-6 mb-8 w-full bg-white p-4 rounded-2xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-12 py-3 rounded-full font-semibold text-base transition-all w-full cursor-pointer ${
              activeTab === "all"
                ? "bg-[#6B4EFF] text-white shadow-lg shadow-[#6B4EFF]/20"
                : "bg-white text-slate-500 hover:text-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-12 py-3 rounded-full font-semibold text-base transition-all w-full cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-[#6B4EFF] text-white shadow-lg shadow-[#6B4EFF]/20"
                : "bg-white text-slate-500 hover:text-slate-700"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-12 py-3 rounded-full font-semibold text-base transition-all w-full cursor-pointer ${
              activeTab === "past"
                ? "bg-[#6B4EFF] text-white shadow-lg shadow-[#6B4EFF]/20"
                : "bg-white text-slate-500 hover:text-slate-700"
            }`}
          >
            Past
          </button>
        </div>

        {/* EVENTS LIST */}
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center">
              <p className="text-slate-500 text-lg">
                No {activeTab === "all" ? "" : activeTab} events found
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Event Card Component
function EventCard({ event }) {
  return (
    <div className="bg-white rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-shadow border border-slate-100">
      <div className="flex items-center gap-6">
        {/* Event Image */}
        <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Details */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {event.title}
          </h3>
          <p className="text-slate-500 text-sm">
            {event.date} · {event.location}
          </p>
        </div>
      </div>

      {/* View Details Button */}
      <NavLink
        to={`/dashboard/event/${event.id}`}
        className="border-2 border-[#6B4EFF] text-[#6B4EFF] px-8 py-3 rounded-xl font-semibold hover:bg-[#6B4EFF] hover:text-white transition-colors"
      >
        View Details
      </NavLink>
    </div>
  );
}
export default MyEvents;

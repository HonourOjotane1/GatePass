import { useState, useEffect } from "react";
import { Search, ArrowLeft, Loader2 } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import api from "../utils/api";
import techSummitImg from "../assets/tech-summit.png";

const MyEvents = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/events/');
        setEvents(response.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load your events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    let matchesTab = true;
    if (activeTab === "upcoming") {
      matchesTab = ["draft", "published"].includes(event.status?.toLowerCase());
    } else if (activeTab === "past") {
      matchesTab = ["ended", "cancelled"].includes(event.status?.toLowerCase());
    }

    const searchLower = searchQuery.toLowerCase();
    const titleMatch = (event.event_name || event.title || "").toLowerCase().includes(searchLower);
    const locMatch = (event.venue_name || event.address || "").toLowerCase().includes(searchLower);
    const matchesSearch = titleMatch || locMatch;

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-[#6B4EFF] w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* HEADER */}
      <header className="h-20 bg-white shadow py-4 px-10 flex items-center justify-between sticky top-0 z-20 font-poppins">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">My Events</h1>
          </div>
        </div>
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or location..."
            className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl border-none focus:ring-2 focus:ring-[#6B4EFF]/20 text-sm outline-none"
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
      <div className="p-10 font-poppins">
        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
            </div>
        )}

        {/* FILTER TABS */}
        <div className="flex items-center gap-6 mb-8 w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-12 py-3 rounded-full font-semibold text-base transition-all w-full cursor-pointer ${
              activeTab === "all" ? "bg-[#6B4EFF] text-white shadow-lg shadow-[#6B4EFF]/20" : "bg-white text-slate-500 hover:text-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-12 py-3 rounded-full font-semibold text-base transition-all w-full cursor-pointer ${
              activeTab === "upcoming" ? "bg-[#6B4EFF] text-white shadow-lg shadow-[#6B4EFF]/20" : "bg-white text-slate-500 hover:text-slate-700"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-12 py-3 rounded-full font-semibold text-base transition-all w-full cursor-pointer ${
              activeTab === "past" ? "bg-[#6B4EFF] text-white shadow-lg shadow-[#6B4EFF]/20" : "bg-white text-slate-500 hover:text-slate-700"
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
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-lg">
                No {activeTab === "all" ? "" : activeTab} events found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function EventCard({ event }) {
  const formattedDate = event.start_date 
    ? new Date(event.start_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'TBA';

  const title = event.event_name || event.title || 'Untitled Event';
  const location = event.is_virtual ? "Virtual" : (event.venue_name || event.address || 'Location TBA');
  
  const imageUrl = event.cover_image_url && event.cover_image_url !== "string"
    ? event.cover_image_url 
    : techSummitImg;

  return (
    <div className="bg-white rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-shadow border border-slate-100">
      <div className="flex items-center gap-6">
        <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm">
            {formattedDate} · {location}
          </p>
          <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded">
            {event.status || 'Draft'}
          </span>
        </div>
      </div>
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
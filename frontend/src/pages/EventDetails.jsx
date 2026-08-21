import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";

const EventDetails = () => {
  const { id } = useParams(); 
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        // Fetch event that matches the ID.
        // If backend has a specific endpoint like `/events/${id}`, use that instead
        const response = await api.get('/events/');
        const allEvents = response.data.events || [];
        
        const foundEvent = allEvents.find(e => e.id === id);
        
        if (foundEvent) {
            setEvent(foundEvent);
        } else {
            setError("Event not found.");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }

      //  try {
      //   setLoading(true);
      //   const response = await api.get(`/events/${id}`);
      //   setEvent(response.data);
      // } catch (err) {
      //   console.error("Error fetching event details:", err);
      //   setError("Failed to load event details.");
      // } finally {
      //   setLoading(false);
      // }

    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-[#6B4EFF] w-10 h-10" />
      </div>
    );
  }

  if (error || !event) {
    return (
        <div className="p-10 text-center font-poppins">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{error || "Event not found"}</h2>
            <Link to="/dashboard/my-events" className="text-[#6B4EFF] underline">Go back to My Events</Link>
        </div>
    );
  }

  // Calculate RSVP/Ticket percentage
  const totalCapacity = event.total_tickets || event.capacity || 0;
  const currentRsvps = event.tickets_sold || event.check_ins || 0;
  const rsvpPercentage = totalCapacity > 0 ? (currentRsvps / totalCapacity) * 100 : 0;

  // Format Dates
  const startDateStr = event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD';
  const endDateStr = event.end_date ? new Date(event.end_date).toLocaleDateString() : 'TBD';

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-poppins">
      {/* HEADER */}
      <header className="h-20 bg-white shadow py-4 px-10 flex items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/my-events"
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Events Details</h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className="p-10">
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
          {/* Event Header */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2 capitalize">
                {event.event_name || event.title}
              </h2>
              <p className="text-slate-400 text-lg capitalize">{event.category || "Uncategorized"}</p>
              <span className="inline-block mt-3 text-xs uppercase tracking-wider font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded">
                Status: {event.status || 'Draft'}
              </span>
            </div>

            {/* RSVP Stats */}
            <div className="text-right">
              <p className="text-slate-400 text-sm font-medium mb-2">Tickets Sold / RSVPs</p>
              <p className="text-3xl font-bold text-gray-900 mb-3">
                {currentRsvps} {totalCapacity > 0 && `/ ${totalCapacity}`}
              </p>
              {totalCapacity > 0 && (
                <div className="w-52 bg-slate-100 h-2.5 rounded-full overflow-hidden ml-auto">
                    <div
                    className="h-full bg-[#6B4EFF] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(rsvpPercentage, 100)}%` }}
                    ></div>
                </div>
              )}
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
            {/* Row 1 */}
            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Event Name</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{event.event_name || event.title}</p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Event Description</p>
              <p className="text-lg font-bold text-gray-900 line-clamp-3">
                {event.description || "No description provided."}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Event Type</p>
              <p className="text-xl font-bold text-gray-900 capitalize">
                  {event.event_type || (event.is_virtual ? "Virtual" : "In-Person")}
              </p>
            </div>

            {/* Row 2 */}
            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Event Category</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{event.category || "General"}</p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Event Start</p>
              <p className="text-xl font-bold text-gray-900">
                {startDateStr} {event.start_time && `- ${event.start_time}`}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Event End</p>
              <p className="text-xl font-bold text-gray-900">
                 {endDateStr} {event.end_time && `- ${event.end_time}`}
              </p>
            </div>

            {/* Row 3 */}
            <div className="col-span-1 md:col-span-2">
              <p className="text-slate-400 text-sm font-medium mb-3">Venue / Location</p>
              <p className="text-xl font-bold text-gray-900">
                {event.is_virtual ? (event.virtual_link || "Virtual Link TBA") : `${event.venue_name || ''} ${event.address || ''}`.trim() || event.location || "TBA"}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Access Type</p>
              <p className="text-xl font-bold text-gray-900 capitalize">
                {event.access_type || "Open"}
              </p>
            </div>

            {/* Row 4 (Ticketing) */}
            {event.access_type === 'ticketed' && (
                <>
                    <div>
                    <p className="text-slate-400 text-sm font-medium mb-3">Ticket Name</p>
                    <p className="text-xl font-bold text-gray-900 capitalize">{event.ticket_name || "General Admission"}</p>
                    </div>

                    <div>
                    <p className="text-slate-400 text-sm font-medium mb-3">Ticket Price</p>
                    <p className="text-xl font-bold text-gray-900">
                        {event.is_free ? "Free" : `₦${event.ticket_price || 0}`}
                    </p>
                    </div>

                    <div>
                    <p className="text-slate-400 text-sm font-medium mb-3">Ticket Description</p>
                    <p className="text-xl font-bold text-gray-900">{event.ticket_description || "-"}</p>
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EventDetails;
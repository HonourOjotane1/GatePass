import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();

  // Sample event data - replace with actual data fetching
  const event = {
    id: id,
    name: "Startup Connect Meetup",
    category: "Business",
    description: "Event for business professionals and start-ups",
    type: "Private",
    startDate: "12th Dec, 2025 - 2:00pm",
    endDate: "14th Dec, 2025 - 6:00pm",
    venueName: "Virtual Event",
    accessType: "Ticketed",
    ticketName: "Startup Ticket",
    ticketPrice: "₦10,000",
    ticketQuantity: "1000",
    ticketDescription: "1000",
    rsvps: 124,
    totalCapacity: 150,
  };

  // Calculate RSVP percentage
  const rsvpPercentage = (event.rsvps / event.totalCapacity) * 100;

  return (
    <>
      {/* HEADER */}
      <header className="h-20 bg-white shadow py-4 px-10 flex items-center sticky top-0 z-20 font-poppins">
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
        <div className="bg-white rounded-3xl p-10">
          {/* Event Header */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {event.name}
              </h2>
              <p className="text-slate-400 text-lg">{event.category}</p>
            </div>

            {/* RSVP Stats */}
            <div className="text-right">
              <p className="text-slate-400 text-sm font-medium mb-2">RSVPs</p>
              <p className="text-3xl font-bold text-gray-900 mb-3">
                {event.rsvps}/{event.totalCapacity}
              </p>
              <div className="w-52 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6B4EFF] rounded-full transition-all duration-500"
                  style={{ width: `${rsvpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-3 gap-x-12 gap-y-10">
            {/* Row 1 */}
            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Event Name
              </p>
              <p className="text-xl font-bold text-gray-900">{event.name}</p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Event Description
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.description}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Event Type
              </p>
              <p className="text-xl font-bold text-gray-900">{event.type}</p>
            </div>

            {/* Row 2 */}
            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Event Category
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.category}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Event Start Date & Time
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.startDate}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Event End Date & Time
              </p>
              <p className="text-xl font-bold text-gray-900">{event.endDate}</p>
            </div>

            {/* Row 3 */}
            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Venue Name
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.venueName}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Access Type
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.accessType}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Ticket Name
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.ticketName}
              </p>
            </div>

            {/* Row 4 */}
            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Ticket Price
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.ticketPrice}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Ticket Quantity
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.ticketQuantity}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">
                Ticket Description
              </p>
              <p className="text-xl font-bold text-gray-900">
                {event.ticketDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default EventDetails;
import React, { useState } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  X,
  Calendar as CalendarIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import userAvatar from "../assets/user.png";
import analyticsRafiki from "../assets/analytics-rafiki.svg";

const Analytics = () => {
  const [selectedEvent, setSelectedEvent] = useState("All Events");
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const eventOptions = [
    "All Events",
    "Startup Connect Meetup",
    "Lagos Tech Summit",
    "Designers Meetup",
  ];

  // --- MOCK DATA ---
  const allEventsTableData = [
    {
      id: 1,
      name: "Startup Connect Meetup",
      invited: 350,
      confirmed: 240,
      attended: 210,
    },
    {
      id: 2,
      name: "Lagos Tech Summit",
      invited: 600,
      confirmed: 420,
      attended: 380,
    },
    {
      id: 3,
      name: "Designers Meetup",
      invited: 180,
      confirmed: 120,
      attended: 110,
    },
  ];

  const singleEventTableData = [
    {
      id: 1,
      category: "Regular Guests",
      invited: 200,
      rsvp: 140,
      attended: 130,
      rate: "65%",
    },
    {
      id: 2,
      category: "VIP Guests",
      invited: 40,
      rsvp: 30,
      attended: 28,
      rate: "93%",
    },
    {
      id: 3,
      category: "Speakers",
      invited: 10,
      rsvp: 10,
      attended: 10,
      rate: "100%",
    },
    {
      id: 4,
      category: "Media",
      invited: 20,
      rsvp: 12,
      attended: 12,
      rate: "100%",
    },
    {
      id: 5,
      category: "Staff",
      invited: 80,
      rsvp: 48,
      attended: 30,
      rate: "62%",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-poppins relative">
      {/* EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl w-full max-w-[450px] relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-slate-200 rounded-full p-1"
            >
              <X size={16} />
            </button>

            <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8 mt-2">
              Select Date Range
            </h2>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setIsExportModalOpen(false);
              }}
            >
              {/* Only show Event dropdown if "All Events" is currently selected on the main page */}
              {selectedEvent === "All Events" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">
                    Event
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none appearance-none bg-white text-slate-600 text-sm">
                      <option>All Events</option>
                      <option>Startup Connect Meetup</option>
                      <option>Lagos Tech Summit</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">From</label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] outline-none text-slate-600 text-sm appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <CalendarIcon
                    className="absolute right-4 text-slate-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">To</label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] outline-none text-slate-600 text-sm appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <CalendarIcon
                    className="absolute right-4 text-slate-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#6B4EFF] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:bg-[#583DD9] transition-all mt-4 cursor-pointer"
              >
                Download PDF
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm py-4 px-10 flex items-center justify-between sticky top-0 z-30 font-poppins">
        <div className="flex items-center gap-4">
          {/* Show back button only when a specific event is selected */}
          {selectedEvent !== "All Events" && (
            <button
              onClick={() => setSelectedEvent("All Events")}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-2xl font-bold whitespace-nowrap text-slate-900">
            {selectedEvent === "All Events" ? "Analytics" : "Event Analytics"}
          </h1>
        </div>

        <div className="flex items-center gap-6 ml-4">
          <button className="relative p-2.5 bg-[#F3F4F6] text-slate-600 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
            <Bell size={20} fill="#6B4EFF" stroke="none" />
          </button>
          <div className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src={userAvatar}
              alt="User"
              className="w-9 h-9 rounded-full object-cover"
            />
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="p-8 lg:p-10">
        {/* Page Controls Top Bar */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">
              {selectedEvent === "All Events"
                ? "All-Time Analytics"
                : selectedEvent}
            </h2>
            <p className="text-sm text-slate-400">
              Manage guest lists, RSVP statuses, and event access.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Event Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                className="flex items-center justify-between gap-3 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 w-fit transition-colors cursor-pointer"
              >
                <span className="truncate">
                  {selectedEvent === "All Events"
                    ? "Select Event"
                    : selectedEvent}
                </span>
                <ChevronDown size={16} className="text-slate-400 shrink-0" />
              </button>
              {isEventDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-lg z-10 py-2 animate-in fade-in zoom-in-95">
                  {eventOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedEvent(opt);
                        setIsEventDropdownOpen(false);
                      }}
                      className="w-full text-left px-5 py-2.5 text-sm hover:bg-slate-50 cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Range Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="flex items-center justify-between gap-3 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 w-fit transition-colors cursor-pointer"
              >
                Time Range{" "}
                <ChevronDown size={16} className="text-slate-400 shrink-0" />
              </button>
              {isTimeDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-lg z-10 py-2 animate-in fade-in zoom-in-95">
                  {["Last 7 Days", "Last 30 Days", "This Year", "All Time"].map(
                    (opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setIsTimeDropdownOpen(false)}
                        className="w-full text-left px-5 py-2.5 text-sm hover:bg-slate-50 cursor-pointer"
                      >
                        {opt}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-[#6B4EFF] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#583DD9] transition-all cursor-pointer"
            >
              Export
            </button>
          </div>
        </div>

        {/* --- DYNAMIC CHARTS GRID --- */}
        {selectedEvent === "All Events" ? (
          /* VIEW 1: ALL EVENTS (3 Column Top Row) */
          <>
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Line Chart Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[340px]">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">
                  Attendance Growth Over Time
                </h3>
                <div className="flex-1 w-full relative mb-4">
                  <MockLineChartAllEvents />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Attendance has increased{" "}
                  <span className="text-emerald-500 font-bold">42%</span> over
                  the past 5 months.
                </p>
              </div>

              {/* Pie Chart Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[340px]">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">
                  Guest Type Distribution
                </h3>
                <div className="flex-1 flex items-center justify-center gap-6">
                  <MockDonutChart />
                  <MockLegend />
                </div>
                <p className="text-sm text-slate-500 font-medium mt-4">
                  <span className="text-emerald-500 font-bold">
                    Regular guests
                  </span>{" "}
                  form the majority of event attendees.
                </p>
              </div>

              {/* Bar Chart Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[340px]">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">
                  Peak Check-In Times
                </h3>
                <div className="flex-1 w-full relative mb-4">
                  <MockBarChart />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Most guests arrive within the{" "}
                  <span className="text-emerald-500 font-bold">
                    first two hours
                  </span>{" "}
                  of the event.
                </p>
              </div>
            </div>

            {/* Bottom Row (Table + Illustration) */}
            <div className="grid grid-cols-5 gap-6">
              {/* Table */}
              <div className="col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                <div className="p-6 pb-2">
                  <h3 className="font-bold text-slate-900 text-lg">
                    RSVP vs Event Attendance
                  </h3>
                </div>
                <div className="flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-y border-slate-100">
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          Name
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          Invited
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          Confirmed
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          Attended
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allEventsTableData.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          <td className="px-6 py-5 text-sm font-medium text-slate-700">
                            {row.name}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {row.invited}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {row.confirmed}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {row.attended}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Table Pagination Mock */}
                <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-400 font-medium">
                    Page 1 of 30
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400 px-1">
                      1
                    </span>
                    <span className="text-sm font-medium text-slate-400 px-1">
                      2
                    </span>
                    <span className="text-sm font-bold bg-[#6B4EFF]/10 text-[#6B4EFF] w-8 h-8 rounded-lg flex items-center justify-center">
                      3
                    </span>
                    <span className="text-sm font-medium text-slate-400 px-1">
                      ...
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col justify-center">
                <img
                  src={analyticsRafiki}
                  alt="Presentation Illustration"
                  className="w-full h-48 object-cover rounded-xl mb-6 opacity-90"
                />
                <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
                  Your highest performing event was{" "}
                  <span className="text-[#6B4EFF] font-bold cursor-pointer hover:underline">
                    Lagos Tech Summit
                  </span>{" "}
                  with a{" "}
                  <span className="text-[#6B4EFF] font-bold">
                    90% attendance rate
                  </span>
                  .{" "}
                  <span className="font-bold text-slate-900">
                    VIP guests have a 95% attendance rate
                  </span>
                  , significantly higher than regular guests.
                </p>
                <ul className="text-sm text-slate-600 space-y-2 font-medium list-disc pl-4">
                  <li>
                    Events scheduled before noon show higher attendance rates.
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          /* VIEW 2: INDIVIDUAL EVENT (2 Column Top Row) */
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Line Chart Card (Individual) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[340px]">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">
                  Attendance Timeline
                </h3>
                <div className="flex-1 w-full relative mb-4">
                  <MockLineChartIndividual />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Attendance has increased{" "}
                  <span className="text-emerald-500 font-bold">42%</span> over
                  the past 5 months.
                </p>
              </div>

              {/* Pie Chart Card (Individual) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[340px]">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">
                  Guest Type Distribution
                </h3>
                <div className="flex-1 flex items-center justify-center gap-10">
                  <MockDonutChart />
                  <MockLegend />
                </div>
                <p className="text-sm text-slate-500 font-medium mt-4">
                  <span className="text-emerald-500 font-bold">
                    Regular guests
                  </span>{" "}
                  form the majority of event attendees.
                </p>
              </div>
            </div>

            {/* Bottom Row (Table + Illustration) */}
            <div className="grid grid-cols-5 gap-6">
              {/* Table */}
              <div className="col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                <div className="p-6 pb-2">
                  <h3 className="font-bold text-slate-900 text-lg">
                    RSVP vs Event Attendance
                  </h3>
                </div>
                <div className="flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-y border-slate-100">
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          Guest Category
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          Invited
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          RSVP
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          Attended
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                          Attendance Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {singleEventTableData.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          <td className="px-6 py-5 text-sm font-medium text-slate-700">
                            {row.category}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {row.invited}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {row.rsvp}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {row.attended}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {row.rate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Card */}
              <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col justify-center">
                <img
                  src={analyticsRafiki}
                  alt="Presentation Illustration"
                  className="w-full h-48 object-cover rounded-xl mb-6 opacity-90"
                />
                <ul className="text-sm text-slate-600 space-y-3 font-medium list-disc pl-4">
                  <li>VIP guests had the highest attendance rate (93%)</li>
                  <li>Peak arrival occurred 30 minutes after event start</li>
                  <li>12 manual check-ins were recorded</li>
                  <li>30 guests confirmed but did not attend</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* --- MOCK CHART COMPONENTS (CSS/SVG Based for accuracy without external libraries) --- */

const MockLineChartAllEvents = () => (
  <div className="w-full h-full relative flex items-end pb-6">
    {/* Y Axis Labels */}
    <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-medium">
      <span>1100</span>
      <span>1000</span>
      <span>900</span>
      <span>800</span>
      <span>700</span>
      <span>600</span>
    </div>
    {/* Chart Area */}
    <div className="ml-8 w-full h-full relative">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between border-l border-b border-slate-100">
        <div className="w-full border-t border-slate-100 h-0"></div>
        <div className="w-full border-t border-slate-100 h-0"></div>
        <div className="w-full border-t border-slate-100 h-0"></div>
        <div className="w-full border-t border-slate-100 h-0"></div>
        <div className="w-full border-t border-slate-100 h-0"></div>
      </div>
      {/* SVG Line and Area */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#6B4EFF", stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#6B4EFF", stopOpacity: 0 }}
            />
          </linearGradient>
        </defs>
        <path
          d="M 0 80 Q 20 80, 25 60 T 50 40 T 75 20 T 100 10 L 100 100 L 0 100 Z"
          fill="url(#grad1)"
        />
        <path
          d="M 0 80 Q 20 80, 25 60 T 50 40 T 75 20 T 100 10"
          fill="none"
          stroke="#6B4EFF"
          strokeWidth="2"
        />
        {/* Points */}
        <circle
          cx="0"
          cy="80"
          r="3"
          fill="white"
          stroke="#6B4EFF"
          strokeWidth="1.5"
        />
        <circle
          cx="25"
          cy="60"
          r="3"
          fill="white"
          stroke="#6B4EFF"
          strokeWidth="1.5"
        />
        <circle
          cx="50"
          cy="40"
          r="3"
          fill="white"
          stroke="#6B4EFF"
          strokeWidth="1.5"
        />
        <circle
          cx="75"
          cy="20"
          r="3"
          fill="white"
          stroke="#6B4EFF"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="10"
          r="3"
          fill="white"
          stroke="#6B4EFF"
          strokeWidth="1.5"
        />
      </svg>
      {/* X Axis Labels */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-slate-400 font-medium px-2">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
      </div>
    </div>
  </div>
);

const MockLineChartIndividual = () => (
  <div className="w-full h-full relative flex items-end pb-6 pt-6">
    <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-medium">
      <span className="opacity-0">Max</span>
      <span className="-rotate-90 origin-left absolute top-1/2 -left-2 tracking-widest uppercase">
        Guests Checked In
      </span>
    </div>
    <div className="ml-8 w-full h-full relative">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between border-l border-b border-slate-100">
        <div className="w-full border-t border-slate-100 h-0"></div>
        <div className="w-full border-t border-slate-100 h-0"></div>
        <div className="w-full border-t border-slate-100 h-0"></div>
      </div>
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#6B4EFF", stopOpacity: 0.2 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#6B4EFF", stopOpacity: 0 }}
            />
          </linearGradient>
        </defs>
        <path
          d="M 0 85 L 20 80 L 40 50 L 60 40 L 80 20 L 100 10 L 100 100 L 0 100 Z"
          fill="url(#grad2)"
        />
        <path
          d="M 0 85 L 20 80 L 40 50 L 60 40 L 80 20 L 100 10"
          fill="none"
          stroke="#6B4EFF"
          strokeWidth="2"
        />

        {/* Points & Labels */}
        <g textAnchor="middle" fontSize="4" fill="#64748b" fontWeight="600">
          <circle
            cx="0"
            cy="85"
            r="2"
            fill="white"
            stroke="#6B4EFF"
            strokeWidth="1.5"
          />
          <text x="0" y="80">
            25
          </text>

          <circle
            cx="20"
            cy="80"
            r="2"
            fill="white"
            stroke="#6B4EFF"
            strokeWidth="1.5"
          />
          <text x="20" y="75">
            25
          </text>

          <circle
            cx="40"
            cy="50"
            r="2"
            fill="white"
            stroke="#6B4EFF"
            strokeWidth="1.5"
          />
          <text x="40" y="45">
            140
          </text>

          <circle
            cx="60"
            cy="40"
            r="2"
            fill="white"
            stroke="#6B4EFF"
            strokeWidth="1.5"
          />

          <circle
            cx="80"
            cy="20"
            r="2"
            fill="white"
            stroke="#6B4EFF"
            strokeWidth="1.5"
          />
          <text x="80" y="15">
            220
          </text>

          <circle
            cx="100"
            cy="10"
            r="2"
            fill="white"
            stroke="#6B4EFF"
            strokeWidth="1.5"
          />
          <text x="98" y="5">
            210
          </text>
        </g>
      </svg>
      {/* X Axis Labels */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-slate-400 font-medium">
        <span>9:00 AM</span>
        <span>9:30 AM</span>
        <span>10:00 AM</span>
        <span>10:30 AM</span>
        <span>11:00 AM</span>
      </div>
    </div>
  </div>
);

const MockDonutChart = () => (
  <div
    className="relative w-48 h-48 rounded-full flex items-center justify-center shadow-inner"
    style={{
      background:
        "conic-gradient(#6B4EFF 0% 58%, #4ade80 58% 70%, #f97316 70% 78%, #facc15 78% 85%, #cbd5e1 85% 100%)",
    }}
  >
    <div className="w-24 h-24 bg-white rounded-full absolute shadow-sm"></div>
    {/* Labels positioned roughly where they belong */}
    <span className="absolute top-1/4 left-1/4 text-white font-bold text-xs">
      58%
    </span>
    <span className="absolute bottom-1/4 right-1/4 text-white font-bold text-xs">
      12%
    </span>
    <span className="absolute bottom-6 left-1/2 text-white font-bold text-[10px]">
      8%
    </span>
    <span className="absolute bottom-10 left-8 text-slate-700 font-bold text-[10px]">
      7%
    </span>
    <span className="absolute top-1/2 right-4 text-slate-700 font-bold text-[10px]">
      15%
    </span>
  </div>
);

const MockLegend = () => (
  <div className="flex flex-col gap-3 text-xs font-semibold text-slate-600">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[#6B4EFF]"></div> Regular Guests
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div> VIP Guests
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-slate-300"></div> Staff
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-orange-400"></div> Media
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-yellow-400"></div> Speakers
    </div>
  </div>
);

const MockBarChart = () => (
  <div className="w-full h-full relative flex items-end pb-6 pt-6">
    <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-medium">
      <span className="-rotate-90 origin-left absolute top-1/2 -left-2 tracking-widest uppercase">
        Guests Checked In
      </span>
    </div>
    <div className="ml-8 w-full h-full relative flex items-end justify-between px-2">
      {/* Bars */}
      <div className="w-8 bg-gradient-to-t from-[#6B4EFF]/20 to-[#6B4EFF] h-[30%] rounded-t-sm relative group">
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600">
          120
        </span>
      </div>
      <div className="w-8 bg-gradient-to-t from-[#6B4EFF]/20 to-[#6B4EFF] h-[50%] rounded-t-sm relative">
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600">
          340
        </span>
      </div>
      <div className="w-8 bg-gradient-to-t from-[#6B4EFF]/20 to-[#6B4EFF] h-[75%] rounded-t-sm relative">
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600">
          520
        </span>
      </div>
      <div className="w-8 bg-gradient-to-t from-[#6B4EFF]/20 to-[#6B4EFF] h-[100%] rounded-t-sm relative">
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600">
          300
        </span>
      </div>

      {/* X Axis */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[9px] text-slate-400 font-medium border-t border-slate-100 pt-2 px-1">
        <span>8:00-9:00</span>
        <span>9:00-10:00</span>
        <span>10:00-11:00</span>
        <span>11:00-12:00</span>
      </div>
    </div>
  </div>
);

export default Analytics;

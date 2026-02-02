// import logopurple from "../assets/Logo-purple.svg";
// import Checkins from "../assets/icons/Checkins.svg";
// import RSVPrate from "../assets/icons/RSVPrate.svg";
// import Totalevents from "../assets/icons/Totalevents.svg";
// import Totalguests from "../assets/icons/Totalguests.svg";
// import dashboardbanner from "../assets/dashboardbanner.png";
// import Eventsaround from "../assets/Eventsaround.png";
// import rafiki from "../assets/rafiki.svg";
// import user from "../assets/user.png";

// import {
//   LayoutDashboard,
//   Ticket,
//   Users,
//   BarChart3,
//   HelpCircle,
//   Settings,
//   Search,
//   Bell,
//   Calendar,
//   MapPin,
//   ChevronDown,
//   TimerIcon,
// } from "lucide-react";

// const Dashboard = () => {
//   const navItems = [
//     { name: "Dashboard", icon: <LayoutDashboard size={20} />, active: true },
//     { name: "My Events", icon: <Ticket size={20} />, active: false },
//     { name: "Guest Management", icon: <Users size={20} />, active: false },
//     { name: "Analytics", icon: <BarChart3 size={20} />, active: false },
//     { name: "Help Center", icon: <HelpCircle size={20} />, active: false },
//     { name: "Settings", icon: <Settings size={20} />, active: false },
//   ];

//   return (
//     <div className="flex h-screen bg-[#F9FAFB] text-slate-800 font-sans overflow-hidden font-poppins">
//       {/* FIXED SIDE NAVIGATION */}
//       <aside className="w-64 bg-white shadow flex flex-col shrink-0 z-50">
//         <div className="p-8 flex items-center gap-3">
//           <div className="w-8 h-8 flex items-center justify-center">
//             <img src={logopurple} alt="GatePass" />
//           </div>
//           <span className="text-xl font-bold text-[#6B4EFF] tracking-tight">
//             GatePass
//           </span>
//         </div>

//         <nav className="flex-1 mt-8 space-y-4">
//           {navItems.map((item) => (
//             <button
//               key={item.name}
//               className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all ${
//                 item.active
//                   ? "bg-[#6B4EFF]/5 text-[#6B4EFF] font-bold border-l-4 border-[#6B4EFF]"
//                   : "text-slate-400 hover:text-slate-600 hover:bg-gray-50 font-semibold"
//               }`}
//             >
//               {item.icon}
//               <span className="text-[15px]">{item.name}</span>
//             </button>
//           ))}
//         </nav>

//         <div className="p-6">
//           <button className="w-full bg-[#6B4EFF] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#6B4EFF]/20">
//             Create Event
//           </button>
//         </div>
//       </aside>

//       {/* MAIN VIEWPORT */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
//         {/* HEADER */}
//         <header className="h-20 bg-white shadow py-4 px-10 flex items-center justify-between sticky top-0 z-20">
//           <div className="flex items-center gap-8 flex-1">
//             <h1 className="text-2xl font-bold">Dashboard</h1>
//             <div className="relative w-full max-w-lg">
//               <Search
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                 size={18}
//               />
//               <input
//                 type="text"
//                 placeholder="Search events or guests..."
//                 className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl border-none focus:ring-2 focus:ring-[#6B4EFF]/20 text-sm"
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-6">
//             <button className="relative p-2.5 bg-[#F3F4F6] text-slate-600 rounded-full hover:bg-gray-200 transition-colors">
//               <Bell size={20} fill="#6B4EFF" stroke="false" />
//               {/* <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#6B4EFF] rounded-full border-2 border-white"></span> */}
//             </button>
//             <div className="flex items-center gap-3 pl-2 cursor-pointer">
//               <img
//                 src={user}
//                 alt="User"
//                 // className="w-10 h-10 rounded-full object-cover"
//               />
//               <ChevronDown size={16} className="text-slate-400" />
//             </div>
//           </div>
//         </header>

//         {/* DASHBOARD CONTENT */}
//         <div className="p-10 space-y-8">
//           {/* STATS SECTION */}
//           <div className="grid grid-cols-4 gap-6">
//             {/* Stat 1 */}
//             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
//               <img src={Totalevents} alt="Events" />
//               <div>
//                 <h4 className="text-2xl font-bold">12</h4>
//                 <p className="text-[11px] font-medium text-slate-400 uppercase">
//                   Total Events
//                 </p>
//                 <p className="text-[10px] mt-2 text-slate-400">
//                   <span className="text-emerald-500 font-bold">Top 75%</span> of
//                   all users
//                 </p>
//               </div>
//             </div>

//             {/* Stat 2 */}
//             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
//               <img src={Totalguests} alt="Guests" />
//               <div>
//                 <h4 className="text-2xl font-bold">1,720</h4>
//                 <p className="text-[11px] font-medium text-slate-400 uppercase">
//                   Total Guests Invited
//                 </p>
//                 <p className="text-[10px] mt-2 text-slate-400">
//                   0 guest invite this week
//                 </p>
//               </div>
//             </div>

//             {/* Stat 3 */}
//             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
//               <img src={RSVPrate} alt="RSVP" />
//               <div>
//                 <h4 className="text-2xl font-bold">86%</h4>
//                 <p className="text-[11px] font-medium text-slate-400 uppercase">
//                   Overall RSVP Rate
//                 </p>
//                 <p className="text-[10px] mt-2 text-slate-400">
//                   <span className="text-emerald-500 font-bold">Top 75%</span> of
//                   all users
//                 </p>
//               </div>
//             </div>

//             {/* Stat 4 */}
//             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
//               <img src={Checkins} alt="Checkin" />
//               <div>
//                 <h4 className="text-2xl font-bold">100%</h4>
//                 <p className="text-[11px] font-medium text-slate-400 uppercase">
//                   Check-ins
//                 </p>
//                 <p className="text-[10px] mt-2 text-slate-400">
//                   <span className="text-emerald-500 font-bold">Top 1%</span> of
//                   all users
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* MIDDLE SECTION */}
//           <div className="flex gap-4">
//             {/* Banner Card */}
//             <div className="w-full max-w-3/5 col-span-2 relative rounded-3xl overflow-hidden bg-slate-900 min-h-[280px] flex group">
//               <img
//                 src={dashboardbanner}
//                 alt="A group of people holding a meeting"
//                 className="absolute w-full h-full object-cover"
//               />
//               <div className="relative z-10 py-6 px-8 flex flex-col justify-between text-white w-full bg-gradient-to-t from-black/80 to-transparent">
//                 <div className="flex justify-between items-center w-full">
//                   <h2 className="text-3xl font-semibold mb-4">
//                     Startup Connect Meetup
//                   </h2>
//                   <span className="text-xs font-semibold uppercase tracking-widest mb-2">
//                     Your Next Event
//                   </span>
//                 </div>
//                 <p className="text-sm opacity-70 max-w-md leading-relaxed">
//                   Startup Connect Meetup is a curated gathering designed to
//                   bring together founders, early-stage entrepreneurs, investors,
//                   and industry leaders.
//                 </p>
//                 <div className="flex flex-col gap-2 text-sm">
//                   <div className="flex gap-5">
//                     <span className="flex items-center gap-2">
//                       <Calendar size={16} /> Sat, 23rd Nov, 2025
//                     </span>
//                     <span className="flex items-center gap-2">
//                       <TimerIcon size={16} /> Sat, 23rd 2:00pm
//                     </span>
//                   </div>
//                   <span className="flex items-center gap-2">
//                     <MapPin size={16} /> Landmark Event Centre, Lagos
//                   </span>
//                 </div>
//                 <button className="absolute right-10 bottom-10 bg-white text-[#6B4EFF] px-8 py-3 rounded-xl font-bold text-xs hover:shadow-xl transition-all cursor-pointer">
//                   Event Details
//                 </button>
//               </div>
//             </div>

//             {/* Template Card */}
//             <div className="w-full max-w-2/5 bg-white shadow-xs rounded-3xl p-8 flex gap-4 flex-row-reverse items-center">
//               <div className="w-1/2 flex items-center justify-center">
//                 <img src={rafiki} alt="" />
//               </div>
//               <div className="flex flex-col text-start w-1/2">
//                 <h3 className="font-bold text-xl mb-3">RSVP Template</h3>
//                 <p className="text-xs text-slate-400 leading-relaxed mb-8">
//                   Before creating a new event, make sure your guest list is
//                   ready. Download the official GatePass RSVP template and fill
//                   in the details of your invitees.
//                 </p>
//                 <button className="w-full bg-[#6B4EFF] text-white text-xs py-3 rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer">
//                   Download Template Now
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* LOWER GRID */}
//           <div className="grid grid-cols-3 gap-4">
//             {/* Upcoming Events List */}
//             <div className="col-span-2 bg-white border border-slate-100 rounded-3xl p-8">
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h3 className="text-xl font-semibold mb-2">
//                     Upcoming Events
//                   </h3>
//                   <p className="text-xs text-slate-400">
//                     Here are your upcoming events
//                   </p>
//                 </div>
//                 <button className="bg-[#6B4EFF] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
//                   Create Event
//                 </button>
//               </div>

//               <div className="divide-y divide-slate-50">
//                 <EventItem
//                   title="Startup Connect Meetup"
//                   date="Sat, 23rd Nov 2025"
//                   loc="Landmark Event Centre"
//                   rsvp="124/150"
//                   progress={82}
//                 />
//                 <EventItem
//                   title="Tech Innovators Summit 2025"
//                   date="Fri, 27th Nov 2025"
//                   loc="Eko Hotel, Lagos"
//                   rsvp="300/350"
//                   progress={85}
//                 />
//                 <EventItem
//                   title="Wedding Expo Africa 2025"
//                   date="Sat, 6th Dec 2025"
//                   loc="Tafawa Balewa Square"
//                   rsvp="100/400"
//                   progress={25}
//                 />
//                 <EventItem
//                   title="Lagos Live Music Fest 2025"
//                   date="Wed, 10th Dec 2025"
//                   loc="Civic Centre, Lagos"
//                   rsvp="900/1000"
//                   progress={90}
//                 />
//                 <EventItem
//                   title="HealthTech Innovation Forum"
//                   date="Fri, 19th Dec 2025"
//                   loc="Oriental Hotel, Lagos"
//                   rsvp="300/500"
//                   progress={65}
//                 />
//                 <EventItem
//                   title="Africa Fashion Week Showcase"
//                   date="Fri, 19th Dec 2025"
//                   loc="Oriental Hotel, Lagos"
//                   rsvp="50/450"
//                   progress={12}
//                 />
//               </div>
//             </div>

//             {/* Discover Card */}
//             <div className="bg-white border border-slate-100 rounded-3xl py-5 px-3 flex flex-col">
//               <h3 className="text-xl font-semibold mb-1">Events Around You</h3>
//               <p className="text-xs text-slate-400 mb-6">
//                 Based on your current location
//               </p>

//               <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[350px]">
//                 <img
//                   src={Eventsaround}
//                   alt="A group of people partying in an intimate concert atmosphere"
//                   className="absolute w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 py-5 px-8 flex flex-col justify-end text-white">
//                   <h4 className="text-xl font-bold mb-2">
//                     Lagos Afrobeats Night
//                   </h4>
//                   <p className="text-[8px] mb-4">
//                     A high-energy live performance featuring top Afrobeats
//                     artists in an intimate concert atmosphere. Perfect for music
//                     lovers looking for a vibrant Friday night.
//                   </p>
//                   <div className="flex gap-2 text-[8px]">
//                     <span className="flex items-center gap-2">
//                       <Calendar size={14} /> Thur,28th Nov, 2025
//                     </span>
//                     <span className="flex items-center gap-2">
//                       <TimerIcon size={14} /> 2:00pm
//                     </span>
//                     <span className="flex items-center gap-2">
//                       <MapPin size={14} /> Hard Rock Café, Lagos
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const EventItem = ({ title, date, loc, rsvp, progress }) => (
//   <div className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
//     <div className="max-w-[40%]">
//       <h4 className="mb-1 truncate">{title}</h4>
//       <p className="text-xs text-slate-400">
//         {date} • {loc}
//       </p>
//     </div>
//     <div className="flex items-center gap-10">
//       <div className="w-40">
//         <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
//           <span className="font-medium text-[#474747]">RSVPs</span>
//           <span className="text-[#151033]">{rsvp}</span>
//         </div>
//         <div className="w-full bg-slate-100 h-2 rounded-full">
//           <div
//             className="bg-[#6B4EFF] h-full rounded-full transition-all duration-1000"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>
//       <button className="cursor-pointer border-2 border-[#6B4EFF] px-5 py-2 rounded-xl text-xs font-semibold text-[#6B4EFF]">
//         Manage Event
//       </button>
//     </div>
//   </div>
// );

// export default Dashboard;

import Checkins from "../assets/icons/Checkins.svg";
import RSVPrate from "../assets/icons/RSVPrate.svg";
import Totalevents from "../assets/icons/Totalevents.svg";
import Totalguests from "../assets/icons/Totalguests.svg";
import dashboardbanner from "../assets/dashboardbanner.png";
import Eventsaround from "../assets/Eventsaround.png";
import rafiki from "../assets/rafiki.svg";
import user from "../assets/user.png";

import {
  Search,
  Bell,
  Calendar,
  MapPin,
  ChevronDown,
  TimerIcon,
} from "lucide-react";
import {NavLink, Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <>
      {/* HEADER */}
      <header className="h-20 bg-white shadow py-4 px-10 flex items-center justify-between sticky top-0 z-20 font-poppins">
        <div className="flex items-center gap-8 flex-1">
          <h1 className="text-2xl font-bold">Dashboard</h1>
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
          <button className="relative p-2.5 bg-[#F3F4F6] text-slate-600 rounded-full cursor-pointer">
            <Bell size={20} fill="#6B4EFF" stroke="false" />
          </button>
          <div className="flex items-center gap-3 pl-2 cursor-pointer">
            <img src={user} alt="User" />
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <div className="p-10 space-y-8">
        {/* STATS SECTION */}
        <div className="grid grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
            <img src={Totalevents} alt="Events" />
            <div>
              <h4 className="text-2xl font-bold">12</h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase">
                Total Events
              </p>
              <p className="text-[10px] mt-2 text-slate-400">
                <span className="text-emerald-500 font-bold">Top 75%</span> of
                all users
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
            <img src={Totalguests} alt="Guests" />
            <div>
              <h4 className="text-2xl font-bold">1,720</h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase">
                Total Guests Invited
              </p>
              <p className="text-[10px] mt-2 text-slate-400">
                0 guest invite this week
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
            <img src={RSVPrate} alt="RSVP" />
            <div>
              <h4 className="text-2xl font-bold">86%</h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase">
                Overall RSVP Rate
              </p>
              <p className="text-[10px] mt-2 text-slate-400">
                <span className="text-emerald-500 font-bold">Top 75%</span> of
                all users
              </p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
            <img src={Checkins} alt="Checkin" />
            <div>
              <h4 className="text-2xl font-bold">100%</h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase">
                Check-ins
              </p>
              <p className="text-[10px] mt-2 text-slate-400">
                <span className="text-emerald-500 font-bold">Top 1%</span> of
                all users
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="flex gap-4">
          {/* Banner Card */}
          <div className="w-full max-w-3/5 col-span-2 relative rounded-3xl overflow-hidden bg-slate-900 min-h-[280px] flex group">
            <img
              src={dashboardbanner}
              alt="A group of people holding a meeting"
              className="absolute w-full h-full object-cover"
            />
            <div className="relative z-10 py-6 px-8 flex flex-col justify-between text-white w-full bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-3xl font-semibold mb-4">
                  Startup Connect Meetup
                </h2>
                <span className="text-xs font-semibold uppercase tracking-widest mb-2">
                  Your Next Event
                </span>
              </div>
              <p className="text-sm opacity-70 max-w-md leading-relaxed">
                Startup Connect Meetup is a curated gathering designed to bring
                together founders, early-stage entrepreneurs, investors, and
                industry leaders.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex gap-5">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} /> Sat, 23rd Nov, 2025
                  </span>
                  <span className="flex items-center gap-2">
                    <TimerIcon size={16} /> Sat, 23rd 2:00pm
                  </span>
                </div>
                <span className="flex items-center gap-2">
                  <MapPin size={16} /> Landmark Event Centre, Lagos
                </span>
              </div>
              <button className="absolute right-10 bottom-10 bg-white text-[#6B4EFF] px-8 py-3 rounded-xl font-bold text-xs hover:shadow-xl transition-all cursor-pointer">
                Event Details
              </button>
            </div>
          </div>
          {/* Template Card */}
          <div className="w-full max-w-2/5 bg-white shadow-xs rounded-3xl p-8 flex gap-4 flex-row-reverse items-center">
            <div className="w-1/2 flex items-center justify-center">
              <img src={rafiki} alt="" />
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
          <div className="col-span-2 bg-white border border-slate-100 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Upcoming Events</h3>
                <p className="text-xs text-slate-400">
                  Here are your upcoming events
                </p>
              </div>
              <NavLink to="create-event" className="bg-[#6B4EFF] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Create Event
              </NavLink>
            </div>

            <div className="divide-y divide-slate-50">
              <EventItem
                title="Startup Connect Meetup"
                date="Sat, 23rd Nov 2025"
                loc="Landmark Event Centre"
                rsvp="124/150"
                progress={82}
              />
              <EventItem
                title="Tech Innovators Summit 2025"
                date="Fri, 27th Nov 2025"
                loc="Eko Hotel, Lagos"
                rsvp="300/350"
                progress={85}
              />
              <EventItem
                title="Wedding Expo Africa 2025"
                date="Sat, 6th Dec 2025"
                loc="Tafawa Balewa Square"
                rsvp="100/400"
                progress={25}
              />
              <EventItem
                title="Lagos Live Music Fest 2025"
                date="Wed, 10th Dec 2025"
                loc="Civic Centre, Lagos"
                rsvp="900/1000"
                progress={90}
              />
              <EventItem
                title="HealthTech Innovation Forum"
                date="Fri, 19th Dec 2025"
                loc="Oriental Hotel, Lagos"
                rsvp="300/500"
                progress={65}
              />
              <EventItem
                title="Africa Fashion Week Showcase"
                date="Fri, 19th Dec 2025"
                loc="Oriental Hotel, Lagos"
                rsvp="50/450"
                progress={12}
              />
            </div>
          </div>

          {/* Discover Card */}
          <div className="bg-white border border-slate-100 rounded-3xl py-5 px-3 flex flex-col">
            <h3 className="text-xl font-semibold mb-1">Events Around You</h3>
            <p className="text-xs text-slate-400 mb-6">
              Based on your current location
            </p>

            <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[350px]">
              <img
                src={Eventsaround}
                alt="A group of people partying in an intimate concert atmosphere"
                className="absolute w-full h-full object-cover"
              />
              <div className="absolute inset-0 py-5 px-8 flex flex-col justify-end text-white">
                <h4 className="text-xl font-bold mb-2">
                  Lagos Afrobeats Night
                </h4>
                <p className="text-[8px] mb-4">
                  A high-energy live performance featuring top Afrobeats artists
                  in an intimate concert atmosphere. Perfect for music lovers
                  looking for a vibrant Friday night.
                </p>
                <div className="flex gap-2 text-[8px]">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} /> Thur,28th Nov, 2025
                  </span>
                  <span className="flex items-center gap-2">
                    <TimerIcon size={14} /> 2:00pm
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={14} /> Hard Rock Café, Lagos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
const EventItem = ({ title, date, loc, rsvp, progress }) => (
  <div className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
    <div className="max-w-[40%]">
      <h4 className="mb-1 truncate">{title}</h4>
      <p className="text-xs text-slate-400">
        {date} • {loc}
      </p>
    </div>
    <div className="flex items-center gap-10">
      <div className="w-40">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
          <span className="font-medium text-[#474747]">RSVPs</span>
          <span className="text-[#151033]">{rsvp}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full">
          <div
            className="bg-[#6B4EFF] h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <button className="cursor-pointer border-2 border-[#6B4EFF] px-5 py-2 rounded-xl text-xs font-semibold text-[#6B4EFF]">
        Manage Event
      </button>
    </div>
  </div>
);
export default Dashboard;

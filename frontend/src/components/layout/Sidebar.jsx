import { NavLink, Link } from "react-router";
import logopurple from "../../assets/Logo-purple.svg";
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  HelpCircle,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard/my-events", icon: Ticket, label: "My Events" },
    {
      path: "/dashboard/guest-management",
      icon: Users,
      label: "Guest Management",
    },
    { path: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/dashboard/help-center", icon: HelpCircle, label: "Help Center" },
    { path: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white shadow flex flex-col shrink-0 z-50 font-poppins">
      <NavLink to="/">
        <div className="p-8 flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={logopurple} alt="GatePass" />
          </div>
          <span className="text-xl font-bold text-[#6B4EFF] tracking-tight">
            GatePass
          </span>
        </div>
      </NavLink>

      <nav className="flex-1 mt-8 space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#6B4EFF]/5 text-[#6B4EFF] font-bold border-l-4 border-[#6B4EFF]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-gray-50 font-semibold"
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[15px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <NavLink
          to="/dashboard/create-event"
          className="block w-full bg-[#6B4EFF] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#6B4EFF]/20 text-center cursor-pointer"
        >
          Create Event
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;

import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-800 font-sans overflow-hidden font-poppins">
      <Sidebar />
      <main
        ref={scrollContainerRef}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto"
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
 return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-800 font-sans overflow-hidden font-poppins">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );

}

export default DashboardLayout

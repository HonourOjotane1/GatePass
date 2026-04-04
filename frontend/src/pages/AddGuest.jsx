import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddGuest = () => {
  const [email, setEmail] = useState('');

  const handleAddGuest = (e) => {
    e.preventDefault();
    // API call logic here
    console.log("Adding guest email:", email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-poppins flex flex-col">
      
      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm py-4 px-10 flex items-center sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard/guest-management" 
            className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Add Guest</h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 -mt-20">
        
        <h2 className="text-4xl font-extrabold text-[#0F172A] mb-10">
          Enter Guest Mail to Add
        </h2>

        <form 
          onSubmit={handleAddGuest} 
          className="flex items-center gap-4 w-full max-w-3xl"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email here"
            className="flex-1 px-6 py-4 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none placeholder:text-slate-400 text-lg transition-all"
          />
          <button 
            type="submit"
            className="bg-[#6B4EFF] text-white px-12 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer whitespace-nowrap"
          >
            Add Guest
          </button>
        </form>

      </div>
    </div>
  );
};

export default AddGuest;
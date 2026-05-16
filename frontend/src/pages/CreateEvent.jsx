import { useState } from "react";
import { ArrowLeft, ChevronDown, Upload, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";
import SuccessIcon from "../assets/icons/success-badge.svg";

const CreateEvent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);

  // Master form state
  const [formData, setFormData] = useState({
    // Step 1
    eventName: "",
    eventDescription: "",
    eventType: "",
    eventCategory: "",
    coverImage: null,

    // Step 2 
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    venueName: "",
    address: "",
    isVirtual: false,

    // Step 3
    accessType: "", // 'open', 'invite', 'ticketed'

    // Step 4 (Conditional)
    ticketName: "",
    ticketPrice: "",
    ticketQuantity: "",
    ticketDescription: "",
    guestListFile: null,

    // Step 4 (Invite Only)
    guestListName: "",
    rsvpDeadline: "",
    maxCapacity: "",
    allowPlusOne: false,

    // Manual Guest Add
    manualGuestEmail: "",
  });

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep === 3 && formData.accessType === "open") {
      setCurrentStep(5); // Skip step 4 for Open Access
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    if (currentStep === 5 && formData.accessType === "open") {
      setCurrentStep(3); // Go back to 3 if Open Access
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handlePublish = () => {
    // Add API call here
    console.log("Publishing Event...", formData);
    setIsPublished(true);
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 lg:px-10 font-sans text-slate-800 font-poppins relative">
      {/* SUCCESS MODAL POPUP */}
      {isPublished && (
        <FeedbackModal
          icon={SuccessIcon}
          title="Event Published!"
          buttons={[
            { label: "Continue", variant: "solid", to: "/dashboard" },
            {
              label: "View Details",
              variant: "outline",
              to: "/dashboard/my-events",
            },
          ]}
        />
      )}

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 w-full bg-white p-6 rounded shadow-sm">
        <Link
          to="/dashboard"
          className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">Create Events</h1>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-white rounded border border-slate-100 p-8 lg:p-12 relative min-h-[600px]">
        {/* Circular Progress Indicator */}
        <div className="absolute top-8 right-8 lg:top-12 lg:right-12">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#F3F4F6"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#6B4EFF"
                strokeWidth="4"
                fill="none"
                strokeDasharray="175.9"
                strokeDashoffset={175.9 - (175.9 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute text-lg font-bold text-slate-900">
              {currentStep}/5
            </span>
          </div>
        </div>

        {/* FORM STEPS */}
        <div className="max-w-3xl mx-auto pt-4 w-full">
          {currentStep === 1 && <Step1 form={formData} update={updateForm} />}
          {currentStep === 2 && <Step2 form={formData} update={updateForm} />}
          {currentStep === 3 && <Step3 form={formData} update={updateForm} />}
          {currentStep === 4 && <Step4 form={formData} update={updateForm} />}

          {currentStep === 5 && (
            <Step5
              form={formData}
              onEdit={() => setCurrentStep(1)}
              onPublish={handlePublish}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep !== 3 && currentStep !== 5 && (
            <div className="mt-12 flex justify-center gap-4">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="w-full max-w-md border-2 border-[#6B4EFF] text-[#6B4EFF] py-4 rounded-xl font-bold text-lg cursor-pointer hover:bg-[#6B4EFF]/5 transition-all"
                >
                  Previous
                </button>
              )}

              <button
                onClick={nextStep}
                className="w-full max-w-md bg-[#6B4EFF] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="mt-16 flex justify-center gap-4">
              <button
                onClick={prevStep}
                className="w-full max-w-md border-2 border-[#6B4EFF] text-[#6B4EFF] py-4 rounded-xl font-bold text-lg hover:bg-[#6B4EFF]/5 cursor-pointer transition-all"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.accessType}
                className={`w-full max-w-md py-4 rounded-xl font-bold text-lg transition-all ${
                  formData.accessType
                    ? "text-white bg-[#6B4EFF] cursor-pointer hover:shadow-lg"
                    : " text-[#6B4EFF]/40 bg-[#6B4EFF]/20 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* SUB-COMPONENTS (STEPS 1-5) */

const Step1 = ({ form, update }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <h2 className="text-3xl font-bold text-slate-900 mb-2">
      Create a New Event
    </h2>
    <p className="text-slate-400 mb-10">
      Please enter the details correctly to create your event
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event Name <span className="text-[#DB2F40]">*</span>
        </label>
        <input
          type="text"
          value={form.eventName}
          onChange={(e) => update("eventName", e.target.value)}
          placeholder="e.g Tech Conference 2025"
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event Description <span className="text-[#DB2F40]">*</span>
        </label>
        <input
          type="text"
          value={form.eventDescription}
          onChange={(e) => update("eventDescription", e.target.value)}
          placeholder="Tell attendees what the event is about"
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-2 relative">
        <label className="text-sm font-bold text-slate-900">Event Type</label>
        <div className="relative">
          <select
            value={form.eventType}
            onChange={(e) => update("eventType", e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none appearance-none bg-white text-slate-600"
          >
            <option value="Corporate">Corporate</option>
            <option value="Private">Private</option>
            <option value="Concert">Concert</option>
            <option value="Seminar">Seminar</option>
            <option value="Wedding">Wedding</option>
            <option value="Others">Others</option>
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={20}
          />
        </div>
      </div>

      <div className="space-y-2 relative">
        <label className="text-sm font-bold text-slate-900">
          Event Category <span className="text-[#DB2F40]">*</span>
        </label>
        <div className="relative">
          <select
            value={form.eventCategory}
            onChange={(e) => update("eventCategory", e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none appearance-none bg-white text-slate-600"
          >
            <option value="">Select Category</option>
            <option value="Business">Business</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Education">Education</option>
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={20}
          />
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <label className="text-sm font-bold text-slate-900">
        Event Cover Image <span className="text-[#DB2F40]">*</span>
      </label>
      <div className="border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
          <Upload className="text-slate-400" size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Drop your files or click to upload
        </h3>
        <p className="text-sm text-slate-400 mt-1">JPEG, PNG, JPG ≤ 100MB</p>
        <button className="mt-6 px-6 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-white transition-colors cursor-pointer">
          Browse
        </button>
      </div>
    </div>
  </div>
);

const Step2 = ({ form, update }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <h2 className="text-3xl font-bold text-slate-900 mb-2">
      Date, Time & Venue
    </h2>
    <p className="text-slate-400 mb-10">
      Please enter the details correctly to create your event
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
      
      {/* Event Start Date */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event Start Date <span className="text-[#DB2F40]">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none appearance-none bg-white text-slate-700 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Calendar
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={20}
          />
        </div>
      </div>

      {/* Event Start Time */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event Start Time <span className="text-[#DB2F40]">*</span>
        </label>
        <div className="relative">
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none appearance-none bg-white text-slate-700 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Clock
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={20}
          />
        </div>
      </div>

      {/* Event End Date */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event End Date <span className="text-[#DB2F40]">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none appearance-none bg-white text-slate-700 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Calendar
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={20}
          />
        </div>
      </div>

      {/* Event End Time */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event End Time <span className="text-[#DB2F40]">*</span>
        </label>
        <div className="relative">
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none appearance-none bg-white text-slate-700 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Clock
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={20}
          />
        </div>
      </div>

      {/* Venue Name */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Venue Name <span className="text-[#DB2F40]">*</span>
        </label>
        <input
          type="text"
          value={form.venueName}
          onChange={(e) => update("venueName", e.target.value)}
          placeholder="Enter venue name here"
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Address <span className="text-[#DB2F40]">*</span>
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="Enter venue address here"
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none placeholder:text-slate-400"
        />
      </div>
    </div>

    {/* Custom Virtual Event Toggle */}
    <div className="flex items-center gap-24 mt-8 pl-1">
      <span className="text-sm font-bold text-slate-900">Virtual Event</span>
      <button
        onClick={() => update("isVirtual", !form.isVirtual)}
        className={`w-[46px] h-6 rounded-full transition-colors duration-300 border-2 flex items-center cursor-pointer ${
          form.isVirtual 
            ? "bg-slate-900 border-slate-900 px-[2px]" 
            : "bg-white border-slate-900 px-[2px]"
        }`}
      >
        <div
          className={`w-[16px] h-[16px] rounded-full shadow-sm transform transition-transform duration-300 ${
            form.isVirtual ? "translate-x-5 bg-white" : "translate-x-0 bg-slate-900"
          }`}
        />
      </button>
    </div>
  </div>
);

const Step3 = ({ form, update }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <h2 className="text-3xl font-bold text-slate-900 mb-2">
      Ticketing & Access Type
    </h2>
    <p className="text-slate-400 mb-10">
      Please enter the details correctly to create your event
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {["Open Access", "Invite Only", "Ticketed Event"].map((type) => {
        const value =
          type === "Open Access"
            ? "open"
            : type === "Invite Only"
              ? "invite"
              : "ticketed";
        const isSelected = form.accessType === value;

        return (
          <div
            key={value}
            onClick={() => update("accessType", value)}
            className={`
              cursor-pointer rounded-xl border-2 p-6 flex items-center justify-center gap-3 transition-all h-24
              ${isSelected ? "border-[#6B4EFF] bg-[#6B4EFF]/5 text-[#6B4EFF]" : "border-slate-200 text-slate-500 hover:border-[#6B4EFF]/50"}
            `}
          >
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-[#6B4EFF]" : "border-slate-300"}`}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#6B4EFF]" />
              )}
            </div>
            <span className="font-medium">{type}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const Step4 = ({ form, update }) => {
  if (form.accessType === "ticketed") {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Create Event Ticket
        </h2>
        <p className="text-slate-400 mb-10">
          How do you want guests to be invited
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">
              Ticket Name <span className="text-[#DB2F40]">*</span>
            </label>
            <input
              type="text"
              value={form.ticketName}
              onChange={(e) => update("ticketName", e.target.value)}
              placeholder="Enter ticket name"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">
              Price <span className="text-[#DB2F40]">*</span>
            </label>
            <input
              type="text"
              value={form.ticketPrice}
              onChange={(e) => update("ticketPrice", e.target.value)}
              placeholder="Enter price"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">
              Quantity <span className="text-[#DB2F40]">*</span>
            </label>
            <input
              type="text"
              value={form.ticketQuantity}
              onChange={(e) => update("ticketQuantity", e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">
              Description <span className="text-[#DB2F40]">*</span>
            </label>
            <input
              type="text"
              value={form.ticketDescription}
              onChange={(e) => update("ticketDescription", e.target.value)}
              placeholder="Enter ticket description"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    );
  }

  if (form.accessType === "invite") {
    const [tab, setTab] = useState("upload");

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Guest Management & RSVP
        </h2>
        <p className="text-slate-400 mb-8">
          How do you want guests to be invited
        </p>

        <div className="flex justify-center border-b border-slate-200 mb-10 w-full max-w-md mx-auto">
          <button
            onClick={() => setTab("upload")}
            className={`pb-3 px-8 font-bold text-sm transition-colors relative cursor-pointer ${
              tab === "upload" ? "text-slate-900" : "text-slate-400"
            }`}
          >
            Upload File
            {tab === "upload" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6B4EFF]" />
            )}
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`pb-3 px-8 font-bold text-sm transition-colors relative cursor-pointer ${
              tab === "manual" ? "text-slate-900" : "text-slate-400"
            }`}
          >
            Add Manually
            {tab === "manual" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6B4EFF]" />
            )}
          </button>
        </div>

        {tab === "upload" ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-sm text-slate-900">
                Import Guest List{" "}
                <span className="font-normal text-slate-400">
                  (must be according to our template)
                </span>
              </span>
              <button className="text-[#6B4EFF] text-xs font-bold border border-[#6B4EFF]/30 px-4 py-2 rounded-lg hover:bg-[#6B4EFF]/5 cursor-pointer">
                Download Template
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl h-48 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
              <h3 className="text-lg font-bold text-slate-900">
                Drop your files or click to upload
              </h3>
              <p className="text-sm text-slate-400 mt-1">CSV, Excel</p>
              <button className="mt-4 px-6 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white cursor-pointer">
                Browse
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={form.manualGuestEmail}
              onChange={(e) => update("manualGuestEmail", e.target.value)}
              placeholder="Enter email here"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none placeholder:text-slate-300"
            />
            <button className="bg-[#6B4EFF] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg cursor-pointer transition-all">
              Add Email
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

const Step5 = ({ form, onEdit, onPublish }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <h2 className="text-3xl font-bold text-slate-900 mb-2">Review & Publish</h2>
    <p className="text-slate-400 mb-10">Confirm all details.</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-4 mb-12">
      <ReviewItem label="Event Name" value={form.eventName} />
      <ReviewItem label="Event Description" value={form.eventDescription} />
      <ReviewItem label="Event Type" value={form.eventType} />

      <ReviewItem label="Event Category" value={form.eventCategory} />
      <ReviewItem 
        label="Event Start" 
        value={form.startDate ? `${form.startDate} ${form.startTime && `at ${form.startTime}`}` : ''} 
      />
      <ReviewItem 
        label="Event End" 
        value={form.endDate ? `${form.endDate} ${form.endTime && `at ${form.endTime}`}` : ''} 
      />

      <ReviewItem label="Venue Name" value={form.venueName} />
      <ReviewItem
        label="Access Type"
        value={
          form.accessType === "open"
            ? "Open Access"
            : form.accessType === "invite"
              ? "Invite Only"
              : "Ticketed"
        }
      />

      {/* Conditional Items based on type */}
      {form.accessType === "ticketed" && (
        <>
          <ReviewItem label="Ticket Name" value={form.ticketName} />
          <ReviewItem label="Ticket Price" value={`₦${form.ticketPrice}`} />
          <ReviewItem label="Ticket Quantity" value={form.ticketQuantity} />
          <ReviewItem
            label="Ticket Description"
            value={form.ticketDescription}
          />
        </>
      )}

      {form.accessType === "invite" && <ReviewItem label="RSVPs" value="300" />}
    </div>

    <div className="flex gap-4">
      <button
        onClick={onEdit}
        className="flex-1 py-4 border border-[#6B4EFF] text-[#6B4EFF] font-bold rounded-xl hover:bg-[#6B4EFF]/5 transition-colors cursor-pointer"
      >
        Edit
      </button>
      <button
        onClick={onPublish}
        className="flex-1 py-4 bg-[#6B4EFF] text-white font-bold rounded-xl hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer"
      >
        Publish Event
      </button>
    </div>
  </div>
);

const ReviewItem = ({ label, value }) => (
  <div>
    <h4 className="text-slate-400 text-sm font-medium mb-1">{label}</h4>
    <p className="text-lg font-bold text-slate-900 break-words">
      {value || "-"}
    </p>
  </div>
);

export default CreateEvent;
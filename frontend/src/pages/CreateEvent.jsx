import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Upload,
  Calendar,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";
import SuccessIcon from "../assets/icons/success-badge.svg";
import api from "../utils/api";

const CreateEvent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdEventId, setCreatedEventId] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1
    eventName: "",
    eventDescription: "",
    eventType: "",
    eventCategory: "",
    coverImage: null,
    coverImagePreview: null,

    // Step 2
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    venueName: "",
    address: "",
    isVirtual: false,

    // Step 3
    accessType: "",

    // Step 4 (Conditional)
    ticketName: "",
    ticketPrice: "",
    ticketQuantity: "",
    ticketDescription: "",

    // Step 4 (Invite Only)
    guestListFile: null,
    manualGuestEmail: "",
    guestEmails: [], // Array to hold multiple emails before publishing
  });

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep === 3 && formData.accessType === "open") {
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    if (currentStep === 5 && formData.accessType === "open") {
      setCurrentStep(3);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handlePublish = async () => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      if (!formData.eventName || !formData.startDate || !formData.startTime) {
        setSubmitError("Event Name, Start Date, and Start Time are required.");
        setIsSubmitting(false);
        return;
      }

      // 1. IMAGE UPLOAD
      let finalImageUrl = "string";
      if (formData.coverImage) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("file", formData.coverImage);

          const uploadRes = await api.post(
            "/events/upload/cover-image",
            imageFormData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          finalImageUrl =
            uploadRes.data?.cover_image_url ||
            uploadRes.data?.url ||
            uploadRes.data ||
            "string";
        } catch (uploadErr) {
          console.error("Cover image upload failed:", uploadErr);
        }
      }

      let eventId = createdEventId;

      // 2. WIZARD FLOW
      // STEP 1
      if (!eventId) {
        const step1Payload = {
          event_name: formData.eventName,
          description: formData.eventDescription || "string",
          event_type: formData.eventType || "conference",
          category: formData.eventCategory || "music",
          cover_image_url: finalImageUrl,
        };
        const res1 = await api.post("/events/wizard/step1", step1Payload);
        eventId = res1.data.id;
        setCreatedEventId(eventId);
      }

      // STEP 2: Date & Location
      const formattedStartTime = `${formData.startTime}:00.000Z`;
      const formattedEndTime = formData.endTime
        ? `${formData.endTime}:00.000Z`
        : formattedStartTime;

      const step2Payload = {
        venue_name: formData.venueName || "string",
        address: formData.address || "string",
        is_virtual: formData.isVirtual,
        virtual_link: "string",
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        start_date: formData.startDate,
        end_date: formData.endDate || formData.startDate,
      };
      await api.patch(`/events/wizard/${eventId}/step2`, step2Payload);

      // STEP 3: Ticketing & Access
      const step3Payload = {
        access_type: formData.accessType || "open",
      };
      await api.patch(`/events/wizard/${eventId}/step3`, step3Payload);

      // STEP 4: Tickets
      const isFree =
        !formData.ticketPrice || parseFloat(formData.ticketPrice) === 0;
      const step4Payload = {
        ticket_name: formData.ticketName || "string",
        ticket_price: formData.ticketPrice
          ? parseFloat(formData.ticketPrice)
          : 0,
        total_tickets: formData.ticketQuantity
          ? parseInt(formData.ticketQuantity)
          : 0,
        ticket_description: formData.ticketDescription || "string",
        is_free: isFree,
      };
      await api.patch(`/events/wizard/${eventId}/step4`, step4Payload);

      // STEP 5: Publish the Event
      await api.post(`/events/wizard/${eventId}/publish`);

      // STEP 4 (Invite only)
      if (formData.accessType === "invite_only") {
        try {
          if (formData.guestListFile) {
            // File Upload Bulk Import from file
            const fileData = new FormData();
            fileData.append("file", formData.guestListFile);
            await api.post(`/guests/${eventId}/import`, fileData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } else if (formData.guestEmails.length === 1) {
            // Single Guest API
            const singleGuestPayload = {
              email: formData.guestEmails[0],
              first_name: "",
              last_name: "",
              phone_number: "",
            };
            await api.post(`/guests/${eventId}/invite`, singleGuestPayload);
          } else if (formData.guestEmails.length > 1) {
            // Bulk Manual Guest API
            const bulkGuestPayload = {
              guests: formData.guestEmails.map((email) => ({
                email,
                first_name: "",
                last_name: "",
                phone_number: "",
              })),
            };
            await api.post(`/guests/${eventId}/invite/bulk`, bulkGuestPayload);
          }
        } catch (guestErr) {
          console.error("Guest dispatch failed:", guestErr);
          // Not failing the event creation if invites fail, but logging it.
        }
      }

      setIsPublished(true);
    } catch (err) {
      console.error("Publishing error:", err);

      let errorMessage =
        "Failed to publish the event. Please check your inputs.";

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail
            .map((errObj) => {
              const field = errObj.loc
                ? errObj.loc[errObj.loc.length - 1]
                : "Field";
              return `${field}: ${errObj.msg}`;
            })
            .join(" | ");
        }
      }
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 lg:px-10 font-sans text-slate-800 font-poppins relative">
      {isPublished && (
        <FeedbackModal
          icon={SuccessIcon}
          title="Event Published!"
          buttons={[
            { label: "Continue", variant: "solid", to: "/dashboard" },
            {
              label: "View Details",
              variant: "outline",
              to: createdEventId
                ? `/dashboard/event/${createdEventId}`
                : "/dashboard/my-events",
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
              isSubmitting={isSubmitting}
              error={submitError}
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
                    : "text-[#6B4EFF]/40 bg-[#6B4EFF]/20 cursor-not-allowed"
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

/* SUB-COMPONENTS */
const Step1 = ({ form, update }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      update("coverImage", file);
      update("coverImagePreview", URL.createObjectURL(file));
    }
  };

  return (
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
            Event Name *
          </label>
          <input
            type="text"
            value={form.eventName}
            onChange={(e) => update("eventName", e.target.value)}
            placeholder="e.g Tech Conference 2025"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">
            Event Description *
          </label>
          <input
            type="text"
            value={form.eventDescription}
            onChange={(e) => update("eventDescription", e.target.value)}
            placeholder="Tell attendees what the event is about"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] outline-none"
          />
        </div>
        <div className="space-y-2 relative">
          <label className="text-sm font-bold text-slate-900">Event Type</label>
          <div className="relative">
            <select
              value={form.eventType}
              onChange={(e) => update("eventType", e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 appearance-none bg-white"
            >
              <option value="">Select Type</option>
              <option value="conference">Conference</option>
              <option value="party">Party</option>
              <option value="concert">Concert</option>
              <option value="seminar">Seminar</option>
              <option value="wedding">Wedding</option>
              <option value="workshop">Workshop</option>
              <option value="sports">Sports</option>
              <option value="networking">Networking</option>
              <option value="festival">Festival</option>
              <option value="meetup">Meetup</option>
              <option value="exhibition">Exhibition</option>
              <option value="screening">Screening</option>
              <option value="webinar">Webinar</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={20}
            />
          </div>
        </div>
        <div className="space-y-2 relative">
          <label className="text-sm font-bold text-slate-900">
            Event Category *
          </label>
          <div className="relative">
            <select
              value={form.eventCategory}
              onChange={(e) => update("eventCategory", e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 appearance-none bg-white"
            >
              <option value="">Select Category</option>
              <option value="business">Business</option>
              <option value="music">Music</option>
              <option value="entertainment">Entertainment</option>
              <option value="tech">Tech</option>
              <option value="arts">Arts</option>
              <option value="food">Food</option>
              <option value="sports">Sports</option>
              <option value="education">Education</option>
              <option value="fashion">Fashion</option>
              <option value="health_wellness">Health & Wellness</option>
              <option value="community">Community</option>
              <option value="religious">Religious</option>
              <option value="other">Other</option>
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
          Event Cover Image *
        </label>
        <label className="border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer group relative overflow-hidden">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {form.coverImagePreview ? (
            <>
              <img
                src={form.coverImagePreview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  update("coverImage", null);
                  update("coverImagePreview", null);
                }}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-red-500 z-10"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Upload className="text-slate-400" size={24} />
              </div>
              <h3 className="text-lg font-bold">
                Drop your files or click to upload
              </h3>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

const Step2 = ({ form, update }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <h2 className="text-3xl font-bold text-slate-900 mb-2">
      Date, Time & Venue
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 mt-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event Start Date *
        </label>
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => update("startDate", e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event Start Time *
        </label>
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => update("startTime", e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event End Date
        </label>
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => update("endDate", e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">
          Event End Time
        </label>
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => update("endTime", e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">Venue Name</label>
        <input
          type="text"
          value={form.venueName}
          onChange={(e) => update("venueName", e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
        />
      </div>
    </div>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {[
        { label: "Open Access", val: "open" },
        { label: "Invite Only", val: "invite_only" },
        { label: "Ticketed Event", val: "ticketed" },
      ].map((type) => {
        const isSelected = form.accessType === type.val;
        return (
          <div
            key={type.val}
            onClick={() => update("accessType", type.val)}
            className={`cursor-pointer rounded-xl border-2 p-6 flex items-center justify-center gap-3 transition-all h-24 ${
              isSelected
                ? "border-[#6B4EFF] bg-[#6B4EFF]/5 text-[#6B4EFF]"
                : "border-slate-200 text-slate-500 hover:border-[#6B4EFF]/50"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                isSelected ? "border-[#6B4EFF]" : "border-slate-300"
              }`}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#6B4EFF]" />
              )}
            </div>
            <span className="font-medium">{type.label}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const Step4 = ({ form, update }) => {
  const handleAddEmail = (e) => {
    e.preventDefault();
    if (form.manualGuestEmail && form.manualGuestEmail.includes("@")) {
      update("guestEmails", [...form.guestEmails, form.manualGuestEmail]);
      update("manualGuestEmail", "");
    }
  };

  const removeEmail = (emailToRemove) => {
    update(
      "guestEmails",
      form.guestEmails.filter((e) => e !== emailToRemove)
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      update("guestListFile", file);
    }
  };

  const removeFile = (e) => {
    e.preventDefault();
    update("guestListFile", null);
  };

  if (form.accessType === "ticketed") {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Create Event Ticket
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-8">
          <div className="space-y-2">
            <label className="text-sm font-bold">Ticket Name *</label>
            <input
              type="text"
              value={form.ticketName}
              onChange={(e) => update("ticketName", e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Price *</label>
            <input
              type="text"
              value={form.ticketPrice}
              onChange={(e) => update("ticketPrice", e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Quantity *</label>
            <input
              type="number"
              value={form.ticketQuantity}
              onChange={(e) => update("ticketQuantity", e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
            />
          </div>
        </div>
      </div>
    );
  }

  if (form.accessType === "invite_only") {
    const [tab, setTab] = useState("manual");
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Guest Management
        </h2>
        <div className="flex justify-center border-b border-slate-200 mb-10 w-full max-w-md mx-auto mt-6">
          <button
            onClick={() => setTab("manual")}
            className={`pb-3 px-8 font-bold text-sm transition-colors relative cursor-pointer ${
              tab === "manual" ? "text-slate-900" : "text-slate-400"
            }`}
          >
            Add Manually{" "}
            {tab === "manual" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6B4EFF]" />
            )}
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`pb-3 px-8 font-bold text-sm transition-colors relative cursor-pointer ${
              tab === "upload" ? "text-slate-900" : "text-slate-400"
            }`}
          >
            Upload File{" "}
            {tab === "upload" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6B4EFF]" />
            )}
          </button>
        </div>

        {tab === "manual" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <input
                type="email"
                value={form.manualGuestEmail}
                onChange={(e) => update("manualGuestEmail", e.target.value)}
                placeholder="Enter guest email here"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none"
              />
              <button
                onClick={handleAddEmail}
                className="bg-[#6B4EFF] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer"
              >
                Add Email
              </button>
            </div>

            {/* Show added emails */}
            {form.guestEmails.length > 0 && (
              <div className="mt-4 p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-wrap gap-2">
                {form.guestEmails.map((email) => (
                  <span
                    key={email}
                    className="bg-white border border-slate-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
                  >
                    {email}{" "}
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "upload" && (
          <div className="flex flex-col gap-4">
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
            
            <label className="border-2 border-dashed border-slate-200 rounded-2xl h-48 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden">
              <input 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              {form.guestListFile ? (
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-slate-700">{form.guestListFile.name}</span>
                  <button onClick={removeFile} className="mt-3 text-xs text-red-500 font-semibold hover:underline">Remove File</button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-900">Drop your files or click to upload</h3>
                  <p className="text-sm text-slate-400 mt-1">CSV, Excel</p>
                  <div className="mt-4 px-6 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white cursor-pointer">Browse</div>
                </>
              )}
            </label>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const Step5 = ({ form, onEdit, onPublish, isSubmitting, error }) => {
  // Determine guest review label based on input method
  let guestCountText = "No guests added";
  if (form.guestListFile) {
    guestCountText = `File attached: ${form.guestListFile.name}`;
  } else if (form.guestEmails.length > 0) {
    guestCountText = `${form.guestEmails.length} emails added manually`;
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Review & Publish</h2>
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-4 mb-12 mt-8">
        <ReviewItem label="Event Name" value={form.eventName} />
        <ReviewItem label="Event Category" value={form.eventCategory} />
        <ReviewItem
          label="Access Type"
          value={
            form.accessType === "open"
              ? "Open Access"
              : form.accessType === "invite_only"
              ? "Invite Only"
              : "Ticketed"
          }
        />
        <ReviewItem
          label="Start Date & Time"
          value={form.startDate ? `${form.startDate} ${form.startTime}` : ""}
        />
        <ReviewItem label="Venue Name" value={form.venueName} />

        {form.accessType === "invite_only" && (
          <ReviewItem label="Guests to Invite" value={guestCountText} />
        )}
      </div>
      <div className="flex gap-4">
        <button
          onClick={onEdit}
          disabled={isSubmitting}
          className="flex-1 py-4 border border-[#6B4EFF] text-[#6B4EFF] font-bold rounded-xl hover:bg-[#6B4EFF]/5 transition-colors cursor-pointer disabled:opacity-50"
        >
          Edit
        </button>
        <button
          onClick={onPublish}
          disabled={isSubmitting}
          className="flex-1 py-4 flex justify-center items-center gap-2 bg-[#6B4EFF] text-white font-bold rounded-xl hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer disabled:bg-[#6B4EFF]/70"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={20} />}
          {isSubmitting ? "Publishing..." : "Publish Event"}
        </button>
      </div>
    </div>
  );
};

const ReviewItem = ({ label, value }) => (
  <div>
    <h4 className="text-slate-400 text-sm font-medium mb-1">{label}</h4>
    <p className="text-lg font-bold text-slate-900 break-words">
      {value || "-"}
    </p>
  </div>
);

export default CreateEvent;
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ArrowLeft,
  Bell,
  ChevronDown,
  Users,
  UserCheck,
  Clock,
  UserX,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import userAvatar from "../assets/user.png";
import emptyStateImg from "../assets/guest-empty-state.svg";
import FeedbackModal from "../components/FeedbackModal";
import questionIcon from "../assets/icons/question-circle.svg";
import successIcon from "../assets/icons/success-badge.svg";
import api from "../utils/api";

const GuestManagement = () => {
  const [activeView, setActiveView] = useState("list");
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [guests, setGuests] = useState([]);
  const [eventStats, setEventStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    declined: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [modalState, setModalState] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Add Guest State
  const [addGuestForm, setAddGuestForm] = useState({
    targetEventId: "",
    manualEmail: "",
    emailsToAdd: [],
    file: null,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const itemsPerPage = 10;

  // 1. Fetch Organizer Events on Mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/");
        const fetchedEvents = response.data.events || [];
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  // 2. Fetch Guests & Stats when selectedEventId changes
  const fetchGuestData = async () => {
    setIsLoading(true);
    try {
      if (selectedEventId === "all") {
        // GET GLOBAL STATS
        const dashRes = await api.get("/events/dashboard");
        const dStats = dashRes.data || {};
        setEventStats({
          total: dStats.total_guests_invited || 0,
          confirmed: dStats.total_guests_confirmed || 0,
          pending:
            (dStats.total_guests_invited || 0) -
            ((dStats.total_guests_confirmed || 0) +
              (dStats.total_guests_declined || 0)),
          declined: dStats.total_guests_declined || 0,
        });

        // GET GLOBAL GUESTS (Fetching for all events concurrently)
        if (events.length > 0) {
          const guestPromises = events.map((ev) =>
            api
              .get(`/guests/${ev.id}/guests?page=1&page_size=50`)
              .catch(() => ({ data: { guests: [] } })),
          );
          const guestResponses = await Promise.all(guestPromises);

          let allG = [];
          guestResponses.forEach((res, i) => {
            let gList = res.data?.guests;
            if (!Array.isArray(gList)) {
              gList = Array.isArray(res.data) ? res.data : [];
            }

            // Append event name for the general list view
            const withEventName = gList.map((g) => ({
              ...g,
              event_name: events[i].event_name || events[i].title,
            }));
            allG = [...allG, ...withEventName];
          });
          setGuests(allG);
        } else {
          setGuests([]);
        }
      } else {
        // GET SPECIFIC EVENT GUESTS
        const guestRes = await api.get(
          `/guests/${selectedEventId}/guests?page=1&page_size=1000`,
        );

        let specGuests = guestRes.data?.guests;
        if (!Array.isArray(specGuests)) {
          specGuests = Array.isArray(guestRes.data) ? guestRes.data : [];
        }
        setGuests(specGuests);

        // GET SPECIFIC EVENT STATS
        const eventRes = await api.get(`/events/${selectedEventId}`);
        const guestStats = eventRes.data?.guests || {};
        setEventStats({
          total: guestStats.total_invited || 0,
          confirmed: guestStats.confirmed || 0,
          pending:
            (guestStats.total_invited || 0) -
            ((guestStats.confirmed || 0) + (guestStats.declined || 0)),
          declined: guestStats.declined || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching guests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId === "all" && events.length === 0) {
      setIsLoading(false);
      return;
    }
    fetchGuestData();
  }, [selectedEventId, events.length]);

  // Frontend Filtering & Pagination
  const filteredGuests = useMemo(() => {
    if (!searchTerm) return guests;
    return guests.filter(
      (g) =>
        (g.first_name || g.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (g.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [guests, searchTerm]);

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage) || 1;
  const currentGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedEventId, searchTerm]);

  // GUEST LIST ACTIONS
  const handleRemoveGuest = async (guestId) => {
    setIsActionLoading(true);
    const targetEvId =
      selectedEventId === "all"
        ? guests.find((g) => g.id === guestId)?.event_id || events[0]?.id
        : selectedEventId;

    try {
      await api.delete(`/guests/${targetEvId}/guests/${guestId}`);
      setGuests((prev) => prev.filter((g) => g.id !== guestId));
      setEventStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      setModalState({ type: "removeSuccess" });
    } catch (err) {
      alert("Failed to remove guest. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResendInvite = async (guestId) => {
    setIsActionLoading(true);
    const targetEvId =
      selectedEventId === "all"
        ? guests.find((g) => g.id === guestId)?.event_id || events[0]?.id
        : selectedEventId;

    try {
      await api.post(`/guests/${targetEvId}/guests/${guestId}/resend`);
      setModalState({ type: "resendSuccess" });
    } catch (err) {
      alert("Failed to resend invite.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ADD GUEST LOGIC
  const handleAddEmail = (e) => {
    e.preventDefault();
    const email = addGuestForm.manualEmail.trim();
    if (
      email &&
      email.includes("@") &&
      !addGuestForm.emailsToAdd.includes(email)
    ) {
      setAddGuestForm((prev) => ({
        ...prev,
        emailsToAdd: [...prev.emailsToAdd, email],
        manualEmail: "",
      }));
    }
  };

  const submitNewGuests = async () => {
    setAddError("");
    const targetEventId =
      addGuestForm.targetEventId ||
      (selectedEventId !== "all" ? selectedEventId : null);

    if (!targetEventId) {
      setAddError("Please select an event to add guests to.");
      return;
    }
    if (addGuestForm.emailsToAdd.length === 0 && !addGuestForm.file) {
      setAddError("Please add at least one email or upload a CSV file.");
      return;
    }

    setIsAdding(true);
    try {
      if (addGuestForm.file) {
        // FILE UPLOAD IMPORT
        const fileData = new FormData();
        fileData.append("file", addGuestForm.file);
        await api.post(`/guests/${targetEventId}/import`, fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (addGuestForm.emailsToAdd.length === 1) {
        // SINGLE INVITE
        await api.post(`/guests/${targetEventId}/invite`, {
          email: addGuestForm.emailsToAdd[0],
          first_name: "",
          last_name: "",
          phone_number: "",
        });
      } else {
        // BULK INVITE
        await api.post(`/guests/${targetEventId}/invite/bulk`, {
          guests: addGuestForm.emailsToAdd.map((email) => ({
            email,
            first_name: "",
            last_name: "",
            phone_number: "",
          })),
        });
      }

      // Success cleanup
      setAddGuestForm({
        targetEventId: "",
        manualEmail: "",
        emailsToAdd: [],
        file: null,
      });
      setActiveView("list");
      fetchGuestData(); // Refresh the list
    } catch (err) {
      console.error("Add guest error:", err);
      setAddError(
        err.response?.data?.detail ||
          "Failed to add guests. Check inputs and try again.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  // RENDERING HELPERS
  const getSelectedEventName = () => {
    if (selectedEventId === "all") return "General Guest List";
    const ev = events.find((e) => e.id === selectedEventId);
    return ev ? ev.event_name || ev.title : "Select Event";
  };

  const renderPaginationNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`text-sm px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              currentPage === i
                ? "font-bold bg-[#6B4EFF]/10 text-[#6B4EFF]"
                : "font-medium text-slate-400 hover:text-slate-900"
            }`}
          >
            {i}
          </button>,
        );
      } else if (
        pages[pages.length - 1]?.key !== "dots-" + i &&
        pages[pages.length - 1]?.props?.children !== "..."
      ) {
        pages.push(
          <span
            key={"dots-" + i}
            className="text-sm font-medium text-slate-400 px-1"
          >
            ...
          </span>,
        );
      }
    }
    return pages;
  };

  const renderModalContent = () => {
    if (!modalState) return null;
    switch (modalState.type) {
      case "removeConfirm":
        return (
          <FeedbackModal
            icon={questionIcon}
            title="Are you sure you want to remove this guest?"
            buttons={[
              {
                label: "Cancel",
                variant: "solid",
                onClick: () => setModalState(null),
              },
              {
                label: isActionLoading ? "Removing..." : "Remove",
                variant: "outline",
                onClick: () => handleRemoveGuest(modalState.guestId),
              },
            ]}
          />
        );
      case "removeSuccess":
        return (
          <FeedbackModal
            icon={successIcon}
            title="Guest Removed!"
            buttons={[
              {
                label: "Go to Home",
                variant: "solid",
                onClick: () => setModalState(null),
              },
            ]}
          />
        );
      case "resendConfirm":
        return (
          <FeedbackModal
            icon={questionIcon}
            title="Are you sure you want to resend invitation to this guest?"
            buttons={[
              {
                label: isActionLoading ? "Sending..." : "Send Invitation",
                variant: "solid",
                onClick: () => handleResendInvite(modalState.guestId),
              },
              {
                label: "Cancel",
                variant: "outline",
                onClick: () => setModalState(null),
              },
            ]}
          />
        );
      case "resendSuccess":
        return (
          <FeedbackModal
            icon={successIcon}
            title="Invitation Resent!"
            buttons={[
              {
                label: "Go to Home",
                variant: "solid",
                onClick: () => setModalState(null),
              },
            ]}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && activeView === "list") {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#6B4EFF] w-10 h-10" />
      </div>
    );
  }

  const hasNoEvents = events.length === 0;
  const isGeneralView = selectedEventId === "all";

  return (
    <div className="relative bg-[#F9FAFB] min-h-screen">
      {modalState && <>{renderModalContent()}</>}

      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm py-4 px-10 flex items-center justify-between sticky top-0 z-30 font-poppins">
        <div className="flex items-center gap-8 flex-1">
          <div className="flex items-center gap-4">
            {activeView === "add" ? (
              <button
                onClick={() => setActiveView("list")}
                className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft size={24} />
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft size={24} />
              </Link>
            )}
            <h1 className="text-2xl font-bold whitespace-nowrap text-slate-900">
              {activeView === "add" ? "Add Guest" : "Guest Management"}
            </h1>
          </div>

          {activeView === "list" && !hasNoEvents && guests.length > 0 && (
            <div className="relative w-full max-w-lg">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search guest by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] rounded-xl border-none focus:ring-2 focus:ring-[#6B4EFF]/20 text-sm outline-none transition-all"
              />
            </div>
          )}
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

      {/* CONTENT */}
      <div className="p-10 font-poppins space-y-8">
        {/* ADD GUEST VIEW */}
        {activeView === "add" ? (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-10 mt-4">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
              Enter Guest Mail to Add
            </h2>

            {addError && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {addError}
              </div>
            )}

            {/* Event Selection if coming from General View */}
            {selectedEventId === "all" && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Select Event to Invite Guests to *
                </label>
                <div className="relative">
                  <select
                    value={addGuestForm.targetEventId}
                    onChange={(e) =>
                      setAddGuestForm((prev) => ({
                        ...prev,
                        targetEventId: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 appearance-none bg-white text-slate-700 outline-none focus:border-[#6B4EFF]"
                  >
                    <option value=""> Choose an Event </option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.event_name || ev.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>
            )}

            {/* Manual Email Addition */}
            <div className="flex gap-4 items-center mb-6">
              <input
                type="email"
                value={addGuestForm.manualEmail}
                onChange={(e) =>
                  setAddGuestForm((prev) => ({
                    ...prev,
                    manualEmail: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail(e)}
                placeholder="Enter email here..."
                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#6B4EFF] outline-none placeholder:text-slate-300 transition-colors"
                disabled={!!addGuestForm.file}
              />
              <button
                onClick={handleAddEmail}
                disabled={!!addGuestForm.file}
                className="bg-[#6B4EFF] text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-[#583DD9] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Mail
              </button>
            </div>

            {/* Added Emails Pills */}
            {addGuestForm.emailsToAdd.length > 0 && (
              <div className="mb-8 p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {addGuestForm.emailsToAdd.map((email) => (
                  <span
                    key={email}
                    className="bg-white border border-slate-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm"
                  >
                    {email}
                    <button
                      onClick={() =>
                        setAddGuestForm((prev) => ({
                          ...prev,
                          emailsToAdd: prev.emailsToAdd.filter(
                            (e) => e !== email,
                          ),
                        }))
                      }
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 my-8">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                OR
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* CSV/Excel File Upload */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-slate-900">
                  Import Bulk Guest List
                </span>
                <button className="text-[#6B4EFF] text-xs font-bold border border-[#6B4EFF]/30 px-4 py-2 rounded-lg hover:bg-[#6B4EFF]/5 cursor-pointer">
                  Download Template
                </button>
              </div>
              <label
                className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center transition-colors relative overflow-hidden ${addGuestForm.emailsToAdd.length > 0 ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed" : "border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"}`}
              >
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  disabled={addGuestForm.emailsToAdd.length > 0}
                  onChange={(e) => {
                    if (e.target.files[0])
                      setAddGuestForm((prev) => ({
                        ...prev,
                        file: e.target.files[0],
                      }));
                  }}
                />
                {addGuestForm.file ? (
                  <div className="flex flex-col items-center z-10">
                    <span className="text-sm font-bold text-slate-700">
                      {addGuestForm.file.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setAddGuestForm((prev) => ({ ...prev, file: null }));
                      }}
                      className="mt-3 text-xs text-red-500 font-semibold hover:underline cursor-pointer"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="text-slate-400 mb-3" size={28} />
                    <h3 className="text-lg font-bold text-slate-900">
                      Drop your CSV or Excel file
                    </h3>
                    <div className="mt-4 px-6 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white shadow-sm">
                      Browse
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 border-t border-slate-100 pt-8">
              <button
                onClick={() => setActiveView("list")}
                disabled={isAdding}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitNewGuests}
                disabled={
                  isAdding ||
                  (addGuestForm.emailsToAdd.length === 0 && !addGuestForm.file)
                }
                className="flex-1 py-4 flex justify-center items-center gap-2 bg-[#6B4EFF] text-white font-bold rounded-xl hover:shadow-lg hover:bg-[#583DD9] transition-all cursor-pointer disabled:bg-[#6B4EFF]/50 disabled:cursor-not-allowed"
              >
                {isAdding && <Loader2 className="animate-spin" size={20} />}
                {isAdding ? "Sending..." : "Send Invites"}
              </button>
            </div>
          </div>
        ) : (
          /* LIST VIEWS (General, Specific, Empty) */
          <>
            {/* STATS SECTION */}
            {!hasNoEvents && (
              <div className="grid grid-cols-4 gap-6">
                <StatCard
                  icon={<Users size={24} />}
                  iconBg="bg-[#6B4EFF]/10"
                  iconColor="text-[#6B4EFF]"
                  value={eventStats.total}
                  label="Total Guests Invited"
                />
                <StatCard
                  icon={<UserCheck size={24} />}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-500"
                  value={eventStats.confirmed}
                  label="Confirmed RSVPs"
                />
                <StatCard
                  icon={<Clock size={24} />}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-500"
                  value={eventStats.pending}
                  label="Pending RSVPs"
                />
                <StatCard
                  icon={<UserX size={24} />}
                  iconBg="bg-red-50"
                  iconColor="text-red-500"
                  value={eventStats.declined}
                  label="Declined"
                />
              </div>
            )}

            {/* MAIN CARD */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              {hasNoEvents || (guests.length === 0 && !searchTerm) ? (
                /* EMPTY STATE */
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <img
                    src={emptyStateImg}
                    alt="No Guests"
                    className="w-64 h-64 object-contain mb-6 opacity-80"
                  />
                  <h3 className="text-xl font-bold text-slate-900 mb-8">
                    {hasNoEvents
                      ? "You have no events."
                      : "No Guests Added"}
                  </h3>
                  {hasNoEvents ? (
                    <Link
                      to="/dashboard/create-event"
                      className="bg-[#6B4EFF] text-white px-10 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Create an Event
                    </Link>
                  ) : (
                    <button
                      onClick={() => setActiveView("add")}
                      className="bg-[#6B4EFF] text-white px-10 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer"
                    >
                      Add Guest Now
                    </button>
                  )}
                </div>
              ) : (
                /* FILLED GUEST TABLE STATE */
                <>
                  <div className="p-8 flex flex-row items-center justify-between gap-6 border-b border-slate-50">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1 capitalize">
                        {getSelectedEventName()}
                      </h2>
                      <p className="text-sm text-slate-400">
                        {isGeneralView
                          ? "Showing general list of your guests from all your events"
                          : "Manage guest lists, RSVP statuses, and event access."}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Filter Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center justify-between gap-4 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 min-w-[220px] transition-colors cursor-pointer"
                        >
                          <span className="truncate max-w-[150px] capitalize">
                            {getSelectedEventName()}
                          </span>
                          <ChevronDown
                            size={16}
                            className="text-slate-400 shrink-0"
                          />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute right-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-lg z-10 py-2 max-h-60 overflow-y-auto">
                            <button
                              onClick={() => {
                                setSelectedEventId("all");
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-5 py-2.5 text-sm transition-colors cursor-pointer ${selectedEventId === "all" ? "bg-[#6B4EFF]/5 text-[#6B4EFF] font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                            >
                              All Events
                            </button>
                            {events.map((ev) => (
                              <button
                                key={ev.id}
                                onClick={() => {
                                  setSelectedEventId(ev.id);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-5 py-2.5 text-sm transition-colors cursor-pointer capitalize truncate ${selectedEventId === ev.id ? "bg-[#6B4EFF]/5 text-[#6B4EFF] font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                              >
                                {ev.event_name || ev.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveView("add")}
                        className="bg-[#6B4EFF] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#583DD9] transition-all cursor-pointer"
                      >
                        Add Guest
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-x-auto w-full">
                    {guests.length === 0 && searchTerm ? (
                      <div className="p-12 text-center text-slate-500 font-medium">
                        No guests match your search.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-8 py-5 text-sm font-semibold text-slate-400">
                              Name
                            </th>
                            <th className="px-4 py-5 text-sm font-semibold text-slate-400">
                              Email
                            </th>
                            {isGeneralView && (
                              <th className="px-4 py-5 text-sm font-semibold text-slate-400">
                                Event
                              </th>
                            )}
                            <th className="px-4 py-5 text-sm font-semibold text-slate-400">
                              Invited On
                            </th>
                            <th className="px-4 py-5 text-sm font-semibold text-slate-400">
                              Status
                            </th>
                            <th className="px-8 py-5 text-sm font-semibold text-slate-400 text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {currentGuests.map((guest) => (
                            <tr
                              key={guest.id}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-8 py-5 text-sm font-medium text-slate-700 whitespace-nowrap capitalize">
                                {guest.first_name || guest.name || "Guest"}{" "}
                                {guest.last_name || ""}
                              </td>
                              <td className="px-4 py-5 text-sm text-slate-600 whitespace-nowrap">
                                {guest.email}
                              </td>
                              {isGeneralView && (
                                <td className="px-4 py-5 text-sm text-slate-600 whitespace-nowrap capitalize truncate max-w-[150px]">
                                  {guest.event_name || "-"}
                                </td>
                              )}
                              <td className="px-4 py-5 text-sm text-slate-600 whitespace-nowrap">
                                {guest.created_at
                                  ? new Date(
                                      guest.created_at,
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="px-4 py-5 whitespace-nowrap">
                                <div
                                  className={`flex items-center gap-2 text-sm font-semibold capitalize ${
                                    guest.status === "confirmed"
                                      ? "text-emerald-500"
                                      : guest.status === "declined"
                                        ? "text-red-500"
                                        : "text-orange-400"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      guest.status === "confirmed"
                                        ? "bg-emerald-500"
                                        : guest.status === "declined"
                                          ? "bg-red-500"
                                          : "bg-orange-400"
                                    }`}
                                  />
                                  {guest.status || "Pending"}
                                </div>
                              </td>
                              <td className="px-8 py-5 flex items-center justify-end gap-3 whitespace-nowrap">
                                {(guest.status === "pending" ||
                                  !guest.status) && (
                                  <button
                                    onClick={() =>
                                      setModalState({
                                        type: "resendConfirm",
                                        guestId: guest.id,
                                      })
                                    }
                                    className="px-4 py-1.5 rounded-lg border border-[#6B4EFF] text-[#6B4EFF] text-xs font-semibold hover:bg-[#6B4EFF]/5 transition-colors cursor-pointer"
                                  >
                                    Resend
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    setModalState({
                                      type: "removeConfirm",
                                      guestId: guest.id,
                                    })
                                  }
                                  className="px-4 py-1.5 rounded-lg border border-red-500 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="p-8 border-t border-slate-100 flex flex-row items-center justify-between gap-4">
                      <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {renderPaginationNumbers()}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className={`flex items-center gap-1 px-4 py-2 border rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                            currentPage === 1
                              ? "border-slate-100 text-slate-300 cursor-not-allowed"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          }`}
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`flex items-center gap-1 px-4 py-2 border rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                            currentPage === totalPages
                              ? "border-slate-100 text-slate-300 cursor-not-allowed"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          }`}
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, iconBg, iconColor, value, label }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
    <div
      className={`w-14 h-14 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center shrink-0`}
    >
      {icon}
    </div>
    <div className="truncate">
      <h4 className="text-3xl font-extrabold text-slate-900 leading-tight">
        {value}
      </h4>
      <p className="text-[11px] font-medium text-slate-400 uppercase mt-1 tracking-wide truncate">
        {label}
      </p>
    </div>
  </div>
);

export default GuestManagement;

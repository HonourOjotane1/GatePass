import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  CalendarPlus,
  Users,
  ScanLine,
  TrendingUp,
  Settings,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import logopurple from "../assets/Logo-purple.svg";
import hero_img from "../assets/Hero_img.png";
import Features_img from "../assets/Features_img.png";
import Discover_img from "../assets/Discover_img.png";
import Conference_img from "../assets/Conference_img.png";
import Musicshows_img from "../assets/Musicshows_img.png";
import Comedyshows_img from "../assets/Comedyshows_img.png";
import Corporateevents_img from "../assets/Corporateevents_img.png";
import Sportevents_img from "../assets/Sportevents_img.png";
import Lotsmore_img from "../assets/Lotsmore_img.png";

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-poppins overflow-x-hidden">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="max-w-18 h-8 flex items-center justify-center">
              <img src={logopurple} alt="Gatepass Logo"/>
            </div>
            <span className="text-xl font-bold text-black tracking-tight">
              GatePass
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <a
              href="#features"
              className="hover:text-[#6B4EFF] transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-[#6B4EFF] transition-colors"
            >
              Pricing
            </a>
            <a
              href="#contact"
              className="hover:text-[#6B4EFF] transition-colors"
            >
              Contact
            </a>
            <Link
              to="/signup"
              className="bg-[#6B4EFF] text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-[#6B4EFF]/20 hover:bg-[#583DD9] transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-600"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 py-6 px-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-4">
            <a
              href="#features"
              onClick={toggleMobileMenu}
              className="font-medium text-slate-600 py-2 border-b border-slate-50"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={toggleMobileMenu}
              className="font-medium text-slate-600 py-2 border-b border-slate-50"
            >
              Pricing
            </a>
            <a
              href="#contact"
              onClick={toggleMobileMenu}
              className="font-medium text-slate-600 py-2 mb-4"
            >
              Contact
            </a>
            <Link
              to="/signup"
              onClick={toggleMobileMenu}
              className="bg-[#6B4EFF] text-center text-white px-6 py-3 rounded-xl font-semibold"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative mt-20 pb-15 text-center overflow-hidden h-full">
        <div className="relative hero-bg pt-12 lg:pt-20 overflow-hidden w-full h-[50%]">
          {/* Decorative Background Blob */}
          {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[#6B4EFF]/5 rounded-full blur-3xl -z-10"></div> */}

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-900 mb-4 max-w-4xl mx-auto">
            The Better <br className="hidden md:block" />
            <span className="text-[#6B4EFF]">Way In</span>
          </h1>

          <p className="text-slate-600 text-xl md:text-2xl max-w-2xl mx-auto mb-10 font-medium tracking-wide">
            Smarter Events. Seamless Access.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-[#6B4EFF] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-[#6B4EFF]/25 hover:bg-[#583DD9] hover:-translate-y-1 transition-all"
            >
              Get Started
            </Link>
            <a
              href="#contact"
              className="w-full sm:w-auto border-2 border-[#6B4EFF]/20 text-[#6B4EFF] bg-white px-8 py-4 rounded-xl font-bold hover:border-[#6B4EFF] hover:bg-[#6B4EFF]/5 transition-all"
            >
              Request a demo
            </a>
          </div>

          {/* Dashboard Mockup Image */}
          <div className="relative mx-auto max-w-5xl overflow-hidden group">
            <img
              src={hero_img}
              alt="Dashboard Preview"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-20 lg:py-20 bg-[#FDFDFF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16">
            How GatePass Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <WorkCard
              icon={<CalendarPlus size={24} />}
              title="Create Your Event"
              desc="Set up event details, ticketing, and access rules in minutes."
            />
            <WorkCard
              icon={<Users size={24} />}
              title="Invite Your Guests"
              desc="Upload your guest list, send invitations, and manage RSVPs in real time."
            />
            <WorkCard
              icon={<ScanLine size={24} />}
              title="Check-in Securely"
              desc="Verify guests instantly using QR codes and smart access control."
            />
            <WorkCard
              icon={<TrendingUp size={24} />}
              title="Track & Improve"
              desc="Monitor attendance, engagement, and event performance."
            />
          </div>
        </div>
      </section>

      {/* --- CORE FEATURES --- */}
      <section id="features" className="py-16 lg:pt-10 lg:pb-30 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 text-center mb-16">
            Core Features
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Feature Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-[2rem] overflow-hidden shadow-xl aspect-square lg:aspect-[4/5]">
                <img
                  src={Features_img}
                  alt="Scanning QR Code"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Features List */}
            <div className="w-full lg:w-1/2 flex flex-col gap-8">
              <FeatureItem
                icon={<CheckCircle2 />}
                title="RSVP & Guest Management"
                desc="Upload guest lists, manage categories, send reminders, and track responses."
              />
              <FeatureItem
                icon={<ShieldCheck />}
                title="Secure Access Control"
                desc="Prevent duplicate entries with QR verification and offline check-in."
              />
              <FeatureItem
                icon={<TrendingUp />}
                title="Real-Time Analytics"
                desc="See attendance trends, engagement scores, and event performance instantly."
              />
              <FeatureItem
                icon={<Settings />}
                title="Custom Branding"
                desc="Personalize event banners, passes, and invitations."
              />
              <FeatureItem
                icon={<MapPin />}
                title="Events Around You"
                desc="Discover nearby concerts, conferences, sports, and community events."
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- DISCOVER SECTION --- */}
      <section className="relative py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={Discover_img}
            alt="Concert Crowd"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-start gap-8 lg:gap-16 w-full">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Discover Events <br />
              Happening Near You
            </h2>
            <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto lg:mx-0">
              Explore concerts, comedy shows, sports events, tech meetups, and
              cultural experiences happening around you.
            </p>
          </div>
          <div className="shrink-0">
            <button className="bg-white text-[#6B4EFF] px-8 py-4 rounded-xl font-bold cursor-pointer hover:shadow-xl hover:scale-105 transition-all">
              Explore Events
            </button>
          </div>
        </div>
      </section>

      {/* --- WHO IS IT FOR --- */}
      <section className="py-20 lg:py-32 bg-[#FDFDFF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 text-center mb-16">
            Who is GatePass For
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <UseCaseCard
              title="Conferences"
              img={Conference_img}
            />
            <UseCaseCard
              title="Music Concerts"
              img={Musicshows_img}
            />
            <UseCaseCard
              title="Comedy Shows"
              img={Comedyshows_img}
            />
            <UseCaseCard
              title="Corporate Events"
              img={Corporateevents_img}
            />
            <UseCaseCard
              title="Sports Events"
              img={Sportevents_img}
            />
            <UseCaseCard
              title="Lots More...."
              img={Lotsmore_img}
            />
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="py-16 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center md:text-left leading-tight">
            Built for <span className="text-[#6B4EFF]">Reliability</span>,{" "}
            <br />
            <span className="text-[#6B4EFF]">Security</span>, and{" "}
            <span className="text-[#6B4EFF]">Scale</span>
          </h2>
          <Link
            to="/signup"
            className="bg-[#6B4EFF] text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-[#6B4EFF]/20 hover:bg-[#583DD9] hover:-translate-y-1 transition-all whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#FDFDFF] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-500">
            © {new Date().getFullYear()} GatePass — The Better Way In
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-[#6B4EFF] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#6B4EFF] transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* --- HELPER COMPONENTS --- */

const WorkCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
    <div className="w-16 h-16 bg-[#6B4EFF]/10 text-[#6B4EFF] rounded-full flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex items-start gap-5 group">
    <div className="w-12 h-12 shrink-0 bg-[#6B4EFF]/10 text-[#6B4EFF] rounded-full flex items-center justify-center group-hover:bg-[#6B4EFF] group-hover:text-white transition-colors duration-300">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const UseCaseCard = ({ title, img }) => (
  <div className="relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer">
    <img
      src={img}
      alt={title}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80"></div>
    <div className="absolute bottom-6 left-6 right-6">
      <h3 className="text-xl font-bold text-white group-hover:-translate-y-1 transition-transform">
        {title}
      </h3>
    </div>
  </div>
);

export default Home;

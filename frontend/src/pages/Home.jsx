import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center">
      {/* NAV */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
            GP
          </div>
          <span className="font-semibold text-lg">GatePass</span>
        </div>

        <nav className="hidden md:flex gap-8 items-center text-sm text-gray-700">
          <a href="#features" className="hover:text-gray-900">
            Features
          </a>
          <a href="#pricing" className="hover:text-gray-900">
            Pricing
          </a>
          <a href="#contact" className="hover:text-gray-900">
            Contact
          </a>
          <button className="ml-4 px-4 py-2 rounded-md bg-blue-600 text-white font-medium shadow">
            Get Started
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            aria-label="open menu"
            className="p-2 rounded-md bg-white shadow"
          >
            ☰
          </button>
        </div>
      </header>

      {/* HERO */}
      <main className="max-w-7xl mx-auto px-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12 md:py-20">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              Modern guest management
              <br />
              platform for events
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Secure digital RSVP, unique ID generation, and real-time check-in
              for seamless access control at conferences, corporate events, and
              private gatherings.
            </p>

            <div className="mt-8 flex gap-4">
              <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg">
                Get Started
              </button>
              <a
                href="#demo"
                className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700"
              >
                Request a Demo
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500">Trusted by</div>
                <div className="mt-2 text-sm font-medium">
                  150+ Event Organizers
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500">Avg check-in time</div>
                <div className="mt-2 text-sm font-medium">under 3 seconds</div>
              </div>
            </div>
          </div>

          {/* Illustration / mockup */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">
              {/* small hero mockup card */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">RSVP confirmed</div>
                  <div className="mt-2 font-semibold">Jane Doe</div>
                </div>
                <div className="text-blue-600 font-semibold">#A12B9</div>
              </div>

              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Event Access Pass</div>
                    <div className="text-xs text-gray-500">
                      Valid: Sep 30, 2025
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-gray-100 text-xs rounded">
                    VIP
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Name on ID</div>
                  <div className="font-medium">Jane Doe</div>
                </div>

                <div className="p-4 bg-white">
                  <div className="h-8 bg-gray-100 rounded" />
                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Barcode</div>
                  <div className="font-mono text-sm">||:|::||::|:|:||</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold">
              Everything you need for secure guest management
            </h2>
            <p className="mt-4 text-gray-600">
              Tools for hosts, check-in teams, and security to manage events
              confidently.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <article className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                🔒
              </div>
              <h3 className="mt-4 text-lg font-semibold">Secure RSVP</h3>
              <p className="mt-2 text-gray-600 text-sm">
                Encrypted RSVP forms, guest validation and fraud prevention.
              </p>
            </article>

            <article className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                🆔
              </div>
              <h3 className="mt-4 text-lg font-semibold">ID Generation</h3>
              <p className="mt-2 text-gray-600 text-sm">
                Unique digital IDs with names, photos and scannable
                barcodes/QRs.
              </p>
            </article>

            <article className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                ⚡
              </div>
              <h3 className="mt-4 text-lg font-semibold">Real-Time Check-In</h3>
              <p className="mt-2 text-gray-600 text-sm">
                Instant check-ins, capacity limits and live attendance
                dashboard.
              </p>
            </article>
          </div>

          <div className="mt-10 flex justify-center">
            <button className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg">
              Get Started
            </button>
          </div>
        </section>

        {/* CTA / Pricing snippet */}
        <section
          id="pricing"
          className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50 rounded-xl"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center px-6">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold">
                Scale your events with confidence
              </h3>
              <p className="mt-3 text-gray-600">
                Plans for small meetups to large conferences — built with
                privacy and speed in mind.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="text-sm text-gray-500">Starter</div>
              <div className="mt-2 text-2xl font-bold">
                $29<span className="text-sm font-medium">/mo</span>
              </div>
              <ul className="mt-4 text-sm text-gray-600 space-y-2">
                <li>Digital RSVP</li>
                <li>ID generation</li>
                <li>Basic analytics</li>
              </ul>
              <button className="mt-6 w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium">
                Get Started
              </button>
            </div>
          </div>
        </section>

        {/* Contact / footer CTA */}
        <section id="contact" className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h4 className="text-xl font-semibold">
              Interested in a custom demo?
            </h4>
            <p className="mt-2 text-gray-600">
              Tell us about your event and we'll show how GatePass can help.
            </p>
            <div className="mt-6 flex justify-center">
              <button className="px-6 py-3 rounded-2xl bg-white border border-gray-200">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 py-8 border-t bg-white w-full">
        <div className="max-w-7xl mx-auto px-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            © {new Date().getFullYear()} GatePass — made for better events
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:underline">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

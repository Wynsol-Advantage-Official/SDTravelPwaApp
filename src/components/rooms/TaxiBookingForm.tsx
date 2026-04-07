"use client";

import { useState } from "react";
import { Car, Plane, ShieldCheck, Users, ChevronRight, Check } from "lucide-react";

const TRANSFER_TYPES = [
  {
    id: "airport",
    label: "Airport Drop-off / Pickup",
    description: "Seamless transfers to and from the airport.",
    icon: Plane,
  },
  {
    id: "private",
    label: "Private Transfer",
    description: "A dedicated vehicle and driver for your personal itinerary.",
    icon: Car,
  },
  {
    id: "executive",
    label: "Executive Transfer",
    description: "Premium vehicles for business and VIP travel.",
    icon: ShieldCheck,
  },
  {
    id: "group",
    label: "Group Transfer",
    description: "Comfortable transport for larger parties and events.",
    icon: Users,
  },
] as const;

type TransferTypeId = (typeof TRANSFER_TYPES)[number]["id"];

export function TaxiBookingForm() {
  const [selected, setSelected] = useState<TransferTypeId | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickup: "",
    dropoff: "",
    date: "",
    time: "",
    passengers: "1",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate with booking API
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-ocean-deep dark:text-white">
          Booking Request Sent
        </h2>
        <p className="mb-6 max-w-md text-ocean-deep/60 dark:text-white/50">
          Thank you! Our concierge team will confirm your{" "}
          {TRANSFER_TYPES.find((t) => t.id === selected)?.label.toLowerCase() ?? "transfer"}{" "}
          shortly.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSelected(null);
            setFormData({
              name: "",
              email: "",
              phone: "",
              pickup: "",
              dropoff: "",
              date: "",
              time: "",
              passengers: "1",
              notes: "",
            });
          }}
          className="rounded-lg bg-ocean px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ocean-deep dark:bg-blue-chill dark:hover:bg-blue-chill/80"
        >
          Book Another Transfer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Step 1: Transfer type selection */}
      <section>
        <h2 className="mb-1 text-lg font-semibold text-ocean-deep dark:text-white">
          1. Select Transfer Type
        </h2>
        <p className="mb-5 text-sm text-ocean-deep/55 dark:text-white/45">
          Choose the service that best fits your travel needs.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TRANSFER_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = selected === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelected(type.id)}
                className={[
                  "flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200",
                  isActive
                    ? "border-ocean bg-ocean/5 ring-2 ring-ocean/20 dark:border-blue-chill dark:bg-blue-chill/10 dark:ring-blue-chill/20"
                    : "border-khaki/30 bg-white hover:border-ocean/40 dark:border-luxborder dark:bg-ocean-card dark:hover:border-blue-chill/40",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isActive
                      ? "bg-ocean/15 dark:bg-blue-chill/20"
                      : "bg-tan/40 dark:bg-ocean-card2",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-5 w-5",
                      isActive
                        ? "text-ocean dark:text-blue-chill"
                        : "text-ocean-deep/50 dark:text-white/40",
                    ].join(" ")}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-ocean-deep dark:text-white">
                    {type.label}
                  </h3>
                  <p className="mt-0.5 text-sm text-ocean-deep/55 dark:text-white/45">
                    {type.description}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight className="ml-auto mt-1 h-5 w-5 shrink-0 text-ocean dark:text-blue-chill" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Booking details (shown once a type is selected) */}
      {selected && (
        <section>
          <h2 className="mb-1 text-lg font-semibold text-ocean-deep dark:text-white">
            2. Trip Details
          </h2>
          <p className="mb-5 text-sm text-ocean-deep/55 dark:text-white/45">
            Fill in your journey information below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="taxi-name" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                  Full Name
                </label>
                <input
                  id="taxi-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
                />
              </div>
              <div>
                <label htmlFor="taxi-email" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                  Email
                </label>
                <input
                  id="taxi-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
                />
              </div>
              <div>
                <label htmlFor="taxi-phone" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                  Phone
                </label>
                <input
                  id="taxi-phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
                />
              </div>
            </div>

            {/* Route */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="taxi-pickup" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                  Pickup Location
                </label>
                <input
                  id="taxi-pickup"
                  name="pickup"
                  type="text"
                  required
                  placeholder="e.g. Julius Nyerere International Airport"
                  value={formData.pickup}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep placeholder:text-ocean-deep/35 outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:placeholder:text-white/25 dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
                />
              </div>
              <div>
                <label htmlFor="taxi-dropoff" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                  Drop-off Location
                </label>
                <input
                  id="taxi-dropoff"
                  name="dropoff"
                  type="text"
                  required
                  placeholder="e.g. Serena Hotel, Dar es Salaam"
                  value={formData.dropoff}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep placeholder:text-ocean-deep/35 outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:placeholder:text-white/25 dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
                />
              </div>
            </div>

            {/* Date, Time, Passengers */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="taxi-date" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                  Date
                </label>
                <input
                  id="taxi-date"
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
                />
              </div>
              <div>
                <label htmlFor="taxi-time" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                  Time
                </label>
                <input
                  id="taxi-time"
                  name="time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
                />
              </div>
              <div>
                <label htmlFor="taxi-passengers" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                  Passengers
                </label>
                <select
                  id="taxi-passengers"
                  name="passengers"
                  value={formData.passengers}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "passenger" : "passengers"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="taxi-notes" className="mb-1 block text-sm font-medium text-ocean-deep dark:text-white/80">
                Special Requests (optional)
              </label>
              <textarea
                id="taxi-notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Child seats, flight number, luggage requirements…"
                className="w-full rounded-lg border border-khaki/30 bg-white px-3 py-2.5 text-sm text-ocean-deep placeholder:text-ocean-deep/35 outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:placeholder:text-white/25 dark:focus:border-blue-chill dark:focus:ring-blue-chill/20"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-ocean px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-deep dark:bg-blue-chill dark:hover:bg-blue-chill/80"
            >
              Request Booking
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plane,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  CloudSun,
} from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/bento";
import { Reveal } from "@/components/motion";

/* ------------------------------------------------------------------ */
/*  Filter themes                                                      */
/* ------------------------------------------------------------------ */
const FILTER_THEMES = [
  "Beach & Sea",
  "Adventure",
  "Culture",
  "Gastronomy",
  "Romance",
  "Eco & Nature",
] as const;

/* ------------------------------------------------------------------ */
/*  Sub-cards                                                          */
/* ------------------------------------------------------------------ */

/** Main hero card — col 1, spans both rows */
function HeroMainCard() {
  return (
    <BentoCard
      variant="hero"
      span={{ col: 1, row: 2 }}
      className="relative flex flex-col justify-end p-5 overflow-hidden border border-white/10"
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/media/home-hero-poster.jpg)",
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
      {/* Gradient scrim for text legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-luxgold-dim via-blue-chill-dim/60 to-transparent "
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Eyebrow */}
        <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-white/60">
          Featured Collection 2026
        </span>

        {/* Headline */}
        <h1 className="font-sans text-[38px] leading-tight max-w-[11ch] text-white">
          Where Every Journey Becomes a{" "}
          <em className="italic text-blue-chill-300">Diamond</em>
        </h1>

        {/* CTAs */}
        <div className="flex items-center gap-3 mt-2">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 rounded-[8px] bg-ocean px-4 py-2 text-[12px] font-semibold uppercase text-ocean-deep transition-[transform,background-color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:bg-blue-chill"
          >
            Explore Diamonds
          </Link>
        </div>
      </div>
    </BentoCard>
  );
}

/** Search card — col 2, row 1 */
function SearchCard() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    if (guests) params.set("guests", guests);
    router.push(`/tours${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <BentoCard variant="default" hoverable className="p-4 flex flex-col">
      <h3 className="font-sans text-[18px] text-ocean-deep dark:text-white mb-3">
        <Search className="inline-block w-4 h-4 mr-2 text-blue-chill" aria-hidden="true" />
        Search
      </h3>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 flex-1">
        <div className="grid grid-cols-2 gap-2">
          {/* From */}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ocean-deep/55 dark:text-white/60 font-sans">
              From
            </span>
            <div className="relative">
              <Plane className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ocean-deep/35 dark:text-white/40" aria-hidden="true" />
              <input
                type="text"
                placeholder="City"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full h-[36px] rounded-[8px] bg-white border border-khaki/30 pl-7 pr-2 text-[13px] text-ocean-deep placeholder:text-ocean-deep/40 font-sans focus:border-ocean/30 focus:outline-none focus:ring-1 focus:ring-ocean/30 dark:bg-ocean-card2 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-blue-chill/30 dark:focus:ring-blue-chill/30"
              />
            </div>
          </label>

          {/* Destination */}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ocean-deep/55 dark:text-white/60 font-sans">
              Destination
            </span>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ocean-deep/35 dark:text-white/40" aria-hidden="true" />
              <input
                type="text"
                placeholder="Where to?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full h-[36px] rounded-[8px] bg-white border border-khaki/30 pl-7 pr-2 text-[13px] text-ocean-deep placeholder:text-ocean-deep/40 font-sans focus:border-ocean/30 focus:outline-none focus:ring-1 focus:ring-ocean/30 dark:bg-ocean-card2 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-blue-chill/30 dark:focus:ring-blue-chill/30"
              />
            </div>
          </label>

          {/* Departure date */}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ocean-deep/55 dark:text-white/60 font-sans">
              Departure
            </span>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ocean-deep/35 dark:text-white/40" aria-hidden="true" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-[36px] rounded-[8px] bg-white border border-khaki/30 pl-7 pr-2 text-[13px] text-ocean-deep placeholder:text-ocean-deep/40 font-sans focus:border-ocean/30 focus:outline-none focus:ring-1 focus:ring-ocean/30 dark:bg-ocean-card2 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-blue-chill/30 dark:focus:ring-blue-chill/30"
              />
            </div>
          </label>

          {/* Guests */}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ocean-deep/55 dark:text-white/60 font-sans">
              Guests
            </span>
            <div className="relative">
              <Users className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ocean-deep/35 dark:text-white/40" aria-hidden="true" />
              <input
                type="number"
                min={1}
                max={20}
                placeholder="2"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full h-[36px] rounded-[8px] bg-white border border-khaki/30 pl-7 pr-2 text-[13px] text-ocean-deep placeholder:text-ocean-deep/40 font-sans focus:border-ocean/30 focus:outline-none focus:ring-1 focus:ring-ocean/30 dark:bg-ocean-card2 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-blue-chill/30 dark:focus:ring-blue-chill/30"
              />
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="mt-auto w-full h-[36px] rounded-[8px] bg-ocean text-white text-[12px] font-semibold uppercase font-sans transition-[transform,background-color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:bg-blue-chill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ocean-card"
        >
          <Search className="inline-block w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
          Search
        </button>
      </form>
    </BentoCard>
  );
}

/** Quick-filter card — col 2, row 2 */
function QuickFilterCard() {
  const [active, setActive] = useState<Set<string>>(new Set());

  function toggleTheme(theme: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(theme)) {
        next.delete(theme);
      } else {
        next.add(theme);
      }
      return next;
    });
  }

  return (
    <BentoCard variant="default" className="p-4 flex flex-col">
      <h3 className="font-sans text-[16px] text-ocean-deep dark:text-white mb-3">Quick Filters</h3>
      <div className="flex flex-wrap gap-2">
        {FILTER_THEMES.map((theme) => {
          const isActive = active.has(theme);
          return (
            <button
              key={theme}
              type="button"
              onClick={() => toggleTheme(theme)}
              className={[
                "rounded-[8px] border px-3 py-1.5 text-[12px] font-sans transition-[background-color,border-color,color] duration-[220ms] ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ocean-card",
                isActive
                  ? "bg-ocean/8 border-ocean/25 text-ocean dark:bg-blue-chill/10 dark:border-blue-chill/30 dark:text-blue-chill-300"
                  : "border-khaki/30 text-ocean-deep/60 hover:bg-ocean/8 hover:border-ocean/25 hover:text-ocean dark:border-white/10 dark:text-white/60 dark:hover:bg-blue-chill/10 dark:hover:border-blue-chill/30 dark:hover:text-blue-chill-300",
              ].join(" ")}
              aria-pressed={isActive}
            >
              {theme}
            </button>
          );
        })}
      </div>
    </BentoCard>
  );
}

/** Weather card — top of col 3 side stack */
function WeatherCard() {
  // TODO: Replace with live weather service integration
  return (
    <BentoCard variant="stat" className="p-4 flex flex-col items-center justify-center text-center flex-1">
      <CloudSun className="w-7 h-7 text-blue-chill mb-2" aria-hidden="true" />
      <span className="font-display text-[32px] font-light leading-none text-ocean dark:text-blue-chill-300">
        28°C
      </span>
      <span className="mt-1 font-sans text-[11px] uppercase tracking-[0.16em] text-ocean-deep/55 dark:text-white/60">
        Kingston, Jamaica
      </span>
      <span className="mt-0.5 font-sans text-[11px] text-ocean-deep/40 dark:text-white/40">
        Partly Cloudy
      </span>
    </BentoCard>
  );
}

/** Concierge card — bottom of col 3 side stack */
function ConciergeCard() {
  return (
    <BentoCard variant="default" hoverable className="p-4 flex flex-col justify-between flex-1">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-ocean-deep/55 dark:text-white/60">
            Concierge Online
          </span>
        </div>
        <p className="font-sans text-[13px] text-ocean-deep leading-relaxed dark:text-white">
          Your personal travel advisor is ready to help plan your next journey.
        </p>
      </div>
      <Link
        href="/dashboard/chat"
        className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-[8px] border border-khaki/40 px-3 py-2 text-[12px] font-semibold uppercase text-ocean-deep font-sans transition-[transform,border-color,color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:border-ocean/30 hover:text-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:text-white dark:hover:border-blue-chill/30 dark:hover:text-blue-chill-300 dark:focus-visible:ring-offset-ocean-card"
      >
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        Chat Now
      </Link>
    </BentoCard>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryHero                                                         */
/* ------------------------------------------------------------------ */

export function LuxuryHero() {
  return (
    <section aria-label="Hero" className="w-full">
      <Reveal>
        {/* Desktop / large-screen bento grid */}
        <div className="hidden lg:block">
          <BentoGrid columns="1fr 1fr 280px" rows="260px 180px" gap={10}>
            {/* Col 1, rows 1–2 */}
            <HeroMainCard />

            {/* Col 2, row 1 */}
            <SearchCard />

            {/* Col 2, row 2 */}
            <QuickFilterCard />

            {/* Col 3, rows 1–2 — side stack wrapper */}
            <div className="flex flex-col gap-[10px]" style={{ gridRow: "1 / -1" }}>
              <WeatherCard />
              <ConciergeCard />
            </div>
          </BentoGrid>
        </div>

        {/* Mobile / tablet stacked layout */}
        <div className="flex flex-col gap-[10px] lg:hidden">
          <div className="min-h-[320px]">
            <HeroMainCard />
          </div>
          <SearchCard />
          <QuickFilterCard />
          <div className="grid grid-cols-2 gap-[10px]">
            <WeatherCard />
            <ConciergeCard />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

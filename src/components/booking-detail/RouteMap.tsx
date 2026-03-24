"use client"

import type { ItineraryDay, Destination } from "@/types/tour"

interface RouteMapProps {
  itinerary: ItineraryDay[]
  destination: Destination | null
}

function buildMapQuery(itinerary: ItineraryDay[], destination: Destination | null): string {
  // Build waypoints from itinerary day destinations + main destination
  const waypoints: string[] = []

  for (const day of itinerary) {
    if (day.destinations && day.destinations.length > 0) {
      for (const dest of day.destinations) {
        if (dest.name && !waypoints.includes(dest.name)) {
          waypoints.push(dest.name)
        }
      }
    }
  }

  // Add main destination if no itinerary destinations
  if (waypoints.length === 0 && destination) {
    waypoints.push(destination.name)
  }

  // Also add accommodation locations from itinerary
  for (const day of itinerary) {
    if (day.accommodation && !waypoints.includes(day.accommodation)) {
      waypoints.push(day.accommodation)
    }
  }

  return waypoints.slice(0, 6).join(" → ") || "Travel Route"
}

export function RouteMap({ itinerary, destination }: RouteMapProps) {
  const locationQuery = buildMapQuery(itinerary, destination)

  // Build a Google Maps embed URL for the route
  const embedQuery = destination
    ? `${destination.name}, ${destination.region}`
    : locationQuery

  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(embedQuery)}&output=embed`

  return (
    <section>
      <h2 className="font-serif text-2xl font-bold text-charcoal">Route Map</h2>
      {locationQuery !== "Travel Route" && (
        <p className="mt-1 text-sm text-charcoal/50">{locationQuery}</p>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-charcoal/10">
        <iframe
          title="Tour route map"
          src={embedUrl}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      </div>

      {destination && (
        <div className="mt-3 flex items-center gap-2">
          <svg className="h-4 w-4 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination.name}, ${destination.region}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ocean transition-colors hover:text-ocean/80"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </section>
  )
}

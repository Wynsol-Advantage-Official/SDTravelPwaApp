"use client"

import type { ItineraryDay } from "@/types/tour"
import { ItineraryTimeline } from "@/components/tours/ItineraryTimeline"

interface ItinerarySectionProps {
  itinerary: ItineraryDay[]
  tourDate: string | null
}

function generateGoogleCalendarUrl(
  title: string,
  startDate: string,
  dayCount: number,
  description: string,
): string {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(end.getDate() + dayCount)

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: description,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function ItinerarySection({ itinerary, tourDate }: ItinerarySectionProps) {
  if (itinerary.length === 0) return null

  const totalDays = itinerary.length
  const calendarDescription = itinerary
    .map((day) => `Day ${day.dayNumber}: ${day.title}`)
    .join("\\n")

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Itinerary</h2>
          <p className="mt-1 text-sm text-charcoal/50">
            {totalDays} {totalDays === 1 ? "day" : "days"} of adventure
          </p>
        </div>

        {tourDate && (
          <a
            href={generateGoogleCalendarUrl(
              itinerary[0]?.title ?? "Sand Diamonds Travel Trip",
              tourDate,
              totalDays,
              calendarDescription,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-charcoal/10 bg-white px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-gold hover:text-gold"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Save to Google Calendar
          </a>
        )}
      </div>

      {/* Mini calendar strip */}
      {tourDate && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {itinerary.map((day) => {
            const date = new Date(tourDate)
            date.setDate(date.getDate() + day.dayNumber - 1)
            return (
              <div
                key={day._id}
                className="flex min-w-18 shrink-0 flex-col items-center rounded-lg border border-charcoal/10 bg-white px-3 py-2"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-lg font-bold text-charcoal">
                  {date.getDate()}
                </span>
                <span className="text-[10px] text-charcoal/50">
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Timeline */}
      <div className="mt-6">
        <ItineraryTimeline days={itinerary} />
      </div>
    </section>
  )
}

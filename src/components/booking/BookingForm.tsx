"use client"

import { useState } from "react"
import { Plane, Car, Building2, Home, CheckCircle2 } from "lucide-react"
import { useBooking } from "@/hooks/useBooking"
import { useAuth } from "@/hooks/useAuth"
import { PriceSummary } from "./PriceSummary"
import { Button } from "@/components/ui/Button"
import type { PickupDetails } from "@/types/booking"

interface BookingFormProps {
  tourSlug: string
  tourTitle: string
  tourId: string
  startingPrice: number
  currency: string
}

// ── Shared primitives ─────────────────────────────────────────────────────

function OptionCard({
  icon,
  label,
  sublabel,
  selected,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-4 rounded-lg border-2 px-5 py-4 text-left transition-all duration-200",
        selected ? "border-ocean bg-ocean/5 shadow-sm" : "border-tan/30 bg-white hover:border-tan hover:shadow-sm",
      ].join(" ")}
    >
      <span className={[
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        selected ? "bg-ocean text-ocean-deep" : "bg-white text-ocean-deep/50",
      ].join(" ")}>{icon}</span>
      <span>
        <span className="block font-semibold text-ocean-deep">{label}</span>
        {sublabel && <span className="block text-sm text-ocean-deep/50">{sublabel}</span>}
      </span>
      {selected && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-ocean" />}
    </button>
  )
}

export function BookingForm({
    tourSlug,
    tourTitle,
    tourId,
    startingPrice,
    currency,
  }: BookingFormProps) {
    const { user, loading: authLoading } = useAuth()
  const { state, setDates, setGuests, setArrival, setRoom, setPickup, submit, reset } =
    useBooking(tourSlug, tourId, currency)

  // ── Core fields ──────────────────────────────────────────────────────────
  const [dateInput, setDateInput] = useState("")
  const [guestInput, setGuestInput] = useState(1)
  const [arrivalChoice, setArrivalChoice] = useState<boolean | null>(null)
  const [accomChoice, setAccomChoice] = useState<"resort" | "airbnb" | null>(null)

  // ── Flight pickup fields ─────────────────────────────────────────────────
  const [departureCountry, setDepartureCountry] = useState("")
  const [departureAirport, setDepartureAirport] = useState("")
  const [arrivalAirport, setArrivalAirport] = useState("")
  const [flightArrivalDate, setFlightArrivalDate] = useState("")
  const [flightArrivalTime, setFlightArrivalTime] = useState("")
  const [flightNumber, setFlightNumber] = useState("")

  // ── Resort / Hotel pickup fields ─────────────────────────────────────────
  const [hotelName, setHotelName] = useState("")
  const [hotelAddress, setHotelAddress] = useState("")
  const [roomNumber, setRoomNumber] = useState("")

  // ── Airbnb pickup field ──────────────────────────────────────────────────
  const [rentalAddress, setRentalAddress] = useState("")

  if (authLoading) return <div className="py-12 text-center text-ocean-deep/50">Loading…</div>
  if (!user)
    return (
      <div className="py-12 text-center">
        <p className="mb-4 font-sans text-xl text-ocean-deep">Sign in to book this diamond</p>
        <Button href="/dashboard">Sign In</Button>
      </div>
    )

  // ── Outcome states (after submission) ───────────────────────────────────
  if (state.step === "processing")
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
        <p className="text-ocean-deep/70">Processing your booking…</p>
      </div>
    )

  if (state.step === "confirmed")
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-4xl text-ocean">◆</div>
        <h2 className="font-sans text-2xl font-bold text-ocean-deep">Booking Confirmed!</h2>
        <p className="mt-2 text-ocean-deep/70">
          Reference: <code className="font-mono text-sm text-ocean">{state.bookingId}</code>
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/dashboard/bookings">View My Bookings</Button>
          <Button variant="outline" href="/tours">Explore More</Button>
        </div>
      </div>
    )

  if (state.step === "hold")
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-4xl text-ocean">◇</div>
        <h2 className="font-sans text-2xl font-bold text-ocean-deep">Your Interest Has Been Noted!</h2>
        <p className="mt-3 max-w-sm mx-auto text-ocean-deep/70">
          We&apos;ve placed a concierge hold on{" "}
          <span className="font-semibold text-ocean-deep">{tourTitle}</span>. A Sand Diamonds
          travel specialist will contact you within 24 hours to confirm your transfer and
          complete the booking.
        </p>
        <p className="mt-2 text-xs text-ocean-deep/40">
          Reference: <code className="font-mono text-ocean">{state.bookingId}</code>
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/dashboard/bookings">View My Requests</Button>
          <Button variant="outline" href="/tours">Explore More</Button>
        </div>
      </div>
    )

  if (state.step === "error")
    return (
      <div className="py-12 text-center">
        <h2 className="font-sans text-2xl font-bold text-ocean-deep">Something Went Wrong</h2>
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
        <div className="mt-6"><Button onClick={reset}>Try Again</Button></div>
      </div>
    )

  // ── Validation ───────────────────────────────────────────────────────────
  const flightValid =
    arrivalChoice === true &&
    !!departureCountry && !!departureAirport && !!arrivalAirport &&
    !!flightArrivalDate && !!flightArrivalTime

  const resortValid =
    arrivalChoice === false && accomChoice === "resort" &&
    !!hotelName && !!hotelAddress && !!roomNumber

  const airbnbValid =
    arrivalChoice === false && accomChoice === "airbnb" && !!rentalAddress

  const pickupValid = flightValid || resortValid || airbnbValid
  const allValid = !!dateInput && guestInput > 0 && arrivalChoice !== null && pickupValid

  const buildPickup = (): PickupDetails => {
    if (arrivalChoice) {
      return {
        type: "flight",
        departureCountry,
        departureAirport,
        arrivalAirport,
        arrivalDate: flightArrivalDate,
        arrivalTime: flightArrivalTime,
        flightNumber: flightNumber || undefined,
      }
    }
    if (accomChoice === "resort") {
      return { type: "resort", hotelName, hotelAddress, roomNumber }
    }
    return { type: "airbnb", address: rentalAddress }
  }

  const handleConfirm = async () => {
    const pickup = buildPickup()
    const guestTotal = guestInput * startingPrice

    // Dispatch for consistent UI state
    setDates(dateInput)
    setGuests(guestInput, guestTotal)
    setArrival(arrivalChoice!)
    if (accomChoice) setRoom(accomChoice)
    setPickup(pickup)

    // Pass live values directly — submit() reads stale state otherwise
    await submit({
      guests: guestInput,
      totalPrice: guestTotal,
      tourDate: dateInput,
      pickupDetails: pickup,
    })
  }

  // ── Field styles ─────────────────────────────────────────────────────────
  const inputCls =
    "mt-1 h-11 w-full rounded-lg border border-tan/30 bg-white px-4 text-sm text-ocean-deep placeholder:text-ocean-deep/30 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean"
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-ocean-deep/50"

  return (
    <div className="space-y-8">

      {/* ── Section 1: Trip basics ─────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Tour Date</label>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Travelers</label>
          <input
            type="number"
            min={1}
            max={20}
            value={guestInput}
            onChange={(e) => setGuestInput(Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </section>

      {/* ── Section 2: Arrival method ──────────────────────────────────── */}
      <section>
        <p className={`${labelCls} mb-3`}>How are you arriving?</p>
        <div className="grid grid-cols-2 gap-3">
          <OptionCard
            icon={<Plane className="h-5 w-5" />}
            label="Flying In"
            sublabel="Arriving by air"
            selected={arrivalChoice === true}
            onClick={() => { setArrivalChoice(true); setAccomChoice(null) }}
          />
          <OptionCard
            icon={<Car className="h-5 w-5" />}
            label="Already Here"
            sublabel="Need pickup from room"
            selected={arrivalChoice === false}
            onClick={() => setArrivalChoice(false)}
          />
        </div>
      </section>

      {/* ── Section 3a: Flight details (if flying) ────────────────────── */}
      {arrivalChoice === true && (
        <section className="rounded-xl border border-tan/20 bg-white/30 p-5 space-y-4">
          <p className={labelCls}>Flight details — we&apos;ll arrange your airport transfer</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Country you&apos;re flying from</label>
              <input
                type="text"
                placeholder="e.g. United Kingdom"
                value={departureCountry}
                onChange={(e) => setDepartureCountry(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Departure airport</label>
              <input
                type="text"
                placeholder="e.g. Heathrow (LHR)"
                value={departureAirport}
                onChange={(e) => setDepartureAirport(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Arrival airport (destination)</label>
              <input
                type="text"
                placeholder="e.g. OR Tambo (JNB)"
                value={arrivalAirport}
                onChange={(e) => setArrivalAirport(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Flight number (optional)</label>
              <input
                type="text"
                placeholder="e.g. BA0057"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Arrival date</label>
              <input
                type="date"
                value={flightArrivalDate}
                onChange={(e) => setFlightArrivalDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Arrival time (local)</label>
              <input
                type="time"
                value={flightArrivalTime}
                onChange={(e) => setFlightArrivalTime(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3b: Already here — room type ─────────────── */}
      {arrivalChoice === false && (
        <section>
          <p className={`${labelCls} mb-3`}>Where are you staying?</p>
          <div className="grid grid-cols-2 gap-3">
            <OptionCard
              icon={<Building2 className="h-5 w-5" />}
              label="Hotel / Resort"
              sublabel="We'll arrange a pickup from the property"
              selected={accomChoice === "resort"}
              onClick={() => setAccomChoice("resort")}
            />
            <OptionCard
              icon={<Home className="h-5 w-5" />}
              label="Private Rental / Airbnb"
              sublabel="We'll come directly to you"
              selected={accomChoice === "airbnb"}
              onClick={() => setAccomChoice("airbnb")}
            />
          </div>
        </section>
      )}

      {/* ── Section 3b-i: Resort pickup details ───────────────────────── */}
      {arrivalChoice === false && accomChoice === "resort" && (
        <section className="rounded-xl border border-tan/20 bg-white/30 p-5 space-y-4">
          <p className={labelCls}>Hotel / Resort pickup details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Hotel / Resort name</label>
              <input
                type="text"
                placeholder="e.g. Singita Grumeti"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Hotel address</label>
              <input
                type="text"
                placeholder="Street, City, Country"
                value={hotelAddress}
                onChange={(e) => setHotelAddress(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Room / Suite number</label>
              <input
                type="text"
                placeholder="e.g. 204 or Suite 4A"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3b-ii: Airbnb pickup details ──────────────────────── */}
      {arrivalChoice === false && accomChoice === "airbnb" && (
        <section className="rounded-xl border border-tan/20 bg-white/30 p-5 space-y-4">
          <p className={labelCls}>Rental address — we&apos;ll pick you up here</p>
          <div>
            <label className={labelCls}>Full address</label>
            <input
              type="text"
              placeholder="Street number, Street, City, Country"
              value={rentalAddress}
              onChange={(e) => setRentalAddress(e.target.value)}
              className={inputCls}
            />
          </div>
        </section>
      )}

      {/* ── Section 4: Price summary + CTA ────────────────────────────── */}
      <PriceSummary
        tourTitle={tourTitle}
        guests={guestInput}
        pricePerPerson={startingPrice}
        currency={currency}
      />

      <div className="flex items-center gap-3">
        <Button onClick={handleConfirm} disabled={!allValid}>
          Confirm Booking
        </Button>
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  )
}

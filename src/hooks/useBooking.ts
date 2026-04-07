"use client"

import { useReducer, useCallback } from "react"
import { initiateBooking, type BookingResult } from "@/lib/wix/booking-fetch"
import { getIdToken } from "@/lib/firebase/auth"
import { useTenant } from "@/hooks/useTenant"
import type { PickupDetails } from "@/types/booking"

type Step =
  | "dates"
  | "guests"
  | "arrival"
  | "room"
  | "review"
  | "processing"
  | "confirmed"
  | "hold"
  | "error"

interface BookingState {
  step: Step
  tourSlug: string
  tourId: string
  tourDate: string
  guests: number
  totalPrice: number
  currency: string
  bookingId: string | null
  isCheckoutEnabled: boolean
  dataSource: "STORES" | "CMS" | null
  error: string | null
  arrivingByAir: boolean | null
  roomType: "resort" | "airbnb" | null
  pickupDetails: PickupDetails | null
}

type Action =
  | { type: "SET_DATES"; tourDate: string }
  | { type: "SET_GUESTS"; guests: number; totalPrice: number }
  | { type: "SET_ARRIVAL"; arrivingByAir: boolean }
  | { type: "SET_ROOM"; roomType: "resort" | "airbnb" }
  | { type: "SET_PICKUP"; pickupDetails: PickupDetails }
  | { type: "SUBMIT" }
  | { type: "SUCCESS"; result: BookingResult }
  | { type: "ERROR"; error: string }
  | { type: "RESET" }

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "SET_DATES":
      return { ...state, tourDate: action.tourDate, step: "guests" }
    case "SET_GUESTS":
      return {
        ...state,
        guests: action.guests,
        totalPrice: action.totalPrice,
        step: "arrival",
      }
    case "SET_ARRIVAL":
      return { ...state, arrivingByAir: action.arrivingByAir, step: "room" }
    case "SET_ROOM":
      return { ...state, roomType: action.roomType, step: "review" }
    case "SET_PICKUP":
      return { ...state, pickupDetails: action.pickupDetails }
    case "SUBMIT":
      return { ...state, step: "processing", error: null }
    case "SUCCESS":
      return {
        ...state,
        step: action.result.isCheckoutEnabled ? "confirmed" : "hold",
        bookingId: action.result.id,
        isCheckoutEnabled: action.result.isCheckoutEnabled,
        dataSource: action.result.dataSource,
      }
    case "ERROR":
      return { ...state, step: "error", error: action.error }
    case "RESET":
      return { ...initialState(state.tourSlug, state.tourId, state.currency) }
    default:
      return state
  }
}

function initialState(tourSlug: string, tourId: string, currency: string): BookingState {
  return {
    step: "dates",
    tourSlug,
    tourId,
    tourDate: "",
    guests: 1,
    totalPrice: 0,
    currency,
    bookingId: null,
    isCheckoutEnabled: false,
    dataSource: null,
    error: null,
    arrivingByAir: null,
    roomType: null,
    pickupDetails: null,
  }
}

export function useBooking(tourSlug: string, tourId: string, currency = "USD") {
  const [state, dispatch] = useReducer(reducer, initialState(tourSlug, tourId, currency))
  const { wixSiteId } = useTenant()

  const setDates = useCallback((tourDate: string) => {
    dispatch({ type: "SET_DATES", tourDate })
  }, [])

  const setGuests = useCallback((guests: number, totalPrice: number) => {
    dispatch({ type: "SET_GUESTS", guests, totalPrice })
  }, [])

  const setArrival = useCallback((arrivingByAir: boolean) => {
    dispatch({ type: "SET_ARRIVAL", arrivingByAir })
  }, [])

  const setRoom = useCallback((roomType: "resort" | "airbnb") => {
    dispatch({ type: "SET_ROOM", roomType })
  }, [])

  const setPickup = useCallback((pickupDetails: PickupDetails) => {
    dispatch({ type: "SET_PICKUP", pickupDetails })
  }, [])

  // Overrides let callers pass freshly-computed values without waiting for
  // the reducer re-render — avoids stale-closure bugs when submit() is called
  // in the same event handler as the setter dispatches.
  const submit = useCallback(async (overrides?: {
    guests?: number
    totalPrice?: number
    tourDate?: string
    pickupDetails?: PickupDetails | null
  }) => {
    dispatch({ type: "SUBMIT" })

    try {
      const token = await getIdToken()
      if (!token) {
        dispatch({ type: "ERROR", error: "Please sign in to book." })
        return
      }

      const guests = overrides?.guests ?? state.guests
      const totalPrice = overrides?.totalPrice ?? state.totalPrice
      const tourDate = overrides?.tourDate ?? state.tourDate
      const pickupDetails = overrides?.pickupDetails ?? state.pickupDetails

      const result = await initiateBooking(
        token,
        state.tourId,
        totalPrice,
        tourDate ?? undefined,
        guests,
        pickupDetails ?? undefined,
        wixSiteId ?? undefined,
      )

      dispatch({ type: "SUCCESS", result })
    } catch (err) {
      dispatch({
        type: "ERROR",
        error: err instanceof Error ? err.message : "Booking failed",
      })
    }
  }, [state.tourId, state.totalPrice, state.tourDate, state.guests, state.pickupDetails])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  return { state, setDates, setGuests, setArrival, setRoom, setPickup, submit, reset }
}

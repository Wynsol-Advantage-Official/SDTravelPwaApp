"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { useTenant } from "@/hooks/useTenant"
import { subscribeToUserBookings } from "@/lib/services/bookings.service"
import { mockBookings } from "@/mocks"
import type { Booking } from "@/types/booking"

export function useUserBookings(maxResults?: number) {
  const { user, role } = useAuth()
  const { isMockMode } = useMockMode()
  const { tenantId } = useTenant()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockMode) {
      setBookings(mockBookings)
      setLoading(false)
      return
    }

    if (!user) {
      setBookings([])
      setLoading(false)
      return
    }

    // super_admin on www sees bookings from ALL tenants (tenantId = null)
    // Everyone else is scoped to the current subdomain's tenantId
    const scopedTenantId =
      role === "super_admin" && tenantId === "www" ? null : tenantId

    const unsub = subscribeToUserBookings(
      user.uid,
      scopedTenantId,
      (items) => {
        setBookings(items)
        setLoading(false)
      },
      () => setLoading(false),
      maxResults,
    )

    return unsub
  }, [user, role, tenantId, isMockMode, maxResults])

  return { bookings, loading }
}

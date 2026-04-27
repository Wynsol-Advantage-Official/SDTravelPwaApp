"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { subscribeToUserActivity } from "@/lib/services/activity.service"
import { mockActivity } from "@/mocks"
import type { ActivityItem } from "@/types/activity"

/**
 * Subscribe to the current user's activity feed.
 *
 * - In mock mode: returns `mockActivity` immediately.
 * - In live mode: opens a Firestore real-time listener on
 *   `users/{uid}/activity`, scoped to the current tenant.
 */
export function useActivity(maxResults = 20) {
  const { user } = useAuth()
  const { isMockMode } = useMockMode()

  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockMode) {
      setActivity(mockActivity)
      setLoading(false)
      return
    }

    if (!user) {
      setActivity([])
      setLoading(false)
      return
    }

    const unsub = subscribeToUserActivity(
      user.uid,
      (items) => {
        setActivity(items)
        setLoading(false)
      },
      () => setLoading(false),
      maxResults,
    )

    return unsub
  }, [user, isMockMode, maxResults])

  return { activity, loading }
}

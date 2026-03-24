"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import type { SavedDiamond } from "@/types/user"

export function useSavedDiamonds(uid: string | null) {
  const [saved, setSaved] = useState<SavedDiamond[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setSaved([])
      setLoading(false)
      return
    }

    const ref = collection(db, "users", uid, "savedDiamonds")
    const unsub = onSnapshot(ref, (snap) => {
      const items: SavedDiamond[] = snap.docs.map((d) => ({
        ...(d.data() as SavedDiamond),
        tourSlug: d.id,
      }))
      setSaved(items)
      setLoading(false)
    })

    return unsub
  }, [uid])

  const addDiamond = useCallback(
    async (diamond: Omit<SavedDiamond, "savedAt">) => {
      if (!uid) return
      const ref = doc(db, "users", uid, "savedDiamonds", diamond.tourSlug)
      await setDoc(ref, {
        ...diamond,
        savedAt: serverTimestamp(),
      })
    },
    [uid],
  )

  const removeDiamond = useCallback(
    async (tourSlug: string) => {
      if (!uid) return
      const ref = doc(db, "users", uid, "savedDiamonds", tourSlug)
      await deleteDoc(ref)
    },
    [uid],
  )

  const isSaved = useCallback(
    (tourSlug: string) => saved.some((s) => s.tourSlug === tourSlug),
    [saved],
  )

  return { saved, loading, addDiamond, removeDiamond, isSaved }
}

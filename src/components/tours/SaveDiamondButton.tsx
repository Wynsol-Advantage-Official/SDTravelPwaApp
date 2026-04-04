"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import DiamondIcon from "@/components/icons/DiamondIcon"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { useSavedDiamonds } from "@/hooks/useSavedDiamonds"
import SaveConfirmModal from "./SaveConfirmModal"

// ---------------------------------------------------------------------------
// SaveDiamondButton
// ---------------------------------------------------------------------------
// Self-contained heart toggle that reads/writes the user's savedDiamonds
// subcollection in Firestore. If the user is not signed in the click
// redirects to sign-in with a redirect param back to the current page.
// ---------------------------------------------------------------------------

interface SaveDiamondButtonProps {
  tourId: string
  tourSlug: string
  tourTitle: string
  heroImageSrc: string
  /** Visual size variant */
  size?: "sm" | "md"
  /** Extra class names on the outer button */
  className?: string
}

export function SaveDiamondButton({
  tourId,
  tourSlug,
  tourTitle,
  heroImageSrc,
  size = "md",
  className = "",
}: SaveDiamondButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { isSaved, addDiamond, removeDiamond } = useSavedDiamonds(user?.uid ?? null)

  const saved = isSaved(tourSlug)

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      // Prevent click from propagating to parent <Link>
      e.preventDefault()
      e.stopPropagation()

      if (!user) {
        const redirect = typeof window !== "undefined" ? window.location.pathname : `/tours/${tourSlug}`
        router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirect)}`)
        return
      }

      if (saved) {
        // open modal instead of immediate confirm
        setConfirmOpen(true)
      } else {
        await addDiamond({ tourId, tourSlug, tourTitle, heroImageSrc })
      }
    },
    [user, saved, router, tourId, tourSlug, tourTitle, heroImageSrc, addDiamond, removeDiamond],
  )

  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirm = useCallback(async () => {
    setConfirmOpen(false)
    await removeDiamond(tourSlug)
  }, [removeDiamond, tourSlug])

  const handleCancel = useCallback(() => {
    setConfirmOpen(false)
  }, [])

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10"
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"

  return (
    <>
      <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Remove from saved" : "Save tour"}
      aria-pressed={saved}
      className={[
        "flex items-center justify-center rounded-full border transition-all",
        dim,
        saved
          ? "border-luxgold/40 bg-white/90 dark:border-luxgold/40 dark:bg-ocean-card/90"
          : "border-white/20 bg-white/20 backdrop-blur-md hover:bg-white/40 dark:border-white/15 dark:hover:bg-white/10",
        className,
      ].join(" ")}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={saved ? "filled" : "outline"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center justify-center"
        >
          <DiamondIcon
            className={[iconSize, "transition-colors", saved ? "text-luxgold" : "text-white"].join(" ")}
            filled={saved}
          />
        </motion.span>
      </AnimatePresence>
    </button>
      <SaveConfirmModal
        open={confirmOpen}
        title={`Remove "${tourTitle}"?`}
        description={`Remove "${tourTitle}" from your saved Diamonds? You can always save it again later.`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  )
}

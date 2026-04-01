"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"

/**
 * Standard authenticated page template.
 *
 * Usage:
 * 1. Copy this file to your new page directory
 * 2. Rename the function and content component
 * 3. Replace the hook + JSX in the content component
 */
export default function TemplatePage() {
  return (
    <AuthGuard>
      <TemplateContent />
    </AuthGuard>
  )
}

function TemplateContent() {
  // Replace with your hook:
  // const { data, loading } = useYourHook()

  return (
    <div className="space-y-8">
      <h1 className="font-sans text-2xl font-bold text-ocean-deep">
        Page Title
      </h1>

      {/* Loading state */}
      {/* {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
          <p className="text-ocean-deep/50">Loading…</p>
        </div>
      ) : ( */}
        <div>
          <p className="text-ocean-deep/60">Your content here.</p>
        </div>
      {/* )} */}
    </div>
  )
}

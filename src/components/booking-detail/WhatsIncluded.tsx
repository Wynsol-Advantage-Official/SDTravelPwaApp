"use client"

interface WhatsIncludedProps {
  included: string
  excluded: string
}

interface ListItem {
  text: string
  note?: string
}

function parseItems(raw: string): ListItem[] {
  if (!raw) return []
  // Split on pipe, newline, or bullet
  return raw
    .split(/[|\n•]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => {
      // Detect parenthetical notes like "Lunch (Available to purchase)"
      const match = text.match(/^(.+?)\s*\((.+)\)$/)
      if (match) return { text: match[1].trim(), note: match[2].trim() }
      return { text }
    })
}

export function WhatsIncluded({ included, excluded }: WhatsIncludedProps) {
  const includedItems = parseItems(included)
  const excludedItems = parseItems(excluded)

  if (includedItems.length === 0 && excludedItems.length === 0) return null

  return (
    <section>
      <h2 className="font-sans text-2xl font-bold text-ocean-deep">
        What&apos;s Included
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Included */}
        {includedItems.length > 0 && (
          <div className="space-y-3">
            {includedItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-ocean-deep">{item.text}</p>
                  {item.note && (
                    <p className="text-xs text-ocean-deep/50">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Excluded */}
        {excludedItems.length > 0 && (
          <div className="space-y-3">
            {excludedItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean/5">
                  <svg className="h-3.5 w-3.5 text-ocean-deep/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-ocean-deep">{item.text}</p>
                  {item.note && (
                    <p className="text-xs text-ocean-deep/50">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

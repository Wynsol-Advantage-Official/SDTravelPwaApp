"use client"

import type { ChatMessage } from "@/types/chat"

interface ChatBubbleProps {
  message: ChatMessage
  isOwn: boolean
  /** Hide the timestamp for grouped messages */
  hideTime?: boolean
}

export function ChatBubble({ message, isOwn, hideTime }: ChatBubbleProps) {
  const ts = message.timestamp
  const d =
    ts && typeof ts === "object" && "toDate" in ts
      ? (ts as unknown as { toDate(): Date }).toDate()
      : ts instanceof Date
        ? ts
        : new Date(ts)
  const timeStr = isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "relative max-w-[80%] px-3.5 py-2 text-sm leading-relaxed",
          isOwn
            ? "rounded-2xl rounded-br-sm bg-ocean text-ocean-deep"
            : "rounded-2xl rounded-bl-sm bg-ocean/5 text-ocean-deep",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
        {!hideTime && timeStr && (
          <div className={`mt-0.5 flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <span className={`text-[10px] leading-none ${isOwn ? "text-ocean-deep/40" : "text-ocean-deep/30"}`}>
              {timeStr}
            </span>
            {isOwn && (
              <svg
                className={`h-3 w-3 ${message.read ? "text-ocean-deep/50" : "text-ocean-deep/25"}`}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {message.read ? (
                  <>
                    <path d="M1.5 8.5l3 3 7-7" />
                    <path d="M4.5 8.5l3 3 7-7" />
                  </>
                ) : (
                  <path d="M2 8.5l4 4 8-8" />
                )}
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

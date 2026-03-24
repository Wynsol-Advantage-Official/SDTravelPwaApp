"use client"

import type { ChatMessage } from "@/types/chat"

interface ChatBubbleProps {
  message: ChatMessage
  isOwn: boolean
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed",
          isOwn
            ? "rounded-br-none bg-gold text-charcoal"
            : "rounded-bl-none bg-charcoal/5 text-charcoal",
        ].join(" ")}
      >
        <p>{message.text}</p>
        <p
          className={`mt-1 text-[10px] ${isOwn ? "text-charcoal/50" : "text-charcoal/40"}`}
        >
          {(() => {
            const ts = message.timestamp
            const d =
              ts && typeof ts === "object" && "toDate" in ts
                ? (ts as unknown as { toDate(): Date }).toDate()
                : ts instanceof Date
                  ? ts
                  : new Date(ts)
            return isNaN(d.getTime())
              ? ""
              : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          })()}
        </p>
      </div>
    </div>
  )
}

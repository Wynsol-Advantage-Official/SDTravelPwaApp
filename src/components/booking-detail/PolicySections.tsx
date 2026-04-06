"use client"

import { useState } from "react"

interface PolicyItem {
  id: string
  title: string
  icon: string
  content: string[]
}

const POLICIES: PolicyItem[] = [
  {
    id: "cancellation",
    title: "Cancellation Policy",
    icon: "🔄",
    content: [
      "Free cancellation up to 30 days before the tour start date for a full refund.",
      "Cancellations 15–29 days before departure: 50% refund of the total booking amount.",
      "Cancellations 7–14 days before departure: 25% refund.",
      "No refunds for cancellations within 7 days of departure.",
      "In the event of force majeure (natural disasters, political unrest, pandemics), Sand Diamonds Travel will offer full rebooking or credit for a future trip.",
      "All cancellation requests must be submitted in writing via email or through your dashboard.",
    ],
  },
  {
    id: "refund",
    title: "Refund Policy",
    icon: "💳",
    content: [
      "Approved refunds are processed within 7–10 business days to the original payment method.",
      "Partial refunds are calculated based on the cancellation timeline above.",
      "Non-refundable items include travel insurance premiums, visa processing fees, and third-party service fees already incurred.",
      "If Sand Diamonds Travel cancels a tour, guests will receive a full refund or equivalent rebooking credit.",
      "Refund requests due to dissatisfaction with the experience will be reviewed on a case-by-case basis.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    icon: "🔒",
    content: [
      "Your personal information (name, email, phone, passport details) is collected solely for booking and travel arrangement purposes.",
      "We do not sell or share your data with third parties except where required to fulfil your booking (hotels, airlines, local operators).",
      "Payment information is processed securely via PCI-DSS compliant payment gateways. We do not store credit card details.",
      "Chat messages and concierge communications are stored securely in encrypted databases and accessible only to you and your assigned travel advisor.",
      "You may request deletion of your personal data at any time by contacting us at privacy@sanddiamonds.travel.",
    ],
  },
  {
    id: "advisory",
    title: "Travel Advisory",
    icon: "⚠️",
    content: [
      "It is the traveller's responsibility to ensure they have valid passports, visas, and travel documentation for all destinations on their itinerary.",
      "We strongly recommend purchasing comprehensive travel insurance covering medical emergencies, trip cancellation, and lost baggage.",
      "Check your country's travel advisory website for up-to-date safety information about your destination before departure.",
      "Certain activities (e.g., safaris, diving, hiking) carry inherent risks. Please disclose any medical conditions during the booking process.",
      "Sand Diamonds Travel is not liable for losses caused by airline delays, border closures, or third-party service disruptions beyond our control.",
      "Travellers should consult their doctor regarding required vaccinations and malaria prophylaxis for their destination.",
    ],
  },
]

export function PolicySections() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section>
      <h2 className="font-sans text-2xl font-bold text-ocean-deep">
        Policies &amp; Information
      </h2>

      <div className="mt-4 divide-y divide-ocean-deep/8 rounded-xl border border-ocean-deep/10 bg-white">
        {POLICIES.map((policy) => {
          const isOpen = openId === policy.id
          return (
            <div key={policy.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : policy.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-ocean-deep/2"
                aria-expanded={isOpen}
              >
                <span className="text-xl">{policy.icon}</span>
                <span className="flex-1 text-sm font-semibold text-ocean-deep">
                  {policy.title}
                </span>
                <svg
                  className={`h-5 w-5 shrink-0 text-ocean-deep/30 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0">
                  <ul className="space-y-2.5">
                    {policy.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ocean-deep/70">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

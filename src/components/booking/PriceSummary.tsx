"use client"

import { formatPrice } from "@/lib/utils/format"

interface PriceSummaryProps {
  tourTitle: string
  guests: number
  pricePerPerson: number
  currency: string
}

export function PriceSummary({
  tourTitle,
  guests,
  pricePerPerson,
  currency,
}: PriceSummaryProps) {
  const total = guests * pricePerPerson

  return (
    <div className="rounded-sm border border-sand/30 bg-diamond p-5">
      <h3 className="font-serif text-lg font-semibold text-charcoal">
        Price Summary
      </h3>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-charcoal/60">Tour</dt>
          <dd className="font-medium text-charcoal">{tourTitle}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-charcoal/60">Guests</dt>
          <dd className="font-medium text-charcoal">{guests}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-charcoal/60">Price per person</dt>
          <dd className="font-medium text-charcoal">
            {formatPrice(pricePerPerson, currency)}
          </dd>
        </div>

        <div className="border-t border-sand/20 pt-2">
          <div className="flex justify-between">
            <dt className="font-semibold text-charcoal">Total</dt>
            <dd className="font-serif text-xl font-bold text-gold">
              {formatPrice(total, currency)}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  )
}

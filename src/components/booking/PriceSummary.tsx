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
    <div className="rounded-sm border border-tan/30 bg-white p-5">
      <h3 className="font-sans text-lg font-semibold text-ocean-deep">
        Price Summary
      </h3>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ocean-deep/60">Tour</dt>
          <dd className="font-medium text-ocean-deep">{tourTitle}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ocean-deep/60">Guests</dt>
          <dd className="font-medium text-ocean-deep">{guests}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ocean-deep/60">Price per person</dt>
          <dd className="font-medium text-ocean-deep">
            {formatPrice(pricePerPerson, currency)}
          </dd>
        </div>

        <div className="border-t border-tan/20 pt-2">
          <div className="flex justify-between">
            <dt className="font-semibold text-ocean-deep">Total</dt>
            <dd className="font-sans text-xl font-bold text-ocean">
              {formatPrice(total, currency)}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  )
}

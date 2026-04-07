import type { Metadata } from "next";
import { Car } from "lucide-react";
import { TaxiBookingForm } from "@/components/rooms";

export const metadata: Metadata = {
  title: "Book a Transfer | Sand Diamonds Travel",
  description:
    "Book airport transfers, private cars, executive vehicles, and group transport with Sand Diamonds Travel.",
};

export default function TaxiPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean/10 dark:bg-blue-chill/15">
            <Car className="h-5 w-5 text-ocean dark:text-blue-chill" />
          </div>
          <h1 className="font-sans text-3xl font-bold text-ocean-deep dark:text-white">
            Book a Transfer
          </h1>
        </div>
        <p className="max-w-2xl text-ocean-deep/65 dark:text-white/55">
          Travel in style — select your transfer type and let our concierge handle the rest.
        </p>
      </div>

      <TaxiBookingForm />
    </main>
  );
}

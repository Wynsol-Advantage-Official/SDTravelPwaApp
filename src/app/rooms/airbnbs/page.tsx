import type { Metadata } from "next";
import { Building, Search } from "lucide-react";
import { getRoomsByType } from "@/lib/services/tours.service";
import { RoomCard } from "@/components/rooms";

// force-dynamic: tenant-specific Wix data is resolved via request headers (x-wix-site-id)
// injected by Edge Middleware. ISR background revalidation runs without a request context,
// causing headers() to return undefined and falling back to the www Wix client.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Airbnbs | Sand Diamonds Travel",
  description: "Browse handpicked Airbnb properties offering comfort, charm, and local character.",
};

export default async function AirbnbsPage() {
  const rooms = await getRoomsByType("airbnb");

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean/10 dark:bg-blue-chill/15">
            <Building className="h-5 w-5 text-ocean dark:text-blue-chill" />
          </div>
          <h1 className="font-sans text-3xl font-bold text-ocean-deep dark:text-white">
            Airbnbs
          </h1>
        </div>
        <p className="max-w-2xl text-ocean-deep/65 dark:text-white/55">
          Browse handpicked Airbnb properties offering comfort, charm, and local character.
        </p>
      </div>

      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((acc) => (
            <RoomCard key={acc._id} room={acc} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="mb-4 h-12 w-12 text-ocean-deep/25 dark:text-white/20" />
          <h2 className="mb-2 text-xl font-semibold text-ocean-deep dark:text-white">
            No Airbnbs found
          </h2>
          <p className="text-sm text-ocean-deep/50 dark:text-white/40">
            Check back soon — we&apos;re adding new properties regularly.
          </p>
        </div>
      )}
    </main>
  );
}

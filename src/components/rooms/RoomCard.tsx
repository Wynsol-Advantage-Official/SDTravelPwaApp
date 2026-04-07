import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { Room } from "@/types/tour";

interface RoomCardProps {
  room: Room;
}

const DEFAULT_IMG = "/og/default.jpg";

export function RoomCard({ room }: RoomCardProps) {
  const hero =
    room.image?.src && room.image.src !== DEFAULT_IMG
      ? room.image
      : room.gallery?.[0] ?? null;

  return (
    <Link
      href={`/rooms/${room._id}`}
      className="group block overflow-hidden rounded-2xl border border-khaki/30 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 dark:border-luxborder dark:bg-ocean-card"
    >
      {/* Image */}
      <div className="relative h-52 w-full bg-tan/10">
        {hero ? (
          <Image
            src={hero.src}
            alt={hero.alt || room.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ocean-deep/40 dark:text-white/30">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 truncate text-lg font-semibold text-ocean-deep dark:text-white">
          {room.name}
        </h3>

        {room.location && (
          <p className="mb-2 flex items-center gap-1 text-sm text-ocean-deep/60 dark:text-white/50">
            <MapPin className="h-3.5 w-3.5" />
            {room.location}
          </p>
        )}

        <div className="flex items-center justify-between">
          {room.rating > 0 && (
            <span className="flex items-center gap-1 text-sm font-medium text-ocean dark:text-blue-chill">
              <Star className="h-3.5 w-3.5 fill-current" />
              {room.rating.toFixed(1)}
            </span>
          )}

          {room.pricePerNight > 0 && (
            <span className="text-sm font-semibold text-ocean-deep dark:text-luxgold">
              {room.currency} {room.pricePerNight}
              <span className="font-normal text-ocean-deep/50 dark:text-white/40">
                /night
              </span>
            </span>
          )}
        </div>

        {room.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="rounded-full bg-tan/40 px-2 py-0.5 text-xs text-ocean-deep/70 dark:bg-ocean-card2 dark:text-white/60"
              >
                {a}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-xs text-ocean-deep/50 dark:text-white/40">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

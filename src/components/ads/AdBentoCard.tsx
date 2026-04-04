import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatAdTitle } from "@/lib/rules/ads-rules";
import type { Ad } from "@/types/ad";

interface AdBentoCardProps {
  ad: Ad;
  /** Makes the card taller and uses a larger title — for the "featured" slot */
  featured?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function AdCardInner({ ad, featured }: { ad: Ad; featured: boolean }) {
  const displayTitle = formatAdTitle(ad.title);
  const titleSize = featured ? "text-[22px]" : "text-[18px]";
  // Show up to 4 gallery thumbnails (first image is the cover, skip if same)
  const thumbnails = ad.mediaGallery.slice(0, 4);

  return (
    <>
      {/* Background cover image */}
      <Image
        src={ad.cover.src}
        alt={ad.cover.alt || displayTitle}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient scrim */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/30 to-transparent"
        aria-hidden="true"
      />

      {/* Sponsored badge */}
      <span className="absolute right-3 top-3 z-10 rounded-[8px] border border-blue-chill/30 bg-ocean-deep/70 px-2.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-chill-300 backdrop-blur-sm">
        Sponsored
      </span>

      {/* Content overlay */}
      <div className="relative z-10 p-[18px]">
        {/* Gallery thumbnail strip */}
        {thumbnails.length > 1 && (
          <div className="mb-2.5 flex gap-1.5" aria-hidden="true">
            {thumbnails.map((img, i) => (
              <div
                key={i}
                className="relative h-8 w-8 overflow-hidden rounded-[4px] border border-white/20"
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            ))}
            {ad.mediaGallery.length > 4 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-white/20 bg-ocean-deep/60 backdrop-blur-sm">
                <span className="font-sans text-[9px] font-semibold text-white/70">
                  +{ad.mediaGallery.length - 4}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className={`font-sans font-bold text-white ${titleSize}`}>
          {displayTitle}
        </h3>

        {/* CTA */}
        <span className="mt-2 inline-flex items-center gap-1 font-sans text-[12px] font-semibold text-blue-chill-300 transition-colors group-hover:text-blue-chill">
          View Offer <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </>
  );
}

const BASE_CLASSES = [
  "group relative flex flex-col justify-end overflow-hidden",
  "rounded-[14px] border border-khaki/30 bg-white dark:border-white/10 dark:bg-ocean-card",
  "transition-[transform,border-color] duration-[220ms] ease-out",
  "hover:-translate-y-[2px] hover:border-ocean/40 dark:hover:border-blue-chill/30",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ocean-deep",
];

export function AdBentoCard({
  ad,
  featured = false,
  className = "",
  style,
}: AdBentoCardProps) {
  const minHeight = featured ? "min-h-[300px]" : "min-h-[220px]";
  const classes = [...BASE_CLASSES, minHeight, className]
    .filter(Boolean)
    .join(" ");

  if (ad.href) {
    return (
      <Link href={ad.href} className={classes} style={style}>
        <AdCardInner ad={ad} featured={featured} />
      </Link>
    );
  }

  return (
    <div className={classes} style={style}>
      <AdCardInner ad={ad} featured={featured} />
    </div>
  );
}

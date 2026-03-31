"use client";

import { useMemo, useState } from "react";
import type { PartnerLogoItem } from "@/types/homepage";

interface PartnerLogosSectionProps {
  items: PartnerLogoItem[];
}

function LogoShell({ logo }: { logo: PartnerLogoItem }) {
  const [imageMissing, setImageMissing] = useState(!logo.logoSrc);

  return (
    <div className="flex h-20 items-center justify-center rounded-sm border border-diamond/15 bg-charcoal/60 px-4">
      {imageMissing ? (
        <span className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-diamond/80">
          {logo.name}
        </span>
      ) : (
        <img
          src={logo.logoSrc ?? ""}
          alt={logo.alt}
          loading="lazy"
          onError={() => setImageMissing(true)}
          className="max-h-10 w-full object-contain opacity-85 transition-opacity duration-300 hover:opacity-100"
        />
      )}
    </div>
  );
}

export function PartnerLogosSection({ items }: PartnerLogosSectionProps) {
  const validItems = useMemo(() => items.filter((item) => item.name.trim().length > 0), [items]);

  return (
    <section className="bg-charcoal py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-gold">
            Trusted by Global Partners
          </p>
          <h2 className="font-serif text-3xl font-bold text-diamond sm:text-4xl">
            Preferred Collaborators
          </h2>
        </div>

        {validItems.length === 0 ? (
          <p className="text-center text-sm text-diamond/75">
            Partner lineup is being refreshed.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {validItems.map((logo) => (
              <LogoShell key={logo.id} logo={logo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

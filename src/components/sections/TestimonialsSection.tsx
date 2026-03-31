import type { CSSProperties } from "react";
import type { TestimonialItem } from "@/types/homepage";

interface TestimonialsSectionProps {
  items: TestimonialItem[];
}

function clampQuote(quote: string): CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: 7,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "1.7",
  };
}

export function TestimonialsSection({ items }: TestimonialsSectionProps) {
  return (
    <section className="bg-diamond py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-gold">
            Client Stories
          </p>
          <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
            Journeys Worth Talking About
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/65 sm:text-base">
            Guests who travel with us expect precision, elegance, and moments
            that feel deeply personal from departure to return.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-sm border border-charcoal/15 bg-white px-6 py-10 text-center text-charcoal/70">
            Client stories are being refreshed.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-sm bg-white p-6 shadow-sm"
              >
                <p
                  className="font-serif text-base text-charcoal sm:text-lg"
                  style={clampQuote(item.quote)}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>

                <div className="mt-6 border-t border-charcoal/10 pt-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-charcoal">
                    {item.name}
                  </p>
                  {item.role ? (
                    <p className="mt-2 text-sm text-charcoal/70">{item.role}</p>
                  ) : null}
                  {item.location ? (
                    <p className="mt-1 text-sm text-charcoal/55">{item.location}</p>
                  ) : null}
                  {item.tripType ? (
                    <p className="mt-3 inline-flex rounded-sm bg-charcoal/5 px-2 py-1 text-xs uppercase tracking-[0.12em] text-charcoal/70">
                      {item.tripType}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

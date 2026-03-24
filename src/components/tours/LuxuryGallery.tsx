"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { WixImage } from "@/types/tour";

// ---------------------------------------------------------------------------
// LuxuryGallery — optimized grid with lightbox
// ---------------------------------------------------------------------------
// Grid layout: first image spans 2 cols on md+, rest in a masonry-style grid.
// Uses Next.js <Image> with explicit sizes for optimal LCP.
// Lightbox uses AnimatePresence for smooth open/close transitions.
// ---------------------------------------------------------------------------

interface LuxuryGalleryProps {
  images: WixImage[];
  tourTitle: string;
}

export function LuxuryGallery({ images, tourTitle }: LuxuryGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % images.length : null
    );
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : null
    );
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <>
      {/* ── Gallery Grid ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center font-serif text-3xl font-bold text-charcoal sm:text-4xl">
          Gallery
        </h2>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
          {images.map((image, index) => {
            // First image spans 2 columns for visual hierarchy
            const isHero = index === 0;

            return (
              <button
                key={`gallery-${index}`}
                type="button"
                onClick={() => openLightbox(index)}
                className={`group relative overflow-hidden rounded-sm focus-visible:ring-2 focus-visible:ring-gold ${
                  isHero ? "col-span-2 row-span-2" : ""
                }`}
                aria-label={`View ${image.alt || `${tourTitle} photo ${index + 1}`}`}
              >
                <div className={`relative ${isHero ? "aspect-[16/10]" : "aspect-square"}`}>
                  <Image
                    src={image.src}
                    alt={image.alt || `${tourTitle} — Photo ${index + 1}`}
                    fill
                    sizes={
                      isHero
                        ? "(max-width: 768px) 100vw, 66vw"
                        : "(max-width: 768px) 50vw, 33vw"
                    }
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    // Priority on first image for LCP
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/20" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 p-4"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-diamond/10 text-diamond backdrop-blur-sm transition-colors hover:bg-diamond/20"
              aria-label="Close lightbox"
            >
              ✕
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-diamond/10 text-xl text-diamond backdrop-blur-sm transition-colors hover:bg-diamond/20"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-diamond/10 text-xl text-diamond backdrop-blur-sm transition-colors hover:bg-diamond/20"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex].src}
                alt={
                  images[lightboxIndex].alt ||
                  `${tourTitle} — Photo ${lightboxIndex + 1}`
                }
                width={images[lightboxIndex].width || 1200}
                height={images[lightboxIndex].height || 800}
                className="max-h-[85vh] w-auto rounded-sm object-contain"
                sizes="90vw"
              />

              {/* Counter */}
              <p className="mt-3 text-center text-sm text-diamond/60">
                {lightboxIndex + 1} / {images.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

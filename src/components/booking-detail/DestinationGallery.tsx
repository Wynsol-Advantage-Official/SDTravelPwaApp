"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { WixImage } from "@/types/tour"

interface DestinationGalleryProps {
  images: WixImage[]
  title: string
}

export function DestinationGallery({ images, title }: DestinationGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <section>
      <h2 className="font-sans text-2xl font-bold text-ocean-deep">Gallery</h2>
      <p className="mt-1 text-sm text-ocean-deep/50">Images from {title}</p>

      {/* Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            onClick={() => setSelectedIndex(i)}
            className="group relative aspect-4/3 overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            <Image
              src={img.src}
              alt={img.alt || `${title} photo ${i + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-ocean-deep/0 transition-colors group-hover:bg-ocean-deep/20" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-deep/90 backdrop-blur-sm"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt || title}
                width={images[selectedIndex].width || 1200}
                height={images[selectedIndex].height || 800}
                className="max-h-[85vh] rounded-lg object-contain"
                sizes="90vw"
              />

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex((selectedIndex - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                    aria-label="Previous image"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex((selectedIndex + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                    aria-label="Next image"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
              )}

              {/* Close */}
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-2 right-0 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Counter */}
              <p className="mt-3 text-center text-sm text-white/60">
                {selectedIndex + 1} / {images.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

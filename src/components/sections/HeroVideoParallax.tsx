"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import type { HeroContent } from "@/types/homepage";

type MediaState = "loading" | "playing" | "fallback";

const HERO_PARALLAX_MAX_OFFSET_DESKTOP = 180;
const HERO_PARALLAX_MAX_OFFSET_MOBILE = 90;
const MEDIA_LOADING_HINT_DELAY_MS = 300;

function clampParallaxOffset(offset: number, maxOffset: number) {
  return Math.max(-maxOffset, Math.min(maxOffset, offset));
}

interface HeroVideoParallaxProps {
  content: HeroContent;
}

export function HeroVideoParallax({ content }: HeroVideoParallaxProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaState, setMediaState] = useState<MediaState>("loading");
  const [showLoadingHint, setShowLoadingHint] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      setMediaState("fallback");
      return;
    }

    let cancelled = false;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!cancelled) {
            setMediaState("playing");
          }
        })
        .catch(() => {
          if (!cancelled) {
            setMediaState("fallback");
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsCompactViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const parallaxStrength = useMemo(() => {
    if (prefersReducedMotion) {
      return 0;
    }

    return isCompactViewport ? 0.08 : 0.16;
  }, [isCompactViewport, prefersReducedMotion]);

  const parallaxMaxOffset = useMemo(() => {
    return isCompactViewport
      ? HERO_PARALLAX_MAX_OFFSET_MOBILE
      : HERO_PARALLAX_MAX_OFFSET_DESKTOP;
  }, [isCompactViewport]);

  useEffect(() => {
    if (mediaState !== "loading") {
      setShowLoadingHint(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowLoadingHint(true);
    }, MEDIA_LOADING_HINT_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mediaState]);

  useEffect(() => {
    if (parallaxStrength === 0) {
      setParallaxY(0);
      return;
    }

    let animationFrame = 0;
    const onScroll = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        setParallaxY(
          clampParallaxOffset(window.scrollY * parallaxStrength, parallaxMaxOffset)
        );
        animationFrame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [parallaxMaxOffset, parallaxStrength]);

  return (
    <section className="relative min-h-dvh overflow-hidden bg-charcoal">
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${parallaxY}px)` }}
        data-testid="hero-media-layer"
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            mediaState === "fallback" ? "opacity-0" : "opacity-100"
          }`}
          src={content.video.src}
          poster={content.video.poster}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          onCanPlay={() => setMediaState("playing")}
          onError={() => setMediaState("fallback")}
          aria-hidden="true"
          role="presentation"
        />

        <img
          src={content.video.poster}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            mediaState === "fallback" ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-b from-charcoal/70 via-charcoal/40 to-charcoal/80" />
      <div className="absolute inset-0 bg-charcoal/20" />

      {showLoadingHint && mediaState === "loading" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-6">
          <p className="rounded-sm border border-diamond/20 bg-charcoal/55 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-diamond/80">
            Loading video preview
          </p>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl items-center px-6 text-center">
        <div className="w-full">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-gold">
            {content.eyebrow}
          </p>

          <h1 className="font-serif text-5xl font-bold leading-tight text-diamond sm:text-6xl lg:text-7xl">
            {content.headline}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-diamond/80 sm:text-lg">
            {content.subhead}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={content.primaryCta.href}
              className="inline-flex h-14 items-center rounded-sm bg-gold px-8 text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors hover:bg-gold/90 focus-visible:ring-2 focus-visible:ring-gold"
            >
              {content.primaryCta.label}
            </Link>

            {content.secondaryCta ? (
              <Link
                href={content.secondaryCta.href}
                className="inline-flex h-14 items-center rounded-sm border border-diamond/30 px-8 text-sm font-semibold uppercase tracking-wider text-diamond transition-colors hover:border-gold hover:text-gold focus-visible:ring-2 focus-visible:ring-gold"
              >
                {content.secondaryCta.label}
              </Link>
            ) : null}
          </div>

          {mediaState === "fallback" && content.fallbackNote ? (
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-diamond/70">
              {content.fallbackNote}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

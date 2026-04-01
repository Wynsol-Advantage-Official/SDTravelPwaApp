"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

const PARALLAX_BAND_MAX_OFFSET_DESKTOP = 140;
const PARALLAX_BAND_MAX_OFFSET_MOBILE = 72;

function clampParallaxOffset(offset: number, maxOffset: number) {
  return Math.max(-maxOffset, Math.min(maxOffset, offset));
}

interface ParallaxBandProps {
  children?: React.ReactNode;
  intensity?: number;
  disabled?: boolean;
  className?: string;
}

export function ParallaxBand({
  children,
  intensity = 0.12,
  disabled = false,
  className = "",
}: ParallaxBandProps) {
  const prefersReducedMotion = useReducedMotion();
  const [translateY, setTranslateY] = useState(0);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsCompactViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const isParallaxActive = useMemo(() => {
    return !disabled && !prefersReducedMotion;
  }, [disabled, prefersReducedMotion]);

  const effectiveIntensity = isCompactViewport ? intensity * 0.45 : intensity;
  const maxOffset = isCompactViewport
    ? PARALLAX_BAND_MAX_OFFSET_MOBILE
    : PARALLAX_BAND_MAX_OFFSET_DESKTOP;

  useEffect(() => {
    if (!isParallaxActive) {
      setTranslateY(0);
      return;
    }

    let animationFrame = 0;

    const onScroll = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        setTranslateY(
          clampParallaxOffset(window.scrollY * effectiveIntensity, maxOffset)
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
  }, [effectiveIntensity, isParallaxActive, maxOffset]);

  return (
    <section
      className={`relative isolate h-[20vh] min-h-32 overflow-hidden bg-ocean-deep/95 ${className}`}
      aria-hidden={children ? undefined : "true"}
    >
      <div
        className="pointer-events-none absolute inset-0"
        data-testid="parallax-band-layer"
        style={{
          background:
            "radial-gradient(120% 120% at 10% 10%, rgba(18,130,165,0.18), transparent 55%), radial-gradient(100% 100% at 80% 70%, rgba(242,226,191,0.12), transparent 60%), linear-gradient(180deg, rgba(4,55,80,0.95) 0%, rgba(4,55,80,1) 100%)",
          transform: `translateY(${isParallaxActive ? translateY : 0}px)`,
          willChange: "transform",
        }}
      />

      {children ? (
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-6 text-center">
          {children}
        </div>
      ) : null}
    </section>
  );
}

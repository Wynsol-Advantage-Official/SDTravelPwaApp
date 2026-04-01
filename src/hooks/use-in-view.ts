"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** IntersectionObserver threshold (0-1). Default 0.1 */
  threshold?: number;
  /** IntersectionObserver rootMargin. Default "0px" */
  rootMargin?: string;
  /** If true, stays true after first intersection. Default true */
  once?: boolean;
}

/**
 * Lightweight IntersectionObserver hook.
 * Returns a ref to attach to the target element and a boolean indicating visibility.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        if (visible) {
          setIsInView(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once]);

  return [ref, isInView];
}

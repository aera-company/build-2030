"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";

type Props = { children: React.ReactNode };

export function SmoothScrollProvider({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respeita prefers-reduced-motion: sem suavização de scroll.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false, // Safari-safe: evita stutter no iOS
      touchMultiplier: 1.1,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // reducedMotion="user" → o Framer respeita prefers-reduced-motion
  // automaticamente em todos os reveals/hover.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

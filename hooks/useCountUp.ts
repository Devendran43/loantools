"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Animate a displayed number toward `target` whenever it changes.
 * Purely visual — the underlying calculation is always the exact target
 * value; this only smooths how it's presented so results feel alive rather
 * than flickering on every keystroke.
 */
export function useCountUp(target: number, durationMs = 500): number {
  const [displayValue, setDisplayValue] = useState(target);
  const frameRef = useRef<number | undefined>(undefined);
  const fromRef = useRef(target);

  useEffect(() => {
    if (!Number.isFinite(target)) return;

    if (prefersReducedMotion()) {
      // Still deferred to a rAF callback (rather than called directly in the
      // effect body) so this doesn't trigger a synchronous cascading render.
      frameRef.current = requestAnimationFrame(() => {
        fromRef.current = target;
        setDisplayValue(target);
      });
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }

    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(progress);
      const next = from + delta * eased;
      setDisplayValue(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return displayValue;
}

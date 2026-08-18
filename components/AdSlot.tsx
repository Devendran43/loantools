"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AdSlot.module.css";

type AdVariant = "banner" | "rectangle" | "in-article";

interface AdSlotProps {
  /** AdSense ad unit slot ID (data-ad-slot). Falls back to a placeholder if unset. */
  slotId?: string;
  variant?: AdVariant;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * A responsive AdSense placement that reserves its footprint up front (no
 * layout shift once the ad loads) and only asks AdSense to fill it once the
 * slot is actually near the viewport. Falls back to a clearly-labeled,
 * identically-sized placeholder when no publisher/slot ID is configured —
 * so the page always looks and behaves the same whether ads are live or
 * not, on every device.
 */
export default function AdSlot({ slotId, variant = "banner", className = "" }: AdSlotProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<HTMLModElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  // A ref, not state: whether we've already pushed to adsbygoogle doesn't
  // need to trigger a re-render, it only gates the effect below.
  const pushedRef = useRef(false);

  const isConfigured = Boolean(ADSENSE_CLIENT_ID && slotId);

  useEffect(() => {
    if (!isConfigured) return;
    const node = frameRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isConfigured]);

  useEffect(() => {
    if (!shouldLoad || pushedRef.current || !isConfigured) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // AdSense not available (blocked, offline, script failed to load) —
      // the reserved frame stays in place, nothing breaks for the user.
    }
  }, [shouldLoad, isConfigured]);

  return (
    <div className={`${styles.wrap} ${className}`}>
      <p className={styles.label} aria-hidden="true">
        Advertisement
      </p>
      <div className={styles.frame} data-variant={variant} ref={frameRef}>
        {isConfigured && shouldLoad ? (
          <ins
            ref={insRef}
            className={`adsbygoogle ${styles.ins}`}
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className={styles.placeholder} role="presentation">
            <svg className={styles.placeholderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h10M7 13h6" strokeLinecap="round" />
            </svg>
            <span className={styles.placeholderText}>Ad space reserved</span>
          </div>
        )}
      </div>
    </div>
  );
}

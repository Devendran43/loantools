"use client";

import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger delay in ms — useful when several Reveal blocks sit in a row. */
  delayMs?: number;
}

/** Fades + slides content in once it scrolls into view. See globals.css .reveal. */
export default function Reveal({ children, as: Tag = "div", className = "", delayMs = 0 }: RevealProps) {
  const ref = useReveal<HTMLElement>();

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

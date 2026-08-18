"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface CountUpProps {
  value: number;
  format: (value: number) => string;
  durationMs?: number;
  className?: string;
}

/** Renders a number that animates toward `value` on change, formatted with `format`. */
export default function CountUp({ value, format, durationMs, className }: CountUpProps) {
  const displayed = useCountUp(value, durationMs);
  return <span className={className}>{format(displayed)}</span>;
}

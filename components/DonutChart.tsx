"use client";

import { memo } from "react";

interface DonutChartProps {
  /** Percentage (0-100) represented by the primary (principal) segment. */
  primaryPercent: number;
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSubLabel?: string;
}

/**
 * A minimal two-segment donut showing principal vs. interest as a share of
 * total repayment. Segments transition smoothly whenever the underlying
 * numbers change (loan amount, rate, tenure) so the split visibly shifts
 * rather than jumping, reinforcing that this is a live calculation.
 */
function DonutChart({
  primaryPercent,
  size = 168,
  strokeWidth = 20,
  centerLabel,
  centerSubLabel,
}: DonutChartProps) {
  const clamped = Math.min(100, Math.max(0, primaryPercent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const primaryLength = (clamped / 100) * circumference;

  const transition = "stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Principal versus interest split">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-amber-soft)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-amber)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeLinecap="butt"
            style={{ transition }}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-green)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${primaryLength} ${circumference - primaryLength}`}
            strokeLinecap="butt"
            style={{ transition }}
          />
        </g>
      </svg>
      {(centerLabel || centerSubLabel) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 2,
          }}
        >
          {centerLabel && (
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, lineHeight: 1 }}>
              {centerLabel}
            </span>
          )}
          {centerSubLabel && (
            <span style={{ fontSize: "0.68rem", color: "var(--color-text-faint)", fontWeight: 600, letterSpacing: "0.03em" }}>
              {centerSubLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DonutChart);

/**
 * Indian Rupee currency + number formatting helpers.
 *
 * The whole app should format money through these helpers so we get
 * consistent Indian digit grouping (₹10,00,000, not ₹1,000,000) everywhere.
 */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const INR_FORMATTER_PRECISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

const PERCENT_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Round a monetary value to whole paise (2 decimals) to avoid float drift accumulating. */
export function roundToPaise(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

/** Round a monetary value to the nearest rupee — used for display and for reconciling schedules. */
export function roundToRupee(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

/** Format a rupee amount as "₹10,00,000" (no decimals — the standard display format). */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "₹0";
  return INR_FORMATTER.format(roundToRupee(value));
}

/** Format a rupee amount with paise, e.g. "₹10,00,000.00" — used where sub-rupee precision matters. */
export function formatINRPrecise(value: number): string {
  if (!Number.isFinite(value)) return "₹0.00";
  return INR_FORMATTER_PRECISE.format(roundToPaise(value));
}

/** Format a plain number using Indian digit grouping, e.g. "10,00,000". */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return NUMBER_FORMATTER.format(value);
}

/** Format a percentage value, e.g. 33.4567 -> "33.46%". */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${PERCENT_FORMATTER.format(value)}%`;
}

/** Compact Indian-style shorthand for large rupee amounts, e.g. ₹12.5 L, ₹1.2 Cr. Used in tight UI spaces. */
export function formatINRCompact(value: number): string {
  if (!Number.isFinite(value)) return "₹0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(2).replace(/\.00$/, "")} L`;
  }
  return formatINR(value);
}

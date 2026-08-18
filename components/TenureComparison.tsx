import { memo } from "react";
import type { TenureComparisonRow } from "@/types/loan";
import { formatINR } from "@/lib/currency";
import styles from "./TenureComparison.module.css";

interface TenureComparisonProps {
  rows: TenureComparisonRow[];
}

/**
 * Tenure trade-off table + bar chart. Pure/presentational — memoized because
 * `rows` is only recomputed when principal/rate/tenure change, not on every
 * keystroke (e.g. editing charges leaves this table's props identical).
 */
function TenureComparison({ rows }: TenureComparisonProps) {
  const maxInterest = Math.max(...rows.map((r) => r.totalInterest), 1);

  return (
    <div className={styles.card}>
      <h2 className="h2" style={{ marginBottom: "0.5rem" }}>
        How tenure changes your cost
      </h2>
      <p className={styles.subhead}>
        Same loan amount, same interest rate — only the tenure changes. See how your EMI and total interest shift.
      </p>

      <div className={styles.scrollArea}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Tenure</th>
              <th scope="col">EMI</th>
              <th scope="col">Total interest</th>
              <th scope="col">Total repayment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.months} className={row.isCurrentSelection ? styles.currentRow : undefined}>
                <td>
                  {row.label}
                  {row.isCurrentSelection && <span className={styles.currentBadge}>Your selection</span>}
                </td>
                <td>{formatINR(row.emi)}</td>
                <td>{formatINR(row.totalInterest)}</td>
                <td>{formatINR(row.totalRepayment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className={styles.barsTitle}>Total interest by tenure</p>
        {rows.map((row) => (
          <div className={styles.barRow} key={row.months}>
            <span className={styles.barRowLabel}>{row.label}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${Math.max(4, (row.totalInterest / maxInterest) * 100)}%`,
                  background: row.isCurrentSelection ? "var(--color-blue)" : "var(--color-amber)",
                }}
              />
            </div>
            <span className={styles.barValue}>{formatINR(row.totalInterest)}</span>
          </div>
        ))}
      </div>

      <div className={styles.callout}>
        <svg className={styles.calloutIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>
          <strong>A longer tenure can reduce your monthly EMI, but it can significantly increase the total interest
          you pay.</strong> There&rsquo;s no universally &ldquo;right&rdquo; tenure — it depends on what monthly
          payment you&rsquo;re comfortable with versus how much total interest you&rsquo;re willing to pay.
        </span>
      </div>
    </div>
  );
}

export default memo(TenureComparison);

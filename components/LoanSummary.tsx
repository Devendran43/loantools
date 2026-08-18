"use client";

import { memo } from "react";
import type { AmortizationRow, LoanSummary as LoanSummaryType } from "@/types/loan";
import { formatINR, formatPercent } from "@/lib/currency";
import CountUp from "./CountUp";
import DonutChart from "./DonutChart";
import styles from "./LoanSummary.module.css";

interface LoanSummaryProps {
  summary: LoanSummaryType;
  firstRow: AmortizationRow;
  lastRow: AmortizationRow;
}

function EmiBreakdownCard({
  title,
  row,
  explanation,
}: {
  title: string;
  row: AmortizationRow;
  explanation: string;
}) {
  const interestPercent = row.emi > 0 ? (row.interest / row.emi) * 100 : 0;
  const principalPercent = 100 - interestPercent;

  return (
    <div className={styles.emiCard}>
      <div className={styles.emiCardHead}>
        <span className={styles.emiCardTitle}>{title}</span>
      </div>
      <div className={styles.emiCardAmount}>{formatINR(row.emi)}</div>
      <div className={styles.miniBar}>
        <div
          className={styles.miniBarSegment}
          style={{ width: `${principalPercent}%`, background: "var(--color-green)" }}
        />
        <div
          className={styles.miniBarSegment}
          style={{ width: `${interestPercent}%`, background: "var(--color-amber)" }}
        />
      </div>
      <div className={styles.breakdownRow}>
        <span>Principal</span>
        <span>{formatINR(row.principal)}</span>
      </div>
      <div className={styles.breakdownRow}>
        <span>Interest</span>
        <span>{formatINR(row.interest)}</span>
      </div>
      <p className={styles.explainer}>{explanation}</p>
    </div>
  );
}

/**
 * Primary results: EMI, totals, principal/interest split, first & final
 * EMI breakdown. Memoized — `summary`/`firstRow`/`lastRow` are all derived
 * only from principal/rate/tenure upstream, so this skips re-rendering
 * (including every <CountUp> animation) when the user edits charges instead.
 */
function LoanSummary({ summary, firstRow, lastRow }: LoanSummaryProps) {
  const principalShare = summary.totalRepayment > 0 ? (summary.totalPrincipal / summary.totalRepayment) * 100 : 100;

  return (
    <div className={styles.card}>
      <h2 className="h2" style={{ marginBottom: "1.5rem" }}>
        Your loan at a glance
      </h2>

      <div className={styles.top}>
        <div className={styles.chartWrap}>
          <div>
            <DonutChart
              primaryPercent={principalShare}
              centerLabel={formatPercent(summary.interestPercentOfPrincipal)}
              centerSubLabel="interest of principal"
            />
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "var(--color-green)" }} />
                Principal
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "var(--color-amber)" }} />
                Interest
              </span>
            </div>
          </div>
        </div>

        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Loan amount</div>
            <div className={styles.statValue}>
              <CountUp value={summary.principal} format={formatINR} />
            </div>
          </div>
          <div className={styles.stat} data-emphasis="true">
            <div className={styles.statLabel}>Monthly EMI</div>
            <div className={styles.statValue} data-tone="primary">
              <CountUp value={summary.emi} format={formatINR} />
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total interest</div>
            <div className={styles.statValue} data-tone="accent">
              <CountUp value={summary.totalInterest} format={formatINR} />
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total principal</div>
            <div className={styles.statValue}>
              <CountUp value={summary.totalPrincipal} format={formatINR} />
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total repayment</div>
            <div className={styles.statValue}>
              <CountUp value={summary.totalRepayment} format={formatINR} />
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Interest vs principal</div>
            <div className={styles.statValue} data-tone="accent">
              <CountUp value={summary.interestPercentOfPrincipal} format={formatPercent} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.emiRow}>
        <EmiBreakdownCard
          title="Your first EMI"
          row={firstRow}
          explanation="Your first month's interest is calculated on the full outstanding loan balance. The remaining part of your EMI reduces the principal."
        />
        <EmiBreakdownCard
          title="Your final EMI"
          row={lastRow}
          explanation="By the final month, the outstanding balance is much lower, so most of this EMI goes toward principal. This applies to the standard reducing-balance model used here."
        />
      </div>
    </div>
  );
}

export default memo(LoanSummary);

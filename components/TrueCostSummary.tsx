import { memo } from "react";
import type { AmortizationRow, TrueCostResult } from "@/types/loan";
import { formatINR, formatPercent } from "@/lib/currency";
import styles from "./TrueCostSummary.module.css";

interface TrueCostSummaryProps {
  trueCost: TrueCostResult;
  firstRow: AmortizationRow;
  lastRow: AmortizationRow;
}

/**
 * Charges breakdown + final "true cost" hero summary. Memoized for
 * consistency with its sibling cards, though — unlike LoanSummary or
 * AmortizationTable — it depends on charges too, so it legitimately
 * re-renders on nearly every input change.
 */
function TrueCostSummary({ trueCost, firstRow, lastRow }: TrueCostSummaryProps) {
  const { loanSummary, charges, totalCostIncludingCharges } = trueCost;
  const hasCharges = charges.totalUpfrontCharges > 0;

  return (
    <div className={styles.card}>
      <h2 className="h2" style={{ marginBottom: "0.5rem" }}>
        What this loan actually costs
      </h2>
      <p className={styles.subhead}>
        Beyond the EMI, here&rsquo;s the full picture — what you borrow, what&rsquo;s deducted upfront, and what you
        repay in total.
      </p>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Original loan amount</span>
          <span className={styles.rowValue}>{formatINR(loanSummary.principal)}</span>
        </div>
        <div className={styles.row} data-tone="accent">
          <span className={styles.rowLabel}>Processing fee</span>
          <span className={styles.rowValue}>{formatINR(charges.processingFee)}</span>
        </div>
        <div className={styles.row} data-tone="accent">
          <span className={styles.rowLabel}>Other charges</span>
          <span className={styles.rowValue}>{formatINR(charges.otherCharges)}</span>
        </div>
        <div className={styles.row} data-tone="accent">
          <span className={styles.rowLabel}>Total upfront charges</span>
          <span className={styles.rowValue}>{formatINR(charges.totalUpfrontCharges)}</span>
        </div>
        <div className={styles.row} data-emphasis="true">
          <span className={styles.rowLabel}>
            Estimated net amount received
            <small>Loan amount minus the upfront charges you entered</small>
          </span>
          <span className={styles.rowValue}>{formatINR(charges.estimatedNetAmountReceived)}</span>
        </div>
        <div className={styles.row} data-tone="accent">
          <span className={styles.rowLabel}>Total interest</span>
          <span className={styles.rowValue}>{formatINR(loanSummary.totalInterest)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>
            Total repayment
            <small>Principal + total interest + charges you entered</small>
          </span>
          <span className={styles.rowValue}>{formatINR(totalCostIncludingCharges)}</span>
        </div>
      </div>

      {hasCharges && (
        <p className={styles.footnote}>
          This is an estimated net amount after the charges you entered — not every lender deducts fees from the
          disbursed amount, and some charges may be collected separately. Always confirm the exact disbursement and
          fee treatment in your loan agreement.
        </p>
      )}

      <hr className={styles.divider} />

      <div className={styles.summaryHero}>
        <div className={styles.summaryHeroTitle}>Your {formatINR(loanSummary.principal)} loan, summarized</div>
        <div className={styles.heroGrid}>
          <div className={styles.heroStat}>
            <div className={styles.heroStatLabel}>Amount borrowed</div>
            <div className={styles.heroStatValue}>{formatINR(loanSummary.principal)}</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatLabel}>Monthly EMI</div>
            <div className={styles.heroStatValue}>{formatINR(loanSummary.emi)}</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatLabel}>Total interest</div>
            <div className={styles.heroStatValue}>{formatINR(loanSummary.totalInterest)}</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatLabel}>Other charges</div>
            <div className={styles.heroStatValue}>{formatINR(charges.totalUpfrontCharges)}</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatLabel}>Total repayment</div>
            <div className={styles.heroStatValue}>{formatINR(totalCostIncludingCharges)}</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatLabel}>Interest as % of principal</div>
            <div className={styles.heroStatValue}>{formatPercent(loanSummary.interestPercentOfPrincipal)}</div>
          </div>
        </div>
      </div>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>
            First EMI
            <small>Interest {formatINR(firstRow.interest)} · Principal {formatINR(firstRow.principal)}</small>
          </span>
          <span className={styles.rowValue}>{formatINR(firstRow.emi)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>
            Final EMI
            <small>Interest {formatINR(lastRow.interest)} · Principal {formatINR(lastRow.principal)}</small>
          </span>
          <span className={styles.rowValue}>{formatINR(lastRow.emi)}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(TrueCostSummary);

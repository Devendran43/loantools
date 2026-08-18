"use client";

import { memo, useMemo, useState } from "react";
import type { AmortizationRow } from "@/types/loan";
import { formatINR } from "@/lib/currency";
import styles from "./AmortizationTable.module.css";

interface AmortizationTableProps {
  schedule: AmortizationRow[];
}

interface YearGroup {
  year: number;
  rows: AmortizationRow[];
  yearInterest: number;
  yearPrincipal: number;
  closingBalance: number;
}

function groupByYear(schedule: AmortizationRow[]): YearGroup[] {
  const groups = new Map<number, AmortizationRow[]>();
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    const list = groups.get(year) ?? [];
    list.push(row);
    groups.set(year, list);
  }
  return Array.from(groups.entries()).map(([year, rows]) => ({
    year,
    rows,
    yearInterest: rows.reduce((sum, r) => sum + r.interest, 0),
    yearPrincipal: rows.reduce((sum, r) => sum + r.principal, 0),
    closingBalance: rows[rows.length - 1].balance,
  }));
}

/**
 * Full month-by-month amortization schedule, grouped by year.
 *
 * Memoized: `schedule` only changes when principal/rate/tenure change, not
 * when the user edits charges (which don't affect the schedule), so this
 * skips re-rendering a potentially 600-row table on unrelated keystrokes.
 */
function AmortizationTable({ schedule }: AmortizationTableProps) {
  const groups = useMemo(() => groupByYear(schedule), [schedule]);
  const [allOpen, setAllOpen] = useState(false);
  // Force-remount <details> elements when the "expand/collapse all" toggle
  // changes so their `open` attribute (uncontrolled after that) resets.
  const [resetKey, setResetKey] = useState(0);

  function toggleAll() {
    setAllOpen((prev) => !prev);
    setResetKey((k) => k + 1);
  }

  return (
    <div className={styles.card}>
      <div className={styles.headRow}>
        <h2 className="h2">Amortization schedule</h2>
        <button type="button" className={styles.expandAllBtn} onClick={toggleAll}>
          {allOpen ? "Collapse all years" : "Expand all years"}
        </button>
      </div>
      <p className={styles.subhead}>
        Every EMI, split into interest and principal, month by month — grouped by year so a long schedule stays easy
        to scan.
      </p>

      {groups.map((group, index) => (
        <details
          key={`${resetKey}-${group.year}`}
          className={styles.yearGroup}
          open={allOpen || index === 0}
        >
          <summary className={styles.summary}>
            <span className={styles.summaryLeft}>
              <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Year {group.year}
              <span style={{ fontWeight: 400, color: "var(--color-text-faint)" }}>
                (Month {group.rows[0].month}–{group.rows[group.rows.length - 1].month})
              </span>
            </span>
            <span className={styles.summaryStats}>
              <span>
                Interest <b>{formatINR(group.yearInterest)}</b>
              </span>
              <span>
                Balance <b>{formatINR(group.closingBalance)}</b>
              </span>
            </span>
          </summary>

          <div className={styles.scrollArea}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">EMI</th>
                  <th scope="col">Interest</th>
                  <th scope="col">Principal</th>
                  <th scope="col">Balance</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{formatINR(row.emi)}</td>
                    <td className={styles.interestCell}>{formatINR(row.interest)}</td>
                    <td className={styles.principalCell}>{formatINR(row.principal)}</td>
                    <td>{formatINR(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </div>
  );
}

export default memo(AmortizationTable);

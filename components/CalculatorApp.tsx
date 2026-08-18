"use client";

import { useCallback, useMemo, useState } from "react";
import type { LoanInputs } from "@/types/loan";
import {
  calculateCharges,
  calculateLoanSummary,
  combineTrueCost,
  compareTenures,
  generateAmortizationSchedule,
  getDefaultTenureOptionsMonths,
} from "@/lib/loanCalculator";
import { LIMITS, tenureToMonths, validateLoanInputs } from "@/lib/loanValidation";
import LoanInput from "./LoanInput";
import LoanSummary from "./LoanSummary";
import AmortizationTable from "./AmortizationTable";
import TrueCostSummary from "./TrueCostSummary";
import TenureComparison from "./TenureComparison";
import LoanExplanation from "./LoanExplanation";
import Disclaimer from "./Disclaimer";
import AdSlot from "./AdSlot";
import Reveal from "./Reveal";

const DEFAULT_INPUTS: LoanInputs = {
  principal: 1_000_000,
  annualRatePercent: 12,
  tenureValue: 5,
  tenureUnit: "years",
  processingFeeType: "percent",
  processingFeeValue: 1,
  otherCharges: 0,
};

const AD_SLOT_MID = process.env.NEXT_PUBLIC_ADSENSE_SLOT_MID;
const AD_SLOT_LOWER = process.env.NEXT_PUBLIC_ADSENSE_SLOT_LOWER;

/**
 * Orchestrator for the whole calculator: owns the single source of truth
 * (`inputs`), validates it, and derives every downstream value (schedule,
 * loan summary, charges, tenure comparison) via memoized calls into
 * lib/loanCalculator.ts and lib/loanValidation.ts — no formulas live here.
 *
 * The memoization is split deliberately: schedule/loanSummary/tenure rows
 * depend only on principal+rate+months, while charges depend on the fee
 * fields too. That means editing the processing fee recomputes `charges`
 * and `trueCost` but leaves `schedule`/`loanSummary`/`tenureComparisonRows`
 * at the exact same object references, letting their memoized components
 * (AmortizationTable, LoanSummary, TenureComparison) skip re-rendering.
 */
export default function CalculatorApp() {
  const [inputs, setInputs] = useState<LoanInputs>(DEFAULT_INPUTS);

  // Stable identity across renders (doesn't change when `inputs` changes),
  // so it never invalidates the memoization of components below it.
  const handleChange = useCallback((patch: Partial<LoanInputs>) => {
    setInputs((prev) => ({ ...prev, ...patch }));
  }, []);

  const validation = useMemo(() => validateLoanInputs(inputs), [inputs]);
  const months = useMemo(
    () => tenureToMonths(inputs.tenureValue, inputs.tenureUnit),
    [inputs.tenureValue, inputs.tenureUnit]
  );
  const isValid = validation.valid && Number.isFinite(months) && months > 0;

  // Schedule-derived values are keyed only on principal/rate/months —
  // editing processing fee or other charges leaves these object references
  // untouched, so AmortizationTable/TenureComparison (both memoized) skip
  // re-rendering on those keystrokes instead of recomputing a 600-row table.
  const schedule = useMemo(() => {
    if (!isValid) return [];
    return generateAmortizationSchedule(inputs.principal, inputs.annualRatePercent, months);
  }, [isValid, inputs.principal, inputs.annualRatePercent, months]);

  const loanSummary = useMemo(() => {
    if (!isValid) return null;
    return calculateLoanSummary(inputs.principal, inputs.annualRatePercent, months);
  }, [isValid, inputs.principal, inputs.annualRatePercent, months]);

  // Charges are cheap (no loop) and only meaningful alongside loanSummary,
  // so they're combined into `trueCost` below rather than passed around
  // separately.
  const charges = useMemo(() => {
    if (!isValid) return null;
    return calculateCharges(inputs.principal, inputs.processingFeeType, inputs.processingFeeValue, inputs.otherCharges);
  }, [isValid, inputs.principal, inputs.processingFeeType, inputs.processingFeeValue, inputs.otherCharges]);

  const trueCost = useMemo(() => {
    if (!loanSummary || !charges) return null;
    return combineTrueCost(loanSummary, charges);
  }, [loanSummary, charges]);

  const tenureComparisonRows = useMemo(() => {
    if (!isValid) return [];
    const options = getDefaultTenureOptionsMonths(months, LIMITS.MAX_TENURE_MONTHS);
    return compareTenures(inputs.principal, inputs.annualRatePercent, options, months);
  }, [isValid, inputs.principal, inputs.annualRatePercent, months]);

  const firstRow = schedule[0];
  const lastRow = schedule[schedule.length - 1];
  const hasResults = isValid && loanSummary && trueCost && firstRow && lastRow;

  return (
    <div className="container">
      <div className="stack">
        <LoanInput inputs={inputs} errors={validation.errors} onChange={handleChange} />

        {hasResults ? (
          <>
            <Reveal>
              <LoanSummary summary={loanSummary} firstRow={firstRow} lastRow={lastRow} />
            </Reveal>

            <AdSlot variant="rectangle" slotId={AD_SLOT_MID} />

            <Reveal>
              <AmortizationTable schedule={schedule} />
            </Reveal>

            <Reveal>
              <TrueCostSummary trueCost={trueCost} firstRow={firstRow} lastRow={lastRow} />
            </Reveal>

            <Reveal>
              <TenureComparison rows={tenureComparisonRows} />
            </Reveal>

            <AdSlot variant="banner" slotId={AD_SLOT_LOWER} />

            <Reveal>
              <LoanExplanation />
            </Reveal>

            <Disclaimer />
          </>
        ) : (
          <div className="emptyState">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-danger)"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
            </svg>
            <span>Fix the highlighted fields above to see your loan results.</span>
          </div>
        )}
      </div>
    </div>
  );
}

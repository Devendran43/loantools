/**
 * Loan calculation engine.
 *
 * Pure functions only — no React, no DOM, no I/O. Everything here is
 * independently unit-testable and safe to reuse for future loan-related
 * features (see tests/loanCalculator.test.ts).
 *
 * Rounding strategy: every intermediate monetary value is rounded to paise
 * (2 decimals) via `roundToPaise` as it's produced, so error never has a
 * chance to silently accumulate across hundreds of months. The final month
 * of every amortization schedule is force-reconciled so the closing balance
 * is exactly 0 — never ₹0.01 or -₹0.03 — and totals are derived by summing
 * the schedule itself rather than re-deriving them, so they always agree.
 */
import type {
  AmortizationRow,
  ChargesBreakdown,
  LoanSummary,
  ProcessingFeeType,
  TenureComparisonRow,
  TrueCostResult,
} from "@/types/loan";
import { roundToPaise } from "./currency";

/**
 * Standard monthly reducing-balance EMI.
 *
 *   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 *
 * where r is the *monthly* interest rate. When the rate is 0%, EMI is
 * simply the principal spread evenly across the tenure.
 */
export function calculateEMI(
  principal: number,
  annualRatePercent: number,
  months: number
): number {
  if (!Number.isFinite(principal) || principal <= 0) {
    throw new Error("Principal must be a finite number greater than 0.");
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    throw new Error("Annual interest rate must be a finite number that is 0 or greater.");
  }
  if (!Number.isFinite(months) || !Number.isInteger(months) || months <= 0) {
    throw new Error("Tenure must be a whole number of months greater than 0.");
  }

  const monthlyRate = annualRatePercent / 12 / 100;

  if (monthlyRate === 0) {
    return roundToPaise(principal / months);
  }

  const growth = Math.pow(1 + monthlyRate, months);
  const emi = (principal * monthlyRate * growth) / (growth - 1);
  return roundToPaise(emi);
}

/**
 * Generate the full month-by-month amortization schedule for a loan.
 *
 * Every row is computed from the outstanding balance so the interest
 * portion naturally declines and the principal portion naturally grows
 * under the standard reducing-balance model. The final row always closes
 * the balance to exactly 0.
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRatePercent: number,
  months: number
): AmortizationRow[] {
  const standardEmi = calculateEMI(principal, annualRatePercent, months);
  const monthlyRate = annualRatePercent / 12 / 100;

  const rows: AmortizationRow[] = [];
  let balance = roundToPaise(principal);

  for (let month = 1; month <= months; month++) {
    const interest = roundToPaise(balance * monthlyRate);
    const isFinalMonth = month === months;

    let principalComponent = roundToPaise(standardEmi - interest);
    let emiThisMonth = standardEmi;

    // The final installment (or any month where rounding would otherwise
    // overshoot the remaining balance) pays off exactly what's left, so the
    // schedule never ends on a stray paisa of balance.
    if (isFinalMonth || principalComponent >= balance) {
      principalComponent = balance;
      emiThisMonth = roundToPaise(interest + principalComponent);
    }

    balance = roundToPaise(balance - principalComponent);
    if (balance < 0) balance = 0;
    if (isFinalMonth) balance = 0;

    rows.push({
      month,
      emi: emiThisMonth,
      interest,
      principal: principalComponent,
      balance,
    });
  }

  return rows;
}

/** Derive summary totals from a principal + its amortization schedule. */
export function calculateLoanSummary(
  principal: number,
  annualRatePercent: number,
  months: number
): LoanSummary {
  const schedule = generateAmortizationSchedule(principal, annualRatePercent, months);

  const totalPrincipal = roundToPaise(schedule.reduce((sum, row) => sum + row.principal, 0));
  const totalInterest = roundToPaise(schedule.reduce((sum, row) => sum + row.interest, 0));
  const totalRepayment = roundToPaise(totalPrincipal + totalInterest);
  const emi = calculateEMI(principal, annualRatePercent, months);
  const interestPercentOfPrincipal = principal > 0 ? roundToPaise((totalInterest / principal) * 100) : 0;

  return {
    principal: roundToPaise(principal),
    emi,
    totalInterest,
    totalPrincipal,
    totalRepayment,
    interestPercentOfPrincipal,
    totalMonths: months,
  };
}

/** Calculate upfront/one-time charges and the resulting estimated net amount received. */
export function calculateCharges(
  principal: number,
  processingFeeType: ProcessingFeeType,
  processingFeeValue: number,
  otherCharges: number
): ChargesBreakdown {
  const safeFeeValue = Number.isFinite(processingFeeValue) && processingFeeValue > 0 ? processingFeeValue : 0;
  const safeOtherCharges = Number.isFinite(otherCharges) && otherCharges > 0 ? otherCharges : 0;

  const processingFee =
    processingFeeType === "percent"
      ? roundToPaise(principal * (safeFeeValue / 100))
      : roundToPaise(safeFeeValue);

  const otherChargesRounded = roundToPaise(safeOtherCharges);
  const totalUpfrontCharges = roundToPaise(processingFee + otherChargesRounded);
  const estimatedNetAmountReceived = roundToPaise(principal - totalUpfrontCharges);

  return {
    processingFee,
    otherCharges: otherChargesRounded,
    totalUpfrontCharges,
    estimatedNetAmountReceived,
  };
}

/**
 * Assemble a LoanSummary + ChargesBreakdown (each computed independently)
 * into the full "true cost" picture. Split out from `calculateTrueCost` so
 * callers that already have both pieces — e.g. a UI layer memoizing the
 * schedule-derived summary separately from charges, so editing a fee doesn't
 * invalidate components that only care about the amortization schedule —
 * can combine them without recomputing the amortization schedule.
 */
export function combineTrueCost(loanSummary: LoanSummary, charges: ChargesBreakdown): TrueCostResult {
  const totalCostIncludingCharges = roundToPaise(loanSummary.totalRepayment + charges.totalUpfrontCharges);
  return { loanSummary, charges, totalCostIncludingCharges };
}

/** Combine the amortization summary with charges into the full "true cost" picture. */
export function calculateTrueCost(
  principal: number,
  annualRatePercent: number,
  months: number,
  processingFeeType: ProcessingFeeType,
  processingFeeValue: number,
  otherCharges: number
): TrueCostResult {
  const loanSummary = calculateLoanSummary(principal, annualRatePercent, months);
  const charges = calculateCharges(principal, processingFeeType, processingFeeValue, otherCharges);
  return combineTrueCost(loanSummary, charges);
}

/** Human-readable tenure label, e.g. 60 -> "5 years", 18 -> "1 yr 6 mo", 8 -> "8 months". */
export function formatTenureLabel(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? "1 year" : `${years} years`;
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) {
    return remMonths === 1 ? "1 month" : `${remMonths} months`;
  }
  return `${years} yr ${remMonths} mo`;
}

/** Curated set of tenure options (in months) to compare against, given the loan's current tenure and a max cap. */
export function getDefaultTenureOptionsMonths(currentMonths: number, maxMonths: number): number[] {
  const candidateYears = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];
  const options = new Set<number>();

  for (const years of candidateYears) {
    const m = years * 12;
    if (m <= maxMonths) options.add(m);
  }
  if (currentMonths > 0 && currentMonths <= maxMonths) {
    options.add(currentMonths);
  }

  return Array.from(options).sort((a, b) => a - b);
}

/**
 * Compare EMI / total interest / total repayment across multiple tenures for
 * the same principal and rate — the core "what if I change my tenure" view.
 */
export function compareTenures(
  principal: number,
  annualRatePercent: number,
  tenureOptionsMonths: number[],
  currentMonths: number
): TenureComparisonRow[] {
  return tenureOptionsMonths.map((months) => {
    const summary = calculateLoanSummary(principal, annualRatePercent, months);
    return {
      label: formatTenureLabel(months),
      months,
      emi: summary.emi,
      totalInterest: summary.totalInterest,
      totalRepayment: summary.totalRepayment,
      isCurrentSelection: months === currentMonths,
    };
  });
}

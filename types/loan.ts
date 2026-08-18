/**
 * Core domain types for the loan cost calculator.
 *
 * Keeping these separate from the calculation engine and the UI lets both
 * evolve independently, and gives future loan-type-specific features
 * (home loan, vehicle loan, gold loan, etc.) a stable contract to extend.
 */

/** Unit the borrower chose to express tenure in. Always normalized to months internally. */
export type TenureUnit = "months" | "years";

/** How the processing fee was entered by the borrower. */
export type ProcessingFeeType = "percent" | "fixed";

/** Raw, user-facing loan inputs — exactly what the form collects. */
export interface LoanInputs {
  /** Loan amount / principal, in rupees. */
  principal: number;
  /** Annual (nominal) interest rate, in percent. e.g. 12 means 12%. */
  annualRatePercent: number;
  /** Tenure value as entered by the user, in `tenureUnit` units. */
  tenureValue: number;
  tenureUnit: TenureUnit;
  /** Optional processing fee. */
  processingFeeType: ProcessingFeeType;
  processingFeeValue: number;
  /** Optional other one-time charges, in rupees. */
  otherCharges: number;
}

/** LoanInputs normalized into the values the calculation engine actually needs. */
export interface NormalizedLoanInputs {
  principal: number;
  annualRatePercent: number;
  months: number;
}

/** One row of the month-by-month amortization schedule. */
export interface AmortizationRow {
  month: number;
  emi: number;
  interest: number;
  principal: number;
  /** Outstanding balance after this month's payment. */
  balance: number;
}

/** Aggregate results derived from a full amortization schedule. */
export interface LoanSummary {
  principal: number;
  emi: number;
  totalInterest: number;
  totalPrincipal: number;
  totalRepayment: number;
  /** Total interest expressed as a percentage of the principal. */
  interestPercentOfPrincipal: number;
  totalMonths: number;
}

/** Breakdown of one-time, upfront-style charges entered by the user. */
export interface ChargesBreakdown {
  processingFee: number;
  otherCharges: number;
  totalUpfrontCharges: number;
  /** Loan amount minus charges the user told us are deducted at disbursement. */
  estimatedNetAmountReceived: number;
}

/** The full "true cost" picture: amortization summary + charges combined. */
export interface TrueCostResult {
  loanSummary: LoanSummary;
  charges: ChargesBreakdown;
  /** totalRepayment (principal + interest) + total upfront charges. */
  totalCostIncludingCharges: number;
}

/** One row in the tenure comparison table. */
export interface TenureComparisonRow {
  label: string;
  months: number;
  emi: number;
  totalInterest: number;
  totalRepayment: number;
  isCurrentSelection: boolean;
}

/** Result of validating a single numeric field. */
export interface FieldValidationResult {
  valid: boolean;
  error?: string;
}

/** Result of validating the full LoanInputs object. */
export interface LoanInputsValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof LoanInputs, string>>;
}

/**
 * Input validation for the loan calculator.
 *
 * Every limit here exists to reject nonsensical or abusive input
 * (negative numbers, NaN, Infinity, absurdly large values that would make
 * amortization loops expensive) — not to encode real-world lending policy.
 */
import type {
  FieldValidationResult,
  LoanInputs,
  LoanInputsValidationResult,
} from "@/types/loan";

/** Sensible ceilings to prevent computational abuse and nonsensical scenarios. */
export const LIMITS = {
  MIN_PRINCIPAL: 1,
  MAX_PRINCIPAL: 1_000_00_00_000, // ₹1,000 crore
  MIN_RATE_PERCENT: 0,
  MAX_RATE_PERCENT: 100,
  MIN_TENURE_MONTHS: 1,
  MAX_TENURE_MONTHS: 600, // 50 years
  MAX_PROCESSING_FEE_PERCENT: 100,
  MAX_OTHER_CHARGES: 1_00_00_000, // ₹1 crore
} as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function validatePrincipal(value: number): FieldValidationResult {
  if (!isFiniteNumber(value)) {
    return { valid: false, error: "Enter a valid loan amount." };
  }
  if (value <= 0) {
    return { valid: false, error: "Loan amount must be greater than 0." };
  }
  if (value < LIMITS.MIN_PRINCIPAL) {
    return { valid: false, error: `Loan amount must be at least ₹${LIMITS.MIN_PRINCIPAL}.` };
  }
  if (value > LIMITS.MAX_PRINCIPAL) {
    return { valid: false, error: "Loan amount exceeds the maximum supported value." };
  }
  return { valid: true };
}

export function validateAnnualRate(value: number): FieldValidationResult {
  if (!isFiniteNumber(value)) {
    return { valid: false, error: "Enter a valid interest rate." };
  }
  if (value < LIMITS.MIN_RATE_PERCENT) {
    return { valid: false, error: "Interest rate cannot be negative." };
  }
  if (value > LIMITS.MAX_RATE_PERCENT) {
    return { valid: false, error: `Interest rate cannot exceed ${LIMITS.MAX_RATE_PERCENT}%.` };
  }
  return { valid: true };
}

export function validateTenureMonths(months: number): FieldValidationResult {
  if (!isFiniteNumber(months)) {
    return { valid: false, error: "Enter a valid tenure." };
  }
  if (months < LIMITS.MIN_TENURE_MONTHS) {
    return { valid: false, error: "Tenure must be at least 1 month." };
  }
  if (!Number.isInteger(months)) {
    return { valid: false, error: "Tenure must be a whole number of months." };
  }
  if (months > LIMITS.MAX_TENURE_MONTHS) {
    return { valid: false, error: `Tenure cannot exceed ${LIMITS.MAX_TENURE_MONTHS} months (50 years).` };
  }
  return { valid: true };
}

export function validateProcessingFeeValue(
  value: number,
  type: "percent" | "fixed"
): FieldValidationResult {
  if (!isFiniteNumber(value)) {
    return { valid: false, error: "Enter a valid processing fee." };
  }
  if (value < 0) {
    return { valid: false, error: "Processing fee cannot be negative." };
  }
  if (type === "percent" && value > LIMITS.MAX_PROCESSING_FEE_PERCENT) {
    return { valid: false, error: "Processing fee percentage is too high." };
  }
  if (type === "fixed" && value > LIMITS.MAX_PRINCIPAL) {
    return { valid: false, error: "Processing fee amount is too high." };
  }
  return { valid: true };
}

export function validateOtherCharges(value: number): FieldValidationResult {
  if (!isFiniteNumber(value)) {
    return { valid: false, error: "Enter a valid amount." };
  }
  if (value < 0) {
    return { valid: false, error: "Other charges cannot be negative." };
  }
  if (value > LIMITS.MAX_OTHER_CHARGES) {
    return { valid: false, error: "Other charges amount is too high." };
  }
  return { valid: true };
}

/** Convert a user-entered tenure (value + unit) into whole months. */
export function tenureToMonths(tenureValue: number, unit: "months" | "years"): number {
  if (!isFiniteNumber(tenureValue)) return NaN;
  const months = unit === "years" ? tenureValue * 12 : tenureValue;
  return Math.round(months);
}

/** Validate the full set of loan inputs, returning field-level errors. */
export function validateLoanInputs(inputs: LoanInputs): LoanInputsValidationResult {
  const errors: Partial<Record<keyof LoanInputs, string>> = {};

  const principalResult = validatePrincipal(inputs.principal);
  if (!principalResult.valid) errors.principal = principalResult.error;

  const rateResult = validateAnnualRate(inputs.annualRatePercent);
  if (!rateResult.valid) errors.annualRatePercent = rateResult.error;

  const months = tenureToMonths(inputs.tenureValue, inputs.tenureUnit);
  const tenureResult = validateTenureMonths(months);
  if (!tenureResult.valid) errors.tenureValue = tenureResult.error;

  const feeResult = validateProcessingFeeValue(inputs.processingFeeValue, inputs.processingFeeType);
  if (!feeResult.valid) errors.processingFeeValue = feeResult.error;

  const chargesResult = validateOtherCharges(inputs.otherCharges);
  if (!chargesResult.valid) errors.otherCharges = chargesResult.error;

  return { valid: Object.keys(errors).length === 0, errors };
}

"use client";

import type { ChangeEvent } from "react";
import type { LoanInputs } from "@/types/loan";
import { formatINR } from "@/lib/currency";
import { LIMITS } from "@/lib/loanValidation";
import styles from "./LoanInput.module.css";

/**
 * The loan input form: amount, rate, tenure, and optional charges.
 *
 * Purely controlled/presentational — it holds no state of its own and
 * contains no financial formulas. `inputs`/`errors` come from the parent
 * (CalculatorApp, backed by lib/loanValidation.ts); every change is reported
 * upward via `onChange` as a partial patch, which the parent merges and
 * re-validates. This keeps the validation source of truth in one place.
 */
interface LoanInputProps {
  inputs: LoanInputs;
  errors: Partial<Record<keyof LoanInputs, string>>;
  onChange: (patch: Partial<LoanInputs>) => void;
}

/** Formats a numeric field for a controlled <input>: NaN/Infinity render as an empty box, not "NaN". */
function numberOrEmpty(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

/** Parses a raw <input> string into a number for the parent to validate; blank input becomes NaN (invalid), never 0. */
function parseField(raw: string): number {
  if (raw.trim() === "") return NaN;
  return Number(raw);
}

export default function LoanInput({ inputs, errors, onChange }: LoanInputProps) {
  const tenureMax = inputs.tenureUnit === "years" ? 50 : 600;
  const tenureStep = inputs.tenureUnit === "years" ? 1 : 1;
  const rateSliderMax = 30; // most retail loans fall well under 30% — field itself allows up to 100

  // Curried by field name so every <input>/<range> below can get its own
  // change handler without a separately-named handler per field.
  function handleNumberChange(field: keyof LoanInputs) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      onChange({ [field]: parseField(e.target.value) } as Partial<LoanInputs>);
    };
  }

  function handleSliderChange(field: keyof LoanInputs) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      onChange({ [field]: Number(e.target.value) } as Partial<LoanInputs>);
    };
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className="h3">Loan details</h2>
          <p className={styles.optionalTag}>Results update instantly as you type.</p>
        </div>
        <span className={styles.privacyBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" strokeLinejoin="round" />
          </svg>
          Calculated on your device
        </span>
      </div>

      <div className={styles.grid}>
        {/* Loan amount */}
        <div className={`${styles.field} ${styles.fullRow}`}>
          <div className={styles.fieldTop}>
            <label className={styles.label} htmlFor="principal">
              Loan amount
            </label>
          </div>
          <div className={styles.inputRow} data-invalid={Boolean(errors.principal)}>
            <span className={styles.prefix}>₹</span>
            <input
              id="principal"
              className={styles.input}
              type="number"
              inputMode="decimal"
              min={0}
              step={1000}
              value={numberOrEmpty(inputs.principal)}
              onChange={handleNumberChange("principal")}
              aria-invalid={Boolean(errors.principal)}
              aria-describedby="principal-help"
            />
          </div>
          <input
            className={styles.slider}
            type="range"
            aria-label="Loan amount slider"
            min={LIMITS.MIN_PRINCIPAL}
            max={2_00_00_000}
            step={5000}
            value={Number.isFinite(inputs.principal) ? inputs.principal : 0}
            onChange={handleSliderChange("principal")}
          />
          <p id="principal-help" className={errors.principal ? styles.error : styles.helper}>
            {errors.principal ?? (Number.isFinite(inputs.principal) ? formatINR(inputs.principal) : "Enter the amount you plan to borrow")}
          </p>
        </div>

        {/* Interest rate */}
        <div className={styles.field}>
          <div className={styles.fieldTop}>
            <label className={styles.label} htmlFor="rate">
              Annual interest rate
            </label>
          </div>
          <div className={styles.inputRow} data-invalid={Boolean(errors.annualRatePercent)}>
            <input
              id="rate"
              className={styles.input}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.05}
              value={numberOrEmpty(inputs.annualRatePercent)}
              onChange={handleNumberChange("annualRatePercent")}
              aria-invalid={Boolean(errors.annualRatePercent)}
              aria-describedby="rate-help"
            />
            <span className={styles.suffix}>%</span>
          </div>
          <input
            className={styles.slider}
            type="range"
            aria-label="Interest rate slider"
            min={0}
            max={rateSliderMax}
            step={0.05}
            value={Number.isFinite(inputs.annualRatePercent) ? Math.min(inputs.annualRatePercent, rateSliderMax) : 0}
            onChange={handleSliderChange("annualRatePercent")}
          />
          <p id="rate-help" className={errors.annualRatePercent ? styles.error : styles.helper}>
            {errors.annualRatePercent ?? "The nominal annual rate quoted by your lender"}
          </p>
        </div>

        {/* Tenure */}
        <div className={styles.field}>
          <div className={styles.fieldTop}>
            <label className={styles.label} htmlFor="tenure">
              Loan tenure
            </label>
            <div className={styles.toggleGroup} role="group" aria-label="Tenure unit">
              <button
                type="button"
                className={styles.toggleBtn}
                data-active={inputs.tenureUnit === "months"}
                onClick={() => onChange({ tenureUnit: "months" })}
              >
                Months
              </button>
              <button
                type="button"
                className={styles.toggleBtn}
                data-active={inputs.tenureUnit === "years"}
                onClick={() => onChange({ tenureUnit: "years" })}
              >
                Years
              </button>
            </div>
          </div>
          <div className={styles.inputRow} data-invalid={Boolean(errors.tenureValue)}>
            <input
              id="tenure"
              className={styles.input}
              type="number"
              inputMode="decimal"
              min={1}
              step={tenureStep}
              value={numberOrEmpty(inputs.tenureValue)}
              onChange={handleNumberChange("tenureValue")}
              aria-invalid={Boolean(errors.tenureValue)}
              aria-describedby="tenure-help"
            />
            <span className={styles.suffix}>{inputs.tenureUnit === "years" ? "yrs" : "mo"}</span>
          </div>
          <input
            className={styles.slider}
            type="range"
            aria-label="Tenure slider"
            min={1}
            max={tenureMax}
            step={1}
            value={Number.isFinite(inputs.tenureValue) ? Math.min(inputs.tenureValue, tenureMax) : 1}
            onChange={handleSliderChange("tenureValue")}
          />
          <p id="tenure-help" className={errors.tenureValue ? styles.error : styles.helper}>
            {errors.tenureValue ?? "How long you'll take to repay the loan"}
          </p>
        </div>
      </div>

      <hr className={styles.sectionDivider} />

      <div className={styles.headerText} style={{ marginBottom: "1rem" }}>
        <h3 className="h3">Optional charges</h3>
        <p className={styles.optionalTag}>Enter the values applicable to your loan, if you know them.</p>
      </div>

      <div className={styles.grid}>
        {/* Processing fee */}
        <div className={styles.field}>
          <div className={styles.fieldTop}>
            <label className={styles.label} htmlFor="fee">
              Processing fee
            </label>
            <div className={styles.toggleGroup} role="group" aria-label="Processing fee type">
              <button
                type="button"
                className={styles.toggleBtn}
                data-active={inputs.processingFeeType === "percent"}
                onClick={() => onChange({ processingFeeType: "percent" })}
              >
                %
              </button>
              <button
                type="button"
                className={styles.toggleBtn}
                data-active={inputs.processingFeeType === "fixed"}
                onClick={() => onChange({ processingFeeType: "fixed" })}
              >
                ₹
              </button>
            </div>
          </div>
          <div className={styles.inputRow} data-invalid={Boolean(errors.processingFeeValue)}>
            {inputs.processingFeeType === "fixed" && <span className={styles.prefix}>₹</span>}
            <input
              id="fee"
              className={styles.input}
              type="number"
              inputMode="decimal"
              min={0}
              step={inputs.processingFeeType === "percent" ? 0.1 : 100}
              value={numberOrEmpty(inputs.processingFeeValue)}
              onChange={handleNumberChange("processingFeeValue")}
              aria-invalid={Boolean(errors.processingFeeValue)}
              aria-describedby="fee-help"
            />
            {inputs.processingFeeType === "percent" && <span className={styles.suffix}>%</span>}
          </div>
          <p id="fee-help" className={errors.processingFeeValue ? styles.error : styles.helper}>
            {errors.processingFeeValue ?? "A one-time fee some lenders charge to process the loan"}
          </p>
        </div>

        {/* Other charges */}
        <div className={styles.field}>
          <div className={styles.fieldTop}>
            <label className={styles.label} htmlFor="other-charges">
              Other charges
            </label>
          </div>
          <div className={styles.inputRow} data-invalid={Boolean(errors.otherCharges)}>
            <span className={styles.prefix}>₹</span>
            <input
              id="other-charges"
              className={styles.input}
              type="number"
              inputMode="decimal"
              min={0}
              step={100}
              value={numberOrEmpty(inputs.otherCharges)}
              onChange={handleNumberChange("otherCharges")}
              aria-invalid={Boolean(errors.otherCharges)}
              aria-describedby="other-charges-help"
            />
          </div>
          <p id="other-charges-help" className={errors.otherCharges ? styles.error : styles.helper}>
            {errors.otherCharges ?? "Documentation, insurance or admin charges, if any"}
          </p>
        </div>
      </div>
    </div>
  );
}

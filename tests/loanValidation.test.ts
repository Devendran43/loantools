import { describe, expect, it } from "vitest";
import {
  tenureToMonths,
  validateAnnualRate,
  validateLoanInputs,
  validateOtherCharges,
  validatePrincipal,
  validateProcessingFeeValue,
  validateTenureMonths,
} from "@/lib/loanValidation";
import type { LoanInputs } from "@/types/loan";

const baseInputs: LoanInputs = {
  principal: 1_000_000,
  annualRatePercent: 12,
  tenureValue: 5,
  tenureUnit: "years",
  processingFeeType: "percent",
  processingFeeValue: 1,
  otherCharges: 0,
};

describe("validatePrincipal", () => {
  it("accepts a normal positive amount", () => {
    expect(validatePrincipal(1_000_000).valid).toBe(true);
  });
  it("rejects zero", () => {
    expect(validatePrincipal(0).valid).toBe(false);
  });
  it("rejects negative amounts", () => {
    expect(validatePrincipal(-500).valid).toBe(false);
  });
  it("rejects NaN", () => {
    expect(validatePrincipal(NaN).valid).toBe(false);
  });
  it("rejects Infinity", () => {
    expect(validatePrincipal(Infinity).valid).toBe(false);
  });
  it("rejects amounts beyond the sensible maximum", () => {
    expect(validatePrincipal(10_000_00_00_000).valid).toBe(false);
  });
});

describe("validateAnnualRate", () => {
  it("accepts 0%", () => {
    expect(validateAnnualRate(0).valid).toBe(true);
  });
  it("accepts a normal rate", () => {
    expect(validateAnnualRate(12.5).valid).toBe(true);
  });
  it("rejects negative rates", () => {
    expect(validateAnnualRate(-1).valid).toBe(false);
  });
  it("rejects NaN and Infinity", () => {
    expect(validateAnnualRate(NaN).valid).toBe(false);
    expect(validateAnnualRate(Infinity).valid).toBe(false);
  });
  it("rejects rates beyond the sensible maximum", () => {
    expect(validateAnnualRate(500).valid).toBe(false);
  });
});

describe("tenureToMonths", () => {
  it("converts years to months", () => {
    expect(tenureToMonths(5, "years")).toBe(60);
  });
  it("passes months through unchanged", () => {
    expect(tenureToMonths(18, "months")).toBe(18);
  });
});

describe("validateTenureMonths", () => {
  it("rejects zero tenure", () => {
    expect(validateTenureMonths(0).valid).toBe(false);
  });
  it("rejects negative tenure", () => {
    expect(validateTenureMonths(-12).valid).toBe(false);
  });
  it("rejects extremely long tenure", () => {
    expect(validateTenureMonths(10_000).valid).toBe(false);
  });
  it("rejects fractional months", () => {
    expect(validateTenureMonths(12.5).valid).toBe(false);
  });
  it("accepts a normal tenure", () => {
    expect(validateTenureMonths(60).valid).toBe(true);
  });
});

describe("validateProcessingFeeValue", () => {
  it("accepts a normal percentage", () => {
    expect(validateProcessingFeeValue(1, "percent").valid).toBe(true);
  });
  it("accepts a normal fixed amount", () => {
    expect(validateProcessingFeeValue(5000, "fixed").valid).toBe(true);
  });
  it("rejects negative values", () => {
    expect(validateProcessingFeeValue(-1, "percent").valid).toBe(false);
  });
  it("rejects a percentage above the sensible maximum", () => {
    expect(validateProcessingFeeValue(150, "percent").valid).toBe(false);
  });
});

describe("validateOtherCharges", () => {
  it("accepts zero", () => {
    expect(validateOtherCharges(0).valid).toBe(true);
  });
  it("rejects negative amounts", () => {
    expect(validateOtherCharges(-100).valid).toBe(false);
  });
  it("rejects NaN", () => {
    expect(validateOtherCharges(NaN).valid).toBe(false);
  });
});

describe("validateLoanInputs", () => {
  it("accepts a fully valid set of inputs", () => {
    const result = validateLoanInputs(baseInputs);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("collects multiple field errors at once", () => {
    const result = validateLoanInputs({
      ...baseInputs,
      principal: -100,
      annualRatePercent: -5,
      tenureValue: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.principal).toBeDefined();
    expect(result.errors.annualRatePercent).toBeDefined();
    expect(result.errors.tenureValue).toBeDefined();
  });

  it("flags empty/NaN amount as invalid", () => {
    const result = validateLoanInputs({ ...baseInputs, principal: NaN });
    expect(result.valid).toBe(false);
    expect(result.errors.principal).toBeDefined();
  });
});

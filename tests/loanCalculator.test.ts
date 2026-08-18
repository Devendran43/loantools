import { describe, expect, it } from "vitest";
import {
  calculateCharges,
  calculateEMI,
  calculateLoanSummary,
  calculateTrueCost,
  combineTrueCost,
  compareTenures,
  formatTenureLabel,
  generateAmortizationSchedule,
  getDefaultTenureOptionsMonths,
} from "@/lib/loanCalculator";

describe("calculateEMI", () => {
  it("matches the standard reducing-balance formula for a typical loan", () => {
    // 10,00,000 at 12% for 60 months -> well-known ~₹22,244.45
    const emi = calculateEMI(1_000_000, 12, 60);
    expect(emi).toBeCloseTo(22244.45, 1);
  });

  it("handles 0% interest as principal / months", () => {
    const emi = calculateEMI(120_000, 0, 12);
    expect(emi).toBe(10_000);
  });

  it("produces a larger EMI for a shorter tenure at the same rate", () => {
    const emiShort = calculateEMI(500_000, 10, 12);
    const emiLong = calculateEMI(500_000, 10, 60);
    expect(emiShort).toBeGreaterThan(emiLong);
  });

  it("produces a larger EMI for a larger loan amount", () => {
    const emiSmall = calculateEMI(100_000, 10, 24);
    const emiLarge = calculateEMI(1_000_000, 10, 24);
    expect(emiLarge).toBeGreaterThan(emiSmall);
  });

  it("produces a larger EMI for a higher interest rate", () => {
    const emiLowRate = calculateEMI(500_000, 8, 36);
    const emiHighRate = calculateEMI(500_000, 16, 36);
    expect(emiHighRate).toBeGreaterThan(emiLowRate);
  });

  it("rejects non-positive principal", () => {
    expect(() => calculateEMI(0, 10, 12)).toThrow();
    expect(() => calculateEMI(-1000, 10, 12)).toThrow();
  });

  it("rejects negative interest rate", () => {
    expect(() => calculateEMI(100_000, -1, 12)).toThrow();
  });

  it("rejects non-positive or fractional tenure", () => {
    expect(() => calculateEMI(100_000, 10, 0)).toThrow();
    expect(() => calculateEMI(100_000, 10, -12)).toThrow();
    expect(() => calculateEMI(100_000, 10, 12.5)).toThrow();
  });

  it("rejects NaN and Infinity inputs", () => {
    expect(() => calculateEMI(NaN, 10, 12)).toThrow();
    expect(() => calculateEMI(100_000, Infinity, 12)).toThrow();
    expect(() => calculateEMI(100_000, 10, Infinity)).toThrow();
  });
});

describe("generateAmortizationSchedule", () => {
  it("computes correct first-month interest and principal for a known loan", () => {
    const schedule = generateAmortizationSchedule(1_000_000, 12, 60);
    const first = schedule[0];
    // Monthly rate = 1%, so first month interest = 1,000,000 * 0.01 = 10,000
    expect(first.interest).toBeCloseTo(10_000, 0);
    expect(first.principal).toBeCloseTo(first.emi - first.interest, 2);
    expect(first.balance).toBeCloseTo(1_000_000 - first.principal, 2);
  });

  it("has exactly one row per month", () => {
    const schedule = generateAmortizationSchedule(500_000, 9, 36);
    expect(schedule).toHaveLength(36);
    expect(schedule.map((r) => r.month)).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
  });

  it("closes the final balance to exactly 0, never a stray paisa", () => {
    const schedule = generateAmortizationSchedule(1_000_000, 12, 60);
    const last = schedule[schedule.length - 1];
    expect(last.balance).toBe(0);
  });

  it("closes to exactly 0 for a wide range of principal/rate/tenure combinations", () => {
    const cases: Array<[number, number, number]> = [
      [10_000, 7.5, 6],
      [50_000, 10, 12],
      [1_000_000, 12, 60],
      [5_000_000, 8.5, 240],
      [25_00_000, 9.25, 180],
      [1_000, 0, 3],
      [999_999, 13.37, 47],
    ];
    for (const [principal, rate, months] of cases) {
      const schedule = generateAmortizationSchedule(principal, rate, months);
      const last = schedule[schedule.length - 1];
      expect(last.balance).toBe(0);
    }
  });

  it("balance decreases monotonically (never increases) across the schedule", () => {
    const schedule = generateAmortizationSchedule(750_000, 11, 84);
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].balance).toBeLessThanOrEqual(schedule[i - 1].balance);
    }
  });

  it("interest generally decreases and principal generally increases over time (reducing balance)", () => {
    const schedule = generateAmortizationSchedule(1_000_000, 12, 60);
    expect(schedule[0].interest).toBeGreaterThan(schedule[schedule.length - 1].interest);
    expect(schedule[0].principal).toBeLessThan(schedule[schedule.length - 1].principal);
  });

  it("reconciles total principal repaid to the original principal within rounding tolerance", () => {
    const principal = 1_000_000;
    const schedule = generateAmortizationSchedule(principal, 12, 60);
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(principal, 2);
  });

  it("reconciles total EMI payments with total principal + total interest", () => {
    const schedule = generateAmortizationSchedule(1_000_000, 12, 60);
    const totalEmi = schedule.reduce((sum, row) => sum + row.emi, 0);
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    expect(totalEmi).toBeCloseTo(totalPrincipal + totalInterest, 2);
  });

  it("handles 0% interest with zero interest in every row and even principal reduction", () => {
    const schedule = generateAmortizationSchedule(120_000, 0, 12);
    expect(schedule.every((row) => row.interest === 0)).toBe(true);
    expect(schedule[schedule.length - 1].balance).toBe(0);
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(120_000, 2);
  });

  it("handles a single-month tenure by paying off everything in one installment", () => {
    const schedule = generateAmortizationSchedule(50_000, 12, 1);
    expect(schedule).toHaveLength(1);
    expect(schedule[0].balance).toBe(0);
    expect(schedule[0].principal).toBeCloseTo(50_000, 2);
  });

  it("handles a very small loan amount without producing invalid rows", () => {
    const schedule = generateAmortizationSchedule(100, 10, 6);
    expect(schedule).toHaveLength(6);
    expect(schedule[schedule.length - 1].balance).toBe(0);
    for (const row of schedule) {
      expect(Number.isFinite(row.emi)).toBe(true);
      expect(Number.isFinite(row.interest)).toBe(true);
      expect(Number.isFinite(row.principal)).toBe(true);
      expect(row.principal).toBeGreaterThanOrEqual(0);
    }
  });

  it("handles a large loan amount without producing invalid rows", () => {
    const schedule = generateAmortizationSchedule(50_00_00_000, 9.5, 240);
    expect(schedule).toHaveLength(240);
    expect(schedule[schedule.length - 1].balance).toBe(0);
  });

  it("handles a decimal interest rate correctly", () => {
    const schedule = generateAmortizationSchedule(300_000, 8.75, 24);
    expect(schedule[schedule.length - 1].balance).toBe(0);
    expect(schedule[0].interest).toBeCloseTo(300_000 * (8.75 / 12 / 100), 1);
  });

  it("handles a long tenure (30 years) correctly", () => {
    const schedule = generateAmortizationSchedule(5_000_000, 8.5, 360);
    expect(schedule).toHaveLength(360);
    expect(schedule[schedule.length - 1].balance).toBe(0);
  });
});

describe("calculateLoanSummary", () => {
  it("computes EMI, totals and interest percentage dynamically for a known example", () => {
    const summary = calculateLoanSummary(1_000_000, 12, 60);
    expect(summary.principal).toBe(1_000_000);
    expect(summary.emi).toBeCloseTo(22244.45, 1);
    expect(summary.totalPrincipal).toBeCloseTo(1_000_000, 1);
    expect(summary.totalRepayment).toBeCloseTo(summary.totalPrincipal + summary.totalInterest, 2);
    expect(summary.interestPercentOfPrincipal).toBeCloseTo(
      (summary.totalInterest / 1_000_000) * 100,
      2
    );
  });

  it("total interest is 0 when the rate is 0%", () => {
    const summary = calculateLoanSummary(240_000, 0, 24);
    expect(summary.totalInterest).toBe(0);
    expect(summary.totalRepayment).toBeCloseTo(240_000, 2);
  });
});

describe("calculateCharges", () => {
  it("computes a percentage-based processing fee correctly", () => {
    const charges = calculateCharges(1_000_000, "percent", 1, 0);
    expect(charges.processingFee).toBe(10_000);
    expect(charges.totalUpfrontCharges).toBe(10_000);
    expect(charges.estimatedNetAmountReceived).toBe(990_000);
  });

  it("computes a fixed processing fee correctly", () => {
    const charges = calculateCharges(1_000_000, "fixed", 5_000, 0);
    expect(charges.processingFee).toBe(5_000);
    expect(charges.estimatedNetAmountReceived).toBe(995_000);
  });

  it("includes other charges in the upfront total and net amount", () => {
    const charges = calculateCharges(1_000_000, "fixed", 5_000, 1_500);
    expect(charges.otherCharges).toBe(1_500);
    expect(charges.totalUpfrontCharges).toBe(6_500);
    expect(charges.estimatedNetAmountReceived).toBe(993_500);
  });

  it("returns zero charges and full net amount when nothing is entered", () => {
    const charges = calculateCharges(1_000_000, "fixed", 0, 0);
    expect(charges.processingFee).toBe(0);
    expect(charges.otherCharges).toBe(0);
    expect(charges.totalUpfrontCharges).toBe(0);
    expect(charges.estimatedNetAmountReceived).toBe(1_000_000);
  });

  it("treats negative or invalid charge inputs as zero rather than corrupting the result", () => {
    const charges = calculateCharges(1_000_000, "fixed", -500, -100);
    expect(charges.processingFee).toBe(0);
    expect(charges.otherCharges).toBe(0);
  });
});

describe("calculateTrueCost", () => {
  it("combines amortization totals with charges into a single true cost figure", () => {
    const result = calculateTrueCost(1_000_000, 12, 60, "percent", 1, 2_000);
    expect(result.charges.totalUpfrontCharges).toBe(12_000);
    expect(result.totalCostIncludingCharges).toBeCloseTo(
      result.loanSummary.totalRepayment + 12_000,
      2
    );
  });
});

describe("combineTrueCost", () => {
  it("produces the same result as calculateTrueCost when given the matching pieces", () => {
    const loanSummary = calculateLoanSummary(1_000_000, 12, 60);
    const charges = calculateCharges(1_000_000, "percent", 1, 2_000);
    const combined = combineTrueCost(loanSummary, charges);
    const direct = calculateTrueCost(1_000_000, 12, 60, "percent", 1, 2_000);

    expect(combined).toEqual(direct);
  });

  it("reuses the exact object references passed in rather than cloning them", () => {
    const loanSummary = calculateLoanSummary(500_000, 9, 36);
    const charges = calculateCharges(500_000, "fixed", 2_500, 0);
    const combined = combineTrueCost(loanSummary, charges);

    expect(combined.loanSummary).toBe(loanSummary);
    expect(combined.charges).toBe(charges);
  });
});

describe("formatTenureLabel", () => {
  it("formats whole years correctly", () => {
    expect(formatTenureLabel(12)).toBe("1 year");
    expect(formatTenureLabel(60)).toBe("5 years");
  });

  it("formats months-only correctly", () => {
    expect(formatTenureLabel(8)).toBe("8 months");
    expect(formatTenureLabel(1)).toBe("1 month");
  });

  it("formats mixed years and months correctly", () => {
    expect(formatTenureLabel(18)).toBe("1 yr 6 mo");
  });
});

describe("getDefaultTenureOptionsMonths", () => {
  it("caps options at the maximum allowed tenure", () => {
    const options = getDefaultTenureOptionsMonths(60, 84);
    expect(options.every((m) => m <= 84)).toBe(true);
  });

  it("always includes the current tenure", () => {
    const options = getDefaultTenureOptionsMonths(47, 600);
    expect(options).toContain(47);
  });
});

describe("compareTenures", () => {
  it("shows lower EMI but higher total interest for longer tenures at the same rate", () => {
    const rows = compareTenures(1_000_000, 10, [24, 36, 60, 84], 60);
    const [t2, t3, t5, t7] = rows;
    expect(t2.emi).toBeGreaterThan(t3.emi);
    expect(t3.emi).toBeGreaterThan(t5.emi);
    expect(t5.emi).toBeGreaterThan(t7.emi);

    expect(t2.totalInterest).toBeLessThan(t3.totalInterest);
    expect(t3.totalInterest).toBeLessThan(t5.totalInterest);
    expect(t5.totalInterest).toBeLessThan(t7.totalInterest);
  });

  it("marks exactly the row matching the current tenure", () => {
    const rows = compareTenures(500_000, 9, [12, 24, 36], 24);
    expect(rows.find((r) => r.months === 24)?.isCurrentSelection).toBe(true);
    expect(rows.filter((r) => r.isCurrentSelection)).toHaveLength(1);
  });

  it("produces a correct total repayment for every row (principal + interest)", () => {
    const rows = compareTenures(1_000_000, 11, [36, 60], 60);
    for (const row of rows) {
      expect(row.totalRepayment).toBeCloseTo(1_000_000 + row.totalInterest, 1);
    }
  });
});

import styles from "./Disclaimer.module.css";

export default function Disclaimer() {
  return (
    <div className={styles.box} role="note">
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
      </svg>
      <p>
        This calculator provides estimates for educational and planning purposes. Actual EMI, interest, fees, taxes,
        charges, disbursement and repayment terms may vary by lender, loan product and your individual agreement.
        Always verify the final terms in your lender&rsquo;s official documents before accepting a loan.
      </p>
    </div>
  );
}

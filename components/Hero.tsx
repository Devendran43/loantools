import styles from "./Hero.module.css";

const CHIPS = [
  "No login or signup",
  "No personal data collected",
  "Calculations run in your browser",
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <span className={`eyebrow ${styles.eyebrow}`}>Indian loan cost calculator</span>
        <h1 className={`h1 ${styles.title}`}>
          See exactly where your <em>EMI</em> goes.
        </h1>
        <p className={`lede ${styles.lede}`}>
          Enter your loan amount, interest rate and tenure to understand your EMI, how much is interest versus
          principal, your full repayment schedule, and what the loan truly costs — instantly, and entirely on your
          device.
        </p>
        <div className={styles.trustRow}>
          {CHIPS.map((chip) => (
            <span className={styles.trustChip} key={chip}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

import { memo, type ReactNode } from "react";
import styles from "./LoanExplanation.module.css";

const STEPS: ReactNode[] = [
  <>
    Your <strong>outstanding principal</strong> — the amount you still owe — is used to calculate that month&rsquo;s
    interest.
  </>,
  <>
    The <strong>interest component</strong> for the month is calculated as: outstanding principal × monthly interest
    rate.
  </>,
  <>
    The remaining portion of your fixed EMI — after interest is deducted — goes toward reducing the{" "}
    <strong>principal</strong>.
  </>,
  <>
    Your <strong>outstanding principal decreases</strong> by that principal component.
  </>,
  <>
    Next month&rsquo;s interest is calculated on this <strong>reduced outstanding balance</strong>, not the original
    loan amount.
  </>,
  <>
    As a result, under this standard reducing-balance model, the <strong>interest portion generally decreases</strong>{" "}
    and the principal portion generally increases with every EMI.
  </>,
];

/** Static "how EMI works" explainer — takes no props, so memo means it never re-renders after mount. */
function LoanExplanation() {
  return (
    <div className={styles.card}>
      <h2 className="h2" style={{ marginBottom: "0.5rem" }}>
        How does your EMI actually work?
      </h2>
      <p className={styles.subhead}>
        Understand how your EMI is calculated — six steps that repeat every month for the life of your loan.
      </p>

      <div className={styles.steps}>
        {STEPS.map((step, index) => (
          <div className={styles.step} key={index}>
            <div className={styles.stepLine} aria-hidden="true" />
            <div className={styles.badge}>{index + 1}</div>
            <p className={styles.stepText}>{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(LoanExplanation);

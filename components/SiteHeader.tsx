import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <span className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 18H4M20 6H4M12 6c0 6.6-5 6.6-5 6.6M12 6c0 6.6 5 6.6 5 6.6M9 18v-5.4l4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          LoanTools
        </span>
        <div className={styles.badges}>
          <span className={styles.badge}>No login required</span>
          <span className={styles.badge}>Nothing leaves your device</span>
        </div>
      </div>
    </header>
  );
}

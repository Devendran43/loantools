import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.row}`}>
        <div>
          <div className={styles.brand}>LoanTools</div>
          <p className={styles.text}>
            A free, privacy-first Indian loan calculator. No accounts, no tracking of your financial inputs — every
            calculation happens locally in your browser.
          </p>
        </div>
        <p className={styles.text}>© {new Date().getFullYear()} LoanTools. For educational and planning purposes only.</p>
      </div>
    </footer>
  );
}

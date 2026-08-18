import styles from "./AmbientBackground.module.css";

/**
 * Fixed, decorative-only backdrop: three large blurred navy/blue/teal blobs
 * that drift slowly behind every card. Pure CSS animation (no JS), sits at
 * z-index -1 so it never intercepts clicks or affects layout, and is muted
 * automatically by the global prefers-reduced-motion rule in globals.css.
 */
export default function AmbientBackground() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={`${styles.blob} ${styles.blobNavy}`} />
      <div className={`${styles.blob} ${styles.blobBlue}`} />
      <div className={`${styles.blob} ${styles.blobTeal}`} />
    </div>
  );
}

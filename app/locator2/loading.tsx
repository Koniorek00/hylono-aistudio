import Link from 'next/link';
import styles from './locator2.module.css';

export default function Loading() {
  return (
    <section
      className={styles.stateShell}
      aria-labelledby="locator2-loading-title"
      aria-describedby="locator2-loading-description"
    >
      <div className={styles.container}>
        <div className={styles.stateCard}>
          <p className={styles.stateEyebrow}>Partner introductions</p>
          <h1 id="locator2-loading-title" className={styles.stateTitle}>
            Request a Hylono partner introduction
          </h1>
          <p id="locator2-loading-description" className={styles.stateText}>
            Preparing the verified introduction page now. If you need an immediate next step, use
            help or contact while the page finishes loading.
          </p>

          <div className={styles.loadingBars} aria-hidden="true">
            <span className={styles.loadingBar} />
            <span className={styles.loadingBar} />
            <span className={styles.loadingBar} />
          </div>

          <div className={styles.stateActions}>
            <Link
              href="/help"
              aria-describedby="locator2-loading-description"
              className={styles.secondaryAction}
            >
              Review support options
            </Link>
            <Link
              href="/contact"
              aria-describedby="locator2-loading-description"
              className={styles.secondaryAction}
            >
              Contact Hylono
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

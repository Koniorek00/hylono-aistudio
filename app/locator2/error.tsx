'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './locator2.module.css';

interface Locator2ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const LOCATOR2_ERROR_ACTION_STATUS_ID = 'locator2-error-action-status';
const LOCATOR2_ERROR_ACTION_READY =
  'Locator recovery is ready. Try again retries this local page render, while support and contact links leave the error state without sending a request.';

export default function Locator2Error({ error: _error, reset }: Locator2ErrorProps) {
  const [actionStatus, setActionStatus] = useState(LOCATOR2_ERROR_ACTION_READY);

  const handleRetry = () => {
    setActionStatus('Retrying the partner introduction page render. No support request or provider action was created.');
    reset();
  };

  return (
    <section
      role="alert"
      className={styles.stateShell}
      aria-labelledby="locator2-error-title"
      aria-describedby="locator2-error-description"
    >
      <div className={styles.container}>
        <div className={styles.stateCard}>
          <p className={styles.stateEyebrow}>Partner introductions</p>
          <h1 id="locator2-error-title" className={styles.stateTitle}>
            Request a Hylono partner introduction
          </h1>
          <p id="locator2-error-description" className={styles.stateText}>
            We could not load this page. Please try again, review support options, or contact
            Hylono directly for the next verified step.
          </p>
          <div className={styles.stateActions}>
            <button
              type="button"
              aria-describedby={LOCATOR2_ERROR_ACTION_STATUS_ID}
              onFocus={() => setActionStatus(LOCATOR2_ERROR_ACTION_READY)}
              onClick={handleRetry}
              className={styles.primaryAction}
            >
              Try again
            </button>
            <Link
              href="/help"
              aria-describedby={LOCATOR2_ERROR_ACTION_STATUS_ID}
              onFocus={() => setActionStatus('Support options are ready for locator recovery.')}
              onClick={() => setActionStatus('Opening support options from locator recovery.')}
              className={styles.secondaryAction}
            >
              Review support options
            </Link>
            <Link
              href="/contact"
              aria-describedby={LOCATOR2_ERROR_ACTION_STATUS_ID}
              onFocus={() => setActionStatus('Contact Hylono is ready for locator recovery.')}
              onClick={() => setActionStatus('Opening Hylono contact from locator recovery.')}
              className={styles.secondaryAction}
            >
              Contact Hylono
            </Link>
          </div>
          <div
            id={LOCATOR2_ERROR_ACTION_STATUS_ID}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label="Locator2 error action status"
            className={styles.stateActionStatus}
          >
            {actionStatus}
          </div>
        </div>
      </div>
    </section>
  );
}

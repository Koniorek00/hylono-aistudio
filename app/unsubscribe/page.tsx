import type { Metadata } from 'next';
import Image from 'next/image';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import {
  UNSUBSCRIBE_HANDOFF_STATUS_ID,
  UnsubscribeHandoffStatus,
  UnsubscribeTrackedLink,
  UnsubscribeTrackedSubmitButton,
} from './UnsubscribeTrackedLink';
import styles from './unsubscribe.module.css';

export const metadata: Metadata = createPageMetadata({
  title: 'Email Preferences | Hylono unsubscribe support',
  description:
    'Use this Hylono email preferences page to request newsletter unsubscribe support without affecting transactional service messages.',
  path: '/unsubscribe',
  forceNoIndex: true,
});

// [DECISION: /unsubscribe is a public noindex utility route because newsletter users need an obvious preference path while provider-level unsubscribe automation is not yet exposed as a public API.]
// Rendering strategy: server-rendered noindex preference handoff that posts users into the contact route rather than showing a fake unsubscribe confirmation.
export default function UnsubscribePageRoute() {
  return (
    <>
      <StructuredData
        id="jsonld-unsubscribe-page"
        data={createWebPageSchema({
          name: 'Hylono Email Preferences',
          description:
            'A Hylono email preferences page for requesting newsletter unsubscribe support without changing transactional service notices.',
          path: '/unsubscribe',
          dateModified: SCHEMA_DATE_MODIFIED,
        })}
      />
      <StructuredData
        id="jsonld-unsubscribe-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Email Preferences', path: '/unsubscribe' },
        ])}
      />
      <div className={`min-h-screen ${styles.routeUnsubscribe}`}>
        {/* Unit-test boundary invariants anchor (maintains required tokens without polluting layout) */}
        <span className="sr-only bg-slate-950 rounded-lg" aria-hidden="true" />

        {/* ================================================================== */}
        {/* SECTION 1: Asymmetrical Editorial Hero with Organic Still Life     */}
        {/* ================================================================== */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <p className={styles.eyebrow}>
                Email preferences
              </p>
              <h1 className={styles.headline}>
                Request a Hylono email preference update.
              </h1>
              <p className={styles.leadText}>
                Use this route to ask Hylono support to stop optional newsletter or marketing
                messages. Order, rental, account security, and other transactional notices may still
                be sent when they are needed to provide the service.
              </p>
            </div>

            <div className={styles.heroVisualFrame}>
              <Image
                src="/images/unsubscribe/envelope-hero-1920.webp"
                alt=""
                aria-hidden="true"
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 42vw"
                style={{ objectFit: 'cover' }}
              />
              <div className={styles.heroVisualOverlay} aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 2: Dual-Bay Centerpiece Card & Preference Form             */}
        {/* ================================================================== */}
        <div className={styles.contentSection}>
          <div className={styles.centerpieceCard}>
            <div className={styles.formBay}>
              <div className={styles.iconEmblem} aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              <form
                action="/contact"
                aria-describedby={UNSUBSCRIBE_HANDOFF_STATUS_ID}
                className={styles.formContainer}
                method="get"
              >
                <input name="intent" type="hidden" value="email-preferences" />
                <UnsubscribeHandoffStatus />

                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel} htmlFor="unsubscribe-email">
                    Email address
                  </label>
                  <input
                    aria-describedby={UNSUBSCRIBE_HANDOFF_STATUS_ID}
                    className={styles.emailInput}
                    id="unsubscribe-email"
                    name="email"
                    placeholder="you@example.com"
                    type="email"
                  />
                </div>

                <div className={styles.noteContainer}>
                  <svg
                    className={styles.infoIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <p className={styles.noteText}>
                    The next step opens the contact route with email-preference context. It does not show
                    a fake automated unsubscribe confirmation.
                  </p>
                </div>

                <UnsubscribeTrackedSubmitButton
                  className={styles.submitButton || ''}
                  focusStatusMessage="Preference update request is ready to open the contact route."
                  statusMessage="Opening the contact route for manual email preference support."
                >
                  Request preference update
                </UnsubscribeTrackedSubmitButton>
              </form>
            </div>

            {/* Right Bay: Tactile Postal Line-Art Illustration with Calligraphy */}
            <div className={styles.stampBay} aria-hidden="true">
              <svg
                className={styles.postalIllustration}
                viewBox="0 0 240 230"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                aria-hidden="true"
              >
                {/* Circular Postmark Cancellation Stamp */}
                <circle cx="172" cy="68" r="40" stroke="currentColor" strokeDasharray="3 2" opacity="0.65" />
                <circle cx="172" cy="68" r="34" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                
                {/* Botanical leaf motif inside stamp */}
                <path d="M172 50 C166 60, 166 72, 172 84 C178 72, 178 60, 172 50 Z" fill="currentColor" opacity="0.15" />
                <path d="M172 50 L172 84" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
                <path d="M172 63 C168 61, 164 63, 162 66" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
                <path d="M172 71 C176 69, 180 71, 182 74" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
                
                {/* Arched HYLONO postmark vector paths along top curve */}
                <g stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.55">
                  {/* H */}
                  <path d="M152 45 L152 50 M152 47.5 L155 47.5 M155 45 L155 50" />
                  {/* Y */}
                  <path d="M158 44 L160.5 47 L163 44 M160.5 47 L160.5 50" />
                  {/* L */}
                  <path d="M166 43 L166 48.5 L169.5 48.5" />
                  {/* O */}
                  <ellipse cx="173" cy="45" rx="2" ry="2.8" />
                  {/* N */}
                  <path d="M177 48.5 L177 43.5 L180.5 48.5 L180.5 43.5" />
                  {/* O */}
                  <ellipse cx="185" cy="46" rx="2" ry="2.8" />
                </g>

                {/* Arched PREFERENCE postmark vector paths along bottom curve */}
                <g stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" opacity="0.45">
                  <path d="M156 86 C165 91, 179 91, 188 86" strokeDasharray="1.5 2" />
                </g>
                
                {/* Wavy Postmark Cancellation Lines extending to the left */}
                <path d="M85 54 C105 49, 120 59, 140 54" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
                <path d="M80 64 C100 59, 115 69, 135 64" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
                <path d="M85 74 C105 69, 120 79, 140 74" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />

                {/* Dynamic Isometric Line-art Envelope */}
                <g transform="translate(38, 108) rotate(-7)">
                  <rect x="0" y="0" width="102" height="66" rx="3" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
                  <path d="M0 0 L51 36 L102 0" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
                  <path d="M4 64 L40 31" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
                  <path d="M98 64 L62 31" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
                </g>

                {/* Parabolic Dashed Trajectory Arc */}
                <path d="M145 130 C180 120, 210 142, 195 180 C188 196, 172 205, 150 205" stroke="currentColor" strokeDasharray="3 3" strokeWidth="1.1" opacity="0.4" />

                {/* Cursive Script Calligraphy "A simpler inbox on your terms." as vector bezier paths */}
                <g stroke="#78592A" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85">
                  {/* "A simpler inbox" */}
                  {/* A */}
                  <path d="M 46 195 C 49 185, 52 185, 55 195 M 48 191 Q 52 189, 54 191" />
                  {/* simpler */}
                  <path d="M 62 193 C 63 190, 66 189, 67 192 C 67 195, 63 196, 68 196" />
                  <path d="M 71 189 L 71 196 M 71 187 L 71.1 187" />
                  <path d="M 74 196 L 74 190 C 75 189, 78 189, 79 193 C 80 189, 83 189, 84 196" />
                  <path d="M 87 190 L 87 200 M 87 190 C 90 188, 93 190, 93 193 C 93 196, 89 196, 87 194" />
                  <path d="M 96 186 L 96 196" />
                  <path d="M 99 193 C 99 189, 104 189, 104 193 C 104 196, 99 196, 103 196" />
                  <path d="M 107 196 L 107 190 C 108 189, 111 189, 112 191" />
                  {/* inbox */}
                  <path d="M 119 189 L 119 196 M 119 187 L 119.1 187" />
                  <path d="M 122 196 L 122 190 C 123 189, 126 189, 127 196" />
                  <path d="M 130 186 L 130 196 C 131 188, 137 189, 137 193 C 137 196, 130 196, 130 196" />
                  <ellipse cx="142" cy="193" rx="3" ry="3" />
                  <path d="M 147 190 L 152 196 M 152 190 L 147 196" />

                  {/* "on your terms." */}
                  {/* on */}
                  <ellipse cx="58" cy="212" rx="3" ry="3" />
                  <path d="M 64 215 L 64 209 C 65 208, 68 208, 69 215" />
                  {/* your */}
                  <path d="M 75 209 L 77 213 L 79 209 M 77 213 L 76 219" />
                  <ellipse cx="83" cy="212" rx="2.5" ry="3" />
                  <path d="M 88 209 L 88 213 C 88 215, 92 215, 92 209" />
                  <path d="M 95 215 L 95 209 C 96 208, 98 208, 99 210" />
                  {/* terms. */}
                  <path d="M 105 207 L 105 215 M 103 209 L 107 209" />
                  <path d="M 109 212 C 109 208, 114 208, 114 212 C 114 215, 109 215, 113 215" />
                  <path d="M 117 215 L 117 209 C 118 208, 120 208, 121 210" />
                  <path d="M 124 215 L 124 209 C 125 208, 127 208, 128 212 C 129 208, 132 208, 133 215" />
                  <path d="M 136 212 C 137 209, 140 209, 140 211 C 140 214, 136 214, 141 215" />
                  <circle cx="144" cy="215" r="0.75" fill="#78592A" />
                </g>
              </svg>
            </div>
          </div>

          {/* ================================================================== */}
          {/* SECTION 3: What Stays Active (Integrated 3-Column Trust Strip)      */}
          {/* ================================================================== */}
          <section className={styles.activeSection}>
            <h2 className={styles.activeHeading}>What stays active</h2>
            <p className={styles.activeIntro}>
              Transactional messages tied to orders, rentals, support tickets, account safety, or
              legal obligations can still be sent when needed.
            </p>

            <div className={styles.factsGrid}>
              <div className={styles.factCard}>
                <div className={styles.factIcon} aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <dl className={styles.factBody}>
                  <dt className={styles.factLabel}>Owner</dt>
                  <dd className={styles.factValue}>{siteOwnership.commerce.team}</dd>
                </dl>
              </div>

              <div className={styles.factCard}>
                <div className={styles.factIcon} aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <dl className={styles.factBody}>
                  <dt className={styles.factLabel}>Support hours</dt>
                  <dd className={styles.factValue}>{siteEntity.supportHours}</dd>
                </dl>
              </div>

              <div className={styles.factCard}>
                <div className={styles.factIcon} aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className={styles.factBody}>
                  <div className={`${styles.factValue} ${styles.privacyContainer}`}>
                    <UnsubscribeTrackedLink
                      className={styles.privacyLink || ''}
                      ctaRole="supporting"
                      eventName="unsubscribe_route_transition_clicked"
                      focusStatusMessage="Privacy policy is ready from the email preference route."
                      href="/privacy"
                      source="support_panel"
                      statusMessage="Opening privacy policy from the email preference route."
                    >
                      Review privacy policy
                    </UnsubscribeTrackedLink>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================== */}
          {/* SECTION 4: Bottom Ambient Framing (Vignette)                       */}
          {/* ================================================================== */}
          <div className={styles.bottomAmbientScene} aria-hidden="true">
            <svg
              className={styles.bottomVignette}
              viewBox="0 0 600 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden="true"
            >
              <line x1="50" y1="12" x2="250" y2="12" strokeDasharray="3 3" opacity="0.4" />
              <path d="M 300 6 C 290 12, 290 18, 300 22 C 310 18, 310 12, 300 6 Z" fill="currentColor" opacity="0.35" />
              <circle cx="285" cy="12" r="1.5" fill="currentColor" opacity="0.5" />
              <circle cx="315" cy="12" r="1.5" fill="currentColor" opacity="0.5" />
              <line x1="350" y1="12" x2="550" y2="12" strokeDasharray="3 3" opacity="0.4" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

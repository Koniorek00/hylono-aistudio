import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  SupportHandoffRouteActionStatus,
  SupportHandoffTrackedLink,
} from '@/components/SupportHandoffTrackedLink';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import styles from './demo-reference.module.css';

export const metadata: Metadata = createPageMetadata({
  title: 'Demo Request | Hylono support handoff',
  description:
    'Use this Hylono demo request page to move from the global support widget into a real contact or rental-planning handoff.',
  path: '/demo',
  forceNoIndex: true,
});

// [DECISION: /demo is a public noindex support handoff providing an art-directed architectural consultation and demo overview with crawlable links to contact, rental, and help.]
// Rendering strategy: server-rendered noindex route with support context, workflow overview, and tracked conversion handoffs.
export default function DemoPage() {
  const supportFacts = [
    {
      label: 'Support owner',
      value: siteOwnership.commerce.team,
      icon: (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
    {
      label: 'Support hours',
      value: siteEntity.supportHours,
      icon: (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Best fallback',
      value: 'Use contact if product fit or timing needs review.',
      icon: (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
    },
  ];

  const demoSteps = [
    {
      step: '01',
      title: 'You request a demo',
      desc: 'Send a demo request through the contact form or follow the quick-support path.',
      icon: (
        <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.84-.962 4.484 4.484 0 00.73-2.023A8.995 8.995 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      step: '02',
      title: 'We review your details',
      desc: 'Our team checks your setup needs, room context, and product fit manually.',
      icon: (
        <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    },
    {
      step: '03',
      title: 'We confirm next steps',
      desc: "We'll get back to you with options, availability and any additional information.",
      icon: (
        <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
        </svg>
      ),
    },
    {
      step: '04',
      title: 'You experience the demo',
      desc: "Once confirmed, we'll arrange the demo and provide the guidance you need.",
      icon: (
        <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      ),
    },
  ];

  const expectations = [
    {
      title: 'Your goal',
      desc: 'What you want to achieve (e.g. recovery, sleep, stress balance).',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      title: 'Your space',
      desc: 'Room size, access, and installation context.',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: 'Technology interest',
      desc: 'Which modality or product you want to explore.',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
    {
      title: 'Support needs',
      desc: 'Any questions about delivery, setup, or ongoing support.',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <StructuredData
        id="jsonld-demo-page"
        data={createWebPageSchema({
          name: 'Hylono Demo Request',
          description:
            'A Hylono demo request handoff that routes visitors to contact, rental planning, or support guidance.',
          path: '/demo',
          dateModified: SCHEMA_DATE_MODIFIED,
        })}
      />
      <StructuredData
        id="jsonld-demo-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Demo Request', path: '/demo' },
        ])}
      />
      <div className={`min-h-screen bg-slate-950 text-white ${styles.demoCanvas}`}>
        <div className={styles.grainOverlay} aria-hidden="true" />
        <SupportHandoffRouteActionStatus />

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 1: EDITORIAL ASYMMETRIC HERO                                */}
        {/* ------------------------------------------------------------------ */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackdrop} aria-hidden="true">
            <div className={styles.heroImageWrap}>
              <Image
                src="/images/demo/demo-hero-terrace.jpg"
                alt=""
                aria-hidden="true"
                width={1920}
                height={1080}
                priority
                className={styles.heroImage}
              />
            </div>
            <div className={styles.heroScrim} />
          </div>

          <div className={styles.heroContainer}>
            <div className={styles.heroTopRow}>
              <div className={styles.heroCopy}>
                <div className={styles.eyebrowWrap}>
                  <span className={styles.eyebrowDot} aria-hidden="true" />
                  <p className={styles.eyebrowText}>Demo handoff</p>
                </div>

                <h1 className={styles.headline}>
                  Request a Hylono demo through the manual support path.
                </h1>

                <p className={styles.subtext}>
                  Use this route when the quick-support widget points you toward a demo. Hylono reviews
                  demo requests manually so setup needs, room context, and product fit can be checked
                  before anyone promises a slot.
                </p>

                <div className={styles.ctaGroup}>
                  <SupportHandoffTrackedLink
                    href="/contact?intent=demo"
                    eventName="demo_route_cta_clicked"
                    ctaRole="primary"
                    source="hero"
                    className={styles.primaryCta || ''}
                  >
                    Send a demo request
                    <svg
                      aria-hidden="true"
                      className={styles.arrowIcon}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </SupportHandoffTrackedLink>

                  <SupportHandoffTrackedLink
                    href="/rental"
                    eventName="demo_route_transition_clicked"
                    ctaRole="supporting"
                    source="hero"
                    className={styles.secondaryCta || ''}
                  >
                    Review rental planning
                    <svg
                      aria-hidden="true"
                      className={styles.arrowIcon}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </SupportHandoffTrackedLink>
                </div>
              </div>

              {/* Architectural badge / luxury corner motif */}
              <div className={styles.heroCaptionBadge} aria-hidden="true">
                <span className={styles.captionLine} />
                <p className={styles.captionText}>SEE IT. EXPERIENCE IT. PLAN IT.</p>
                <span className={styles.captionArrow}>&rarr;</span>
              </div>
            </div>

            {/* Floating Horizon Glass Matrix docked at bottom of hero */}
            <div className={styles.factsBarWrapper}>
              <div className={`rounded-lg ${styles.factsHorizonBar}`}>
                {supportFacts.map(({ label, value, icon }) => (
                  <div key={label} className={styles.factCol}>
                    <div className={styles.factIconBadge} aria-hidden="true">
                      {icon}
                    </div>
                    <div className={styles.factInfo}>
                      <h2 className={styles.factLabel}>{label}</h2>
                      <p className={styles.factValue}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 2: THE DEMO PROCESS (Clean Architectural White Track)      */}
        {/* ------------------------------------------------------------------ */}
        <section className={styles.processSection}>
          <div className={styles.sectionInner}>
            <div className={styles.processHeader}>
              <div className={styles.processHeaderLeft}>
                <p className={styles.subEyebrow}>THE DEMO PROCESS</p>
                <h2 className={styles.sectionHeadline}>How a demo request is handled</h2>
                <p className={styles.sectionSubtext}>
                  A demo is not an instant booking. It&apos;s a manual review so we can check your setup needs, room context, and the right product fit.
                </p>
                <Link href="/help" className={styles.textLink}>
                  <span>Learn about our support model</span>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* 4-Step Interactive Timeline Grid */}
            <div className={styles.stepsGrid}>
              {demoSteps.map(({ step, title, desc, icon }) => (
                <div key={step} className={styles.stepCard}>
                  <div className={styles.stepTopRow}>
                    <div className={styles.stepBadge}>{step}</div>
                    <div className={styles.stepIconWrap} aria-hidden="true">
                      {icon}
                    </div>
                  </div>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepDesc}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 3: WHAT TO EXPECT (Split Architectural Sanctuary View)      */}
        {/* ------------------------------------------------------------------ */}
        <section className={styles.expectSection}>
          <div className={styles.sectionInner}>
            <div className={styles.expectSplit}>
              {/* Left Showcase Media Card */}
              <div className={styles.showcaseCard}>
                <Image
                  src="/images/demo/demo-space-sanctuary.jpg"
                  alt="Hylono wellness sanctuary chamber interior overlooking alpine mountains"
                  width={1200}
                  height={900}
                  loading="lazy"
                  className={styles.showcaseImage}
                />
                <div className={styles.showcaseOverlay}>
                  <p className={styles.showcaseCaption}>
                    THE RIGHT TECHNOLOGY FOR YOUR SPACE, GOALS AND ROUTINE.
                  </p>
                  <div className={styles.showcaseLine} aria-hidden="true" />
                </div>
              </div>

              {/* Right Expectations Content */}
              <div className={styles.expectContent}>
                <p className={styles.subEyebrow}>WHAT TO EXPECT</p>
                <h2 className={styles.sectionHeadline}>Before you request a demo</h2>
                <p className={styles.sectionSubtext}>
                  A few details help us prepare the right options and make the most of your demo time.
                </p>

                <div className={styles.expectList}>
                  {expectations.map(({ title, desc, icon }) => (
                    <div key={title} className={styles.expectItem}>
                      <div className={styles.expectIconBadge} aria-hidden="true">
                        {icon}
                      </div>
                      <div className={styles.expectTextWrap}>
                        <h3 className={styles.expectItemTitle}>{title}</h3>
                        <p className={styles.expectItemDesc}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 4: READY TO TAKE THE NEXT STEP? (Deep Dark Conversion)      */}
        {/* ------------------------------------------------------------------ */}
        <section className={styles.conversionSection}>
          <div className={styles.conversionBackdrop} aria-hidden="true">
            <Image
              src="/images/demo/demo-pod-hatch-detail.jpg"
              alt=""
              aria-hidden="true"
              width={1920}
              height={1080}
              loading="lazy"
              className={styles.conversionImage}
            />
            <div className={styles.conversionScrim} />
          </div>

          <div className={styles.sectionInner}>
            <div className={styles.conversionGrid}>
              <div className={styles.conversionCopy}>
                <p className={styles.conversionEyebrow}>READY TO TAKE THE NEXT STEP?</p>
                <h2 className={styles.conversionHeadline}>Send your demo request</h2>
                <p className={styles.conversionSubtext}>
                  Use the contact form to share your details. Our team will review your request and get back to you with the best next steps.
                </p>

                <div className={styles.ctaGroup}>
                  <Link
                    href="/contact?intent=demo"
                    aria-label="Submit demo contact form"
                    className={styles.primaryCta}
                  >
                    Send a demo request
                    <svg
                      aria-hidden="true"
                      className={styles.arrowIcon}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>

                  <Link
                    href="/rental"
                    aria-label="Explore rental planning options"
                    className={styles.secondaryCta}
                  >
                    Review rental planning
                    <svg
                      aria-hidden="true"
                      className={styles.arrowIcon}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Real Devices Real Setups Real Guidance Seal */}
              <div className={styles.conversionSealWrap}>
                <div className={styles.biometricSeal} aria-hidden="true">
                  <svg className="h-16 w-16 text-cyan-400/80" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm5.25 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
                  </svg>
                </div>
                <div className={styles.sealText}>
                  <p>REAL DEVICES.</p>
                  <p>REAL SETUPS.</p>
                  <p>REAL GUIDANCE.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

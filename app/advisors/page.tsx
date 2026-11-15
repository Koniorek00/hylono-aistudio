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
import styles from './advisors-redesign.module.css';

export const metadata: Metadata = createPageMetadata({
  title: 'Guidance Support | Hylono advisor process',
  description:
    'Use this Hylono guidance support page to request help without relying on unapproved named advisor profiles.',
  path: '/advisors',
  forceNoIndex: true,
});

// [DECISION: /advisors is a public noindex guidance-process route because advisor CTAs need a real destination, but named advisor profiles remain unpublished until approved.]
// Rendering strategy: server-rendered noindex route with organization-backed support context and no named-person schema or testimonial claims.
export default function AdvisorsPageRoute() {
  return (
    <>
      <StructuredData
        id="jsonld-advisors-page"
        data={createWebPageSchema({
          name: 'Hylono Guidance Support',
          description:
            'A Hylono guidance support page that explains support review without publishing named advisor profiles.',
          path: '/advisors',
          dateModified: SCHEMA_DATE_MODIFIED,
        })}
      />
      <StructuredData
        id="jsonld-advisors-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guidance Support', path: '/advisors' },
        ])}
      />
      <div className={`min-h-screen bg-slate-950 text-white relative ${styles.routeAdvisors}`}>
        <SupportHandoffRouteActionStatus />

        {/* ================================================================== */}
        {/* SECTION 1: HERO (Alpine Sanctuary Penthouse + Floating Glass HUD)  */}
        {/* ================================================================== */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageWrap}>
            <Image
              src="/images/advisors/hero-sanctuary-1920.webp"
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className={styles.heroImage}
            />
          </div>
          <div className={styles.heroScrim} />
          <div className={styles.grainOverlay} aria-hidden="true" />

          <div className={styles.heroContentWrap}>
            <div className={styles.heroGrid}>
              {/* Left Column: Hero Narrative */}
              <div className={styles.heroLeft}>
                <div className={styles.eyebrowPill}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                    Guidance support
                  </p>
                </div>

                <h1 className={styles.heroTitle}>
                  Ask for guidance without relying on unapproved advisor profiles.
                </h1>

                <p className={styles.heroSubtitle}>
                  Hylono currently handles guidance through an organization-backed support process. The
                  site does not publish named advisor biographies, ratings, or clinical-style promises
                  until those records are approved in the source of truth.
                </p>

                <div className={styles.heroCtaGroup}>
                  <SupportHandoffTrackedLink
                    href="/contact?intent=guidance"
                    eventName="advisors_route_cta_clicked"
                    ctaRole="primary"
                    source="hero"
                    className={`rounded-lg ${styles.btnPrimaryDark}`}
                  >
                    Request guidance
                    <svg
                      className="h-4 w-4 text-cyan-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </SupportHandoffTrackedLink>

                  <SupportHandoffTrackedLink
                    href="/research"
                    eventName="advisors_route_transition_clicked"
                    ctaRole="supporting"
                    source="hero"
                    className={`rounded-lg ${styles.btnSecondaryGlass}`}
                  >
                    Review evidence context
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </SupportHandoffTrackedLink>
                </div>
              </div>

              {/* Right Column: Floating Glassmorphic HUD Card */}
              <div className={styles.heroHudCard}>
                <div className={styles.hudHeader}>SUPPORT FACTS</div>
                <div className={styles.hudList}>
                  <div className={styles.hudItem}>
                    <div className={styles.hudIconBadge} aria-hidden="true">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className={styles.hudItemLabel}>Support owner</p>
                      <p className={styles.hudItemValue}>{siteOwnership.commerce.team}</p>
                    </div>
                  </div>

                  <div className={styles.hudItem}>
                    <div className={styles.hudIconBadge} aria-hidden="true">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className={styles.hudItemLabel}>Evidence review</p>
                      <p className={styles.hudItemValue}>{siteOwnership.research.team}</p>
                    </div>
                  </div>

                  <div className={styles.hudItem}>
                    <div className={styles.hudIconBadge} aria-hidden="true">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={styles.hudItemLabel}>Coverage</p>
                      <p className={styles.hudItemValue}>{`${siteEntity.serviceArea} | ${siteEntity.supportHours}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 2: THE SUPPORT MODEL (Luminous Off-White Bento Grid)         */}
        {/* ================================================================== */}
        <section className={styles.supportModelSection}>
          {/* Floating 3D Refractive Crystal Sculpture */}
          <div className={styles.sculptureWrap} aria-hidden="true">
            <Image
              src="/images/advisors/sculpture-crystal.png"
              alt=""
              aria-hidden="true"
              width={420}
              height={420}
              className="w-full h-full object-contain"
            />
          </div>

          <div className={styles.modelInner}>
            <div className={styles.modelHeader}>
              <p className={styles.modelEyebrow}>THE SUPPORT MODEL</p>
              <h2 className={styles.modelTitle}>
                Guidance through a structured process.
              </h2>
              <p className={styles.modelSubtitle}>
                Our support model keeps education, product access, logistics and support in separate
                routes, so you can explore, compare and decide with confidence.
              </p>
            </div>

            <div className={styles.bentoGrid}>
              {/* Card 01 */}
              <div className={`rounded-lg ${styles.bentoCard}`}>
                <div className={styles.bentoImageWrap}>
                  <Image
                    src="/images/advisors/model-01-education.jpg"
                    alt="Molecular crystalline glass sphere showing evidence structures"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    className={styles.bentoImage}
                  />
                </div>
                <div className={styles.bentoContent}>
                  <span className={styles.bentoNumber}>01</span>
                  <h3 className={styles.bentoCardTitle}>Education & context</h3>
                  <p className={styles.bentoCardText}>
                    Get clear, evidence-informed information on devices, protocols and boundaries.
                  </p>
                </div>
              </div>

              {/* Card 02 */}
              <div className={`rounded-lg ${styles.bentoCard}`}>
                <div className={styles.bentoImageWrap}>
                  <Image
                    src="/images/advisors/model-02-chamber.png"
                    alt="Futuristic hyperbaric chamber capsule with ergonomic cabin"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    className={styles.bentoImage}
                  />
                </div>
                <div className={styles.bentoContent}>
                  <span className={styles.bentoNumber}>02</span>
                  <h3 className={styles.bentoCardTitle}>Product access</h3>
                  <p className={styles.bentoCardText}>
                    Compare products, check rental or purchase options, and review practical fit.
                  </p>
                </div>
              </div>

              {/* Card 03 */}
              <div className={`rounded-lg ${styles.bentoCard}`}>
                <div className={styles.bentoImageWrap}>
                  <Image
                    src="/images/advisors/model-03-logistics.jpg"
                    alt="Biomedical technician reviewing precision diagnostic tablet"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    className={styles.bentoImage}
                  />
                </div>
                <div className={styles.bentoContent}>
                  <span className={styles.bentoNumber}>03</span>
                  <h3 className={styles.bentoCardTitle}>Logistics & setup</h3>
                  <p className={styles.bentoCardText}>
                    Plan delivery, installation, onboarding and configuration with support.
                  </p>
                </div>
              </div>

              {/* Card 04 */}
              <div className={`rounded-lg ${styles.bentoCard}`}>
                <div className={styles.bentoImageWrap}>
                  <Image
                    src="/images/advisors/model-04-support.jpg"
                    alt="Support specialist wearing a consultation headset"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    className={styles.bentoImage}
                  />
                </div>
                <div className={styles.bentoContent}>
                  <span className={styles.bentoNumber}>04</span>
                  <h3 className={styles.bentoCardTitle}>Ongoing support</h3>
                  <p className={styles.bentoCardText}>
                    Get help with setup, device questions, and follow-up through public support routes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 3: WHY IT MATTERS (Deep Midnight Oceanic Wave Atmosphere)   */}
        {/* ================================================================== */}
        <section className={styles.whyItMattersSection}>
          <div className={styles.waveBackgroundWrap} aria-hidden="true">
            <Image
              src="/images/advisors/wave-atmosphere.jpg"
              alt=""
              aria-hidden="true"
              fill
              loading="lazy"
              className={styles.waveBackgroundImage}
            />
            <div className={styles.waveOverlayScrim} />
          </div>

          <div className={styles.whyInner}>
            <div className={styles.whyGrid}>
              {/* Left Column: Narrative Headline */}
              <div className={styles.whyLeft}>
                <p className={styles.whyEyebrow}>WHY IT MATTERS</p>
                <h2 className={styles.whyTitle}>
                  Verified process. Clear next steps.
                </h2>
                <p className={styles.whySubtitle}>
                  The Hylono support process separates guidance, evidence and access, so you can move
                  from question to next step without relying on unapproved advisor profiles or
                  unverified claims.
                </p>
                <div className={styles.whyPaginationWire} aria-hidden="true">
                  <span className={styles.wireDot} />
                  <span className={styles.wireLine} />
                </div>
              </div>

              {/* Right Column: 4 Feature Pillars */}
              <div className={styles.pillarsGrid}>
                {/* Pillar 1 */}
                <div className={styles.pillarCard}>
                  <div className={styles.pillarIconWrap} aria-hidden="true">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className={styles.pillarTitle}>Evidence first</h3>
                  <p className={styles.pillarBody}>
                    Research and protocol context are visible before you make a decision.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className={styles.pillarCard}>
                  <div className={styles.pillarIconWrap} aria-hidden="true">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <h3 className={styles.pillarTitle}>Clear routes</h3>
                  <p className={styles.pillarBody}>
                    Education, products, rental and support stay separate and transparent.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className={styles.pillarCard}>
                  <div className={styles.pillarIconWrap} aria-hidden="true">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className={styles.pillarTitle}>Human support</h3>
                  <p className={styles.pillarBody}>
                    Request guidance from our team when you need a reply.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className={styles.pillarCard}>
                  <div className={styles.pillarIconWrap} aria-hidden="true">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className={styles.pillarTitle}>Public and private</h3>
                  <p className={styles.pillarBody}>
                    Keep your information and next steps within our support process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 4: SUPPORT FACTS & TELEMETRY (Luminous Architectural Field) */}
        {/* ================================================================== */}
        <section className={styles.telemetrySection}>
          <div className={styles.telemetryInner}>
            <div className={styles.telemetryGrid}>
              {/* Left Column: Telemetry Map Card */}
              <div className={styles.telemetryLeft}>
                <div className={styles.telemetryHeader}>
                  <p className={styles.telemetryEyebrow}>SUPPORT FACTS</p>
                  <h2 className={styles.telemetryTitle}>
                    Where we operate and how we support you.
                  </h2>
                </div>

                <div className={`rounded-lg ${styles.mapCardWrap}`}>
                  <svg
                    viewBox="0 0 800 500"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.mapSvg}
                    aria-label="Stylized map of European service coverage"
                  >
                    {/* Background Grid Pattern */}
                    <defs>
                      <pattern id="grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                        <circle cx="12" cy="12" r="1.2" fill="#94a3b8" fillOpacity="0.4" />
                      </pattern>
                      <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
                      </linearGradient>
                      <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    <rect width="100%" height="100%" fill="#f1f5f9" />
                    <rect width="100%" height="100%" fill="url(#grid-dots)" />

                    {/* Stylized European Landmass Contour */}
                    <path
                      d="M180 80 Q 240 60, 310 90 T 430 70 T 520 110 T 640 90 T 720 160 Q 690 280, 580 340 T 450 420 T 360 410 T 260 380 Q 200 320, 210 240 T 150 160 Z"
                      fill="#e2e8f0"
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                    />

                    {/* Scandinavia / UK Silhouette Accents */}
                    <path
                      d="M170 140 Q 190 110, 220 130 T 200 180 T 160 160 Z"
                      fill="#e2e8f0"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M380 50 Q 420 30, 460 60 T 430 110 T 370 70 Z"
                      fill="#e2e8f0"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />

                    {/* Telemetry Network Connection Arcs */}
                    <path
                      d="M 280 230 Q 350 210, 420 220 T 540 230"
                      stroke="url(#arcGlow)"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                      filter="url(#glowFilter)"
                      fill="none"
                    />
                    <path
                      d="M 420 220 Q 390 290, 440 330"
                      stroke="url(#arcGlow)"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      fill="none"
                    />
                    <path
                      d="M 280 230 Q 340 280, 390 300"
                      stroke="url(#arcGlow)"
                      strokeWidth="1.8"
                      strokeDasharray="3 3"
                      fill="none"
                    />
                    <path
                      d="M 420 220 Q 460 170, 510 180"
                      stroke="url(#arcGlow)"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      fill="none"
                    />

                    {/* Telemetry Nodes: Zurich, Munich, Vienna, Paris, London, Milan */}
                    {/* Paris */}
                    <g transform="translate(280, 230)">
                      <circle r="12" fill="#38bdf8" fillOpacity="0.2" />
                      <circle r="5" fill="#0284c7" />
                      <circle r="2" fill="#ffffff" />
                      <text x="14" y="4" fontSize="10" fontWeight="600" fill="#334155" fontFamily="system-ui">Paris</text>
                    </g>

                    {/* Zurich (HQ / Swiss Hub) */}
                    <g transform="translate(390, 300)">
                      <circle r="16" fill="#38bdf8" fillOpacity="0.25">
                        <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle r="6" fill="#0284c7" />
                      <circle r="2.5" fill="#ffffff" />
                      <text x="14" y="4" fontSize="11" fontWeight="700" fill="#0f172a" fontFamily="system-ui">Zurich</text>
                    </g>

                    {/* Munich */}
                    <g transform="translate(420, 250)">
                      <circle r="11" fill="#38bdf8" fillOpacity="0.2" />
                      <circle r="5" fill="#0284c7" />
                      <circle r="2" fill="#ffffff" />
                      <text x="12" y="4" fontSize="10" fontWeight="600" fill="#334155" fontFamily="system-ui">Munich</text>
                    </g>

                    {/* Vienna */}
                    <g transform="translate(480, 260)">
                      <circle r="11" fill="#38bdf8" fillOpacity="0.2" />
                      <circle r="5" fill="#0284c7" />
                      <circle r="2" fill="#ffffff" />
                      <text x="12" y="4" fontSize="10" fontWeight="600" fill="#334155" fontFamily="system-ui">Vienna</text>
                    </g>

                    {/* Berlin */}
                    <g transform="translate(430, 180)">
                      <circle r="12" fill="#38bdf8" fillOpacity="0.2" />
                      <circle r="5" fill="#0284c7" />
                      <circle r="2" fill="#ffffff" />
                      <text x="12" y="4" fontSize="10" fontWeight="600" fill="#334155" fontFamily="system-ui">Berlin</text>
                    </g>

                    {/* Milan */}
                    <g transform="translate(400, 340)">
                      <circle r="11" fill="#38bdf8" fillOpacity="0.2" />
                      <circle r="5" fill="#0284c7" />
                      <circle r="2" fill="#ffffff" />
                      <text x="12" y="4" fontSize="10" fontWeight="600" fill="#334155" fontFamily="system-ui">Milan</text>
                    </g>
                  </svg>

                  <div className={styles.telemetryConsoleBar}>
                    <div className={styles.pulseBeacon}>
                      <span className={styles.beaconDot} />
                      <span>{siteEntity.serviceArea}</span>
                    </div>
                    <span>{siteEntity.supportHours}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3 Architectural Fact Cards */}
              <div className={styles.factsColumn}>
                {/* Fact 1 */}
                <div className={`rounded-lg ${styles.architecturalFactCard}`}>
                  <div className={styles.factCardHeader}>
                    <div className={styles.factIconBadge} aria-hidden="true">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className={styles.factCardLabel}>Support owner</p>
                      <h3 className={styles.factCardValue}>{siteOwnership.commerce.team}</h3>
                    </div>
                  </div>
                  <p className={styles.factCardDesc}>
                    Handles guidance, access, logistics, onboarding and manual support handoffs.
                  </p>
                </div>

                {/* Fact 2 */}
                <div className={`rounded-lg ${styles.architecturalFactCard}`}>
                  <div className={styles.factCardHeader}>
                    <div className={styles.factIconBadge} aria-hidden="true">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className={styles.factCardLabel}>Evidence review</p>
                      <h3 className={styles.factCardValue}>{siteOwnership.research.team}</h3>
                    </div>
                  </div>
                  <p className={styles.factCardDesc}>
                    Keeps evidence and protocol context tied to research summaries and visible limits.
                  </p>
                </div>

                {/* Fact 3 */}
                <div className={`rounded-lg ${styles.architecturalFactCard}`}>
                  <div className={styles.factCardHeader}>
                    <div className={styles.factIconBadge} aria-hidden="true">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={styles.factCardLabel}>Coverage</p>
                      <h3 className={styles.factCardValue}>{siteEntity.serviceArea}</h3>
                    </div>
                  </div>
                  <p className={styles.factCardDesc}>
                    {siteEntity.supportHours}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 5: READY FOR NEXT STEP (Twilight Lake Terrace & Console)   */}
        {/* ================================================================== */}
        <section className={styles.nextStepSection}>
          <div className={styles.terraceBackdropWrap} aria-hidden="true">
            <Image
              src="/images/advisors/terrace-twilight.jpg"
              alt=""
              aria-hidden="true"
              fill
              loading="lazy"
              className={styles.terraceBackdropImage}
            />
            <div className={styles.terraceScrim} />
          </div>

          <div className={styles.nextStepInner}>
            <div className={styles.nextStepGrid}>
              {/* Left Column: Direct Action Call */}
              <div className={styles.nextStepLeft}>
                <p className={styles.nextStepEyebrow}>READY FOR NEXT STEP</p>
                <h2 className={styles.nextStepTitle}>
                  Get guidance when you need it.
                </h2>
                <p className={styles.nextStepSubtitle}>
                  If you have a question about products, protocols, rental, logistics or support,
                  reach out through our public channels. Our team will help you find the right next step.
                </p>

                <div className={styles.nextStepCtaGroup}>
                  <Link
                    href="/contact?intent=guidance"
                    aria-label="Contact our team for guidance consultation"
                    className={`rounded-lg ${styles.btnPrimaryDark}`}
                  >
                    Request guidance
                    <svg
                      className="h-4 w-4 text-cyan-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>

                  <Link
                    href="/research"
                    aria-label="Explore scientific literature and evidence hub"
                    className={`rounded-lg ${styles.btnSecondaryGlass}`}
                  >
                    Review evidence context
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Right Column: Self-Serve First Console */}
              <div className={styles.selfServeCard}>
                <h3 className={styles.selfServeTitle}>Prefer self-serve first?</h3>
                <div className={styles.selfServeLinks}>
                  <Link
                    href="/help"
                    className={`rounded-lg ${styles.selfServeLink}`}
                  >
                    <span>Help center</span>
                    <svg
                      className="h-4 w-4 text-cyan-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  <Link
                    href="/faq"
                    className={`rounded-lg ${styles.selfServeLink}`}
                  >
                    <span>FAQ</span>
                    <svg
                      className="h-4 w-4 text-cyan-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

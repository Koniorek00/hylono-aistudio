import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  HelpCircle,
  MessageSquare,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import styles from './financing.module.css';

const routeLinks = [
  {
    id: 'checkout',
    href: '/checkout',
    label: 'Review checkout details',
    text: 'Use checkout only when you are ready to provide order details.',
    number: '01',
    routeLabel: '/checkout',
    image: '/images/financing/card-checkout.jpg',
    imageAlt: 'Hylono clinical-grade hyperbaric chamber in modern wellness facility',
    icon: ShoppingCart,
  },
  {
    id: 'rental',
    href: '/rental',
    label: 'Compare rental access',
    text: 'Use rental when you need a lower-commitment access path first.',
    number: '02',
    routeLabel: '/rental',
    image: '/images/financing/card-rental.jpg',
    imageAlt: 'Hylono hyperbaric oxygen therapy chamber with lake and mountain view',
    icon: Calendar,
  },
  {
    id: 'support',
    href: '/contact?intent=financing',
    label: 'Ask about financing',
    text: 'Send the support team a manual financing question without relying on unapproved public terms.',
    number: '03',
    routeLabel: '/contact?intent=financing',
    image: '/images/financing/card-support.jpg',
    imageAlt: 'Hylono customer support specialist ready to assist with manual financing questions',
    icon: MessageSquare,
  },
] as const;

const relatedRoutes = [
  {
    label: 'Research',
    desc: 'Evidence and source context.',
    href: '/research',
    icon: Search,
  },
  {
    label: 'Protocols',
    desc: 'Routines and implementation.',
    href: '/protocols',
    icon: FileText,
  },
  {
    label: 'Store',
    desc: 'Product categories and fit.',
    href: '/store',
    icon: ShoppingBag,
  },
  {
    label: 'Help Center',
    desc: 'General questions and support.',
    href: '/help',
    icon: HelpCircle,
  },
] as const;

const financingRouteCardTitleId = (id: (typeof routeLinks)[number]['id']) =>
  `financing-route-${id}-title`;
const financingRouteCardDescriptionId = (id: (typeof routeLinks)[number]['id']) =>
  `financing-route-${id}-description`;

export const metadata: Metadata = createPageMetadata({
  title: 'Financing Guidance | Hylono manual support path',
  description:
    'Use this Hylono financing guidance page to choose checkout, rental, or manual support without relying on unapproved public financing terms.',
  path: '/financing',
  forceNoIndex: true,
});

// [DECISION: /financing is a public noindex support route because product CTAs need a real destination, but financing rates and approval terms should not be indexed or promised without owner approval.]
// Rendering strategy: server-rendered noindex guidance page with conservative route choices and no client-only content dependency.
export default function FinancingPage() {
  return (
    <>
      <StructuredData
        id="jsonld-financing-page"
        data={createWebPageSchema({
          name: 'Hylono Financing Guidance',
          description:
            'A Hylono guidance page that directs financing questions to checkout, rental, or manual support without publishing unapproved terms.',
          path: '/financing',
          dateModified: SCHEMA_DATE_MODIFIED,
        })}
      />
      <StructuredData
        id="jsonld-financing-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Financing Guidance', path: '/financing' },
        ])}
      />
      <div className={`min-h-screen bg-slate-950 text-white relative ${styles.routeFinancing}`}>
        <div className={styles.grainOverlay} aria-hidden="true" />

        {/* ================================================================== */}
        {/* SECTION 1: HERO (Sunlit Glass Alpine Lake Villa + Step Rail)        */}
        {/* ================================================================== */}
        <section className={styles.heroSection} aria-label="Financing Guidance Overview">
          <div className={styles.heroImageWrap}>
            <Image
              src="/images/financing/hero-lake-villa.jpg"
              alt="Luxury modern glass pavilion overlooking pristine alpine lake and mountain peaks"
              fill
              sizes="100vw"
              className={styles.heroImage}
            />
          </div>
          <div className={styles.heroScrim} aria-hidden="true" />

          <div className={styles.heroContainer}>
            <div className={styles.heroGrid}>
              {/* Left Column: Heading, Lead, and Metadata Badges */}
              <div>
                <span className={styles.heroEyebrow}>Manual financing guidance</span>
                <h1 className={styles.heroHeading}>
                  Choose a buying, rental, or support path without guessing financing terms.
                </h1>
                <p className={styles.heroLead}>
                  No approval promises, rates, or repayment terms are published here. Choose
                  checkout, rental, or manual support and the team will confirm the
                  current path directly.
                </p>

                {/* Metadata Badges */}
                <dl className={styles.heroBadgesGrid}>
                  <div className={styles.heroBadgeCard}>
                    <dt className={styles.heroBadgeHeader}>
                      <FileText className={`w-3.5 h-3.5 ${styles.heroBadgeIcon}`} aria-hidden="true" />
                      <span className={styles.heroBadgeLabel}>Page role</span>
                    </dt>
                    <dd className={styles.heroBadgeValue}>Manual financing handoff.</dd>
                  </div>
                  <div className={styles.heroBadgeCard}>
                    <dt className={styles.heroBadgeHeader}>
                      <ShieldCheck className={`w-3.5 h-3.5 ${styles.heroBadgeIcon}`} aria-hidden="true" />
                      <span className={styles.heroBadgeLabel}>Support owner</span>
                    </dt>
                    <dd className={styles.heroBadgeValue}>{siteOwnership.commerce.team}</dd>
                  </div>
                  <div className={styles.heroBadgeCard}>
                    <dt className={styles.heroBadgeHeader}>
                      <Clock className={`w-3.5 h-3.5 ${styles.heroBadgeIcon}`} aria-hidden="true" />
                      <span className={styles.heroBadgeLabel}>Coverage</span>
                    </dt>
                    <dd className={styles.heroBadgeValue}>
                      {siteEntity.serviceArea} | {siteEntity.supportHours}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Right Column: "YOUR PATH" Step Rail HUD */}
              <div>
                <div className={styles.pathRailCard} aria-label="Your Path Steps">
                  <div className={styles.pathRailHeader}>YOUR PATH</div>
                  <div className={styles.pathStepsList}>
                    <div className={styles.pathTrackLine} aria-hidden="true" />
                    
                    <div className={styles.pathStepItem}>
                      <div className={styles.pathNodeIndicator} aria-hidden="true">
                        <div className={styles.pathNodeDot} />
                      </div>
                      <div className={styles.pathStepContent}>
                        <div className={styles.pathStepTitle}>Checkout</div>
                        <div className={styles.pathStepDesc}>Review order details</div>
                      </div>
                    </div>

                    <div className={styles.pathStepItem}>
                      <div className={styles.pathNodeIndicator} aria-hidden="true">
                        <div className={styles.pathNodeDot} />
                      </div>
                      <div className={styles.pathStepContent}>
                        <div className={styles.pathStepTitle}>Rental</div>
                        <div className={styles.pathStepDesc}>Lower-commitment access</div>
                      </div>
                    </div>

                    <div className={styles.pathStepItem}>
                      <div className={styles.pathNodeIndicator} aria-hidden="true">
                        <div className={styles.pathNodeDot} />
                      </div>
                      <div className={styles.pathStepContent}>
                        <div className={styles.pathStepTitle}>Financing</div>
                        <div className={styles.pathStepDesc}>Manual support question</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 2: ROUTE CHOICES (Bento 3-Card Grid with Photography)      */}
        {/* ================================================================== */}
        <section className={styles.routesSection} aria-label="Route Choices">
          <div className={styles.routesContainer}>
            <div className={styles.routesHeaderGrid}>
              <div>
                <span className={styles.routesEyebrow}>ROUTE CHOICES</span>
                <h2 className={styles.routesHeading}>Three ways to move forward.</h2>
              </div>
              <div className={styles.routesSubtitleWrapper}>
                <p className={styles.routesSubtitle}>
                  Each path connects to the right team and keeps your next step clear, without unapproved promises or public financing terms.
                </p>
              </div>
            </div>

            <div className={styles.cardsGrid}>
              {routeLinks.map((item) => {
                const titleId = financingRouteCardTitleId(item.id);
                const descriptionId = financingRouteCardDescriptionId(item.id);
                const IconComponent = item.icon;

                return (
                  <article
                    key={item.href}
                    aria-labelledby={titleId}
                    className={styles.routeCard}
                  >
                    <div className={styles.cardImageWrapper}>
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
                        loading="lazy"
                        className={styles.cardImage}
                      />
                      <div className={styles.cardBadgeIcon} aria-hidden="true">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardNumber}>{item.number}</div>
                      <h2 id={titleId} className={styles.cardTitle}>
                        {item.label}
                      </h2>
                      <p id={descriptionId} className={styles.cardDescription}>
                        {item.text}
                      </p>
                      
                      <Link
                        href={item.href}
                        aria-describedby={descriptionId}
                        className={`${styles.cardCtaButton} rounded-lg`}
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>

                      <div className={styles.cardRoutePath} aria-hidden="true">
                        {item.routeLabel}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 3: WHY THIS MATTERS (Asymmetric Window + Principles)       */}
        {/* ================================================================== */}
        <section className={styles.mattersSection} aria-label="Why This Matters">
          <div className={styles.mattersContainer}>
            <div className={styles.mattersGrid}>
              {/* Left Panel: Alpine Lake Window View */}
              <div className={styles.mattersImagePanel}>
                <Image
                  src="/images/financing/section-alpine-spa.jpg"
                  alt="Minimalist alpine sanctuary lounge with floor-to-ceiling glass window overlooking glacial lake"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  className={styles.mattersPhoto}
                />
              </div>

              {/* Right Panel: Narrative & Principles List */}
              <div className={styles.mattersContentPanel}>
                <div className={styles.mattersEyebrow}>WHY THIS MATTERS</div>
                <h2 className={styles.mattersHeading}>Clear routes, better decisions.</h2>
                <p className={styles.mattersLead}>
                  Whether you are buying, renting, or asking about financing, these routes keep you in the right lane and connected to Hylono Commerce & Support for manual review.
                </p>

                <div className={styles.mattersPrinciplesList}>
                  <div className={styles.principleItem}>
                    <div className={styles.principleNumber}>01</div>
                    <div className={styles.principleTextContent}>
                      <h3 className={styles.principleTitle}>No public promises</h3>
                      <p className={styles.principleDesc}>
                        Hylono does not publish approval promises, rates, or repayment terms.
                      </p>
                    </div>
                  </div>

                  <div className={styles.principleItem}>
                    <div className={styles.principleNumber}>02</div>
                    <div className={styles.principleTextContent}>
                      <h3 className={styles.principleTitle}>Direct support</h3>
                      <p className={styles.principleDesc}>
                        You get the current path and next steps from the Hylono team.
                      </p>
                    </div>
                  </div>

                  <div className={styles.principleItem}>
                    <div className={styles.principleNumber}>03</div>
                    <div className={styles.principleTextContent}>
                      <h3 className={styles.principleTitle}>EU coverage</h3>
                      <p className={styles.principleDesc}>
                        Support is available across the European Union, Monday to Friday, 09:00 to 18:00 CET.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SECTION 4: RELATED SUPPORT ROUTES (Knowledge Navigation)          */}
        {/* ================================================================== */}
        <section className={styles.relatedSection} aria-label="Related Support Routes">
          <div className={styles.relatedContainer}>
            <div className={styles.relatedMainGrid}>
              {/* Left Column: Heading & Explore CTA */}
              <div>
                <span className={styles.relatedEyebrow}>MORE WAYS TO GET ANSWERS</span>
                <h2 className={styles.relatedHeading}>Related support routes</h2>
                <p className={styles.relatedLead}>
                  If you need more context before you decide, these public pages can help with research, product fit, protocols, and general support.
                </p>
                <Link href="/help" className={styles.relatedExploreCta}>
                  <span>Explore all routes</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Right Columns: 4 Route Cards */}
              <div className={styles.routesLinksGrid}>
                {relatedRoutes.map((route) => {
                  const RouteIcon = route.icon;
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={styles.relatedLinkCard}
                    >
                      <div className={styles.relatedIconWrap} aria-hidden="true">
                        <RouteIcon className="w-5 h-5" />
                      </div>
                      <div className={styles.relatedCardTitle}>{route.label}</div>
                      <div className={styles.relatedCardDesc}>{route.desc}</div>
                      <div className={styles.relatedCardPath}>{route.href}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* BOTTOM LAKE PANORAMA BANNER (Atmospheric Connection to Footer)      */}
        {/* ================================================================== */}
        <div className={styles.lakeBannerSection} aria-hidden="true">
          <Image
            src="/images/financing/footer-lake-dark.jpg"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            loading="lazy"
            className={styles.lakeBannerImage}
          />
          <div className={styles.lakeBannerGradient} />
        </div>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { PageOwnership } from '@/components/content/PageOwnership';
import { createPageMetadata } from '@/lib/seo-metadata';
import { PRICE_BOOK_CURRENCY, priceBookText } from '@/lib/money';
import {
  createBreadcrumbSchema,
  createFaqSchema,
  createProductSchema,
  createWebPageSchema,
  SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import { conditionGoals } from '@/content/conditions';
import { evidenceById, type Evidence } from '@/content/evidence';
import { getApprovedProductMediaPathForPublicUse } from '@/content/product-media-assets';
import {
  getProductForRouteSlug,
  getSchemaAvailabilityForProduct,
  type HylonoProduct,
  productById,
  productAvailabilityPolicy,
} from '@/content/products';
import { protocolBySlug } from '@/content/protocols';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { getProductTopicalLinks } from '@/content/topical-graph';
import { TECH_DETAILS } from '@/constants';
import { BLOG_POSTS } from '@/constants/content';
import { toBlogSlug } from '@/lib/blog';
import { env } from '@/lib/env';
import StructuredData from '@/src/components/StructuredData';
import type { TechData } from '@/types';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
import {
  getAllTechRouteSlugs,
  getIndexableTechRouteSlugs,
  getTechRouteSlug,
  getTechTypeFromRouteSlug,
  isIndexableProductRouteSlug,
  LEGACY_PRODUCT_ROUTE_REDIRECTS,
} from '@/lib/product-routes';
import { ProductClient } from './ProductClient';
import {
  createSecondaryProductRouteMetadata,
  SecondaryProductRoute,
} from './SecondaryProductRoute';
import { ProductRouteActionStatus, ProductTrackedLink } from './ProductTrackedLink';
import { HbotReferenceHero, HbotReferenceContext } from './HbotReferenceContent';

type Params = Promise<{ tech: string }>;

// [DECISION: product route is catalog-style semi-dynamic content and should rely on cache components/runtime caching; reverse if product data becomes per-user personalized.]
// Rendering strategy: server-rendered product metadata and schema with a client detail layer for interactive comparison, financing, and configuration.

const resolveProductRoute = (rawTech: string) => {
  const normalizedTech = rawTech.toLowerCase();
  const legacyRedirect =
    LEGACY_PRODUCT_ROUTE_REDIRECTS[
      normalizedTech as keyof typeof LEGACY_PRODUCT_ROUTE_REDIRECTS
    ];

  if (legacyRedirect) {
    permanentRedirect(`/product/${legacyRedirect}`);
  }

  const techType = getTechTypeFromRouteSlug(normalizedTech);
  if (!techType) {
    notFound();
  }

  const canonicalSlug = getTechRouteSlug(techType);
  if (normalizedTech !== canonicalSlug || rawTech !== canonicalSlug) {
    permanentRedirect(`/product/${canonicalSlug}`);
  }

  return { canonicalSlug, techData: TECH_DETAILS[techType] };
};

export function generateStaticParams() {
  return getAllTechRouteSlugs().map((tech) => ({ tech }));
}

const PRODUCT_OG_IMAGES: Record<string, string> = {
  hbot: '/images/chambers/oxyhelp-chambers-hero.jpg',
  hydrogen: '/images/catalog/omega3/2026/pr-ho450-p.png',
};

const HBOT_PRODUCT_ID = 'hbot-st1700';
const H2_PRODUCT_ID = 'h2-hop450';

const PRODUCT_CONTENT_ID_BY_ROUTE_SLUG: Record<string, string | undefined> = {
  hbot: HBOT_PRODUCT_ID,
  hydrogen: H2_PRODUCT_ID,
};

const trackedLinkBaseClass =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 motion-reduce:transition-none';

const darkPolicyLinkClass =
  'inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/40 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none';

const productPolicyLinks = [
  { href: '/shipping', label: 'Shipping policy' },
  { href: '/returns', label: 'Returns policy' },
  { href: '/warranty', label: 'Warranty policy' },
  { href: '/help', label: 'Help center' },
];

const productCommerceContextLinks = [
  { href: '/financing', label: 'Financing options' },
  { href: '/shipping', label: 'Shipping scope' },
  { href: '/returns', label: 'Returns path' },
  { href: '/warranty', label: 'Warranty boundaries' },
];

function ProductOwnershipContext({
  canonicalSlug,
  productName,
}: {
  canonicalSlug: string;
  productName: string;
}) {
  return (
    <section
      className="border-b border-white/10 bg-slate-950 text-white"
      data-testid="product-ownership-context"
    >
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageOwnership
          eyebrow="Product ownership and freshness"
          title="Reviewed as a product and support path"
          description={`${productName} is presented as a Hylono product hub with commerce support, evidence context, policy links, and manual guidance for fit questions.`}
          items={[
            {
              label: siteOwnership.commerce.label,
              value: siteOwnership.commerce.team,
              detail: 'Handles pricing, rental planning, delivery, and support handoffs.',
            },
            {
              label: siteOwnership.research.label,
              value: siteOwnership.research.team,
              detail:
                'Keeps product education tied to conservative evidence context and visible limitations.',
            },
            {
              label: 'Freshness marker',
              value: SCHEMA_DATE_MODIFIED,
              detail: `Support coverage: ${siteEntity.serviceArea} | ${siteEntity.supportHours}.`,
            },
          ]}
          actions={[
            { href: '/research', label: 'Review research' },
            { href: `/contact?tech=${canonicalSlug}`, label: 'Ask Hylono support' },
            { href: '/shipping', label: 'Shipping' },
            { href: '/returns', label: 'Returns' },
            { href: '/warranty', label: 'Warranty' },
          ]}
          note="This product page does not publish named expert endorsements, ratings, or promised health outcomes."
          variant="dark"
        />
      </div>
    </section>
  );
}

const getProductSeoDescription = (productName: string): string =>
  `Compare ${productName} pricing, rental options, technical specifications, delivery policies, and protocol guidance.`;

// Was a local Intl formatter hardcoded to EUR at en-IE, rendering price-book
// figures denominated in PLN as euro on the main product route. Delegates to the
// single money source so this route cannot disagree with the checkout.
const formatPrice = (value: number): string => priceBookText(value);

function ProductServerDecisionSummary({
  canonicalSlug,
  contentProduct,
  productName,
  productTopicalLinks,
  techData,
}: {
  canonicalSlug: string;
  contentProduct: HylonoProduct | undefined;
  productName: string;
  productTopicalLinks: Array<{ href: string; label: string }>;
  techData: TechData;
}) {
  const specifications = (
    contentProduct?.specifications.map((spec) => ({
      label: spec.label,
      value: spec.value,
    })) ?? techData.technicalSpecs
  ).slice(0, 4);
  const safetyItems = (
    contentProduct?.contraindications ??
    techData.contraindications?.map((item) => item.condition) ??
    []
  ).slice(0, 4);
  const availabilityLabel = contentProduct
    ? productAvailabilityPolicy[contentProduct.availabilityStatus].label
    : productAvailabilityPolicy.available_on_request.label;
  const rentalPlan = contentProduct?.rentalPlans?.[0];
  const guidePriceLabel = contentProduct?.purchasePrice
    ? formatPrice(contentProduct.purchasePrice)
    : 'Request / verify';
  const rentalLabel = rentalPlan
    ? `${formatPrice(rentalPlan.monthlyPrice)}/mo, ${rentalPlan.minPeriod} minimum reviewed before checkout`
    : 'Request / verify before quote';

  return (
    <section
      aria-labelledby={`product-${canonicalSlug}-server-summary-title`}
      className="border-b border-white/10 bg-slate-950 text-white"
      data-testid="product-server-decision-summary"
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">
            Decision summary
          </p>
          <h2
            id={`product-${canonicalSlug}-server-summary-title`}
            className="mt-3 text-3xl font-bold tracking-tight text-white"
          >
            Key {productName} facts before you choose an access path
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {techData.plainDescription} Compare core access, specification, safety, and policy
            context before choosing rental, support, or purchase next steps.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-slate-950/20">
            <h3 className="break-words text-base font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>Access and quote path</h3>
            <dl className="mt-4 space-y-3 text-sm leading-6">
              <div>
                <dt className="font-semibold text-slate-200">Published guide price</dt>
                <dd className="text-slate-400">
                  {guidePriceLabel}; final quote reviewed before commitment.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-200">Rental path</dt>
                <dd className="text-slate-400">{rentalLabel}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-200">Availability</dt>
                <dd className="text-slate-400">{availabilityLabel}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-slate-950/20">
            <h3 className="break-words text-base font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>Specifications to compare</h3>
            <dl className="mt-4 space-y-3 text-sm leading-6">
              {specifications.map((spec) => (
                <div key={`${spec.label}-${spec.value}`}>
                  <dt className="font-semibold text-slate-200">{spec.label}</dt>
                  <dd className="text-slate-400">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="rounded-lg border border-cyan-300/20 bg-slate-900/80 p-5 text-white shadow-lg shadow-slate-950/20">
            <h3 className="break-words text-base font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>Safety and support boundary</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Review setup, contraindications, policy terms, and support context before
              choosing {productName} access.
            </p>
            {safetyItems.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
                {safetyItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-slate-950/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="break-words text-base font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                Next steps from this product page
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Compare condition guides, research, protocols, rental planning,
                support, and policy pages before choosing a product path.
              </p>
            </div>
            <ProductTrackedLink
              ctaRole="supporting"
              className={`${trackedLinkBaseClass} shrink-0 rounded-lg border border-cyan-300/20 bg-cyan-300 text-slate-950 hover:bg-cyan-200 focus-visible:outline-cyan-300`}
              href={`/contact?tech=${canonicalSlug}`}
              productSlug={canonicalSlug}
              source="trust_context"
            >
              Ask Hylono support
            </ProductTrackedLink>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[...productTopicalLinks, ...productPolicyLinks].map((link) => {
              const ctaRole = productPolicyLinks.some((policyLink) => policyLink.href === link.href)
                ? 'policy'
                : 'supporting';

              return (
                <ProductTrackedLink
                  key={`${link.href}-${link.label}`}
                  ctaRole={ctaRole}
                  className={darkPolicyLinkClass}
                  href={link.href}
                  productSlug={canonicalSlug}
                  source="trust_context"
                >
                  {link.label}
                </ProductTrackedLink>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductHydrogenServerIntro({
  evidenceItems,
  productName,
}: {
  evidenceItems: Evidence[];
  productName: string;
}) {
  const hydrogenProduct = productById[H2_PRODUCT_ID];
  const conditionLinks =
    hydrogenProduct?.goalTags
      .map((goalTag) => conditionGoals.find((goal) => goal.slug === goalTag))
      .filter((goal): goal is NonNullable<typeof goal> => Boolean(goal))
      .map((goal) => ({
        href: `/conditions/${goal.slug}`,
        label: `${goal.title} guide`,
      })) ?? [];
  const protocolLinks =
    hydrogenProduct?.protocolIds
      .map((slug) => protocolBySlug[slug])
      .filter((protocol): protocol is NonNullable<typeof protocol> => Boolean(protocol))
      .map((protocol) => ({
        href: `/protocols/${protocol.slug}`,
        label: protocol.title,
      })) ?? [];
  const routeLinks = [
    ...conditionLinks,
    { href: '/research', label: 'Research evidence' },
    ...protocolLinks,
    { href: '/rental?device=hydrogen', label: 'Rental planning' },
    { href: '/contact?tech=hydrogen', label: 'Talk to Hylono' },
  ];

  return (
    <section
      aria-labelledby="product-hydrogen-intro-title"
      className="border-b border-white/10 bg-emerald-950 text-white"
      data-testid="product-hydrogen-server-intro"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-20">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200">
            Product hub
          </p>
          <h1
            id="product-hydrogen-intro-title"
            className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl"
          >
            Hydrogen hub for protocol-led daily routines
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50 md:text-lg">
            Compare {productName} equipment context, rental access, cited
            evidence, and protocol paths before choosing a hydrogen format or asking for support.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ProductTrackedLink
              ctaRole="primary"
              className={`${trackedLinkBaseClass} bg-emerald-300 text-slate-950 hover:bg-emerald-200`}
              eventName="product_route_cta_clicked"
              href="/rental?device=hydrogen"
              productSlug="hydrogen"
              source="server_intro"
            >
              Start hydrogen rental planning
            </ProductTrackedLink>
            <ProductTrackedLink
              ctaRole="supporting"
              className={`${trackedLinkBaseClass} border border-white/15 bg-white/[0.045] text-white hover:bg-white/[0.07]`}
              href="/research"
              productSlug="hydrogen"
              source="server_intro"
            >
              Review hydrogen research
            </ProductTrackedLink>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: 'Protocol fit first',
                body: 'Place hydrogen inside stress, comfort, or vitality routines before treating hardware as the full answer.',
              },
              {
                title: 'Evidence limits visible',
                body: 'Review the meta-analysis, RCT, and review records with protocol and population limits in view.',
              },
              {
                title: 'Access path clear',
                body: 'Move into rental planning or support before committing to a purchase decision.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <h2 className="break-words text-sm font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-50/80">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-5 md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
              Format fit criteria
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              Choose the hydrogen format before comparing models
            </h2>
            <p className="mt-3 text-sm leading-7 text-emerald-50/80">
              This is not a best-product ranking. Use the criteria below to separate daily water
              access, compact inhalation, and stronger session platforms before moving into model
              pages or rental planning.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                {
                  title: 'Water access',
                  body: 'Use this path when the decision is about dissolved-hydrogen access through bathing, showering, drinking water, or portable water routines.',
                  href: '/product/wo-b300-b600',
                  label: 'Review water line',
                },
                {
                  title: 'Compact inhalation',
                  body: 'Use this path when the routine needs a small home inhalation format with clear output, dimensions, and support links visible before purchase.',
                  href: '/product/os-h150',
                  label: 'Review personal line',
                },
                {
                  title: 'Session platform',
                  body: 'Use this path when the question is output headroom, H2 or H2 plus O2 delivery, and whether rental planning should come before ownership.',
                  href: '/product/pr-h600',
                  label: 'Review intensive line',
                },
              ].map((item) => (
                <article key={item.title} className="rounded-lg border border-white/10 bg-emerald-950/70 p-4">
                  <h3 className="break-words text-sm font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/80">{item.body}</p>
                  <ProductTrackedLink
                    ctaRole="supporting"
                    className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-white/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 motion-reduce:transition-none"
                    href={item.href}
                    productSlug="hydrogen"
                    source="format_criteria"
                  >
                    {item.label}
                  </ProductTrackedLink>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none md:p-6">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                Evidence review
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {siteOwnership.research.team}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                Support
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-white">
                {siteEntity.supportEmail}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                Hours
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{siteEntity.supportHours}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="break-words text-base font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>Current hydrogen evidence scope</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-50/80">
              Hylono shows these references for educational review; they should not be read as
              personalized professional advice or disease-management guidance.
            </p>
            <div className="mt-4 space-y-3">
              {evidenceItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-white/10 bg-emerald-950/80 p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                    {item.studyType} - {item.year}
                  </p>
                  <h3 className="mt-2 break-words text-sm font-bold leading-6 text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-emerald-50/70">
                    {item.primaryEndpoint}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white shadow-none md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                  Path map
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  Keep the hydrogen decision connected to the wider Hylono graph
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/80">
                  Move from hydrogen into condition guides,
                  research, protocols, rental planning, support, and policy pages.
                </p>
              </div>
              <ProductTrackedLink
                ctaRole="supporting"
                className={`${darkPolicyLinkClass} shrink-0`}
                href="/contact?tech=hydrogen"
                productSlug="hydrogen"
                source="trust_context"
              >
                Ask Hylono support
              </ProductTrackedLink>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {routeLinks.map((link) => (
                <ProductTrackedLink
                  key={link.href}
                  ctaRole="supporting"
                  className={darkPolicyLinkClass}
                  href={link.href}
                  productSlug="hydrogen"
                  source="trust_context"
                >
                  {link.label}
                </ProductTrackedLink>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {productPolicyLinks.map((link) => (
                <ProductTrackedLink
                  key={link.href}
                  ctaRole="policy"
                  className={darkPolicyLinkClass}
                  href={link.href}
                  productSlug="hydrogen"
                  source="trust_context"
                >
                  {link.label}
                </ProductTrackedLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductPemfServerIntro({ productName }: { productName: string }) {
  const conditionLinks = conditionGoals
    .filter((goal) => goal.modalities.some((modality) => modality.slug === 'PEMF'))
    .map((goal) => ({
      href: `/conditions/${goal.slug}`,
      label: `${goal.title} guide`,
    }));
  const routeLinks = [
    ...conditionLinks,
    { href: '/research', label: 'Research evidence' },
    { href: '/protocols', label: 'Protocol library' },
    { href: '/rental?device=pemf', label: 'Rental planning' },
    { href: '/contact?tech=pemf', label: 'Talk to Hylono' },
  ];

  return (
    <section
      aria-labelledby="product-pemf-intro-title"
      className="border-b border-white/10 bg-slate-950 text-white"
      data-testid="product-pemf-server-intro"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-20">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime-200">
            Product hub
          </p>
          <h1
            id="product-pemf-intro-title"
            className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl"
          >
            PEMF hub for safety-first protocol planning
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
            Place {productName} inside sleep, comfort, stress, or recovery
            planning. A device alone is not the full routine.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ProductTrackedLink
              ctaRole="primary"
              className={`${trackedLinkBaseClass} bg-lime-300 text-slate-950 hover:bg-lime-200`}
              eventName="product_route_cta_clicked"
              href="/rental?device=pemf"
              productSlug="pemf"
              source="server_intro"
            >
              Start PEMF rental planning
            </ProductTrackedLink>
            <ProductTrackedLink
              ctaRole="supporting"
              className={`${trackedLinkBaseClass} border border-white/15 bg-white/[0.045] text-white hover:bg-white/[0.07]`}
              href="/research"
              productSlug="pemf"
              source="server_intro"
            >
              Review research limits
            </ProductTrackedLink>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: 'Goal fit first',
                body: 'Start with the condition guide, then decide whether PEMF belongs in the routine.',
              },
              {
                title: 'Claims stay bounded',
                body: 'This hub does not publish PEMF-specific outcome promises beyond the reviewed source set.',
              },
              {
                title: 'Safety screen early',
                body: 'Review implanted-device, pregnancy, seizure-history, and active-bleeding questions before use.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <h2 className="break-words text-sm font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none md:p-6">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200">
                Evidence review
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {siteOwnership.research.team}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200">
                Support
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-white">
                {siteEntity.supportEmail}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200">
                Hours
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{siteEntity.supportHours}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-slate-950/55 p-4">
            <h2 className="break-words text-base font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>Current PEMF evidence posture</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Review the research hub,
              condition pages, device instructions, and support guidance before choosing a routine.
            </p>
          </div>
        </aside>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white shadow-none md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-lime-200">
                  Path map
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  Keep the PEMF decision connected to the wider Hylono graph
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Move from PEMF into condition guides, research,
                  protocols, rental planning, support, and policy pages.
                </p>
              </div>
              <ProductTrackedLink
                ctaRole="supporting"
                className={`${darkPolicyLinkClass} shrink-0`}
                href="/contact?tech=pemf"
                productSlug="pemf"
                source="trust_context"
              >
                Ask Hylono support
              </ProductTrackedLink>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {routeLinks.map((link) => (
                <ProductTrackedLink
                  key={link.href}
                  ctaRole="supporting"
                  className={darkPolicyLinkClass}
                  href={link.href}
                  productSlug="pemf"
                  source="trust_context"
                >
                  {link.label}
                </ProductTrackedLink>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {productPolicyLinks.map((link) => (
                <ProductTrackedLink
                  key={link.href}
                  ctaRole="policy"
                  className={darkPolicyLinkClass}
                  href={link.href}
                  productSlug="pemf"
                  source="trust_context"
                >
                  {link.label}
                </ProductTrackedLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductRltServerIntro({ productName }: { productName: string }) {
  const conditionLinks = conditionGoals
    .filter((goal) => goal.modalities.some((modality) => modality.slug === 'RLT'))
    .map((goal) => ({
      href: `/conditions/${goal.slug}`,
      label: `${goal.title} guide`,
    }));
  const routeLinks = [
    ...conditionLinks,
    { href: '/research', label: 'Research evidence' },
    { href: '/protocols', label: 'Protocol library' },
    { href: '/rental?device=rlt', label: 'Rental planning' },
    { href: '/contact?tech=rlt', label: 'Talk to Hylono' },
  ];

  return (
    <section
      aria-labelledby="product-rlt-intro-title"
      className="border-b border-white/10 bg-slate-950 text-white"
      data-testid="product-rlt-server-intro"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-20">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-200">
            Product hub
          </p>
          <h1
            id="product-rlt-intro-title"
            className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl"
          >
            Red-light hub for protocol-led routine planning
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
            Place {productName} inside comfort, recovery, sleep, or vitality
            planning. A light panel alone is not the full routine.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ProductTrackedLink
              ctaRole="primary"
              className={`${trackedLinkBaseClass} bg-rose-300 text-slate-950 hover:bg-rose-200`}
              eventName="product_route_cta_clicked"
              href="/rental?device=rlt"
              productSlug="rlt"
              source="server_intro"
            >
              Start red-light rental planning
            </ProductTrackedLink>
            <ProductTrackedLink
              ctaRole="supporting"
              className={`${trackedLinkBaseClass} border border-white/15 bg-white/[0.045] text-white hover:bg-white/[0.07]`}
              href="/research"
              productSlug="rlt"
              source="server_intro"
            >
              Review research limits
            </ProductTrackedLink>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: 'Goal fit first',
                body: 'Start with the condition guide, then decide whether red or near-infrared light belongs in the routine.',
              },
              {
                title: 'Evidence limits visible',
                body: 'Hylono does not attach a canonical RLT evidence record to this product hub yet.',
              },
              {
                title: 'Safety screen early',
                body: 'Review eye protection, photosensitivity, medication, and timing questions before planning use.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <h2 className="break-words text-sm font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none md:p-6">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200">
                Evidence review
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {siteOwnership.research.team}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200">
                Support
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-white">
                {siteEntity.supportEmail}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/55 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200">
                Hours
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{siteEntity.supportHours}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-slate-950/55 p-4">
            <h2 className="break-words text-base font-bold text-white" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>Current red-light evidence posture</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use the research hub,
              condition pages, device instructions, and support guidance before choosing a routine.
            </p>
          </div>
        </aside>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white shadow-none md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-200">
                  Path map
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  Keep the red-light decision connected to the wider Hylono graph
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Move from red light into condition guides,
                  research, protocols, rental planning, support, and policy pages.
                </p>
              </div>
              <ProductTrackedLink
                ctaRole="supporting"
                className={`${darkPolicyLinkClass} shrink-0`}
                href="/contact?tech=rlt"
                productSlug="rlt"
                source="trust_context"
              >
                Ask Hylono support
              </ProductTrackedLink>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {routeLinks.map((link) => (
                <ProductTrackedLink
                  key={link.href}
                  ctaRole="supporting"
                  className={darkPolicyLinkClass}
                  href={link.href}
                  productSlug="rlt"
                  source="trust_context"
                >
                  {link.label}
                </ProductTrackedLink>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {productPolicyLinks.map((link) => (
                <ProductTrackedLink
                  key={link.href}
                  ctaRole="policy"
                  className={darkPolicyLinkClass}
                  href={link.href}
                  productSlug="rlt"
                  source="trust_context"
                >
                  {link.label}
                </ProductTrackedLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tech: rawTech } = await params;
  const { canonicalSlug, techData } = resolveProductRoute(rawTech);

  if (!isIndexableProductRouteSlug(canonicalSlug)) {
    return createSecondaryProductRouteMetadata({
      canonicalSlug,
      productName: techData.name,
    });
  }

  const productSummary = getProductSeoDescription(`Hylono ${techData.name}`);
  const approvedOgImage = getApprovedProductMediaPathForPublicUse({
    consumer: 'og',
    imagePath: PRODUCT_OG_IMAGES[canonicalSlug],
    route: `/product/${canonicalSlug}`,
  });

  return createPageMetadata({
    title: `${techData.name} | Pricing, Rental Plans, Specs and Evidence`,
    description: productSummary,
    path: `/product/${canonicalSlug}`,
    ...(approvedOgImage
      ? {
          ogImagePath: approvedOgImage,
          ogImageAlt: `Hylono ${techData.name} wellness technology device`,
        }
      : {}),
  });
}

export default async function ProductPageRoute({ params }: { params: Params }) {
  const { tech: rawTech } = await params;
  const { canonicalSlug, techData } = resolveProductRoute(rawTech);

  if (!isIndexableProductRouteSlug(canonicalSlug)) {
    return (
      <>
        <ProductRouteActionStatus />
        <SecondaryProductRoute canonicalSlug={canonicalSlug} techData={techData} />
      </>
    );
  }

  const productName = `Hylono ${techData.name}`;
  const productDescription = getProductSeoDescription(productName);
  const PRODUCT_IMAGES: Record<string, string> = {
    hbot: '/images/chambers/oxyhelp-chambers-hero.jpg',
    hydrogen: '/images/catalog/omega3/2026/pr-ho450-p.png',
  };
  const routePath = `/product/${canonicalSlug}`;
  const schemaProductImage = getApprovedProductMediaPathForPublicUse({
    consumer: 'schema',
    imagePath: PRODUCT_IMAGES[canonicalSlug],
    route: routePath,
  });
  const fallbackProductId = PRODUCT_CONTENT_ID_BY_ROUTE_SLUG[canonicalSlug];
  const contentProduct =
    getProductForRouteSlug(canonicalSlug) ??
    (fallbackProductId ? productById[fallbackProductId] : undefined);
  const schemaAvailability = getSchemaAvailabilityForProduct(contentProduct);
  const productTopicalLinks = getProductTopicalLinks(
    canonicalSlug,
    contentProduct?.protocolIds ?? []
  );
  const topicalGraphLinks = productTopicalLinks.map((link) => `${SITE_URL}${link.href}`);
  const productEvidenceItems =
    contentProduct?.evidenceIds
      .map((evidenceId) => evidenceById[evidenceId])
      .filter((item): item is Evidence => Boolean(item)) ?? [];
  const similarProductSlugs = getIndexableTechRouteSlugs().filter((s) => s !== canonicalSlug);
  // Must match what the page renders. A visible zloty price against a
  // machine-readable euro one is a rich-result violation as well as a false claim.
  const priceCurrency = PRICE_BOOK_CURRENCY;
  const priceValue = canonicalSlug === 'hbot' ? undefined : contentProduct?.purchasePrice;
  const productSchema = {
    ...createProductSchema({
      name: productName,
      description: productDescription,
      path: routePath,
      price: priceValue,
      priceCurrency,
      availability: schemaAvailability,
      imageUrl: schemaProductImage,
    }),
    ...(techData.technicalSpecs && techData.technicalSpecs.length > 0
      ? {
          additionalProperty: techData.technicalSpecs.map((spec) => ({
            '@type': 'PropertyValue',
            name: spec.label,
            value: spec.value,
          })),
        }
      : {}),
    ...(techData.friendlyName ? { model: techData.friendlyName } : {}),
    ...(similarProductSlugs.length > 0
      ? {
          isSimilarTo: similarProductSlugs.map((s) => {
            const similarTechType = getTechTypeFromRouteSlug(s);
            const similarName = similarTechType ? `Hylono ${TECH_DETAILS[similarTechType].name}` : `Hylono ${s.toUpperCase()}`;
            return {
              '@type': 'Product',
              '@id': `${SITE_URL}/product/${s}#product`,
              name: similarName,
              url: `${SITE_URL}/product/${s}`,
            };
          }),
        }
      : {}),
    ...((() => {
      const PRODUCT_CATEGORY_MAP: Record<string, string> = {
        hbot: 'HBOT',
        pemf: 'PEMF',
        rlt: 'RLT',
        hydrogen: 'Hydrogen',
      };
      const blogCategory = PRODUCT_CATEGORY_MAP[canonicalSlug];
      if (!blogCategory) return {};
      const relatedPosts = BLOG_POSTS.filter((p) => p.category === blogCategory);
      if (relatedPosts.length === 0) return {};
      return {
        subjectOf: relatedPosts.map((post) => ({
          '@type': 'BlogPosting',
          '@id': `${SITE_URL}/blog/${toBlogSlug(post.title)}#article`,
          url: `${SITE_URL}/blog/${toBlogSlug(post.title)}`,
          headline: post.title,
        })),
      };
    })()),
  };
  const GOAL_TAG_TO_CONDITION_SLUG: Record<string, string | undefined> = {
    recovery: 'recovery',
    sleep: 'sleep',
    pain: 'comfort',
    stress: 'stress',
    vitality: 'vitality',
  };
  const conditionMentions = (techData.goalTags ?? [])
    .map((tag) => GOAL_TAG_TO_CONDITION_SLUG[tag])
    .filter((s): s is string => Boolean(s))
    .map((slug) => ({
      '@type': 'WebPage',
      '@id': `${SITE_URL}/conditions/${slug}`,
      url: `${SITE_URL}/conditions/${slug}`,
      name: `${slug.charAt(0).toUpperCase()}${slug.slice(1)} Wellness Guide`,
      about: {
        '@type': 'DefinedTerm',
        '@id': `${SITE_URL}/conditions/${slug}#term`,
        name: `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`,
        url: `${SITE_URL}/conditions/${slug}`,
        inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
      },
    }));
  const webPageSchema = {
    ...createWebPageSchema({
      name: productName,
      description: productDescription,
      path: routePath,
      dateModified: SCHEMA_DATE_MODIFIED,
      imageUrl: schemaProductImage,
    }),
    '@type': 'ItemPage',
    about: [
      { '@type': 'Product', '@id': `${SITE_URL}/product/${canonicalSlug}#product`, name: productName },
      ...(techData.goalTags ?? [])
        .map((tag) => GOAL_TAG_TO_CONDITION_SLUG[tag])
        .filter((s): s is string => Boolean(s))
        .map((slug) => ({
          '@type': 'DefinedTerm',
          '@id': `${SITE_URL}/conditions/${slug}#term`,
          name: `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`,
          url: `${SITE_URL}/conditions/${slug}`,
          inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
        })),
    ],
    mainEntity: { '@id': `${SITE_URL}/product/${canonicalSlug}#product` },
    keywords: [productName, ...(techData.goalTags ?? [])].join(', '),
    ...(conditionMentions.length > 0 ? { mentions: conditionMentions } : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#product-hero'],
    },
    relatedLink: topicalGraphLinks,
  };
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: productName, path: `/product/${canonicalSlug}` },
  ]);
  const productFaqItems = (techData.faqs ?? []).map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  return (
    <>
      <ProductRouteActionStatus />
      <Suspense fallback={null}>
        <StructuredData id="jsonld-product-page" data={webPageSchema} />
        <StructuredData id="jsonld-product" data={productSchema} />
        <StructuredData id="jsonld-breadcrumb" data={breadcrumbSchema} />
        {productFaqItems.length > 0 && (
          <StructuredData
            id="jsonld-product-faq"
            data={createFaqSchema(productFaqItems, `/product/${canonicalSlug}`, `${productName} FAQ`)}
          />
        )}
      </Suspense>
      {canonicalSlug === 'hbot' ? (
        <>
          <HbotReferenceHero />
          <ProductServerDecisionSummary
            canonicalSlug={canonicalSlug}
            contentProduct={contentProduct}
            productName={productName}
            productTopicalLinks={productTopicalLinks}
            techData={techData}
          />
          <ProductOwnershipContext canonicalSlug={canonicalSlug} productName={productName} />
          <ProductClient tech="hbot" hasServerIntro={true} />
          <HbotReferenceContext evidenceItems={productEvidenceItems} />
        </>
      ) : (
        <>
          {canonicalSlug === 'hydrogen' && (
            <ProductHydrogenServerIntro
              evidenceItems={productEvidenceItems}
              productName={productName}
            />
          )}
          {canonicalSlug === 'pemf' && <ProductPemfServerIntro productName={productName} />}
          {canonicalSlug === 'rlt' && <ProductRltServerIntro productName={productName} />}
          <ProductServerDecisionSummary
            canonicalSlug={canonicalSlug}
            contentProduct={contentProduct}
            productName={productName}
            productTopicalLinks={productTopicalLinks}
            techData={techData}
          />
          <ProductOwnershipContext canonicalSlug={canonicalSlug} productName={productName} />
          <ProductClient
            tech={canonicalSlug}
            hasServerIntro={
              canonicalSlug === 'hydrogen' ||
              canonicalSlug === 'pemf' ||
              canonicalSlug === 'rlt'
            }
          />
        </>
      )}
    </>
  );
}

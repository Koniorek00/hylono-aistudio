import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  HYDROGEN_PREMIUM_PUBLIC_PRICE_LABEL,
  getHydrogenPremiumPath,
  hydrogenPremiumLineMeta,
  hydrogenPremiumPageBySlug,
  hydrogenPremiumPages,
  type HydrogenPremiumPageRecord,
  type HydrogenPremiumSlug,
} from '@/content/hydrogen-premium-2026';
import { siteOwnership } from '@/content/site-entity';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createFaqSchema,
  createProductSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { HydrogenPremiumConfigurator } from './HydrogenPremiumConfigurator';
import {
  HydrogenPremiumRouteActionStatus,
  HydrogenPremiumTrackedLink,
} from './HydrogenPremiumTrackedLink';
import {
  buildApplications,
  buildBundles,
  buildEvidenceItems,
  buildFaqItems,
  getDeliveryCards,
  getMetadataDescription,
  getPricingCards,
  getPriceRangeLabel,
  getProtocolFitCards,
  getRouteCards,
  getSafetyCards,
  getScienceCards,
  getScores,
  getSetupReviewItems,
  getStepPlan,
  pairingCards,
  slugifyModel,
} from './hydrogenPremiumPageContent';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
/*
  The visible "Ownership / freshness" stamp must come from the SAME constant that feeds
  the JSON-LD dateModified, which is already imported above and used twice below. It was
  previously the hardcoded string 'April 11, 2026' - one day BEHIND the canonical
  2026-04-12, so the date a customer read differed from the date search engines read, and
  it could never track an update (proof 1009951).

  Formatting matches the two peer health-adjacent surfaces exactly - ConditionDetailShell
  and BlogPage both derive their "Last reviewed" line from this constant the same way -
  so all three families now show one date from one source of truth.

  Do not replace this with a literal again. A frozen freshness stamp on a health-adjacent
  page is worse than none: it tells a visitor the page has not been reviewed since that
  date, and it drifts silently forever.
*/
const LAST_UPDATED = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
}).format(new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`));

function SectionHeading({
  kicker,
  title,
  description,
  accent,
}: {
  kicker: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.34em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2
        className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl"
        style={{ fontFamily: 'var(--font-syncopate), sans-serif' }}
      >
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-white/72 md:text-base">{description}</p>
    </div>
  );
}

function SurfaceCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/44">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-white/72">{body}</p>
    </div>
  );
}

function MetricBar({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs leading-6 text-white/56">{hint}</p>
        </div>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: accent }} />
      </div>
    </div>
  );
}

function ProductSpecCard({
  page,
  variant,
  accent,
}: {
  page: HydrogenPremiumPageRecord;
  variant: HydrogenPremiumPageRecord['variants'][number];
  accent: string;
}) {
  return (
    <article id={`variant-${slugifyModel(variant.model)}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: accent }}>
        {variant.model}
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-sm text-white/46">
            {variant.hydrogen.includes('ppb') ? 'Hydrogen concentration' : 'Hydrogen output'}
          </p>
          <p className="text-2xl font-semibold text-white">{variant.hydrogen}</p>
        </div>
        <div>
          <p className="text-sm text-white/46">
            {variant.oxygen ? 'Oxygen output' : page.lineId === 'water' ? 'Format' : 'Gas profile'}
          </p>
          <p className="text-xl font-semibold text-white">
            {variant.oxygen ?? (page.lineId === 'water' ? 'Hydrogen water system' : 'Pure hydrogen')}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-white/46">Dimensions</p>
            <p className="text-base font-semibold text-white">{variant.dimensions}</p>
          </div>
          <div>
            <p className="text-sm text-white/46">Weight</p>
            <p className="text-base font-semibold text-white">{variant.weight}</p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm text-white/46">Public pricing</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {HYDROGEN_PREMIUM_PUBLIC_PRICE_LABEL}
          </p>
          <p className="text-sm text-white/56">
            Confirm the model, market, currency, and final quote with Hylono support.
          </p>
        </div>
      </div>
    </article>
  );
}

function getFamilyOutputSummary(page: HydrogenPremiumPageRecord) {
  return page.variants
    .map((variant) =>
      variant.oxygen ? `${variant.hydrogen} + ${variant.oxygen} O2` : variant.hydrogen,
    )
    .join(' / ');
}

function getFamilyDeliveryProfile(page: HydrogenPremiumPageRecord) {
  if (page.lineId === 'water') {
    return 'Hydrogen water formats';
  }

  return page.variants.some((variant) => variant.oxygen)
    ? 'Hydrogen + oxygen sessions'
    : 'Pure hydrogen sessions';
}

export function buildHydrogenPremiumMetadata(slug: HydrogenPremiumSlug): Metadata {
  const page = hydrogenPremiumPageBySlug[slug];

  return createPageMetadata({
    title: `${page.title} | Hylono Molecular Hydrogen 2026`,
    description: getMetadataDescription(page),
    path: getHydrogenPremiumPath(slug),
    ogImagePath: page.image,
    ogImageAlt: page.imageAlt,
  });
}

export function HydrogenPremiumPage({ slug }: { slug: HydrogenPremiumSlug }) {
  const page = hydrogenPremiumPageBySlug[slug];
  if (!page) notFound();

  const line = hydrogenPremiumLineMeta[page.lineId];
  const hasMultipleVariants = page.variants.length > 1;
  const familyPages = hydrogenPremiumPages.filter((item) => item.lineId === page.lineId);
  const pricingCards = getPricingCards(page);
  const routeCards = getRouteCards(page);
  const protocolFitCards = getProtocolFitCards(page, line.subtitle, line.rangeLabel);
  const scienceCards = getScienceCards(page);
  const deliveryCards = getDeliveryCards(page);
  const safetyCards = getSafetyCards(page, line.subtitle);
  const applications = buildApplications(page);
  const evidenceItems = buildEvidenceItems(page);
  const bundles = buildBundles(page);
  const faqItems = buildFaqItems(page);
  const stepPlan = getStepPlan(page);
  const setupReviewItems = getSetupReviewItems(page);
  const scores = getScores(page);
  const firstVariant = page.variants[0];
  const heroCompareHref = hasMultipleVariants ? '#select-configuration' : '#family-comparison';
  const heroCompareLabel = hasMultipleVariants ? `Compare ${page.title}` : `Compare the ${line.title}`;

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: 'Hydrogen', path: '/product/hydrogen' },
    { name: page.title, path: getHydrogenPremiumPath(page.slug) },
  ]);

  const webPageSchema = {
    ...createWebPageSchema({
      name: `Hylono Molecular Hydrogen ${page.title}`,
      description: getMetadataDescription(page),
      path: getHydrogenPremiumPath(page.slug),
      dateModified: SCHEMA_DATE_MODIFIED,
      imageUrl: page.image,
    }),
    '@type': 'ItemPage',
    inLanguage: 'en',
  };

  const productSchema =
    page.variants.length === 1
      ? {
          ...createProductSchema({
            name: `Hylono Molecular Hydrogen ${page.title}`,
            description: getMetadataDescription(page),
            path: getHydrogenPremiumPath(page.slug),
            imageUrl: page.image,
          }),
          inLanguage: 'en',
          model: firstVariant?.model,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'ProductGroup',
          '@id': `${SITE_URL}${getHydrogenPremiumPath(page.slug)}#product-group`,
          name: `Hylono Molecular Hydrogen ${page.title}`,
          description: getMetadataDescription(page),
          inLanguage: 'en',
          url: `${SITE_URL}${getHydrogenPremiumPath(page.slug)}`,
          hasVariant: page.variants.map((variant) => ({
            '@type': 'Product',
            '@id': `${SITE_URL}${getHydrogenPremiumPath(page.slug)}#${slugifyModel(variant.model)}`,
            name: `Hylono ${variant.model}`,
            model: variant.model,
          })),
        };

  const configurationSection = (
    <HydrogenPremiumConfigurator
      accent={line.accent}
      lineOrder={line.order}
      lineTitle={line.title}
      lineSubtitle={line.subtitle}
      rangeLabel={line.rangeLabel}
      pageTitle={page.title}
      useCaseLabel={page.useCaseLabel}
      variants={page.variants}
    />
  );

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id={`jsonld-${page.slug}-page`} data={webPageSchema} />
        <StructuredData id={`jsonld-${page.slug}-product`} data={productSchema} />
        <StructuredData id={`jsonld-${page.slug}-breadcrumb`} data={breadcrumbSchema} />
        <StructuredData
          id={`jsonld-${page.slug}-faq`}
          data={createFaqSchema(
            faqItems.map((item) => ({ question: item.question, answer: item.answer })),
            getHydrogenPremiumPath(page.slug),
            `${page.title} FAQ`,
          )}
        />
      </Suspense>

      <div className="bg-[#06080c] text-white">
        <HydrogenPremiumRouteActionStatus />
        <section
          className="relative overflow-hidden border-b border-white/10"
          style={{
            background: `radial-gradient(circle at top right, ${line.glow}, transparent 34%), linear-gradient(135deg, ${line.dark} 0%, #07141e 58%, #04070c 100%)`,
          }}
        >
          <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-8 md:pb-24 md:pt-10">
            <div
              data-testid="hydrogen-premium-breadcrumbs"
              className="text-xs uppercase tracking-[0.24em] text-white/48"
            >
              <HydrogenPremiumTrackedLink
                ctaRole="supporting"
                className="transition-colors hover:text-white"
                href="/"
                productSlug={page.slug}
                source="breadcrumb"
              >
                Home
              </HydrogenPremiumTrackedLink>{' '}
              /{' '}
              <HydrogenPremiumTrackedLink
                ctaRole="supporting"
                className="transition-colors hover:text-white"
                href="/store"
                productSlug={page.slug}
                source="breadcrumb"
              >
                Store
              </HydrogenPremiumTrackedLink>{' '}
              /{' '}
              <HydrogenPremiumTrackedLink
                ctaRole="supporting"
                className="transition-colors hover:text-white"
                href="/product/hydrogen"
                productSlug={page.slug}
                source="breadcrumb"
              >
                Hydrogen
              </HydrogenPremiumTrackedLink>{' '}
              / <span className="text-white">{page.title}</span>
            </div>
            <div className="mt-8 grid gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/48">
                  01 Hero
                </p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.36em]" style={{ color: line.accent }}>
                  {line.order} {line.title}
                </p>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] md:text-6xl" style={{ fontFamily: 'var(--font-syncopate), sans-serif' }}>{page.title}</h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78 md:text-xl">{page.catalogSummary}</p>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 md:text-base">{page.heroSummary}</p>
                <div className="mt-7 flex flex-wrap gap-3">{page.routeBadges.map((badge) => <span key={`${page.slug}-${badge}`} className="rounded-lg border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ borderColor: `${line.accent}55`, color: line.accent, backgroundColor: `${line.accent}12` }}>{badge}</span>)}</div>
                <div className="mt-9 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-5 backdrop-blur"><p className="text-[11px] uppercase tracking-[0.24em] text-white/48">Pricing range</p><p className="mt-3 text-2xl font-semibold text-white">{getPriceRangeLabel(page)}</p></div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-5 backdrop-blur"><p className="text-[11px] uppercase tracking-[0.24em] text-white/48">Output scale</p><p className="mt-3 text-2xl font-semibold text-white">{line.rangeLabel}</p></div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-5 backdrop-blur"><p className="text-[11px] uppercase tracking-[0.24em] text-white/48">Ecosystem fit</p><p className="mt-3 text-2xl font-semibold text-white">HBOT + RLT + PEMF</p></div>
                </div>
                <div data-testid="hydrogen-premium-hero-actions" className="mt-8 flex flex-wrap gap-4">
                  <HydrogenPremiumTrackedLink
                    ctaRole="primary"
                    className="inline-flex min-h-12 items-center justify-center rounded-lg px-6 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                    eventName="product_route_cta_clicked"
                    href="/contact?tech=hydrogen"
                    productSlug={page.slug}
                    source="hero"
                    style={{ backgroundColor: line.accent }}
                  >
                    Request model guidance
                  </HydrogenPremiumTrackedLink>
                  <HydrogenPremiumTrackedLink
                    ctaRole="supporting"
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-6 text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-white/[0.05] motion-reduce:transition-none"
                    href={heroCompareHref}
                    productSlug={page.slug}
                    source="hero"
                  >
                    {heroCompareLabel}
                  </HydrogenPremiumTrackedLink>
                </div>
                <div data-testid="hydrogen-premium-hero-secondary-links" className="mt-4 flex flex-wrap gap-3">
                  <HydrogenPremiumTrackedLink
                    ctaRole="supporting"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/78 transition-colors hover:border-white/20 hover:bg-white/[0.04] motion-reduce:transition-none"
                    href="/rental?device=hydrogen"
                    productSlug={page.slug}
                    source="hero"
                  >
                    Review rental access
                  </HydrogenPremiumTrackedLink>
                  <HydrogenPremiumTrackedLink
                    ctaRole="supporting"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/78 transition-colors hover:border-white/20 hover:bg-white/[0.04] motion-reduce:transition-none"
                    href="/product/hydrogen"
                    productSlug={page.slug}
                    source="hero"
                  >
                    Open H2 reference page
                  </HydrogenPremiumTrackedLink>
                </div>
                <div className="mt-8 rounded-lg border border-white/10 bg-black/20 p-5 backdrop-blur"><div className="flex flex-wrap items-center gap-4 text-sm text-white/70"><span style={{ color: line.accent }}>Ownership / freshness</span><span>{siteOwnership.editorial.team}</span><span>{siteOwnership.research.team}</span><span>{siteOwnership.commerce.team}</span><span>{LAST_UPDATED}</span></div></div>
              </div>
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                  <div className="relative aspect-[4/4] overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(180deg,#07131d_0%,#091925_100%)]"><Image src={page.image} alt={page.imageAlt} fill priority sizes="(min-width: 1280px) 38vw, (min-width: 1024px) 42vw, 100vw" className="object-contain p-8" /></div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">{page.variants.map((variant) => <div key={`${page.slug}-${variant.model}`} className="rounded-lg border border-white/10 bg-black/20 p-4"><p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: line.accent }}>{variant.model}</p><p className="mt-3 text-xl font-semibold text-white">{variant.hydrogen}</p><p className="mt-2 text-sm text-white/58">{variant.oxygen ?? (page.lineId === 'water' ? 'Hydrogen water option' : 'Pure hydrogen')}</p></div>)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasMultipleVariants ? configurationSection : null}

        <section id="family-comparison" data-testid="hydrogen-premium-family-comparison" className="border-b border-white/8 bg-[#0b0f15] py-18">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <SectionHeading
              kicker="Family Comparison"
              title={`Compare the ${line.title} before you settle on one footprint`}
              description="A conservative way to keep this premium PDP honest is to show where this model sits inside its own family: output, delivery logic, price range, and the kind of room or routine it suits."
              accent={line.accent}
            />
            <div className="mt-10 grid gap-5 xl:grid-cols-3">
              {familyPages.map((familyPage) => {
                const isCurrentPage = familyPage.slug === page.slug;

                return (
                  <article
                    key={familyPage.slug}
                    className={`rounded-lg border p-6 ${
                      isCurrentPage ? 'bg-white/[0.06]' : 'bg-white/[0.03]'
                    }`}
                    style={{
                      borderColor: isCurrentPage ? `${line.accent}66` : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.28em]"
                        style={{ color: line.accent }}
                      >
                        {isCurrentPage ? 'Current page' : 'Compare in this line'}
                      </p>
                      <span className="text-xs font-medium text-white/54">
                        {getPriceRangeLabel(familyPage)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold text-white">{familyPage.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      {familyPage.catalogSummary}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/44">
                          Output profile
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {getFamilyOutputSummary(familyPage)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/44">
                          Delivery profile
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {getFamilyDeliveryProfile(familyPage)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-6 text-sm leading-7 text-white/64">{familyPage.useCaseLabel}</p>
                    <HydrogenPremiumTrackedLink
                      ctaRole="supporting"
                      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-white/24 hover:bg-white/[0.05] motion-reduce:transition-none"
                      href={
                        isCurrentPage
                          ? '#select-configuration'
                          : getHydrogenPremiumPath(familyPage.slug)
                      }
                      productSlug={page.slug}
                      source="family_comparison"
                    >
                      {isCurrentPage ? 'Review this configuration' : `Compare ${familyPage.title}`}
                    </HydrogenPremiumTrackedLink>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 bg-[#06080c] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="02 Pricing & Access Options" title="Pricing, access logic, and ownership context" description="This section keeps the public commercial boundary clear: model fit and access logic are visible, while pricing, currency, availability, and final terms are confirmed through Hylono support before commitment." accent={line.accent} /><div className="mt-10 grid gap-5 lg:grid-cols-4">{pricingCards.map((card) => <SurfaceCard key={`${page.slug}-${card.title}`} title={card.title} body={card.body} />)}</div></div></section>

        {hasMultipleVariants ? null : configurationSection}

        <section data-testid="hydrogen-premium-route-map" className="border-b border-white/8 bg-[#0b0f15] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="03 Browse This Page" title="Where this page sits inside the Hylono path" description="Every model page still needs to push the user forward: into the broader hydrogen reference page, cited research, relevant protocols, and the commercial next step." accent={line.accent} /><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{routeCards.map((card) => <HydrogenPremiumTrackedLink key={`${page.slug}-${card.title}`} ctaRole="supporting" className="rounded-lg border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/24 hover:bg-white/[0.05]" href={card.href} productSlug={page.slug} source="route_map"><p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: line.accent }}>Page</p><h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3><p className="mt-3 text-sm leading-7 text-white/64">{card.description}</p></HydrogenPremiumTrackedLink>)}</div></div></section>

        <section className="border-b border-white/8 bg-[#06080c] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="04 Protocol Fit" title="Where this configuration makes sense in practice" description="Hylono buyers are not looking for a random device. They are looking for the right place for a configuration inside a real weekly routine, room, and stack." accent={line.accent} /><div className="mt-10 grid gap-5 lg:grid-cols-3">{protocolFitCards.map((card) => <SurfaceCard key={`${page.slug}-${card.title}`} title={card.title} body={card.body} />)}</div></div></section>

        <section className="border-b border-white/8 bg-[#0b0f15] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="05 SimpleScience / The Science of Small" title="Why hydrogen belongs in this architecture" description="The real advantage is not marketing weight. It is the precision of a small molecule, the repeatability of the ritual, and the way the right configuration reduces protocol friction." accent={line.accent} /><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{scienceCards.map((card) => <div key={`${page.slug}-${card.title}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-6"><p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: line.accent }}>SimpleScience</p><h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3><p className="mt-3 text-sm leading-7 text-white/66">{card.description}</p></div>)}</div></div></section>

        <section className="border-b border-white/8 bg-[#06080c] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="06 Key Specifications" title="Model data and public pricing boundary" description="Exact model codes, hydrogen output, dimensions, and the request-only pricing boundary stay visible here so the page does not drift into vague premium language with no factual layer underneath." accent={line.accent} /><div className="mt-10 grid gap-5 lg:grid-cols-3">{page.variants.map((variant) => <ProductSpecCard key={`${page.slug}-${variant.model}`} page={page} variant={variant} accent={line.accent} />)}</div></div></section>

        <section data-testid="hydrogen-premium-delivery-paths" className="border-b border-white/8 bg-[#0b0f15] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="07 Complete System / Four Ways to Receive" title="How hydrogen enters the Hylono ecosystem" description="Hydrogen is not one single ritual. It can enter through inhalation, dissolved-water access, immersion, showering, or a mobile format depending on the model family." accent={line.accent} /><div className="mt-10 grid gap-5 lg:grid-cols-4">{deliveryCards.map((card) => <HydrogenPremiumTrackedLink key={`${page.slug}-${card.title}`} ctaRole="supporting" href={card.href} productSlug={page.slug} source="delivery_path" className="rounded-lg border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/24 hover:bg-white/[0.05]"><h3 className="text-xl font-semibold text-white">{card.title}</h3><p className="mt-3 text-sm leading-7 text-white/66">{card.description}</p></HydrogenPremiumTrackedLink>)}</div></div></section>

        <section className="border-b border-white/8 bg-[#06080c] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="08 Safety & Contraindications" title="Operational safety, handling, and conservative boundaries" description="The page stays tied to verified product guidance. Where public details stay silent, the page says so rather than inventing unsupported medical certainty." accent={line.accent} /><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{safetyCards.map((card) => <div key={`${page.slug}-${card.title}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-6"><h3 className="text-xl font-semibold text-white">{card.title}</h3><p className="mt-3 text-sm leading-7 text-white/66">{card.description}</p></div>)}</div></div></section>

        <section data-testid="hydrogen-premium-evidence-links" className="border-b border-white/8 bg-[#0b0f15] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="09 Scientific Evidence" title="The evidence layer supporting this category" description="Only cited evidence that is already surfaced inside Hylono appears here, with limitation language kept visible alongside the positive findings." accent={line.accent} /><div className="mt-10 grid gap-5 xl:grid-cols-3">{evidenceItems.map((item) => <article key={item.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-6"><p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: line.accent }}>{item.studyType}</p><h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-7 text-white/66">{item.publication}, {item.year} • {item.authors}</p><p className="mt-4 text-sm leading-7 text-white/70">{item.resultSummary}</p><HydrogenPremiumTrackedLink ctaRole="supporting" href={item.sourceUrl} productSlug={page.slug} source="evidence_path" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex text-sm font-semibold" style={{ color: line.accent }}>Open study</HydrogenPremiumTrackedLink></article>)}</div></div></section>

        <section data-testid="hydrogen-premium-application-paths" className="border-b border-white/8 bg-[#06080c] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="10 Research-Backed Applications" title="Where buyers usually want guidance" description="These aren't fixed-result or medical claims. They're the directions we use to build the condition → research → product → protocol → contact path." accent={line.accent} /><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{applications.map((application) => <HydrogenPremiumTrackedLink key={`${page.slug}-${application.title}`} ctaRole="supporting" href={application.href} productSlug={page.slug} source="application_path" className="rounded-lg border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/24 hover:bg-white/[0.05]"><h3 className="text-xl font-semibold text-white">{application.title}</h3><p className="mt-3 text-sm leading-7 text-white/66">{application.description}</p></HydrogenPremiumTrackedLink>)}</div></div></section>

        <section className="border-b border-white/8 bg-[#0b0f15] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="11 Setup Sequence + Review Signals" title="How to implement the system without adding chaos" description="Order matters. First stabilize the setup rhythm, then decide whether the stack needs more intensity, more complexity, or a different access path." accent={line.accent} /><div className="mt-10 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]"><div className="grid gap-5">{stepPlan.map((step, index) => <div key={`${page.slug}-${step}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-6"><p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: line.accent }}>Step {index + 1}</p><p className="mt-4 text-sm leading-7 text-white/66">{step}</p></div>)}</div><div className="rounded-lg border border-white/10 bg-white/[0.03] p-6"><p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: line.accent }}>Review signals</p><ul className="mt-6 space-y-4">{setupReviewItems.map((item) => <li key={`${page.slug}-${item}`} className="rounded-lg border border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white/72">{item}</li>)}</ul></div></div></div></section>

        <section className="border-b border-white/8 bg-[#06080c] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="12 Performance Profile" title="Scale, readiness, and system fit" description="This is not a medical benchmark. It is a practical reading of how the device sits inside its own line and inside the wider Hylono ecosystem." accent={line.accent} /><div className="mt-10 grid gap-5 xl:grid-cols-2">{scores.map((score) => <MetricBar key={`${page.slug}-${score.label}`} label={score.label} value={score.value} hint={score.hint} accent={line.accent} />)}</div></div></section>

        <section data-testid="hydrogen-premium-pairing-paths" className="border-b border-white/8 bg-[#0b0f15] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="13 Synergies / Pairs Well With" title="What this configuration pairs with best" description="Good hydrogen pages don't pretend the device is a whole ecosystem on its own. They show exactly where it fits beside the rest of the stack." accent={line.accent} /><div className="mt-10 grid gap-5 xl:grid-cols-3">{pairingCards.map((pairing) => <HydrogenPremiumTrackedLink key={`${page.slug}-${pairing.title}`} ctaRole="supporting" href={pairing.href} productSlug={page.slug} source="pairing_path" className="rounded-lg border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/24 hover:bg-white/[0.05]"><h3 className="text-xl font-semibold text-white">{pairing.title}</h3><p className="mt-3 text-sm leading-7 text-white/66">{pairing.description}</p></HydrogenPremiumTrackedLink>)}</div></div></section>

        <section data-testid="hydrogen-premium-bundle-paths" className="border-b border-white/8 bg-[#06080c] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="14 Curated Packages / Bundles" title="Protocols and packages where this model belongs naturally" description="Each package ties the hardware to evidence, routines, and the next decision — without drifting into abstract bundle talk." accent={line.accent} /><div className="mt-10 grid gap-5 xl:grid-cols-3">{bundles.map((bundle) => <HydrogenPremiumTrackedLink key={`${page.slug}-${bundle.title}`} ctaRole="supporting" href={bundle.href} productSlug={page.slug} source="bundle_path" className="rounded-lg border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/24 hover:bg-white/[0.05]"><h3 className="text-xl font-semibold text-white">{bundle.title}</h3><p className="mt-3 text-sm leading-7 text-white/66">{bundle.description}</p></HydrogenPremiumTrackedLink>)}</div></div></section>

        <section className="border-b border-white/8 bg-[#0b0f15] py-18"><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="15 FAQ" title="What buyers usually need clarified before deciding" description="The FAQ keeps answers grounded in what's already on the page and only adds the context you need to make a clean decision." accent={line.accent} /><div className="mt-10 grid gap-5 xl:grid-cols-2">{faqItems.map((item) => <details key={`${page.slug}-${item.question}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-6"><summary className="cursor-pointer list-none text-lg font-semibold text-white">{item.question}</summary><p className="mt-4 text-sm leading-7 text-white/70">{item.answer}</p></details>)}</div></div></section>

        <section data-testid="hydrogen-premium-final-cta" className="relative overflow-hidden py-20" style={{ background: `radial-gradient(circle at top left, ${line.glow}, transparent 36%), linear-gradient(135deg, #0d1320 0%, ${line.dark} 100%)` }}><div className="mx-auto max-w-7xl px-6 md:px-8"><SectionHeading kicker="16 Next Steps / Final CTA" title="Move from configuration browsing to a real decision" description="A spec sheet isn't a finish line. You need a next move: compare the right configuration, talk buyout or rental, and place the model inside the wider Hylono stack." accent={line.accent} /><div className="mt-10 grid gap-6 xl:grid-cols-[1fr_0.92fr]"><div className="rounded-lg border border-white/12 bg-black/20 p-7 backdrop-blur"><h3 className="text-3xl font-semibold text-white">Compare, ask about buyout, or move into consultation</h3><p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">If the configuration feels too calm, too advanced, or hard to place next to HBOT, RLT, or PEMF, the next step is sizing the protocol and the room before you commit.</p><div data-testid="hydrogen-premium-final-actions" className="mt-8 flex flex-wrap gap-4"><HydrogenPremiumTrackedLink ctaRole="primary" className="inline-flex min-h-12 items-center justify-center rounded-lg px-6 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" eventName="product_route_cta_clicked" href="/contact?tech=hydrogen" productSlug={page.slug} source="final_cta" style={{ backgroundColor: line.accent }}>Request model guidance</HydrogenPremiumTrackedLink><HydrogenPremiumTrackedLink ctaRole="supporting" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-6 text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-white/[0.05] motion-reduce:transition-none" href="/rental?device=hydrogen" productSlug={page.slug} source="final_cta">Review rental access</HydrogenPremiumTrackedLink></div><div className="mt-4"><HydrogenPremiumTrackedLink ctaRole="supporting" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/78 transition-colors hover:border-white/20 hover:bg-white/[0.04] motion-reduce:transition-none" href="/product/hydrogen" productSlug={page.slug} source="final_cta">Return to hydrogen hub</HydrogenPremiumTrackedLink></div></div><div className="grid gap-5"><SurfaceCard title="Trust after purchase" body="The trust layer stays practical: warranty context, policy links, advisory support, and a clear way back to a real person." /><SurfaceCard title="Plan with confidence" body="Shipping, returns, and warranty stay one click away, so the terms are easy to check before you buy." /><div data-testid="hydrogen-premium-trust-links" className="grid gap-4 sm:grid-cols-3"><HydrogenPremiumTrackedLink ctaRole="policy" className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-semibold text-white/84" href="/shipping" productSlug={page.slug} source="trust_context">Shipping</HydrogenPremiumTrackedLink><HydrogenPremiumTrackedLink ctaRole="policy" className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-semibold text-white/84" href="/returns" productSlug={page.slug} source="trust_context">Returns</HydrogenPremiumTrackedLink><HydrogenPremiumTrackedLink ctaRole="policy" className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-semibold text-white/84" href="/warranty" productSlug={page.slug} source="trust_context">Warranty</HydrogenPremiumTrackedLink></div></div></div></div></section>
      </div>
    </>
  );
}

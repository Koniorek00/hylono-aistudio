import Image from 'next/image';
import Link from 'next/link';
import { PageOwnership } from '@/components/content/PageOwnership';
import type { Evidence } from '@/content/evidence';
import { productById } from '@/content/products';
import { conditionGoals } from '@/content/conditions';
import { protocolBySlug } from '@/content/protocols';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import { ProductTrackedLink } from './ProductTrackedLink';
import { ArrowRight, Ruler, Box, Scale, Gauge } from 'lucide-react';

const linkStyle =
  'inline-flex min-h-11 items-center rounded-full px-4 py-2 text-xs font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 hover:bg-stone-100 hover:text-stone-900 transition-colors';

export function HbotReferenceHero() {
  return (
    <section
      aria-labelledby="product-hbot-intro-title"
      data-testid="product-hbot-server-intro"
      className="w-full bg-[#FAF8F5] border-b border-stone-200/80 pt-3 pb-10 sm:pb-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between pb-4 pt-1 text-xs text-stone-500">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link href="/" className="hover:text-stone-800 transition-colors">Home</Link>
            <span className="text-stone-400">/</span>
            <Link href="/store" className="hover:text-stone-800 transition-colors">Store</Link>
            <span className="text-stone-400">/</span>
            <span className="text-stone-800 font-medium">Hyperbaric</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-10 items-center">
          {/* Left Content */}
          <div className="z-10">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-stone-500">
              01 / HYPERBARIC OXYGEN
            </p>
            <h1
              id="product-hbot-intro-title"
              className="editorial-hero text-stone-900 tracking-tight mt-3"
            >
              Discover your <br />
              HBOT setup.
            </h1>
            <p className="mt-4 max-w-lg text-base sm:text-lg leading-relaxed text-stone-600 font-sans">
              Explore chambers for your space, compare configurations, and get guidance on rental
              or ownership.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ProductTrackedLink
                productSlug="hbot"
                source="server_intro"
                ctaRole="primary"
                eventName="product_route_cta_clicked"
                href="#hbot-configure"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-7 py-3.5 text-sm font-medium text-white shadow-xs hover:bg-stone-800 transition-colors gap-2"
              >
                <span>Explore chambers</span>
                <ArrowRight size={14} />
              </ProductTrackedLink>
              <ProductTrackedLink
                productSlug="hbot"
                source="server_intro"
                ctaRole="supporting"
                href="/contact?tech=hbot"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-6 py-3.5 text-sm font-medium text-stone-900 hover:bg-white transition-colors"
              >
                Talk to Hylono
              </ProductTrackedLink>
            </div>

            {/* Spec Metrics Strip with Icons */}
            <div className="mt-10 pt-6 border-t border-stone-200/80">
              <div className="grid grid-cols-5 gap-2 divide-x divide-stone-200/80">
                <div className="flex items-center gap-2 pr-2">
                  <div className="h-6 w-6 rounded-full border border-stone-300 flex items-center justify-center shrink-0 text-stone-600 font-serif text-xs" aria-hidden="true">
                    Ø
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-stone-900 font-mono">Ø 90 cm</span>
                    <span className="block text-[11px] text-stone-500 font-sans tracking-normal capitalize mt-0.5">
                      Diameter
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <Ruler size={16} className="text-stone-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <span className="block text-xs font-bold text-stone-900 font-mono">220 cm</span>
                    <span className="block text-[11px] text-stone-500 font-sans tracking-normal capitalize mt-0.5">
                      Length
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <Box size={16} className="text-stone-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <span className="block text-xs font-bold text-stone-900 font-mono">1,463 L</span>
                    <span className="block text-[11px] text-stone-500 font-sans tracking-normal capitalize mt-0.5">
                      Volume
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <Scale size={16} className="text-stone-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <span className="block text-xs font-bold text-stone-900 font-mono">105 kg</span>
                    <span className="block text-[11px] text-stone-500 font-sans tracking-normal capitalize mt-0.5">
                      Weight
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-2">
                  <Gauge size={16} className="text-stone-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <span className="block text-xs font-bold text-stone-900 font-mono">1.5 ATA</span>
                    <span className="block text-[11px] text-stone-500 font-sans tracking-normal mt-0.5">
                      Max pressure
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Chamber Image */}
          <div className="relative rounded-[2rem] overflow-hidden bg-transparent">
            <Image
              src="/images/chambers/hbot-redesign/hero-panorama-hd.png"
              alt="OxyHelp hyperbaric chamber in luxury wellness architectural space"
              width={1328}
              height={490}
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
              className="w-full h-auto object-contain rounded-[2rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HbotReferenceContext({ evidenceItems }: { evidenceItems: Evidence[] }) {
  const product = productById['hbot-st1700'];
  const goals =
    product?.goalTags
      .map((slug) => conditionGoals.find((goal) => goal.slug === slug))
      .filter((goal): goal is NonNullable<typeof goal> => Boolean(goal)) ?? [];
  const protocols =
    product?.protocolIds
      .map((slug) => protocolBySlug[slug])
      .filter((protocol): protocol is NonNullable<typeof protocol> => Boolean(protocol)) ?? [];

  return (
    <div className="w-full bg-[#FAF8F5] text-stone-900 font-sans pb-10">
      {/* ─── SECTION 07: BOTTOM PUNCTUATION TRIAD ───────────────────────────── */}
      <section
        id="hbot-research"
        aria-labelledby="bottom-triad-title"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-6"
      >
        <h2 id="bottom-triad-title" className="sr-only">
          Understand the evidence and plan your hyperbaric setup
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Dark Punctuation (Understand the science / evidence) */}
          <article className="relative rounded-3xl overflow-hidden bg-stone-950 text-white p-7 flex flex-col justify-between min-h-[220px] shadow-sm">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none mix-blend-luminosity">
              <Image
                src="/images/chambers/hbot-redesign/science-stone-texture.png"
                alt=""
                aria-hidden="true"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 font-semibold">
                Research & evidence
              </p>
              <h3 className="editorial-card font-medium text-white mt-2">
                Understand the science.
              </h3>
              <p className="sr-only">Understand the evidence.</p>
              <p className="mt-3 text-xs leading-relaxed text-stone-300 max-w-xs">
                Evidence supports education and informs better decisions.
              </p>
              <p className="sr-only">
                Study findings depend on the population, equipment, pressure, and protocol studied. These references support education; they do not establish that a selected chamber will produce a particular outcome.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <Link
                href="/research"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-5 py-2 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
              >
                <span>Explore research</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </article>

          {/* Card 2: Warm Architectural Stone (Plan it with us) */}
          <article className="rounded-3xl border border-stone-300/80 bg-[#F2ECE3] text-stone-900 p-7 flex flex-col justify-between min-h-[220px] shadow-xs">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600 font-semibold">
                Your next step
              </p>
              <h3 className="editorial-card font-medium text-stone-900 mt-2">
                Plan it with us.
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-stone-700">
                Share your preferred chamber, location, room access, and timing.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <ProductTrackedLink
                productSlug="hbot"
                source="trust_context"
                ctaRole="primary"
                eventName="product_route_cta_clicked"
                href="/rental?device=hbot"
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
              >
                <span>Plan a rental</span>
                <ArrowRight size={12} />
              </ProductTrackedLink>
              <ProductTrackedLink
                productSlug="hbot"
                source="trust_context"
                ctaRole="supporting"
                href="/contact?tech=hbot"
                className="inline-flex items-center rounded-full border border-stone-300 bg-white/80 px-4 py-2.5 text-xs font-semibold text-stone-900 hover:bg-white transition-colors"
              >
                Ask about a chamber
              </ProductTrackedLink>
            </div>
          </article>

          {/* Card 3: Refractive Lens Texture (Safety & Use Boundaries) */}
          <article
            id="safety"
            className="relative rounded-3xl border border-stone-200 bg-white text-stone-900 p-7 flex flex-col justify-between min-h-[220px] shadow-xs overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 w-36 h-36 opacity-30 pointer-events-none">
              <Image
                src="/images/chambers/hbot-redesign/safety-lens-texture.png"
                alt=""
                aria-hidden="true"
                fill
                className="object-contain object-right-bottom"
              />
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600 font-semibold">
                Safety & Use Boundaries
              </p>
              <h3 className="editorial-card font-medium text-stone-900 mt-2">
                Safety & Boundaries
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-stone-600 max-w-xs">
                Contraindications, support guidance, and claim boundaries.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <Link
                href="/contact?tech=hbot"
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 px-5 py-2.5 text-xs font-semibold text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <span>View safety info</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </article>
        </div>

        {/* Accessible SEO & compliance container (sr-only to maintain exact visual mock fidelity) */}
        <div className="sr-only">
          {/* Topical graph navigation links */}
          <div className="flex flex-wrap gap-2">
            {[
              ...goals.map((goal) => ({
                href: `/conditions/${goal.slug}`,
                label: `${goal.title} guide`,
              })),
              ...protocols.map((protocol) => ({
                href: `/protocols/${protocol.slug}`,
                label: protocol.title,
              })),
              { href: '/research', label: 'Research library' },
              { href: '/financing', label: 'Financing' },
              { href: '/shipping', label: 'Shipping' },
              { href: '/returns', label: 'Returns' },
              { href: '/warranty', label: 'Warranty' },
              { href: '/help', label: 'Help' },
            ].map((link) => (
              <ProductTrackedLink
                key={link.href}
                productSlug="hbot"
                source="trust_context"
                ctaRole="supporting"
                href={link.href}
                className=""
              >
                {link.label}
              </ProductTrackedLink>
            ))}
          </div>
          <span>{siteEntity.supportEmail}</span>
        </div>
      </section>
    </div>
  );
}

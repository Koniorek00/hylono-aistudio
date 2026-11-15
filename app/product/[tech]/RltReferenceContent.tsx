import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ClipboardList, ShieldCheck, Target } from 'lucide-react';
import { TECH_DETAILS } from '@/constants';
import { conditionGoals } from '@/content/conditions';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { TechType } from '@/types';
import { ProductTrackedLink } from './ProductTrackedLink';
import rltStyles from './rlt-reference.module.css';

const rltTech = TECH_DETAILS[TechType.RLT];

const pillLinkClass =
  'inline-flex min-h-11 items-center rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-xs font-semibold text-stone-800 transition-colors hover:border-rose-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-900 motion-reduce:transition-none';

const productPolicyLinks = [
  { href: '/shipping', label: 'Shipping policy' },
  { href: '/returns', label: 'Returns policy' },
  { href: '/warranty', label: 'Warranty policy' },
  { href: '/help', label: 'Help center' },
];

const rltConditionLinks = conditionGoals
  .filter((goal) => goal.modalities.some((modality) => modality.slug === 'RLT'))
  .map((goal) => ({ href: `/conditions/${goal.slug}`, label: `${goal.title} guide` }));

const rltRouteLinks = [
  ...rltConditionLinks,
  { href: '/research', label: 'Research evidence' },
  { href: '/protocols', label: 'Protocol library' },
  { href: '/rental?device=rlt', label: 'Rental planning' },
  { href: '/contact?tech=rlt', label: 'Talk to Hylono' },
];

const routineCards = [
  {
    icon: Target,
    title: 'Goal fit first',
    body: 'Start with the condition guide, then decide whether red or near-infrared light belongs in the routine.',
  },
  {
    icon: ClipboardList,
    title: 'Evidence limits visible',
    body: 'Hylono keeps red-light language at wavelength, timing, screening, and access level until a reviewed research summary is published.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety screen early',
    body: 'Review eye protection, photosensitivity, medication, and timing questions before planning use.',
  },
] as const;

export function RltReferenceHero({ productName }: { productName: string }) {
  const specs = rltTech.technicalSpecs ?? [];

  return (
    <section
      aria-labelledby="product-rlt-intro-title"
      className="w-full border-b border-stone-200/80 bg-[#FBF7F4] pt-3 pb-12 sm:pb-16"
      data-testid="product-rlt-server-intro"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 pt-1 text-xs text-stone-500">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link href="/" className="transition-colors hover:text-stone-800">
              Home
            </Link>
            <span className="text-stone-400">/</span>
            <Link href="/store" className="transition-colors hover:text-stone-800">
              Store
            </Link>
            <span className="text-stone-400">/</span>
            <Link href="/product/rlt" className="transition-colors hover:text-stone-800">
              PBM / Red Light
            </Link>
            <span className="text-stone-400">/</span>
            <span className="font-medium text-stone-800">Reference view</span>
          </nav>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-stone-500">
            Reference redesign review {rltTech.lastReviewed}
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-900">
              01 / PBM / Red Light
            </p>
            <h1 id="product-rlt-intro-title" className="editorial-hero mt-3 text-stone-900">
              Red-light hub for protocol-led routine planning
            </h1>
            <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-stone-600 sm:text-lg">
              Use this page to place {productName} inside comfort, recovery, sleep, or vitality
              planning before treating a light panel as the answer on its own.
            </p>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-stone-500">
              The reference-supported model is simple: regular short sessions, sensible spacing,
              and eye protection. Daily habits carry the rest.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ProductTrackedLink
                ctaRole="primary"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-rose-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-rose-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-900 motion-reduce:transition-none"
                eventName="product_route_cta_clicked"
                href="/rental?device=rlt"
                productSlug="rlt"
                source="server_intro"
              >
                <span>Start red-light rental planning</span>
                <ArrowRight size={14} aria-hidden="true" />
              </ProductTrackedLink>
              <ProductTrackedLink
                ctaRole="supporting"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white/80 px-6 py-3.5 text-sm font-medium text-stone-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-900 motion-reduce:transition-none"
                href="/research"
                productSlug="rlt"
                source="server_intro"
              >
                Review research limits
              </ProductTrackedLink>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-stone-200/80 pt-6 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="font-sans text-[11px] uppercase tracking-[0.14em] text-stone-500">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 font-mono text-xs font-bold text-stone-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="relative m-0 overflow-hidden rounded-[2rem] border border-stone-200/80 bg-[#F7EDE7]">
            <Image
              alt="Red and near-infrared light panel arranged for a home routine-planning setup"
              className="h-auto w-full object-cover"
              height={900}
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              src="/images/landing/card-redlight-v2.jpg"
              width={1200}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/70 to-transparent"
            />
            <figcaption className="absolute bottom-5 left-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white">
              660 nm / 850 nm planning view
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function RltReferencePlanning() {
  return (
    <section
      aria-labelledby="product-rlt-planning-title"
      className="w-full border-b border-stone-200/80 bg-[#FBF7F4] pb-12 sm:pb-16"
      data-testid="product-rlt-planning"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="product-rlt-planning-title" className="sr-only">
          Red-light planning, evidence posture, and support paths
        </h2>
        <div className="grid grid-cols-1 gap-4 pt-12 md:grid-cols-3">
          {routineCards.map((card) => (
            <article
              key={card.title}
              className="flex flex-col rounded-[2rem] border border-stone-200/80 bg-white p-6"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-900"
              >
                <card.icon size={16} strokeWidth={1.6} />
              </span>
              <h2 className="editorial-card mt-4 text-stone-900">{card.title}</h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-stone-600">{card.body}</p>
            </article>
          ))}
        </div>
        <div className="relative mt-12 overflow-hidden rounded-[2rem] bg-stone-950 p-7 text-white md:p-10">
          <div
            aria-hidden="true"
            className={`${rltStyles.emberGlow} pointer-events-none absolute inset-0 opacity-60`}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-200">
                Evidence review
              </p>
              <h2 className="editorial-section mt-3 text-white">
                Current red-light evidence posture
              </h2>
              <p className="mt-4 max-w-xl font-sans text-sm leading-7 text-stone-300">
                Hylono frames this hub as equipment and access orientation. Use the research hub,
                condition pages, device instructions, and support guidance before choosing a
                routine.
              </p>
              <p className="mt-3 max-w-xl font-sans text-sm leading-7 text-stone-300">
                Hylono has not published a red-light research summary for this page yet, so treat it
                as equipment and access guidance rather than outcome proof.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ProductTrackedLink
                  ctaRole="supporting"
                  className={pillLinkClass}
                  href="/research"
                  productSlug="rlt"
                  source="trust_context"
                >
                  Open research hub
                </ProductTrackedLink>
                <ProductTrackedLink
                  ctaRole="supporting"
                  className={pillLinkClass}
                  href="/protocols"
                  productSlug="rlt"
                  source="trust_context"
                >
                  Open protocol pathways
                </ProductTrackedLink>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose-200">
                  Review owner
                </p>
                <p className="mt-2 font-sans text-sm font-semibold text-white">
                  {siteOwnership.research.team}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose-200">
                  Support
                </p>
                <p className="mt-2 break-all font-sans text-sm font-semibold text-white">
                  {siteEntity.supportEmail}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose-200">
                  Support hours
                </p>
                <p className="mt-2 font-sans text-sm font-semibold text-white">
                  {siteEntity.supportHours}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 rounded-[2rem] border border-stone-200/80 bg-white p-7 md:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-900">
                Path map
              </p>
              <h2 className="editorial-section mt-3 text-stone-900">
                Keep the red-light decision connected to the wider Hylono graph
              </h2>
              <p className="mt-3 max-w-3xl font-sans text-sm leading-7 text-stone-600">
                Use the links below to move from red light into condition guides, research,
                protocols, rental planning, support, and policy pages.
              </p>
            </div>
            <ProductTrackedLink
              ctaRole="supporting"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-900 motion-reduce:transition-none"
              href="/contact?tech=rlt"
              productSlug="rlt"
              source="trust_context"
            >
              Ask Hylono support
            </ProductTrackedLink>
          </div>

          <div className="mt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
              Condition, research, and protocol paths
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {rltRouteLinks.map((link) => (
                <ProductTrackedLink
                  key={link.href}
                  ctaRole="supporting"
                  className={pillLinkClass}
                  href={link.href}
                  productSlug="rlt"
                  source="trust_context"
                >
                  {link.label}
                </ProductTrackedLink>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-stone-200/80 pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
              Commerce and policy paths
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {productPolicyLinks.map((link) => (
                <ProductTrackedLink
                  key={link.href}
                  ctaRole="policy"
                  className={pillLinkClass}
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
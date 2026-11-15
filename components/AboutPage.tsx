import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Cookie,
  ExternalLink,
  FileCheck,
  FlaskConical,
  Headphones,
  Landmark,
  LifeBuoy,
  Lock,
  Mail,
  MessageSquare,
  Newspaper,
  PenTool,
  RotateCcw,
  Scroll,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  Users,
} from 'lucide-react';
import {
  AboutRouteActionStatus,
  AboutTrackedEmailLink,
  AboutTrackedLink,
} from '@/components/AboutTrackedLink';
import { advisorsContent } from '@/content/advisors';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';

const serifFontFamily: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Playfair Display", Didot, Georgia, serif',
};

const primaryButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #9C6F42 0%, #7D5228 100%)',
  color: '#FFFFFF',
  border: '1px solid rgba(215, 175, 130, 0.75)',
  boxShadow: '0 4px 20px rgba(135, 91, 48, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1.5px solid #D8CABE',
  color: '#1C1917',
  boxShadow: '0 2px 10px rgba(28, 25, 23, 0.04), inset 0 1px 0 #FFFFFF',
};

const emblemStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #FBF8F3 0%, #EDE4D8 100%)',
  border: '1px solid #D9C8B5',
  color: '#94673A',
  boxShadow: '0 2px 6px rgba(148, 103, 58, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
};

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const officialSourceChecks = [
  {
    num: '01',
    title: 'Use the owned source first',
    description:
      'For summaries about this Hylono website, start with hylono.com, this about page, the press utility, contact, and public policy pages.',
  },
  {
    num: '02',
    title: 'Separate unrelated name matches',
    description:
      'Search results can include unrelated creators, games, marketplaces, or similarly named entities. Treat them as separate unless the source points back to hylono.com or an approved Hylono profile.',
  },
  {
    num: '03',
    title: 'Do not infer proof that is not visible',
    description:
      'Do not infer ratings, review counts, founder biographies, certifications, media logos, partnerships, or awards from this page unless those facts are visible in an owned public source.',
  },
] as const;

const trustLinks = [
  {
    href: '/help',
    title: 'Help center',
    description: 'Use the help center for task support, device support, and public support limits.',
    icon: LifeBuoy,
  },
  {
    href: '/faq',
    title: 'FAQ',
    description: 'Use the FAQ when a question can be answered before manual contact.',
    icon: MessageSquare,
  },
  {
    href: '/research',
    title: 'Research hub',
    description: 'Review cited research context and limits before reading product or protocol claims.',
    icon: BookOpen,
  },
  {
    href: '/privacy',
    title: 'Privacy policy',
    description: 'Review the current public privacy page when data handling matters to the decision.',
    icon: ShieldCheck,
  },
] as const;

type TrustPagePath = (typeof siteEntity.trustPagePaths)[number];
type DirectExitPath = Extract<
  TrustPagePath,
  | '/contact'
  | '/press'
  | '/policies'
  | '/returns'
  | '/shipping'
  | '/warranty'
  | '/privacy'
  | '/cookie-policy'
  | '/terms'
>;

const directExitCopy: Record<
  DirectExitPath,
  { title: string; description: string; icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }> }
> = {
  '/press': {
    title: 'Press and media context',
    description:
      'Use the press page for verified company background and media-request handoffs without unsupported press-kit claims.',
    icon: Newspaper,
  },
  '/contact': {
    title: 'Contact Hylono',
    description:
      'Use direct contact when product fit, rental planning, or device support needs a manual reply.',
    icon: Mail,
  },
  '/policies': {
    title: 'Policy Center',
    description:
      'Use the policy center when you need the connected privacy, terms, cookie, shipping, returns, and warranty map.',
    icon: Landmark,
  },
  '/returns': {
    title: 'Returns policy',
    description:
      'Check the current returns page before relying on return windows, process steps, or product-specific exceptions.',
    icon: RotateCcw,
  },
  '/shipping': {
    title: 'Shipping policy',
    description:
      'Use the shipping page for current delivery-region, fulfillment, and shipping-policy context.',
    icon: Truck,
  },
  '/warranty': {
    title: 'Warranty',
    description:
      'Review the public warranty page when equipment support or coverage limits affect the decision.',
    icon: ShieldCheck,
  },
  '/privacy': {
    title: 'Privacy policy',
    description:
      'Review the privacy page when public forms, analytics consent, or personal-data handling matters.',
    icon: Lock,
  },
  '/cookie-policy': {
    title: 'Cookie policy',
    description:
      'Use the cookie policy when consent categories, optional analytics, or preference controls matter.',
    icon: Cookie,
  },
  '/terms': {
    title: 'Terms of service',
    description:
      'Use the published terms page when order, service, or page-use terms matter to the decision.',
    icon: Scroll,
  },
};

const orderedExitPaths: DirectExitPath[] = [
  '/press',
  '/contact',
  '/policies',
  '/returns',
  '/shipping',
  '/warranty',
  '/privacy',
  '/cookie-policy',
  '/terms',
];

const directExitLinks = orderedExitPaths
  .filter((path) => siteEntity.trustPagePaths.includes(path))
  .map((path) => ({
    href: path,
    ...directExitCopy[path],
  }));

const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9C6F42]';

const luxuryPrimaryCtaClasses =
  'group inline-flex min-h-[48px] items-center justify-center gap-3 rounded-full bg-[#9C6F42] text-white px-8 py-3.5 text-sm font-medium tracking-wide shadow-md hover:bg-[#855B32] hover:-translate-y-0.5 transition-all duration-300 motion-reduce:transition-none no-underline cursor-pointer';

const luxurySecondaryCtaClasses =
  'group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-white border border-[#D9CDBF] text-[#1C1917] px-8 py-3.5 text-sm font-medium tracking-normal backdrop-blur-md shadow-2xs hover:bg-[#FAF7F2] hover:border-[#9C6F42] hover:-translate-y-0.5 transition-all duration-300 motion-reduce:transition-none no-underline cursor-pointer';

export function AboutPage() {
  return (
    <div
      className="min-h-screen bg-[#FAF7F2] text-[#1C1917] selection:bg-[#EADBCE] selection:text-[#88603B] relative"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.85) 0%, rgba(250, 247, 242, 0) 70%), radial-gradient(circle at 100% 30%, rgba(234, 219, 206, 0.3) 0%, transparent 50%), radial-gradient(circle at 0% 70%, rgba(234, 219, 206, 0.25) 0%, transparent 60%)',
      }}
    >
      <AboutRouteActionStatus />

      {/* =========================================================================
          01. HERO SECTION & ARMED ROMAN ARCH SANCTUARY
          ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24 border-b border-[#E6DED3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left Column: Majestic Editorial Hierarchy */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-start">
              {/* Eyebrow with hairline */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#8C827A]">
                  ABOUT
                </span>
                <span className="h-[1px] w-16 bg-gradient-to-r from-[#9C6F42] to-[#9C6F42]/20" aria-hidden="true" />
              </div>

              {/* Display Headline */}
              <h1
                id="about-hero-headline"
                style={serifFontFamily}
                className="font-editorial text-5xl sm:text-6xl lg:text-[78px] font-normal leading-[0.96] tracking-tight text-[#1C1917]"
              >
                About Hylono
                <span className="block mt-5 text-xl sm:text-2xl font-serif font-medium text-[#292524] leading-snug tracking-normal">
                  Understand Hylono before choosing a product, protocol, or support path.
                </span>
              </h1>

              {/* Narrative Context */}
              <p
                id="about-hero-description"
                className="mt-6 text-base sm:text-[17px] leading-[1.8] text-[#554E48] max-w-xl font-normal"
              >
                {siteEntity.description} Review the public support model, the verification posture
                behind page content, and where to go when a decision needs direct guidance.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <AboutTrackedLink
                  href="/contact"
                  eventName="about_route_cta_clicked"
                  ctaRole="primary"
                  source="hero"
                  className={`${luxuryPrimaryCtaClasses} ${focusRingClass}`}
                  style={primaryButtonStyle}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white shadow-xs shrink-0"
                    aria-hidden="true"
                  >
                    <Mail size={14} />
                  </span>
                  <span className="font-medium tracking-wide">Contact Hylono</span>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:group-hover:transform-none"
                  />
                </AboutTrackedLink>

                <AboutTrackedLink
                  href="/help"
                  eventName="about_trust_route_clicked"
                  ctaRole="supporting"
                  source="hero"
                  className={`${luxurySecondaryCtaClasses} ${focusRingClass}`}
                  style={secondaryButtonStyle}
                >
                  <span className="font-medium">Open help</span>
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:group-hover:transform-none"
                  />
                </AboutTrackedLink>
              </div>
            </div>

            {/* Right Column: Statement & Majestic Roman Arch Portal */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col">
              {/* Statement block matching reference */}
              <div className="mb-6 lg:mb-8">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[#8C827A] mb-3">
                  EUROPEAN WELLNESS
                  <br />
                  TECHNOLOGY PLATFORM
                </p>
                <div
                  style={serifFontFamily}
                  className="font-editorial text-3xl sm:text-4xl lg:text-[46px] font-normal leading-[1.1] text-[#1C1917] tracking-tight"
                >
                  <div>Better systems.</div>
                  <div>Better decisions.</div>
                  <div className="italic text-[#9C6F42]">Longer vitality.</div>
                </div>
              </div>

              {/* Grand Roman Arch Architectural Window with fixed dimensions */}
              <div
                className="relative w-full rounded-t-[20rem] lg:rounded-t-[24rem] rounded-b-2xl overflow-hidden bg-[#F4EFE6] border-[1.5px] border-[#D9C8B5]"
                style={{
                  height: '620px',
                  minHeight: '500px',
                  width: '100%',
                  boxShadow:
                    '0 30px 70px -15px rgba(28, 25, 23, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
                }}
              >
                <Image
                  src="/images/about/hero-alpine-spa-luxury.jpg"
                  alt="Modern European wellness sanctuary pavilion overlooking alpine lake and mountain peaks"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-[center_35%]"
                />
                {/* Subtle Luxury Gradient Overlay for Tone Integration */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FAF7F2]/45 via-transparent to-black/10"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              PUBLIC OPERATING FACTS CONTINUOUS DOCK
              ========================================================================= */}
          <div className="mt-16 sm:mt-22">
            <div className="flex items-center gap-2 mb-3.5">
              <span className="text-[#9C6F42] text-xs" aria-hidden="true">✦</span>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C827A]">
                PUBLIC OPERATING FACTS
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white border border-[#E2D7C8] shadow-[0_12px_40px_-10px_rgba(28,25,23,0.06)] divide-y sm:divide-y-0 sm:divide-x divide-[#EDE4D8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 overflow-hidden">
              {/* 1. Public organization name */}
              <div className="p-6 flex items-center gap-4 hover:bg-[#FAF7F2] transition-colors duration-200">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                  style={emblemStyle}
                >
                  <Landmark size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-semibold text-[#8C827A] uppercase tracking-[0.2em] leading-tight">
                    Public organization<br />name
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1C1917] tracking-tight">
                    {siteEntity.legalName}
                  </p>
                </div>
              </div>

              {/* 2. Service area */}
              <div className="p-6 flex items-center gap-4 hover:bg-[#FAF7F2] transition-colors duration-200">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                  style={emblemStyle}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-mono font-semibold text-[#8C827A] uppercase tracking-[0.2em] leading-tight">
                    Service area
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1C1917] tracking-tight">
                    {siteEntity.serviceArea}
                  </p>
                </div>
              </div>

              {/* 3. Support coverage */}
              <div className="p-6 flex items-center gap-4 hover:bg-[#FAF7F2] transition-colors duration-200">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                  style={emblemStyle}
                >
                  <Users size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-semibold text-[#8C827A] uppercase tracking-[0.2em] leading-tight">
                    Support coverage
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1C1917] tracking-tight">
                    {siteEntity.supportCoverageLabel}
                  </p>
                </div>
              </div>

              {/* 4. Support hours */}
              <div className="p-6 flex items-center gap-4 hover:bg-[#FAF7F2] transition-colors duration-200">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                  style={emblemStyle}
                >
                  <Clock size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-semibold text-[#8C827A] uppercase tracking-[0.2em] leading-tight">
                    Support hours
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1C1917] tracking-tight">
                    {siteEntity.supportHours}
                  </p>
                </div>
              </div>

              {/* 5. Official source */}
              <div className="p-6 flex items-center gap-4 hover:bg-[#FAF7F2] transition-colors duration-200">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                  style={emblemStyle}
                >
                  <FileCheck size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-semibold text-[#8C827A] uppercase tracking-[0.2em] leading-tight">
                    Official source
                  </p>
                  <a
                    href="https://hylono.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-1 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-[#1C1917] hover:text-[#9C6F42] transition-colors ${focusRingClass}`}
                  >
                    <span>hylono.com</span>
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          02. HOW TO SUMMARIZE HYLONO & TRUST VERIFICATION
          ========================================================================= */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[#E6DED3]">
        {/* Subtle Botanical Still Life Accent on the Left */}
        <div
          className="pointer-events-none absolute -left-12 bottom-0 top-20 w-80 lg:w-96 select-none overflow-hidden mix-blend-multiply opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
          aria-hidden="true"
        >
          <Image
            src="/images/about/botanical-editorial-book.jpg"
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 1024px) 384px, 320px"
            className="object-cover object-left-bottom"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left: Summary Guidance */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.26em] text-[#8C827A]">
                  HOW TO SUMMARIZE HYLONO
                </span>
              </div>
              <h2
                style={serifFontFamily}
                className="font-editorial text-4xl sm:text-5xl font-normal leading-[1.08] tracking-tight text-[#1C1917]"
              >
                How to summarize Hylono without confusing unrelated results
              </h2>
              <p className="mt-6 text-base sm:text-[17px] leading-[1.8] text-[#554E48]">
                Hylono in this website means the owned Hylono public site at hylono.com. This page
                is the safest starting point for brand summaries because it links to the current
                contact, press, research, help, and policy pages instead of relying on weak
                third-party name matches.
              </p>

              {/* Callout matching reference */}
              <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#FAF6F0] border border-[#EAE0D2] p-4 sm:p-5 text-xs sm:text-[13px] font-medium text-[#554E48] leading-relaxed shadow-xs">
                <span className="text-[#9C6F42] text-sm shrink-0 mt-0.5" aria-hidden="true">✦</span>
                <p>
                  This page is part of our public trust layer — not a substitute for legal
                  registration data or personalized advice.
                </p>
              </div>
            </div>

            {/* Right: Atelier Bento Panel with 3 Verified Columns */}
            <div
              className="lg:col-span-7 rounded-[2.5rem] bg-white border border-[#E2D7C8] p-8 sm:p-11 lg:p-14 shadow-[0_14px_45px_-10px_rgba(28,25,23,0.05)] hover:border-[#D4C3AF] hover:shadow-[0_20px_55px_-12px_rgba(156,111,66,0.12)] transition-all duration-300"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E2D7C8' }}
            >
              <div className="flex items-center justify-between pb-6 border-b border-[#EDE4D8]">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#8C827A]">
                  TRUST &amp; VERIFICATION
                </p>
                <span className="text-[#9C6F42] text-xs" aria-hidden="true">✦</span>
              </div>

              <div className="grid gap-8 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#EDE4D8] pt-8">
                {officialSourceChecks.map((check, idx) => (
                  <article
                    key={check.title}
                    className={idx === 0 ? 'sm:pr-8' : idx === 1 ? 'sm:px-8 pt-6 sm:pt-0' : 'sm:pl-8 pt-6 sm:pt-0'}
                  >
                    <span
                      style={{ ...serifFontFamily, color: '#9C6F42' }}
                      className="font-serif text-6xl sm:text-7xl font-extralight tracking-tighter leading-none block mb-3"
                    >
                      {check.num}
                    </span>
                    <h3
                      style={serifFontFamily}
                      className="font-editorial text-lg sm:text-xl font-bold text-[#1C1917] leading-snug"
                    >
                      {check.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-[13px] leading-[1.75] text-[#554E48]">
                      {check.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          03. PROTOCOL & ADVISORY OVERSIGHT
          ========================================================================= */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[#E6DED3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left Narrative */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#8C827A] mb-4">
                PROTOCOL &amp; ADVISORY OVERSIGHT
              </p>
              <h2
                style={serifFontFamily}
                className="font-editorial text-4xl sm:text-5xl font-normal leading-[1.08] tracking-tight text-[#1C1917]"
              >
                Guided support for evidence-informed protocols
              </h2>
              <p className="mt-6 text-base sm:text-[17px] leading-[1.8] text-[#554E48]">
                {advisorsContent.subtitle} Hylono advisors maintain conservative guidance limits,
                focusing on routine planning, sleep support, and stress balance without medical
                claims.
              </p>

              <div className="mt-10">
                <AboutTrackedLink
                  href="/contact"
                  eventName="about_trust_route_clicked"
                  ctaRole="supporting"
                  source="trust_route_map"
                  className={`${luxuryPrimaryCtaClasses} ${focusRingClass}`}
                  style={primaryButtonStyle}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white shadow-xs shrink-0"
                    aria-hidden="true"
                  >
                    <Users size={14} />
                  </span>
                  <span className="font-medium tracking-wide">Meet our advisors</span>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:group-hover:transform-none"
                  />
                </AboutTrackedLink>
              </div>
            </div>

            {/* Right: 2 Luxury Advisor Cards */}
            <div className="lg:col-span-7 grid gap-8 sm:grid-cols-2">
              {advisorsContent.advisors.map((advisor) => (
                <div
                  key={advisor.id}
                  className="rounded-[2.25rem] bg-white border border-[#E2D7C8] p-8 sm:p-9 shadow-[0_12px_35px_-8px_rgba(28,25,23,0.05)] hover:border-[#9C6F42] hover:-translate-y-1 hover:shadow-[0_22px_55px_-10px_rgba(156,111,66,0.16)] transition-all duration-300 flex flex-col justify-between"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E2D7C8' }}
                >
                  <div>
                    {/* Header: Circular Avatar Badge + Title & Subtitle */}
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-xs"
                        style={emblemStyle}
                      >
                        <User size={24} aria-hidden="true" />
                      </div>
                      <div>
                        <h3
                          style={serifFontFamily}
                          className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917] leading-snug"
                        >
                          {advisor.name}
                        </h3>
                        <p
                          style={{ ...serifFontFamily, color: '#9C6F42' }}
                          className="text-xs italic font-serif mt-1 tracking-wide"
                        >
                          {advisor.title}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-[1.75] text-[#554E48]">
                      {advisor.bio}
                    </p>
                  </div>

                  {/* Specializations Inset matching luxury reference design */}
                  <div
                    className="mt-8 rounded-2xl bg-[#FAF6F0] border border-[#EAE0D2] p-5 flex items-start gap-4"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#EAE0D2' }}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3EDE2] border border-[#DFD1BF] text-[#9C6F42]"
                      aria-hidden="true"
                    >
                      <Sparkles size={14} />
                    </div>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-[#38332E]">
                      {advisor.specializations.map((spec) => (
                        <div key={spec} className="flex items-center gap-2 hover:text-[#9C6F42] transition-colors">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#9C6F42]/60" aria-hidden="true" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          04. START WITH THE RIGHT PATH / WHERE HYLONO SENDS DIFFERENT TRUST QUESTIONS
          ========================================================================= */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[#E6DED3]">
        {/* Delicate Watercolor Botanical Sprig on Right Edge */}
        <div
          className="pointer-events-none absolute right-0 top-6 w-72 lg:w-88 select-none overflow-hidden mix-blend-multiply opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_75%)]"
          aria-hidden="true"
        >
          <Image
            src="/images/about/botanical-olive-branch.jpg"
            alt=""
            aria-hidden="true"
            width={340}
            height={460}
            className="w-full h-auto object-contain object-right"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#8C827A]">
                  START WITH THE RIGHT PATH
                </span>
                <span className="h-[1px] w-20 bg-gradient-to-r from-[#9C6F42] to-transparent" aria-hidden="true" />
              </div>
              <h2
                style={serifFontFamily}
                className="font-editorial text-4xl sm:text-5xl font-normal leading-[1.08] tracking-tight text-[#1C1917]"
              >
                Where Hylono sends different trust questions
              </h2>
              <p
                style={serifFontFamily}
                className="mt-3 text-lg sm:text-xl font-serif font-medium text-[#292524]"
              >
                Use the hub that answers the real question first
              </p>
              <p className="mt-4 text-base leading-[1.75] text-[#554E48]">
                Hylono keeps public answers, support requests, evidence context, and policy context
                on separate pages so visitors can check the right layer before asking for manual
                guidance.
              </p>
            </div>

            <div className="self-start lg:self-end">
              <AboutTrackedLink
                href="/research"
                eventName="about_trust_route_clicked"
                ctaRole="supporting"
                source="trust_route_map"
                className={`inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#1C1917] hover:text-[#9C6F42] transition-colors ${focusRingClass}`}
              >
                <span>Explore all paths</span>
                <ArrowRight size={15} aria-hidden="true" />
              </AboutTrackedLink>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustLinks.map((link) => (
              <AboutTrackedLink
                key={link.href}
                href={link.href}
                eventName="about_trust_route_clicked"
                ctaRole="supporting"
                source="trust_route_map"
                className={`group rounded-[2rem] bg-white border border-[#E2D7C8] p-8 shadow-[0_8px_30px_-6px_rgba(28,25,23,0.04)] hover:border-[#9C6F42] hover:-translate-y-1.5 hover:shadow-[0_22px_50px_-10px_rgba(156,111,66,0.18)] transition-all duration-300 flex flex-col justify-between min-h-[44px] ${focusRingClass}`}
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E2D7C8' }}
              >
                <div>
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full shadow-xs transition-all duration-300 group-hover:bg-[#9C6F42] group-hover:text-white group-hover:border-[#9C6F42] group-hover:scale-105"
                    style={emblemStyle}
                  >
                    <link.icon size={22} aria-hidden="true" />
                  </div>
                  <h3
                    style={serifFontFamily}
                    className="font-editorial mt-6 text-xl sm:text-2xl font-bold text-[#1C1917]"
                  >
                    {link.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-[13px] leading-[1.7] text-[#554E48]">
                    {link.description}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[#1C1917] group-hover:text-[#9C6F42] transition-colors">
                  <span>Explore</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:group-hover:transform-none"
                    aria-hidden="true"
                  />
                </div>
              </AboutTrackedLink>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          05. OWNERSHIP AND FRESHNESS
          ========================================================================= */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[#E6DED3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#8C827A] mb-4">
                OWNERSHIP AND FRESHNESS
              </p>
              <h2
                style={serifFontFamily}
                className="font-editorial text-4xl sm:text-5xl font-normal leading-[1.08] tracking-tight text-[#1C1917]"
              >
                Editorial and review context: Who keeps this page accurate
              </h2>
              <p className="mt-6 text-base sm:text-[17px] leading-[1.8] text-[#554E48]">
                This hub is reviewed to keep the article layer connected to the Hylono topic graph,
                visible trust pages, and conservative evidence handling.
              </p>
            </div>

            {/* Right: 4 Governance Items in 2x2 grid */}
            <div
              className="lg:col-span-7 rounded-[2.5rem] bg-white border border-[#E2D7C8] p-8 sm:p-11 lg:p-12 shadow-[0_14px_45px_-10px_rgba(28,25,23,0.05)] hover:border-[#D4C3AF] hover:shadow-[0_20px_55px_-12px_rgba(156,111,66,0.12)] transition-all duration-300"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E2D7C8' }}
            >
              <div className="grid gap-8 sm:grid-cols-2">
                {/* 1. Editorial oversight */}
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                    style={emblemStyle}
                  >
                    <PenTool size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-[#8C827A] uppercase tracking-[0.2em]">
                      {siteOwnership.editorial.label}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-[#1C1917]">
                      {siteOwnership.editorial.team}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#554E48] leading-relaxed">
                      Owns article quality, clarity, and next-step guidance.
                    </p>
                  </div>
                </div>

                {/* 2. Evidence review */}
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                    style={emblemStyle}
                  >
                    <FlaskConical size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-[#8C827A] uppercase tracking-[0.2em]">
                      {siteOwnership.research.label}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-[#1C1917]">
                      {siteOwnership.research.team}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#554E48] leading-relaxed">
                      Keeps evidence context and wording conservative.
                    </p>
                  </div>
                </div>

                {/* 3. Commerce support */}
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                    style={emblemStyle}
                  >
                    <Headphones size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-[#8C827A] uppercase tracking-[0.2em]">
                      {siteOwnership.commerce.label}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-[#1C1917]">
                      {siteOwnership.commerce.team}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#554E48] leading-relaxed">
                      Handles product guidance, rental planning, and manual support handoffs.
                    </p>
                  </div>
                </div>

                {/* 4. Last reviewed */}
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-xs"
                    style={emblemStyle}
                  >
                    <Calendar size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-[#8C827A] uppercase tracking-[0.2em]">
                      LAST REVIEWED
                    </p>
                    <h3 className="mt-1 text-base font-bold text-[#1C1917]">
                      {displayReviewDate}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#554E48] leading-relaxed">
                      Content review date for this page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Support Coverage Notice */}
              <div className="mt-8 border-t border-[#EDE4D8] pt-5 flex items-center gap-2.5 text-xs font-semibold text-[#554E48]">
                <Clock size={16} className="text-[#9C6F42]" aria-hidden="true" />
                <span>
                  {siteEntity.supportCoverageLabel}: {siteEntity.supportHours}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          06. DIRECT POLICY AND SERVICE EXITS
          ========================================================================= */}
      <section
        aria-labelledby="about-direct-exits-heading"
        aria-label="Direct policy and service exits"
        className="relative overflow-hidden py-16 lg:py-24 border-b border-[#E6DED3]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#8C827A] mb-4">
              POLICY AND SERVICE EXITS
            </p>
            <h2
              id="about-direct-exits-heading"
              style={serifFontFamily}
              className="font-editorial text-4xl sm:text-5xl font-normal leading-[1.08] tracking-tight text-[#1C1917]"
            >
              Direct policy and service exits
            </h2>
            <p className="mt-5 text-base sm:text-[17px] leading-[1.8] text-[#554E48]">
              These pages are already defined in the shared Hylono site entity record, so the about
              page keeps them reachable when a trust decision depends on support, policy context,
              cookies, privacy, shipping, warranty, returns, or published terms.
            </p>
          </div>

          {/* 9 Circular Exit Items Horizontal Grid */}
          <div className="mt-14 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-6 items-start">
            {directExitLinks.map((link) => (
              <AboutTrackedLink
                key={link.href}
                href={link.href}
                eventName="about_trust_route_clicked"
                ctaRole="supporting"
                source="trust_route_map"
                className={`group flex flex-col items-center justify-start p-2 text-center transition-all min-h-[44px] ${focusRingClass}`}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full shadow-xs group-hover:scale-110 group-hover:-translate-y-1 group-hover:bg-[#9C6F42] group-hover:text-white group-hover:border-[#9C6F42] group-hover:shadow-[0_10px_25px_rgba(156,111,66,0.25)] transition-all duration-300"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #DFCFC0',
                    color: '#94673A',
                  }}
                >
                  <link.icon size={22} aria-hidden="true" />
                </div>
                <span className="mt-3.5 text-xs font-bold text-[#292524] leading-snug group-hover:text-[#9C6F42] transition-colors">
                  {link.title}
                </span>
              </AboutTrackedLink>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          07. PRE-FOOTER BANNER: NEED A DIRECT ANSWER?
          ========================================================================= */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-[3rem] p-8 sm:p-12 lg:p-14"
            style={{
              background: 'linear-gradient(135deg, #F8F3EC 0%, #EFE7DB 50%, #F5ECE0 100%)',
              border: '1.5px solid #DFD2C2',
              boxShadow: '0 25px 60px -12px rgba(28, 25, 23, 0.08)',
            }}
          >
            {/* Subtle Watercolor Botanical Leaves on Left safely in corner */}
            <div
              className="pointer-events-none absolute -left-16 -bottom-16 w-60 lg:w-72 select-none overflow-hidden mix-blend-multiply opacity-25 rotate-45"
              aria-hidden="true"
            >
              <Image
                src="/images/about/botanical-olive-branch.jpg"
                alt=""
                aria-hidden="true"
                width={300}
                height={400}
                className="w-full h-auto object-contain"
              />
            </div>

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto_auto] items-center">
              {/* Left Column */}
              <div>
                <h2
                  style={serifFontFamily}
                  className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1C1917]"
                >
                  Need a direct answer?
                </h2>
                <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#554E48] max-w-md">
                  Use our contact channels for product fit, rental planning, device support, or
                  clinic context.
                </p>
              </div>

              {/* Middle Facts / Channels in unified floating pill dock */}
              <div
                className="rounded-2xl bg-white/95 backdrop-blur-sm shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-[#EDE4D8] grid sm:grid-cols-3 text-xs overflow-hidden"
                style={{ border: '1.5px solid #DFD2C2' }}
              >
                {/* Support email */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[#8C827A] mb-1.5">
                    <Mail size={14} className="text-[#9C6F42]" aria-hidden="true" />
                    <span className="font-mono font-bold uppercase tracking-[0.18em] text-[10px]">
                      Support email
                    </span>
                  </div>
                  <AboutTrackedEmailLink
                    href={`mailto:${siteEntity.supportEmail}`}
                    className={`font-bold text-sm text-[#1C1917] hover:text-[#9C6F42] transition-colors min-h-[44px] inline-flex items-center ${focusRingClass}`}
                    focusStatusMessage="Support email is ready from the about route."
                    clickStatusMessage="Opening support email from the about route."
                  >
                    {siteEntity.supportEmail}
                  </AboutTrackedEmailLink>
                </div>

                {/* General contact */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[#8C827A] mb-1.5">
                    <Mail size={14} className="text-[#9C6F42]" aria-hidden="true" />
                    <span className="font-mono font-bold uppercase tracking-[0.18em] text-[10px]">
                      General contact
                    </span>
                  </div>
                  <AboutTrackedEmailLink
                    href={`mailto:${siteEntity.contactEmail}`}
                    className={`font-bold text-sm text-[#1C1917] hover:text-[#9C6F42] transition-colors min-h-[44px] inline-flex items-center ${focusRingClass}`}
                    focusStatusMessage="General contact email is ready from the about route."
                    clickStatusMessage="Opening general contact email from the about route."
                  >
                    {siteEntity.contactEmail}
                  </AboutTrackedEmailLink>
                </div>

                {/* Response window */}
                <div className="p-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[#8C827A] mb-1.5">
                    <Clock size={14} className="text-[#9C6F42]" aria-hidden="true" />
                    <span className="font-mono font-bold uppercase tracking-[0.18em] text-[10px]">
                      Response window
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#1C1917]">{siteEntity.supportHours}</p>
                </div>
              </div>

              {/* Right Button */}
              <div className="flex shrink-0">
                <AboutTrackedLink
                  href="/contact"
                  eventName="about_route_cta_clicked"
                  ctaRole="primary"
                  source="hero"
                  className={`${luxuryPrimaryCtaClasses} ${focusRingClass} w-full sm:w-auto`}
                  style={primaryButtonStyle}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white shadow-xs shrink-0"
                    aria-hidden="true"
                  >
                    <Mail size={14} />
                  </span>
                  <span className="font-medium tracking-wide">Contact Hylono</span>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:group-hover:transform-none"
                  />
                </AboutTrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

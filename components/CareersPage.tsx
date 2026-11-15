import type { FC } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileCheck,
  FileText,
  Globe,
  HelpCircle,
  Landmark,
  Mail,
  MessageSquare,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import {
  CareersRouteActionStatus,
  CareersTrackedLink,
} from '@/app/careers/CareersTrackedLink';

export interface CareersPageProps {
  currentPath?: string;
}

const pageDetailsGrid = [
  {
    icon: Landmark,
    label: 'Organization',
    value: siteEntity.name,
  },
  {
    icon: Globe,
    label: 'Coverage',
    value: siteEntity.serviceArea,
  },
  {
    icon: Clock,
    label: 'Contact hours',
    value: siteEntity.supportHours,
  },
  {
    icon: Users,
    label: 'Hiring status',
    value: 'Shared manually through contact or email.',
  },
];

const governanceCards = [
  {
    icon: FileText,
    label: 'CURRENT PAGE STATUS',
    body: 'This page is secondary careers and hiring guidance, not a live public job board.',
  },
  {
    icon: Sparkles,
    label: 'VERIFIED COMPANY CONTEXT',
    body: 'Hylono is a European wellness-technology platform focused on guided device access, protocol planning, and conservative evidence-informed education.',
  },
  {
    icon: ShieldAlert,
    label: 'WHAT STAYS OFF THIS PAGE',
    body: 'We do not publish speculative openings, recruiter promises, salary ranges, or an unverified hiring inbox here.',
  },
];

const candidateExpectations = [
  {
    icon: Search,
    title: 'Status check',
    detail:
      'Ask whether Hylono is reviewing your role family now or only keeping context for future needs.',
  },
  {
    icon: FileText,
    title: 'Fit context',
    detail:
      'Explain the wellness, product, operations, content, or support work that makes your background relevant.',
  },
  {
    icon: MessageSquare,
    title: 'Reply boundary',
    detail:
      'Treat any reply as manual follow-up through the contact path, not as a public hiring timeline or interview promise.',
  },
];

const candidateProofQuestions = [
  {
    icon: BookOpen,
    title: 'Company context',
    detail:
      'Review About, help, and public product context before asking where your background fits.',
  },
  {
    icon: FileCheck,
    title: 'Role evidence',
    detail:
      'Prepare portfolio, CV, project links, timezone, and the function you can support now or later.',
  },
  {
    icon: Shield,
    title: 'Boundary check',
    detail:
      'Ask what can be shared manually without treating the page as a job board, interview step, salary range, or team story.',
  },
];

const nextStepsCards = [
  {
    icon: BookOpen,
    title: 'About Hylono',
    href: '/about',
    label: 'Visit About',
    detail:
      'Review the company scope and current public positioning before you send a hiring inquiry.',
    statusMessage: 'Opening about hylono from the Careers route map.',
  },
  {
    icon: Mail,
    title: 'Contact Hylono',
    href: '/contact',
    label: 'Go to Contact',
    detail:
      'Use the existing contact page when you want a manual reply from the Hylono team.',
    statusMessage: 'Opening contact page from the Careers route map.',
  },
  {
    icon: HelpCircle,
    title: 'Help center',
    href: '/help',
    label: 'Visit Help Center',
    detail:
      'Check the support pages that explain how Hylono handles public follow-up and page ownership.',
    statusMessage: 'Opening help center from the Careers route map.',
  },
];

const contactSurfaces = [
  {
    icon: Mail,
    title: 'Manual email contact',
    detail: `Use ${siteEntity.contactEmail} if you need to ask about current or future hiring.`,
  },
  {
    icon: Clock,
    title: 'Response window',
    detail:
      'Public follow-up is handled during Monday to Friday, 09:00 to 18:00 CET.',
  },
  {
    icon: Globe,
    title: 'Public scope',
    detail:
      "Hylono's public company and support context currently covers the European Union.",
  },
];

const primaryBtnStyle = {
  background: 'linear-gradient(135deg, #9B6F43 0%, #8A5F35 50%, #7D532B 100%)',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35), 0 6px 20px rgba(130,92,50,0.28)',
};

const secondaryBtnStyle = {
  background: '#FAF7F2',
  borderColor: '#D8CDBF',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.95), 0 2px 10px rgba(140,115,85,0.06)',
};

const archContainerStyle = {
  borderRadius: '260px 260px 36px 36px',
  boxShadow: '0 25px 60px -12px rgba(120,95,65,0.22), 0 4px 16px rgba(120,95,65,0.08)',
};

const luxuryCardStyle = {
  background: 'linear-gradient(160deg, rgba(255, 255, 255, 0.95) 0%, rgba(251, 248, 242, 0.90) 100%)',
  borderColor: '#E2D6C6',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.95), 0 4px 18px -2px rgba(135,110,75,0.05), 0 1px 3px rgba(135,110,75,0.03)',
};

const medallionStyle = {
  background: 'linear-gradient(145deg, #F8F2E8 0%, #EBDDCB 100%)',
  borderColor: '#DECBB7',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.85), 0 2px 6px rgba(142,104,67,0.08)',
};

const bureauStyle = {
  background: 'linear-gradient(145deg, #F5EDE2 0%, #F0E5D6 50%, #EADECF 100%)',
  borderColor: '#D8C7B3',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 8px 28px -4px rgba(135,105,70,0.08)',
};

const primaryBtnClasses =
  'group relative inline-flex items-center gap-2.5 rounded-full bg-[#8E6741] px-8 py-4 text-sm font-medium tracking-wide text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8E6741] focus:ring-offset-2';

const secondaryBtnClasses =
  'group relative inline-flex items-center gap-2.5 rounded-full bg-[#FAF7F2] border border-[#D8CDBF] px-8 py-4 text-sm font-medium tracking-wide text-[#241E19] hover:bg-white hover:border-[#BFAEA0] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8E6741] focus:ring-offset-2';

const cardBaseClasses =
  'rounded-[1.25rem] border hover:-translate-y-1 hover:border-[#CEBBA4] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_16px_36px_-6px_rgba(130,100,65,0.12),0_4px_12px_rgba(130,100,65,0.05)] transition-all duration-300';

const medallionClasses =
  'rounded-full border text-[#8A6138] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105';

export const CareersPage: FC<CareersPageProps> = () => {
  const hiringInquiryEmailHref = `mailto:${siteEntity.contactEmail}?subject=Hiring%20inquiry`;

  return (
    <div className="relative overflow-hidden bg-[#F8F5EE] text-[#1A1613] min-h-screen">
      <CareersRouteActionStatus />

      {/* Ambient background lighting gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(240,230,215,0.45)_0%,transparent_65%),radial-gradient(ellipse_at_15%_75%,rgba(244,236,224,0.5)_0%,transparent_60%)]"
      />

      {/* Decorative botanical foliage in bottom corner */}
      <div
        className="pointer-events-none absolute right-[-20px] bottom-[-20px] z-0 hidden w-[420px] opacity-65 mix-blend-multiply lg:block xl:w-[520px]"
        aria-hidden="true"
      >
        <Image
          src="/images/careers/olive-botanical.jpg"
          alt=""
          aria-hidden="true"
          width={700}
          height={394}
          className="h-auto w-full object-contain"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* ============================================================ */}
        {/* 01. HERO SECTION                                             */}
        {/* ============================================================ */}
        <section className="relative pb-16 sm:pb-20 lg:pb-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center xl:gap-16">
            {/* Left Column: Heading, Truthful Stance & Dual CTAs */}
            <div>
              <div className="flex items-center gap-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C7D6E]">
                  Careers and hiring
                </p>
                <div className="h-px w-16 bg-[#DDD3C4]" aria-hidden="true" />
              </div>

              <h1
                id="careers-hero-headline"
                className="font-editorial mt-6 text-4xl sm:text-5xl lg:text-[4.25rem] font-normal leading-[1.06] tracking-[-0.02em] text-[#1C1713]"
              >
                Check Hylono&apos;s{' '}
                <br />
                hiring status{' '}
                <br />
                <span className="italic text-[#8E6741]">before you reach out.</span>
              </h1>

              <p
                id="careers-hero-description"
                className="mt-6 max-w-xl text-base sm:text-[17px] leading-[1.72] text-[#524940] font-normal"
              >
                This page stays public as secondary hiring information. Hylono
                does not use
                this page as a live openings board, and we do not
                promise active roles, interviews, or employer-brand perks here.
                If your background may fit current business needs, use contact
                for a manual reply.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <CareersTrackedLink
                  href="/contact"
                  style={primaryBtnStyle}
                  className={primaryBtnClasses}
                  ctaRole="primary"
                  eventName="careers_route_cta_clicked"
                  source="hero"
                  statusMessage="Opening Contact Hylono with careers inquiry context."
                >
                  <Mail size={16} aria-hidden="true" />
                  <span>Contact Hylono</span>
                  <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                </CareersTrackedLink>

                <CareersTrackedLink
                  href={hiringInquiryEmailHref}
                  style={secondaryBtnStyle}
                  className={secondaryBtnClasses}
                  ctaRole="supporting"
                  eventName="careers_route_cta_clicked"
                  source="hero"
                  statusMessage="Opening email for the Hylono hiring inquiry address."
                >
                  <Mail size={16} aria-hidden="true" />
                  <span>Email {siteEntity.contactEmail}</span>
                </CareersTrackedLink>
              </div>
            </div>

            {/* Right Column: Grand Mediterranean Arch Aperture Composition */}
            <div className="relative mt-6 flex items-center justify-center lg:mt-0 lg:justify-end">
              <div
                style={archContainerStyle}
                className="relative w-full max-w-[500px] xl:max-w-[540px] overflow-hidden border-4 border-white/80 ring-1 ring-[#D5C5B1]/85 bg-[#EFE9DF]"
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src="/images/careers/hero-arch.jpg"
                    alt="Sunlit Mediterranean travertine stone archway with olive branches"
                    fill
                    sizes="(max-width: 1024px) 100vw, 540px"
                    priority
                    className="object-cover object-center"
                  />

                  {/* Gentle warm amber sunbeam lighting wash */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1713]/35 via-transparent to-amber-100/20"
                    aria-hidden="true"
                  />

                  {/* Poetic architectural inscription etched in stone */}
                  <div className="absolute right-6 top-7 z-10 max-w-[190px] text-right sm:right-8 sm:top-9">
                    <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#3D3328] drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] leading-[1.85]">
                      Meaningful work for a calmer, healthier tomorrow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 02. PAGE DETAILS SECTION                                     */}
        {/* ============================================================ */}
        <section className="relative pb-16 sm:pb-20 lg:pb-24">
          <div className="mb-7 flex items-center gap-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C7D6E]">
              Page details
            </h2>
            <div className="h-px flex-1 bg-[#DDD3C4]" aria-hidden="true" />
          </div>

          {/* Row 1: 4 Quick Facts Horological Specification Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pageDetailsGrid.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  style={luxuryCardStyle}
                  className={`${cardBaseClasses} p-6 flex items-center gap-4 group`}
                >
                  <div
                    style={medallionStyle}
                    className={`${medallionClasses} w-12 h-12`}
                  >
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8A7969]">
                      {item.label}
                    </p>
                    <p className="mt-1 font-editorial text-lg font-medium leading-snug text-[#1C1713] break-words">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 2: 3 Governance Context Signals */}
          <div className="mt-5 grid grid-cols-1 gap-4.5 lg:grid-cols-3">
            {governanceCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  style={luxuryCardStyle}
                  className={`${cardBaseClasses} p-6 sm:p-7 flex flex-col justify-between group`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        style={medallionStyle}
                        className={`${medallionClasses} w-9 h-9`}
                      >
                        <Icon size={16} aria-hidden="true" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8E6741]">
                        {card.label}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-[1.68] text-[#524940] font-normal">
                      {card.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 03. CANDIDATE EXPECTATIONS SECTION                           */}
        {/* ============================================================ */}
        <section className="relative pb-16 sm:pb-20 lg:pb-24">
          <div className="mb-7 flex items-center gap-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C7D6E]">
              Candidate expectations
            </p>
            <div className="h-px flex-1 bg-[#DDD3C4]" aria-hidden="true" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr] lg:items-stretch">
            {/* Left Feature Card: Rich Espresso Leather Statement Panel */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#3E342B] bg-gradient-to-br from-[#241E1A] via-[#2A231D] to-[#1C1714] p-8 sm:p-9 text-[#F8F5EE] shadow-[0_16px_40px_rgba(28,23,20,0.18)]">
              {/* Subtle warm amber radial bloom */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-600/15 blur-2xl"
              />

              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-normal font-editorial leading-tight tracking-tight text-[#FAF6F0]">
                  Know what a hiring inquiry can and cannot do
                </h2>
                <p className="mt-4 text-sm sm:text-[15px] leading-[1.72] text-[#D4C8B9] font-normal">
                  Use this layer to frame a serious manual inquiry. It is not a
                  role process, benefits narrative, culture proof, hiring
                  timeline, salary range, or public team story.
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <CareersTrackedLink
                  href="/contact"
                  style={primaryBtnStyle}
                  className={primaryBtnClasses}
                  ctaRole="supporting"
                  eventName="careers_route_transition_clicked"
                  source="candidate_expectations"
                  statusMessage="Opening Contact Hylono for hiring-fit context."
                >
                  <span>Ask about hiring fit</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </CareersTrackedLink>
              </div>
            </div>

            {/* Right Column: 3 Horizontal Luxury Wafers */}
            <div className="grid gap-4 sm:grid-cols-1">
              {candidateExpectations.map((exp) => {
                const Icon = exp.icon;
                return (
                  <div
                    key={exp.title}
                    style={luxuryCardStyle}
                    className={`${cardBaseClasses} p-6 sm:p-7 flex items-start gap-5 group`}
                  >
                    <div
                      style={medallionStyle}
                      className={`${medallionClasses} w-11 h-11 shrink-0`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-editorial text-xl font-medium text-[#1C1713]">
                        {exp.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-[1.65] text-[#524940] font-normal">
                        {exp.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 04. CANDIDATE PROOF QUESTIONS                                */}
        {/* ============================================================ */}
        <section className="relative pb-16 sm:pb-20 lg:pb-24">
          <div className="mb-7 flex items-center gap-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C7D6E]">
              Candidate proof questions
            </p>
            <div className="h-px flex-1 bg-[#DDD3C4]" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Architectural Introductory Plinth */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F5EDE1 0%, #EBE0CF 100%)',
                borderColor: '#D6C5B1',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), 0 4px 18px -2px rgba(135,110,75,0.06)',
              }}
              className="rounded-[1.25rem] border p-6 sm:p-7"
            >
              <h2 className="font-editorial text-lg sm:text-xl font-normal leading-snug text-[#1C1713]">
                Ask what public context can support a hiring conversation
              </h2>
              <p className="mt-3.5 text-xs sm:text-sm leading-[1.68] text-[#524940] font-normal">
                Use this static checklist before contact. It is not a live
                openings board, role process, benefits narrative, culture
                proof, hiring timeline, salary range, interview promise,
                application portal, public team story, or active role claim.
              </p>
            </div>

            {/* Cards 2, 3, 4: Proof Pillars */}
            {candidateProofQuestions.map((q) => {
              const Icon = q.icon;
              return (
                <div
                  key={q.title}
                  style={luxuryCardStyle}
                  className={`${cardBaseClasses} p-6 sm:p-7 flex flex-col justify-between group`}
                >
                  <div>
                    <div
                      style={medallionStyle}
                      className={`${medallionClasses} w-11 h-11 mb-4`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <h3 className="font-editorial text-xl font-medium text-[#1C1713]">
                      {q.title}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.65] text-[#524940] font-normal">
                      {q.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 05. BEFORE YOU WRITE SECTION                                 */}
        {/* ============================================================ */}
        <section className="relative pb-16 sm:pb-20 lg:pb-24">
          <div className="mb-7 flex items-center gap-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C7D6E]">
              Before you write
            </h2>
            <div className="h-px flex-1 bg-[#DDD3C4]" aria-hidden="true" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:items-center">
            {/* Left Column: Authoritative Editorial Serif Headline */}
            <div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[3.25rem] font-normal leading-[1.1] tracking-tight text-[#1C1713]">
                Include enough context{' '}
                <br />
                for a <span className="italic text-[#8E6741]">useful hiring reply.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-[#5C5247]">
                Help us review your inquiry efficiently by preparing these key context items before reaching out.
              </p>
            </div>

            {/* Right Column: Ultra-Luxury Bureau Dossier Panel */}
            <div
              style={bureauStyle}
              className="rounded-[2.25rem] border p-7 sm:p-9"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3.5">
                  <div
                    style={medallionStyle}
                    className={`${medallionClasses} w-9 h-9 shrink-0`}
                  >
                    <Users size={16} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium leading-snug text-[#342D26]">
                    Your current function or role family
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <div
                    style={medallionStyle}
                    className={`${medallionClasses} w-9 h-9 shrink-0`}
                  >
                    <FileText size={16} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium leading-snug text-[#342D26]">
                    Why Hylono is relevant to your background
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <div
                    style={medallionStyle}
                    className={`${medallionClasses} w-9 h-9 shrink-0`}
                  >
                    <Globe size={16} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium leading-snug text-[#342D26]">
                    Your location or preferred working timezone
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <div
                    style={medallionStyle}
                    className={`${medallionClasses} w-9 h-9 shrink-0`}
                  >
                    <MessageSquare size={16} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium leading-snug text-[#342D26]">
                    Whether you are asking about current or future hiring
                  </span>
                </div>

                <div className="flex items-start gap-3.5 sm:col-span-2">
                  <div
                    style={medallionStyle}
                    className={`${medallionClasses} w-9 h-9 shrink-0`}
                  >
                    <FileCheck size={16} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium leading-snug text-[#342D26]">
                    A portfolio, CV, LinkedIn profile, or relevant project links
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 06. NEXT STEPS (ROUTE HANDOFFS)                              */}
        {/* ============================================================ */}
        <section className="relative pb-16 sm:pb-20 lg:pb-24">
          <div className="mb-7 flex items-center gap-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C7D6E]">
              Next steps
            </h2>
            <div className="h-px flex-1 bg-[#DDD3C4]" aria-hidden="true" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_2.2fr] lg:items-start">
            {/* Left Title */}
            <div>
              <h2 className="font-editorial text-3xl sm:text-4xl font-normal leading-[1.12] tracking-tight text-[#1C1713]">
                Review the public{' '}
                <br />
                Hylono path first.
              </h2>
              <p className="mt-3.5 max-w-xs text-sm leading-relaxed text-[#5C5247]">
                Understand our platform, support operations, and company standards before submitting an inquiry.
              </p>
            </div>

            {/* Right Column: 3 Statuesque Destination Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {nextStepsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <CareersTrackedLink
                    key={card.title}
                    href={card.href}
                    style={luxuryCardStyle}
                    className={`${cardBaseClasses} p-7 flex flex-col justify-between block group`}
                    ctaRole="supporting"
                    eventName="careers_route_transition_clicked"
                    source="route_map"
                    statusMessage={card.statusMessage}
                  >
                    <div>
                      <div
                        style={medallionStyle}
                        className={`${medallionClasses} w-13 h-13 mb-5`}
                      >
                        <Icon size={20} aria-hidden="true" />
                      </div>
                      <h3 className="font-editorial text-2xl font-medium text-[#1C1713]">
                        {card.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-[1.68] text-[#524940] font-normal">
                        {card.detail}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#EDE4D6] flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#8E6741] group-hover:text-[#704F2E] transition-colors">
                        {card.label}
                      </span>
                      <ArrowRight size={14} aria-hidden="true" className="text-[#8E6741] transition-transform group-hover:translate-x-1" />
                    </div>
                  </CareersTrackedLink>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 07. CONTACT SURFACES                                         */}
        {/* ============================================================ */}
        <section className="relative pb-16 sm:pb-20 lg:pb-24">
          <div className="mb-7 flex items-center gap-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C7D6E]">
              Contact surfaces
            </p>
            <div className="h-px flex-1 bg-[#DDD3C4]" aria-hidden="true" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_2.2fr] lg:items-start">
            {/* Left Title */}
            <div>
              <h2 className="font-editorial text-3xl sm:text-4xl font-normal leading-[1.12] tracking-tight text-[#1C1713]">
                Use the verified{' '}
                <br />
                Hylono channels only.
              </h2>
            </div>

            {/* Right 3 Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {contactSurfaces.map((surface) => {
                const Icon = surface.icon;
                return (
                  <div
                    key={surface.title}
                    style={luxuryCardStyle}
                    className={`${cardBaseClasses} p-6 sm:p-7 flex flex-col justify-between group`}
                  >
                    <div>
                      <div
                        style={medallionStyle}
                        className={`${medallionClasses} w-11 h-11 mb-4`}
                      >
                        <Icon size={18} aria-hidden="true" />
                      </div>
                      <h3 className="font-editorial text-xl font-medium text-[#1C1713]">
                        {surface.title}
                      </h3>
                      <p className="mt-2 text-sm leading-[1.65] text-[#524940] font-normal">
                        {surface.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 08. PAGE INTENT BANNER                                       */}
        {/* ============================================================ */}
        <section className="relative pb-8">
          <div className="mb-7 flex items-center gap-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8C7D6E]">
              Page intent
            </h2>
            <div className="h-px flex-1 bg-[#DDD3C4]" aria-hidden="true" />
          </div>

          <div
            style={{
              background: 'linear-gradient(90deg, #F5EDE1 0%, #FAF5EC 50%, #F5EDE1 100%)',
              borderColor: '#DFD3C1',
              boxShadow: '0 4px 20px rgba(130,105,75,0.06)',
            }}
            className="relative overflow-hidden rounded-[2rem] sm:rounded-full border px-7 py-6 sm:px-10 sm:py-5"
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <div className="relative h-12 w-24 shrink-0 overflow-hidden">
                <Image
                  src="/images/careers/olive-botanical.jpg"
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-contain object-left mix-blend-multiply"
                />
              </div>

              <p className="text-center text-sm sm:text-left leading-relaxed text-[#524940] font-normal">
                This page exists to clarify hiring status and direct serious
                inquiries into the supported Hylono contact path.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

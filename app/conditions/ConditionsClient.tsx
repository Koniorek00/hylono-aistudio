'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Beaker,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  Key,
  Leaf,
  Play,
  Settings,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import { conditionGoals } from '@/content/conditions';
import { disclaimers } from '@/content/disclaimers';
import {
  announceConditionRouteActionStatus,
  CONDITION_ROUTE_ACTION_STATUS_ID,
  ConditionRouteActionStatus,
} from '@/components/ConditionTransitionLink';
import { FeatureGate } from '@/components/FeatureGate';
import { ErrorPage } from '@/components/ErrorPage';
import analytics from '@/src/lib/analytics';
import { navigateToPage } from '@/src/lib/navigation';

const alternativePaths = [
  { href: '/research', label: 'Research', icon: BookOpen },
  { href: '/protocols', label: 'Protocols', icon: Beaker },
  { href: '/store', label: 'Store', icon: ShoppingBag },
  { href: '/rental', label: 'Rental', icon: Calendar },
] as const;

const goalCardCopy: Record<(typeof conditionGoals)[number]['slug'], string> = {
  recovery: 'Best after training, hard work blocks, or heavier weeks.',
  sleep: 'Best when you want an easier wind-down and better nightly rhythm.',
  stress: 'Best for calmer days and lower mental load.',
  comfort: 'Best for daily comfort and easier movement.',
  vitality: 'Best for steadier energy and focus across the week.',
};

const goalCardImages: Record<
  (typeof conditionGoals)[number]['slug'],
  { src: string; alt: string }
> = {
  recovery: {
    src: '/images/conditions/goal-recovery-alpine.jpg',
    alt: 'Golden hour sunrise over alpine mountain summit ridges',
  },
  sleep: {
    src: '/images/conditions/goal-sleep-sanctuary.jpg',
    alt: 'Restorative minimalist bedroom overlooking tranquil lake dawn',
  },
  stress: {
    src: '/images/conditions/goal-stress-dock.jpg',
    alt: 'Serene lakeside wooden dock with meditation cushion and calm water',
  },
  comfort: {
    src: '/images/conditions/goal-comfort-lounge.jpg',
    alt: 'Sunlit Scandinavian living sanctuary with lush fiddle leaf tree and warm natural light',
  },
  vitality: {
    src: '/images/conditions/goal-vitality-lake.jpg',
    alt: 'Vibrant crystal turquoise alpine glacial lake surrounded by pines and jagged peaks',
  },
};

const getConditionsHubActionStatusMessage = (destination: string, label?: string) => {
  if (destination === '/conditions#conditions-goal-grid') {
    return 'Opening goal guide grid from the conditions route.';
  }

  if (destination.startsWith('/conditions/')) {
    return `Opening ${label?.toLowerCase() ?? 'condition'} guide from the conditions route.`;
  }

  if (destination === '/research') {
    return 'Opening research hub from the conditions route.';
  }

  if (destination === '/protocols') {
    return 'Opening protocol library from the conditions route.';
  }

  if (destination === '/store') {
    return 'Opening store from the conditions route.';
  }

  if (destination === '/rental') {
    return 'Opening rental access from the conditions route.';
  }

  return `Opening ${destination} from the conditions route.`;
};

function ConditionsHub() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVideoModalOpen) {
        setIsVideoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVideoModalOpen]);

  const trackAlternateRouteClick = (destination: string) => {
    announceConditionRouteActionStatus(getConditionsHubActionStatusMessage(destination));
    analytics.capture('condition_hub_alternative_path_clicked', {
      destination,
    });
  };

  const primaryGuideGridStatusMessage = getConditionsHubActionStatusMessage(
    '/conditions#conditions-goal-grid'
  );

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-slate-950">
      <ConditionRouteActionStatus />

      {/* SECTION 1: ART-DIRECTED EDITORIAL HERO */}
      <section
        className="relative overflow-hidden pt-12 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
        aria-labelledby="conditions-hero-headline"
      >
        {/* Photographic Panorama Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/conditions/hero-panoramic-lake.jpg"
            alt="Panoramic luxury European alpine wellness retreat terrace overlooking turquoise mountain lake at sunrise"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle directional scrim matching reference warmth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/95 via-[#FAF8F5]/85 to-transparent w-full lg:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-page)] via-transparent to-transparent h-40 bottom-0" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="max-w-2xl">
              {/* Category Overline */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">
                  Conditions
                </span>
                <span className="h-px w-8 bg-[#C8BFB0]" aria-hidden="true" />
              </div>

              {/* Serif Headline with Italic Accent */}
              <h1
                id="conditions-hero-headline"
                className="mt-4 text-4xl sm:text-5xl lg:text-[3.85rem] font-normal tracking-tight text-slate-950 leading-[1.08]"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Choose the goal{' '}
                <br />
                you want to <span className="italic font-normal text-[#A27A4E]">improve.</span>
              </h1>

              {/* Lead Paragraph */}
              <p
                id="conditions-hero-description"
                className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 max-w-xl font-normal"
              >
                Start with the goal you want to support, not a device. Each guide
                links to relevant product hubs, protocol options, research notes,
                and a rental or contact next step.
              </p>

              {/* Action Buttons Row */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#conditions-goal-grid"
                  style={{ backgroundColor: '#143d34', color: '#ffffff' }}
                  className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[9999px] px-7 py-3 text-sm font-semibold shadow-xs transition-all hover:brightness-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300"
                  aria-describedby={CONDITION_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => {
                    announceConditionRouteActionStatus(primaryGuideGridStatusMessage);
                  }}
                  onClick={() => {
                    announceConditionRouteActionStatus(primaryGuideGridStatusMessage);
                    analytics.capture('condition_hub_primary_cta_clicked', {
                      destination: '/conditions#conditions-goal-grid',
                    });
                  }}
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>Browse the goal guides</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[9999px] border border-[#DDD6C8] bg-white/85 backdrop-blur-xs px-5 py-3 text-sm font-semibold text-slate-800 transition-all hover:bg-white hover:border-[#C4B7A0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 shadow-xs"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-[9999px] border border-[#C8BCA6] bg-[#F4EFEA] text-[#966D48]">
                    <Play className="h-2.5 w-2.5 fill-[#966D48] text-[#966D48] ml-0.5" aria-hidden="true" />
                  </span>
                  <span>Watch how it works</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Right Column: Floating Video Preview Card */}
            <div className="flex justify-center lg:justify-end">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                aria-label="Play video: How Hylono goal guides work (duration 0:48)"
                className="group relative block aspect-[16/10] sm:aspect-[16/9] w-full max-w-lg lg:max-w-none overflow-hidden rounded-[20px] border-2 border-white/85 shadow-[0_20px_50px_rgba(20,61,52,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 cursor-pointer text-left"
              >
                <Image
                  src="/images/conditions/hero-video-preview.jpg"
                  alt="Cinematic alpine lake landscape at sunrise with morning mist"
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-[9999px] bg-white/35 backdrop-blur-md border border-white/70 shadow-xs transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-6 w-6 fill-white text-white ml-1" aria-hidden="true" />
                  </span>
                </div>
                <span className="absolute bottom-3 right-3 rounded-[9999px] bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[11px] font-mono font-medium text-white">
                  0:48
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FLOATING TELEMETRY / FEATURE RIBBON */}
      <section className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-12">
        <div className="rounded-[20px] border border-[#E8E1D5] bg-[#FAF8F5]/95 backdrop-blur-xs p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E1D5]">
            {/* Ribbon Item 1 */}
            <div className="flex items-center gap-3.5 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] bg-[#F4EFEA] border border-[#DDD5C7] text-[#966D48]">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-2xl font-light text-slate-950 leading-none" style={{ fontFamily: 'var(--font-cormorant)' }}>5</span>
                <span className="block text-xs font-medium text-slate-600 mt-1">Goal guides</span>
              </div>
            </div>

            {/* Ribbon Item 2 */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] bg-[#F4EFEA] border border-[#DDD5C7] text-[#966D48]">
                <Settings className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-semibold text-slate-900 leading-snug">Technology<br className="hidden lg:block" /> comparison</span>
              </div>
            </div>

            {/* Ribbon Item 3 */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] bg-[#F4EFEA] border border-[#DDD5C7] text-[#966D48]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-semibold text-slate-900 leading-snug">Inside each guide</span>
              </div>
            </div>

            {/* Ribbon Item 4 */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] bg-[#F4EFEA] border border-[#DDD5C7] text-[#966D48]">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-semibold text-slate-900 leading-snug">Research &amp;<br className="hidden lg:block" /> protocol</span>
              </div>
            </div>

            {/* Ribbon Item 5 */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] bg-[#F4EFEA] border border-[#DDD5C7] text-[#966D48]">
                <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-semibold text-slate-900 leading-snug">Rental next steps</span>
              </div>
            </div>
          </div>

          {/* Subline */}
          <div className="mt-4 pt-3.5 border-t border-[#EAE4D8] flex items-center justify-center gap-2 text-xs text-slate-600">
            <span className="text-[#966D48] font-bold" aria-hidden="true">→</span>
            <span>Use the guides below as the primary path, then move into research, protocols, rental, or contact.</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE GOAL GUIDES (5 TALL EDITORIAL CARDS) */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-16"
        aria-labelledby="conditions-guides-section-heading"
      >
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
            The Goal Guides
          </span>
          <span className="h-px w-8 bg-[#C8BFB0]" aria-hidden="true" />
        </div>

        <div className="mt-2 flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 border-b border-slate-200 pb-6 mb-8">
          <h2
            id="conditions-guides-section-heading"
            className="text-2xl sm:text-3xl lg:text-[2.15rem] font-normal tracking-tight text-slate-950"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Select the area you want to improve and explore your options.
          </h2>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shrink-0">
            Goals for a longer, healthier life.
          </p>
        </div>

        {/* 5-Column Goal Card Grid */}
        <div
          id="conditions-goal-grid"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5"
          style={{ scrollMarginTop: 'calc(var(--route-header-offset, 0px) + 1rem)' }}
        >
          {conditionGoals.map((goal, index) => {
            const cardImg = goalCardImages[goal.slug];
            const numStr = String(index + 1).padStart(2, '0');

            return (
              <Link
                key={goal.slug}
                href={`/conditions/${goal.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-slate-200 bg-[#FCFBF8] transition-all duration-300 hover:-translate-y-1 hover:border-[#143D34]/40 hover:shadow-xs focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300"
                aria-describedby={CONDITION_ROUTE_ACTION_STATUS_ID}
                onFocus={() => {
                  announceConditionRouteActionStatus(
                    getConditionsHubActionStatusMessage(`/conditions/${goal.slug}`, goal.title)
                  );
                }}
                onClick={() => {
                  announceConditionRouteActionStatus(
                    getConditionsHubActionStatusMessage(`/conditions/${goal.slug}`, goal.title)
                  );
                  analytics.capture('condition_hub_goal_selected', {
                    goal: goal.slug,
                  });
                }}
              >
                {/* Top Image Container */}
                <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={cardImg.src}
                    alt={cardImg.alt}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle directional scrim */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />

                  {/* Delicate bottom mist fade dissolving image seamlessly into the card background */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FCFBF8] via-[#FCFBF8]/60 to-transparent pointer-events-none" />

                  {/* Faint oversized watermark numeral */}
                  <span
                    aria-hidden="true"
                    className="absolute top-3 left-3 text-3xl font-light tracking-wider text-white/90 select-none drop-shadow-xs"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {numStr}
                  </span>
                </div>

                {/* Bottom Content Panel */}
                <div className="relative flex flex-1 flex-col justify-between p-5 sm:p-6 bg-[#FCFBF8]">
                  <div>
                    {/* Number Stacked Above Title */}
                    <div>
                      <span
                        className="block text-3xl font-light text-[#966D48] leading-none mb-1.5 select-none"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {numStr}
                      </span>
                      <h2
                        className="text-2xl font-normal tracking-tight text-slate-950 transition-colors group-hover:text-[#143D34]"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {goal.title}
                      </h2>
                    </div>

                    {/* Primary short description */}
                    <p className="mt-2.5 text-xs font-medium leading-relaxed text-slate-700">
                      {goalCardCopy[goal.slug]}
                    </p>

                    {/* Secondary description */}
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                      See the best-fit devices, read the research summary, and move to protocols, rental, or contact.
                    </p>

                    {/* 4 Decorative Pathway Rows matching reference */}
                    <div className="mt-5 divide-y divide-[#F2EEE8] border-t border-b border-[#F2EEE8]">
                      <div className="flex items-center justify-between py-2 text-xs text-slate-700 transition-colors group-hover:text-slate-900">
                        <span className="flex items-center gap-2.5">
                          <Beaker className="h-3.5 w-3.5 text-[#966D48]" aria-hidden="true" />
                          <span className="font-medium">Research</span>
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </div>
                      <div className="flex items-center justify-between py-2 text-xs text-slate-700 transition-colors group-hover:text-slate-900">
                        <span className="flex items-center gap-2.5">
                          <ShoppingBag className="h-3.5 w-3.5 text-[#966D48]" aria-hidden="true" />
                          <span className="font-medium">Products</span>
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </div>
                      <div className="flex items-center justify-between py-2 text-xs text-slate-700 transition-colors group-hover:text-slate-900">
                        <span className="flex items-center gap-2.5">
                          <Activity className="h-3.5 w-3.5 text-[#966D48]" aria-hidden="true" />
                          <span className="font-medium">Protocols</span>
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </div>
                      <div className="flex items-center justify-between py-2 text-xs text-slate-700 transition-colors group-hover:text-slate-900">
                        <span className="flex items-center gap-2.5">
                          <Key className="h-3.5 w-3.5 text-[#966D48]" aria-hidden="true" />
                          <span className="font-medium">Rental/Contact</span>
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  {/* Open Guide Action Button */}
                  <div
                    style={{ backgroundColor: '#143d34', color: '#ffffff' }}
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[9999px] px-4 py-2.5 text-xs font-semibold shadow-xs transition-all group-hover:brightness-90"
                  >
                    <span>Open guide</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: QUICK ACCESS ALTERNATIVE ROUTES */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
        aria-labelledby="conditions-quick-access-heading"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2.9fr)] items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D46]">
                Quick Access
              </span>
              <span className="h-px w-8 bg-[#C8BFB0]" aria-hidden="true" />
            </div>
            <h3
              id="conditions-quick-access-heading"
              className="mt-2 text-2xl sm:text-3xl font-normal tracking-tight text-slate-950"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Prefer a different starting point?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Jump directly to the area you need.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {alternativePaths.map((path) => {
              const Icon = path.icon;
              return (
                <Link
                  key={path.href}
                  href={path.href}
                  className="group flex flex-col items-center justify-center min-h-11 min-h-[110px] rounded-[16px] border border-[#E8E2D5] bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#143D34]/40 hover:shadow-xs focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 shadow-xs"
                  aria-describedby={CONDITION_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => {
                    announceConditionRouteActionStatus(
                      getConditionsHubActionStatusMessage(path.href)
                    );
                  }}
                  onClick={() => trackAlternateRouteClick(path.href)}
                >
                  <Icon className="h-7 w-7 text-[#966D48] stroke-[1.5] transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  <div className="mt-3.5 flex items-center justify-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-950 group-hover:text-[#143D34] transition-colors">
                      {path.label}
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-[#966D48] group-hover:translate-x-1 transition-transform"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: ABOUT OUR APPROACH (WARM EDITORIAL SECTION WITH CELLULAR DROPLET ARTWORK) */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 my-6 border-t border-b border-[#EAE4D8]"
        aria-labelledby="conditions-approach-heading"
      >
        <div className="flex flex-col md:flex-row items-stretch gap-6 lg:gap-10">
          {/* Left Cellular Droplet Artwork */}
          <div className="relative w-full md:w-[240px] lg:w-[280px] shrink-0 h-48 md:h-auto min-h-[190px] rounded-[20px] overflow-hidden border border-[#E8E2D5] bg-[#F5F2EB]">
            <Image
              src="/images/chambers/hbot-redesign/water-bubble-texture.png"
              alt="Cellular hydration bubbles and transparent liquid refraction caustics"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 280px"
              className="object-cover object-center opacity-85 mix-blend-multiply"
            />
          </div>

          {/* Center Editorial Disclaimer & Mission */}
          <div className="flex-1 py-2 flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D46]">
                About our approach
              </span>
              <span className="h-px w-8 bg-[#C8BFB0]" aria-hidden="true" />
            </div>
            <h2
              id="conditions-approach-heading"
              className="mt-2 text-2xl sm:text-3xl font-normal tracking-tight text-slate-950"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Evidence. Guidance. Support.
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
              {disclaimers.general}
            </p>
          </div>

          {/* Right Quality Seal Column with vertical separator */}
          <div className="w-full md:w-[220px] lg:w-[250px] shrink-0 border-t md:border-t-0 md:border-l border-[#E2DACB] pt-6 md:pt-0 md:pl-8 lg:pl-10 flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[9999px] border border-[#D5CDBD] bg-[#F2EFE8] text-[#8C6D46] mb-3 shadow-xs">
              <Leaf className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3
              className="text-base sm:text-lg font-normal text-slate-950"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Trusted guidance
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Evidence-informed &bull; Service-oriented &bull; European focus
            </p>
          </div>
        </div>
      </section>

      {/* ACCESSIBLE VIDEO PLAYER MODAL */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="How Hylono goal guides work"
        >
          <div className="relative w-full max-w-3xl rounded-[20px] border border-white/20 bg-slate-950 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-white/10 text-white">
              <span className="text-sm font-medium">How Hylono Goal Guides Work</span>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                aria-label="Close video dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <video
                src="/videos/hero/hero2-ambient.mp4"
                poster="/images/conditions/hero-video-preview.jpg"
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConditionsClient() {
  const router = useRouter();

  const navigateTo = (page: string) => {
    navigateToPage(router, page);
  };

  return (
    <FeatureGate
      flag="feature_condition_pages"
      fallback={<ErrorPage type="404" onNavigate={navigateTo} />}
    >
      <ConditionsHub />
    </FeatureGate>
  );
}

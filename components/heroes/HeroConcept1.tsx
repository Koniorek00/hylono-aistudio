'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Droplets,
  Headphones,
  PackageCheck,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  Sun,
  Wind,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { homepagePrimaryLinks } from '@/content/topical-graph';
import { HOME_ROUTE_ACTION_STATUS_ID, announceHomeRouteAction } from '@/components/home/HomeRouteActionStatus';

interface HeroConcept1Props {
  onSeeHowItWorks: (source: string) => void;
  onOpenPlanner: (source: string) => void;
  onStartConsultation: (source: string) => void;
}

const MODALITY_OVERVIEW = [
  {
    title: 'Oxygen',
    label: 'HBOT and oxygen-led options',
    description: 'Pressure-based oxygen paths for guided home and professional routines.',
    href: '/product/hbot',
    accent: 'var(--accent-oxygen)',
    Icon: Wind,
  },
  {
    title: 'Hydrogen',
    label: 'Hydrogen support paths',
    description: 'Hydrogen pages connected to protocol planning, rentals, and follow-up support.',
    href: '/product/hydrogen',
    accent: 'var(--accent-hydrogen)',
    Icon: Droplets,
  },
  {
    title: 'Light',
    label: 'Photobiomodulation options',
    description: 'Red and near-infrared light pathways with product, protocol, and research links.',
    href: '/product/rlt',
    accent: 'var(--accent-light)',
    Icon: Sun,
  },
  {
    title: 'Signal',
    label: 'PEMF and signal-based options',
    description: 'Signal-based routines positioned conservatively and explained through the wider site.',
    href: '/product/pemf',
    accent: 'var(--accent-signal)',
    Icon: Activity,
  },
] as const;

const FIRST_SCREEN_TRUST_ITEMS = [
  { label: 'Curated technologies', Icon: Route },
  { label: 'Evidence-aware guidance', Icon: ShieldCheck },
  { label: 'Rental and ownership paths', Icon: PackageCheck },
  { label: siteEntity.supportCoverageLabel, Icon: Headphones },
] as const;

const FIRST_SCREEN_PROOF_CONTEXT = [
  {
    label: 'Evidence library',
    value: 'Research stays linked before claims become recommendations.',
  },
  {
    label: 'Policy pages',
    value: 'Rental, ownership, and policy routes stay visible before checkout.',
  },
  {
    label: 'Human review path',
    value: 'Unclear setup questions move to consultation, not a fake instant answer.',
  },
] as const;

const INTRO_TIMELINE = ['Goal', 'Technology', 'Protocol', 'Access'] as const;

export const HeroConcept1: React.FC<HeroConcept1Props> = ({
  onOpenPlanner,
  onSeeHowItWorks,
  onStartConsultation,
}) => {
  return (
    <section
      id="home-hero"
      aria-labelledby="home-hero-headline"
      className="hylono-premium-shell relative -mt-[72px] overflow-hidden border-b border-[var(--border-soft)] text-[var(--text-primary)] xl:-mt-[104px]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-[72px] h-px bg-gradient-to-r from-transparent via-[var(--border-soft)] to-transparent xl:top-[104px]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/55 to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-10 px-6 pb-14 pt-28 sm:pt-32 md:items-center md:pb-16 md:pt-36 xl:min-h-screen xl:pt-44 xl:grid-cols-[0.9fr_1.1fr]">
        {/* ── Left column ── */}
        <div className="w-full min-w-0 max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-oxygen)] shadow-sm">
            <Sparkles size={14} aria-hidden />
            European wellness-technology platform
          </p>

          <h1
            id="home-hero-headline"
            className="mt-7 max-w-full break-words text-4xl font-semibold leading-[1.04] text-[var(--surface-ink)] sm:text-5xl md:text-6xl md:leading-[1.02]"
          >
            Meet the right{' '}
            <span className="relative inline text-[var(--accent-oxygen)] sm:inline-block">
              wellness technology before you buy or rent.
            </span>
          </h1>

          <p
            id="home-hero-description"
            className="mt-7 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg md:leading-9"
          >
            Start with your goal. Hylono compares oxygen, hydrogen, light, and signal-based
            options, then keeps research context, setup planning, rental, ownership, and support
            in one guided path.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/consultation"
              prefetch={false}
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/consultation', 'homepage hero')}
              onClick={(event) => {
                event.preventDefault();
                announceHomeRouteAction('/consultation', 'homepage hero');
                onStartConsultation('hero');
              }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[var(--surface-ink)] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_15px_rgba(15,23,42,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_0_25px_rgba(15,23,42,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:text-sm"
            >
              Book a consultation
            </Link>
            <Link
              href="/wellness-planner"
              prefetch={false}
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/wellness-planner', 'homepage hero')}
              onClick={(event) => {
                event.preventDefault();
                announceHomeRouteAction('/wellness-planner', 'homepage hero');
                onOpenPlanner('hero');
              }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/70 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--surface-ink)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:text-sm"
            >
              Build your plan
            </Link>
            <motion.a
              href="/research"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('/research', 'homepage hero')}
              onClick={() => announceHomeRouteAction('/research', 'homepage hero')}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-oxygen)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--accent-oxygen)]/10 hover:text-[var(--surface-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:text-sm"
              whileTap={{ scale: 0.96 }}
            >
              Review research
              <ArrowRight size={15} className="shrink-0" aria-hidden />
            </motion.a>
            <button
              type="button"
              aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
              onFocus={() => announceHomeRouteAction('#home-how-it-works', 'homepage hero')}
              onClick={() => {
                announceHomeRouteAction('#home-how-it-works', 'homepage hero');
                onSeeHowItWorks('hero');
              }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-[var(--surface-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:text-sm"
            >
              See how it works
            </button>
          </div>

          <div className="mt-10 border-l border-[var(--line-subtle)] pl-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-oxygen)]">
              Core paths
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {homepagePrimaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceHomeRouteAction(link.href, 'homepage core pages')}
                  onClick={() => announceHomeRouteAction(link.href, 'homepage core pages')}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--line-subtle)] bg-white/72 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-[var(--accent-oxygen)] hover:bg-white hover:text-[var(--surface-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="truncate">{link.label}</span>
                  <ArrowRight size={14} className="shrink-0" />
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
              {FIRST_SCREEN_TRUST_ITEMS.map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex min-h-8 items-center gap-2 text-sm font-medium text-[var(--text-secondary)]"
                >
                  <Icon size={16} className="shrink-0 text-[var(--accent-oxygen)]" />
                  <span>{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <motion.aside
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
          className="relative min-w-0 overflow-hidden rounded-[2rem] border border-[var(--line-subtle)] bg-white/82 p-3 text-[var(--text-primary)] shadow-[var(--shadow-premium)] md:p-4"
        >
          <div className="relative min-h-[380px] sm:min-h-[460px] md:min-h-[560px] overflow-hidden rounded-[1.5rem] border border-white/65 bg-[#dfeae7]">
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-78"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/videos/hero/hylono-main-hero-v3-poster.jpg"
              aria-label="Remotion introduction to Hylono guided wellness technology access"
            >
              <source src="/videos/hero/hylono-main-hero-v3.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute left-4 top-4 hidden w-auto min-w-[7.5rem] max-w-[9rem] flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-2.5 backdrop-blur md:flex">
              {INTRO_TIMELINE.map((step, index) => (
                <span
                  key={step}
                  className="inline-flex min-h-8 items-center gap-2 rounded-full px-2 text-xs font-semibold text-white/90"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="truncate">{step}</span>
                </span>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                <Play size={12} fill="currentColor" className="shrink-0" aria-hidden />
                Remotion introduction
              </div>
              <h2 className="mt-3.5 max-w-xl text-xl font-semibold leading-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
                Guided systems, evidence limits, setup review, and access in one path.
              </h2>
              <p className="mt-2.5 max-w-xl text-xs leading-5 text-white/80 sm:text-sm sm:leading-6 md:text-base md:leading-7">
                A product-led introduction to how Hylono organizes modality fit before rental,
                ownership, or consultation.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-[var(--line-subtle)] bg-white/78 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-oxygen)]">
              Guided access map
            </p>
            <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {MODALITY_OVERVIEW.map(({ title, label, description, href, accent, Icon }) => (
                <Link
                  key={title}
                  href={href}
                  aria-describedby={HOME_ROUTE_ACTION_STATUS_ID}
                  onFocus={() => announceHomeRouteAction(href, 'homepage guided access map')}
                  onClick={() => announceHomeRouteAction(href, 'homepage guided access map')}
                  className="group inline-flex min-h-12 min-w-0 items-center gap-3 rounded-2xl border border-[var(--line-subtle)] bg-white/82 px-3.5 py-2.5 text-left transition-all duration-300 hover:-translate-y-px hover:border-[var(--accent-oxygen)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  title={description}
                >
                  <Icon size={18} className="shrink-0" style={{ color: accent }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--surface-ink)]">{title}</span>
                    <span className="block truncate text-xs text-[var(--text-secondary)]">{label}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <dl className="mt-4 flex flex-col gap-3 rounded-[1.35rem] border border-[var(--line-subtle)] bg-white/78 p-4 backdrop-blur">
            {FIRST_SCREEN_PROOF_CONTEXT.map((item) => (
              <div key={item.label} className="flex flex-col gap-1 border-t border-[var(--line-subtle)] pt-3 first:border-t-0 first:pt-0 md:flex-row md:items-start md:gap-4">
                <dt className="min-w-0 shrink-0 text-sm font-semibold text-[var(--surface-ink)] md:w-36">{item.label}</dt>
                <dd className="min-w-0 flex-1 text-sm leading-6 text-[var(--text-secondary)]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </motion.aside>
      </div>
    </section>
  );
};

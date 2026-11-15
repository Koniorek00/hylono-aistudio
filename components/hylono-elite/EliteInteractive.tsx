'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import analytics from '@/src/lib/analytics';
import type { EliteTechnology, EliteTone } from './content';
import styles from './elite.module.css';

const ROUTE = '/hylono-elite';

const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(' ');

/** Wayfinding colours from docs/brand/01 §4: text-safe shade for labels, indicator shade for dots. */
export const toneStyles: Record<
  EliteTone,
  { text: string; dot: string; ring: string; tagLight: string; tagDark: string }
> = {
  oxygen: {
    text: 'text-[#0369A1]',
    dot: 'bg-[#38BDF8]',
    ring: 'ring-[#38BDF8]/40',
    tagLight: 'border-[#BAE6FD] bg-white/85 text-[#0369A1]',
    tagDark: 'border-white/25 bg-black/30 text-[#BAE6FD]',
  },
  hydrogen: {
    text: 'text-[#0F766E]',
    dot: 'bg-[#14B8A6]',
    ring: 'ring-[#14B8A6]/40',
    tagLight: 'border-[#99F6E4] bg-white/85 text-[#0F766E]',
    tagDark: 'border-white/25 bg-black/30 text-[#99F6E4]',
  },
  light: {
    text: 'text-[#C2410C]',
    dot: 'bg-[#FB923C]',
    ring: 'ring-[#FB923C]/40',
    tagLight: 'border-[#FED7AA] bg-white/85 text-[#C2410C]',
    tagDark: 'border-white/25 bg-black/35 text-[#FED7AA]',
  },
  field: {
    text: 'text-[#6D28D9]',
    dot: 'bg-[#A78BFA]',
    ring: 'ring-[#A78BFA]/40',
    tagLight: 'border-[#DDD6FE] bg-white/85 text-[#6D28D9]',
    tagDark: 'border-white/25 bg-black/35 text-[#DDD6FE]',
  },
};

const track = (destination: string, source: string) => {
  if (source === 'hero') {
    analytics.capture('hero_cta_click', {
      route: ROUTE,
      destination,
      cta_role: destination === '/consultation' ? 'primary' : 'supporting',
      source,
    });
  }
  if (destination === '/consultation') {
    analytics.capture('home_consultation_cta_clicked', { destination, source });
  }
  analytics.capture('home_access_path_clicked', { route: ROUTE, destination, source });
};

/** Native anchor so navigation works without JavaScript; analytics respects consent. */
export function EliteLink({
  href,
  source,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  source: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a href={href} className={className} aria-label={ariaLabel} onClick={() => track(href, source)}>
      {children}
    </a>
  );
}

/**
 * Hero stage: the photograph behind the headline follows the technology the visitor points at.
 * Visitor-driven only (no autoplay rotation). The first image is the LCP candidate.
 */
export function EliteHeroStage({
  technologies,
  children,
}: {
  technologies: readonly EliteTechnology[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const current = technologies[active] ?? technologies[0];
  if (!current) return null;
  const tone = toneStyles[current.id];

  return (
    <section
      aria-labelledby="elite-hero-title"
      className="relative isolate overflow-hidden bg-[#FAF8F5] pb-24 pt-10 sm:pt-14 lg:min-h-[860px] lg:pb-32 lg:pt-16"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {technologies.map((tech, index) => (
          <div
            key={tech.id}
            className={cx(
              'absolute inset-0 transition-opacity duration-[1400ms] ease-out motion-reduce:transition-none',
              index === active ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Image
              src={tech.stage.src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              quality={82}
              className={cx('object-cover', index === 0 && styles.settle)}
              style={{ objectPosition: tech.stage.position ?? '50% 50%' }}
            />
          </div>
        ))}
        {/* Directional alabaster scrims keep the text column readable on every photograph. */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/95 via-[#FAF8F5]/80 to-[#FAF8F5]/30 lg:hidden" />
        <div className="absolute inset-y-0 left-0 hidden w-[76%] bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent lg:block" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#FAF8F5]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-end lg:gap-10 lg:px-8">
        <div className="lg:col-span-7 lg:pb-6">{children}</div>

        <div className={cx('lg:col-span-5', styles.rise, styles.rise5)}>
          <div className="rounded-[2rem] border border-white/80 bg-white/70 p-3 shadow-[0_30px_80px_-30px_rgba(20,25,23,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 pb-3 pt-3">
              <span className={cx(styles.identity, 'text-[10px] text-[#966D48]')}>Four technologies</span>
              <span className="font-mono text-[11px] tabular-nums text-slate-600" aria-hidden="true">
                {current.number} / 0{technologies.length}
              </span>
            </div>

            <div className="grid gap-1" role="group" aria-label="Preview a technology">
              {technologies.map((tech, index) => {
                const isActive = index === active;
                const t = toneStyles[tech.id];
                return (
                  <button
                    key={tech.id}
                    type="button"
                    aria-pressed={isActive}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    className={cx(
                      'group relative flex min-h-14 w-full items-center gap-4 overflow-hidden rounded-[1.25rem] px-4 py-3 text-left transition-[background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300',
                      isActive
                        ? 'bg-white shadow-[0_10px_30px_-12px_rgba(20,25,23,0.25)]'
                        : 'hover:bg-white/60'
                    )}
                  >
                    <span className={cx('h-2 w-2 shrink-0 rounded-full', t.dot, isActive && `ring-4 ${t.ring}`)} />
                    <span className={cx(styles.serif, 'w-14 shrink-0 text-2xl italic', t.text)} aria-hidden="true">
                      {tech.symbol}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">{tech.name}</span>
                      <span className="block text-xs text-slate-600">{tech.detail}</span>
                    </span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className={cx('absolute inset-x-4 bottom-0 h-px', t.dot, styles.meter)}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 rounded-[1.5rem] bg-[#FAF8F5]/90 px-5 py-5" aria-live="polite">
              <p className="text-sm leading-relaxed text-slate-700">{current.copy}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <EliteLink
                  href={current.path}
                  source="hero-selector"
                  className={cx(
                    'inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline',
                    tone.text
                  )}
                >
                  {current.action}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </EliteLink>
                <span className="text-[11px] text-slate-600">Concept render · AI-generated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Technology atlas: four full-photograph cards. On wide screens the card in focus widens and
 * reveals its copy; on smaller screens every card shows its copy.
 */
export function EliteAtlas({ technologies }: { technologies: readonly EliteTechnology[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4 lg:h-[660px] lg:flex-row">
      {technologies.map((tech, index) => {
        const isActive = index === active;
        const dark = tech.id === 'light' || tech.id === 'field';
        const t = toneStyles[tech.id];
        return (
          <article
            key={tech.id}
            id={`elite-tech-${tech.id}`}
            aria-labelledby={`elite-tech-${tech.id}-title`}
            onMouseEnter={() => setActive(index)}
            onFocusCapture={() => setActive(index)}
            className={cx(
              'group relative isolate flex min-h-[500px] flex-col justify-between overflow-hidden rounded-[2rem] border p-6 shadow-[0_15px_35px_rgba(20,25,23,0.06)] transition-[flex-grow,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:p-8 lg:min-h-0 lg:basis-0',
              dark ? 'border-white/10 text-white' : 'border-[#E8E2D8] text-[#141716]',
              isActive ? 'lg:grow-[2.3] shadow-[0_30px_70px_-30px_rgba(20,25,23,0.35)]' : 'lg:grow'
            )}
          >
            <Image
              src={tech.card.src}
              alt={tech.card.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="-z-20 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:transition-none"
              style={{ objectPosition: tech.card.position ?? '50% 50%' }}
            />
            {dark ? (
              <>
                <div
                  className={cx(
                    'absolute inset-0 -z-10 bg-gradient-to-t to-transparent',
                    tech.id === 'light'
                      ? 'from-[#2A0E0A] via-[#2A0E0A]/75'
                      : 'from-[#17122B] via-[#17122B]/75'
                  )}
                />
                <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-black/35 to-transparent" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white via-white/80 to-transparent" />
                <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-white/50 to-transparent" />
              </>
            )}

            <div className="flex items-start justify-between gap-4">
              <span
                className={cx(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md',
                  dark ? t.tagDark : t.tagLight
                )}
              >
                <span className={cx('h-1.5 w-1.5 rounded-full', t.dot)} aria-hidden="true" />
                {tech.short}
              </span>
              <span
                aria-hidden="true"
                className={cx(
                  styles.serif,
                  'text-4xl italic leading-none drop-shadow-sm',
                  dark ? 'text-white/90' : t.text
                )}
              >
                {tech.symbol}
              </span>
            </div>

            <div>
              <span
                aria-hidden="true"
                className={cx(styles.serif, 'block text-3xl font-light', dark ? 'text-white/55' : 'text-[#966D48]')}
              >
                {tech.number}
              </span>
              <h3
                id={`elite-tech-${tech.id}-title`}
                className={cx(
                  styles.displayM,
                  'mt-1 text-[2rem] transition-[font-size] duration-700 sm:text-[2.4rem]',
                  isActive ? 'lg:text-[2.8rem]' : 'lg:text-[1.85rem]'
                )}
              >
                {tech.name}
              </h3>
              <div
                className={cx(
                  'grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                  isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0'
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <p
                    className={cx(
                      'mt-4 max-w-md text-[15px] leading-relaxed',
                      dark ? 'text-white/85' : 'text-slate-700'
                    )}
                  >
                    {tech.copy}
                  </p>
                  <p
                    className={cx(
                      'mt-4 text-[11px] font-semibold uppercase tracking-[0.18em]',
                      dark ? 'text-white/70' : 'text-slate-600'
                    )}
                  >
                    {tech.detail}
                  </p>
                  <EliteLink
                    href={tech.path}
                    source="technology-atlas"
                    className={cx(
                      'mt-6 inline-flex min-h-11 items-center gap-3 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300',
                      dark
                        ? 'bg-white text-[#141716] hover:bg-white/90'
                        : 'bg-[#143D34] text-white hover:bg-[#0F2F28]'
                    )}
                  >
                    {tech.action}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </EliteLink>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

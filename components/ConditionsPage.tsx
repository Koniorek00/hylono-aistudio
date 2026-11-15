"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, Sparkles, Filter, AlertTriangle } from 'lucide-react';
import { NavigateFunction } from '../types';
import { conditionGoalBySlug, conditionGoals } from '../content/conditions';
import { evidenceById } from '../content/evidence';
import { disclaimers } from '../content/disclaimers';
import { toProtocolCardView } from '../content/protocolView';
import { ConditionDetailShell, getConditionDetailJourney } from './ConditionDetailShell';
import { ConditionRoutineDecisionFrame } from './ConditionRoutineDecisionFrame';
import { ProtocolCard } from './protocols/ProtocolCard';

interface ConditionsPageProps {
  slug?: string;
  hideIntroShell?: boolean;
  onNavigate?: NavigateFunction;
}

const MODALITY_FILTER_OPTIONS = ['All', 'HBOT', 'Hydrogen', 'Red Light', 'PEMF'] as const;
type ModalityFilter = (typeof MODALITY_FILTER_OPTIONS)[number];

const modalityProductHref = {
  HBOT: '/product/hbot',
  H2: '/product/hydrogen',
  RLT: '/product/rlt',
  PEMF: '/product/pemf',
} as const;

const RelevanceDots: React.FC<{ score: number }> = ({ score }) => {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-slate-300 shrink-0"
      aria-label={`Relevance ${score} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`dot-${index}`}
          className={`h-2.5 w-2.5 rounded-sm shrink-0 ${
            index < score ? 'bg-cyan-300' : 'bg-white/[0.12]'
          }`}
          aria-hidden
        />
      ))}
    </span>
  );
};

export const ConditionsPage: React.FC<ConditionsPageProps> = ({
  slug,
  hideIntroShell = false,
  onNavigate: _onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<ModalityFilter>('All');

  const filteredGoals = useMemo(() => {
    return conditionGoals.filter((goal) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        goal.title.toLowerCase().includes(query) ||
        goal.subtitle.toLowerCase().includes(query) ||
        goal.description.some((d) => d.toLowerCase().includes(query)) ||
        goal.modalities.some(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.shortName.toLowerCase().includes(query)
        );

      const matchesModality =
        selectedModality === 'All' ||
        goal.modalities.some((m) => {
          if (selectedModality === 'HBOT') return m.slug === 'HBOT';
          if (selectedModality === 'Hydrogen') return m.slug === 'H2';
          if (selectedModality === 'Red Light') return m.slug === 'RLT';
          if (selectedModality === 'PEMF') return m.slug === 'PEMF';
          return true;
        });

      return matchesSearch && matchesModality;
    });
  }, [searchQuery, selectedModality]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedModality !== 'All';

  if (!slug) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <header className="rounded-lg border border-white/10 bg-white/[0.045] p-6 sm:p-8 md:p-12 mb-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-300 mb-4">
              <Sparkles size={13} className="shrink-0" />
              Goal Guides
            </div>
            <h1 id="conditions-hero-headline" className="text-3xl sm:text-4xl font-bold text-white break-words">Goal-based wellness guides</h1>
            <p id="conditions-hero-description" className="mt-2 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Explore evidence-informed pages for recovery, sleep, stress, comfort, and vitality. Compare modalities and structured routines.
            </p>

            {/* Search Bar & Filter Chips */}
            <div className="mt-6 space-y-4">
              <div className="relative flex items-center max-w-2xl">
                <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search goals, modalities, or wellness targets..."
                  aria-label="Search wellness goals"
                  className="min-h-11 w-full rounded-lg border border-white/15 bg-slate-900/90 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 mr-1 flex items-center gap-1">
                  <Filter size={12} className="shrink-0" /> Modality:
                </span>
                {MODALITY_FILTER_OPTIONS.map((opt) => {
                  const isActive = selectedModality === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedModality(opt)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-300 text-slate-950 font-bold shadow-sm'
                          : 'border border-white/15 bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedModality('All');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 ml-2"
                  >
                    <X size={12} /> Reset
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Goals Grid */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGoals.map((goal) => (
              <Link
                key={goal.slug}
                href={`/conditions/${goal.slug}`}
                className="group block min-h-11 rounded-lg border border-white/10 border-t-2 border-t-cyan-300/70 bg-white/[0.045] p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-white/[0.08] min-w-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Goal Guide
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {goal.modalities.length} modalities
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors break-words">{goal.title}</h2>
                <p className="mt-2 text-sm text-slate-300 line-clamp-2 break-words leading-relaxed">{goal.subtitle}</p>

                {/* Modality Chips Preview */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {goal.modalities.map((m) => (
                    <span
                      key={`${goal.slug}-${m.slug}`}
                      className="rounded-md border border-white/10 bg-slate-900/60 px-2 py-0.5 text-[11px] font-medium text-slate-300"
                    >
                      {m.shortName}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                  Explore {goal.title} guide &rarr;
                </div>
              </Link>
            ))}
          </section>

          {filteredGoals.length === 0 && (
            <div className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 p-6 text-sm text-amber-200">
              <p className="flex items-center gap-2 font-semibold text-white">
                <AlertTriangle size={16} className="text-amber-400 shrink-0" /> No goals found matching your search.
              </p>
              <p className="mt-2 text-slate-300">Try widening your filters or clearing the search bar.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedModality('All');
                }}
                className="mt-4 inline-flex items-center rounded-lg bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-200"
              >
                Clear all filters
              </button>
            </div>
          )}

          <p className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-xs leading-relaxed text-slate-300">
            {disclaimers.general}
          </p>
        </div>
      </div>
    );
  }

  const goal = conditionGoalBySlug[slug];
  if (!goal) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16 text-white">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Goal page not found</h1>
            <p className="mt-2 text-sm text-slate-400">
              Try selecting one of the available goal guides.
            </p>
            <Link
              href="/conditions"
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 text-sm font-semibold text-[#061216] transition-colors duration-200 hover:bg-cyan-200"
            >
              Back to all goals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const protocolCards = goal.protocolSlugs
    .map((protocolSlug) => toProtocolCardView(protocolSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const { primaryAction, supportingProtocol } = getConditionDetailJourney(goal);
  const fallbackAction =
    primaryAction.href === '/rental'
      ? { href: '/contact', label: 'Book a consultation' }
      : { href: '/rental', label: 'Explore rentals' };

  const detailSections = (
    <>
      {!hideIntroShell ? (
        <>
          <ConditionDetailShell goal={goal} />
        </>
      ) : null}

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
        <div className="border-l-4 border-cyan-300/70 pl-6 space-y-3 text-sm leading-relaxed text-slate-300">
          {goal.description.map((paragraph) => (
            <p key={`${goal.slug}-${paragraph}`} className="break-words">{paragraph}</p>
          ))}
        </div>
      </section>

      {goal.slug === 'recovery' || goal.slug === 'sleep' ? (
        <ConditionRoutineDecisionFrame condition={goal.slug} />
      ) : null}

      <section className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-5 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(280px,1.18fr)]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              Technology fit
            </p>
            <h2 className="mt-3 text-xl font-bold text-white break-words">Recommended technologies</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 break-words">
              Compare the modalities attached to this goal before moving to product, protocol, or
              rental next steps.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 sm:grid-cols-4">
              {goal.modalities.map((modality, index) => (
                <div
                  key={`modality-index-${goal.slug}-${modality.slug}`}
                  className="rounded-lg border border-white/10 bg-slate-950/55 px-3 py-3 min-w-0"
                >
                  <span className="block text-lg font-black leading-none text-cyan-100">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-2 block leading-5 break-words">{modality.shortName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 min-w-0">
            {goal.modalities.map((modality) => (
              <article
                key={`${goal.slug}-${modality.slug}`}
                className="group relative min-w-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/55 p-4 transition-all duration-300 hover:border-cyan-300/30 hover:bg-white/[0.08] motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-3 -top-6 text-7xl font-black leading-none text-cyan-100/15 pointer-events-none select-none overflow-hidden max-w-full transition-colors group-hover:text-cyan-100/25 motion-reduce:transition-none"
                >
                  {modality.shortName}
                </span>
                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                      Modality fit
                    </p>
                    <h3 className="mt-2 font-semibold text-white break-words">{modality.name}</h3>
                  </div>
                  <RelevanceDots score={modality.relevance} />
                </div>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-300 break-words">
                  {modality.explanation}
                </p>
                <div className="relative mt-4 h-2 overflow-hidden rounded-lg bg-white/[0.08]">
                  <div
                    className="h-full rounded-lg bg-cyan-300"
                    style={{ width: `${modality.relevance * 20}%` }}
                  />
                </div>
                <Link
                  href={modalityProductHref[modality.slug]}
                  className="relative mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 motion-reduce:transition-none"
                >
                  View devices &rarr;
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
        <h2 className="text-xl font-bold text-white break-words">
          Technology comparison for this goal
        </h2>
        <div className="mt-4 grid gap-3 md:hidden">
          {goal.modalities.map((modality) => (
            <article
              key={`mobile-compare-${goal.slug}-${modality.slug}`}
              className="rounded-lg border border-white/10 bg-slate-950/55 p-4 transition-colors duration-200 hover:border-cyan-300/30 min-w-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-white break-words">{modality.shortName}</h3>
                <RelevanceDots score={modality.relevance} />
              </div>
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-400">Session time</dt>
                  <dd className="text-right font-medium text-slate-100 break-words">{modality.sessionTime}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-400">Rental from</dt>
                  <dd className="text-right font-medium text-slate-100 break-words">{modality.rentalFrom}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-400">Purchase from</dt>
                  <dd className="text-right font-medium text-slate-100 break-words">{modality.purchaseFrom}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <div className="mt-4 hidden w-full overflow-x-auto md:block">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-300">
                <th className="py-2 pr-3">Metric</th>
                {goal.modalities.map((modality) => (
                  <th key={`head-${goal.slug}-${modality.slug}`} className="py-2 pr-3">
                    {modality.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 font-medium text-slate-400">Relevance</td>
                {goal.modalities.map((modality) => (
                  <td key={`rel-${goal.slug}-${modality.slug}`} className="py-2 pr-3">
                    <RelevanceDots score={modality.relevance} />
                  </td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 font-medium text-slate-400">Session time</td>
                {goal.modalities.map((modality) => (
                  <td key={`time-${goal.slug}-${modality.slug}`} className="py-2 pr-3 font-medium">
                    {modality.sessionTime}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-3 font-medium text-slate-400">Rental from</td>
                {goal.modalities.map((modality) => (
                  <td key={`rent-${goal.slug}-${modality.slug}`} className="py-2 pr-3 font-medium">
                    {modality.rentalFrom}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-400">Purchase from</td>
                {goal.modalities.map((modality) => (
                  <td key={`buy-${goal.slug}-${modality.slug}`} className="py-2 pr-3 font-medium">
                    {modality.purchaseFrom}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
        <h2 className="text-xl font-bold text-white break-words">Protocols</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {protocolCards.map((protocolCard) => (
            <div key={`${goal.slug}-${protocolCard.slug}`} className="min-w-0">
              <ProtocolCard
                protocol={protocolCard}
                href={`/protocols/${protocolCard.slug}`}
                compact
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
        <h2 className="text-xl font-bold text-white break-words">Recommended stacks</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goal.stacks.map((stack) => (
            <article
              key={`${goal.slug}-${stack.title}`}
              className={`rounded-lg border p-4 sm:p-5 min-w-0 flex flex-col justify-between ${
                stack.highlighted
                  ? 'border-2 border-cyan-300/40 bg-cyan-300/10'
                  : 'border-white/10 bg-slate-950/55'
              }`}
            >
              <div>
                {stack.highlighted && (
                  <span className="inline-block mb-2 rounded-md bg-cyan-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#061216]">
                    Recommended Stack
                  </span>
                )}
                <h3 className="font-semibold text-white break-words">{stack.title}</h3>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Devices:</span>
                  {stack.devices.map((device) => (
                    <span key={device} className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px]">
                      {device}
                    </span>
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-300">
                  <p className="break-words"><span className="text-slate-400">Rental:</span> {stack.rentalPrice}</p>
                  <p className="break-words"><span className="text-slate-400">Purchase:</span> {stack.purchasePrice}</p>
                </div>
              </div>
              <Link
                href={stack.link}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-semibold text-slate-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white break-words"
              >
                {stack.linkLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
        <h2 className="text-xl font-bold text-white break-words">What the research says</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {goal.evidenceIds.map((evidenceId) => {
            const evidence = evidenceById[evidenceId];
            if (!evidence) return null;

            return (
              <article
                key={`${goal.slug}-${evidence.id}`}
                className="rounded-lg border border-white/10 bg-slate-950/55 p-4 sm:p-5 min-w-0 transition-colors duration-300 hover:border-cyan-300/30"
              >
                <h3 className="text-sm font-semibold text-white break-words">{evidence.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-cyan-200/80">
                  <span className="font-medium">{evidence.publication}</span>
                  <span>•</span>
                  <span>{evidence.year}</span>
                  {evidence.studyType && (
                    <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-300">
                      {evidence.studyType}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 break-words">{evidence.resultSummary}</p>
              </article>
            );
          })}
        </div>

        <Link
          href="/research"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-semibold text-slate-300 transition-colors duration-200 hover:border-cyan-300/40 hover:bg-white/[0.08] hover:text-cyan-100"
        >
          More research &rarr;
        </Link>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
        <h2 className="text-xl font-bold text-white break-words">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {goal.faq.map((faq) => (
            <details
              key={`${goal.slug}-${faq.q}`}
              className="cursor-pointer rounded-lg border border-white/10 p-4 transition-colors open:border-cyan-300/30 open:bg-cyan-300/[0.08] min-w-0"
            >
              <summary className="list-none text-sm font-semibold text-slate-100 hover:text-cyan-100 break-words">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-slate-300 break-words leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
        <h2 className="text-xl font-bold text-white break-words">Choose the next step that fits your goal</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300 break-words">
          Use the main action for {goal.title.toLowerCase()}, or review the related protocol and
          support options before you decide.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <Link
            href={primaryAction.href}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 px-5 text-sm font-semibold text-white transition-all duration-200 hover:from-cyan-500 hover:to-cyan-600 shadow-sm"
          >
            {primaryAction.label}
          </Link>
          <Link
            href={supportingProtocol?.href ?? '/research'}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-slate-300 transition-colors duration-200 hover:border-cyan-300/40 hover:bg-white/[0.08] hover:text-cyan-100"
          >
            {supportingProtocol ? `Review ${supportingProtocol.label}` : 'Browse research'}
          </Link>
          <Link
            href={fallbackAction.href}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-slate-300 transition-colors duration-200 hover:border-cyan-300/40 hover:bg-white/[0.08] hover:text-cyan-100"
          >
            {fallbackAction.label}
          </Link>
        </div>
      </section>

      <p className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-xs leading-relaxed text-slate-300">
        {disclaimers.general}
      </p>
    </>
  );

  if (hideIntroShell) {
    return detailSections;
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6">{detailSections}</div>
    </div>
  );
};

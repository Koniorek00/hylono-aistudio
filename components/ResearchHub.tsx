import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ExternalLink, Filter, Search, Copy, Check } from 'lucide-react';
import { FeatureGate } from './FeatureGate';
import { researchContent, ResearchModality } from '../content/research';
import { disclaimers } from '../content/disclaimers';

const LegacyResearchFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6">
    <div className="max-w-5xl mx-auto rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
        Evidence hub fallback
      </p>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 futuristic-font break-words">
        HBOT and hydrogen research
      </h1>
      <p className="max-w-3xl text-sm leading-7 text-slate-600 break-words">
        Use this fallback to keep the evidence path available when the enhanced library is not
        active. Hylono only surfaces reviewed HBOT and hydrogen records here, and the summaries are
        for educational review rather than personalized medical guidance.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
        <Link
          href="/research"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:border-cyan-400 hover:text-cyan-700 hover:bg-cyan-50/40 transition-all duration-200"
        >
          Open research hub
        </Link>
        <Link
          href="/conditions"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:border-cyan-400 hover:text-cyan-700 hover:bg-cyan-50/40 transition-all duration-200"
        >
          Browse condition guides
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-2 text-white transition-all duration-200 hover:from-cyan-500 hover:to-cyan-600"
        >
          Ask Hylono support
        </Link>
      </div>
    </div>
  </div>
);

const modalityToStorePath: Record<ResearchModality, string> = {
  HBOT: '/product/hbot',
  H2: '/product/hydrogen',
};

const researchPathways = [
  { label: 'Recovery guide', href: '/conditions/recovery' },
  { label: 'HBOT hub', href: '/product/hbot' },
  { label: 'Recovery Oxygen Foundation', href: '/protocols/recovery-oxygen-foundation' },
  { label: 'Stress guide', href: '/conditions/stress' },
  { label: 'Hydrogen hub', href: '/product/hydrogen' },
  { label: 'Stress Balance H2 Foundation', href: '/protocols/stress-balance-h2-foundation' },
] as const;

const DoiCopyButton: React.FC<{ doi: string }> = ({ doi }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(`https://doi.org/${doi}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy DOI', err);
    }
  }, [doi]);

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center justify-center w-6 h-6 rounded border border-cyan-200/50 bg-cyan-50/60 hover:bg-cyan-100/80 text-cyan-700 transition-colors shrink-0 focus:outline-none"
      title="Copy DOI Link"
      aria-label="Copy DOI link"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
    </button>
  );
};

const EnhancedResearchHub: React.FC = () => {
  const reduced = useReducedMotion();
  const [technologyFilter, setTechnologyFilter] = useState<(typeof researchContent.technologyFilters)[number]>('All');
  const [studyTypeFilter, setStudyTypeFilter] = useState<(typeof researchContent.studyTypeFilters)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudies = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return researchContent.studies.filter((study) => {
      const technologyMatches = technologyFilter === 'All' || study.modality === technologyFilter;
      const studyTypeMatches = studyTypeFilter === 'All' || study.studyType === studyTypeFilter;
      const searchMatches = !query || 
        study.title.toLowerCase().includes(query) || 
        study.summary.toLowerCase().includes(query) ||
        (study.authors && study.authors.toLowerCase().includes(query)) ||
        (study.doi && study.doi.toLowerCase().includes(query));

      return technologyMatches && studyTypeMatches && searchMatches;
    });
  }, [technologyFilter, studyTypeFilter, searchQuery]);

  const getEvidenceHierarchyClass = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('meta') || t.includes('systematic')) return 'bg-purple-100 border-purple-200 text-purple-800';
    if (t.includes('rct') || t.includes('randomized')) return 'bg-emerald-100 border-emerald-200 text-emerald-800';
    if (t.includes('cohort')) return 'bg-amber-100 border-amber-200 text-amber-800';
    return 'bg-slate-100 border-slate-200 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 futuristic-font break-words text-balance">
              {researchContent.title}
            </h1>
            <p id="research-answer-summary" className="text-slate-300 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed break-words">
              {researchContent.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 -mt-6">
        <div className="max-w-6xl mx-auto rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Evidence pathways
          </p>
          <p className="mt-1.5 max-w-3xl text-xs sm:text-sm text-slate-600">
            Move from research summaries into the related condition pages, product hubs, and protocol planning guides.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-2.5">
            {researchPathways.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/50 transition-colors"
              >
                {pathway.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-1">
             <label htmlFor="research-search" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                <Search size={12} className="inline mr-1" /> Search
             </label>
             <input
               id="research-search"
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Keywords, DOI, authors..."
               className="w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
             />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label htmlFor="research-technology" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              <Filter size={12} className="inline mr-1" /> Technology
            </label>
            <select
              id="research-technology"
              value={technologyFilter}
              onChange={(event) => setTechnologyFilter(event.target.value as (typeof researchContent.technologyFilters)[number])}
              className="w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
            >
              {researchContent.technologyFilters.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label htmlFor="research-study-type" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              <Filter size={12} className="inline mr-1" /> Study type
            </label>
            <select
              id="research-study-type"
              value={studyTypeFilter}
              onChange={(event) => setStudyTypeFilter(event.target.value as (typeof researchContent.studyTypeFilters)[number])}
              className="w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
            >
              {researchContent.studyTypeFilters.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredStudies.length === 0 ? (
            <div className="md:col-span-2 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 text-center">
              {researchContent.emptyState}
            </div>
          ) : (
            filteredStudies.map((study, index) => (
              <motion.article
                key={study.id}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 hover:border-cyan-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-w-0"
              >
                <div className="space-y-3 min-w-0">
                  {/* Citation & Modality Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded border text-xs font-bold bg-cyan-50 text-cyan-800 border-cyan-200/70 shrink-0">
                      {study.modality}
                    </span>
                    <span className={`px-2.5 py-1 rounded border text-xs font-semibold shrink-0 ${getEvidenceHierarchyClass(study.studyType)}`}>
                      {study.studyType}
                    </span>
                    <span className="px-2 py-0.5 rounded border text-xs font-medium bg-slate-50 text-slate-600 border-slate-200/60 shrink-0">
                      {study.year}
                    </span>
                    {study.sampleSize && (
                      <span className="px-2 py-0.5 rounded border text-xs font-medium bg-slate-50 text-slate-500 border-slate-200/60 shrink-0">
                        n = {study.sampleSize}
                      </span>
                    )}
                    {study.publication && (
                      <span className="text-xs text-slate-500 italic truncate max-w-full sm:max-w-[200px]" title={study.publication}>
                        {study.publication}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug break-words">
                    {study.title}
                  </h2>

                  {/* Authors & Population */}
                  <div className="text-xs text-slate-500 space-y-1">
                    {study.authors && (
                      <p className="font-medium text-slate-700 break-words">{study.authors}</p>
                    )}
                    <p className="text-slate-500 break-words leading-relaxed">
                      <span className="font-semibold text-slate-600">Population: </span>
                      {study.population}
                    </p>
                  </div>

                  {/* Abstract / Key Finding Box with Overflow Protection */}
                  <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Key Finding
                    </p>
                    <p className="break-words">{study.summary}</p>
                  </div>
                </div>

                {/* Card Footer: Action CTAs and Clickable DOI Pill */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="min-h-11 px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium text-slate-700 inline-flex items-center justify-center gap-1.5 hover:border-cyan-400 hover:text-cyan-800 hover:bg-cyan-50/40 transition-colors"
                    >
                      Open study <ExternalLink size={13} className="shrink-0" />
                    </a>

                    <Link
                      href={modalityToStorePath[study.modality]}
                      className="min-h-11 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all"
                    >
                      {researchContent.productCtaLabel} <ArrowRight size={13} className="shrink-0" />
                    </Link>

                    <Link
                      href="/protocols"
                      className="min-h-11 px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium text-slate-700 inline-flex items-center justify-center gap-1.5 hover:border-cyan-400 hover:text-cyan-800 hover:bg-cyan-50/40 transition-colors"
                    >
                      {researchContent.protocolCtaLabel} <ArrowRight size={13} className="shrink-0" />
                    </Link>
                  </div>

                  {study.doi && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0 pt-1">
                      <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider shrink-0">DOI:</span>
                      <a
                        href={`https://doi.org/${study.doi}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 font-mono text-xs text-cyan-700 bg-cyan-50/60 hover:bg-cyan-100/80 border border-cyan-200/50 px-2 py-0.5 rounded transition-colors break-all min-w-0 max-w-full truncate"
                        title={`DOI: ${study.doi}`}
                      >
                        <span className="truncate">{study.doi}</span>
                        <ExternalLink size={10} className="shrink-0 opacity-70" />
                      </a>
                      <DoiCopyButton doi={study.doi} />
                    </div>
                  )}
                </div>
              </motion.article>
            ))
          )}
        </div>

        <div
          id="research-library-disclaimer"
          className="max-w-6xl mx-auto mt-8 rounded-lg border border-slate-200 bg-white p-5 text-xs text-slate-500 leading-relaxed break-words"
        >
          {disclaimers.research}
        </div>
      </section>
    </div>
  );
};

export const ResearchHub: React.FC = () => {
  return (
    <FeatureGate flag="feature_research_library" fallback={<LegacyResearchFallback />}>
      <EnhancedResearchHub />
    </FeatureGate>
  );
};


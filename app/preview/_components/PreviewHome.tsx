'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, CircleDashed } from 'lucide-react';
import { TECH_DETAILS } from '@/constants';
import {
  getPublicProductRouteDescription,
  getTechRouteSlug,
} from '@/lib/product-routes';
import { HomeBrandTickerSection } from './home/PreviewHomeBrandTickerSection';
import { HomeFinalCtaSection } from './home/PreviewHomeFinalCtaSection';
import { HomeHowItWorksSection } from './home/PreviewHomeHowItWorksSection';
import { HomeJumpstartSection } from './home/PreviewHomeJumpstartSection';
import { HomeScienceSection } from './home/PreviewHomeScienceSection';
import { HomeTestimonialsSection } from './home/PreviewHomeTestimonialsSection';
import { HomeValuePropSection } from './home/PreviewHomeValuePropSection';
import { PreviewHeroConcept1 } from './heroes/PreviewHeroConcept1';
import { HomeMedicalDisclaimerSection } from '@/components/home/HomeMedicalDisclaimerSection';
import { TiltCard } from '@/components/shared/TiltCard';
import { isFeatureEnabled } from '@/utils/featureFlags';
import { TechType } from '@/types';

const HomeDemoModal = dynamic(
  () =>
    import('./home/PreviewHomeDemoModal').then((module) => ({
      default: module.HomeDemoModal,
    })),
  { ssr: false, loading: () => null }
);

interface PreviewHomeProps {
  onSelectTech: (type: TechType) => void;
  onLaunchBuilder: () => void;
  onNavigate: (path: string) => void;
  homepageEnhancementsEnabled?: boolean;
}

export const PREVIEW_ECOSYSTEM_ACTION_STATUS_ID = 'preview-ecosystem-action-status';
const PREVIEW_ECOSYSTEM_ACTION_STATUS_LABEL = 'Preview ecosystem action status';
const PREVIEW_GOAL_FILTERS = ['Rest', 'Focus', 'Repair', 'Life'] as const;
const PREVIEW_STACK_OPTIONS = [
  {
    id: 'recovery-support',
    title: 'Recovery support stack',
    description:
      'Oxygen, signal, and light planning for a guided routine with setup and support notes.',
    technologies: [TechType.HBOT, TechType.PEMF, TechType.RLT],
    dotClasses: ['bg-cyan-400', 'bg-purple-400', 'bg-red-400'],
  },
  {
    id: 'evening-routine',
    title: 'Evening routine stack',
    description:
      'Signal and hydrogen planning for evening use, evidence notes, and safety context.',
    technologies: [TechType.PEMF, TechType.HYDROGEN],
    dotClasses: ['bg-purple-400', 'bg-sky-400'],
  },
  {
    id: 'daytime-routine',
    title: 'Daytime routine stack',
    description:
      'Light and hydrogen planning for setup, timing, and access choices without outcome promises.',
    technologies: [TechType.RLT, TechType.HYDROGEN],
    dotClasses: ['bg-red-400', 'bg-sky-400'],
  },
] as const;

const formatTechnologyList = (technologies: readonly TechType[]) =>
  technologies.map((technology) => TECH_DETAILS[technology].name).join(', ');

const getPreviewSystemCount = (goal: string | null, stack: readonly TechType[] | null) =>
  Object.values(TECH_DETAILS).filter((tech) => {
    const isGoalMatch = !goal || tech.goals?.includes(goal);
    const isStackMatch = !stack || stack.includes(tech.id);
    return isGoalMatch && isStackMatch;
  }).length;

const describePreviewEcosystem = (goal: string | null, stack: readonly TechType[] | null) => {
  const count = getPreviewSystemCount(goal, stack);
  const systemLabel = count === 1 ? 'preview system' : 'preview systems';

  if (goal && stack) {
    return `Showing ${count} ${systemLabel} for the ${goal} goal within the active stack: ${formatTechnologyList(stack)}.`;
  }

  if (goal) {
    return `Showing ${count} ${systemLabel} for the ${goal} goal.`;
  }

  if (stack) {
    return `Showing ${count} ${systemLabel} in the active stack: ${formatTechnologyList(stack)}.`;
  }

  return `Showing all ${count} preview systems.`;
};

export function PreviewHome({
  onSelectTech,
  onLaunchBuilder,
  onNavigate,
  homepageEnhancementsEnabled: homepageEnhancementsEnabledProp,
}: PreviewHomeProps) {
  const [hoveredTech, setHoveredTech] = useState<TechType | null>(null);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [activeStack, setActiveStack] = useState<TechType[] | null>(null);
  const [actionStatus, setActionStatus] = useState(() => describePreviewEcosystem(null, null));
  const [showDemoModal, setShowDemoModal] = useState(false);
  const homepageEnhancementsEnabled =
    homepageEnhancementsEnabledProp ?? isFeatureEnabled('feature_homepage_enhancements');

  const handleGoalSelect = (goal: string | null) => {
    setActiveGoal(goal);
    setActionStatus(describePreviewEcosystem(goal, activeStack));
  };

  const handleStackSelect = (stack: readonly TechType[], title: string) => {
    const nextStack = [...stack];
    setActiveStack(nextStack);
    setActiveGoal(null);
    setActionStatus(`${title} selected. ${describePreviewEcosystem(null, nextStack)}`);
    document.getElementById('preview-ecosystem')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearStack = () => {
    setActiveStack(null);
    setActionStatus(`Stack selection cleared. ${describePreviewEcosystem(activeGoal, null)}`);
  };

  const isStackSelected = (stack: readonly TechType[]) =>
    Boolean(
      activeStack &&
        activeStack.length === stack.length &&
        stack.every((technology) => activeStack.includes(technology))
    );

  return (
    <div className="w-full bg-slate-950 text-white">
      <PreviewHeroConcept1
        onLaunchBuilder={onLaunchBuilder}
        onNavigate={onNavigate}
        onWatchDemo={() => setShowDemoModal(true)}
      />

      <HomeDemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onBookDemo={() => {
          setShowDemoModal(false);
          onNavigate('contact');
        }}
      />

      <HomeBrandTickerSection />

      <HomeJumpstartSection
        homepageEnhancementsEnabled={homepageEnhancementsEnabled}
        onNavigate={onNavigate}
      />

      <HomeValuePropSection onNavigate={onNavigate} />

      <section id="preview-ecosystem" className="relative bg-slate-950 py-32 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.cyan.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-noise opacity-20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="futuristic-font mb-6 break-words text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
              The Ecosystem
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
          </div>

          <div
            id={PREVIEW_ECOSYSTEM_ACTION_STATUS_ID}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={PREVIEW_ECOSYSTEM_ACTION_STATUS_LABEL}
            className="sr-only"
          >
            {actionStatus}
          </div>

          <div className="mb-16 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => handleGoalSelect(null)}
              aria-pressed={!activeGoal}
              aria-describedby={PREVIEW_ECOSYSTEM_ACTION_STATUS_ID}
              className={`futuristic-font rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                !activeGoal
                  ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100'
                  : 'border-white/10 bg-white/[0.045] text-slate-300 hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              All Systems
            </button>
            {PREVIEW_GOAL_FILTERS.map((goal) => (
              <button
                type="button"
                key={goal}
                onClick={() => handleGoalSelect(goal)}
                aria-pressed={activeGoal === goal}
                aria-describedby={PREVIEW_ECOSYSTEM_ACTION_STATUS_ID}
                className={`futuristic-font rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeGoal === goal
                    ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 bg-white/[0.045] text-slate-300 hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {Object.values(TECH_DETAILS).map((tech, idx) => {
              const routeSlug = getTechRouteSlug(tech.id);
              const publicDescription = getPublicProductRouteDescription({
                fallbackDescription: tech.descriptionStandard,
                productName: tech.name,
                slug: routeSlug,
              });
              const isSynergy =
                hoveredTech &&
                TECH_DETAILS[hoveredTech].synergies.some((synergy) => synergy.targetId === tech.id);
              const isHovered = hoveredTech === tech.id;

              const isGoalMatch = !activeGoal || tech.goals?.includes(activeGoal);
              const isStackMatch = !activeStack || activeStack.includes(tech.id);
              const shouldHide = !isGoalMatch || !isStackMatch;
              const dim = hoveredTech && !isHovered && !isSynergy;

              if (shouldHide) {
                return null;
              }

              return (
                <TiltCard
                  key={tech.id}
                  maxTilt={6}
                  perspective={1200}
                  className={`group relative h-[500px] cursor-pointer transition-all duration-500 ease-out animate-resonance ${
                    idx % 2 !== 0 ? 'md:translate-y-24' : ''
                  } ${dim ? 'opacity-40 scale-95' : 'opacity-100'} ${
                    isSynergy ? 'ring-2 ring-cyan-300 ring-offset-4 ring-offset-slate-950' : ''
                  }`}
                  onClick={() => onSelectTech(tech.id)}
                  onMouseEnter={() => setHoveredTech(tech.id)}
                  onMouseLeave={() => setHoveredTech(null)}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] backdrop-blur">
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-700 bg-gradient-to-br ${tech.accentColor.replace('bg-', 'from-')} to-transparent`}
                    />

                    <div className="relative z-10 flex h-full flex-col justify-between p-12">
                      <div className="flex items-start justify-between">
                        <TiltCard.Layer depth={8}>
                          <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 transition-colors group-hover:text-cyan-100">
                            Modality 0{idx + 1}
                          </span>
                        </TiltCard.Layer>
                        <TiltCard.Layer depth={12}>
                          <CircleDashed
                            className={`animate-spin-slow opacity-0 group-hover:opacity-100 ${tech.themeColor}`}
                          />
                        </TiltCard.Layer>
                      </div>

                      <TiltCard.Layer depth={20} className="space-y-4">
                        <h3 className="text-4xl font-bold text-white transition-colors group-hover:text-cyan-100">
                          {tech.name}
                        </h3>
                        <p className={`text-xl ${tech.themeColor} font-light italic`}>
                          {tech.tagline}
                        </p>
                      </TiltCard.Layer>

                      <TiltCard.Layer depth={6} className="overflow-hidden">
                        <p className="translate-y-full font-light text-slate-300 opacity-0 transition-all delay-100 duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          {publicDescription.substring(0, 100)}...
                        </p>

                        {isHovered ? (
                          <div className="mt-8 animate-fade-in border-t border-white/10 pt-4">
                            <span className="mb-2 block text-[9px] uppercase tracking-wider text-slate-400">
                              System Connections
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {tech.synergies.map((synergy) => (
                                <span
                                  key={synergy.targetId}
                                  className="rounded-lg border border-white/10 bg-slate-950/70 px-2 py-1 text-[10px] text-slate-200"
                                >
                                  + {TECH_DETAILS[synergy.targetId].name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-8 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-200 transition-all group-hover:gap-4">
                            <span>Initialize</span>
                            <div className="h-px w-8 bg-cyan-300/70" />
                          </div>
                        )}
                      </TiltCard.Layer>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-cyan-200/10 bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              System Integration
            </span>
            <h2 className="futuristic-font mt-4 text-3xl font-bold text-white md:text-5xl">
              Curated Protocols
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PREVIEW_STACK_OPTIONS.map((stack) => (
              <button
                type="button"
                key={stack.id}
                onClick={() => handleStackSelect(stack.technologies, stack.title)}
                aria-pressed={isStackSelected(stack.technologies)}
                aria-describedby={PREVIEW_ECOSYSTEM_ACTION_STATUS_ID}
                className="group w-full cursor-pointer rounded-lg border border-white/10 bg-white/[0.045] p-8 text-left text-white transition-all hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                <span className="mb-6 flex gap-2" aria-hidden="true">
                  {stack.dotClasses.map((dotClass) => (
                    <span key={dotClass} className={`h-2 w-2 rounded-full ${dotClass}`} />
                  ))}
                </span>
                <span className="mb-2 block text-xl font-bold">{stack.title}</span>
                <span className="mb-6 block text-sm leading-6 text-slate-300">
                  {stack.description}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-cyan-100 group-hover:underline">
                  Visualize Stack <ArrowRight size={10} aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>

          {activeStack ? (
            <div className="text-center mt-12 animate-fade-in">
              <button
                type="button"
                onClick={handleClearStack}
                aria-describedby={PREVIEW_ECOSYSTEM_ACTION_STATUS_ID}
                className="rounded-lg border border-white/10 bg-white/[0.045] px-6 py-2 text-[10px] font-bold tracking-widest text-slate-200 uppercase hover:border-cyan-300/45 hover:bg-white/[0.07]"
              >
                Clear Selection &amp; Show All
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <HomeHowItWorksSection />
      <HomeTestimonialsSection />
      <HomeScienceSection />

      <HomeMedicalDisclaimerSection />

      <HomeFinalCtaSection onLaunchBuilder={onLaunchBuilder} onNavigate={onNavigate} />
    </div>
  );
}

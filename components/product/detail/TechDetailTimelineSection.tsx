'use client';

import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

interface TimelinePhase {
  phase: string;
  timeframe: string;
  outcomes: string[];
}

interface TechDetailTimelineSectionProps {
  phases: TimelinePhase[];
  accentColor: string;
  themeColor: string;
}

function getDarkAccentClass(accentColor: string) {
  const color = accentColor.toLowerCase();

  if (color.includes('purple') || color.includes('violet')) {
    return 'border-violet-300/20 bg-violet-300/10 text-[var(--pdp-violet,#ede9fe)]';
  }

  if (color.includes('red')) {
    return 'border-rose-300/20 bg-rose-300/10 text-rose-100';
  }

  if (color.includes('orange') || color.includes('amber')) {
    return 'border-amber-300/20 bg-amber-300/10 text-[var(--pdp-warning,#fef3c7)]';
  }

  if (color.includes('teal')) {
    return 'border-teal-300/20 bg-teal-300/10 text-[var(--pdp-teal,#ccfbf1)]';
  }

  if (color.includes('indigo')) {
    return 'border-indigo-300/20 bg-indigo-300/10 text-indigo-100';
  }

  return 'border-cyan-300/20 bg-cyan-300/10 text-[var(--pdp-accent,#cffafe)]';
}

function getDarkThemeClass(themeColor: string) {
  const color = themeColor.toLowerCase();

  if (color.includes('purple') || color.includes('violet')) {
    return 'text-[var(--pdp-violet,#ddd6fe)]';
  }

  if (color.includes('red')) {
    return 'text-rose-200';
  }

  if (color.includes('orange') || color.includes('amber')) {
    return 'text-[var(--pdp-warning,#fde68a)]';
  }

  if (color.includes('teal')) {
    return 'text-[var(--pdp-teal,#99f6e4)]';
  }

  if (color.includes('indigo')) {
    return 'text-indigo-200';
  }

  return 'text-[var(--pdp-accent,#a5f3fc)]';
}

export function TechDetailTimelineSection({
  phases,
  accentColor,
  themeColor,
}: TechDetailTimelineSectionProps) {
  const darkAccentClass = getDarkAccentClass(accentColor);
  const darkThemeClass = getDarkThemeClass(themeColor);

  return (
    <section
      id="what-to-expect"
      data-testid="timeline-section"
      className="relative overflow-hidden border-y border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-page,#020617)] py-20 text-[var(--pdp-title,#ffffff)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.14),transparent_38%,rgba(16,185,129,0.1))]" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--pdp-accent,#a5f3fc)]">
            Expected Results
          </span>
          <h2 className="text-3xl font-bold text-[var(--pdp-title,#ffffff)]">What to Expect</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--pdp-muted,#94a3b8)]">
            Your progress unfolds in phases. Consistency is the key variable.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {phases.map((phase, idx) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              className="group relative overflow-hidden rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_4.5%,transparent))] p-6 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_8%,transparent))]"
            >
              <span className="absolute -right-4 -top-5 text-7xl font-black leading-none text-[var(--pdp-decoration,color-mix(in_srgb,#ffffff_3.5000000000000004%,transparent))]">
                0{idx + 1}
              </span>
              <div className="relative mb-4 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--pdp-radius,0.5rem)] border text-xs font-black ${darkAccentClass}`}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-black text-[var(--pdp-body,#f1f5f9)]">{phase.phase}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${darkThemeClass}`}>
                    {phase.timeframe}
                  </span>
                </div>
              </div>
              <ul className="relative space-y-2.5">
                {phase.outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-2 rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-inset,color-mix(in_srgb,#020617_45%,transparent))] p-2.5 text-xs text-[var(--pdp-body,#cbd5e1)]"
                  >
                    <CheckCircle size={11} className="mt-0.5 shrink-0 text-[var(--pdp-success,#6ee7b7)]" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs italic text-[var(--pdp-muted,#94a3b8)]">
          Results are based on consistent use and may vary. Individual response depends on baseline
          health, frequency of use, and protocol adherence. This is not a promise of a specific
          outcome.
        </p>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { CheckCircle, Clock, User } from 'lucide-react';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { PreviewReveal } from '../PreviewReveal';

interface HomeFinalCtaSectionProps {
  onLaunchBuilder: () => void;
  onNavigate: (path: string) => void;
}

export function HomeFinalCtaSection({
  onLaunchBuilder,
  onNavigate,
}: HomeFinalCtaSectionProps): React.JSX.Element {
  return (
    <section className="grain-overlay relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.purple.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <PreviewReveal direction="up">
          <h2 className="futuristic-font mb-6 text-3xl font-bold text-white md:text-5xl">
            Your Wellness Planning Stack
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
            Move from device browsing to a guided plan that accounts for goals, setup needs, and
            support questions.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <MagneticButton
              onClick={onLaunchBuilder}
              className="flex items-center justify-center gap-3 rounded-lg border border-cyan-100/20 bg-cyan-300 px-10 py-5 text-sm font-bold tracking-widest text-slate-950 uppercase transition-colors hover:bg-cyan-200"
              strength={0.3}
            >
              <User size={18} /> Open planner
            </MagneticButton>

            <MagneticButton
              onClick={() => onNavigate('contact')}
              className="flex items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/[0.045] px-10 py-5 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07]"
              strength={0.25}
            >
              <Clock size={18} /> Book consultation
            </MagneticButton>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> Consultation handoff
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> Rental path review
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> Support questions captured
            </span>
          </div>
        </PreviewReveal>
      </div>
    </section>
  );
}

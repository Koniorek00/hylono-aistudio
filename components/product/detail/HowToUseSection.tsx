"use client";

import React from 'react';
import { Clock } from 'lucide-react';

export interface ProtocolStep {
  title: string;
  duration?: string | number;
  time?: string;
  description: string;
  action?: string;
}

interface HowToUseSectionProps {
  steps?: ProtocolStep[];
  title?: string;
  subtitle?: string;
}

export const HowToUseSection: React.FC<HowToUseSectionProps> = ({
  steps = [],
  title = "Standard Operating Protocol",
  subtitle = "Step-by-step clinical and home wellness usage sequence."
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="mt-16 rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:p-8 backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
          <Clock className="h-3.5 w-3.5" />
          {steps.length} Steps
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-teal-500/40 hover:bg-white/[0.04]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal-400/30 bg-teal-400/10 text-xs font-bold text-teal-300">
                  {idx + 1}
                </span>
                {(step.duration || step.time) && (
                  <span className="text-xs text-slate-400 font-mono">
                    {step.duration ? `${step.duration} min` : step.time}
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-white group-hover:text-teal-300 transition-colors">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {step.description || step.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

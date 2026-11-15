'use client';

import React from 'react';
import { Clock } from 'lucide-react';

export interface ProtocolStep {
  title: string;
  desc: string;
  duration?: number;
}

export interface Hbot2HowToUseSectionProps {
  steps: ProtocolStep[];
}

export function Hbot2HowToUseSection({ steps }: Hbot2HowToUseSectionProps) {
  return (
    <section className="border-b border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
            Step by step
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">How to use it</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-xl font-black text-cyan-100">
                {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.desc}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/55 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <Clock size={14} />
                {step.duration} min
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

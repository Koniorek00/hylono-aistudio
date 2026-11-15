'use client';

import React from 'react';
import { Package } from 'lucide-react';
import type { ChamberProduct } from '@/types';

export interface Hbot2ConfigSpecsSectionProps {
  selectedHbotChamber?: ChamberProduct | undefined;
  renderChamberDescription: (text: string) => React.ReactNode;
}

export function Hbot2ConfigSpecsSection({
  selectedHbotChamber,
  renderChamberDescription,
}: Hbot2ConfigSpecsSectionProps) {
  return (
    <section
      data-testid="hbot2-midpage-planning-surface"
      className="border-b border-white/10 bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Configuration details
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              {selectedHbotChamber?.fullName}
            </h2>
            <div className="mt-5 space-y-3 [&_h4]:!text-white [&_li]:!text-slate-300 [&_p]:!text-slate-300 [&_span.text-cyan-500]:!text-cyan-200">
              {selectedHbotChamber ? renderChamberDescription(selectedHbotChamber.description) : null}
            </div>
          </div>
          <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white md:p-8">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Technical sheet
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">Specification view</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/55 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
                <Package size={14} />
                HBOT guide
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {selectedHbotChamber?.specifications.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-col gap-2 border-b border-white/10 pb-3 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <span className="min-w-0 text-slate-300">{spec.label}</span>
                  <span className="font-semibold text-white sm:shrink-0 sm:text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

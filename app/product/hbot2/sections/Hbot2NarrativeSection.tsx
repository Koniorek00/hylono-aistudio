'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ViewMode } from '@/types';

export interface Hbot2NarrativeSectionProps {
  mode: ViewMode;
  descriptionExpert: string;
  descriptionStandard: string;
  selectionRationale?: string;
  trustHierarchyWhySelected: string;
  protocolSignal: string;
  guidanceUpdatedLabel?: string | null;
  focusRing: string;
  pageActionStatusId: string;
  onModeChange: (mode: ViewMode) => void;
  onSetPageActionStatus: (status: string) => void;
}

export function Hbot2NarrativeSection({
  mode,
  descriptionExpert,
  descriptionStandard,
  selectionRationale,
  trustHierarchyWhySelected,
  protocolSignal,
  guidanceUpdatedLabel,
  focusRing,
  pageActionStatusId,
  onModeChange,
  onSetPageActionStatus,
}: Hbot2NarrativeSectionProps) {
  return (
    <section className="border-b border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Narrative layer
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {mode === ViewMode.EXPERT ? 'Mechanism of action' : 'What it does'}
            </h2>
          </div>
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.045] p-1">
            <button
              type="button"
              onFocus={() => onSetPageActionStatus('Plain language view is ready.')}
              onClick={() => onModeChange(ViewMode.STANDARD)}
              aria-describedby={pageActionStatusId}
              aria-pressed={mode === ViewMode.STANDARD}
              className={`${focusRing} min-h-11 rounded-lg px-5 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                mode === ViewMode.STANDARD
                  ? 'bg-cyan-300 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Plain language
            </button>
            <button
              type="button"
              onFocus={() => onSetPageActionStatus('Science view is ready.')}
              onClick={() => onModeChange(ViewMode.EXPERT)}
              aria-describedby={pageActionStatusId}
              aria-pressed={mode === ViewMode.EXPERT}
              className={`${focusRing} min-h-11 rounded-lg px-5 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                mode === ViewMode.EXPERT
                  ? 'bg-cyan-300 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Science view
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
            <p className="text-base leading-8 text-slate-300">
              {mode === ViewMode.EXPERT ? descriptionExpert : descriptionStandard}
            </p>
            {guidanceUpdatedLabel ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle size={14} className="text-emerald-300" />
                Guidance updated {guidanceUpdatedLabel}
              </div>
            ) : null}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Why it made the shortlist
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {selectionRationale ?? trustHierarchyWhySelected}
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                Protocol signal
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {protocolSignal}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

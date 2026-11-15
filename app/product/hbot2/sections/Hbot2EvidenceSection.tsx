'use client';

import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { MedicalDisclaimer } from '@/components/shared/MedicalDisclaimer';

export interface Study {
  value: string;
  metric: string;
  participants: number;
  description: string;
  pubmedUrl?: string;
}

export interface Hbot2EvidenceSectionProps {
  relatedStudy?: Study | null;
  benefits: string[];
  focusRing: string;
  pageActionStatusId: string;
  onOpenStudyFocus: () => void;
  onOpenStudyClick: () => void;
}

export function Hbot2EvidenceSection({
  relatedStudy,
  benefits,
  focusRing,
  pageActionStatusId,
  onOpenStudyFocus,
  onOpenStudyClick,
}: Hbot2EvidenceSectionProps) {
  return (
    <section className="border-b border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              Evidence snapshot
            </p>
            {relatedStudy ? (
              <>
                <div className="mt-4 flex items-end gap-4">
                  <span className="text-5xl font-black tracking-tight text-cyan-300">
                    {relatedStudy.value}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{relatedStudy.metric}</p>
                    <p className="text-xs text-slate-400">{relatedStudy.participants} participants</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-300">
                  {relatedStudy.description}
                </p>
                {relatedStudy.pubmedUrl ? (
                  <a
                    href={relatedStudy.pubmedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onFocus={onOpenStudyFocus}
                    onClick={onOpenStudyClick}
                    aria-describedby={pageActionStatusId}
                    className={`${focusRing} mt-6 inline-flex min-h-11 items-center rounded-lg border border-white/10 px-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-cyan-300 hover:text-cyan-200`}
                  >
                    Open study
                    <ExternalLink size={14} className="ml-2" />
                  </a>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Study details are connected through the shared research library for this page.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-lg border border-white/10 bg-white/[0.045] p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-100">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                        Benefit
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{benefit}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <MedicalDisclaimer
              type="research"
              compact
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-sm text-slate-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

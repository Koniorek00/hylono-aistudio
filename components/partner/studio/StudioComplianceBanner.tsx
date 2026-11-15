'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export function StudioComplianceBanner({
  modalityName = 'Hylono Wellness Modality',
  strictMode = true
}: {
  modalityName?: string;
  strictMode?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300">
      <ShieldCheck size={18} className="text-cyan-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <div className="font-semibold text-white flex items-center gap-1.5">
          <span>EU MDR & Compliance Guard Active</span>
          {strictMode && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
              Strict Verification
            </span>
          )}
        </div>
        <p className="text-slate-400 leading-relaxed">
          All generated studio copy for {modalityName} automatically enforces non-definitive wellness terminology, 
          disclaimer footers, and certified modality safety protocols.
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import { MedicalDisclaimer } from '../shared/MedicalDisclaimer';

export interface HomeMedicalDisclaimerSectionProps {
  variant?: 'light' | 'dark';
}

export const HomeMedicalDisclaimerSection: React.FC<HomeMedicalDisclaimerSectionProps> = ({
  variant = 'dark',
}) => {
  const isDark = variant === 'dark';
  return (
    <section
      id="home-medical-disclaimer"
      className={
        isDark
          ? 'relative scroll-mt-28 overflow-hidden border-y border-cyan-200/10 bg-slate-950 py-16 text-white md:scroll-mt-32'
          : 'relative scroll-mt-28 overflow-hidden border-y border-slate-200 bg-slate-100/70 py-16 text-slate-800 md:scroll-mt-32'
      }
    >
      <div
        className={
          isDark
            ? 'absolute inset-0 bg-[linear-gradient(to_right,var(--color-slate-400)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-slate-400)_1px,transparent_1px)] bg-[size:44px_44px] opacity-10'
            : 'absolute inset-0 bg-[linear-gradient(to_right,var(--color-slate-300)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-slate-300)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30'
        }
        aria-hidden="true"
      />
      <div
        className={
          isDark
            ? 'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent'
            : 'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent'
        }
        aria-hidden="true"
      />
      <div
        className={
          isDark
            ? 'absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent'
            : 'absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent'
        }
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Console Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 text-[11px] font-mono tracking-[0.22em] text-cyan-300 uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span>Regulatory Framework // EU MDR Compliance</span>
          </div>
          <h2
            className="mt-3 text-2xl sm:text-3xl font-normal tracking-tight text-white"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            European Standards &amp; Compliance Governance
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl font-light leading-relaxed">
            Hylono operates under strict European wellness-technology standards. Clear boundaries, verified specifications, zero unsubstantiated claims.
          </p>
        </div>

        {/* Boundary status badge */}
        <div
          className={
            isDark
              ? 'mb-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-300'
              : 'mb-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600'
          }
        >
          <span
            className={
              isDark
                ? 'rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100 font-mono text-[11px]'
                : 'rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-800 font-mono text-[11px]'
            }
          >
            Safety boundary
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Visible compliance context stays attached to the homepage.
          </span>
        </div>

        <MedicalDisclaimer
          type="general"
          variant={isDark ? 'dark' : 'default'}
          showMdrStatement
          className="p-6"
        />

        {/* Regulatory telemetry micro-badges */}
        <div className="mt-6 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-[10.5px] font-mono text-slate-400 tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
            CE MARK STANDARD
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" />
            NON-INVASIVE WELLNESS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            AUDITED CLAIMS PROTOCOL
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" aria-hidden="true" />
            EUROPEAN CONSUMER PROTECTION
          </span>
        </div>
      </div>
    </section>
  );
};

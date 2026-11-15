import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { CONTAINER_STANDARDS, MODALITY_TOKENS, SURFACE_STANDARDS, type ModalityKey } from '@/lib/brand-tokens';

export interface SanctuaryCardProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  /** Oversized numeral watermark (e.g., '01', '02') rendered in Cormorant Garamond */
  watermarkNumber?: string;
  /** Optional modality signature theme (adds subtle accent aura or border tint) */
  modality?: ModalityKey;
  /** Visual surface atmosphere: daylight sanctuary (default) or nocturnal luminous */
  tone?: 'daylight' | 'luminous';
  /** Adds luxury hover elevation and subtle border glow */
  interactive?: boolean;
  className?: string;
}

export function SanctuaryCard({
  children,
  watermarkNumber,
  modality,
  tone = 'daylight',
  interactive = false,
  className = '',
  ...rest
}: SanctuaryCardProps) {
  const modalityTheme = modality ? MODALITY_TOKENS[modality] : null;

  // Base luxury container tokens
  const radiusClass = CONTAINER_STANDARDS.masterCard; // rounded-[2rem] (32px)
  const baseSurfaceClass =
    tone === 'daylight'
      ? 'bg-white border border-[#E8E2D8] text-slate-900 shadow-[0_15px_35px_rgba(20,25,23,0.04)]'
      : 'bg-slate-950/90 border border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl';

  const hoverClass = interactive
    ? tone === 'daylight'
      ? 'transition-all duration-300 hover:border-[#C4B7A0] hover:shadow-[0_20px_45px_rgba(20,25,23,0.08)] hover:-translate-y-0.5'
      : 'transition-all duration-300 hover:border-white/25 hover:shadow-[0_25px_60px_rgba(0,0,0,0.7)] hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`relative min-w-0 max-w-full overflow-hidden p-6 sm:p-8 flex flex-col justify-between ${radiusClass} ${baseSurfaceClass} ${hoverClass} ${className}`}
      {...rest}
    >
      {/* Optional modality ambient lighting backdrop */}
      {modalityTheme ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br ${modalityTheme.ambientGradient} blur-2xl opacity-60`}
        />
      ) : null}

      {/* Optional Cormorant Garamond numeral watermark */}
      {watermarkNumber ? (
        <div
          aria-hidden="true"
          className="select-none font-editorial font-light text-4xl sm:text-5xl text-[#966D48]/30 mb-2 leading-none"
        >
          {watermarkNumber}
        </div>
      ) : null}

      <div className="relative z-10 flex flex-col flex-1">{children}</div>
    </div>
  );
}

export function SanctuaryCardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 flex flex-col gap-1 ${className}`}>{children}</div>;
}

export function SanctuaryCardBody({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex-1 ${className}`}>{children}</div>;
}

export function SanctuaryCardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-6 pt-4 border-t border-[#EAE4D8] flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
}

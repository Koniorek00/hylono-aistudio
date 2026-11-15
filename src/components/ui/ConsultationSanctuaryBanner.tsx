import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { CONTAINER_STANDARDS, TOUCH_TARGET_STANDARDS } from '@/lib/brand-tokens';

export interface ConsultationSanctuaryBannerProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  supportFacts?: ReactNode;
  className?: string;
}

/**
 * ConsultationSanctuaryBanner — Section 6 Pre-Footer Sanctuary Action Banner
 *
 * Implements the warm architectural deep forest sanctuary container (#143D34)
 * with European MedTech confidence and de-risked consultation paths.
 */
export function ConsultationSanctuaryBanner({
  eyebrow = 'GUIDED ACCESS // ADVISOR CONSULTATION',
  title,
  description,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  supportFacts,
  className = '',
}: ConsultationSanctuaryBannerProps) {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-16 ${className}`}>
      <div
        className={`${CONTAINER_STANDARDS.masterCard} relative overflow-hidden bg-gradient-to-br from-[#143D34] via-[#0E2C25] to-[#081A16] text-white p-8 sm:p-12 lg:p-16 shadow-[0_25px_60px_rgba(20,61,52,0.25)] border border-white/10`}
      >
        {/* Subtle ambient lighting orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl"
        />

        <div className="relative z-10 max-w-3xl">
          <div className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#38BDF8] mb-3">
            {eyebrow}
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-white leading-[1.15] mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-body leading-relaxed max-w-2xl mb-8 break-words">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={primaryActionHref}
              prefetch={false}
              className={`inline-flex items-center justify-center font-semibold text-slate-950 bg-white hover:bg-slate-100 ${CONTAINER_STANDARDS.pillControl} ${TOUCH_TARGET_STANDARDS.minHeight} px-8 py-3.5 text-sm shadow-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
            >
              {primaryActionLabel}
            </Link>

            {secondaryActionLabel && secondaryActionHref ? (
              <Link
                href={secondaryActionHref}
                prefetch={false}
                className={`inline-flex items-center justify-center font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 ${CONTAINER_STANDARDS.pillControl} ${TOUCH_TARGET_STANDARDS.minHeight} px-6 py-3.5 text-sm backdrop-blur-xs transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
              >
                {secondaryActionLabel}
              </Link>
            ) : null}
          </div>

          {supportFacts ? (
            <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400">
              {supportFacts}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

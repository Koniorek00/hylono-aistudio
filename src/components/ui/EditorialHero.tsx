import React, { type ReactNode } from 'react';
import { CONTAINER_STANDARDS, TOUCH_TARGET_STANDARDS } from '@/lib/brand-tokens';

export interface EditorialHeroProps {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  previewMedia: ReactNode;
  statusBadge?: ReactNode;
  className?: string;
}

/**
 * EditorialHero — Section 1 Canonical Asymmetrical Editorial Hero
 *
 * Implements the 7:5 asymmetrical desktop split, Syncopate technical eyebrow,
 * Cormorant Garamond display overture, dual pill actions, and floating preview.
 */
export function EditorialHero({
  eyebrow,
  title,
  lead,
  primaryAction,
  secondaryAction,
  previewMedia,
  statusBadge,
  className = '',
}: EditorialHeroProps) {
  return (
    <section
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 lg:pb-16 ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (7 cols on lg): Editorial Narrative & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Eyebrow & technical stone accent line */}
          <div className="flex items-center gap-3 mb-4">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#966D48]">
              {eyebrow}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-[#C8BFB0]" />
            {statusBadge ? <div>{statusBadge}</div> : null}
          </div>

          {/* H1 Display Headline */}
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal tracking-tight text-slate-950 leading-[1.15] break-words">
            {title}
          </h1>

          {/* Lead Paragraph */}
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 font-body leading-relaxed max-w-xl break-words">
            {lead}
          </p>

          {/* Dual Action Pill Group */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3.5">
            {primaryAction}
            {secondaryAction}
          </div>
        </div>

        {/* Right Column (5 cols on lg): Floating Visual Preview */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
          <div
            className={`w-full max-w-md lg:max-w-none relative overflow-hidden ${CONTAINER_STANDARDS.previewCard} sm:${CONTAINER_STANDARDS.masterCard} border-2 border-white/85 shadow-[0_20px_50px_rgba(20,61,52,0.12)] bg-[#FAF8F5]`}
          >
            {previewMedia}
          </div>
        </div>
      </div>
    </section>
  );
}

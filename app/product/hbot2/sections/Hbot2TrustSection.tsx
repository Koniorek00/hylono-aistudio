'use client';

import React from 'react';
import Link from 'next/link';

export interface SupportCard {
  title: string;
  text: string;
}

export interface Hbot2TrustSectionProps {
  productContactHref: string;
  pageActionStatusId: string;
  focusRing: string;
  pageSupportCards: SupportCard[];
  onContactFocus: () => void;
  onContactClick: () => void;
}

export function Hbot2TrustSection({
  productContactHref,
  pageActionStatusId,
  focusRing,
  pageSupportCards,
  onContactFocus,
  onContactClick,
}: Hbot2TrustSectionProps) {
  return (
    <section className="border-b border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Planning and support
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Keep the trust layer visible</h2>
          </div>
          <Link
            href={productContactHref}
            onFocus={onContactFocus}
            onClick={onContactClick}
            aria-describedby={pageActionStatusId}
            className={`${focusRing} inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 text-sm font-bold uppercase tracking-[0.16em] text-slate-950 transition-colors hover:bg-cyan-200`}
          >
            Contact support
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {pageSupportCards.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                {card.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

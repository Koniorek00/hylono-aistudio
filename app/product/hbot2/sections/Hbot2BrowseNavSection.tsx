'use client';

import React from 'react';
import Link from 'next/link';

export interface RouteClusterLink {
  label: string;
  href: string;
}

export interface Hbot2BrowseNavSectionProps {
  routeClusterLinks: RouteClusterLink[];
  guidanceUpdatedLabel?: string | null;
  focusRing: string;
  pageActionStatusId: string;
  onLinkFocus: (label: string) => void;
  onLinkClick: (label: string) => void;
}

export function Hbot2BrowseNavSection({
  routeClusterLinks,
  guidanceUpdatedLabel,
  focusRing,
  pageActionStatusId,
  onLinkFocus,
  onLinkClick,
}: Hbot2BrowseNavSectionProps) {
  return (
    <section className="border-b border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Browse this page
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {routeClusterLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onFocus={() => onLinkFocus(link.label)}
                  onClick={() => onLinkClick(link.label)}
                  aria-describedby={pageActionStatusId}
                  className={`${focusRing} inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-cyan-100`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Freshness
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {guidanceUpdatedLabel
                ? `Guidance updated ${guidanceUpdatedLabel}.`
                : 'Evidence and policy links remain visible on this page.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

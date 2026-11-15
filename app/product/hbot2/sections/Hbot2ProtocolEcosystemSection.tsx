'use client';

import React from 'react';
import Link from 'next/link';

export interface ProtocolCard {
  slug: string;
  title: string;
  description: string;
  modalities: string[];
}

export interface Hbot2ProtocolEcosystemSectionProps {
  pdpProtocolsEnabled: boolean;
  relatedProtocolCards: ProtocolCard[];
  focusRing: string;
  pageActionStatusId: string;
  onProtocolFocus: (title: string) => void;
  onProtocolClick: (title: string) => void;
  makeProtocolHref: (slug: string) => string;
}

export function Hbot2ProtocolEcosystemSection({
  pdpProtocolsEnabled,
  relatedProtocolCards,
  focusRing,
  pageActionStatusId,
  onProtocolFocus,
  onProtocolClick,
  makeProtocolHref,
}: Hbot2ProtocolEcosystemSectionProps) {
  if (!pdpProtocolsEnabled || relatedProtocolCards.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="hbot2-protocol-addon-trust-surface"
      className="border-b border-white/10 bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
            Protocol ecosystem
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Protocols using this device
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {relatedProtocolCards.map((protocolCard) => (
            <Link
              key={protocolCard.slug}
              href={makeProtocolHref(protocolCard.slug)}
              onFocus={() => onProtocolFocus(protocolCard.title)}
              onClick={() => onProtocolClick(protocolCard.title)}
              aria-describedby={pageActionStatusId}
              className={`${focusRing} block min-h-11 rounded-lg border border-white/10 bg-white/[0.045] p-5 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07]`}
            >
              <p className="text-lg font-bold text-white">{protocolCard.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {protocolCard.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {protocolCard.modalities.map((modality) => (
                  <span
                    key={`${protocolCard.slug}-${modality}`}
                    className="rounded-lg border border-white/10 bg-slate-950/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
                  >
                    {modality}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

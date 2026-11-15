'use client';

import React from 'react';

export interface AddonItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
}

export interface Hbot2AddonsSectionProps {
  addons?: AddonItem[];
  selectedAddons: string[];
  addonActionStatusId: string;
  addonActionStatusLabel: string;
  addonActionStatusMessage: string;
  focusRing: string;
  toggleAddon: (id: string) => void;
  formatPrice: (price: number) => string;
  'aria-describedby'?: string;
}

export function Hbot2AddonsSection({
  addons,
  selectedAddons,
  addonActionStatusId,
  addonActionStatusLabel,
  addonActionStatusMessage,
  focusRing,
  toggleAddon,
  formatPrice,
}: Hbot2AddonsSectionProps) {
  if (!addons?.length) return null;

  return (
    <section className="border-b border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
            System enhancements
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Complete your setup</h2>
          <p
            id={addonActionStatusId}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={addonActionStatusLabel}
            className="mt-3 text-sm leading-6 text-slate-300"
          >
            {addonActionStatusMessage}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {addons.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);
            return (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon.id)}
                aria-pressed={isSelected}
                aria-describedby={addonActionStatusId}
                className={`${focusRing} rounded-lg border p-5 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-300/45 bg-cyan-300/10'
                    : 'border-white/10 bg-white/[0.045] hover:border-cyan-300/45 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                      {addon.category}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-white">{addon.name}</h3>
                  </div>
                  <span
                    className={`rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                      isSelected ? 'bg-cyan-300 text-slate-950' : 'bg-slate-950/55 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'Added' : 'Select'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{addon.description}</p>
                <p className="mt-4 text-sm font-semibold text-white">
                  {formatPrice(addon.price)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

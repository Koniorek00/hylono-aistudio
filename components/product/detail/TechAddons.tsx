import React from 'react';
import { TechData, TechType } from '../../../types';
import { TechAddonCard } from '../../TechAddonCard';

interface TechAddonsProps {
    data: TechData;
    selectedAddons: string[];
    onToggleAddon: (id: string) => void;
}

export const TechAddons: React.FC<TechAddonsProps> = ({ data, selectedAddons, onToggleAddon }) => {
    if (!data.addons || data.addons.length === 0) return null;
    const quoteBeforeAddon = data.id === TechType.HYDROGEN;

    return (
        <section
            id="config"
            className="relative overflow-hidden border-y border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-slate-950 bg-[var(--pdp-page,#020617)] py-20 text-white text-[var(--pdp-title,#ffffff)]"
            data-testid="tech-addons-section"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px]"
            />
            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--pdp-accent,#a5f3fc)]">
                        System Enhancements
                    </span>
                    <h2 className="text-3xl font-bold text-[var(--pdp-title,#ffffff)] sm:text-4xl">
                        Complete Your Setup
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--pdp-body,#cbd5e1)] sm:text-base">
                        Tailor your {data.name} system with premium accessories and performance upgrades.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {data.addons.map((addon) => (
                        <TechAddonCard
                            key={addon.id}
                            addon={addon}
                            isSelected={selectedAddons.includes(addon.id)}
                            onToggle={() => onToggleAddon(addon.id)}
                            accentColor={data.accentColor}
                            priceLabel={quoteBeforeAddon ? 'Quote before add-on' : undefined}
                            selectedLabel={quoteBeforeAddon ? 'Added to review' : undefined}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

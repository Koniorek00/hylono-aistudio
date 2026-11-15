/**
 * ChamberCompare5
 * Fresh redesign — dark frosted glass comparison table.
 * Floating compare dock + full immersive comparison modal.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Scale, Check, Minus, ChevronDown, ChevronUp, ArrowRight, SplitSquareHorizontal } from 'lucide-react';
import { ChamberProduct } from '../types';
import { OptimizedImage } from './shared/OptimizedImage';
import { HbotChamberMediaFallback } from './product/detail/HbotChamberMediaFallback';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';


interface ChamberCompare5Props {
    chambers: ChamberProduct[];
    onRemove: (id: string) => void;
    onClear: () => void;
    onNavigate: (slug: string) => void;
}

const COMPARISON_ROWS: { label: string; category: string; extractor: (c: ChamberProduct) => string }[] = [
    { category: 'Identity', label: 'Type', extractor: (c) => c.type.charAt(0).toUpperCase() + c.type.slice(1) },
    { category: 'Identity', label: 'Brand', extractor: (c) => c.brandLabel },
    { category: 'Identity', label: 'Variant', extractor: (c) => c.variantLabel },
    { category: 'Specs', label: 'Max Pressure', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('pressure'))?.value || '—' },
    { category: 'Specs', label: 'Diameter / Size', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('diameter'))?.value || c.specifications.find((s) => s.label.toLowerCase().includes('dimension'))?.value || '—' },
    { category: 'Specs', label: 'Internal Volume', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('volume'))?.value || '—' },
    { category: 'Specs', label: 'Weight', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('weight'))?.value || '—' },
    { category: 'Specs', label: 'Seating', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('seat') || s.label.toLowerCase().includes('capacity'))?.value || (c.type === 'monoplace' || c.type === 'soft' ? '1 user' : '—') },
    { category: 'Specs', label: 'Control', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('control'))?.value || '—' },
    { category: 'Specs', label: 'Safety Systems', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('safety'))?.value || '—' },
    { category: 'Specs', label: 'Warranty', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('warranty'))?.value || '—' },
    { category: 'Specs', label: 'Origin', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('origin') || s.label.toLowerCase().includes('manufactur'))?.value || '—' },
    { category: 'Pricing', label: 'Purchase', extractor: (c) => (c.pricing.buy ? priceBookText(c.pricing.buy) : 'Contact us') },
    { category: 'Pricing', label: 'Monthly Rental', extractor: (c) => (c.pricing.rent?.monthly ? priceBookMonthlyText(c.pricing.rent.monthly) : c.transactionModes.includes('rent') ? 'Contact us' : 'N/A') },
    { category: 'Pricing', label: 'Min. Rental Term', extractor: (c) => (c.pricing.rent ? `${c.pricing.rent.minimumMonths} months` : 'N/A') },
];

const CATEGORY_COLORS: Record<string, string> = {
    Identity: 'text-[var(--pdp-muted,#94a3b8)]',
    Specs: 'text-[var(--pdp-accent,#22d3ee)]',
    Pricing: 'text-[var(--pdp-success,#34d399)]',
};

const getComparePanelId = (category: string) =>
    `chamber-compare-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'}-panel`;

export const CHAMBER_COMPARE_DOCK_ACTION_STATUS_ID = 'chamber-compare-dock-action-status';
export const CHAMBER_COMPARE_MODAL_ACTION_STATUS_ID = 'chamber-compare-modal-action-status';

const getDockStatusMessage = (count: number): string =>
    count >= 2
        ? `${count} of 3 chambers selected. Comparison ready.`
        : `${count} of 3 chambers selected. Add one more chamber to enable comparison.`;

// ── Floating Compare Dock ────────────────────────────────────────────────────

export const ChamberCompareDock5: React.FC<{
    chambers: ChamberProduct[];
    onRemove: (id: string) => void;
    onClear: () => void;
    onOpenCompare: () => void;
}> = ({ chambers, onRemove, onClear, onOpenCompare }) => {
    const dockActionRef = useRef(false);
    const [statusMessage, setStatusMessage] = useState(() => getDockStatusMessage(chambers.length));

    useEffect(() => {
        if (dockActionRef.current) {
            dockActionRef.current = false;
            return;
        }

        setStatusMessage(getDockStatusMessage(chambers.length));
    }, [chambers.length]);

    if (chambers.length === 0) return null;

    const handleRemove = (id: string) => {
        const chamber = chambers.find((candidate) => candidate.id === id);
        dockActionRef.current = true;
        onRemove(id);
        setStatusMessage(
            `${chamber?.fullName ?? 'Chamber'} removed. ${getDockStatusMessage(Math.max(0, chambers.length - 1))}`
        );
    };

    const handleClear = () => {
        dockActionRef.current = true;
        onClear();
        setStatusMessage('Comparison cleared. Add two chambers to start comparing.');
    };

    const handleOpenCompare = () => {
        dockActionRef.current = true;
        setStatusMessage(`Opening comparison for ${chambers.length} chambers.`);
        onOpenCompare();
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-3xl"
        >
            <div className="bg-[var(--pdp-inset,color-mix(in_srgb,#0f172a_95%,transparent))] backdrop-blur-xl border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_12%,transparent))] rounded-2xl shadow-2xl shadow-black/50 px-5 py-3">
                <div
                    id={CHAMBER_COMPARE_DOCK_ACTION_STATUS_ID}
                    role="status"
                    aria-label="Chamber compare dock action status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                >
                    {statusMessage}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Icon + count */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                            <SplitSquareHorizontal size={15} className="text-[var(--pdp-accent,#22d3ee)]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[var(--pdp-title,#ffffff)] leading-none">{chambers.length}/3</p>
                            <p className="text-[10px] text-[var(--pdp-muted,#64748b)] leading-none mt-0.5">comparing</p>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_8%,transparent))] hidden sm:block" />

                    {/* Chamber chips */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                        {chambers.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-1.5 bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_6%,transparent))] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] rounded-[var(--pdp-radius,0.5rem)] px-2.5 py-1.5 text-xs max-w-[180px]"
                            >
                                <span className="font-semibold text-[var(--pdp-title,#ffffff)] truncate">{c.fullName}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(c.id)}
                                    aria-label={`Remove ${c.fullName}`}
                                    aria-describedby={CHAMBER_COMPARE_DOCK_ACTION_STATUS_ID}
                                    className="text-[var(--pdp-muted,#64748b)] hover:text-[var(--pdp-body,#e2e8f0)] transition-colors shrink-0"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        ))}
                        {Array.from({ length: 3 - chambers.length }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="flex items-center gap-1 border border-dashed border-[var(--pdp-border,color-mix(in_srgb,#ffffff_8%,transparent))] rounded-[var(--pdp-radius,0.5rem)] px-2.5 py-1.5 text-[10px] text-slate-600 shrink-0"
                            >
                                + slot
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-describedby={CHAMBER_COMPARE_DOCK_ACTION_STATUS_ID}
                            className="text-xs text-[var(--pdp-muted,#64748b)] hover:text-[var(--pdp-body,#cbd5e1)] transition-colors px-2 py-1"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleOpenCompare}
                            disabled={chambers.length < 2}
                            aria-describedby={CHAMBER_COMPARE_DOCK_ACTION_STATUS_ID}
                            className="flex items-center gap-2 min-h-11 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-[var(--pdp-title,#ffffff)] text-xs font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                        >
                            <span>Compare</span>
                            <ArrowRight size={13} className="shrink-0" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ── Full Comparison Table ────────────────────────────────────────────────────

export const ChamberCompare5: React.FC<ChamberCompare5Props> = ({
    chambers,
    onRemove,
    onClear,
    onNavigate,
}) => {
    const modalActionRef = useRef(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(['Identity', 'Specs', 'Pricing'])
    );
    const [statusMessage, setStatusMessage] = useState(
        () => `Comparison table loaded for ${chambers.length} chambers.`
    );

    useEffect(() => {
        if (modalActionRef.current) {
            modalActionRef.current = false;
            return;
        }

        setStatusMessage(`Comparison table loaded for ${chambers.length} chambers.`);
    }, [chambers.length]);

    const toggleCategory = (cat: string) => {
        const nextExpanded = !expandedCategories.has(cat);
        modalActionRef.current = true;
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
            return next;
        });
        setStatusMessage(`${cat} ${nextExpanded ? 'expanded' : 'collapsed'} in chamber comparison.`);
    };

    const handleRemove = (id: string) => {
        const chamber = chambers.find((candidate) => candidate.id === id);
        modalActionRef.current = true;
        onRemove(id);
        setStatusMessage(
            `${chamber?.fullName ?? 'Chamber'} removed from comparison. ${Math.max(0, chambers.length - 1)} chambers remain.`
        );
    };

    const handleNavigate = (slug: string) => {
        const chamber = chambers.find((candidate) => candidate.slug === slug);
        modalActionRef.current = true;
        setStatusMessage(`Opening details for ${chamber?.fullName ?? 'selected chamber'}.`);
        onNavigate(slug);
    };

    const categories = Array.from(new Set(COMPARISON_ROWS.map((r) => r.category)));
    const featuresPanelId = getComparePanelId('Features');

    return (
        <div className="w-full">
            <div
                id={CHAMBER_COMPARE_MODAL_ACTION_STATUS_ID}
                role="status"
                aria-label="Chamber compare modal action status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {statusMessage}
            </div>

            {/* Mobile scroll indicator */}
            <div className="md:hidden flex items-center justify-between text-xs text-[var(--pdp-muted,#94a3b8)] px-3 py-1.5 mb-3 bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_3%,transparent))] rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_6%,transparent))]">
                <span>← Scroll sideways to compare all chambers →</span>
            </div>

            <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[620px]">
                    {/* Chamber headers */}
                    <div
                        className="grid gap-4 mb-6 sticky top-0 z-10 bg-[var(--pdp-inset,color-mix(in_srgb,#020617_95%,transparent))] backdrop-blur-sm py-4 items-end"
                        style={{ gridTemplateColumns: `180px repeat(${chambers.length}, minmax(180px, 1fr))` }}
                    >
                        <div className="pb-2">
                            <p className="text-[10px] font-bold text-[var(--pdp-muted,#64748b)] uppercase tracking-widest">Compare</p>
                        </div>
                        {chambers.map((c) => {
                            const heroUrl = c.images.find((i) => i.role === 'hero')?.url ?? c.images[0]?.url ?? null;
                            return (
                                <div key={c.id} className="relative min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(c.id)}
                                        aria-label={`Remove ${c.fullName}`}
                                        aria-describedby={CHAMBER_COMPARE_MODAL_ACTION_STATUS_ID}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--pdp-inset,#1e293b)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] rounded-full flex items-center justify-center text-[var(--pdp-muted,#94a3b8)] hover:text-[var(--pdp-danger,#f87171)] transition-colors z-10"
                                    >
                                        <X size={11} />
                                    </button>
                                    <div className="rounded-xl overflow-hidden border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_8%,transparent))] bg-[var(--pdp-page,#0f172a)] flex flex-col h-full">
                                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--pdp-page,#0f172a)]">
                                            {heroUrl ? (
                                                <>
                                                    <OptimizedImage
                                                        src={heroUrl}
                                                        alt={c.fullName}
                                                        fill
                                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                                </>
                                            ) : (
                                                <HbotChamberMediaFallback
                                                    title={c.fullName}
                                                    specifications={c.specifications}
                                                    className="h-full min-h-0 rounded-none border-0"
                                                />
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col flex-1">
                                            <p className="text-[10px] text-[var(--pdp-muted,#64748b)] font-medium truncate">{c.brandLabel}</p>
                                            <p className="font-bold text-[var(--pdp-title,#ffffff)] text-sm leading-tight break-words">{c.fullName}</p>
                                            <p className="text-[10px] text-[var(--pdp-muted,#94a3b8)] mt-0.5 line-clamp-2">{c.shortDescription.slice(0, 65)}…</p>
                                            <div className="mt-auto pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleNavigate(c.slug)}
                                                    aria-label={`View details for ${c.fullName}`}
                                                    aria-describedby={CHAMBER_COMPARE_MODAL_ACTION_STATUS_ID}
                                                    className="w-full min-h-11 text-xs font-bold py-1.5 rounded-[var(--pdp-radius,0.5rem)] bg-gradient-to-r from-blue-600 to-cyan-500 text-[var(--pdp-title,#ffffff)] hover:from-blue-500 hover:to-cyan-400 transition-all"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Comparison rows by category */}
                    <div className="space-y-2">
                        {categories.map((cat) => {
                            const rows = COMPARISON_ROWS.filter((r) => r.category === cat);
                            const isExpanded = expandedCategories.has(cat);
                            const catColor = CATEGORY_COLORS[cat] || 'text-[var(--pdp-muted,#94a3b8)]';
                            const panelId = getComparePanelId(cat);

                            return (
                                <div key={cat} className="rounded-2xl overflow-hidden border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_6%,transparent))] bg-[var(--pdp-inset,color-mix(in_srgb,#0f172a_40%,transparent))]">
                                    {/* Category header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(cat)}
                                        className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_3%,transparent))] hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_6%,transparent))] transition-colors"
                                        aria-expanded={isExpanded}
                                        aria-controls={panelId}
                                        aria-describedby={CHAMBER_COMPARE_MODAL_ACTION_STATUS_ID}
                                    >
                                        <span className={`text-xs font-bold uppercase tracking-widest ${catColor}`}>{cat}</span>
                                        <span className="text-[var(--pdp-muted,#64748b)]">
                                            {isExpanded ? <ChevronUp size={15} className="ui-transition-fast" /> : <ChevronDown size={15} className="ui-transition-fast" />}
                                        </span>
                                    </button>

                                    {/* Rows */}
                                    <div id={panelId} className="ui-accordion-grid" data-open={isExpanded}>
                                        <div className="divide-y divide-white/[0.04]">
                                            {rows.map((row) => {
                                                const values = chambers.map(row.extractor);
                                                return (
                                                    <div
                                                        key={row.label}
                                                        className="grid gap-4 px-5 py-3 hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_2%,transparent))] transition-colors items-center"
                                                        style={{ gridTemplateColumns: `180px repeat(${chambers.length}, minmax(180px, 1fr))` }}
                                                    >
                                                        <p className="text-xs text-[var(--pdp-muted,#64748b)] font-medium break-words">{row.label}</p>
                                                        {values.map((v, vi) => (
                                                            <p key={vi} className="text-xs font-semibold text-[var(--pdp-body,#e2e8f0)] break-words">
                                                                {v}
                                                            </p>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Features comparison */}
                    <div className="mt-2 rounded-2xl overflow-hidden border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_6%,transparent))] bg-[var(--pdp-inset,color-mix(in_srgb,#0f172a_40%,transparent))]">
                        <button
                            type="button"
                            onClick={() => toggleCategory('Features')}
                            className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_3%,transparent))] hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_6%,transparent))] transition-colors"
                            aria-expanded={expandedCategories.has('Features')}
                            aria-controls={featuresPanelId}
                            aria-describedby={CHAMBER_COMPARE_MODAL_ACTION_STATUS_ID}
                        >
                            <span className="text-xs font-bold uppercase tracking-widest text-[var(--pdp-violet,#a78bfa)]">Features</span>
                            <span className="text-[var(--pdp-muted,#64748b)]">
                                {expandedCategories.has('Features') ? <ChevronUp size={15} className="ui-transition-fast" /> : <ChevronDown size={15} className="ui-transition-fast" />}
                            </span>
                        </button>
                        <div id={featuresPanelId} className="ui-accordion-grid" data-open={expandedCategories.has('Features')}>
                            <div className="divide-y divide-white/[0.04]">
                                {Array.from(new Set(chambers.flatMap((c) => c.highlights))).map((feature) => (
                                    <div
                                        key={feature}
                                        className="grid gap-4 px-5 py-3 hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_2%,transparent))] transition-colors items-center"
                                        style={{ gridTemplateColumns: `180px repeat(${chambers.length}, minmax(180px, 1fr))` }}
                                    >
                                        <p className="text-xs text-[var(--pdp-muted,#64748b)] font-medium leading-snug break-words">{feature}</p>
                                        {chambers.map((c, ci) => {
                                            const has = c.highlights.includes(feature) || c.features.includes(feature);
                                            return (
                                                <div key={ci} className="flex items-center">
                                                    {has ? (
                                                        <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                                                            <Check size={10} className="text-[var(--pdp-success,#34d399)]" />
                                                        </div>
                                                    ) : (
                                                        <Minus size={14} className="text-[var(--pdp-decoration,color-mix(in_srgb,#ffffff_15%,transparent))] shrink-0" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-600 mt-6 pt-4 border-t border-[var(--pdp-border,color-mix(in_srgb,#ffffff_5%,transparent))] leading-relaxed">
                Designed for general wellbeing use and purchase planning. Confirm suitability with a qualified healthcare professional before use.
                Specifications may change, so contact us to confirm the current configuration before purchase.
            </p>
        </div>
    );
};

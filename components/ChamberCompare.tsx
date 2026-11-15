/**
 * ChamberCompare
 * Side-by-side comparison of up to 3 HBOT chambers.
 * Floating compare bar + full comparison modal.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Scale, Check, Minus, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { ChamberProduct } from '../types';
import { OptimizedImage } from './shared/OptimizedImage';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';

interface ChamberCompareProps {
    chambers: ChamberProduct[];
    onRemove: (id: string) => void;
    onClear: () => void;
    onNavigate: (slug: string) => void;
}

type SectionKey = 'specs' | 'features' | 'pricing';


// All spec labels we want to compare across chambers
const COMPARISON_ROWS: { label: string; key?: string; extractor: (c: ChamberProduct) => string }[] = [
    { label: 'Type', extractor: (c) => c.type.charAt(0).toUpperCase() + c.type.slice(1) },
    { label: 'Brand', extractor: (c) => c.brandLabel },
    { label: 'Variant', extractor: (c) => c.variantLabel },
    { label: 'Pressure', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('pressure'))?.value || '—' },
    { label: 'Diameter / Size', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('diameter'))?.value || c.specifications.find((s) => s.label.toLowerCase().includes('dimension'))?.value || '—' },
    { label: 'Internal Volume', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('volume'))?.value || '—' },
    { label: 'Weight', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('weight'))?.value || c.specifications.find((s) => s.label.toLowerCase().includes('kg'))?.value || '—' },
    { label: 'Seating Capacity', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('seat') || s.label.toLowerCase().includes('users') || s.label.toLowerCase().includes('capacity'))?.value || (c.type === 'monoplace' || c.type === 'soft' ? '1 user' : '—') },
    { label: 'Control Interface', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('control'))?.value || '—' },
    { label: 'Safety Systems', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('safety'))?.value || '—' },
    { label: 'Warranty', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('warranty'))?.value || '—' },
    { label: 'Manufacturing', extractor: (c) => c.specifications.find((s) => s.label.toLowerCase().includes('origin') || s.label.toLowerCase().includes('manufactur'))?.value || '—' },
    { label: 'Buy Available', extractor: (c) => (c.transactionModes.includes('buy') ? 'Yes' : 'No') },
    { label: 'Rent Available', extractor: (c) => (c.transactionModes.includes('rent') ? 'Yes' : 'No') },
    { label: 'Buy Price', extractor: (c) => (c.pricing.buy ? priceBookText(c.pricing.buy) : 'Contact us') },
    { label: 'Monthly Rental', extractor: (c) => (c.pricing.rent?.monthly ? priceBookMonthlyText(c.pricing.rent.monthly) : c.transactionModes.includes('rent') ? 'Contact us' : 'N/A') },
];

// Floating bar shown at bottom when chambers are selected for comparison
export const ChamberCompareBar: React.FC<{
    chambers: ChamberProduct[];
    onRemove: (id: string) => void;
    onClear: () => void;
    onOpenCompare: () => void;
}> = ({ chambers, onRemove, onClear, onOpenCompare }) => {
    if (chambers.length === 0) return null;

    return (
        <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-semibold text-white shrink-0">
                    <Scale size={16} className="text-cyan-400 shrink-0" />
                    <span className="tracking-wide">COMPARING {chambers.length}/3</span>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                    {chambers.map((c) => (
                        <div
                            key={c.id}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-sm max-w-[200px]"
                        >
                            <span className="font-medium text-slate-200 truncate">{c.fullName}</span>
                            <button
                                type="button"
                                onClick={() => onRemove(c.id)}
                                aria-label={`Remove ${c.fullName} from comparison`}
                                className="text-slate-400 hover:text-white transition-colors shrink-0 bg-white/5 rounded-full p-0.5"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: 3 - chambers.length }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="flex items-center gap-1.5 border border-dashed border-white/20 rounded-full px-4 py-1.5 text-xs text-slate-500 shrink-0 uppercase tracking-wider"
                        >
                            + ADD CHAMBER
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors px-2 py-1"
                    >
                        Clear All
                    </button>
                    <button
                        type="button"
                        onClick={onOpenCompare}
                        disabled={chambers.length < 2}
                        className="flex items-center gap-2 min-h-11 px-5 py-2 bg-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:shadow-none hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                    >
                        <span>Compare {chambers.length < 2 ? '(Add 1 More)' : 'Now'}</span>
                        <ArrowRight size={14} className="shrink-0" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// Full comparison modal
export const ChamberCompare: React.FC<ChamberCompareProps> = ({
    chambers,
    onRemove,
    onClear,
    onNavigate,
}) => {
    const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
        specs: true,
        features: false,
        pricing: true,
    });

    const toggleSection = (section: SectionKey) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const PLACEHOLDER_IMAGES = {
        monoplace: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&q=80',
        multiplace: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
        soft: 'https://images.unsplash.com/photo-1588776814546-1ffedde2e85b?w=400&q=80',
    };

    return (
        <div className="w-full bg-slate-950 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Mobile scroll indicator */}
            <div className="md:hidden flex items-center justify-between text-[10px] font-medium tracking-widest uppercase text-cyan-400/70 px-4 py-2.5 bg-slate-900 border-b border-white/10">
                <span>&larr; Scroll horizontally to compare all &rarr;</span>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar relative">
                <div className="min-w-[760px]">
                    {/* Sticky Chamber header row */}
                    <div
                        className="grid gap-0 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/10"
                        style={{ gridTemplateColumns: `200px repeat(${chambers.length}, minmax(260px, 1fr))` }}
                    >
                        {/* Label col */}
                        <div className="p-6 flex items-end">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compare</p>
                        </div>

                        {/* Chamber columns */}
                        {chambers.map((c, index) => {
                            const isRecommended = index === 0; // First column gets a slight highlight
                            const fallbackImage = PLACEHOLDER_IMAGES[c.type] ?? PLACEHOLDER_IMAGES.monoplace;
                            const heroUrl = c.images.find((i) => i.role === 'hero')?.url ?? fallbackImage;
                            return (
                                <div key={c.id} className={`relative min-w-0 p-6 border-l border-white/5 ${isRecommended ? 'bg-cyan-950/20 relative' : ''}`}>
                                    {isRecommended && (
                                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onRemove(c.id)}
                                        aria-label={`Remove ${c.fullName}`}
                                        className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-white/10 border border-white/20 rounded-full shadow-sm text-slate-300 hover:text-white hover:bg-red-500/80 hover:border-red-500 transition-all z-20"
                                    >
                                        <X size={12} />
                                    </button>
                                    
                                    <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-900 mb-4 border border-white/10">
                                        <OptimizedImage
                                            src={heroUrl}
                                            alt={c.fullName}
                                            fallbackSrc={fallbackImage}
                                            width={640}
                                            height={400}
                                            sizes="(max-width: 1024px) 100vw, 33vw"
                                            className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
                                        />
                                        {isRecommended && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase tracking-widest rounded-sm shadow-lg">
                                                Best Match
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase mb-1 truncate">{c.brandLabel}</p>
                                    <p className="font-bold text-white text-lg tracking-tight leading-tight break-words mb-2">{c.fullName}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed mb-4">{c.shortDescription}</p>
                                    
                                    <button
                                        type="button"
                                        onClick={() => onNavigate(c.slug)}
                                        className={`w-full min-h-[36px] text-xs font-bold tracking-wider uppercase py-2 px-3 rounded-lg transition-all ${
                                            isRecommended 
                                                ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                        }`}
                                    >
                                        View Chamber
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Specs table */}
                    <Section
                        title="Specifications"
                        sectionKey="specs"
                        expanded={expandedSections.specs ?? false}
                        onToggle={() => toggleSection('specs')}
                        chambersCount={chambers.length}
                    >
                        {COMPARISON_ROWS.slice(0, 12).map((row) => (
                            <CompareRow
                                key={row.label}
                                label={row.label}
                                values={chambers.map(row.extractor)}
                                colCount={chambers.length}
                            />
                        ))}
                    </Section>

                    {/* Features */}
                    <Section
                        title="Features"
                        sectionKey="features"
                        expanded={expandedSections.features ?? false}
                        onToggle={() => toggleSection('features')}
                        chambersCount={chambers.length}
                    >
                        {/* Collect all unique features across chambers */}
                        {Array.from(new Set(chambers.flatMap((c) => c.highlights))).map((feature) => (
                            <CompareFeatureRow
                                key={feature}
                                label={feature}
                                values={chambers.map((c) => c.highlights.includes(feature) || c.features.includes(feature))}
                                colCount={chambers.length}
                            />
                        ))}
                    </Section>

                    {/* Pricing */}
                    <Section
                        title="Pricing & Availability"
                        sectionKey="pricing"
                        expanded={expandedSections.pricing ?? false}
                        onToggle={() => toggleSection('pricing')}
                        chambersCount={chambers.length}
                    >
                        {COMPARISON_ROWS.slice(12).map((row) => (
                            <CompareRow
                                key={row.label}
                                label={row.label}
                                values={chambers.map(row.extractor)}
                                colCount={chambers.length}
                                highlightValues={true}
                            />
                        ))}
                    </Section>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-900 border-t border-white/5 p-6">
                <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
                    Designed for general wellbeing use and purchase planning. Confirm suitability with a qualified healthcare professional before use, and contact us to verify the current specification set before purchase.
                </p>
            </div>
        </div>
    );
};

// Sub-components

const Section: React.FC<{
    title: string;
    sectionKey: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    chambersCount: number;
}> = ({ title, expanded, onToggle, children, chambersCount }) => (
    <div className="border-b border-white/5 last:border-0 bg-slate-900/50">
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 hover:bg-slate-800 transition-colors text-left"
            aria-expanded={expanded}
        >
            <span className="font-bold tracking-widest uppercase text-slate-300 text-[11px]">{title}</span>
            {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </button>
        <div className="ui-accordion-grid" data-open={expanded}>
            <div className="divide-y divide-white/5">{children}</div>
        </div>
    </div>
);

const CompareRow: React.FC<{
    label: string;
    values: string[];
    colCount: number;
    highlightValues?: boolean;
}> = ({ label, values, colCount, highlightValues }) => (
    <div
        className="grid gap-0 hover:bg-white/[0.02] transition-colors items-center"
        style={{ gridTemplateColumns: `200px repeat(${colCount}, minmax(260px, 1fr))` }}
    >
        <div className="p-6">
            <p className="text-xs text-slate-400 font-medium break-words leading-relaxed">{label}</p>
        </div>
        {values.map((v, i) => {
            const isRecommended = i === 0;
            return (
                <div key={i} className={`p-6 border-l border-white/5 h-full flex items-center ${isRecommended ? 'bg-cyan-950/10' : ''}`}>
                    <p className={`text-sm break-words ${highlightValues ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                        {v}
                    </p>
                </div>
            );
        })}
    </div>
);

const CompareFeatureRow: React.FC<{
    label: string;
    values: boolean[];
    colCount: number;
}> = ({ label, values, colCount }) => (
    <div
        className="grid gap-0 hover:bg-white/[0.02] transition-colors items-center"
        style={{ gridTemplateColumns: `200px repeat(${colCount}, minmax(260px, 1fr))` }}
    >
        <div className="p-6">
            <p className="text-xs text-slate-400 break-words leading-relaxed">{label}</p>
        </div>
        {values.map((v, i) => {
            const isRecommended = i === 0;
            return (
                <div key={i} className={`p-6 border-l border-white/5 h-full flex items-center ${isRecommended ? 'bg-cyan-950/10' : ''}`}>
                    {v ? (
                        <Check size={18} className="text-cyan-400 shrink-0 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    ) : (
                        <Minus size={18} className="text-slate-600 shrink-0" />
                    )}
                </div>
            );
        })}
    </div>
);

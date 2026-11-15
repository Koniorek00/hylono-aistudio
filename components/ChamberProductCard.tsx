/**
 * ChamberProductCard
 * Individual product card for the HBOT chamber catalog.
 * Shows brand badge, key specs, highlights, and dual buy/rent CTAs.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Star, ShieldCheck, Zap, Users, Maximize2, Weight, Plus } from 'lucide-react';
import { ChamberProduct } from '../types';
import { OptimizedImage } from './shared/OptimizedImage';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';

interface ChamberProductCardProps {
    chamber: ChamberProduct;
    onViewDetail: (slug: string) => void;
    onAddToCompare?: (chamber: ChamberProduct) => void;
    isInCompare?: boolean;
    preferredMode?: 'buy' | 'rent';
}

// Brand badge config
const BRAND_CONFIG = {
    oxyhelp: {
        label: 'OxyHelp',
        badge: 'EU MADE',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        cardBorder: 'border-white/10 hover:border-cyan-400/50',
        accentBar: 'bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-transparent',
        tagClass: 'bg-white/5 text-slate-300 border border-white/10',
        ctaBuy: 'bg-white text-slate-950 hover:bg-slate-200',
        ctaRent: 'border border-white/20 text-white hover:bg-white/5',
    },
    'asian-series': {
        label: 'Standard Series',
        badge: 'VALUE SERIES',
        badgeClass: 'bg-white/10 text-slate-200 border border-white/20',
        cardBorder: 'border-white/10 hover:border-white/30',
        accentBar: 'bg-gradient-to-r from-slate-500 to-slate-400',
        tagClass: 'bg-white/5 text-slate-300 border border-white/10',
        ctaBuy: 'bg-slate-700 hover:bg-slate-600 text-white',
        ctaRent: 'border border-slate-600 text-slate-300 hover:bg-slate-800',
    },
} as const;

const TYPE_CONFIG = {
    monoplace: { label: 'Monoplace', icon: <Maximize2 size={14} />, color: 'bg-white/5 text-slate-200 border border-white/10' },
    multiplace: { label: 'Multiplace', icon: <Users size={14} />, color: 'bg-white/5 text-slate-200 border border-white/10' },
    soft: { label: 'Soft Chamber', icon: <Zap size={14} />, color: 'bg-white/5 text-slate-200 border border-white/10' },
} as const;

// Placeholder image per type when no image URL provided
const PLACEHOLDER_IMAGES = {
    monoplace: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80',
    multiplace: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    soft: 'https://images.unsplash.com/photo-1588776814546-1ffedde2e85b?w=600&q=80',
};


export const ChamberProductCard: React.FC<ChamberProductCardProps> = ({
    chamber,
    onViewDetail,
    onAddToCompare,
    isInCompare = false,
    preferredMode = 'buy',
}) => {
    const initialTab: 'buy' | 'rent' = chamber.transactionModes.includes(preferredMode)
        ? preferredMode
        : chamber.transactionModes[0] === 'rent'
          ? 'rent'
          : 'buy';

    const [activeTab, setActiveTab] = useState<'buy' | 'rent'>(
        initialTab
    );

    const brand = BRAND_CONFIG[chamber.brand];
    const typeConfig = TYPE_CONFIG[chamber.type];
    const heroImage = chamber.images.find((i) => i.role === 'hero')?.url || PLACEHOLDER_IMAGES[chamber.type];

    const hasBoth = chamber.transactionModes.includes('buy') && chamber.transactionModes.includes('rent');

    // Key specs to show on card — pick up to 3 most informative
    const cardSpecs = chamber.specifications.slice(0, 3);

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
            className={`relative flex flex-col bg-slate-900/60 backdrop-blur-md rounded-lg border ${brand.cardBorder} shadow-lg shadow-black/20 hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden group`}
            aria-label={`${chamber.fullName} — ${chamber.shortDescription.slice(0, 80)}`}
        >
            {/* Accent bar */}
            <div className={`h-[2px] w-full ${brand.accentBar}`} />

            {/* Image */}
            <div className="relative overflow-hidden aspect-[16/10] w-full bg-slate-950/50">
                <OptimizedImage
                    src={heroImage}
                    alt={chamber.images.find((i) => i.role === 'hero')?.alt || `${chamber.fullName} hyperbaric chamber`}
                    fallbackSrc={PLACEHOLDER_IMAGES[chamber.type]}
                    width={800}
                    height={500}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="w-full h-full object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
                />
                
                {/* Subtle gradient overlay to blend image into card */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none" />

                {/* Badges overlay */}
                <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5 max-w-[58%] pointer-events-none">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full truncate max-w-full tracking-wider ${brand.badgeClass}`}>
                        {brand.badge}
                    </span>
                    {chamber.type === 'soft' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 truncate max-w-full tracking-wider">
                            RENTAL AVAILABLE
                        </span>
                    )}
                </div>

                {/* Type chip */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full tracking-wide ${typeConfig.color}`}>
                        {typeConfig.icon}
                        <span className="truncate">{typeConfig.label}</span>
                    </span>
                </div>

                {/* Compare toggle */}
                {onAddToCompare && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCompare(chamber);
                        }}
                        aria-pressed={isInCompare}
                        className={`absolute bottom-3 right-3 z-10 flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 ${
                            isInCompare
                                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                        }`}
                    >
                        {isInCompare ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={2} />}
                        {isInCompare ? 'ADDED' : 'COMPARE'}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-6 relative z-10">
                {/* Header */}
                <div className="mb-4">
                    <p className="text-[10px] font-semibold text-cyan-400/80 uppercase tracking-[0.18em] mb-1.5">
                        {chamber.brandLabel}
                    </p>
                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight mb-2 break-words">
                        {chamber.fullName}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                        {chamber.shortDescription}
                    </p>
                </div>

                {/* Highlights */}
                <ul className="space-y-2 mb-5">
                    {chamber.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-300">
                            <Check size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                            <span className="leading-snug break-words">{h}</span>
                        </li>
                    ))}
                </ul>

                {/* Key specs row */}
                {cardSpecs.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-5 pt-4 border-t border-white/10">
                        {cardSpecs.map((spec, i) => (
                            <div key={i} className="text-center min-w-0 bg-white/5 rounded-lg py-2 px-1 border border-white/[0.04]">
                                <p className="text-[10px] text-slate-400 leading-tight truncate uppercase tracking-wider mb-1">{spec.label}</p>
                                <p className="text-xs font-semibold text-slate-200 leading-tight break-words">{spec.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Certifications */}
                {chamber.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {chamber.certifications.slice(0, 2).map((cert, i) => (
                            <span key={i} className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full max-w-full break-words tracking-wide ${brand.tagClass}`}>
                                <ShieldCheck size={11} className="shrink-0 text-cyan-400/70" />
                                <span className="truncate">{cert}</span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Pricing / CTA */}
                <div className="pt-5 border-t border-white/10">
                    {/* Buy/Rent toggle when both available */}
                    {hasBoth && (
                        <div className="flex rounded-lg bg-slate-950/50 p-1 border border-white/10 overflow-hidden mb-4 text-xs font-medium relative">
                            <button
                                type="button"
                                onClick={() => setActiveTab('buy')}
                                className={`flex-1 min-h-11 py-1.5 rounded-md transition-all duration-300 z-10 ${
                                    activeTab === 'buy' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Buy
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('rent')}
                                className={`flex-1 min-h-11 py-1.5 rounded-md transition-all duration-300 z-10 ${
                                    activeTab === 'rent' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Rent
                            </button>
                        </div>
                    )}

                    {/* Price display */}
                    <div className="mb-5 min-w-0 flex items-baseline gap-2">
                        {activeTab === 'buy' ? (
                            <div className="flex flex-col">
                                {chamber.pricing.buy ? (
                                    <p className="text-2xl font-bold text-white tracking-tight break-words">
                                        {priceBookText(chamber.pricing.buy)}
                                    </p>
                                ) : (
                                    <p className="text-sm font-semibold text-slate-400">
                                        Contact for pricing
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {chamber.pricing.rent?.monthly ? (
                                    <div className="min-w-0">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-white tracking-tight break-words">
                                                {priceBookText(chamber.pricing.rent.monthly)}
                                            </span>
                                            <span className="text-sm text-slate-400">/mo</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 tracking-wide uppercase">
                                            Min. {chamber.pricing.rent.minimumMonths} months
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm font-semibold text-slate-400">
                                        Contact for rental pricing
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Primary CTA */}
                    <button
                        type="button"
                        onClick={() => onViewDetail(chamber.slug)}
                        className={`w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 ${
                            activeTab === 'buy' ? brand.ctaBuy : brand.ctaRent
                        }`}
                        aria-label={`View ${chamber.fullName} details`}
                    >
                        <span>VIEW CHAMBER</span>
                        <ArrowRight size={16} className="shrink-0" />
                    </button>
                </div>
            </div>
        </motion.article>
    );
};

/**
 * TechHero
 * Shared hero for technology product pages.
 *
 * Notes:
 * - HBOT uses the shared chamber selector as the single visible selector surface.
 * - Hydrogen uses the premium route catalog directly in the hero so the
 *   selector sits in the same decision zone as HBOT.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Shield,
    CheckCircle,
    Phone,
    ShoppingBag,
    ChevronDown,
    Users,
    Maximize2,
    Wind,
    Sun,
    Droplets,
    Activity,
} from 'lucide-react';
import { TechData, TechType } from '../../../types';
import { ALL_CHAMBERS } from '../../../constants/chambers';
import {
    HYDROGEN_PREMIUM_PUBLIC_PRICE_LABEL,
    getHydrogenPremiumPath,
    hydrogenPremiumLineMeta,
    hydrogenPremiumPages,
    type HydrogenPremiumLineId,
    type HydrogenPremiumPageRecord,
    type HydrogenPremiumSlug,
} from '../../../content/hydrogen-premium-2026';
import { OptimizedImage } from '../../shared/OptimizedImage';
import { HbotChamberMediaFallback } from './HbotChamberMediaFallback';

export {
    TECH_HERO_SELECTOR_STATUS_ID,
    TECH_HERO_SELECTOR_STATUS_LABEL,
    TECH_HERO_ROUTE_ACTION_STATUS_ID,
    TECH_HERO_ROUTE_ACTION_STATUS_LABEL,
} from './TechHeroData';
import {
    TECH_CONFIG,
    TYPE_LABELS,
    selectorPanelClassName,
    selectorGroupClassName,
    selectorHeaderClassName,
    selectorExpandedPanelClassName,
    selectorOptionBaseClassName,
    selectorOptionSelectedClassName,
    selectorOptionIdleClassName,
    TECH_HERO_SELECTOR_STATUS_ID,
    TECH_HERO_SELECTOR_STATUS_LABEL,
    DEFAULT_TECH_HERO_SELECTOR_STATUS,
    TECH_HERO_ROUTE_ACTION_STATUS_ID,
    TECH_HERO_ROUTE_ACTION_STATUS_LABEL,
    DEFAULT_TECH_HERO_ROUTE_ACTION_STATUS,
    heroFlowPanelClassName,
    heroSnapshotPanelClassName,
    heroSnapshotKickerClassName,
    primaryHeroCtaClassName,
    secondaryHeroCtaClassName,
    supportHeroLinkClassName,
    getChamberTypeAccentClassName,
    HYDROGEN_LINE_ORDER,
    DEFAULT_HYDROGEN_PAGE_SLUG,
    getHydrogenPriceRangeLabel,
    getHydrogenDeliveryLabel,
    getHydrogenOutputSummary,
} from './TechHeroData';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';

const formatWholeNumber = (value: number): string =>
    new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    }).format(value);

type FloatingItem = {
    label: string;
    value: string;
};

interface TechHeroProps {
    data: TechData;
    heroHeadingLevel?: 1 | 2;
    onBack: () => void;
    onNavigate?: (path: string) => void;
    selectedHbotChamberSlug?: string;
    onSelectHbotChamber?: (slug: string) => void;
    compareChamberIds?: string[];
    onToggleCompareChamber?: (chamberId: string) => void;
}

export const resolveTechHeroConfig = (
    data: Pick<TechData, 'id' | 'name' | 'tagline'>
) => {
    const matchedConfig = TECH_CONFIG.find((item) => item.type === data.id);
    if (matchedConfig) return matchedConfig;

    return {
        type: data.id,
        title: data.name,
        tagline: data.tagline,
        icon: <Activity size={28} />,
        iconBg: 'bg-slate-500',
    };
};

export const TechHero: React.FC<TechHeroProps> = ({
    data,
    heroHeadingLevel = 1,
    selectedHbotChamberSlug,
    onSelectHbotChamber,
    compareChamberIds = [],
    onToggleCompareChamber,
}) => {
    const [fallbackSelectedChamberId, setFallbackSelectedChamberId] = useState<string | null>(null);
    const [expandedTypes, setExpandedTypes] = useState<string[]>(['monoplace']);
    const [selectedHydrogenSlug, setSelectedHydrogenSlug] = useState<HydrogenPremiumSlug>(DEFAULT_HYDROGEN_PAGE_SLUG);
    const [expandedHydrogenLines, setExpandedHydrogenLines] = useState<HydrogenPremiumLineId[]>(['personal']);
    const [selectorStatusMessage, setSelectorStatusMessage] = useState(DEFAULT_TECH_HERO_SELECTOR_STATUS);
    const [routeActionStatusMessage, setRouteActionStatusMessage] = useState(DEFAULT_TECH_HERO_ROUTE_ACTION_STATUS);

    const isHbot = data.id === TechType.HBOT;
    const isHydrogen = data.id === TechType.HYDROGEN;
    const isRlt = data.id === TechType.RLT;
    const isSecondaryUnconfirmed = isRlt || data.id === TechType.PEMF;
    const techConfig = resolveTechHeroConfig(data);
    const HeroHeading = heroHeadingLevel === 2 ? 'h2' : 'h1';

    const chambersByType = useMemo(() => {
        if (!isHbot) return null;

        return {
            monoplace: ALL_CHAMBERS.filter((chamber) => chamber.type === 'monoplace'),
            multiplace: ALL_CHAMBERS.filter((chamber) => chamber.type === 'multiplace'),
            soft: ALL_CHAMBERS.filter((chamber) => chamber.type === 'soft'),
        };
    }, [isHbot]);

    const selectedChamber = useMemo(() => {
        if (!chambersByType) return null;

        if (selectedHbotChamberSlug) {
            return ALL_CHAMBERS.find((chamber) => chamber.slug === selectedHbotChamberSlug) ?? null;
        }

        if (fallbackSelectedChamberId) {
            return ALL_CHAMBERS.find((chamber) => chamber.id === fallbackSelectedChamberId) ?? null;
        }

        return ALL_CHAMBERS[0] ?? null;
    }, [chambersByType, fallbackSelectedChamberId, selectedHbotChamberSlug]);

    const hydrogenPagesByLine = useMemo(() => {
        if (!isHydrogen) return null;

        return HYDROGEN_LINE_ORDER.reduce((acc, lineId) => {
            acc[lineId] = hydrogenPremiumPages.filter((page) => page.lineId === lineId);
            return acc;
        }, {} as Record<HydrogenPremiumLineId, HydrogenPremiumPageRecord[]>);
    }, [isHydrogen]);

    const selectedHydrogenPage = useMemo(() => {
        if (!isHydrogen) return null;

        return (
            hydrogenPremiumPages.find((page) => page.slug === selectedHydrogenSlug) ??
            hydrogenPremiumPages.find((page) => page.slug === DEFAULT_HYDROGEN_PAGE_SLUG) ??
            hydrogenPremiumPages[0] ??
            null
        );
    }, [isHydrogen, selectedHydrogenSlug]);

    const selectedHydrogenLine = useMemo(() => {
        if (!selectedHydrogenPage) return null;
        return hydrogenPremiumLineMeta[selectedHydrogenPage.lineId];
    }, [selectedHydrogenPage]);

    const heroImage = useMemo(() => {
        if (isHbot && selectedChamber) {
            return selectedChamber.images.find((image) => image.role === 'hero')?.url ?? null;
        }

        if (isHydrogen && selectedHydrogenPage) {
            return selectedHydrogenPage.image;
        }

        return null;
    }, [isHbot, isHydrogen, selectedChamber, selectedHydrogenPage]);

    const heroCardTitle = isHbot
        ? selectedChamber?.fullName ?? null
        : selectedHydrogenPage?.title ?? null;
    const heroCardAlt = heroCardTitle ?? techConfig.title;
    const shouldRenderHeroCard = Boolean(heroCardTitle && (heroImage || (isHbot && selectedChamber)));
    const heroCardKicker = isHbot
        ? selectedChamber?.brandLabel ?? null
        : selectedHydrogenLine
            ? `${selectedHydrogenLine.order} ${selectedHydrogenLine.title}`
            : null;
    const heroCardSummary = isHydrogen ? selectedHydrogenPage?.heroSummary ?? null : null;

    const hydrogenSnapshotItems: FloatingItem[] = useMemo(() => {
        if (!selectedHydrogenPage || !selectedHydrogenLine) return [];

        return [
            { label: 'Price range', value: getHydrogenPriceRangeLabel(selectedHydrogenPage) },
            {
                label: selectedHydrogenPage.lineId === 'water' ? 'Hydrogen concentration' : 'Output profile',
                value: getHydrogenOutputSummary(selectedHydrogenPage, selectedHydrogenLine.rangeLabel),
            },
            {
                label: 'Configurations',
                value: `${selectedHydrogenPage.variants.length} ${selectedHydrogenPage.variants.length === 1 ? 'model' : 'models'}`,
            },
            { label: 'Delivery', value: getHydrogenDeliveryLabel(selectedHydrogenPage) },
        ];
    }, [selectedHydrogenLine, selectedHydrogenPage]);

    const floatingCardTitle = isHydrogen ? 'Product Snapshot' : 'Hardware Profile';
    const floatingCardItems: FloatingItem[] = isHydrogen
        ? hydrogenSnapshotItems
        : selectedChamber?.specifications.slice(0, 4).map((spec) => ({ label: spec.label, value: spec.value })) ?? [];

    const heroTagline = isHydrogen && selectedHydrogenLine ? selectedHydrogenLine.subtitle : techConfig.tagline;
    const heroIntro = isHydrogen
        ? 'Compare the active hydrogen option, review where it fits in a daily Hylono stack, and jump directly into the exact family before you move into deeper protocol and support details.'
        : isRlt
            ? 'Compare wavelength context, review timing and safety questions, and use rental or guidance paths before turning a panel into a routine.'
        : 'Compare configurations, review pricing and rental paths, and see how this device fits into a structured Hylono routine before you move into deeper specifications and support resources.';
    const primaryBadgeLabel = isHydrogen ? 'Premium lineup' : 'Guided setup';
    const secondaryBadgeLabel = isHydrogen
        ? `${hydrogenPremiumPages.length} model pages`
        : selectedChamber?.pricing.rent
            ? 'Rental available'
            : 'Request / verify';

    const primaryPriceLabel = isHydrogen && selectedHydrogenPage
        ? getHydrogenPriceRangeLabel(selectedHydrogenPage)
        : selectedChamber
            ? (selectedChamber.pricing.buy ? priceBookText(selectedChamber.pricing.buy) : 'Contact for Price')
            : 'Request / verify';
    const primaryPriceMeta = isHydrogen && selectedHydrogenPage
        ? 'Price range'
        : selectedChamber
            ? 'Purchase'
            : 'one-time';

    const secondaryPriceLabel = isHydrogen && selectedHydrogenPage && selectedHydrogenLine
        ? getHydrogenOutputSummary(selectedHydrogenPage, selectedHydrogenLine.rangeLabel)
        : selectedChamber?.pricing.rent?.monthly
            ? priceBookMonthlyText(selectedChamber.pricing.rent.monthly)
            : 'Request / verify';
    const secondaryPriceMeta = isHydrogen && selectedHydrogenPage
        ? (selectedHydrogenPage.lineId === 'water' ? 'Hydrogen concentration' : 'Output profile')
        : 'Rental';

    const primaryCtaHref = isHydrogen && selectedHydrogenPage
        ? getHydrogenPremiumPath(selectedHydrogenPage.slug)
        : isHbot && selectedChamber
            ? `/contact?source=hbot-quote&tech=hbot&productName=${encodeURIComponent(selectedChamber.fullName)}`
        : isRlt
            ? '/rental?device=rlt'
        : '/store';
    const primaryCtaLabel = isHydrogen && selectedHydrogenPage
        ? `Open ${selectedHydrogenPage.title}`
        : isRlt
            ? 'Review rental access'
        : selectedChamber
            ? `Ask about ${selectedChamber.fullName}`
            : 'Order Now';
    const secondaryCtaLabel = isHydrogen || isRlt ? 'Request Guidance' : 'Book Demo';
    const heroFlowItems = [
        {
            step: '01',
            title: 'Configure',
            detail: isHydrogen ? 'Choose hydrogen line' : isHbot ? 'Choose chamber type' : 'Review modality fit',
        },
        {
            step: '02',
            title: floatingCardTitle,
            detail: floatingCardItems[0] ? `${floatingCardItems[0].label}: ${floatingCardItems[0].value}` : heroTagline,
        },
        {
            step: '03',
            title: primaryPriceMeta,
            detail: primaryPriceLabel,
        },
    ];

    const heroSectionStyle = isHydrogen && selectedHydrogenLine
        ? {
            backgroundImage: `radial-gradient(circle at 18% 18%, ${selectedHydrogenLine.glow}, transparent 34%), radial-gradient(circle at 86% 10%, rgba(215,168,79,0.16), transparent 28%), linear-gradient(180deg, #f7f4ee 0%, #fffdf8 54%, #f7f4ee 100%)`,
        }
        : undefined;

    const hydrogenVisualStyle = selectedHydrogenLine
        ? {
            background: `radial-gradient(circle at top right, ${selectedHydrogenLine.glow}, transparent 30%), linear-gradient(135deg, ${selectedHydrogenLine.dark} 0%, #07111c 55%, #02060d 100%)`,
        }
        : undefined;

    const toggleType = (type: string) => {
        const typeMeta = TYPE_LABELS[type] ?? {
            label: type,
            icon: <Activity size={14} />,
        };
        const willExpand = !expandedTypes.includes(type);
        setSelectorStatusMessage(`${typeMeta.label} chamber group ${willExpand ? 'expanded' : 'collapsed'}.`);
        setExpandedTypes((prev) =>
            prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
        );
    };

    const toggleHydrogenLine = (lineId: HydrogenPremiumLineId) => {
        const line = hydrogenPremiumLineMeta[lineId];
        const willExpand = !expandedHydrogenLines.includes(lineId);
        setSelectorStatusMessage(`${line.title} hydrogen line ${willExpand ? 'expanded' : 'collapsed'}.`);
        setExpandedHydrogenLines((prev) =>
            prev.includes(lineId) ? prev.filter((item) => item !== lineId) : [...prev, lineId]
        );
    };

    const handleSelectChamber = (chamberId: string) => {
        const chamber = ALL_CHAMBERS.find((candidate) => candidate.id === chamberId);
        if (!chamber) return;

        setSelectorStatusMessage(`${chamber.fullName} selected for the product hero configuration.`);

        if (onSelectHbotChamber) {
            onSelectHbotChamber(chamber.slug);
            return;
        }

        setFallbackSelectedChamberId(chamberId);
    };

    const handleSelectHydrogenPage = (page: HydrogenPremiumPageRecord) => {
        setSelectorStatusMessage(`${page.title} selected for the product hero configuration.`);
        setSelectedHydrogenSlug(page.slug);
        setExpandedHydrogenLines((prev) =>
            prev.includes(page.lineId) ? prev : [...prev, page.lineId]
        );
    };

    const handleToggleCompareChamber = (chamber: { id: string; fullName: string }, inCompare: boolean) => {
        setSelectorStatusMessage(
            `${chamber.fullName} ${inCompare ? 'removed from' : 'added to'} the comparison list.`
        );
        onToggleCompareChamber?.(chamber.id);
    };
    const announceRouteReady = (label: string) => () => {
        setRouteActionStatusMessage(`${label} route is ready from the product hero.`);
    };
    const announceRouteOpening = (label: string) => () => {
        setRouteActionStatusMessage(`Opening ${label} from the product hero.`);
    };

    return (
        <section
            className={isHbot ? 'relative overflow-hidden bg-[#f8fafc] py-12 text-slate-950 lg:py-16' : 'relative overflow-hidden bg-[var(--surface-page)] pb-20 pt-28 text-slate-950'}
            style={heroSectionStyle}
        >
            {/* Layered ambient glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(47,159,179,0.13),transparent_45%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(98,183,164,0.10),transparent_40%)]" />
                <div className="absolute left-8 top-36 hidden h-64 w-64 rounded-lg border border-[var(--border-soft)] bg-white/35 lg:block" />
                <div className="absolute bottom-16 right-10 hidden h-40 w-40 rounded-lg border border-cyan-500/20 bg-white/30 lg:block" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <Link
                    href="/store"
                    prefetch={false}
                    aria-describedby={TECH_HERO_ROUTE_ACTION_STATUS_ID}
                    onFocus={announceRouteReady('Store')}
                    onClick={announceRouteOpening('Store')}
                    className="mb-12 inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Store</span>
                </Link>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
                    <div className="relative min-w-0">
                        {isHbot && selectedChamber ? (
                            <figure className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4">
                                {heroImage ? (
                                    <OptimizedImage src={heroImage} alt={heroCardAlt} width={800} height={600} sizes="(max-width: 1024px) 100vw, 50vw" className="aspect-[4/3] w-full rounded-[1.4rem] object-contain" />
                                ) : (
                                    <HbotChamberMediaFallback title={selectedChamber.fullName} specifications={selectedChamber.specifications} />
                                )}
                                <figcaption className="px-3 py-4 text-sm font-semibold text-slate-900">{selectedChamber.fullName}</figcaption>
                            </figure>
                        ) : shouldRenderHeroCard ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isHydrogen ? selectedHydrogenPage?.slug ?? 'hydrogen-route' : selectedChamber?.id ?? 'selected-chamber'}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="group relative aspect-[4/3] w-full max-w-full min-h-[260px] overflow-hidden rounded-lg border border-white/15 bg-slate-950 shadow-none ring-1 ring-white/10 sm:min-h-[360px]"
                                    style={isHydrogen ? hydrogenVisualStyle : undefined}
                                >
                                    <div className="absolute inset-2 z-10 rounded-lg border border-white/10 pointer-events-none" />
                                    {heroImage ? (
                                        <>
                                            <OptimizedImage
                                                src={heroImage}
                                                alt={heroCardAlt}
                                                fill
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                                className={`h-full w-full transition-transform duration-700 group-hover:scale-105 ${isHydrogen ? 'object-contain p-5 sm:p-8' : 'object-cover'}`}
                                            />
                                            <div className={`absolute inset-0 pointer-events-none ${isHydrogen ? 'bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent' : 'bg-gradient-to-t from-slate-900/30 to-transparent'}`} />

                                            <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center gap-2 sm:top-6 sm:left-6 sm:right-auto sm:gap-3">
                                                <span
                                                    className={`max-w-full px-3 py-1.5 text-[10px] font-bold leading-tight sm:px-4 sm:text-xs rounded-lg ${isHydrogen ? 'border text-white backdrop-blur-sm' : selectedChamber?.brand === 'oxyhelp' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'}`}
                                                    style={isHydrogen && selectedHydrogenLine
                                                        ? {
                                                            borderColor: `${selectedHydrogenLine.accent}55`,
                                                            backgroundColor: `${selectedHydrogenLine.accent}22`,
                                                            color: selectedHydrogenLine.accent,
                                                        }
                                                        : undefined}
                                                >
                                                    {isHydrogen
                                                        ? heroCardKicker
                                                        : selectedChamber?.brand === 'oxyhelp'
                                                            ? 'EU MADE'
                                                            : 'VALUE SERIES'}
                                                </span>
                                                {isHydrogen && selectedHydrogenPage && (
                                                    <span className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10px] font-bold leading-tight text-white shadow-none sm:px-4 sm:text-xs">
                                                        {selectedHydrogenPage.variants.length} {selectedHydrogenPage.variants.length === 1 ? 'model' : 'models'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="absolute right-4 top-4 hidden rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-right text-white shadow-none backdrop-blur-md sm:right-6 sm:top-6 md:block">
                                                <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-white/55">
                                                    Active path
                                                </span>
                                                <span className="mt-1 block text-sm font-black">
                                                    {primaryPriceMeta}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                                                {isHbot && heroCardKicker && (
                                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                                                        {heroCardKicker}
                                                    </p>
                                                )}
                                                <h4 className="text-xl font-black italic tracking-tight text-white sm:text-2xl">
                                                    {heroCardTitle}
                                                </h4>
                                                {heroCardSummary && (
                                                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/78">
                                                        {heroCardSummary}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        selectedChamber && (
                                            <HbotChamberMediaFallback
                                                title={selectedChamber.fullName}
                                                specifications={selectedChamber.specifications}
                                                className="h-full min-h-[260px] sm:min-h-[360px]"
                                            />
                                        )
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <div className="flex items-center justify-center">
                                <div className="flex h-72 w-72 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.02] shadow-none md:h-96 md:w-96">
                                    <div className="flex h-48 w-48 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/15 text-cyan-100 shadow-xl md:h-64 md:w-64">
                                        {techConfig.icon}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isHbot && heroImage && floatingCardItems.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`absolute -bottom-8 -right-4 hidden w-72 p-6 lg:-right-8 lg:block ${heroSnapshotPanelClassName}`}
                                data-testid="tech-hero-snapshot-card"
                            >
                                <p className={`${heroSnapshotKickerClassName} mb-4`}>
                                    {floatingCardTitle}
                                </p>
                                <div className="space-y-3">
                                    {floatingCardItems.map((item) => (
                                        <div key={`${item.label}-${item.value}`} className="flex justify-between items-center gap-4 border-b border-[var(--border-soft)] pb-2 last:border-0">
                                            <span className="text-xs text-slate-600 font-medium">{item.label}</span>
                                            <span className="text-xs text-slate-950 font-bold text-right">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div id="product-hero" className="lg:sticky lg:top-32">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 shadow-sm backdrop-blur-sm">
                                <CheckCircle size={10} /> {primaryBadgeLabel}
                            </span>
                            <span className="rounded-lg border border-[var(--border-soft)] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur-sm">
                                {secondaryBadgeLabel}
                            </span>
                        </div>

                        <HeroHeading className="text-5xl md:text-6xl font-black text-slate-950 mb-4 tracking-tight leading-none">
                            {techConfig.title}
                        </HeroHeading>
                        <p className="text-xl text-cyan-700 font-light mb-8 leading-relaxed">
                            {heroTagline}
                        </p>
                        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 mb-8">
                            {heroIntro}
                        </p>

                        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3" data-testid="tech-hero-flow">
                            {heroFlowItems.map((item) => (
                                <div
                                    key={item.step}
                                    className={heroFlowPanelClassName}
                                    data-testid="tech-hero-flow-card"
                                >
                                    <span className="absolute -bottom-4 right-3 text-6xl font-black leading-none text-slate-950/[0.05]">
                                        {item.step}
                                    </span>
                                    <span className="relative block text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">
                                        {item.step}
                                    </span>
                                    <span className="relative mt-3 block text-sm font-black text-slate-950">
                                        {item.title}
                                    </span>
                                    <span className="relative mt-1 block text-xs leading-5 text-slate-600">
                                        {item.detail}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {chambersByType && (
                            <div className="mb-8">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                    Select Configuration
                                </p>
                                <p
                                    id={TECH_HERO_SELECTOR_STATUS_ID}
                                    role="status"
                                    aria-live="polite"
                                    aria-atomic="true"
                                    aria-label={TECH_HERO_SELECTOR_STATUS_LABEL}
                                    className="sr-only"
                                >
                                    {selectorStatusMessage}
                                </p>
                                <div className={selectorPanelClassName} data-testid="tech-hero-selector">
                                    {Object.entries(chambersByType).map(([type, chambers]) => {
                                        if (chambers.length === 0) return null;

                                        const isExpanded = expandedTypes.includes(type);
                                        const typeMeta = TYPE_LABELS[type] ?? {
                                            label: type,
                                            icon: <Activity size={14} />,
                                        };

                                        return (
                                            <div key={type} className={selectorGroupClassName}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleType(type)}
                                                    aria-expanded={isExpanded}
                                                    aria-describedby={TECH_HERO_SELECTOR_STATUS_ID}
                                                    className={selectorHeaderClassName}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getChamberTypeAccentClassName(type)}`}>
                                                            {typeMeta.icon}
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="text-sm font-bold text-slate-950">{typeMeta.label}</span>
                                                            <span className="text-xs text-slate-600 ml-2">({chambers.length})</span>
                                                        </div>
                                                    </div>
                                                    <ChevronDown
                                                        size={16}
                                                        className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </button>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className={selectorExpandedPanelClassName}
                                                        >
                                                            <div className="px-5 pb-4 pt-1 space-y-1.5">
                                                                {chambers.map((chamber) => {
                                                                    const isSelected = selectedChamber?.id === chamber.id;
                                                                    const inCompare = compareChamberIds.includes(chamber.id);

                                                                    return (
                                                                        // The row is a CONTAINER, not a button. It used to be a <button> with a
                                                                        // <span role="button" tabIndex={0}> inside it for Compare, which axe reported
                                                                        // as 3 serious nested-interactive nodes ("Element has focusable descendants").
                                                                        // A <button>'s content model forbids interactive descendants. Proof 1009828.
                                                                        // Select and Compare are now SIBLING buttons; because Compare is a real
                                                                        // <button> it needs no role, tabIndex, onKeyDown shim or stopPropagation.
                                                                        // Do not nest them again.
                                                                        <div
                                                                            key={chamber.id}
                                                                            className={`${selectorOptionBaseClassName} ${isSelected ? selectorOptionSelectedClassName : selectorOptionIdleClassName}`}
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleSelectChamber(chamber.id)}
                                                                                aria-describedby={TECH_HERO_SELECTOR_STATUS_ID}
                                                                                className="flex w-full items-start gap-3 text-left"
                                                                            >
                                                                                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-slate-950 bg-white' : 'border-slate-300'}`}>
                                                                                    {isSelected && (
                                                                                        <div className="h-3 w-3 rounded-full bg-slate-950" />
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <span className="text-sm font-semibold truncate block">
                                                                                        {chamber.fullName}
                                                                                    </span>
                                                                                    <span className={`text-xs mt-1 block ${isSelected ? 'text-slate-700' : 'text-slate-600'}`}>
                                                                                        {chamber.tagline}
                                                                                    </span>
                                                                                </div>
                                                                                {chamber.brand === 'oxyhelp' && (
                                                                                    <span className="rounded-lg border border-blue-300/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                                                                        EU
                                                                                    </span>
                                                                                )}
                                                                            </button>
                                                                            {onToggleCompareChamber && (
                                                                                <button
                                                                                    type="button"
                                                                                    aria-describedby={TECH_HERO_SELECTOR_STATUS_ID}
                                                                                    aria-pressed={inCompare}
                                                                                    onClick={() => {
                                                                                        handleToggleCompareChamber(chamber, inCompare);
                                                                                    }}
                                                                                    className={`ml-9 mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${inCompare ? 'border-cyan-500/40 bg-cyan-100 text-slate-950' : 'border-[var(--border-soft)] bg-white text-slate-700 hover:border-cyan-500/30 hover:bg-cyan-50'}`}
                                                                                >
                                                                                    {inCompare ? 'In compare' : 'Compare'}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {hydrogenPagesByLine && selectedHydrogenPage && selectedHydrogenLine && (
                            <div className="mb-8">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                    Select Configuration
                                </p>
                                <p
                                    id={TECH_HERO_SELECTOR_STATUS_ID}
                                    role="status"
                                    aria-live="polite"
                                    aria-atomic="true"
                                    aria-label={TECH_HERO_SELECTOR_STATUS_LABEL}
                                    className="sr-only"
                                >
                                    {selectorStatusMessage}
                                </p>
                                <div className={selectorPanelClassName} data-testid="tech-hero-selector">
                                    {HYDROGEN_LINE_ORDER.map((lineId) => {
                                        const line = hydrogenPremiumLineMeta[lineId];
                                        const pages = hydrogenPagesByLine[lineId];
                                        if (!pages || pages.length === 0) return null;

                                        const isExpanded = expandedHydrogenLines.includes(lineId);
                                        const isActiveLine = selectedHydrogenPage.lineId === lineId;

                                        return (
                                            <div key={lineId} className={selectorGroupClassName}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleHydrogenLine(lineId)}
                                                    aria-expanded={isExpanded}
                                                    aria-describedby={TECH_HERO_SELECTOR_STATUS_ID}
                                                    className={`${selectorHeaderClassName} ${isActiveLine ? 'bg-white/[0.06]' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black"
                                                            style={{
                                                                backgroundColor: `${line.accent}18`,
                                                                color: line.accent,
                                                            }}
                                                        >
                                                            {line.order}
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="text-sm font-bold text-slate-950">{line.title}</span>
                                                            <span className="text-xs text-slate-600 ml-2">({pages.length})</span>
                                                            <p className="text-xs text-slate-400 mt-1">{line.subtitle}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown
                                                        size={16}
                                                        className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </button>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className={selectorExpandedPanelClassName}
                                                        >
                                                            <div className="px-5 pb-4 pt-1 space-y-1.5">
                                                                {pages.map((page) => {
                                                                    const isSelected = selectedHydrogenPage.slug === page.slug;

                                                                    return (
                                                                        <button
                                                                            type="button"
                                                                            key={page.slug}
                                                                            onClick={() => handleSelectHydrogenPage(page)}
                                                                            aria-describedby={TECH_HERO_SELECTOR_STATUS_ID}
                                                                            className={`${selectorOptionBaseClassName} ${isSelected ? selectorOptionSelectedClassName : selectorOptionIdleClassName}`}
                                                                        >
                                                                            <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-cyan-200 bg-cyan-200' : 'border-white/20'}`}>
                                                                                {isSelected && (
                                                                                    <div className="h-3 w-3 rounded-full bg-slate-950" />
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                                                    <div className="min-w-0">
                                                                                        <span className="text-sm font-semibold block truncate">
                                                                                            {page.title}
                                                                                        </span>
                                                                                        <span className={`text-xs mt-1 block ${isSelected ? 'text-slate-700' : 'text-slate-600'}`}>
                                                                                            {page.catalogSummary}
                                                                                        </span>
                                                                                    </div>
                                                                                    <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${isSelected ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/[0.05] text-slate-200'}`}>
                                                                                        {getHydrogenPriceRangeLabel(page)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mb-8 flex flex-wrap items-end gap-4 sm:gap-8">
                            <div>
                                <span className={`font-black text-slate-950 ${isHydrogen ? 'text-2xl sm:text-3xl' : selectedChamber ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>
                                    {primaryPriceLabel}
                                </span>
                                <span className="text-sm text-slate-400 ml-2 uppercase font-bold tracking-tighter">
                                    {primaryPriceMeta}
                                </span>
                            </div>
                            {secondaryPriceLabel && (
                                <div className="border-l border-[var(--border-soft)] pl-6">
                                    <span className="text-sm text-slate-400 block uppercase font-bold tracking-tighter mb-1">
                                        {secondaryPriceMeta}
                                    </span>
                                    <span className={`text-xl font-bold ${isHydrogen ? 'text-cyan-400' : 'text-cyan-400'}`}>
                                        {secondaryPriceLabel}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mb-8">
                            <p
                                id={TECH_HERO_ROUTE_ACTION_STATUS_ID}
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                aria-label={TECH_HERO_ROUTE_ACTION_STATUS_LABEL}
                                className="sr-only"
                            >
                                {routeActionStatusMessage}
                            </p>
                            <Link
                                href={primaryCtaHref}
                                prefetch={false}
                                aria-describedby={TECH_HERO_ROUTE_ACTION_STATUS_ID}
                                onFocus={announceRouteReady(primaryCtaLabel)}
                                onClick={announceRouteOpening(primaryCtaLabel)}
                                className={primaryHeroCtaClassName}
                                data-testid="tech-hero-primary-cta"
                            >
                                <ShoppingBag size={16} />
                                {primaryCtaLabel}
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href={`/contact?tech=${data.id.toLowerCase()}`}
                                prefetch={false}
                                aria-describedby={TECH_HERO_ROUTE_ACTION_STATUS_ID}
                                onFocus={announceRouteReady(secondaryCtaLabel)}
                                onClick={announceRouteOpening(secondaryCtaLabel)}
                                className={secondaryHeroCtaClassName}
                                data-testid="tech-hero-secondary-cta"
                            >
                                <Calendar size={16} /> {secondaryCtaLabel}
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:grid-cols-3 sm:gap-4">
                            <Link
                                href="/warranty"
                                prefetch={false}
                                aria-describedby={TECH_HERO_ROUTE_ACTION_STATUS_ID}
                                onFocus={announceRouteReady('Warranty Policy')}
                                onClick={announceRouteOpening('Warranty Policy')}
                                className={supportHeroLinkClassName}
                            >
                                <Shield size={14} className="text-emerald-400" />
                                <span>Warranty Policy</span>
                            </Link>
                            <Link
                                href="/returns"
                                prefetch={false}
                                aria-describedby={TECH_HERO_ROUTE_ACTION_STATUS_ID}
                                onFocus={announceRouteReady('Returns Policy')}
                                onClick={announceRouteOpening('Returns Policy')}
                                className={supportHeroLinkClassName}
                            >
                                <CheckCircle size={14} className="text-emerald-500" />
                                <span>Returns Policy</span>
                            </Link>
                            <Link
                                href={`/contact?tech=${data.id.toLowerCase()}`}
                                prefetch={false}
                                aria-describedby={TECH_HERO_ROUTE_ACTION_STATUS_ID}
                                onFocus={announceRouteReady('Contact Support')}
                                onClick={announceRouteOpening('Contact Support')}
                                className={supportHeroLinkClassName}
                            >
                                <Phone size={14} className="text-emerald-500" />
                                <span>Contact Support</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {floatingCardItems.length > 0 && (
                <div className="lg:hidden max-w-7xl mx-auto px-6 mt-12">
                    <div className={`${heroSnapshotPanelClassName} p-6`} data-testid="tech-hero-mobile-snapshot-card">
                        <p className={`${heroSnapshotKickerClassName} mb-4`}>
                            {floatingCardTitle}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {floatingCardItems.slice(0, 6).map((item) => (
                                <div key={`${item.label}-${item.value}`} className="space-y-0.5">
                                    <p className="text-xs text-slate-600 font-medium">{item.label}</p>
                                    <p className="text-sm font-bold text-slate-950">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

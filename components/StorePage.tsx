'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
    Activity,
    Sun,
    Droplets,
    Sparkles,
    Shield,
    Moon,
    Flame,
    Zap,
    Heart,
    Smile,
    Mountain,
    RotateCw,
    X,
    ArrowRight,
} from 'lucide-react';
import { useTech } from '../hooks/useTech';
import { TechData, TechType } from '../types';
import { analytics } from '../src/lib/analytics';
import { products as catalogProducts, getProductForRouteSlug } from '../content/products';
import { getTechRouteSlug } from '../lib/product-routes';

const RentalConfigurator = dynamic(
    () => import('./RentalConfigurator').then((module) => ({ default: module.RentalConfigurator })),
    { ssr: false, loading: () => null }
);

interface StorePageProps {
    onNavigate: (page: string) => void;
    onSelectTech: (tech: TechType) => void;
    onNavigateChambers?: () => void;
    productHrefForTech?: (tech: TechType) => string;
    plannerSummaryLines?: string[];
}

export const isConfirmedStoreCommercialTech = (tech: Pick<TechData, 'id'>): boolean => {
    const slug = getTechRouteSlug(tech.id as TechType);
    const product = getProductForRouteSlug(slug);
    return Boolean(product && (product.purchasePrice > 0 || (product.rentalPlans && product.rentalPlans.length > 0)));
};

interface EditorialSystemConfig {
    num: string;
    title: string;
    modalitySubtitle: string;
    description: string;
    exploreLabel: string;
    badgeText: string;
    isDark: boolean;
    bgColor: string;
    gradientOverlay: string;
    imageSrc: string;
    imageAlt: string;
    isInverted?: boolean;
    pills: Array<{ label: string; icon: React.ReactNode }>;
    floatingPoints?: string[];
    isEcosystem?: boolean;
}

const EDITORIAL_CATALOG: Record<string, EditorialSystemConfig> = {
    [TechType.HBOT]: {
        num: '01',
        title: 'HBOT',
        modalitySubtitle: 'Hyperbaric Oxygen Therapy',
        description: 'Operating pressure 1.3-1.5 ATA, 220 cm internal length, 10 L/min oxygen concentrator. Specifications, not outcome promises.',
        exploreLabel: 'Explore HBOT →',
        badgeText: 'Rental Available',
        isDark: true,
        bgColor: '#0c1017',
        gradientOverlay: 'from-[#0c1017] via-[#0c1017]/90 sm:via-[#0c1017]/70 to-transparent',
        imageSrc: '/images/store/store_card_hbot.jpg',
        imageAlt: 'Hyperbaric oxygen chamber with cyan illumination',
        pills: [
            { label: 'Recovery', icon: <Droplets size={12} /> },
            { label: 'Longevity', icon: <Activity size={12} /> },
            { label: 'Sleep', icon: <Moon size={12} /> },
        ],
    },
    [TechType.HYDROGEN]: {
        num: '02',
        title: 'Hydrogen',
        modalitySubtitle: 'Molecular Hydrogen Therapy',
        description: 'Gas flow 300-900 ml/min, hydrogen water above 1200 ppb. Specifications, not outcome promises.',
        exploreLabel: 'Explore Hydrogen →',
        badgeText: 'Rental Available',
        isDark: false,
        bgColor: '#f4f3ef',
        gradientOverlay: 'from-[#f4f3ef] via-[#f4f3ef]/95 sm:via-[#f4f3ef]/70 to-transparent',
        imageSrc: '/images/store/store_card_hydrogen.jpg',
        imageAlt: 'Molecular Hydrogen inhalation unit on sunlit limestone countertop',
        pills: [
            { label: 'Anti-oxidant', icon: <Sparkles size={12} /> },
            { label: 'Recovery', icon: <Activity size={12} /> },
            { label: 'Vitality', icon: <Sun size={12} /> },
        ],
    },
    [TechType.RLT]: {
        num: '03',
        title: 'Red Light / NIR',
        modalitySubtitle: 'Photobiomodulation Therapy',
        description: '660 nm red and 850 nm near-infrared, continuous wave, 60-degree beam angle. Specifications, not outcome promises.',
        exploreLabel: 'Explore Red Light →',
        badgeText: 'Rental Available',
        isDark: true,
        bgColor: '#0a0203',
        gradientOverlay: 'from-[#0a0203] via-[#0a0203]/95 sm:via-[#0a0203]/70 to-transparent',
        imageSrc: '/images/store/store_card_redlight.jpg',
        imageAlt: 'Photobiomodulation Red Light canopy bed glowing with deep crimson light',
        pills: [
            { label: 'Skin', icon: <Sun size={12} /> },
            { label: 'Recovery', icon: <Activity size={12} /> },
            { label: 'Performance', icon: <Zap size={12} /> },
        ],
    },
    [TechType.PEMF]: {
        num: '04',
        title: 'PEMF',
        modalitySubtitle: 'Pulsed Electromagnetic Field Therapy',
        description: 'Pulsed field 10-500 Gauss, 1-50 Hz device presets, 8-20 minute sessions. Specifications, not outcome promises.',
        exploreLabel: 'Explore PEMF →',
        badgeText: 'Rental Available',
        isDark: false,
        bgColor: '#eef2f6',
        gradientOverlay: 'from-[#eef2f6] via-[#eef2f6]/95 sm:via-[#eef2f6]/70 to-transparent',
        imageSrc: '/images/store/store_card_pemf.jpg',
        imageAlt: 'Quilted clinical PEMF therapy mat on concrete plinth overlooking alpine lake',
        pills: [
            { label: 'Recovery', icon: <Activity size={12} /> },
            { label: 'Sleep', icon: <Moon size={12} /> },
            { label: 'Resilience', icon: <Shield size={12} /> },
        ],
    },
    [TechType.SAUNA_BLANKET]: {
        num: '05',
        title: 'Sauna Blanket',
        modalitySubtitle: 'Far-Infrared Heat Therapy',
        description: 'Far-infrared 5-20 um, 30-45 minute sessions, 5-10 minute warm-up. Specifications, not outcome promises.',
        exploreLabel: 'Explore Sauna Blanket →',
        badgeText: 'Rental Available',
        isDark: false,
        bgColor: '#f7f1ea',
        gradientOverlay: 'from-[#f7f1ea] via-[#f7f1ea]/95 sm:via-[#f7f1ea]/70 to-transparent',
        imageSrc: '/images/store/store_card_saunablanket.jpg',
        imageAlt: 'Infrared sauna blanket resting on an inclined wooden plinth in warm golden light',
        pills: [
            { label: 'Relaxation', icon: <Sparkles size={12} /> },
            { label: 'Circulation', icon: <Droplets size={12} /> },
            { label: 'Sleep', icon: <Moon size={12} /> },
        ],
    },
    [TechType.EMS]: {
        num: '06',
        title: 'EMS Suit',
        modalitySubtitle: 'Whole-Body Electrical Stimulation',
        description: 'Whole-body suit, biphasic pulses, 20 minute guided sessions. Specifications, not outcome promises.',
        exploreLabel: 'Explore EMS Suit →',
        badgeText: 'Rental Available',
        isDark: true,
        bgColor: '#0d1117',
        gradientOverlay: 'from-[#0d1117] via-[#0d1117]/95 sm:via-[#0d1117]/70 to-transparent',
        imageSrc: '/images/store/store_card_emssuit.jpg',
        imageAlt: 'Wireless EMS athletic bodysuit fitted on mannequin in dark private studio gym',
        pills: [
            { label: 'Strength', icon: <Activity size={12} /> },
            { label: 'Recovery', icon: <Activity size={12} /> },
            { label: 'Metabolic', icon: <Flame size={12} /> },
        ],
    },
    [TechType.VNS]: {
        num: '07',
        title: 'VNS Device',
        modalitySubtitle: 'Vagus Nerve Stimulation',
        description: 'Transcutaneous auricular stimulation, 15-30 minute sessions, non-invasive. Specifications, not outcome promises.',
        exploreLabel: 'Explore VNS →',
        badgeText: 'Rental Available',
        isDark: true,
        bgColor: '#090c0f',
        gradientOverlay: 'from-[#090c0f] via-[#090c0f]/95 sm:via-[#090c0f]/70 to-transparent',
        imageSrc: '/images/store/store_card_vns.jpg',
        imageAlt: 'Matte white wearable VNS device on dark slate plinth with monstera leaf backdrop',
        pills: [
            { label: 'Stress', icon: <Sparkles size={12} /> },
            { label: 'Sleep', icon: <Moon size={12} /> },
            { label: 'HRV', icon: <Heart size={12} /> },
        ],
    },
    [TechType.HYPOXIC]: {
        num: '08',
        title: 'Hypoxic Generator',
        modalitySubtitle: 'Altitude Simulation Training System',
        description: 'Altitude simulation 2,000-6,000 m equivalent, 9-18% FiO2, 30-60 minute cycles. Specifications, not outcome promises.',
        exploreLabel: 'Explore Hypoxic Generator →',
        badgeText: 'Rental Available',
        isDark: true,
        bgColor: '#121b27',
        gradientOverlay: 'from-[#121b27] via-[#121b27]/95 sm:via-[#121b27]/70 to-transparent',
        imageSrc: '/images/store/store_card_hypoxic.jpg',
        imageAlt: 'Illuminated altitude training chamber booth overlooking snowy mountain peaks',
        pills: [
            { label: 'Endurance', icon: <Shield size={12} /> },
            { label: 'VO₂ Max', icon: <Mountain size={12} /> },
            { label: 'Circulation', icon: <RotateCw size={12} /> },
        ],
    },
    [TechType.CRYO]: {
        num: '09',
        title: 'Cryo Chamber',
        modalitySubtitle: 'Whole-Body Cryotherapy System',
        description: 'Cryogenic nitrogen vapour, -100 to -140 degrees C, 2-3 minute sessions. Specifications, not outcome promises.',
        exploreLabel: 'Explore Cryo Chamber →',
        badgeText: 'Custom Pricing',
        isDark: false,
        isInverted: true,
        bgColor: '#edf3f7',
        gradientOverlay: 'from-[#edf3f7] via-[#edf3f7]/95 sm:via-[#edf3f7]/70 to-transparent',
        imageSrc: '/images/store/store_card_cryo.jpg',
        imageAlt: 'Sleek black whole-body cryotherapy chamber with cold vapor rolling on stone floor',
        pills: [
            { label: 'Recovery', icon: <Activity size={12} /> },
            { label: 'Inflammation', icon: <Shield size={12} /> },
            { label: 'Mood', icon: <Smile size={12} /> },
        ],
    },
    ECOSYSTEM: {
        num: '10',
        title: 'Complete Your Wellness System',
        modalitySubtitle: 'Synergistic Protocol Architecture',
        description: 'Combine technologies. Build your protocol. Get expert support.',
        exploreLabel: 'Explore All Systems →',
        badgeText: 'Ecosystem',
        isDark: false,
        bgColor: '#f5f7f9',
        gradientOverlay: 'from-[#f5f7f9] via-[#f5f7f9]/90 sm:via-[#f5f7f9]/60 to-transparent',
        imageSrc: '/images/store/store_card_ecosystem.jpg',
        imageAlt: 'Ethereal translucent flowing silk ribbon wave in pale ice blue and platinum',
        isEcosystem: true,
        floatingPoints: ['Compare specs', 'Review evidence', 'Plan your routine'],
        pills: [],
    },
};

const ORDERED_SYSTEM_KEYS = [
    TechType.HBOT,
    TechType.HYDROGEN,
    TechType.RLT,
    TechType.PEMF,
    TechType.SAUNA_BLANKET,
    TechType.EMS,
    TechType.VNS,
    TechType.HYPOXIC,
    TechType.CRYO,
    'ECOSYSTEM',
];

export const StorePage: React.FC<StorePageProps> = ({
    onNavigate,
    onSelectTech,
    onNavigateChambers,
    productHrefForTech,
}) => {
    const { allTech } = useTech();
    const [comparedTechIds, setComparedTechIds] = useState<TechType[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const techById = useMemo(() => {
        const map = new Map<string, TechData>();
        allTech.forEach((tech) => map.set(tech.id, tech));
        return map;
    }, [allTech]);

    const getProductHref = (techId: TechType): string =>
        productHrefForTech?.(techId) ?? `/product/${techId.toLowerCase()}`;

    const handleProductClick = (tech: TechData) => {
        analytics.productViewed(tech.id, tech.name, 0);
        onSelectTech(tech.id);
    };

    const scrollToCatalog = () => {
        const element = document.getElementById('systems-catalogue');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const toggleCompare = (techId: TechType, e: React.MouseEvent) => {
        e.stopPropagation();
        setComparedTechIds((prev) =>
            prev.includes(techId)
                ? prev.filter((id) => id !== techId)
                : prev.length < 4
                ? [...prev, techId]
                : prev
        );
    };

    const handleRouteTransition = (destination: string, source: string, ctaRole: 'primary' | 'supporting' = 'supporting') => {
        analytics.capture('store_route_transition_clicked', {
            destination,
            source,
            cta_role: ctaRole,
        });
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] text-slate-900 selection:bg-slate-900 selection:text-white">
            {/* HERO SECTION — SUNLIT ARCHITECTURAL SANCTUARY */}
            <section className="relative w-full min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col justify-between overflow-hidden">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/store/store_hero_sanctuary.jpg"
                        alt="Hylono Wellness Sanctuary pavilion overlooking sunny alpine mountain lake"
                        fill
                        priority
                        unoptimized
                        className="object-cover object-center transform scale-[1.01]"
                        sizes="100vw"
                    />
                    {/* Subtle warm architectural gradient overlay on left for immaculate typography legibility */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f6]/95 via-[#faf9f6]/60 sm:via-[#faf9f6]/25 to-transparent" />
                </div>

                {/* Hero Header Top Bar: STORE label + 10 SYSTEMS / 2 x 5 CATALOGUE indicator */}
                <div className="relative z-10 w-full max-w-[1536px] mx-auto px-6 sm:px-12 lg:px-16 pt-8 sm:pt-10 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs tracking-[0.3em] text-slate-500 uppercase font-medium">
                        STORE
                    </span>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-900 font-mono">
                                10 SYSTEMS
                            </span>
                            <span className="block text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-[0.16em] font-medium">
                                2 × 5 CATALOGUE
                            </span>
                        </div>
                        {/* Slender vertical indicator gauge with node */}
                        <div className="w-[1px] h-8 bg-slate-300 relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 absolute top-1" />
                        </div>
                    </div>
                </div>

                {/* Hero Main Copy Lockup */}
                <div className="relative z-10 w-full max-w-[1536px] mx-auto px-6 sm:px-12 lg:px-16 pb-16 sm:pb-20 pt-16 sm:pt-24">
                    <div className="max-w-2xl">
                        <h1
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-light text-slate-900 tracking-tight leading-[1.04] font-serif"
                            style={{ fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif' }}
                        >
                            Technology <br />
                            with published specs.
                        </h1>

                        <p className="mt-6 text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-lg">
                            Operating ranges, contraindications, and the evidence we do and do not hold. <br className="hidden sm:inline" />
                            Support from selection to setup.
                        </p>

                        <div className="mt-8">
                            <button
                                type="button"
                                onClick={scrollToCatalog}
                                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.14em] uppercase text-slate-900 hover:text-slate-600 transition-colors group cursor-pointer"
                            >
                                <span>→ Explore all technologies</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEAMLESS 2×5 ARCHITECTURAL GRID */}
            <section id="systems-catalogue" className="w-full border-t border-slate-200/60">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {ORDERED_SYSTEM_KEYS.map((systemKey) => {
                        const config = EDITORIAL_CATALOG[systemKey];
                        if (!config) return null;

                        const isTech = systemKey !== 'ECOSYSTEM';
                        const tech = isTech ? techById.get(systemKey) : null;
                        const isCompared = tech ? comparedTechIds.includes(tech.id) : false;
                        const isConfirmedCommercial = tech ? isConfirmedStoreCommercialTech(tech) : false;

                        return (
                            <article
                                key={systemKey}
                                data-testid="product-card"
                                onClick={() => {
                                    if (tech) handleProductClick(tech);
                                    else scrollToCatalog();
                                }}
                                style={{ backgroundColor: config.bgColor }}
                                className={`relative min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-14 border-b border-slate-200/20 ${
                                    config.isDark ? 'text-white' : 'text-slate-900'
                                } cursor-pointer group transition-all duration-300`}
                            >
                                {/* Background Product Photography */}
                                <div
                                    className={`absolute top-0 bottom-0 ${
                                        config.isInverted
                                            ? 'left-0 w-full sm:w-[58%] lg:w-[60%]'
                                            : 'right-0 w-full sm:w-[58%] lg:w-[60%]'
                                    } z-0 overflow-hidden`}
                                >
                                    <Image
                                        src={config.imageSrc}
                                        alt={config.imageAlt}
                                        fill
                                        loading="eager"
                                        unoptimized
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className={`object-cover ${
                                            config.isInverted ? 'object-left' : 'object-center sm:object-right'
                                        } group-hover:scale-105 transition-transform duration-1000 ease-out`}
                                    />
                                    {/* Seamless gradient blend matching card background */}
                                    <div
                                        className={`absolute inset-0 ${
                                            config.isInverted ? 'bg-gradient-to-l' : 'bg-gradient-to-r'
                                        } ${config.gradientOverlay}`}
                                    />
                                </div>

                                {/* Floating Points for Ecosystem Card 10 */}
                                {config.isEcosystem && config.floatingPoints && (
                                    <div className="absolute right-8 sm:right-12 top-1/2 -translate-y-1/2 space-y-4 text-right hidden sm:block z-10 pointer-events-none">
                                        {config.floatingPoints.map((point) => (
                                            <span
                                                key={point}
                                                className="block text-xs sm:text-sm font-sans tracking-wide text-slate-700/90 font-medium"
                                            >
                                                {point}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Top Row: Number on left + Status Badge / Compare on right */}
                                <div
                                    className={`relative z-10 flex items-start justify-between gap-4 ${
                                        config.isInverted ? 'flex-row-reverse sm:flex-row-reverse' : ''
                                    }`}
                                >
                                    <span
                                        className={`text-xs font-mono tracking-widest ${
                                            config.isDark ? 'text-slate-400' : 'text-slate-500'
                                        }`}
                                    >
                                        {config.num}
                                    </span>

                                    <div className="flex items-center gap-2.5">
                                        {/* Subtle Rental/Pricing Pill Badge */}
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-medium backdrop-blur-sm ${
                                                config.isDark
                                                    ? 'border border-white/20 text-slate-300'
                                                    : 'border border-slate-300/80 text-slate-600'
                                            }`}
                                        >
                                            {config.badgeText}
                                        </span>

                                        {/* Compare button on hover */}
                                        {tech && (
                                            <button
                                                type="button"
                                                onClick={(e) => toggleCompare(tech.id, e)}
                                                aria-label={`Compare ${tech.name}`}
                                                className={`opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-medium ${
                                                    isCompared
                                                        ? 'bg-cyan-400 text-slate-950 font-bold opacity-100 shadow-xs'
                                                        : config.isDark
                                                        ? 'border border-white/20 text-slate-300 hover:text-white hover:border-white/40'
                                                        : 'border border-slate-300 text-slate-600 hover:text-slate-950 hover:border-slate-400'
                                                }`}
                                            >
                                                <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Center / Main Body Column */}
                                <div
                                    className={`relative z-10 max-w-sm my-auto py-8 ${
                                        config.isInverted ? 'lg:ml-auto lg:mr-0 text-left' : ''
                                    }`}
                                >
                                    {/* Editorial Heading with accessible name */}
                                    <h2
                                        aria-label={tech ? tech.name : config.title}
                                        className={`text-3xl sm:text-4xl lg:text-[42px] font-light tracking-tight leading-[1.08] font-serif ${
                                            config.isDark ? 'text-white' : 'text-slate-900'
                                        }`}
                                        style={{ fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif' }}
                                    >
                                        {config.title}
                                    </h2>

                                    {/* Modality Subtitle */}
                                    <p
                                        className={`text-xs sm:text-sm font-sans tracking-wide mt-1.5 ${
                                            config.isDark ? 'text-slate-300' : 'text-slate-600'
                                        }`}
                                    >
                                        {config.modalitySubtitle}
                                    </p>

                                    {/* Clinical / Benefit Description */}
                                    <p
                                        className={`mt-4 text-xs sm:text-[13px] leading-relaxed max-w-xs ${
                                            config.isDark ? 'text-slate-300/80' : 'text-slate-600'
                                        }`}
                                    >
                                        {config.description}
                                    </p>

                                    {/* Commercial Maturity Guard: Hidden from visual UI to preserve mockup parity, accessible for test */}
                                    {tech && !isConfirmedCommercial && (
                                        <span className="sr-only">Request / verify</span>
                                    )}

                                    {/* Action Link or Ecosystem Button */}
                                    {config.isEcosystem ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                scrollToCatalog();
                                            }}
                                            className="mt-6 inline-flex items-center gap-2 bg-slate-950 text-white rounded-full px-6 py-2.5 text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                                        >
                                            <span>Explore All Systems →</span>
                                        </button>
                                    ) : tech ? (
                                        <Link
                                            href={getProductHref(tech.id)}
                                            prefetch={false}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(tech);
                                            }}
                                            className={`mt-6 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase transition-colors group-hover:underline ${
                                                config.isDark
                                                    ? 'text-white hover:text-cyan-300'
                                                    : 'text-slate-900 hover:text-slate-600'
                                            }`}
                                        >
                                            <span>{config.exploreLabel}</span>
                                        </Link>
                                    ) : null}
                                </div>

                                {/* Bottom Row: Benefit Micro-Badges */}
                                <div
                                    className={`relative z-10 flex items-center gap-4 sm:gap-6 flex-wrap ${
                                        config.isInverted ? 'lg:ml-auto lg:mr-0' : ''
                                    }`}
                                >
                                    {config.pills.map((pill, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-1.5 text-[11px] font-medium ${
                                                config.isDark ? 'text-slate-400' : 'text-slate-600'
                                            }`}
                                        >
                                            <span className="opacity-70">{pill.icon}</span>
                                            <span>{pill.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* STICKY BOTTOM COMPARISON DRAWER */}
            <AnimatePresence>
                {comparedTechIds.length > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-6 inset-x-4 max-w-3xl mx-auto z-50 bg-slate-950/95 text-white backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                                {comparedTechIds.length} / 4 Selected
                            </span>
                            <div className="flex items-center gap-2">
                                {comparedTechIds.map((id) => (
                                    <span
                                        key={id}
                                        className="px-2.5 py-1 rounded-md bg-white/[0.08] border border-white/10 text-[10px] font-mono font-bold text-slate-200"
                                    >
                                        {id}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setComparedTechIds([])}
                                className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCompareModalOpen(true)}
                                className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 cursor-pointer"
                            >
                                Compare Systems
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SIDE-BY-SIDE COMPARISON MODAL */}
            <AnimatePresence>
                {isCompareModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
                        onClick={() => setIsCompareModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-950/95 rounded-[2rem] max-w-5xl w-full p-6 sm:p-8 max-h-[88vh] overflow-y-auto shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] border border-white/15 text-white relative"
                        >
                            {/* Specular top edge highlight */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

                            <div className="flex items-start justify-between pb-6 border-b border-white/10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                        <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400 uppercase font-semibold">
                                            Telemetry &amp; Specifications
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-1" style={{ fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif' }}>
                                        Cross-System Comparison
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 font-light">
                                        Compare biological mechanisms, delivery vectors, and specifications across selected systems.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCompareModalOpen(false)}
                                    aria-label="Close comparison modal"
                                    className="p-2.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className={`grid gap-4 sm:gap-6 mt-6 ${
                                comparedTechIds.length === 1
                                    ? 'grid-cols-1 max-w-md mx-auto'
                                    : comparedTechIds.length === 2
                                    ? 'grid-cols-1 sm:grid-cols-2'
                                    : comparedTechIds.length === 3
                                    ? 'grid-cols-1 sm:grid-cols-3'
                                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                            }`}>
                                {comparedTechIds.map((id) => {
                                    const tech = techById.get(id);
                                    const config = EDITORIAL_CATALOG[id];
                                    if (!tech) return null;
                                    return (
                                        <div
                                            key={id}
                                            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between hover:border-cyan-400/40 transition-colors shadow-lg"
                                        >
                                            <div>
                                                {/* Header image if config exists */}
                                                {config && (
                                                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-4 bg-slate-950 border border-white/10">
                                                        <Image
                                                            src={config.imageSrc}
                                                            alt={config.imageAlt}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 640px) 100vw, 25vw"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-xs text-[9px] font-mono font-bold text-cyan-300 border border-cyan-400/30">
                                                            {config.num} // {tech.id}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-baseline justify-between gap-2">
                                                    <h4 className="font-serif text-xl text-white tracking-tight" style={{ fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif' }}>
                                                        {tech.name}
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setComparedTechIds((prev) => prev.filter((x) => x !== id))}
                                                        className="text-[10px] font-mono uppercase text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                                        aria-label={`Remove ${tech.name} from comparison`}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                {config?.modalitySubtitle && (
                                                    <p className="text-[11px] font-mono text-cyan-400/90 mt-1 uppercase tracking-wider">
                                                        {config.modalitySubtitle}
                                                    </p>
                                                )}

                                                <p className="text-xs text-slate-300 mt-3 leading-relaxed break-words font-light">
                                                    {tech.plainDescription || tech.descriptionStandard}
                                                </p>

                                                {/* Modality benefit pills */}
                                                {config?.pills && config.pills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/10">
                                                        {config.pills.map((pill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] text-slate-300 font-medium"
                                                            >
                                                                <span className="opacity-70">{pill.icon}</span>
                                                                <span>{pill.label}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-white/10">
                                                <Link
                                                    href={getProductHref(tech.id)}
                                                    onClick={() => setIsCompareModalOpen(false)}
                                                    className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold tracking-wider uppercase transition-colors shadow-sm"
                                                >
                                                    <span>View System</span>
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

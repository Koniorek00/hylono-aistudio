import React from 'react';
import { TechType } from '@/types';
import {
    Wind,
    Sun,
    Droplets,
    Activity,
    Users,
    Maximize2,
} from 'lucide-react';
import {
    HYDROGEN_PREMIUM_PUBLIC_PRICE_LABEL,
    type HydrogenPremiumLineId,
    type HydrogenPremiumPageRecord,
    type HydrogenPremiumSlug,
} from '@/content/hydrogen-premium-2026';

export const TECH_CONFIG: {
    type: TechType;
    title: string;
    tagline: string;
    icon: React.ReactNode;
    iconBg: string;
}[] = [
    {
        type: TechType.HBOT,
        title: 'HBOT',
        tagline: 'Bio-Available Oxygen & Pressure',
        icon: <Wind size={28} />,
        iconBg: 'bg-cyan-500',
    },
    {
        type: TechType.PEMF,
        title: 'PEMF',
        tagline: 'Pulsed Electromagnetic Field Therapy',
        icon: <Activity size={28} />,
        iconBg: 'bg-purple-500',
    },
    {
        type: TechType.RLT,
        title: 'Red Light',
        tagline: 'Photobiomodulation Therapy',
        icon: <Sun size={28} />,
        iconBg: 'bg-red-500',
    },
    {
        type: TechType.HYDROGEN,
        title: 'Hydrogen',
        tagline: 'Molecular Hydrogen Delivery Systems',
        icon: <Droplets size={28} />,
        iconBg: 'bg-sky-500',
    },
];

export const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    monoplace: { label: 'Monoplace', icon: <Maximize2 size={14} /> },
    multiplace: { label: 'Multiplace', icon: <Users size={14} /> },
    soft: { label: 'Soft Chamber', icon: <Wind size={14} /> },
};

export const selectorPanelClassName =
    'overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white shadow-sm backdrop-blur-md';

export const selectorGroupClassName = 'border-b border-[var(--border-soft)] last:border-0';
export const selectorHeaderClassName =
    'w-full flex items-center justify-between px-5 py-4 text-left text-slate-700 transition-colors hover:bg-cyan-50';
export const selectorExpandedPanelClassName = 'overflow-hidden bg-[var(--surface-page)]';
export const selectorOptionBaseClassName =
    'w-full flex items-start gap-3 px-4 py-3 rounded-lg text-left border transition-all';
export const selectorOptionSelectedClassName = 'border-cyan-500/35 bg-cyan-50 text-slate-950';
export const selectorOptionIdleClassName =
    'border-[var(--border-soft)] bg-white text-slate-700 hover:border-cyan-500/30 hover:bg-cyan-50';
export const TECH_HERO_SELECTOR_STATUS_ID = 'tech-hero-selector-action-status';
export const TECH_HERO_SELECTOR_STATUS_LABEL = 'Tech hero selector action status';
export const DEFAULT_TECH_HERO_SELECTOR_STATUS = 'Product hero selector controls are ready.';
export const TECH_HERO_ROUTE_ACTION_STATUS_ID = 'tech-hero-route-action-status';
export const TECH_HERO_ROUTE_ACTION_STATUS_LABEL = 'Product hero next-step status';
export const DEFAULT_TECH_HERO_ROUTE_ACTION_STATUS = 'Product hero next-step actions are ready.';

export const heroFlowPanelClassName =
    'relative min-h-28 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white/85 p-4 shadow-sm backdrop-blur-md';
export const heroSnapshotPanelClassName =
    'overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white/90 text-slate-950 shadow-sm backdrop-blur-xl';
export const heroSnapshotKickerClassName =
    'text-[11px] font-black uppercase tracking-widest text-slate-600';
export const primaryHeroCtaClassName =
    'flex-1 px-8 py-4 rounded-lg border border-cyan-500/30 bg-cyan-700 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:border-cyan-500 hover:bg-cyan-800 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500';
export const secondaryHeroCtaClassName =
    'flex-1 px-8 py-4 rounded-lg border border-[var(--border-soft)] bg-white text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:border-cyan-500/30 hover:bg-cyan-50 active:scale-[0.98] backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500';
export const supportHeroLinkClassName =
    'flex min-h-11 items-center gap-2 rounded-lg text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500';

export const getChamberTypeAccentClassName = (type: string) => {
    if (type === 'monoplace') return 'border border-blue-300/20 bg-blue-300/10 text-blue-100';
    if (type === 'multiplace') return 'border border-violet-300/20 bg-violet-300/10 text-violet-100';
    return 'border border-teal-300/20 bg-teal-300/10 text-teal-100';
};

export const HYDROGEN_LINE_ORDER: HydrogenPremiumLineId[] = ['personal', 'intensive', 'advanced', 'water'];
export const DEFAULT_HYDROGEN_PAGE_SLUG: HydrogenPremiumSlug = 'os-ho450-p';

export const getHydrogenPriceRangeLabel = (_page: HydrogenPremiumPageRecord) =>
    HYDROGEN_PREMIUM_PUBLIC_PRICE_LABEL;

export const getHydrogenDeliveryLabel = (page: HydrogenPremiumPageRecord) => {
    if (page.lineId === 'water') return 'Hydrogen water option';
    if (page.slug.includes('-p-') || page.slug.endsWith('-p')) return 'Pulse-controlled H2 + O2';
    if (page.variants.some((variant) => Boolean(variant.oxygen))) return 'Continuous H2 + O2';
    return 'Pure hydrogen inhalation';
};

export const getHydrogenOutputSummary = (page: HydrogenPremiumPageRecord, lineRangeLabel: string) => {
    if (page.variants.length === 1) {
        const variant = page.variants[0];
        if (!variant) return lineRangeLabel;
        return variant.oxygen
            ? `${variant.hydrogen} H2 + ${variant.oxygen} O2`
            : `${variant.hydrogen} H2`;
    }
    return lineRangeLabel;
};

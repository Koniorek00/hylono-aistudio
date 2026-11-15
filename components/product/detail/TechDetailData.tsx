import React from 'react';
import { TechType } from '@/types';
import {
    Wind, Activity, Sun, Droplets, Flame, Thermometer, Zap, Radio, Mountain, Snowflake
} from 'lucide-react';
import { ALL_CHAMBERS } from '@/constants/chambers';
import { type ProductDetailAnalyticsInput } from '@/src/lib/product-detail-analytics';
import { priceBookText } from '@/lib/money';

export type PurchaseTrack = 'purchase' | 'rental';
export type ProductDetailActionExtra = Partial<Pick<ProductDetailAnalyticsInput,
    | 'chamberSlug'
    | 'compareCount'
    | 'destinationPath'
    | 'isExpanded'
    | 'isSelected'
    | 'loanTermMonths'
    | 'rentalPeriod'
    | 'resourceType'
    | 'routeVariant'
    | 'selectedAddonCount'
    | 'selectedTrack'
    | 'viewMode'
>>;

export const TECH_ICONS: Record<TechType, React.ReactNode> = {
    [TechType.HBOT]: <Wind size={32} />,
    [TechType.PEMF]: <Activity size={32} />,
    [TechType.RLT]: <Sun size={32} />,
    [TechType.HYDROGEN]: <Droplets size={32} />,
    [TechType.EWOT]: <Flame size={32} />,
    [TechType.SAUNA_BLANKET]: <Thermometer size={32} />,
    [TechType.EMS]: <Zap size={32} />,
    [TechType.VNS]: <Radio size={32} />,
    [TechType.HYPOXIC]: <Mountain size={32} />,
    [TechType.CRYO]: <Snowflake size={32} />,
};

export const TECH_GRADIENTS: Record<TechType, string> = {
    [TechType.HBOT]: "from-cyan-500/10 via-blue-500/5 to-white",
    [TechType.PEMF]: "from-purple-500/10 via-fuchsia-500/5 to-white",
    [TechType.RLT]: "from-red-500/10 via-orange-500/5 to-white",
    [TechType.HYDROGEN]: "from-sky-500/10 via-teal-500/5 to-white",
    [TechType.EWOT]: "from-orange-500/10 via-amber-500/5 to-white",
    [TechType.SAUNA_BLANKET]: "from-amber-500/10 via-yellow-500/5 to-white",
    [TechType.EMS]: "from-violet-500/10 via-purple-500/5 to-white",
    [TechType.VNS]: "from-teal-500/10 via-emerald-500/5 to-white",
    [TechType.HYPOXIC]: "from-indigo-500/10 via-blue-500/5 to-white",
    [TechType.CRYO]: "from-sky-300/10 via-blue-300/5 to-white",
};

export const CART_ITEM_GRADIENTS: Record<TechType, string> = {
    [TechType.HBOT]: 'from-cyan-500 to-blue-500',
    [TechType.PEMF]: 'from-purple-500 to-fuchsia-500',
    [TechType.RLT]: 'from-red-500 to-orange-500',
    [TechType.HYDROGEN]: 'from-sky-500 to-teal-500',
    [TechType.EWOT]: 'from-orange-500 to-amber-500',
    [TechType.SAUNA_BLANKET]: 'from-amber-500 to-yellow-500',
    [TechType.EMS]: 'from-violet-500 to-purple-500',
    [TechType.VNS]: 'from-teal-500 to-emerald-500',
    [TechType.HYPOXIC]: 'from-indigo-500 to-blue-500',
    [TechType.CRYO]: 'from-sky-400 to-blue-400',
};

export const HBOT_DEFAULT_CHAMBER_SLUG = 'oxylife-i-90';
export const PDP_CART_STATUS_ID = 'pdp-cart-status';
export const PDP_CART_STATUS_LABEL = 'Product cart action status';
export const PDP_TRACK_STATUS_ID = 'pdp-track-status';
export const PDP_TRACK_STATUS_LABEL = 'Product detail track status';
export const PDP_DETAIL_ACTION_STATUS_ID = 'pdp-detail-action-status';
export const PDP_DETAIL_ACTION_STATUS_LABEL = 'Product detail action status';

export const TECH_TO_CONTENT_PRODUCT_ID: Partial<Record<TechType, string>> = {
    [TechType.HBOT]: 'hbot-st1700',
    [TechType.HYDROGEN]: 'h2-hop450',
};

export const FALLBACK_INSTALLMENT_MONTHS = [12, 24, 36, 48] as const;

// Was an exported Intl formatter hardcoded to EUR at en-IE, shared across the
// TechDetail surface while the price book is denominated in PLN. Delegates to the
// single money source; renamed because a helper called formatPrice that renders
// zloty is the next reader's bug.
export const formatPrice = (value: number): string => priceBookText(value);

export const parseNumericAmount = (value: string | undefined): number => {
    if (!value) return 0;
    const normalized = Number(value.replace(/[^0-9]/g, ''));
    return Number.isFinite(normalized) ? normalized : 0;
};

export const parsePeriodToMonths = (period: string): number => {
    const match = period.match(/(\d+)/);
    if (!match) return 1;
    const numeric = Number(match[1]);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
};

export const getSafeHbotChamberKey = (chamberIdOrSlug?: string | null): string | undefined => {
    if (!chamberIdOrSlug) return undefined;

    const chamberIndex = ALL_CHAMBERS.findIndex(
        (chamber: { id: string; slug: string }) => chamber.id === chamberIdOrSlug || chamber.slug === chamberIdOrSlug
    );

    if (chamberIndex < 0) return undefined;
    return `hbot_chamber_${chamberIndex + 1}`;
};

/**
 * Renders a chamber description written as plain text with `**bold**` headings and
 * `- ` bullet lines.
 *
 * The bullets used to be emitted as BARE `<li>` elements into a flat array with no
 * `<ul>` anywhere, so each one landed directly inside whatever container rendered the
 * description. That is what axe reports as `listitem` (4 serious nodes on
 * /product/hbot): an `<li>` outside a list is not announced as part of a list, so a
 * screen-reader user loses "list, 4 items" and hears four unrelated fragments.
 *
 * Consecutive bullet lines are therefore buffered and flushed into ONE `<ul>`. A blank
 * line, a heading or a paragraph flushes the buffer, which means two bullet groups
 * separated by prose stay two lists - that is the correct grouping, not a workaround.
 *
 * Used by components/TechDetail.tsx and other product surfaces,
 * so this fixes the semantics on both product surfaces.
 */
export function renderChamberDescription(text: string): React.ReactNode {
    const nodes: React.ReactNode[] = [];
    let bulletBuffer: React.ReactNode[] = [];

    const flushBullets = (): void => {
        if (bulletBuffer.length === 0) return;
        // list-none because the bullet glyph is drawn by hand below; without it the
        // browser would add a second marker beside the existing one.
        nodes.push(
            <ul key={`ul-${nodes.length}`} className="list-none">
                {bulletBuffer}
            </ul>
        );
        bulletBuffer = [];
    };

    text.split('\n').forEach((line, i) => {
        if (line.trim() === '') {
            flushBullets();
            nodes.push(<br key={`br-${i}`} />);
            return;
        }

        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((part, j) => (j % 2 === 1 ? <strong key={`${i}-${j}`}>{part}</strong> : part));

        if (line.startsWith('**') && line.endsWith('**')) {
            flushBullets();
            nodes.push(
                <h4 key={`h-${i}`} className="mt-5 mb-2 text-base font-bold text-[var(--pdp-title,#ffffff)]">
                    {parts[1]}
                </h4>
            );
            return;
        }

        if (line.startsWith('- ')) {
            bulletBuffer.push(
                <li key={`li-${i}`} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--pdp-body,#cbd5e1)]">
                    {/* Decorative: the list itself now carries the "this is an item"
                        meaning, so the glyph would be duplicate noise to a reader. */}
                    <span className="mt-1 shrink-0 text-[var(--pdp-accent,#67e8f9)]" aria-hidden="true">•</span>
                    <span>{rendered}</span>
                </li>
            );
            return;
        }

        flushBullets();
        nodes.push(
            <p key={`p-${i}`} className="mb-2 text-sm leading-relaxed text-[var(--pdp-body,#cbd5e1)]">
                {rendered}
            </p>
        );
    });

    flushBullets();
    return nodes;
}

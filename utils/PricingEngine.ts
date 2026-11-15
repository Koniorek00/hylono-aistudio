import { TechType } from '../types';
import { getProductForRouteSlug } from '../content/products';
import { priceBookMonthlyText } from '../lib/money';

const getCanonicalRentalProduct = (techId: TechType) =>
    getProductForRouteSlug(techId.toLowerCase());

export const isCanonicalRentalTech = (techId: TechType): boolean =>
    Boolean(getCanonicalRentalProduct(techId)?.rentalPlans?.length);

export const getCanonicalRentalPrice = (techId: TechType): number => {
    const rentalPlans = getCanonicalRentalProduct(techId)?.rentalPlans ?? [];
    return rentalPlans.length > 0 ? Math.min(...rentalPlans.map((plan) => plan.monthlyPrice)) : 0;
};

export interface PricingResult {
    total: number;
    discount: number;
    finalTotal: number;
    tier: string;
    bundleName: string;
    savingsMessage: string;
    requiresManualQuote: boolean;
}

export const calculateRentalTotal = (selectedTechs: TechType[]): PricingResult => {
    if (selectedTechs.length === 0) {
        return {
            total: 0,
            discount: 0,
            finalTotal: 0,
            tier: 'Standard',
            bundleName: '',
            savingsMessage: 'Add 2+ devices to request a combined pricing review',
            requiresManualQuote: false,
        };
    }

    const requiresManualQuote = selectedTechs.some((techId) => !isCanonicalRentalTech(techId));
    const totalMonthly = selectedTechs.reduce(
        (total, techId) => total + getCanonicalRentalPrice(techId),
        0
    );

    let discountRate = 0;
    let tierName = 'Standard';
    let bundleName = '';

    // Bundle Logic
    if (requiresManualQuote) {
        tierName = 'Manual review';
        bundleName = 'Manual review bundle';
    } else if (selectedTechs.length === 2) {
        discountRate = 0.15;
        tierName = 'Synergy Bundle';
        bundleName = 'Synergy Bundle';
    } else if (selectedTechs.length === 3) {
        discountRate = 0.20;
        tierName = 'Performance Stack';
        bundleName = 'Performance Stack';
    } else if (selectedTechs.length >= 4) {
        discountRate = 0.25;
        tierName = 'Clinic Protocol';
        bundleName = 'Clinic Protocol';
    }

    const discountAmount = totalMonthly * discountRate;
    const finalTotal = totalMonthly - discountAmount;

    const savingsMessage = requiresManualQuote
        ? 'Manual product and rental verification is required before final pricing.'
        : discountAmount > 0
          ? `Combined pricing note: ${priceBookMonthlyText(Math.round(discountAmount))} adjustment shown before request`
          : 'Add 2+ devices to request a combined pricing review';

    return {
        total: totalMonthly,
        discount: discountAmount,
        finalTotal: finalTotal,
        tier: tierName,
        bundleName,
        savingsMessage,
        requiresManualQuote,
    };
};

/** Pre-configured goal bundles for the wizard Step 1 */
export interface GoalBundle {
    id: string;
    label: string;
    icon: string;
    subtitle: string;
    devices: TechType[];
}

export const GOAL_BUNDLES: GoalBundle[] = [
    {
        id: 'sleep',
        label: 'Sleep and recovery planning',
        icon: '😴',
        subtitle: 'Compare rest and recovery-support devices',
        devices: [TechType.PEMF, TechType.VNS, TechType.SAUNA_BLANKET],
    },
    {
        id: 'performance',
        label: 'Performance routine planning',
        icon: '⚡',
        subtitle: 'Compare oxygen and conditioning support devices',
        devices: [TechType.HBOT, TechType.EWOT, TechType.HYPOXIC],
    },
    {
        id: 'cognitive',
        label: 'Focus routine planning',
        icon: '🧠',
        subtitle: 'Compare calm workflow and daytime routine support',
        devices: [TechType.HYDROGEN, TechType.VNS, TechType.PEMF],
    },
    {
        id: 'pain',
        label: 'Comfort planning',
        icon: '🔥',
        subtitle: 'Compare comfort-support devices without outcome promises',
        devices: [TechType.CRYO, TechType.PEMF, TechType.RLT],
    },
    {
        id: 'longevity',
        label: 'Skin and longevity planning',
        icon: '✨',
        subtitle: 'Compare light, heat, and hydrogen access paths',
        devices: [TechType.RLT, TechType.SAUNA_BLANKET, TechType.HYDROGEN],
    },
    {
        id: 'strength',
        label: 'Strength routine planning',
        icon: '💪',
        subtitle: 'Compare active-session devices and support needs',
        devices: [TechType.EMS, TechType.HBOT, TechType.RLT],
    },
];

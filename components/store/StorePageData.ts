import React from 'react';
import { Truck, CheckCircle, ShieldCheck, MessageCircle, Wind, Activity, Sun, Droplets } from 'lucide-react';
import { TechType } from '@/types';

export const TECH_ICONS: Partial<Record<TechType, React.ReactNode>> = {
    [TechType.HBOT]: React.createElement(Wind, { size: 28 }),
    [TechType.PEMF]: React.createElement(Activity, { size: 28 }),
    [TechType.RLT]: React.createElement(Sun, { size: 28 }),
    [TechType.HYDROGEN]: React.createElement(Droplets, { size: 28 }),
};

export const STORE_POLICY_CONTEXT = [
    {
        href: '/shipping',
        label: 'Shipping planning',
        description: 'Review delivery scope before comparing devices.',
        Icon: Truck,
    },
    {
        href: '/returns',
        label: 'Returns guidance',
        description: 'Check the return path before committing.',
        Icon: CheckCircle,
    },
    {
        href: '/warranty',
        label: 'Warranty guidance',
        description: 'Confirm coverage and support boundaries.',
        Icon: ShieldCheck,
    },
    {
        href: '/financing',
        label: 'Financing context',
        description: 'Review financing options; terms are confirmed before commitment.',
        Icon: MessageCircle,
    },
] as const;

export const STORE_DECISION_MATRIX = [
    {
        path: 'Guided fit',
        useWhen: 'You are comparing goals, space, budget range, and modality before opening products.',
        check: 'Shortlist logic, confidence notes, and human-review triggers.',
        href: '/wellness-planner',
        action: 'Open planner',
    },
    {
        path: 'Rental',
        useWhen: 'You want to test routine fit, setup needs, and support expectations before ownership.',
        check: 'Rental access, onboarding context, deposit timing, and delivery details.',
        href: '/rental',
        action: 'Compare rental',
    },
    {
        path: 'Ownership',
        useWhen: 'You are ready to compare device scope, technical fit, and long-term support path.',
        check: 'Product detail, policy pages, financing context, and contact handoff.',
        href: '#store-products',
        action: 'Review products',
    },
] as const;

export const STORE_ECONOMICS_CHECKPOINTS = [
    {
        label: 'Rent first',
        fit: 'Use when routine fit, space, support load, or stakeholder confidence needs a shorter planning step.',
        review: 'Confirm deposit timing, delivery scope, handover needs, and what would trigger an ownership discussion.',
    },
    {
        label: 'Buy after review',
        fit: 'Use when the device category, setup location, and longer-term support path are already clear.',
        review: 'Check product detail, warranty, returns, financing context, and final quote review before commitment.',
    },
    {
        label: 'Ask before comparing',
        fit: 'Use when budget, delivery, installation, clinic use, or payment timing changes the path.',
        review: 'Move to contact or planner instead of treating catalog ranges as a final economic recommendation.',
    },
] as const;

export const STORE_TRUST_CHECKPOINTS = [
    {
        label: 'Coverage before checkout',
        proof: 'Warranty and returns pages are the first source for coverage, return-path, and support-boundary review.',
        href: '/warranty',
        action: 'Review warranty',
    },
    {
        label: 'Support before ownership',
        proof: 'Use help and contact paths when delivery, setup, clinic use, or device handoff needs manual narrowing.',
        href: '/help',
        action: 'Open help',
    },
    {
        label: 'Terms before payment',
        proof: 'Final quote, payment timing, financing context, and logistics details are confirmed before commitment.',
        href: '/contact',
        action: 'Ask before buying',
    },
] as const;

export const STORE_PROOF_REVIEW_CHECKPOINTS = [
    {
        label: 'Evidence before outcome claims',
        proof: 'Use the research hub to compare what is cited, what is exploratory, and what still needs human review before acting.',
        href: '/research',
        action: 'Review evidence',
    },
    {
        label: 'Process notes before social proof',
        proof: 'The reviews page currently publishes process-note boundaries, not star ratings, buyer testimonials, or named media proof.',
        href: '/reviews',
        action: 'Open feedback notes',
    },
    {
        label: 'Support boundaries before ownership',
        proof: 'Use help and warranty context to understand support, setup, and policy handoffs before considering a device verified for your use case.',
        href: '/help',
        action: 'Open support boundaries',
    },
] as const;

export const STORE_ROUTE_ACTION_STATUS_ID = 'store-route-action-status';
export const STORE_ROUTE_ACTION_STATUS_LABEL = 'Store route action status';
export const STORE_ROUTE_ACTION_READY_STATUS =
    'Store route handoffs are ready. Choose planner, rental, or contact when the buying path needs narrowing.';

export type StoreRouteActionSource = 'hero' | 'decision_matrix' | 'policy_context' | 'trust_checkpoint' | 'proof_review';

export const getStoreRouteActionStatusMessage = (destination: string): string => {
    if (destination === '/wellness-planner') {
        return 'Opening wellness planner from the store route.';
    }

    if (destination === '/rental') {
        return 'Opening rental from the store route.';
    }

    if (destination === '/contact') {
        return 'Opening Hylono contact from the store route.';
    }

    if (destination === '/shipping') {
        return 'Opening shipping planning from the store route.';
    }

    if (destination === '/returns') {
        return 'Opening returns guidance from the store route.';
    }

    if (destination === '/warranty') {
        return 'Opening warranty guidance from the store route.';
    }

    if (destination === '/financing') {
        return 'Opening financing context from the store route.';
    }

    if (destination === '/help') {
        return 'Opening help from the store route.';
    }

    if (destination === '/research') {
        return 'Opening research from the store route.';
    }

    if (destination === '/reviews') {
        return 'Opening feedback notes from the store route.';
    }

    if (destination === '#store-products') {
        return 'Moving to store products from the store decision matrix.';
    }

    return 'Opening store route handoff.';
};

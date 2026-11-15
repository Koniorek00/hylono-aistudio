'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TechType } from '../types';
import { priceBookMonthlyText, priceBookText } from '../lib/money';
import { TECH_DETAILS } from '../constants';
import { calculateRentalTotal, getCanonicalRentalPrice, isCanonicalRentalTech, GOAL_BUNDLES, GoalBundle } from '../utils/PricingEngine';
import {
    getPublicProductRouteBenefits,
    getPublicProductRouteDescription,
    getPublicProductRouteSynergy,
    getTechRouteSlug,
} from '../lib/product-routes';
import {
    Check, Plus, X, ArrowRight, ArrowLeft, ShoppingBag,
    Zap, Shield, PhoneCall, RotateCcw, ChevronDown, ChevronUp,
    Sparkles
} from 'lucide-react';

// ─── Color map — Tailwind-safe classes per tech ──────────────────────────────
const TECH_COLORS: Record<TechType, { bg: string; border: string; text: string; badge: string; dot: string }> = {
    [TechType.HBOT]: {
        bg: 'bg-cyan-300/[0.10]', border: 'border-cyan-300/25', text: 'text-cyan-100',
        badge: 'border border-cyan-300/20 bg-cyan-300/[0.12] text-cyan-100', dot: 'bg-cyan-300',
    },
    [TechType.PEMF]: {
        bg: 'bg-fuchsia-300/[0.10]', border: 'border-fuchsia-300/25', text: 'text-fuchsia-100',
        badge: 'border border-fuchsia-300/20 bg-fuchsia-300/[0.12] text-fuchsia-100', dot: 'bg-fuchsia-300',
    },
    [TechType.RLT]: {
        bg: 'bg-rose-300/[0.10]', border: 'border-rose-300/25', text: 'text-rose-100',
        badge: 'border border-rose-300/20 bg-rose-300/[0.12] text-rose-100', dot: 'bg-rose-300',
    },
    [TechType.HYDROGEN]: {
        bg: 'bg-sky-300/[0.10]', border: 'border-sky-300/25', text: 'text-sky-100',
        badge: 'border border-sky-300/20 bg-sky-300/[0.12] text-sky-100', dot: 'bg-sky-300',
    },
    [TechType.EWOT]: {
        bg: 'bg-amber-300/[0.10]', border: 'border-amber-300/25', text: 'text-amber-100',
        badge: 'border border-amber-300/20 bg-amber-300/[0.12] text-amber-100', dot: 'bg-amber-300',
    },
    [TechType.SAUNA_BLANKET]: {
        bg: 'bg-orange-300/[0.10]', border: 'border-orange-300/25', text: 'text-orange-100',
        badge: 'border border-orange-300/20 bg-orange-300/[0.12] text-orange-100', dot: 'bg-orange-300',
    },
    [TechType.EMS]: {
        bg: 'bg-violet-300/[0.10]', border: 'border-violet-300/25', text: 'text-violet-100',
        badge: 'border border-violet-300/20 bg-violet-300/[0.12] text-violet-100', dot: 'bg-violet-300',
    },
    [TechType.VNS]: {
        bg: 'bg-teal-300/[0.10]', border: 'border-teal-300/25', text: 'text-teal-100',
        badge: 'border border-teal-300/20 bg-teal-300/[0.12] text-teal-100', dot: 'bg-teal-300',
    },
    [TechType.HYPOXIC]: {
        bg: 'bg-indigo-300/[0.10]', border: 'border-indigo-300/25', text: 'text-indigo-100',
        badge: 'border border-indigo-300/20 bg-indigo-300/[0.12] text-indigo-100', dot: 'bg-indigo-300',
    },
    [TechType.CRYO]: {
        bg: 'bg-blue-300/[0.10]', border: 'border-blue-300/25', text: 'text-blue-100',
        badge: 'border border-blue-300/20 bg-blue-300/[0.12] text-blue-100', dot: 'bg-blue-300',
    },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface RentalConfiguratorProps {
    onCheckout?: () => void;
    onNavigate?: (path: string) => void;
}

type WizardStep = 'goal' | 'devices' | 'summary';

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS: { id: WizardStep; label: string }[] = [
    { id: 'goal', label: 'Your Goal' },
    { id: 'devices', label: 'Your Devices' },
    { id: 'summary', label: 'Your Bundle' },
];

const RENTAL_GUIDANCE_HREF = '/contact?intent=rental-guidance';
const RENTAL_CONFIGURATOR_ACTION_STATUS_ID = 'rental-configurator-action-status';
const RENTAL_CONFIGURATOR_ACTION_STATUS_LABEL = 'Rental configurator action status';
const RENTAL_CONFIGURATOR_READY_STATUS = 'Rental configurator ready.';

const StepIndicator: React.FC<{ current: WizardStep }> = ({ current }) => {
    const currentIdx = STEPS.findIndex(s => s.id === current);
    return (
        <div className="mb-6 sm:mb-8 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 text-white max-w-lg mx-auto w-full">
            {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                    <div className="flex min-w-0 flex-col items-center gap-1 sm:gap-1.5 shrink-0">
                        <div
                            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 motion-reduce:transition-none
                                ${idx < currentIdx ? 'bg-emerald-300 text-slate-950 ring-1 ring-emerald-300/25' :
                                    idx === currentIdx ? 'bg-cyan-300 text-slate-950 ring-1 ring-cyan-300/35' :
                                        'bg-white/[0.07] text-slate-500 ring-1 ring-white/10'}`}
                        >
                            {idx < currentIdx ? <Check size={14} /> : idx + 1}
                        </div>
                        <span className={`text-[10px] sm:text-[11px] font-medium tracking-wide text-center max-w-[80px] sm:max-w-none whitespace-normal sm:whitespace-nowrap leading-tight
                            ${idx === currentIdx ? 'text-cyan-100 font-semibold' : idx < currentIdx ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {step.label}
                        </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <div className={`mx-1 sm:mx-2 -mt-4 sm:-mt-5 h-0.5 min-w-[16px] sm:min-w-[32px] flex-1 transition-colors duration-300 motion-reduce:transition-none
                            ${idx < currentIdx ? 'bg-emerald-300/60' : 'bg-white/[0.10]'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ─── Goal Card ────────────────────────────────────────────────────────────────
const GoalCard: React.FC<{
    bundle: GoalBundle;
    selected: boolean;
    onClick: () => void;
    actionStatusId: string;
}> = ({ bundle, selected, onClick, actionStatusId }) => (
    <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        aria-pressed={selected}
        aria-describedby={actionStatusId}
        className={`group relative w-full min-w-0 rounded-lg border p-4 sm:p-5 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none
            ${selected
                ? 'border-cyan-300/50 bg-cyan-300/[0.12] ring-1 ring-cyan-300/25'
                : 'border-white/10 bg-white/[0.045] hover:border-cyan-300/35 hover:bg-white/[0.07]'
            }`}
    >
        {selected && (
            <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-cyan-300">
                <Check size={12} className="text-slate-950" />
            </div>
        )}
        <div className="mb-2.5 sm:mb-3 text-2xl sm:text-3xl leading-none" role="img" aria-hidden="true">
            {bundle.icon}
        </div>
        <div className={`mb-1 text-sm sm:text-base font-semibold leading-snug break-words transition-colors
            ${selected ? 'text-white' : 'text-slate-100'}`}>
            {bundle.label}
        </div>
        <div className={`text-xs sm:text-sm leading-relaxed break-words transition-colors
            ${selected ? 'text-cyan-100/80' : 'text-slate-400'}`}>
            {bundle.subtitle}
        </div>
    </motion.button>
);

// ─── Device Card ──────────────────────────────────────────────────────────────
const DeviceCard: React.FC<{
    techId: TechType;
    selected: boolean;
    recommended: boolean;
    onToggle: () => void;
    actionStatusId: string;
    onDetailsToggle: (expanded: boolean) => void;
}> = ({ techId, selected, recommended, onToggle, actionStatusId, onDetailsToggle }) => {
    const tech = TECH_DETAILS[techId];
    const hasCanonicalRentalPrice = isCanonicalRentalTech(techId);
    const routeSlug = getTechRouteSlug(techId);
    const publicDescription = getPublicProductRouteDescription({
        fallbackDescription: tech.plainDescription,
        productName: tech.name,
        slug: routeSlug,
    });
    const publicBenefits = getPublicProductRouteBenefits({
        fallbackBenefits: tech.benefits,
        productName: tech.name,
        slug: routeSlug,
    });
    const colors = TECH_COLORS[techId];
    const [expanded, setExpanded] = useState(false);
    const handleDetailsToggle = () => {
        const nextExpanded = !expanded;
        setExpanded(nextExpanded);
        onDetailsToggle(nextExpanded);
    };

    return (
        <motion.div
            layout
            className={`overflow-hidden rounded-lg border transition-all duration-200 motion-reduce:transition-none
                ${selected
                    ? 'border-cyan-300/50 bg-cyan-300/[0.10] ring-1 ring-cyan-300/25'
                    : `${colors.border} bg-white/[0.045] hover:border-cyan-300/35 hover:bg-white/[0.07]`
                }`}
        >
            <div className={`p-4 ${selected ? 'bg-slate-950/35' : colors.bg}`}>
                {/* Header row */}
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none" role="img" aria-hidden="true">
                            {tech.icon}
                        </span>
                        <div>
                            <div className={`font-semibold text-sm leading-tight
                                ${selected ? 'text-white' : 'text-slate-100'}`}>
                                {tech.friendlyName}
                            </div>
                            {recommended && !selected && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${colors.text}`}>
                                    <Sparkles size={9} />
                                    Recommended
                                </span>
                            )}
                            {selected && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-0.5 text-emerald-400">
                                    <Check size={9} />
                                    Added
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onToggle}
                        aria-label={selected ? `Remove ${tech.friendlyName}` : `Add ${tech.friendlyName}`}
                        aria-describedby={actionStatusId}
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none
                            ${selected
                                ? 'bg-cyan-300 text-slate-950 hover:bg-cyan-200'
                                : `border border-white/10 bg-white/[0.06] ${colors.text} hover:bg-white/[0.10]`
                            }`}
                    >
                        {selected ? <X size={14} /> : <Plus size={14} />}
                    </button>
                </div>

                {/* Description */}
                <p className={`text-sm leading-relaxed mb-3
                    ${selected ? 'text-slate-200' : 'text-slate-300'}`}>
                    {publicDescription}
                </p>

                {/* Price row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                        <span className={`text-lg sm:text-xl font-black ${selected ? 'text-white' : 'text-slate-100'}`}>
                            {hasCanonicalRentalPrice ? priceBookText(getCanonicalRentalPrice(techId)) : 'Request / verify'}
                        </span>
                        {hasCanonicalRentalPrice && (
                            <span className="ml-1 text-xs text-slate-400">
                                /month
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleDetailsToggle}
                        className="flex items-center gap-1 rounded-md text-[11px] font-medium text-slate-400 transition-colors hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none shrink-0"
                        aria-expanded={expanded}
                        aria-label={expanded ? 'Hide details' : 'Learn more'}
                        aria-describedby={actionStatusId}
                    >
                        {expanded ? 'Less' : 'Learn more'}
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                </div>

                {/* Expandable detail */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className={`mt-3 pt-3 border-t ${selected ? 'border-white/10' : colors.border}`}>
                                <div className="flex flex-wrap gap-1.5">
                                    {publicBenefits.slice(0, 4).map(b => (
                                        <span key={b} className={`rounded-lg px-2 py-0.5 text-[11px] font-medium break-words
                                            ${selected ? 'border border-white/10 bg-white/[0.08] text-slate-100' : `${colors.badge}`}`}>
                                            {b}
                                        </span>
                                    ))}
                                </div>
                                {tech.rentalTerms && (
                                    <p className="mt-2 text-[11px] text-slate-400 break-words">
                                        Terms: {tech.rentalTerms}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// ─── Synergy Banner ───────────────────────────────────────────────────────────
const SynergyBanner: React.FC<{ selectedItems: TechType[] }> = ({ selectedItems }) => {
    if (selectedItems.length < 2) return null;

    // Find the best synergy pair among selected items
    let bestSynergy: {
        boost: number;
        description: string;
        label: string;
        sourceId: TechType;
        targetId: TechType;
    } | null = null;
    for (const id of selectedItems) {
        const tech = TECH_DETAILS[id];
        for (const syn of tech.synergies) {
            if (selectedItems.includes(syn.targetId)) {
                if (!bestSynergy || syn.boost > bestSynergy.boost) {
                    bestSynergy = { ...syn, sourceId: id };
                }
            }
        }
    }

    if (!bestSynergy) return null;

    const sourceTech = TECH_DETAILS[bestSynergy.sourceId];
    const targetTech = TECH_DETAILS[bestSynergy.targetId];
    const publicSynergy = getPublicProductRouteSynergy({
        fallbackDescription: bestSynergy.description,
        fallbackLabel: bestSynergy.label,
        sourceName: sourceTech.friendlyName,
        sourceSlug: getTechRouteSlug(bestSynergy.sourceId),
        targetName: targetTech.friendlyName,
        targetSlug: getTechRouteSlug(bestSynergy.targetId),
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-300/25 bg-emerald-300/[0.10] p-3 sm:p-3.5 min-w-0"
        >
            <div className="mt-0.5 flex-shrink-0 text-emerald-300">
                <Zap size={16} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-xs font-bold uppercase tracking-wider text-emerald-100 break-words">
                    {publicSynergy.label} - Bundle planning note
                </div>
                <div className="text-xs leading-relaxed text-emerald-200/80 break-words">
                    {publicSynergy.description}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Pricing Panel ────────────────────────────────────────────────────────────
const PricingPanel: React.FC<{
    selectedItems: TechType[];
    onContinue: () => void;
    continueLabel: string;
    disabled: boolean;
    actionStatusId: string;
}> = ({ selectedItems, onContinue, continueLabel, disabled, actionStatusId }) => {
    const pricing = calculateRentalTotal(selectedItems);

    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:p-5 min-w-0">
            {/* Items list */}
            {selectedItems.length > 0 ? (
                <div className="space-y-2 mb-4">
                    {selectedItems.map(id => {
                        const tech = TECH_DETAILS[id];
                        return (
                            <div key={id} className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base leading-none shrink-0">{tech.icon}</span>
                                    <span className="text-slate-300 truncate">{tech.friendlyName}</span>
                                </div>
                                <span className="font-medium text-slate-100 shrink-0 text-xs sm:text-sm">
                                    {isCanonicalRentalTech(id) ? priceBookMonthlyText(getCanonicalRentalPrice(id)) : 'Request / verify'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="mb-4 py-3 text-center text-sm text-slate-500">
                    Select devices to see pricing
                </p>
            )}

            {selectedItems.length > 0 && (
                <>
                    <div className="mb-4 h-px bg-white/[0.10]" />

                    {/* Subtotal */}
                    <div className="mb-2 flex justify-between gap-2 text-sm text-slate-400">
                        <span>Subtotal</span>
                        <span className="shrink-0 font-medium text-slate-200">{pricing.requiresManualQuote ? 'Request / verify' : priceBookMonthlyText(pricing.total)}</span>
                    </div>

                    {/* Savings */}
                    {pricing.discount > 0 && (
                        <div className="mb-2 flex justify-between gap-2 text-sm font-medium text-emerald-300">
                            <span className="flex items-center gap-1.5 min-w-0">
                                <Zap size={12} className="shrink-0" />
                                <span className="truncate">Combined plan adjustment</span>
                            </span>
                            <span className="shrink-0">−{priceBookMonthlyText(Math.round(pricing.discount))}</span>
                        </div>
                    )}

                    <div className="my-3 h-px bg-white/[0.10]" />

                    {/* Total */}
                    <div className="flex justify-between items-baseline gap-2 mb-1">
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-300 shrink-0">
                            Total
                        </span>
                        <span className={`${pricing.requiresManualQuote ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'} font-black text-white text-right break-words min-w-0`}>
                            {pricing.requiresManualQuote ? 'Request / verify' : priceBookText(Math.round(pricing.finalTotal))}
                        </span>
                    </div>
                    {!pricing.requiresManualQuote && (
                        <div className="mb-4 text-right text-xs text-slate-500">per month</div>
                    )}
                    {pricing.requiresManualQuote && (
                        <div className="mb-4 rounded-md border border-amber-300/25 bg-amber-300/[0.10] p-2.5 text-center break-words">
                            <p className="text-xs font-semibold text-amber-100">{pricing.savingsMessage}</p>
                            <p className="mt-0.5 text-[11px] text-amber-200/80">{pricing.bundleName}</p>
                        </div>
                    )}

                    {/* Savings badge */}
                    {pricing.discount > 0 && (
                        <div className="mb-4 rounded-md border border-emerald-300/25 bg-emerald-300/[0.10] p-2.5 text-center break-words">
                            <p className="text-xs font-semibold text-emerald-100">
                                {pricing.savingsMessage}
                            </p>
                            <p className="mt-0.5 text-[11px] text-emerald-200/80">{pricing.bundleName}</p>
                        </div>
                    )}

                    {/* Hint for more savings */}
                    {selectedItems.length === 1 && (
                        <p className="mb-4 text-center text-xs text-slate-400">
                            Add one more device to request a combined pricing review
                        </p>
                    )}
                </>
            )}

            <button
                onClick={onContinue}
                disabled={disabled}
                aria-describedby={actionStatusId}
                className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-bold uppercase tracking-widest transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none
                    ${!disabled
                        ? 'bg-cyan-300 text-slate-950 ring-1 ring-cyan-300/25 hover:bg-cyan-200'
                        : 'cursor-not-allowed border border-white/10 bg-white/[0.06] text-slate-500'
                    }`}
            >
                {continueLabel}
                {!disabled && <ArrowRight size={15} />}
            </button>
        </div>
    );
};

// ─── Trust Signals ────────────────────────────────────────────────────────────
const TrustSignals: React.FC = () => (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
        {[
            { icon: <RotateCcw size={16} />, label: 'Minimum terms', sub: 'Shown before checkout' },
            { icon: <PhoneCall size={16} />, label: 'Setup planning', sub: 'Contact handoff' },
            { icon: <Shield size={16} />, label: 'Policy review', sub: 'Warranty and returns' },
        ].map(({ icon, label, sub }) => (
            <div key={label} className="flex flex-row items-center sm:flex-col lg:flex-row gap-2.5 rounded-lg border border-white/10 bg-white/[0.045] p-2.5 sm:p-3 text-left sm:text-center lg:text-left min-w-0">
                <div className="text-cyan-200 shrink-0">{icon}</div>
                <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold leading-tight text-slate-100 block truncate sm:whitespace-normal">{label}</span>
                    <span className="text-[11px] text-slate-500 block truncate sm:whitespace-normal">{sub}</span>
                </div>
            </div>
        ))}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const RentalConfigurator: React.FC<RentalConfiguratorProps> = ({ onCheckout, onNavigate }) => {
    const [step, setStep] = useState<WizardStep>('goal');
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [selectedItems, setSelectedItems] = useState<TechType[]>([]);
    const [recommendedItems, setRecommendedItems] = useState<TechType[]>([]);
    const [actionStatus, setActionStatus] = useState(RENTAL_CONFIGURATOR_READY_STATUS);

    // Derive recommended items from selected goals
    useEffect(() => {
        if (selectedGoals.length === 0) {
            setRecommendedItems([]);
            return;
        }
        const deviceSet = new Set<TechType>();
        GOAL_BUNDLES.forEach(bundle => {
            if (selectedGoals.includes(bundle.id)) {
                bundle.devices.forEach(d => deviceSet.add(d));
            }
        });
        setRecommendedItems(Array.from(deviceSet));
    }, [selectedGoals]);

    const toggleGoal = useCallback((goalId: string) => {
        const goal = GOAL_BUNDLES.find(bundle => bundle.id === goalId);
        const isSelected = selectedGoals.includes(goalId);
        setSelectedGoals(isSelected ? selectedGoals.filter(g => g !== goalId) : [...selectedGoals, goalId]);
        setActionStatus(
            `${goal?.label ?? 'Rental goal'} ${isSelected ? 'removed from' : 'added to'} rental goals.`
        );
    }, [selectedGoals]);

    const toggleDevice = useCallback((id: TechType) => {
        const isSelected = selectedItems.includes(id);
        const tech = TECH_DETAILS[id];
        setSelectedItems(isSelected ? selectedItems.filter(item => item !== id) : [...selectedItems, id]);
        setActionStatus(`${tech.friendlyName} ${isSelected ? 'removed from' : 'added to'} rental bundle.`);
    }, [selectedItems]);

    const handleGoalContinue = () => {
        // Pre-select recommended devices
        const defaultItems = recommendedItems.slice(0, 3); // Cap at 3 for sane default
        setSelectedItems(defaultItems);
        setStep('devices');
        setActionStatus(`Suggested devices ready for review (${defaultItems.length} devices selected).`);
    };

    const handleReviewBundle = () => {
        setStep('summary');
        setActionStatus('Rental bundle summary ready.');
    };

    const handleBackToGoals = () => {
        setStep('goal');
        setActionStatus('Goal selection step ready.');
    };

    const handleBackToDevices = () => {
        setStep('devices');
        setActionStatus('Device selection step ready.');
    };

    const handleCheckout = () => {
        setActionStatus('Rental terms request handoff started.');
        if (onCheckout) {
            onCheckout();
        } else if (onNavigate) {
            const params = new URLSearchParams();
            params.set('items', selectedItems.join(','));
            onNavigate(`rental/checkout?${params.toString()}`);
        }
    };

    const handleGuidanceClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (!onNavigate || event.defaultPrevented || event.button !== 0) {
            setActionStatus('Rental guidance contact handoff opened.');
            return;
        }

        if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
            return;
        }

        event.preventDefault();
        setActionStatus('Rental guidance contact handoff opened.');
        onNavigate(RENTAL_GUIDANCE_HREF);
    };

    const handleDeviceDetailsToggle = useCallback((id: TechType, expanded: boolean) => {
        const tech = TECH_DETAILS[id];
        setActionStatus(`${tech.friendlyName} details ${expanded ? 'expanded' : 'collapsed'}.`);
    }, []);

    const allDevices = Object.values(TECH_DETAILS);
    const pricing = calculateRentalTotal(selectedItems);

    return (
        <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950/70 text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/[0.045] px-8 py-6 text-center">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                    Device Rental Configurator
                </p>
                <h2 className="text-xl font-black text-white">
                    {step === 'goal' && 'What would you like to improve?'}
                    {step === 'devices' && 'Your personalised protocol'}
                    {step === 'summary' && 'Review your bundle'}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                    {step === 'goal' && 'Choose one or more goals — we\'ll recommend the right devices.'}
                    {step === 'devices' && 'We\'ve selected your recommended devices. Adjust freely.'}
                    {step === 'summary' && 'Review the request details before Hylono confirms rental terms.'}
                </p>
            </div>

            {/* Step indicator */}
            <div className="px-6 pt-6">
                <StepIndicator current={step} />
                <div
                    id={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={RENTAL_CONFIGURATOR_ACTION_STATUS_LABEL}
                    className="sr-only"
                >
                    {actionStatus}
                </div>
            </div>

            {/* ── STEP 1: GOAL SELECTION ─────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {step === 'goal' && (
                    <motion.div
                        key="goal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                            {GOAL_BUNDLES.map(bundle => (
                                <GoalCard
                                    key={bundle.id}
                                    bundle={bundle}
                                    selected={selectedGoals.includes(bundle.id)}
                                    onClick={() => toggleGoal(bundle.id)}
                                    actionStatusId={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleGoalContinue}
                            disabled={selectedGoals.length === 0}
                            aria-describedby={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                            className={`flex w-full items-center justify-center gap-2 rounded-md py-4 text-sm font-bold uppercase tracking-widest transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none
                                ${selectedGoals.length > 0
                                    ? 'bg-cyan-300 text-slate-950 ring-1 ring-cyan-300/25 hover:bg-cyan-200'
                                    : 'cursor-not-allowed border border-white/10 bg-white/[0.06] text-slate-500'
                                }`}
                        >
                            {selectedGoals.length > 0
                                ? `Review Suggested Devices (${recommendedItems.length} devices suggested)`
                                : 'Select at least one goal'}
                            {selectedGoals.length > 0 && <ArrowRight size={15} />}
                        </button>

                        <p className="mt-3 text-center text-xs text-slate-400">
                            Not sure? Our team can guide you.{' '}
                            <a
                                href={RENTAL_GUIDANCE_HREF}
                                onClick={handleGuidanceClick}
                                aria-describedby={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                                className="inline-flex min-h-11 items-center rounded-md px-1 text-cyan-200 underline underline-offset-4 transition hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                            >
                                Ask for guidance
                            </a>
                        </p>
                    </motion.div>
                )}

                {/* ── STEP 2: DEVICE SELECTION ──────────────────────────── */}
                {step === 'devices' && (
                    <motion.div
                        key="devices"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6"
                    >
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left: device grid */}
                            <div className="flex-1 min-w-0">
                                <SynergyBanner selectedItems={selectedItems} />

                                {/* Recommended section */}
                                {recommendedItems.length > 0 && (
                                    <>
                                        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-100">
                                            Suggested for your goals
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                            {recommendedItems.map(id => (
                                                <DeviceCard
                                                    key={id}
                                                    techId={id}
                                                    selected={selectedItems.includes(id)}
                                                    recommended={true}
                                                    onToggle={() => toggleDevice(id)}
                                                    actionStatusId={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                                                    onDetailsToggle={(expanded) => handleDeviceDetailsToggle(id, expanded)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* All other devices */}
                                {allDevices.some(t => !recommendedItems.includes(t.id)) && (
                                    <>
                                        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            All devices
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {allDevices
                                                .filter(t => !recommendedItems.includes(t.id))
                                                .map(tech => (
                                                    <DeviceCard
                                                        key={tech.id}
                                                        techId={tech.id}
                                                        selected={selectedItems.includes(tech.id)}
                                                        recommended={false}
                                                        onToggle={() => toggleDevice(tech.id)}
                                                        actionStatusId={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                                                        onDetailsToggle={(expanded) => handleDeviceDetailsToggle(tech.id, expanded)}
                                                    />
                                                ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right: pricing panel */}
                            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                                <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto space-y-4">
                                    <PricingPanel
                                        selectedItems={selectedItems}
                                        onContinue={handleReviewBundle}
                                        continueLabel={selectedItems.length > 0 ? 'Review Bundle' : 'Select a Device'}
                                        disabled={selectedItems.length === 0}
                                        actionStatusId={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleBackToGoals}
                            aria-describedby={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                            className="mt-5 flex items-center gap-1.5 rounded-md text-sm text-slate-400 transition-colors hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                        >
                            <ArrowLeft size={14} /> Back to goals
                        </button>
                    </motion.div>
                )}

                {/* ── STEP 3: SUMMARY ────────────────────────────────────── */}
                {step === 'summary' && (
                    <motion.div
                        key="summary"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6"
                    >
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left: Bundle summary */}
                            <div className="flex-1 min-w-0">
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-cyan-100">
                                    Your {pricing.bundleName || 'Selected'} Protocol
                                </h3>

                                {/* Device list */}
                                <div className="space-y-2 mb-6">
                                    {selectedItems.map(id => {
                                        const tech = TECH_DETAILS[id];
                                        const colors = TECH_COLORS[id];
                                        return (
                                            <div key={id}
                                                className={`flex items-center justify-between gap-3 rounded-lg border p-3 min-w-0 ${colors.bg} ${colors.border}`}>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-xl leading-none shrink-0">{tech.icon}</span>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-semibold text-slate-100 truncate">
                                                            {tech.friendlyName}
                                                        </div>
                                                        <div className="text-xs text-slate-400 truncate">
                                                            {tech.rentalTerms || 'Flexible rental'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold shrink-0 ${colors.text}`}>
                                                    {isCanonicalRentalTech(id) ? priceBookMonthlyText(getCanonicalRentalPrice(id)) : 'Request / verify'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Synergy note */}
                                <SynergyBanner selectedItems={selectedItems} />

                                {/* What happens next */}
                                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 min-w-0">
                                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-100">
                                        What happens next
                                    </h4>
                                    <div className="space-y-2.5">
                                        {[
                                            { step: '1', text: 'Submit your rental request for review' },
                                            { step: '2', text: 'Our team confirms terms, delivery scope, and timing' },
                                            { step: '3', text: 'Devices are prepared for the agreed location' },
                                            { step: '4', text: 'Onboarding scope is confirmed before delivery' },
                                        ].map(({ step: s, text }) => (
                                            <div key={s} className="flex items-start gap-2.5 min-w-0">
                                                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-[11px] font-bold text-cyan-100 ring-1 ring-white/10">
                                                    {s}
                                                </div>
                                                <span className="text-sm text-slate-300 break-words">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Pricing + CTA */}
                            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                                <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto space-y-4">
                                    {/* Price summary */}
                                    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.08] p-5 text-white min-w-0">
                                        <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
                                            Monthly Summary
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between gap-2 text-sm text-slate-400">
                                                <span>Subtotal ({selectedItems.length} devices)</span>
                                                <span className="shrink-0 font-medium text-slate-200">{pricing.requiresManualQuote ? 'Request / verify' : priceBookMonthlyText(pricing.total)}</span>
                                            </div>
                                            {pricing.discount > 0 && (
                                                <div className="flex justify-between gap-2 text-sm text-emerald-400 font-medium">
                                                    <span className="flex items-center gap-1 min-w-0">
                                                        <Zap size={12} className="shrink-0" /> <span className="truncate">Plan adjustment</span>
                                                    </span>
                                                    <span className="shrink-0">−{priceBookMonthlyText(Math.round(pricing.discount))}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-px bg-white/[0.10] mb-4" />

                                        <div className="flex justify-between items-baseline gap-2 mb-1">
                                            <span className="text-sm font-bold uppercase tracking-wider shrink-0">Total</span>
                                            <span className={`${pricing.requiresManualQuote ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'} font-black text-right break-words min-w-0`}>
                                                {pricing.requiresManualQuote ? 'Request / verify' : priceBookText(Math.round(pricing.finalTotal))}
                                            </span>
                                        </div>
                                        {!pricing.requiresManualQuote && (
                                            <div className="text-right text-xs text-slate-500 mb-5">per month</div>
                                        )}
                                        {pricing.requiresManualQuote && (
                                            <div className="mb-5 rounded-md border border-amber-300/25 bg-amber-300/[0.10] p-2.5 text-center break-words">
                                                <p className="text-xs font-semibold text-amber-100">{pricing.savingsMessage}</p>
                                                <p className="mt-0.5 text-[11px] text-amber-200/80">{pricing.bundleName}</p>
                                            </div>
                                        )}

                                        {pricing.discount > 0 && (
                                            <div className="mb-5 rounded-md border border-emerald-300/25 bg-emerald-300/[0.10] p-2.5 text-center break-words">
                                                <p className="text-xs font-semibold text-emerald-300">
                                                    {pricing.savingsMessage}
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleCheckout}
                                            aria-describedby={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                                            className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 py-4 text-sm font-black uppercase tracking-widest text-slate-950 ring-1 ring-cyan-300/25 transition-all hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                                        >
                                            <ShoppingBag size={15} />
                                            Request Rental Terms
                                        </button>

                                        <p className="text-[11px] text-slate-500 text-center mt-3 leading-relaxed">
                                            Minimum term, notice period, and cancellation path are confirmed before checkout.
                                        </p>
                                    </div>

                                    {/* Trust signals */}
                                    <TrustSignals />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleBackToDevices}
                            aria-describedby={RENTAL_CONFIGURATOR_ACTION_STATUS_ID}
                            className="mt-5 flex items-center gap-1.5 rounded-md text-sm text-slate-400 transition-colors hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                        >
                            <ArrowLeft size={14} /> Back to devices
                        </button>

                        {/* Medical disclaimer */}
                        <p className="mt-4 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-slate-500">
                            Wellness equipment for general wellbeing planning only.
                            Hylono devices are designed to support general wellness. Consult your healthcare provider before use.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

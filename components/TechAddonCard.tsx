import React from 'react';
import { motion } from 'motion/react';
import { Plus, Check, Info } from 'lucide-react';
import { TechAddon } from '../types';
import { priceBookText } from '@/lib/money';

interface TechAddonCardProps {
    addon: TechAddon;
    isSelected: boolean;
    onToggle: () => void;
    accentColor: string;
    priceLabel?: string;
    selectedLabel?: string;
}

const formatWholeNumber = (value: number): string =>
    new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    }).format(value);

const getAddonAccentClasses = (accentColor: string) => {
    if (accentColor.includes('purple') || accentColor.includes('violet')) {
        return {
            border: 'border-violet-300/45',
            glow: 'bg-violet-300/10',
            icon: 'border-violet-300/30 bg-violet-300/15 text-violet-100',
            pill: 'border-violet-300/20 bg-violet-300/10 text-violet-100',
            price: 'text-violet-100',
        };
    }

    if (accentColor.includes('red') || accentColor.includes('rose')) {
        return {
            border: 'border-rose-300/45',
            glow: 'bg-rose-300/10',
            icon: 'border-rose-300/30 bg-rose-300/15 text-rose-100',
            pill: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
            price: 'text-rose-100',
        };
    }

    if (accentColor.includes('orange') || accentColor.includes('amber')) {
        return {
            border: 'border-amber-300/45',
            glow: 'bg-amber-300/10',
            icon: 'border-amber-300/30 bg-amber-300/15 text-amber-100',
            pill: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
            price: 'text-amber-100',
        };
    }

    if (accentColor.includes('teal') || accentColor.includes('emerald')) {
        return {
            border: 'border-teal-300/45',
            glow: 'bg-teal-300/10',
            icon: 'border-teal-300/30 bg-teal-300/15 text-teal-100',
            pill: 'border-teal-300/20 bg-teal-300/10 text-teal-100',
            price: 'text-teal-100',
        };
    }

    if (accentColor.includes('indigo') || accentColor.includes('blue')) {
        return {
            border: 'border-indigo-300/45',
            glow: 'bg-indigo-300/10',
            icon: 'border-indigo-300/30 bg-indigo-300/15 text-indigo-100',
            pill: 'border-indigo-300/20 bg-indigo-300/10 text-indigo-100',
            price: 'text-indigo-100',
        };
    }

    return {
        border: 'border-cyan-300/45',
        glow: 'bg-cyan-300/10',
        icon: 'border-cyan-300/30 bg-cyan-300/15 text-cyan-100',
        pill: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
        price: 'text-cyan-100',
    };
};

export const TechAddonCard: React.FC<TechAddonCardProps> = ({
    addon,
    isSelected,
    onToggle,
    accentColor,
    priceLabel,
    selectedLabel = 'Added to Config',
}) => {
    const accentClasses = getAddonAccentClasses(accentColor);

    return (
        <motion.button
            type="button"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                group relative h-full overflow-hidden rounded-lg border text-left shadow-none transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300
                ${isSelected
                    ? `bg-white/[0.08] ${accentClasses.border}`
                    : 'border-white/10 bg-white/[0.045] hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.08]'
                }
            `}
            onClick={onToggle}
            aria-pressed={isSelected}
        >
            {isSelected && (
                <div className={`absolute right-0 top-0 h-32 w-32 ${accentClasses.glow} blur-2xl -translate-y-1/2 translate-x-1/2`} />
            )}

            <div className="relative z-10 flex h-full flex-col p-5 sm:p-6 min-w-0">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <span className={`
                        rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest truncate max-w-[70%]
                        ${isSelected ? accentClasses.pill : 'border-white/10 bg-slate-950/45 text-slate-300'}
                    `}>
                        {addon.category}
                    </span>
                    <div className={`
                        flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300
                        ${isSelected ? `${accentClasses.icon} rotate-0` : 'rotate-90 border-white/10 bg-white/[0.05] text-slate-400 group-hover:border-cyan-300/30 group-hover:text-cyan-100'}
                    `}>
                        {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                    </div>
                </div>

                <div className="flex-grow min-w-0">
                    <h3 className="mb-2 text-lg font-bold text-white break-words leading-snug">
                        {addon.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300 break-words">
                        {addon.description}
                    </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-white/10 pt-4">
                    <span className={`font-mono text-lg font-bold break-words min-w-0 ${isSelected ? accentClasses.price : 'text-slate-100'}`}>
                        {priceLabel ?? `+${priceBookText(addon.price)}`}
                    </span>
                    {isSelected && (
                        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-200 shrink-0 whitespace-nowrap">
                            <Info aria-hidden="true" size={13} className="shrink-0" />
                            <span>{selectedLabel}</span>
                        </span>
                    )}
                </div>
            </div>
        </motion.button>
    );
};

import React from 'react';
import { motion } from 'motion/react';
import { Layers, ArrowRight, Zap, Activity, Brain, Plus } from 'lucide-react';
import { TechType } from '../types';
import type { LucideIcon } from 'lucide-react';

interface StackProps {
    currentTech: TechType;
    onJump: (tech: TechType) => void;
}

interface ProtocolStackItem {
    id: TechType;
    name: string;
    role: string;
    icon: LucideIcon;
}

interface ProtocolStackConfig {
    title: string;
    description: string;
    items: ProtocolStackItem[];
    benefit: string;
}

const STACKS: Partial<Record<TechType, ProtocolStackConfig>> = {
    [TechType.HBOT]: {
        title: "Recovery Planning Stack",
        description: "Compare PEMF, HBOT, and red light as separate steps before combining them.",
        items: [
            { id: TechType.PEMF, name: "PEMF Mat", role: "Routine setup", icon: Zap },
            { id: TechType.HBOT, name: "HBOT Chamber", role: "Oxygen format", icon: Activity },
            { id: TechType.RLT, name: "Red Light Panel", role: "Light routine", icon: ArrowRight }
        ],
        benefit: "Fit review"
    },
    [TechType.PEMF]: {
        title: "Sleep Routine Stack",
        description: "Compare evening setup burden, support needs, and evidence limits.",
        items: [
            { id: TechType.PEMF, name: "PEMF", role: "Evening setup", icon: Brain },
            { id: TechType.HYDROGEN, name: "Hydrogen", role: "Format review", icon: Activity },
            { id: TechType.RLT, name: "Red Light", role: "Light timing", icon: Layers }
        ],
        benefit: "Routine fit"
    },
    [TechType.RLT]: {
        title: "Daily Rhythm Stack",
        description: "Review timing, setup friction, and policy pages before combining devices.",
        items: [
            { id: TechType.HYDROGEN, name: "Hydrogen Water", role: "Morning format", icon: Activity },
            { id: TechType.RLT, name: "Red Light", role: "Light timing", icon: Zap },
            { id: TechType.PEMF, name: "PEMF", role: "Routine support", icon: Brain }
        ],
        benefit: "Timing review"
    },
    [TechType.HYDROGEN]: {
        title: "Focus Routine Stack",
        description: "Keep subjective focus goals separate from evidence and suitability review.",
        items: [
            { id: TechType.HYDROGEN, name: "Hydrogen Inhalation", role: "Format review", icon: Activity },
            { id: TechType.PEMF, name: "PEMF", role: "Routine support", icon: Zap },
            { id: TechType.HBOT, name: "Soft HBOT", role: "Oxygen format", icon: Brain }
        ],
        benefit: "Expectation check"
    }
};

export const ProtocolStacks: React.FC<StackProps> = ({ currentTech, onJump }) => {
    const stack = STACKS[currentTech];

    if (!stack) return null;

    return (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-center justify-between">
                {/* Header */}
                <div className="w-full lg:flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                        <Layers size={16} className="shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em]">Synergy Stack</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 futuristic-font break-words">{stack.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 sm:mb-6 break-words leading-relaxed">{stack.description}</p>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 max-w-full">
                        <Activity size={12} className="shrink-0" /> <span className="truncate">Focus: {stack.benefit}</span>
                    </div>
                </div>

                {/* Stack Visualizer Flow Nodes */}
                <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3 py-2 px-1 max-w-full min-w-0">
                    {stack.items.map((item, i) => (
                        <React.Fragment key={item.id}>
                            <motion.button
                                type="button"
                                whileHover={{ y: -4 }}
                                onClick={() => item.id !== currentTech ? onJump(item.id) : null}
                                aria-label={`View ${item.name} in stack (${item.role})`}
                                className={`relative p-3 sm:p-4 rounded-xl border transition-all flex-1 sm:flex-initial min-w-[5.75rem] max-w-[8.5rem] sm:w-28 md:w-32 flex flex-col items-center text-center gap-1.5 sm:gap-2
                                    ${item.id === currentTech
                                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className={`shrink-0 ${item.id === currentTech ? 'text-cyan-400' : 'text-slate-500'}`} />
                                <span className="text-[10px] sm:text-[11px] font-bold uppercase leading-tight break-words max-w-full">{item.name}</span>
                                <span className="text-[8px] sm:text-[9px] font-medium text-slate-300/80 px-1.5 py-0.5 rounded-md bg-white/[0.08] border border-white/[0.08] break-words max-w-full tracking-wide">{item.role}</span>

                                {item.id === currentTech && (
                                    <span className="absolute -top-2 -right-1.5 sm:-right-2 bg-cyan-400 text-slate-950 text-[7px] sm:text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm tracking-wider uppercase">
                                        ACTIVE
                                    </span>
                                )}
                            </motion.button>
                            {i < stack.items.length - 1 && (
                                <div className="flex items-center justify-center shrink-0 text-cyan-400/60 sm:text-slate-500 p-0.5" aria-hidden="true">
                                    <Plus size={16} className="shrink-0" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* CTA */}
                <div className="w-full sm:w-auto shrink-0 flex items-center justify-center">
                    <button
                        type="button"
                        onClick={() => {
                            const firstOther = stack.items.find(i => i.id !== currentTech);
                            if (firstOther) onJump(firstOther.id);
                        }}
                        className="w-full sm:w-auto px-6 py-3 bg-white text-slate-950 font-bold uppercase text-xs tracking-widest rounded-lg hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        Review Stack <ArrowRight size={14} className="shrink-0" />
                    </button>
                </div>
            </div>
        </div>
    );
};

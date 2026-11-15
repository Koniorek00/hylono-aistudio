import React from 'react';
import { motion } from 'motion/react';
import { Target, Moon, Brain, Zap, Sparkles } from 'lucide-react';
import type { TechData } from '@/types';

interface GoalsEvidenceSectionProps {
    data: TechData;
}

export const GoalsEvidenceSection: React.FC<GoalsEvidenceSectionProps> = ({ data }) => {
    if (!data.goals || data.goals.length === 0) {
        return null;
    }

    return (
        <section
            id="goals"
            data-testid="product-detail-goals-surface"
            className="bg-slate-950 py-16 text-white"
        >
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-10">
                    <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Designed For</span>
                    <h2 className="text-3xl font-bold text-white">Is This Right For You?</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {data.goals.map((goal: string) => {
                        const goalMeta: Record<string, { icon: React.ReactNode; desc: string }> = {
                            Rest: { icon: <Moon size={28} />, desc: 'Sleep routine planning' },
                            Focus: { icon: <Brain size={28} />, desc: 'Focus routine context' },
                            Repair: { icon: <Zap size={28} />, desc: 'Recovery setup review' },
                            Life: { icon: <Sparkles size={28} />, desc: 'Daily wellness planning' },
                        };
                        const meta = goalMeta[goal] || { icon: <Target size={28} />, desc: '' };
                        return (
                            <motion.div
                                key={goal}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="cursor-default rounded-lg border border-white/10 bg-white/[0.045] p-6 text-center transition-all hover:border-cyan-300/45 hover:bg-white/[0.07]"
                            >
                                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${data.accentColor} text-white shadow-none`}>
                                    {meta.icon}
                                </div>
                                <h4 className="font-black text-white text-base mb-1">{goal}</h4>
                                <p className="text-[11px] text-slate-300 leading-relaxed">{meta.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

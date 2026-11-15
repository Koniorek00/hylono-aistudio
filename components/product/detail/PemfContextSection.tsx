"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Moon, Target, Brain, Activity, Shield, CheckCircle } from 'lucide-react';
import { MedicalDisclaimer } from '../../shared/MedicalDisclaimer';

interface PemfContextSectionProps {
    viewMode?: string;
}

export const PemfContextSection: React.FC<PemfContextSectionProps> = () => {
    return (
        <section
            data-testid="product-detail-pemf-context-surface"
            className="border-y border-white/10 bg-slate-950 py-20 text-white"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-14">
                    <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest block mb-2">Protocol context</span>
                    <h2 className="text-4xl font-bold text-white mb-4">Where PEMF fits</h2>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        PEMF is handled here as a complementary planning option. Start with the goal, review safety limits, and decide whether the device belongs in the routine before selecting settings.
                    </p>
                </div>

                {/* Key Science Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {[
                        { value: '20-30 min', label: 'Planning Window', sub: 'Common condition-page session range' },
                        { value: 'Screen first', label: 'Implanted Devices', sub: 'Review electronic implants before use' },
                        { value: 'Goal-led', label: 'Routine Fit', sub: 'Sleep, comfort, stress, or recovery context' },
                        { value: 'Evidence-limited', label: 'Claim Posture', sub: 'No universal outcome promise' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-lg border border-purple-300/20 bg-purple-300/10 p-6 text-center shadow-none"
                        >
                            <div className="text-3xl font-black text-purple-100 mb-1">{stat.value}</div>
                            <div className="font-bold text-white text-sm mb-0.5">{stat.label}</div>
                            <div className="text-xs text-slate-300">{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>

                {/* What PEMF Helps With - 6-item grid */}
                <div className="text-center mb-10">
                    <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest block mb-2">Decision frame</span>
                    <h3 className="text-3xl font-bold text-white">How to use this page</h3>
                    <MedicalDisclaimer type="research" compact className="mt-3 text-center max-w-lg mx-auto" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { icon: <Moon size={18} />, title: 'Sleep-routine context', desc: 'Compare PEMF against the sleep guide before turning it into the main evening option.' },
                        { icon: <Target size={18} />, title: 'Comfort planning', desc: 'Use the comfort guide when the question is goal fit rather than device specifications.' },
                        { icon: <Brain size={18} />, title: 'Stress-support routines', desc: 'Keep PEMF as one possible support layer inside a broader stress-planning path.' },
                        { icon: <Activity size={18} />, title: 'Recovery scheduling', desc: 'Place sessions around workload and rest instead of relying on a universal cadence.' },
                        { icon: <Shield size={18} />, title: 'Safety screening', desc: 'Resolve implanted-device, pregnancy, seizure-history, and bleeding concerns before use.' },
                        { icon: <CheckCircle size={18} />, title: 'Access decision', desc: 'Move into rental or contact only after the fit, limits, and support path are clear.' },
                    ].map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="rounded-lg border border-white/10 bg-white/[0.045] p-5 transition-all hover:border-purple-300/35 hover:bg-white/[0.07]"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-purple-300/20 bg-purple-300/10 text-purple-100">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center text-[10px] text-slate-400 mt-8 italic max-w-2xl mx-auto">Review the research hub and condition guides before treating PEMF as the center of a plan.</p>
            </div>
        </section>
    );
};

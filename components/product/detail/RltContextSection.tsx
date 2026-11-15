'use client';

import { motion } from 'motion/react';
import { Eye, Phone, Pill, Shield, Sparkles, Sun } from 'lucide-react';
import { MedicalDisclaimer } from '../../shared/MedicalDisclaimer';

/**
 * Planning-context block for the RLT product detail page.
 *
 * Extracted verbatim from `components/TechDetail.tsx`. The parent keeps the
 * `data.id === TechType.RLT` guard, matching the other sections in this directory.
 *
 * The compliance posture here is load-bearing and must not be softened: the evidence
 * status is stated as review-pending, the page explicitly refuses to stand as proof of
 * efficacy, and eye-protection plus medication screening are named as checkpoints.
 * `tests/components/TechDetailTechnologySections.test.tsx` locks that wording.
 */
export const RltContextSection = () => (
    <section
        data-testid="product-detail-rlt-context-surface"
        className="border-y border-white/10 bg-slate-950 py-20 text-white"
    >
        <div className="max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-14">
                <span className="text-[10px] text-red-200 font-bold uppercase tracking-widest block mb-2">Planning context</span>
                <h2 className="text-4xl font-bold text-white mb-4">Where red and near-infrared light fits</h2>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Red and near-infrared light is handled here as a product-fit and routine-planning category. Start with the goal, review timing and safety limits, and use support before treating the device as an outcome answer.
                </p>
            </div>

            {/* Key Science Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                {[
                    { value: '630-660nm', label: 'Red Light', sub: 'Common red wavelength band' },
                    { value: '810-850nm', label: 'Near-Infrared', sub: 'Common NIR wavelength band' },
                    { value: 'Review', label: 'Evidence Status', sub: 'RLT source review pending' },
                    { value: '10-20m', label: 'Routine Window', sub: 'Device-guided planning range' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-lg border border-red-300/20 bg-red-300/10 p-6 text-center shadow-none"
                    >
                        <div className="text-3xl font-black text-red-100 mb-1">{stat.value}</div>
                        <div className="font-bold text-white text-sm mb-0.5">{stat.label}</div>
                        <div className="text-xs text-slate-300">{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* What RLT needs before planning */}
            <div className="text-center mb-10">
                <span className="text-[10px] text-red-200 font-bold uppercase tracking-widest block mb-2">Planning checkpoints</span>
                <h3 className="text-3xl font-bold text-white">How to keep RLT planning conservative</h3>
                <MedicalDisclaimer type="research" compact className="mt-3 text-center max-w-lg mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { icon: <Sparkles size={18} />, title: 'Routine fit', desc: 'Choose comfort, recovery, sleep, or vitality context before selecting a light routine.' },
                    { icon: <Shield size={18} />, title: 'Evidence limits', desc: 'Do not treat this hub as proof of RLT efficacy while the source review is still pending.' },
                    { icon: <Eye size={18} />, title: 'Eye protection', desc: 'Use the supplied eye protection and follow the device instructions for near-face sessions.' },
                    { icon: <Sun size={18} />, title: 'Timing control', desc: 'Plan brightness and session timing so the routine does not disrupt the selected goal.' },
                    { icon: <Pill size={18} />, title: 'Medication screen', desc: 'Review photosensitivity and medication questions before adding exposure time.' },
                    { icon: <Phone size={18} />, title: 'Support path', desc: 'Use contact or rental planning when suitability, tolerance, or stack fit is unclear.' },
                ].map((item, i) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-lg border border-white/10 bg-white/[0.045] p-5 transition-all hover:border-red-300/35 hover:bg-white/[0.07]"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-300/20 bg-red-300/10 text-red-100">
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

            <p className="text-center text-[10px] text-slate-400 mt-8 italic max-w-2xl mx-auto">Current RLT evidence cards are review-pending compatibility records, not standalone efficacy proof.</p>
        </div>
    </section>
);

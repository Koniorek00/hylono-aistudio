'use client';

import { motion } from 'motion/react';
import { Activity, Sparkles, Sun } from 'lucide-react';
import { RltSpectrumExplorer } from './RltSpectrumExplorer';

/**
 * Red light vs near-infrared comparison for the RLT product detail page.
 *
 * Extracted verbatim from `components/TechDetail.tsx`, which had grown to a single
 * 2792-line component. The parent keeps the `data.id === TechType.RLT` guard, matching
 * the other extracted sections in this directory.
 *
 * The copy is deliberately equipment-framed: wavelength bands are presented as device
 * context, never as a promised tissue-depth or clinical outcome. `tests/components/
 * TechDetailTechnologySections.test.tsx` locks that framing.
 */
export const RltWavelengthSection = () => (
    <section
        data-testid="product-detail-rlt-wavelength-surface"
        className="border-y border-white/10 bg-slate-950 py-20 text-white"
    >
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
                <span className="text-[10px] text-red-200 font-bold uppercase tracking-widest block mb-2">Wavelength Science</span>
                <h2 className="text-4xl font-bold text-white mb-4">Red Light vs. Near-Infrared</h2>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Compare wavelength bands as equipment context, then use device instructions and support guidance to decide whether either band belongs in the routine.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Red Light Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-lg border border-red-300/20 bg-red-300/10 p-8 text-white shadow-none transition-all hover:border-red-300/35 hover:bg-red-300/[0.14]"
                >
                    <div className="flex items-start justify-between mb-6 gap-4">
                        <div>
                            <span className="text-[10px] border border-red-300/20 bg-red-300/10 text-red-100 px-3 py-1 rounded-lg font-bold uppercase tracking-wider">Visible Light</span>
                            <h3 className="text-2xl font-black mt-3 mb-1 text-white">Red Light</h3>
                            <p className="text-red-100 text-sm font-mono">630-660 nm wavelength</p>
                        </div>
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-red-300/20 bg-red-300/10 text-red-100">
                            <Sun size={28} />
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        Commonly used as the visible-light side of red-light panels. Treat it as device context and review skin, photosensitivity, and eye-protection questions before use.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['Visible light', 'Surface context', 'Skin routine questions', 'Eye protection'].map(tag => (
                            <span key={tag} className="text-[11px] border border-white/10 bg-white/[0.045] text-slate-200 px-2.5 py-1 rounded-lg font-bold">{tag}</span>
                        ))}
                    </div>
                </motion.div>

                {/* Near-Infrared Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-white/10 bg-white/[0.045] p-8 text-white shadow-none transition-all hover:border-red-300/35 hover:bg-white/[0.07]"
                >
                    <div className="flex items-start justify-between mb-6 gap-4">
                        <div>
                            <span className="text-[10px] border border-white/10 bg-white/[0.045] text-slate-200 px-3 py-1 rounded-lg font-bold uppercase tracking-wider">Invisible to Eye</span>
                            <h3 className="text-2xl font-black text-white mt-3 mb-1">Near-Infrared</h3>
                            <p className="text-slate-300 text-sm">810-850 nm wavelength</p>
                        </div>
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-red-300/20 bg-red-300/10 text-red-100">
                            <Activity size={28} />
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        Commonly used as the near-infrared side of light panels. Use it for equipment comparison and support-led planning rather than unsupported tissue-depth outcome claims.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['Near-infrared', 'Panel context', 'Distance planning', 'Routine fit'].map(tag => (
                            <span key={tag} className="text-[11px] border border-white/10 bg-white/[0.045] text-slate-200 px-2.5 py-1 rounded-lg font-bold">{tag}</span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Pro Tip */}
            <div className="mt-8 flex flex-col items-start gap-4 rounded-lg border border-red-300/20 bg-red-300/10 p-6 md:flex-row md:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-red-300/20 bg-red-300/10 text-red-100">
                    <Sparkles size={22} />
                </div>
                <div>
                    <h4 className="font-black text-white mb-1">Planning note: compare bands before stacking</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        A dual-band panel can be useful for practical setup, but this page should not turn wavelength availability into a result promise. Review instructions, timing, distance, and support guidance before expanding the routine.
                    </p>
                </div>
            </div>

            {/* Interactive Photobiomodulation Spectrum Explorer */}
            <RltSpectrumExplorer />
        </div>
    </section>
);

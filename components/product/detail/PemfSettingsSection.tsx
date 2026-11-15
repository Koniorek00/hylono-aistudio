'use client';

import { motion } from 'motion/react';
import { Activity, AlertTriangle } from 'lucide-react';
import { PemfWaveformVisualizer } from './PemfWaveformVisualizer';

/**
 * PEMF settings-planning context for the PEMF product detail page.
 *
 * Extracted verbatim from `components/TechDetail.tsx`. The parent keeps the
 * `data.id === TechType.PEMF` guard, matching the other extracted sections here.
 *
 * Two things in here are load-bearing and must not be softened:
 * - settings are framed as planning context sourced from the manual, protocol and
 *   support conversation, never as promised effects;
 * - the implanted-electronics warning is a safety statement, not decoration.
 * `tests/components/TechDetailTechnologySections.test.tsx` locks both.
 */
export const PemfSettingsSection = () => (
    <section
        data-testid="product-detail-pemf-settings-surface"
        className="border-y border-white/10 bg-slate-950 py-20 text-white"
    >
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
                <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest block mb-2">Settings context</span>
                <h2 className="mx-auto mb-4 max-w-[9ch] text-[1.5rem] font-bold leading-[1.02] text-white sm:max-w-none sm:text-4xl sm:leading-tight">
                    Planning PEMF settings
                </h2>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Device settings should come from the manual, selected protocol, and support conversation. This page keeps settings framed as planning context, not promised effects.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { range: 'Manual', effect: 'Device instructions', use: 'Start from the manufacturer guidance', tone: 'border-slate-300/20 bg-white/[0.045] text-slate-100' },
                    { range: 'Goal', effect: 'Condition guide', use: 'Match settings to the reason for use', tone: 'border-teal-300/20 bg-teal-300/10 text-teal-100' },
                    { range: 'Safety', effect: 'Contraindications', use: 'Screen implanted electronics first', tone: 'border-amber-300/25 bg-amber-300/10 text-amber-100' },
                    { range: 'Support', effect: 'Hylono guidance', use: 'Ask before increasing complexity', tone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100' },
                ].map((freq, i) => (
                    <motion.div
                        key={freq.range}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`rounded-lg border p-6 shadow-none ${freq.tone}`}
                    >
                        <div className="text-2xl font-black mb-2">{freq.range}</div>
                        <div className="text-sm font-bold text-white mb-1">{freq.effect}</div>
                        <div className="text-xs text-slate-300">{freq.use}</div>
                    </motion.div>
                ))}
            </div>

            {/* Preset context */}
            <div className="flex flex-col items-start gap-4 rounded-lg border border-purple-300/20 bg-purple-300/10 p-6 md:flex-row md:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-purple-300/20 bg-purple-300/10 text-purple-100">
                    <Activity size={22} />
                </div>
                <div>
                    <h4 className="font-black text-white mb-1">Named presets need context</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        If a device includes branded or frequency-specific presets, frame them as settings to verify against the manual and support guidance rather than proof of an assured result.
                    </p>
                </div>
            </div>

            {/* Pacemaker Warning */}
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-300/25 bg-red-300/10 p-4">
                <AlertTriangle size={20} className="text-red-100 shrink-0 mt-0.5" />
                <div>
                    <span className="text-sm font-bold text-white block">Important Safety Note</span>
                    <span className="text-xs text-slate-300">PEMF devices can interfere with pacemakers and implanted electronic devices. If you have a pacemaker, insulin pump, or other implanted electronics, do not use PEMF sessions unless explicitly cleared by your licensed clinician.</span>
                </div>
            </div>

            {/* Interactive Frequency & Waveform Visualizer */}
            <PemfWaveformVisualizer />
        </div>
    </section>
);

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Wind, Sliders, Activity, Info, Sparkles, CheckCircle2, ShieldCheck, Gauge } from 'lucide-react';

type HydrogenMode = 'ppm' | 'flow';

interface ConcentrationPreset {
    ppm: number;
    label: string;
    sublabel: string;
    saturationLevel: string;
    intakeYield: string;
    context: string;
}

const CONCENTRATION_PRESETS: ConcentrationPreset[] = [
    {
        ppm: 1.2,
        label: 'Daily Hydration',
        sublabel: 'Standard Baseline',
        saturationLevel: 'Standard Dissolved Baseline',
        intakeYield: '~0.6 mg H2 per 500 mL',
        context: 'Daily drinking water enrichment using the titanium PEM dissolution rod.',
    },
    {
        ppm: 1.6,
        label: 'Clinical Baseline',
        sublabel: 'Minimum Research Threshold',
        saturationLevel: 'Consensus Research Level (1.6 PPM)',
        intakeYield: '~0.8 mg H2 per 500 mL',
        context: 'Academic literature consensus minimum for targeted cellular antioxidant research.',
    },
    {
        ppm: 2.4,
        label: 'High-Saturation',
        sublabel: 'Therapeutic Window',
        saturationLevel: 'Elevated Saturation Window (2.4 PPM)',
        intakeYield: '~1.2 mg H2 per 500 mL',
        context: 'High-concentration infusion providing elevated dissolved hydrogen for intensive routines.',
    },
    {
        ppm: 3.2,
        label: 'Peak Saturation',
        sublabel: 'Super-Saturated Peak',
        saturationLevel: 'Super-Saturated Peak (3.0+ PPM)',
        intakeYield: '~1.6 mg H2 per 500 mL',
        context: 'Maximum dissolution achievable under sealed micro-pressurization conditions.',
    },
];

interface FlowPreset {
    rate: number;
    label: string;
    sublabel: string;
    duration: string;
    volumeYield: string;
    context: string;
}

const FLOW_PRESETS: FlowPreset[] = [
    {
        rate: 300,
        label: 'Gentle Rest',
        sublabel: '300 mL/min',
        duration: '45-60 min/session',
        volumeYield: '18 Liters net H2 gas',
        context: 'Standard resting flow for evening unwind and quiet routine acclimatization.',
    },
    {
        rate: 600,
        label: 'Active Balance',
        sublabel: '600 mL/min',
        duration: '30-45 min/session',
        volumeYield: '27 Liters net H2 gas',
        context: 'Optimized standard output delivering steady molecular diffusion via nasal cannula.',
    },
    {
        rate: 900,
        label: 'High-Output',
        sublabel: '900 mL/min',
        duration: '20-30 min/session',
        volumeYield: '27 Liters net H2 gas',
        context: 'High-output dual-port delivery for intensive routine sessions and multi-accessory stacking.',
    },
];

export const HydrogenFlowVisualizer: React.FC = () => {
    const [mode, setMode] = useState<HydrogenMode>('ppm');
    const [selectedPpmIdx, setSelectedPpmIdx] = useState<number>(1); // default 1.6 PPM
    const [selectedFlowIdx, setSelectedFlowIdx] = useState<number>(1); // default 600 mL/min

    const currentPpm = CONCENTRATION_PRESETS[selectedPpmIdx] ?? CONCENTRATION_PRESETS[0]!;
    const currentFlow = FLOW_PRESETS[selectedFlowIdx] ?? FLOW_PRESETS[0]!;

    // Dial calculations for PPM (0 to 3.5 scale)
    const ppmPercentage = Math.min(Math.max((currentPpm.ppm / 3.5) * 100, 0), 100);
    // Dial calculations for Flow (150 to 1000 scale)
    const flowPercentage = Math.min(Math.max(((currentFlow.rate - 150) / 850) * 100, 0), 100);

    // SVG Gauge calculation
    const gaugeStroke = mode === 'ppm' ? ppmPercentage : flowPercentage;
    const arcLength = 207.3;
    const strokeDashoffset = arcLength - (arcLength * gaugeStroke) / 100;

    return (
        <div
            role="region"
            aria-label="Molecular H2 Concentration & Flow Rate Meter"
            data-testid="hydrogen-flow-visualizer"
            className="mt-12 overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-950/95 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        >
            {/* Top Specular Edge Highlight */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

            {/* Console Control Bar */}
            <div className="border-b border-white/10 bg-slate-900/60 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                                Calibrated Hardware Console
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                                Supplier-Confirmed Delivery Dynamics
                            </span>
                        </div>
                        <h3 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                            Molecular H₂ Concentration &amp; Flow Rate Meter
                        </h3>
                    </div>

                    {/* Mode Toggle */}
                    <div role="tablist" aria-label="Hydrogen Delivery Mode" className="inline-flex rounded-xl border border-white/10 bg-slate-950/80 p-1.5 shadow-inner">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === 'ppm'}
                            onClick={() => setMode('ppm')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                mode === 'ppm'
                                    ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Droplets size={14} className={mode === 'ppm' ? 'text-cyan-400' : 'text-slate-400'} />
                            Dissolved H₂ (PPM)
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === 'flow'}
                            onClick={() => setMode('flow')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                mode === 'flow'
                                    ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Wind size={14} className={mode === 'flow' ? 'text-emerald-400' : 'text-slate-400'} />
                            Gas Output (mL/min)
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Interactive Body */}
            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12 lg:p-8">
                {/* Left Column: Visual Dial Gauge Meter & Visual Render */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-5">
                    <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                {mode === 'ppm' ? 'Dissolved Saturation Gauge' : 'Inhalation Flow Gauge'}
                            </span>
                            <span className="font-mono text-xs font-semibold text-cyan-300">
                                {mode === 'ppm' ? '0.0 - 3.5+ PPM' : '150 - 1000 mL/min'}
                            </span>
                        </div>

                        {/* Circular SVG Gauge */}
                        <div className="relative mt-6 flex flex-col items-center justify-center">
                            <svg className="h-56 w-56 -rotate-[110deg] transform" viewBox="0 0 120 120">
                                {/* Track circle */}
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeWidth="8"
                                    strokeDasharray="207.3 339.29"
                                    strokeLinecap="round"
                                />
                                {/* Value stroke */}
                                <motion.circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke={mode === 'ppm' ? '#22d3ee' : '#34d399'}
                                    strokeWidth="8"
                                    strokeDasharray="207.3 339.29"
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className="drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                                />
                            </svg>

                            {/* Centered Dial Readout */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={mode === 'ppm' ? currentPpm.ppm : currentFlow.rate}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col items-center"
                                    >
                                        <span className="font-mono text-4xl font-black tracking-tight text-white sm:text-5xl">
                                            {mode === 'ppm' ? currentPpm.ppm.toFixed(1) : currentFlow.rate}
                                        </span>
                                        <span className="mt-1 text-xs font-bold uppercase tracking-widest text-cyan-300">
                                            {mode === 'ppm' ? 'PPM (mg/L)' : 'mL / min'}
                                        </span>
                                        <span className="mt-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                                            {mode === 'ppm' ? currentPpm.label : currentFlow.label}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Status Readout Footnote */}
                        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/80 p-4 text-center">
                            <span className="text-[11px] font-bold text-slate-300">
                                {mode === 'ppm' ? currentPpm.saturationLevel : currentFlow.sublabel}
                            </span>
                            <p className="mt-1 text-[11px] text-cyan-300/80 font-mono">
                                Output: {mode === 'ppm' ? currentPpm.intakeYield : `${currentFlow.duration} (${currentFlow.volumeYield})`}
                            </p>
                        </div>
                    </div>

                    {/* Integrated Micro-Render Banner */}
                    <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-black">
                        <div className="relative h-28 w-full">
                            <Image
                                src="/images/store/store_card_hydrogen.jpg"
                                alt="Molecular Hydrogen Infusion Technology"
                                fill
                                sizes="(max-width: 768px) 100vw, 40vw"
                                className="object-cover opacity-40 mix-blend-screen"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                        </div>
                        <div className="absolute inset-x-0 bottom-2 px-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                Solid Polymer Electrolyte (SPE)
                            </span>
                            <p className="text-[10px] text-slate-300">
                                Quote-confirmed titanium-platinum cell separation with zero ozone byproducts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Interactive Level Selectors & Protocol Context */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-7">
                    <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                                <Gauge size={16} className="text-cyan-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                    {mode === 'ppm' ? 'Dissolved H₂ Preset Windows' : 'Gas Delivery Flow Bands'}
                                </span>
                            </div>
                            <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400">
                                <ShieldCheck size={12} />
                                Pure Gas Delivery
                            </span>
                        </div>

                        {/* Preset Buttons Grid */}
                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {mode === 'ppm'
                                ? CONCENTRATION_PRESETS.map((preset, idx) => (
                                      <button
                                          key={preset.label}
                                          type="button"
                                          onClick={() => setSelectedPpmIdx(idx)}
                                          className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                                              selectedPpmIdx === idx
                                                  ? 'border-cyan-400/50 bg-cyan-500/15 shadow-md shadow-cyan-950/30'
                                                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                                          }`}
                                      >
                                          <div className="flex items-start justify-between">
                                              <div>
                                                  <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                                                      {preset.label}
                                                  </span>
                                                  <span className="block text-[10px] text-slate-400">
                                                      {preset.sublabel}
                                                  </span>
                                              </div>
                                              <span className="font-mono text-sm font-bold text-cyan-300">
                                                  {preset.ppm.toFixed(1)} PPM
                                              </span>
                                          </div>
                                          <p className="mt-2 text-[11px] text-slate-400">
                                              {preset.intakeYield}
                                          </p>
                                      </button>
                                  ))
                                : FLOW_PRESETS.map((preset, idx) => (
                                      <button
                                          key={preset.label}
                                          type="button"
                                          onClick={() => setSelectedFlowIdx(idx)}
                                          className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                                              selectedFlowIdx === idx
                                                  ? 'border-emerald-400/50 bg-emerald-500/15 shadow-md shadow-emerald-950/30'
                                                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                                          }`}
                                      >
                                          <div className="flex items-start justify-between">
                                              <div>
                                                  <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                                                      {preset.label}
                                                  </span>
                                                  <span className="block text-[10px] text-slate-400">
                                                      {preset.sublabel}
                                                  </span>
                                              </div>
                                              <span className="font-mono text-sm font-bold text-emerald-300">
                                                  {preset.rate} mL/m
                                              </span>
                                          </div>
                                          <p className="mt-2 text-[11px] text-slate-400">
                                              {preset.duration}
                                          </p>
                                      </button>
                                  ))}
                        </div>

                        {/* Selected Preset Detailed Analysis */}
                        <div className="mt-6 rounded-xl border border-cyan-500/20 bg-slate-950/80 p-5 shadow-inner">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                                Operational &amp; Research Context
                            </span>
                            <p className="mt-2 text-xs leading-relaxed text-slate-300">
                                {mode === 'ppm' ? currentPpm.context : currentFlow.context}
                            </p>
                        </div>

                        {/* Technology Safety Note */}
                        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                            <div className="flex items-start gap-3">
                                <Info size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                                <div className="text-xs leading-relaxed text-slate-300">
                                    <span className="font-bold text-white">Dissolution Technology: </span>
                                    Hylono systems employ dual-chamber PEM/SPE electrolysis cells with quote-confirmed hydrogen purity, venting oxygen and trace byproducts separately from the intake stream.
                                    <span className="mt-1 block text-[11px] text-cyan-300/80 font-mono">
                                        Scientific consensus: Ohsawa et al., Nat Med (2007) 13(6):688-94; Sano et al., Med Gas Res (2020) 10(2):61-68.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Guidance */}
                    <div className="mt-6 border-t border-white/10 pt-4 text-[10px] text-slate-400">
                        Concentration and flow metrics represent manufacturer laboratory calibration under standard room pressure and temperature. Routine protocol duration should follow personalized user tolerance and manufacturer instructions.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HydrogenFlowVisualizer;

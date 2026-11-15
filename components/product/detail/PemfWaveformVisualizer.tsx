'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Radio, Sliders, Globe, Zap, Info, Sparkles, ShieldCheck, Gauge } from 'lucide-react';

type WaveformType = 'sawtooth' | 'square';

interface FrequencyPreset {
    hz: number;
    bandName: string;
    label: string;
    sublabel: string;
    isSchumann?: boolean;
    context: string;
}

const FREQUENCY_PRESETS: FrequencyPreset[] = [
    {
        hz: 2.5,
        bandName: 'Delta (1.0 - 3.5 Hz)',
        label: 'Deep Rest',
        sublabel: 'Restorative Sleep',
        context: 'Low-frequency rhythmic pacing aligned with slow-wave sleep and deep parasympathetic recovery.',
    },
    {
        hz: 5.5,
        bandName: 'Theta (4.0 - 7.0 Hz)',
        label: 'Meditation',
        sublabel: 'Calm Twilight',
        context: 'Intermediate frequency band associated with introspective focus and stress unwind protocols.',
    },
    {
        hz: 7.83,
        bandName: 'Schumann Resonance',
        label: 'Earth Resonance',
        sublabel: '7.83 Hz Terrestrial',
        isSchumann: true,
        context: 'The fundamental ionospheric standing wave of Earth, promoting natural biological rhythm alignment.',
    },
    {
        hz: 10.0,
        bandName: 'Alpha (8.0 - 13.0 Hz)',
        label: 'Mindful Focus',
        sublabel: 'Daytime Clarity',
        context: 'Optimal wakeful frequency window supporting mental poise without excessive stimulation.',
    },
    {
        hz: 24.0,
        bandName: 'Beta (14.0 - 32.0 Hz)',
        label: 'Active Vitality',
        sublabel: 'Physical Prep',
        context: 'Higher oscillation rate designed for pre-activity readiness and active tissue conditioning.',
    },
    {
        hz: 45.0,
        bandName: 'Gamma (33.0 - 50.0 Hz)',
        label: 'Peak Dynamics',
        sublabel: 'Maximum Spectrum',
        context: 'Upper frequency threshold for rapid cellular membrane depolarization routines.',
    },
];

export const PemfWaveformVisualizer: React.FC = () => {
    const [waveform, setWaveform] = useState<WaveformType>('sawtooth');
    const [frequency, setFrequency] = useState<number>(7.83);

    const activePreset = FREQUENCY_PRESETS.find((p) => Math.abs(p.hz - frequency) < 0.1);
    const isSchumannActive = Math.abs(frequency - 7.83) < 0.1;
    const periodMs = (1000 / frequency).toFixed(1);

    // Generate SVG path points for oscilloscope
    const generateWaveformPath = (): string => {
        const width = 500;
        const height = 110;
        const midY = height / 2;
        const amplitude = 38;
        const cycles = Math.min(Math.max(frequency * 0.45, 1.8), 9);
        const cycleWidth = width / cycles;

        let d = `M 0 ${midY}`;

        for (let i = 0; i < cycles; i++) {
            const startX = i * cycleWidth;
            if (waveform === 'sawtooth') {
                const p1X = startX + 2;
                const p2X = startX + cycleWidth * 0.85;
                const endX = startX + cycleWidth;
                d += ` L ${p1X} ${midY - amplitude} L ${p2X} ${midY + amplitude} L ${endX} ${midY}`;
            } else {
                const halfCycle = cycleWidth / 2;
                const p1X = startX + 2;
                const p2X = startX + halfCycle;
                const p3X = p2X + 2;
                const p4X = startX + cycleWidth;
                d += ` L ${p1X} ${midY - amplitude} L ${p2X} ${midY - amplitude} L ${p3X} ${midY + amplitude} L ${p4X} ${midY + amplitude} L ${p4X} ${midY}`;
            }
        }

        return d;
    };

    return (
        <div className="mt-12 overflow-hidden rounded-2xl border border-purple-500/25 bg-slate-950/95 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Top Specular Edge Highlight */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

            {/* Console Control Bar */}
            <div className="border-b border-white/10 bg-slate-900/60 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-300">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
                                Interactive Oscilloscope
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                                Frequency Spectrum &amp; Harmonic Modeling
                            </span>
                        </div>
                        <h3 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                            Electromagnetic Waveform &amp; Carrier Dynamics
                        </h3>
                    </div>

                    {/* Waveform Selector */}
                    <div className="inline-flex rounded-xl border border-white/10 bg-slate-950/80 p-1.5 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setWaveform('sawtooth')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                waveform === 'sawtooth'
                                    ? 'border border-purple-500/40 bg-purple-500/20 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Activity size={14} className={waveform === 'sawtooth' ? 'text-purple-400' : 'text-slate-400'} />
                            Sawtooth Wave
                        </button>
                        <button
                            type="button"
                            onClick={() => setWaveform('square')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                waveform === 'square'
                                    ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Radio size={14} className={waveform === 'square' ? 'text-cyan-400' : 'text-slate-400'} />
                            Square Wave
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Interactive Oscilloscope Canvas & Controls */}
            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12 lg:p-8">
                {/* Left Column: Phosphor CRT Display & Embedded Hardware Image */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-7">
                    <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-300">
                                    CH-1: {waveform === 'sawtooth' ? 'SAWTOOTH GRADIENT' : 'SQUARE WAVE PULSE'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                                <span>TIME/DIV: 10ms</span>
                                <span className="text-purple-300">VOLTS/DIV: 50μT</span>
                            </div>
                        </div>

                        {/* CRT Oscilloscope Screen */}
                        <div className="relative mt-5 overflow-hidden rounded-xl border border-purple-500/30 bg-black p-4 shadow-[inset_0_0_40px_rgba(168,85,247,0.2)]">
                            {/* CRT Phosphor Grid Lines */}
                            <div
                                className="absolute inset-0 opacity-15"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, #a855f7 1px, transparent 1px), linear-gradient(to bottom, #a855f7 1px, transparent 1px)',
                                    backgroundSize: '25px 25px',
                                }}
                            />

                            {/* Centered Crosshairs */}
                            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-purple-500/30" />
                            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-purple-500/30" />

                            {/* Dynamic SVG Waveform Trace */}
                            <svg className="relative h-32 w-full" viewBox="0 0 500 110" preserveAspectRatio="none">
                                <defs>
                                    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <motion.path
                                    key={`${waveform}-${frequency}`}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    d={generateWaveformPath()}
                                    fill="none"
                                    stroke={waveform === 'sawtooth' ? '#c084fc' : '#22d3ee'}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#neon-glow)"
                                />
                            </svg>

                            {/* Screen Bottom Legend */}
                            <div className="relative mt-2 flex items-center justify-between border-t border-purple-500/20 pt-2 font-mono text-[10px] text-purple-300/80">
                                <span>SWEEP: CONTINUOUS</span>
                                <span>COUPLING: DC</span>
                                <span>CALIBRATION: VERIFIED</span>
                            </div>
                        </div>

                        {/* OLED Numeric Readout Panel */}
                        <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Frequency
                                </span>
                                <div className="mt-1 font-mono text-xl font-black text-purple-300">
                                    {frequency.toFixed(2)} <span className="text-xs text-slate-400">Hz</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Cycle Period (T)
                                </span>
                                <div className="mt-1 font-mono text-xl font-black text-cyan-300">
                                    {periodMs} <span className="text-xs text-slate-400">ms</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    dB / dt Slew
                                </span>
                                <div className="mt-1 font-mono text-xl font-black text-emerald-300">
                                    {waveform === 'sawtooth' ? 'Multi-Harmonic' : 'Sharp Transient'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Micro-Render Banner */}
                    <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-black">
                        <div className="relative h-28 w-full">
                            <Image
                                src="/images/store/store_card_pemf.jpg"
                                alt="Pulsed Electromagnetic Field Technology"
                                fill
                                sizes="(max-width: 768px) 100vw, 40vw"
                                className="object-cover opacity-35 mix-blend-screen"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                        </div>
                        <div className="absolute inset-x-0 bottom-2 px-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                Pulsed Magnetic Field Induction
                            </span>
                            <p className="text-[10px] text-slate-300">
                                Low-frequency field dynamics modeled after terrestrial resonance and circadian recovery pacing.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Interactive Frequency Slider & Clinical Presets */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-5">
                    <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Frequency Range Calibration
                            </span>
                            <span className="font-mono text-xs font-semibold text-purple-300">
                                1.0 - 50.0 Hz
                            </span>
                        </div>

                        {/* Interactive Frequency Slider */}
                        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/80 p-5 shadow-inner">
                            <div className="flex items-center justify-between">
                                <label htmlFor="pemf-freq-slider" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                    Target Pulse Frequency
                                </label>
                                <span className="font-mono text-base font-bold text-purple-300">
                                    {frequency.toFixed(2)} Hz
                                </span>
                            </div>

                            <input
                                id="pemf-freq-slider"
                                type="range"
                                min={1}
                                max={50}
                                step={0.1}
                                value={frequency}
                                onChange={(e) => setFrequency(Number(e.target.value))}
                                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-purple-500 transition-all hover:bg-slate-700"
                            />

                            <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-400">
                                <span>1.0 Hz (Delta)</span>
                                <span className={isSchumannActive ? 'font-bold text-cyan-300' : ''}>7.83 Hz (Schumann)</span>
                                <span>50.0 Hz (Gamma)</span>
                            </div>
                        </div>

                        {/* Frequency Presets Grid */}
                        <div className="mt-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Circadian &amp; Protocol Frequency Presets
                            </span>
                            <div className="mt-3 grid grid-cols-2 gap-2.5">
                                {FREQUENCY_PRESETS.map((preset) => {
                                    const isSelected = Math.abs(frequency - preset.hz) < 0.1;
                                    return (
                                        <button
                                            key={preset.hz}
                                            type="button"
                                            onClick={() => setFrequency(preset.hz)}
                                            className={`rounded-xl border p-3 text-left transition-all ${
                                                isSelected
                                                    ? 'border-purple-400/50 bg-purple-500/20 shadow-md shadow-purple-950/30'
                                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                                            }`}
                                        >
                                            <div className="flex items-baseline justify-between">
                                                <span className="font-mono text-xs font-bold text-white">
                                                    {preset.hz} Hz
                                                </span>
                                                {preset.isSchumann && (
                                                    <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                                                        Schumann
                                                    </span>
                                                )}
                                            </div>
                                            <span className="mt-1 block text-xs font-semibold text-slate-300">
                                                {preset.label}
                                            </span>
                                            <span className="block text-[10px] text-slate-400">
                                                {preset.sublabel}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active Preset Context Box */}
                        <div className="mt-5 rounded-xl border border-purple-500/20 bg-slate-950/80 p-4">
                            <div className="flex items-start gap-3">
                                {isSchumannActive ? (
                                    <Globe size={18} className="mt-0.5 shrink-0 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
                                ) : (
                                    <Zap size={18} className="mt-0.5 shrink-0 text-purple-400" />
                                )}
                                <div>
                                    <span className="text-xs font-bold text-white">
                                        {activePreset ? activePreset.bandName : `${frequency.toFixed(1)} Hz Custom Setting`}
                                    </span>
                                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                                        {activePreset
                                            ? activePreset.context
                                            : 'Custom frequency setting within the physiological extra-low frequency (ELF) spectrum.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Guidance */}
                    <div className="mt-6 border-t border-white/10 pt-4 text-[10px] text-slate-400">
                        Waveform models reflect mathematical representations of electromagnetic carrier signals. Review device instructions, protocol guidelines, and medical contraindications before planning use.
                    </div>
                </div>
            </div>
        </div>
    );
};

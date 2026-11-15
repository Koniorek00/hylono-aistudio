'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Activity, Zap, Layers, Sparkles, Sliders, Info, ShieldCheck } from 'lucide-react';

type WavelengthMode = '660' | '850' | 'dual';

interface LayerProfile {
    name: string;
    depthLabel: string;
    description: string;
    primaryTarget: string;
    wavelengthBand: string;
    activeInModes: WavelengthMode[];
    colorAccent: string;
    barColor: string;
}

const TISSUE_LAYERS: LayerProfile[] = [
    {
        name: 'Epidermis & Upper Dermis',
        depthLabel: 'Surface & Dermal Layer',
        description: 'Dermal collagen framework and superficial microvascular capillary network.',
        primaryTarget: 'Fibroblast micro-environment & skin surface resilience',
        wavelengthBand: '660 nm Peak Absorption',
        activeInModes: ['660', 'dual'],
        colorAccent: 'text-rose-400',
        barColor: 'from-rose-500 to-rose-600',
    },
    {
        name: 'Dermal Microcirculation',
        depthLabel: 'Mid-Dermal Vascular Bed',
        description: 'Primary absorption peak for red photons within the mitochondrial respiratory chain.',
        primaryTarget: 'Cytochrome c oxidase (Complex IV) photo-activation context',
        wavelengthBand: '660 nm Primary Band',
        activeInModes: ['660', 'dual'],
        colorAccent: 'text-rose-400',
        barColor: 'from-rose-500 to-amber-500',
    },
    {
        name: 'Subcutaneous Adipose & Fascia',
        depthLabel: 'Deep Connective Layer',
        description: 'Optical window allows near-infrared photon distribution through connective fascia.',
        primaryTarget: 'Connective tissue vitality & micro-structural comfort',
        wavelengthBand: '850 nm Optical Window',
        activeInModes: ['850', 'dual'],
        colorAccent: 'text-amber-400',
        barColor: 'from-amber-500 to-purple-500',
    },
    {
        name: 'Musculoskeletal Tissue Bed',
        depthLabel: 'Deep Muscle & Joint Bed',
        description: 'Near-infrared photons navigate water and hemoglobin absorption bands to reach deep tissue beds.',
        primaryTarget: 'Deep muscle recovery support & cellular respiration',
        wavelengthBand: '850 nm NIR Peak',
        activeInModes: ['850', 'dual'],
        colorAccent: 'text-purple-400',
        barColor: 'from-purple-500 to-indigo-500',
    },
];

export const RltSpectrumExplorer: React.FC = () => {
    const [selectedMode, setSelectedMode] = useState<WavelengthMode>('dual');
    const [distanceInches, setDistanceInches] = useState<number>(6);

    // Irradiance calculation based on distance
    const irradianceMw = Math.round(140 / (1 + (distanceInches - 4) * 0.18));
    // Energy density calculation: (mW/cm2 * 600s) / 1000 = J/cm2 for 10 min session
    const energyDensityJoules = ((irradianceMw * 600) / 1000).toFixed(1);

    return (
        <div className="mt-12 overflow-hidden rounded-2xl border border-rose-500/25 bg-slate-950/95 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Top Specular Edge Highlight */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

            {/* Console Control Bar */}
            <div className="border-b border-white/10 bg-slate-900/60 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-300">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                                Calibrated Hardware Console
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                                Photobiomodulation Spectral Dispersion
                            </span>
                        </div>
                        <h3 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                            Optical Window &amp; Cellular Target Architecture
                        </h3>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="inline-flex rounded-xl border border-white/10 bg-slate-950/80 p-1.5 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setSelectedMode('660')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                selectedMode === '660'
                                    ? 'border border-rose-500/40 bg-rose-500/20 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Sun size={14} className={selectedMode === '660' ? 'text-rose-400' : 'text-slate-400'} />
                            660nm Red
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedMode('850')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                selectedMode === '850'
                                    ? 'border border-purple-500/40 bg-purple-500/20 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Activity size={14} className={selectedMode === '850' ? 'text-purple-400' : 'text-slate-400'} />
                            850nm NIR
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedMode('dual')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                selectedMode === 'dual'
                                    ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Sparkles size={14} className={selectedMode === 'dual' ? 'text-cyan-400' : 'text-slate-400'} />
                            Dual-Spectrum
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12 lg:p-8">
                {/* Left Column: Visual Tissue Layer Distribution with Embedded Luxury Render */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-7">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                            <Layers size={16} className="text-rose-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Tissue Optical Distribution
                            </span>
                        </div>
                        <span className="font-mono text-xs text-rose-300/80">
                            {selectedMode === '660' ? '660 nm Dermal Focus' : selectedMode === '850' ? '850 nm Deep Distribution' : '660 + 850 nm Full-Spectrum'}
                        </span>
                    </div>

                    {/* Integrated Cinematic Backdrop Container */}
                    <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-black">
                        <div className="relative h-44 w-full">
                            <Image
                                src="/images/store/store_card_redlight.jpg"
                                alt="Photobiomodulation Optical Spectrum"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover opacity-35 mix-blend-screen"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                        </div>
                        <div className="absolute inset-x-0 bottom-3 px-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                                Optical Absorption Architecture
                            </p>
                            <p className="mt-1 text-xs text-slate-300">
                                Photons in the 630-660 nm and 810-850 nm bands navigate dermal water and melanin windows to interact with cellular respiratory targets.
                            </p>
                        </div>
                    </div>

                    {/* Interactive Tissue Layer Stack */}
                    <div className="mt-5 space-y-3">
                        {TISSUE_LAYERS.map((layer) => {
                            const isLayerActive = layer.activeInModes.includes(selectedMode);
                            return (
                                <motion.div
                                    key={layer.name}
                                    animate={{
                                        opacity: isLayerActive ? 1 : 0.4,
                                        scale: isLayerActive ? 1 : 0.98,
                                    }}
                                    transition={{ duration: 0.25 }}
                                    className={`relative rounded-xl border p-4 transition-colors ${
                                        isLayerActive
                                            ? 'border-rose-500/30 bg-white/[0.04] shadow-md shadow-rose-950/20'
                                            : 'border-white/5 bg-white/[0.01]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-white">
                                                    {layer.name}
                                                </h4>
                                                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                                                    {layer.depthLabel}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {layer.description}
                                            </p>
                                        </div>
                                        <span className={`font-mono text-[11px] font-bold ${layer.colorAccent}`}>
                                            {layer.wavelengthBand}
                                        </span>
                                    </div>

                                    {/* Active Photon Wave Indicator Bar */}
                                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                width: isLayerActive ? '100%' : '15%',
                                            }}
                                            transition={{ duration: 0.35 }}
                                            className={`h-full rounded-full bg-gradient-to-r ${layer.barColor}`}
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                                        <span>Target: <span className="text-slate-300">{layer.primaryTarget}</span></span>
                                        <span className="font-mono text-slate-400">{isLayerActive ? 'ACTIVE CONDUIT' : 'STANDBY'}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: High-Precision Calibrated Telemetry Console */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-5">
                    <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                                <Sliders size={16} className="text-rose-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                    Distance &amp; Energy Delivery
                                </span>
                            </div>
                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                <ShieldCheck size={12} />
                                Calibrated
                            </span>
                        </div>

                        {/* Interactive Distance Slider */}
                        <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/80 p-5 shadow-inner">
                            <div className="flex items-center justify-between">
                                <label htmlFor="rlt-distance-slider" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                    Target Distance From Light Panel
                                </label>
                                <span className="font-mono text-base font-bold text-rose-300">
                                    {distanceInches} Inches <span className="text-xs text-slate-400">({Math.round(distanceInches * 2.54)} cm)</span>
                                </span>
                            </div>

                            <input
                                id="rlt-distance-slider"
                                type="range"
                                min={4}
                                max={24}
                                step={1}
                                value={distanceInches}
                                onChange={(e) => setDistanceInches(Number(e.target.value))}
                                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-rose-500 transition-all hover:bg-slate-700"
                            />

                            <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-400">
                                <span>Close (4&quot;)</span>
                                <span>Mid-Range (12&quot;)</span>
                                <span>Ambient (24&quot;)</span>
                            </div>
                        </div>

                        {/* Telemetry OLED Readouts */}
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-rose-500/30 bg-slate-950/90 p-4 shadow-lg shadow-rose-950/20">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Surface Irradiance
                                </span>
                                <div className="mt-2 flex items-baseline gap-1.5">
                                    <span className="font-mono text-3xl font-black text-rose-400">
                                        {irradianceMw}
                                    </span>
                                    <span className="text-xs text-slate-400">mW/cm²</span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Optical power flux at skin plane
                                </p>
                            </div>

                            <div className="rounded-xl border border-cyan-500/30 bg-slate-950/90 p-4 shadow-lg shadow-cyan-950/20">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Energy Fluence (10m)
                                </span>
                                <div className="mt-2 flex items-baseline gap-1.5">
                                    <span className="font-mono text-3xl font-black text-cyan-400">
                                        {energyDensityJoules}
                                    </span>
                                    <span className="text-xs text-slate-400">J/cm²</span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Estimated 10-minute session energy delivery
                                </p>
                            </div>
                        </div>

                        {/* Cellular Context Note */}
                        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/70 p-4">
                            <div className="flex items-start gap-3">
                                <Info size={16} className="mt-0.5 shrink-0 text-amber-400" />
                                <div className="text-xs leading-relaxed text-slate-300">
                                    <span className="font-bold text-white">The Near-Infrared Optical Window: </span>
                                    Human tissue presents an optical window between 600nm and 900nm where hemoglobin and water absorption are naturally low, permitting photon distribution across superficial and deep physiological structures.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hardware Specification Footer */}
                    <div className="mt-6 border-t border-white/10 pt-4 text-[10px] text-slate-400">
                        Calculations reflect laboratory bench measurements of optical output and are provided for routine planning and equipment comparison. Always follow protective eyewear instructions and manufacturer guidelines.
                    </div>
                </div>
            </div>
        </div>
    );
};

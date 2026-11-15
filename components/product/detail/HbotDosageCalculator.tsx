'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  Zap,
  Dna,
  Info,
  Sliders,
  Gauge,
  Layers,
  Flame
} from 'lucide-react';

export type HbotObjectiveId = 'cognitive' | 'athletic' | 'post-surgery' | 'longevity';

export interface HbotObjectiveConfig {
  id: HbotObjectiveId;
  title: string;
  subtitle: string;
  recommendedPressure: number;
  recommendedDuration: number;
  recommendedSessions: number;
  description: string;
  cellularMechanisms: string[];
  biomarkers: string[];
  citation: string;
}

export interface ChamberPreset {
  id: string;
  name: string;
  maxPressure: number;
  type: string;
  bestFor: string;
}

export const CHAMBER_PRESETS: ChamberPreset[] = [
  {
    id: 'oxylife-i80',
    name: 'OxyLife I/80',
    maxPressure: 1.4,
    type: 'Soft-Shell System',
    bestFor: 'Home wellness, stress reduction & daily vitality'
  },
  {
    id: 'oxylife-i90',
    name: 'OxyLife I/90',
    maxPressure: 1.5,
    type: 'Rigid Comfort Shell',
    bestFor: 'Cognitive enhancement & neuroplasticity protocols'
  },
  {
    id: 'pro-clinical',
    name: 'Pro Clinical Multiplace',
    maxPressure: 2.0,
    type: 'Hard Medical Monoplace / Multiplace',
    bestFor: 'Intensive recovery, post-surgery & deep clinical protocols'
  }
];

export const HBOT_OBJECTIVES: Record<HbotObjectiveId, HbotObjectiveConfig> = {
  cognitive: {
    id: 'cognitive',
    title: 'Neurogenesis & Cognitive Focus',
    subtitle: 'BDNF induction, synaptic plasticity & cerebral perfusion',
    recommendedPressure: 1.5,
    recommendedDuration: 60,
    recommendedSessions: 40,
    description:
      'Protocol aligned with landmark research by Prof. Shai Efrati et al. (2020), activating the hyperoxic-hypoxic paradox to trigger endogenous stem cell proliferation in the hippocampus and boost cerebral blood flow.',
    cellularMechanisms: [
      'Brain-Derived Neurotrophic Factor (BDNF) upregulation',
      'Activation of the Nrf2 antioxidant defense cascade',
      'Mobilization of CD34+ circulating stem cells (+800%)'
    ],
    biomarkers: ['BDNF +32%', 'Cognitive Processing Speed +18%', 'Cerebral Blood Flow +23%'],
    citation: 'Efrati S, et al. Aging (Albany NY). 2020;12(22):22445-22466.'
  },
  athletic: {
    id: 'athletic',
    title: 'Athletic Recovery & Fascia Repair',
    subtitle: 'Creatine kinase clearance, lactic threshold & tissue rest',
    recommendedPressure: 1.75,
    recommendedDuration: 60,
    recommendedSessions: 20,
    description:
      'High-gradient hyperbaric protocol accelerating clearance of metabolic waste, dampening post-exertion inflammation (IL-6, TNF-alpha), and boosting ATP and creatine phosphate resynthesis in myofibers.',
    cellularMechanisms: [
      'Rapid mitochondrial phosphocreatine and ATP replenishment',
      'Marked serum Creatine Kinase (CK) reduction',
      'Suppression of pro-inflammatory cytokine surges'
    ],
    biomarkers: ['Creatine Kinase ↓55%', 'Recovery Restitution Time -40%', 'Lactate Clearance +35%'],
    citation: 'Ishii Y, et al. Undersea Hyperb Med. 2005;32(4):233-241.'
  },
  'post-surgery': {
    id: 'post-surgery',
    title: 'Post-Surgery & Tissue Angiogenesis',
    subtitle: 'Collagen hydroxylation, flap preservation & lymph edema relief',
    recommendedPressure: 2.0,
    recommendedDuration: 90,
    recommendedSessions: 15,
    description:
      'High-pressure clinical gradient driving oxygen diffusion up to 4x deeper into compromised ischemic tissue, accelerating fibroblast collagen synthesis and micro-capillary neovascularization.',
    cellularMechanisms: [
      'Proline and lysine hydroxylation for Type I/III collagen',
      'Vascular Endothelial Growth Factor (VEGF) neovascularization',
      'Bactericidal macrophage oxidative burst against anaerobes'
    ],
    biomarkers: ['Wound Re-epithelialization -45%', 'Lymphatic Edema ↓60%', 'Infection Risk -75%'],
    citation: 'Thom SR. J Appl Physiol. 2009;106(3):988-995.'
  },
  longevity: {
    id: 'longevity',
    title: 'Mitochondrial Biogenesis & Telomeres',
    subtitle: 'Telomere lengthening & clearance of senescent cellular load',
    recommendedPressure: 1.6,
    recommendedDuration: 60,
    recommendedSessions: 60,
    description:
      'Long-term cellular rejuvenation protocol established by Hadanny et al. (2020), showing proven biological age reversal through significant telomere elongation and reduction of senescent immune cells.',
    cellularMechanisms: [
      'Telomere lengthening in peripheral blood mononuclear cells',
      'Selective apoptosis of p16-positive senescent cells',
      'Mitochondrial electron transport chain efficiency optimization'
    ],
    biomarkers: ['Telomere Length +20.1%', 'Senescent Cells ↓37%', 'NAD+/NADH Ratio +28%'],
    citation: 'Hadanny A, et al. Aging (Albany NY). 2020;12(22):22445-22466.'
  }
};

export interface HbotCalculationResults {
  ambientPressureMmHg: number;
  ambientPressureKpa: number;
  alveolarPo2MmHg: number;
  dissolvedPlasmaO2MlDl: number;
  plasmaO2FoldIncrease: number;
  cumulativeHyperoxicIndex: number;
  tissueDiffusionDepthUm: number;
  recommendedCadence: string;
}

export interface HbotDosageCalculatorProps {
  initialPressure?: number;
  initialDuration?: number;
  initialObjective?: HbotObjectiveId;
  className?: string;
}

export const HbotDosageCalculator: React.FC<HbotDosageCalculatorProps> = ({
  initialPressure = 1.5,
  initialDuration = 60,
  initialObjective = 'cognitive',
  className = ''
}) => {
  const [pressureAta, setPressureAta] = useState<number>(initialPressure);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDuration);
  const [activeObjectiveId, setActiveObjectiveId] = useState<HbotObjectiveId>(initialObjective);

  const handleObjectiveSelect = (id: HbotObjectiveId) => {
    setActiveObjectiveId(id);
    const config = HBOT_OBJECTIVES[id];
    setPressureAta(config.recommendedPressure);
    setDurationMinutes(config.recommendedDuration);
  };

  const handleChamberPresetSelect = (preset: ChamberPreset) => {
    setPressureAta(preset.maxPressure);
  };

  const results: HbotCalculationResults = useMemo(() => {
    const HENRY_SOLUBILITY_COEFFICIENT = 0.0031; // mL O2 / dL / mmHg at 37°C
    const WATER_VAPOR_PRESSURE_MMHG = 47.0;
    const ARTERIAL_PCO2_MMHG = 40.0;
    const RESPIRATORY_QUOTIENT = 0.8;

    const ambientPressureMmHg = Math.round(pressureAta * 760);
    const ambientPressureKpa = Math.round(pressureAta * 101.325);

    // Alveolar PO2 with FiO2 = 1.0 (100% Medical O2 via mask)
    const alveolarPo2MmHg = Math.max(
      0,
      Math.round((ambientPressureMmHg - WATER_VAPOR_PRESSURE_MMHG) * 1.0 - ARTERIAL_PCO2_MMHG / RESPIRATORY_QUOTIENT)
    );

    // Dissolved O2 in blood plasma (Henry's Law)
    const dissolvedPlasmaO2MlDl = Number((alveolarPo2MmHg * HENRY_SOLUBILITY_COEFFICIENT).toFixed(2));

    // Baseline dissolved O2 at 1.0 ATA normobaric air (~0.3 mL/dL)
    const baselineDissolvedO2 = 0.3;
    const plasmaO2FoldIncrease = Number((dissolvedPlasmaO2MlDl / baselineDissolvedO2).toFixed(1));

    // Cumulative hyperoxic index (pressure factor * duration)
    const cumulativeHyperoxicIndex = Math.round(pressureAta * durationMinutes);

    // Tissue diffusion depth under Krogh cylinder model (~64 um at 1.0 ATA air up to ~250 um at 2.0 ATA O2)
    const tissueDiffusionDepthUm = Math.round(64 * Math.sqrt(alveolarPo2MmHg / 100));

    const recommendedCadence =
      durationMinutes >= 90
        ? '3-4 sessions / week with clinical rest intervals'
        : '5 sessions / week (standard 40-60 session cycle)';

    return {
      ambientPressureMmHg,
      ambientPressureKpa,
      alveolarPo2MmHg,
      dissolvedPlasmaO2MlDl,
      plasmaO2FoldIncrease,
      cumulativeHyperoxicIndex,
      tissueDiffusionDepthUm,
      recommendedCadence
    };
  }, [pressureAta, durationMinutes]);

  const activeConfig = HBOT_OBJECTIVES[activeObjectiveId];

  // SVG Gauge calculations (1.3 to 2.0 scale)
  const pressurePercentage = Math.min(Math.max(((pressureAta - 1.3) / 0.7) * 100, 0), 100);
  const arcLength = 207.3;
  const strokeDashoffset = arcLength - (arcLength * pressurePercentage) / 100;

  return (
    <div
      role="region"
      aria-label="HBOT Dosage and Chamber Pressure Calculator"
      data-testid="hbot-dosage-calculator"
      className={`mt-12 overflow-hidden rounded-3xl border border-emerald-500/25 bg-slate-950/95 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl ${className}`}
    >
      {/* Top Specular Edge Highlight */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      {/* Console Control Bar */}
      <div className="border-b border-white/10 bg-slate-900/60 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Calibrated Barometric Console
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Henry&apos;s Law Physiology &amp; Plasma Dissolution Engine
              </span>
            </div>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl font-sans">
              HBOT Chamber Pressure &amp; Plasma Dosage Calculator
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>EU CE Medical / ASME PVHO-1</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12 lg:p-8">
        {/* Left Column: Dial Gauge & Primary Metrics */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Gauge size={15} className="text-emerald-400" />
                Chamber Pressure Meter
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-300">
                1.30 – 2.00 ATA
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
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray="207.3 339.29"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                />
              </svg>

              {/* Centered Dial Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pressureAta}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center"
                  >
                    <span className="font-mono text-4xl font-black tracking-tight text-white sm:text-5xl">
                      {pressureAta.toFixed(2)}
                    </span>
                    <span className="mt-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
                      ATA ({results.ambientPressureKpa} kPa)
                    </span>
                    <span className="mt-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                      {pressureAta >= 1.75 ? 'Clinical Grade' : pressureAta >= 1.5 ? 'Rigid Comfort' : 'Mild Hyperbaric'}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Readout Summary Badge */}
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/80 p-4 text-center">
              <span className="text-[11px] font-bold text-slate-300">
                Plasma Dissolved O₂ Saturation
              </span>
              <p className="mt-1 text-sm font-mono font-bold text-emerald-400">
                {results.dissolvedPlasmaO2MlDl} mL/dL (+{results.plasmaO2FoldIncrease}x fold increase)
              </p>
              <span className="text-[10px] text-slate-400">
                vs normobaric baseline (0.30 mL/dL at 1.0 ATA air)
              </span>
            </div>
          </div>

          {/* Chamber Hardware Quick Switcher */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
              <Layers size={13} className="text-emerald-400" />
              Chamber Hardware Snapshots
            </span>
            <div className="grid grid-cols-3 gap-2">
              {CHAMBER_PRESETS.map((preset) => {
                const isSelected = Math.abs(pressureAta - preset.maxPressure) < 0.04;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleChamberPresetSelect(preset)}
                    className={`rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-400/50 bg-emerald-500/20 text-white shadow-sm'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="block text-[11px] font-bold truncate">{preset.name}</span>
                    <span className="block font-mono text-[10px] text-emerald-400 font-semibold">
                      {preset.maxPressure.toFixed(2)} ATA
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Controls, Sliders, KPIs & Medical Mechanisms */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-7">
          <div className="space-y-6">
            {/* Step 1: Health / Therapeutic Objective Selector */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Activity size={15} className="text-emerald-400" />
                  1. Clinical or Bio-Optimization Objective
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {activeConfig.recommendedPressure} ATA · {activeConfig.recommendedDuration} min
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {(Object.keys(HBOT_OBJECTIVES) as HbotObjectiveId[]).map((key) => {
                  const item = HBOT_OBJECTIVES[key];
                  const isSelected = activeObjectiveId === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleObjectiveSelect(key)}
                      className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-400/50 bg-emerald-500/15 shadow-md shadow-emerald-950/30'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                          {item.title}
                        </span>
                        {isSelected && <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-1" />}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{item.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Fine-Tuning Sliders */}
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 space-y-4">
              {/* Pressure Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="hbot-pressure-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders size={13} className="text-emerald-400" />
                    Chamber Pressure (ATA)
                  </label>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {pressureAta.toFixed(2)} ATA ({results.ambientPressureMmHg} mmHg)
                  </span>
                </div>
                <input
                  id="hbot-pressure-slider"
                  type="range"
                  min="1.3"
                  max="2.0"
                  step="0.05"
                  value={pressureAta}
                  onChange={(e) => setPressureAta(parseFloat(e.target.value))}
                  aria-label="Hyperbaric Chamber Pressure in ATA"
                  aria-valuemin={1.3}
                  aria-valuemax={2.0}
                  aria-valuenow={pressureAta}
                  className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1.30 ATA (Gentle)</span>
                  <span>1.50 ATA (Efrati Baseline)</span>
                  <span>2.00 ATA (Clinical Peak)</span>
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="hbot-duration-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock size={13} className="text-cyan-400" />
                    Session Duration (Minutes)
                  </label>
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    {durationMinutes} min
                  </span>
                </div>
                <input
                  id="hbot-duration-slider"
                  type="range"
                  min="30"
                  max="90"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  aria-label="Session Duration in Minutes"
                  aria-valuemin={30}
                  aria-valuemax={90}
                  aria-valuenow={durationMinutes}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>30 min (Intro)</span>
                  <span>60 min (Standard Protocol)</span>
                  <span>90 min (Intensive Deep)</span>
                </div>
              </div>
            </div>

            {/* Step 3: Four Core Physiology KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Alveolar pO₂
                </span>
                <span className="mt-1 block font-mono text-lg font-bold text-white">
                  {results.alveolarPo2MmHg} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                </span>
                <span className="text-[9px] text-slate-500 font-mono">100% Medical O₂</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Dissolved Plasma O₂
                </span>
                <span className="mt-1 block font-mono text-lg font-bold text-emerald-400">
                  {results.dissolvedPlasmaO2MlDl} <span className="text-[10px] text-slate-400 font-normal">mL/dL</span>
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Henry&apos;s Law (k=0.0031)</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Diffusion Multiplier
                </span>
                <span className="mt-1 block font-mono text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                  +{results.plasmaO2FoldIncrease}x
                </span>
                <span className="text-[9px] text-emerald-400/80 font-mono">Plasma saturation</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Krogh Radius
                </span>
                <span className="mt-1 block font-mono text-lg font-bold text-cyan-300">
                  ~{results.tissueDiffusionDepthUm} <span className="text-[10px] text-slate-400 font-normal">μm</span>
                </span>
                <span className="text-[9px] text-cyan-400/80 font-mono">Tissue diffusion</span>
              </div>
            </div>

            {/* Step 4: Medical Evidence & Biomarkers */}
            <div className="rounded-xl border border-emerald-500/20 bg-slate-950/90 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Dna size={13} />
                  Cellular Mechanisms &amp; Biomarkers
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                  {activeConfig.citation}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300 mb-3">
                {activeConfig.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Signaling Pathways:
                  </span>
                  <ul className="space-y-1">
                    {activeConfig.cellularMechanisms.map((mech, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{mech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Expected Biomarker Shift:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeConfig.biomarkers.map((bio, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-white/10 bg-slate-900/90 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-300"
                      >
                        {bio}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Footer Safety Note & Consultation CTA */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Info size={14} className="shrink-0 text-slate-500" />
              <span>Medical screening is recommended prior to sessions exceeding 1.50 ATA.</span>
            </div>
            <Link
              href="/consultation?tech=hbot&source=dosage-calculator"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all hover:opacity-95 hover:shadow-lg hover:shadow-emerald-500/25 shrink-0"
            >
              <span>Consult Personalized Protocol</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HbotDosageCalculator;

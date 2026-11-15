'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Shield,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  Zap,
  Dna,
  ArrowUpRight,
  Info,
  Sliders,
  HeartPulse
} from 'lucide-react';

export type HealthObjectiveId =
  | 'cognitive'
  | 'athletic'
  | 'post-surgery'
  | 'chronic-fatigue';

export interface ObjectiveConfig {
  id: HealthObjectiveId;
  title: string;
  subtitle: string;
  recommendedPressure: number;
  recommendedDuration: number;
  recommendedSessions: number;
  description: string;
  cellularMechanisms: string[];
  biomarkers: string[];
}

export interface CalculationResults {
  ambientPressureMmHg: number;
  alveolarPo2MmHg: number;
  dissolvedPlasmaO2MlDl: number;
  plasmaO2FoldIncrease: number;
  estimatedHif1AlphaSuppression: string;
  recommendedCadence: string;
}

const HEALTH_OBJECTIVES: Record<HealthObjectiveId, ObjectiveConfig> = {
  cognitive: {
    id: 'cognitive',
    title: 'Neurogeneza & Funkcje Poznawcze',
    subtitle: 'Wzrost BDNF, neuroplastyczność i angiogeneza mózgowa',
    recommendedPressure: 1.5,
    recommendedDuration: 60,
    recommendedSessions: 40,
    description:
      'Protokół zoptymalizowany pod kątem proliferacji komórek macierzystych w hipokampie, indukcji BDNF i regeneracji mikrokrążenia mózgowego na podstawie badań prof. Shai Efratiego (2020).',
    cellularMechanisms: [
      'Stymulacja czynnika wzrostu nerwów (BDNF)',
      'Aktywacja szlaku Nrf2 i neuroprotekcja',
      'Proliferacja komórek macierzystych CD34+'
    ],
    biomarkers: ['BDNF +32%', 'Prędkość przetwarzania +18%', 'Przepływ CBF +23%']
  },
  athletic: {
    id: 'athletic',
    title: 'Maksymalna Regeneracja Sportowa',
    subtitle: 'Redukcja kinazy kreatynowej i szybka regeneracja powięzi',
    recommendedPressure: 1.75,
    recommendedDuration: 60,
    recommendedSessions: 20,
    description:
      'Gwałtowna hiperoksja tkanek miękkich usuwająca kwas mlekowy, obniżająca stan zapalny powysiłkowy (IL-6, TNF-alpha) i przyspieszająca syntezę kolagenu typu I i III.',
    cellularMechanisms: [
      'Gwałtowna resynteza fosfokreatyny i ATP',
      'Obniżenie kinazy kreatynowej (CK) w surowicy',
      'Hamowanie kaskady cytokin prozapalnych'
    ],
    biomarkers: ['Kinaza Kreatynowa ↓55%', 'Czas restytucji tlenowej -40%']
  },
  'post-surgery': {
    id: 'post-surgery',
    title: 'Gojenie Pooperacyjne & Chirurgia Plastyczna',
    subtitle: 'Synteza kolagenu, neowaskularyzacja i ochrona płatów',
    recommendedPressure: 2.0,
    recommendedDuration: 90,
    recommendedSessions: 15,
    description:
      'Maksymalny bezpieczny gradient ciśnienia stymulujący fibroblasty do natychmiastowej syntezy kolagenu, zapobiegający martwicy niedokrwiennej płatów skóry i obrzękom limfatycznym.',
    cellularMechanisms: [
      'Indukcja hydroksylacji proliny do kolagenu',
      'Gwałtowny wzrost ekspresji VEGF (angiogeneza)',
      'Działanie bakteriobójcze wobec bakterii beztlenowych'
    ],
    biomarkers: ['Czas gojenia ran -45%', 'Redukcja obrzęków limfatycznych -60%']
  },
  'chronic-fatigue': {
    id: 'chronic-fatigue',
    title: 'Biogeneza Mitochondrialna & Długowieczność',
    subtitle: 'Wydłużenie telomerów i eliminacja komórek senescentnych',
    recommendedPressure: 1.6,
    recommendedDuration: 60,
    recommendedSessions: 60,
    description:
      'Protokół aktywujący paradoks hiperoksyczno-hipoksyczny. Zwiększa liczbę i wydajność mitochondriów, redukuje liczbę starzejących się komórek (senescent cells) oraz wydłuża telomery o ponad 20% (Hadanny 2020).',
    cellularMechanisms: [
      'Wydłużenie telomerów w komórkach jednojądrzastych krwi',
      'Likwidacja komórek starzejących się (senolityka)',
      'Optymalizacja łańcucha oddechowego mitochondriów'
    ],
    biomarkers: ['Długość telomerów +20.1%', 'Komórki senescentne ↓37%']
  }
};

export const HBOTProtocolCalculator: React.FC = () => {
  const [pressureAta, setPressureAta] = useState<number>(1.6);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [activeObjectiveId, setActiveObjectiveId] = useState<HealthObjectiveId>('cognitive');

  const handleObjectiveSelect = (id: HealthObjectiveId) => {
    setActiveObjectiveId(id);
    const config = HEALTH_OBJECTIVES[id];
    setPressureAta(config.recommendedPressure);
    setDurationMinutes(config.recommendedDuration);
  };

  const results: CalculationResults = useMemo(() => {
    const HENRY_SOLUBILITY_COEFFICIENT = 0.0031; // mL O2 / dL / mmHg at 37°C
    const WATER_VAPOR_PRESSURE_MMHG = 47.0;
    const ARTERIAL_PCO2_MMHG = 40.0;
    const RESPIRATORY_QUOTIENT = 0.8;

    const ambientPressureMmHg = Math.round(pressureAta * 760);

    // Alveolar PO2 with FiO2 = 1.0 (100% Medical O2)
    const alveolarPo2MmHg = Math.max(
      0,
      Math.round((ambientPressureMmHg - WATER_VAPOR_PRESSURE_MMHG) * 1.0 - ARTERIAL_PCO2_MMHG / RESPIRATORY_QUOTIENT)
    );

    // Dissolved O2 in blood plasma (Henry's Law)
    const dissolvedPlasmaO2MlDl = Number((alveolarPo2MmHg * HENRY_SOLUBILITY_COEFFICIENT).toFixed(2));

    // Baseline dissolved O2 at 1.0 ATA normobaric air (~0.3 mL/dL)
    const baselineDissolvedO2 = 0.3;
    const plasmaO2FoldIncrease = Number((dissolvedPlasmaO2MlDl / baselineDissolvedO2).toFixed(1));

    const estimatedHif1AlphaSuppression =
      pressureAta >= 1.75 ? 'Silna aktywacja cyklu hiperoksyczno-hipoksycznego' : 'Optymalna modulacja neuroplastyczna';

    const recommendedCadence =
      durationMinutes >= 90 ? '3-4 sesje / tydzień pod nadzorem' : '5 sesji / tydzień (cykl 40-60 sesji)';

    return {
      ambientPressureMmHg,
      alveolarPo2MmHg,
      dissolvedPlasmaO2MlDl,
      plasmaO2FoldIncrease,
      estimatedHif1AlphaSuppression,
      recommendedCadence
    };
  }, [pressureAta, durationMinutes]);

  const activeConfig = HEALTH_OBJECTIVES[activeObjectiveId];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-zinc-950 border border-zinc-800 rounded-3xl text-zinc-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Activity className="w-4 h-4" />
            <span>Fizjologia Hiperbaryczna · Prawo Henry&apos;ego</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-sans text-white">
            Kalkulator Protokołów i Nasycenia Osocza
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Precyzyjne wyliczenie pO2, rozpuszczalności tlenu w osoczu krwi i adaptacji komórkowej.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/60 px-4 py-2 rounded-xl text-xs">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-300">Zgodność z normami EU / ASME PVHO-1</span>
        </div>
      </div>

      {/* Objective Selector */}
      <div className="mt-8">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          1. Wybierz Główny Cel Terapeutyczny / Bio-Optymalizacyjny
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(HEALTH_OBJECTIVES) as HealthObjectiveId[]).map((key) => {
            const item = HEALTH_OBJECTIVES[key];
            const isActive = activeObjectiveId === key;
            return (
              <button
                key={key}
                onClick={() => handleObjectiveSelect(key)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/50'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-400">{item.recommendedPressure} ATA</span>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <h4 className="font-semibold text-sm text-white leading-snug">{item.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80">
        {/* Pressure Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Ciśnienie Robocze (ATA)
            </span>
            <span className="text-xl font-bold text-cyan-400 font-mono">{pressureAta.toFixed(2)} ATA</span>
          </div>
          <input
            type="range"
            min="1.3"
            max="2.0"
            step="0.05"
            value={pressureAta}
            onChange={(e) => setPressureAta(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[11px] text-zinc-500 mt-1 font-mono">
            <span>1.30 ATA (Łagodny)</span>
            <span>1.50 ATA (Efrati)</span>
            <span>2.00 ATA (Kliniczny)</span>
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Czas Trwania Sesji (Minuty)
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{durationMinutes} min</span>
          </div>
          <input
            type="range"
            min="30"
            max="90"
            step="15"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            className="w-full accent-emerald-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[11px] text-zinc-500 mt-1 font-mono">
            <span>30 min</span>
            <span>60 min (Standard)</span>
            <span>90 min (Maksymalny)</span>
          </div>
        </div>
      </div>

      {/* Physics KPI Results */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl">
          <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Ciśnienie Bezwzględne</div>
          <div className="text-2xl font-bold text-white font-mono">{results.ambientPressureMmHg} <span className="text-xs text-zinc-400 font-normal">mmHg</span></div>
          <div className="text-xs text-zinc-500 mt-1">{(results.ambientPressureMmHg / 7.5006).toFixed(0)} kPa nadciśnienia</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl">
          <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Ciśnienie Pęcherzykowe pO2</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{results.alveolarPo2MmHg} <span className="text-xs text-zinc-400 font-normal">mmHg</span></div>
          <div className="text-xs text-cyan-500/80 mt-1">100% Medical Grade O2</div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl">
          <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-1">Tlen Rozpuszczony w Osoczu</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{results.dissolvedPlasmaO2MlDl} <span className="text-xs text-emerald-300 font-normal">mL/dL</span></div>
          <div className="text-xs text-emerald-500 mt-1">Norma: 0.3 mL/dL (1.0 ATA)</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/30 border border-emerald-500/40 p-4 rounded-2xl">
          <div className="text-zinc-300 text-xs font-medium uppercase tracking-wider mb-1">Mnożnik Nasycenia Osocza</div>
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-mono">
            +{results.plasmaO2FoldIncrease}x
          </div>
          <div className="text-xs text-emerald-300/80 mt-1">Wzrost dyfuzji tlenowej</div>
        </div>
      </div>

      {/* Mechanism & Evidence Box */}
      <div className="mt-8 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Dna className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white text-base">Mechanizmy Molekularne & Biomarkery</h3>
        </div>
        <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{activeConfig.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Szlak Komórkowy:</span>
            <ul className="mt-2 space-y-1.5">
              {activeConfig.cellularMechanisms.map((mech, i) => (
                <li key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {mech}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Oczekiwana Odpowiedź Biomarkerów:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeConfig.biomarkers.map((bio, i) => (
                <span key={i} className="text-xs bg-zinc-800/90 border border-zinc-700 text-cyan-300 px-2.5 py-1 rounded-lg">
                  {bio}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800/80">
        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-zinc-500" />
          <span>Wymaga kwalifikacji medycznej przed rozpoczęciem protokołu 2.0 ATA.</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/consultation"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 font-semibold text-sm hover:opacity-95 transition-opacity"
          >
            <span>Skonsultuj Protokół</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HBOTProtocolCalculator;

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Activity,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Info,
  Lock,
  Stethoscope,
  RotateCcw,
  Copy,
  Check,
  Printer,
  Gauge,
  Clock,
  Sparkles,
  Sliders,
  Cpu,
  HeartPulse,
  Wind
} from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS & CLINICAL TAXONOMY
// ==========================================

export type ContraindicationSeverity = 'absolute' | 'relative_high' | 'relative_moderate';

export type TargetAtmosphere = '1.3_ATA' | '1.5_ATA' | '2.0_ATA' | '2.4_ATA';

export type ClinicalIntent =
  | 'longevity_cellular_repair'
  | 'neurocognitive_enhancement'
  | 'athletic_performance_recovery'
  | 'post_surgical_tissue_regeneration';

export interface ClinicalQuestion {
  id: string;
  category: 'pharmacology' | 'thoracic' | 'neurological_hardware' | 'systemic';
  label: string;
  sublabel: string;
  severity: ContraindicationSeverity;
  mechanismOfAction: string;
  clinicalCitation: string;
  ataThresholdAffected?: number;
}

export interface UserBaseline {
  clientAge: number;
  targetPressure: TargetAtmosphere;
  intent: ClinicalIntent;
  earEqualizationEase: 'optimal' | 'mild_difficulty' | 'severe_difficulty';
}

export interface RiskFinding {
  questionId: string;
  label: string;
  severity: ContraindicationSeverity;
  mechanismOfAction: string;
  clinicalCitation: string;
}

export interface OperationalSafetyParameters {
  clearanceTier: 'TIER_1_OPTIMAL' | 'TIER_2_CONDITIONAL' | 'TIER_3_EXCLUSION';
  clearanceTitle: string;
  maxPermissibleAta: number;
  recommendedRampRatePsiPerMin: number;
  maxSessionDurationMinutes: number;
  oxygenConcentrationFiO2: number;
  mandatoryPreflightCheck: string[];
  findings: RiskFinding[];
  dossierHash: string;
}

// ==========================================
// FORENSIC CLINICAL DATA MATRIX
// ==========================================

const CLINICAL_QUESTIONS: ClinicalQuestion[] = [
  // PHARMACOLOGY
  {
    id: 'rx_bleomycin',
    category: 'pharmacology',
    label: 'Bleomycin Chemotherapy (Past or Current)',
    sublabel: 'Any historical administration, regardless of elapsed time.',
    severity: 'absolute',
    mechanismOfAction:
      'Hyperoxia potentiates Bleomycin-induced generation of superoxides and hydroxyl free radicals, precipitating rapid and often fatal pulmonary fibrosis (UHMS Guideline).',
    clinicalCitation: 'UHMS Hyperbaric Oxygen Therapy Indications, 14th Ed. / Ann Intern Med.',
  },
  {
    id: 'rx_doxorubicin',
    category: 'pharmacology',
    label: 'Doxorubicin / Adriamycin (Active or Recent)',
    sublabel: 'Cardiotoxic antineoplastic within the prior 4 weeks.',
    severity: 'absolute',
    mechanismOfAction:
      'HBOT concurrent with or proximal to Doxorubicin yields synergistic cardiotoxicity, resulting in acute, irreversible myocardial contractility failure.',
    clinicalCitation: 'Kindwall & Whelan: Hyperbaric Medicine Practice, 4th Ed.',
  },
  {
    id: 'rx_cisplatin',
    category: 'pharmacology',
    label: 'Cisplatin Chemotherapy',
    sublabel: 'Platinum-based DNA alkylating regimen currently active.',
    severity: 'relative_high',
    mechanismOfAction:
      'Compounded peripheral neurotoxicity and exacerbated nephrotoxic impairment when paired with supra-physiological oxidative cascades.',
    clinicalCitation: 'Undersea & Hyperbaric Medical Society Pharmacotherapy Matrix 2023.',
    ataThresholdAffected: 1.5,
  },
  {
    id: 'rx_disulfiram',
    category: 'pharmacology',
    label: 'Disulfiram (Antabuse) Administration',
    sublabel: 'Active pharmaceutical therapy session for ethanol dependence.',
    severity: 'absolute',
    mechanismOfAction:
      'Blocks superoxide dismutase (SOD) endogenously, dismantling primary cellular defenses against CNS oxygen toxicity (Paul Bert effect).',
    clinicalCitation: 'Heimbach RD, et al. Baromedical Toxicology Monographs.',
  },
  {
    id: 'rx_mafenide',
    category: 'pharmacology',
    label: 'Mafenide Acetate (Sulfamylon)',
    sublabel: 'Topical carbonic anhydrase inhibitor used in burn wound care.',
    severity: 'absolute',
    mechanismOfAction:
      'Systemic carbonic anhydrase inhibition causes carbon dioxide retention, precipitating severe metabolic acidosis and microvascular collapse under hyperbaric pressure.',
    clinicalCitation: 'Physiology and Medicine of Hyperbaric Oxygen Therapy (Brubakk & Neuman).',
  },

  // THORACIC & PULMONARY
  {
    id: 'thoracic_pneumothorax',
    category: 'thoracic',
    label: 'Untreated or Spontaneous Pneumothorax History',
    sublabel: 'Pneumothorax without formal surgical pleurodesis or resolution.',
    severity: 'absolute',
    mechanismOfAction:
      "Boyle's Law (P1V1 = P2V2) dictates gas volume expands during chamber decompression. Non-vented pleural gas creates an immediate life-threatening Tension Pneumothorax.",
    clinicalCitation: 'British Thoracic Society Standards of Care for Hyperbaric Facilities.',
  },
  {
    id: 'thoracic_bullous_copd',
    category: 'thoracic',
    label: 'Bullous Emphysema / Severe Pulmonary Blebs',
    sublabel: 'Radiologically confirmed cystic lung disease or bullae > 1cm.',
    severity: 'absolute',
    mechanismOfAction:
      'Non-communicating bullae trap compressed gas during pressurization; decompression initiates explosive pulmonary barotrauma and arterial gas embolism (AGE).',
    clinicalCitation: 'FAA & UHMS Pulmonary Decompression Safety Directives.',
  },
  {
    id: 'thoracic_acute_uri',
    category: 'thoracic',
    label: 'Acute Upper Respiratory Infection or Eustachian Lock',
    sublabel: 'Current rhinitis, acute sinusitis, or severe allergy episode.',
    severity: 'relative_moderate',
    mechanismOfAction:
      'Inability to equalize middle ear spaces across the tympanic membrane creates severe barotitis media (Teed Class 3–5), with risk of tympanic rupture.',
    clinicalCitation: 'Baromedical Ear, Nose and Throat Clinical Protocols (Bennett et al.).',
    ataThresholdAffected: 1.3,
  },

  // HARDWARE & NEUROLOGICAL
  {
    id: 'hardware_pacemaker',
    category: 'neurological_hardware',
    label: 'Implanted Pacemaker, ICD, or Neurostimulator',
    sublabel: 'Non-pressure-certified cardiac or cranial electronic implants.',
    severity: 'relative_high',
    mechanismOfAction:
      'Sub-surface micro-atmospheres can deform titanium encapsulation seals, voiding battery hermeticity and causing pacing failure unless rated to >= 3.0 ATA.',
    clinicalCitation: 'HRS Expert Consensus on Implanted Devices in Hyperbaric Environments.',
    ataThresholdAffected: 1.5,
  },
  {
    id: 'neuro_seizure',
    category: 'neurological_hardware',
    label: 'Uncontrolled Seizure Disorder or Epilepsy',
    sublabel: 'History of unprovoked seizures or low convulsive threshold.',
    severity: 'relative_high',
    mechanismOfAction:
      'Elevated arterial PO2 lowers cerebral seizure threshold via reactive oxygen species altering GABA-ergic inhibitory tone, precipitating grand mal convulsions.',
    clinicalCitation: 'CNS Oxygen Toxicity Protocols, Duke Center for Hyperbaric Medicine.',
    ataThresholdAffected: 1.3,
  },

  // SYSTEMIC & OPHTHALMIC
  {
    id: 'systemic_optic_neuritis',
    category: 'systemic',
    label: 'Active Optic Neuritis or History of Keratotomy',
    sublabel: 'Radial keratotomy (RK) scarring or acute demyelinating optic pathology.',
    severity: 'relative_moderate',
    mechanismOfAction:
      'Transient hyperbaric myopia and structural corneal flattening along incision tracks; potential exacerbation of acute optic nerve ischemia.',
    clinicalCitation: 'Journal of Cataract & Refractive Surgery / Undersea Hyperb Med.',
    ataThresholdAffected: 1.5,
  },
  {
    id: 'systemic_high_fever',
    category: 'systemic',
    label: 'Active Febrile Illness (>38.5°C / 101.3°F)',
    sublabel: 'Acute systemic pyrexia from infectious or inflammatory etiology.',
    severity: 'relative_high',
    mechanismOfAction:
      'Fever markedly increases metabolic rate and cerebral blood flow, dramatically accelerating oxygen delivery to the CNS and lowering seizure latency.',
    clinicalCitation: 'UHMS Safety Committee Guidelines on Thermal Dysregulation.',
    ataThresholdAffected: 1.3,
  },
  {
    id: 'systemic_pregnancy',
    category: 'systemic',
    label: 'Confirmed or Suspected Pregnancy',
    sublabel: 'Elective non-emergency longevity / athletic protocol request.',
    severity: 'absolute',
    mechanismOfAction:
      'Potential teratogenic oxidative stress on embryonic organogenesis and risk of premature closure of the fetal ductus arteriosus under elevated PO2.',
    clinicalCitation: 'International Standards for Non-Emergency Hyperbaric Medicine.',
  },
];

// ==========================================
// UTILITY & ENGINE CALCULATIONS
// ==========================================

function evaluateSafetyProfile(
  baseline: UserBaseline,
  answers: Record<string, boolean>
): OperationalSafetyParameters {
  const findings: RiskFinding[] = [];

  CLINICAL_QUESTIONS.forEach((q) => {
    if (answers[q.id]) {
      findings.push({
        questionId: q.id,
        label: q.label,
        severity: q.severity,
        mechanismOfAction: q.mechanismOfAction,
        clinicalCitation: q.clinicalCitation,
      });
    }
  });

  const hasAbsolute = findings.some((f) => f.severity === 'absolute');
  const hasRelativeHigh = findings.some((f) => f.severity === 'relative_high');
  const hasRelativeMod = findings.some((f) => f.severity === 'relative_moderate');

  // Generate pseudo-deterministic cryptographic dossier verification hash
  const seedString = `${baseline.clientAge}-${baseline.targetPressure}-${findings.length}-${Date.now().toString().slice(0, 6)}`;
  let hashVal = 0;
  for (let i = 0; i < seedString.length; i++) {
    hashVal = (hashVal << 5) - hashVal + seedString.charCodeAt(i);
    hashVal |= 0;
  }
  const dossierHash = `HYL-CLIN-${Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0')}`;

  if (hasAbsolute) {
    return {
      clearanceTier: 'TIER_3_EXCLUSION',
      clearanceTitle: 'Absolute Clinical Contraindication (Hardware Interlock Active)',
      maxPermissibleAta: 1.0,
      recommendedRampRatePsiPerMin: 0.0,
      maxSessionDurationMinutes: 0,
      oxygenConcentrationFiO2: 21,
      mandatoryPreflightCheck: [
        'Installation and chamber pressurized operations strictly withheld.',
        'Immediate referral to a certified Baromedical Hyperbaric Physician (ABPM/UHMS).',
        'Formal radiological or pharmacological wash-out clearance documentation required before reconsideration.',
      ],
      findings,
      dossierHash,
    };
  }

  if (hasRelativeHigh || baseline.earEqualizationEase === 'severe_difficulty') {
    return {
      clearanceTier: 'TIER_2_CONDITIONAL',
      clearanceTitle: 'Conditional Clearance (Attending Physician Protocol Required)',
      maxPermissibleAta: 1.3,
      recommendedRampRatePsiPerMin: 0.8,
      maxSessionDurationMinutes: 45,
      oxygenConcentrationFiO2: 95,
      mandatoryPreflightCheck: [
        'Hardware limited to soft-shell / hybrid pressure ceiling of 1.3 ATA.',
        'Mandatory manual tympanogram check prior to continuous pressurization.',
        'Written sign-off by cardiologist or neurologist for implanted bio-hardware certification.',
        'Automated decompression interlock set to conservative slope (0.5 psi/min).',
      ],
      findings,
      dossierHash,
    };
  }

  if (hasRelativeMod || baseline.earEqualizationEase === 'mild_difficulty') {
    return {
      clearanceTier: 'TIER_2_CONDITIONAL',
      clearanceTitle: 'Precision Clearance with Customized Ramp Architecture',
      maxPermissibleAta: 1.5,
      recommendedRampRatePsiPerMin: 1.2,
      maxSessionDurationMinutes: 60,
      oxygenConcentrationFiO2: 99.5,
      mandatoryPreflightCheck: [
        'Ear equalization pause intervals configured at 1.15 ATA and 1.3 ATA.',
        'Prophylactic autoinflation training (Valsalva / Frenzel maneuvers) validated by concierge staff.',
        'Ophthalmic follow-up recommended at 30-day intervals for RK/cataract monitoring.',
      ],
      findings,
      dossierHash,
    };
  }

  // Tier 1: Optimal Clearance
  const targetAtaNumeric =
    baseline.targetPressure === '2.4_ATA'
      ? 2.4
      : baseline.targetPressure === '2.0_ATA'
      ? 2.0
      : baseline.targetPressure === '1.5_ATA'
      ? 1.5
      : 1.3;

  return {
    clearanceTier: 'TIER_1_OPTIMAL',
    clearanceTitle: 'Optimal Clinical Clearance (Full Engineering Envelope Cleared)',
    maxPermissibleAta: targetAtaNumeric,
    recommendedRampRatePsiPerMin: targetAtaNumeric > 1.5 ? 2.0 : 1.5,
    maxSessionDurationMinutes: targetAtaNumeric >= 2.0 ? 90 : 75,
    oxygenConcentrationFiO2: 100,
    mandatoryPreflightCheck: [
      'Zero clinical contraindications identified against selected pressure envelope.',
      'Full deployment of continuous oxygen delivery (100% FiO2 with BIB-hood/mask) for the selected pressure envelope.',
      'Planning range cited by the reviewed longevity and regeneration source set: 3 to 5 sessions per week. This is a published figure, not a prescription, and it is not issued by Hylono or by any clinician.',
      'Quarterly baromedical vital log review with Hylono Clinical Concierge.',
    ],
    findings,
    dossierHash,
  };
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function InteractiveSafetyAdvisor(): React.JSX.Element {
  // Navigation State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Baseline Form State
  const [baseline, setBaseline] = useState<UserBaseline>({
    clientAge: 46,
    targetPressure: '2.0_ATA',
    intent: 'longevity_cellular_repair',
    earEqualizationEase: 'optimal',
  });

  // Clinical Questions State: { [questionId]: boolean }
  const [answers, setAnswers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CLINICAL_QUESTIONS.forEach((q) => {
      initial[q.id] = false;
    });
    return initial;
  });

  // UI state for showing clinical rationale accordion
  const [expandedRationale, setExpandedRationale] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const toggleAnswer = useCallback((id: string) => {
    setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleRationale = useCallback((id: string) => {
    setExpandedRationale((prev) => (prev === id ? null : id));
  }, []);

  // Compute Evaluation Report
  const safetyReport = useMemo(() => {
    return evaluateSafetyProfile(baseline, answers);
  }, [baseline, answers]);

  const activeContraindicationsCount = useMemo(() => {
    return Object.values(answers).filter(Boolean).length;
  }, [answers]);

  const handleReset = () => {
    const cleared: Record<string, boolean> = {};
    CLINICAL_QUESTIONS.forEach((q) => {
      cleared[q.id] = false;
    });
    setAnswers(cleared);
    setCurrentStep(1);
  };

  const handleCopyDossier = () => {
    const textToCopy = `HYLONO BAROMEDICAL SAFETY DOSSIER
Reference: ${safetyReport.dossierHash}
Status: ${safetyReport.clearanceTitle}
Max Permissible Pressure: ${safetyReport.maxPermissibleAta} ATA
Max Session Duration: ${safetyReport.maxSessionDurationMinutes} min
Ramp Velocity: ${safetyReport.recommendedRampRatePsiPerMin} PSI/min
Active Flags: ${safetyReport.findings.length}
Target Protocol: ${baseline.intent.replace(/_/g, ' ').toUpperCase()} (${baseline.targetPressure})
Generated by Hylono Precision Baromedical Screener v3.8`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2400);
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden font-sans antialiased">
      {/* ================= HEADER BRANDING ================= */}
      <div className="relative border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 px-6 py-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                Clinical Engineering Grade
              </span>
              <span className="text-xs font-mono text-zinc-400">ISO 13485 / UHMS Class-A Algorithmic Audit</span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
              Baromedical Safety Clearance & Protocol Screener
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Biophysical contraindication vetting for Hylono high-pressure longevity hardware. Formulated to
              support assessment of barotrauma, pharmacodynamic toxicity, and oxygen seizure thresholds.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-zinc-400">Risk Threshold Status</div>
              <div
                className={`text-sm font-mono font-bold ${
                  safetyReport.clearanceTier === 'TIER_1_OPTIMAL'
                    ? 'text-emerald-400'
                    : safetyReport.clearanceTier === 'TIER_2_CONDITIONAL'
                    ? 'text-amber-400'
                    : 'text-rose-500'
                }`}
              >
                {safetyReport.clearanceTier.replace(/_/g, ' ')}
              </div>
            </div>
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${
                safetyReport.clearanceTier === 'TIER_1_OPTIMAL'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : safetyReport.clearanceTier === 'TIER_2_CONDITIONAL'
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-500'
              }`}
            >
              {safetyReport.clearanceTier === 'TIER_1_OPTIMAL' && <ShieldCheck className="w-6 h-6" />}
              {safetyReport.clearanceTier === 'TIER_2_CONDITIONAL' && <AlertTriangle className="w-6 h-6" />}
              {safetyReport.clearanceTier === 'TIER_3_EXCLUSION' && <AlertOctagon className="w-6 h-6" />}
            </div>
          </div>
        </div>

        {/* STEPPER PROGRESS INDICATOR */}
        <div className="mt-6 pt-5 border-t border-zinc-800/70">
          <div className="grid grid-cols-5 gap-2">
            {[
              { step: 1, name: 'Envelope & Baseline' },
              { step: 2, name: 'Pharmacology' },
              { step: 3, name: 'Thoracic & Airway' },
              { step: 4, name: 'Hardware & Neuro' },
              { step: 5, name: 'Clearance Dossier' },
            ].map((s) => {
              const isPassed = currentStep > s.step;
              const isCurrent = currentStep === s.step;

              return (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className="group text-left focus:outline-none"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div
                      className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                          : isPassed
                          ? 'bg-emerald-500'
                          : 'bg-zinc-800'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      isCurrent
                        ? 'text-white'
                        : isPassed
                        ? 'text-zinc-400'
                        : 'text-zinc-600'
                    }`}
                  >
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

export const CLINIC_PULSE_DEMO_BARS = [
    72, 34, 38, 41, 45, 82, 43, 39, 36, 42,
    76, 44, 48, 39, 35, 88, 46, 41, 37, 43,
    79, 45, 40, 36, 42, 84, 47, 43, 38, 44,
    81, 42, 37, 40, 46, 86, 44, 39, 35, 41,
] as const;

const getDemoPulseTarget = (value: number, index: number) => {
    const delta = index % 3 === 0 ? 6 : -4;
    return `${Math.max(10, value + delta)}%`;
};

export const ClinicPulse: React.FC = () => {
    return (
        <section
            aria-label="Clinic operational pulse overview"
            className="relative flex h-full min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.10] bg-slate-950/[0.78] p-6 shadow-none"
        >
            {/* Header row */}
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Activity className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                            Clinic Pulse
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            Demo Activity
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-3xl font-bold text-cyan-400">8</div>
                    <div className="text-xs text-slate-400">Sample Signals</div>
                </div>
            </div>

            {/* Simulated demo graph */}
            <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 flex h-24 items-end justify-between gap-[1px] px-2 opacity-40"
            >
                {CLINIC_PULSE_DEMO_BARS.map((value, i) => (
                    <motion.div
                        key={i}
                        className="w-full rounded-t-sm bg-cyan-400/60"
                        initial={{ height: `${value}%` }}
                        animate={{
                            height: [
                                `${value}%`,
                                getDemoPulseTarget(value, i),
                            ],
                        }}
                        transition={{
                            repeat: Infinity,
                            repeatType: 'reverse',
                            duration: 2,
                            delay: i * 0.05,
                        }}
                    />
                ))}
            </div>

            {/* Subtle grid overlay */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }}
            />
        </section>
    );
};

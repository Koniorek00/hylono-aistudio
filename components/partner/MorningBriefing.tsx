'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sun, Calendar, Coffee } from 'lucide-react';

export const MORNING_BRIEFING_DEMO_ITEMS = [
    {
        title: '3 sample visits',
        detail: ' prepared for the demo schedule',
    },
    {
        title: 'Fleet checklist',
        detail: ' uses sample capacity notes',
    },
    {
        title: 'Review',
        detail: ' demo compliance prompts before publishing',
    },
] as const;

export const MORNING_BRIEFING_DEMO_METRICS = [
    {
        label: 'Sample Visits',
        value: '3',
        detail: 'Demo schedule',
    },
    {
        label: 'Review Notes',
        value: '2',
        detail: 'Sample queue',
    },
] as const;

export const MorningBriefing: React.FC = () => {
    return (
        <section
            aria-label="Daily morning briefing"
            className="mb-8"
        >
            <div className="overflow-hidden rounded-2xl border border-white/[0.10] bg-slate-950/[0.78] p-6 shadow-none">
                {/* Top row: icon + greeting */}
                <div className="flex items-start gap-4">
                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 md:flex">
                        <Sun className="h-7 w-7" aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-white md:text-3xl">
                            Demo briefing,{' '}
                            <span className="text-cyan-400">Partner team</span>
                        </h1>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                            Demo schedule snapshot
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-5 h-px bg-slate-700/50" />

                {/* Briefing card */}
                <div className="relative overflow-hidden rounded-xl border border-slate-700/40 bg-slate-900/60 p-5">
                    {/* Cyan left accent bar */}
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-cyan-400 to-cyan-600/30" aria-hidden="true" />

                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        {/* Daily summary */}
                        <div className="space-y-3 pl-4">
                            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                                <Coffee className="h-3.5 w-3.5" aria-hidden="true" />
                                Daily Briefing
                            </h3>
                            <ul className="space-y-2.5">
                                {MORNING_BRIEFING_DEMO_ITEMS.map((item) => (
                                    <li
                                        key={item.title}
                                        className="border-l-2 border-cyan-500/30 pl-3 text-sm leading-6"
                                    >
                                        <strong className="text-white">{item.title}</strong>
                                        <span className="text-slate-400">{item.detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Metric chips */}
                        <div className="flex shrink-0 gap-3">
                            {MORNING_BRIEFING_DEMO_METRICS.map((metric) => (
                                <div
                                    key={metric.label}
                                    className="rounded-xl border border-slate-700/40 bg-slate-800/80 px-5 py-3 text-right"
                                >
                                    <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {metric.label}
                                    </div>
                                    <div className="text-xl font-bold text-cyan-400">
                                        {metric.value}
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-slate-500">
                                        {metric.detail}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

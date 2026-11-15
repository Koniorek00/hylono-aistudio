'use client';

import React from 'react';
import { Activity, Droplets, Sun, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import {
  PreviewReveal,
  PreviewStaggerContainer,
  PreviewStaggerItem,
} from '../PreviewReveal';

const SCIENCE_STATS = [
  { end: 4, suffix: '', label: 'Modality Guides' },
  { end: 2, suffix: '', label: 'Access Paths' },
  { end: 1, suffix: '', label: 'Research Hub' },
  { end: 1, suffix: '', label: 'Contact Handoff' },
] as const;

const SCIENCE_MODALITIES = [
  {
    icon: Wind,
    label: 'Hyperbaric Oxygen',
    studies: 'Research-linked guide',
    focus: 'Oxygen exposure - safety context',
  },
  {
    icon: Activity,
    label: 'PEMF Signals',
    studies: 'Evidence review path',
    focus: 'Signal sessions - routine fit',
  },
  {
    icon: Sun,
    label: 'Red Light Systems',
    studies: 'Research hub route',
    focus: 'Light exposure - device planning',
  },
  {
    icon: Droplets,
    label: 'Molecular Hydrogen',
    studies: 'Usage context route',
    focus: 'Hydrogen use - daily handling',
  },
] as const;

export function HomeScienceSection(): React.JSX.Element {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 py-24 text-white"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        event.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
        event.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
      }}
    >
      <div className="home-science-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2">
        <PreviewReveal direction="up">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Research-linked planning
          </span>
          <h2 className="futuristic-font mt-4 mb-6 text-3xl font-bold md:text-5xl">
            Evidence-aware routes
          </h2>
          <p className="mb-8 leading-relaxed text-slate-300">
            Each modality links planning, research context, and access decisions so visitors can
            compare options without outcome promises.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {SCIENCE_STATS.map((stat) => (
              <motion.div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="futuristic-font text-2xl font-bold text-cyan-400">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} duration={2200} />
                </div>
                <div className="text-sm text-slate-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </PreviewReveal>

        <PreviewStaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
          {SCIENCE_MODALITIES.map((tech) => (
            <PreviewStaggerItem key={tech.label}>
              <motion.div
                className="h-full rounded-lg border border-white/10 bg-white/[0.045] p-6"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <tech.icon className="mb-3 text-cyan-400" size={28} />
                <div className="mb-1 font-bold text-white">{tech.label}</div>
                <div className="mb-2 text-xs font-medium text-cyan-400">{tech.studies}</div>
                <div className="text-[10px] leading-relaxed text-slate-300">{tech.focus}</div>
              </motion.div>
            </PreviewStaggerItem>
          ))}
        </PreviewStaggerContainer>
      </div>
    </section>
  );
}

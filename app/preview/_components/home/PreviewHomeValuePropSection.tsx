'use client';

import React from 'react';
import { ArrowRight, Shield, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import {
  PreviewReveal,
  PreviewStaggerContainer,
  PreviewStaggerItem,
} from '../PreviewReveal';

interface HomeValuePropSectionProps {
  onNavigate: (path: string) => void;
}

export function HomeValuePropSection({
  onNavigate,
}: HomeValuePropSectionProps): React.JSX.Element {
  return (
    <section className="grain-overlay relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.emerald.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <PreviewReveal direction="up" className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Why Hylono
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-5xl">
            Built for choice
          </h2>
        </PreviewReveal>

        <PreviewStaggerContainer
          className="grid auto-rows-[160px] grid-cols-1 gap-4 md:grid-cols-12"
          staggerDelay={0.08}
        >
          <PreviewStaggerItem className="md:col-span-5 md:row-span-2">
            <div className="group relative flex h-full cursor-default flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-10 transition-colors duration-200 hover:border-cyan-300/35 hover:bg-white/[0.07]">
              <Shield
                className="text-yellow-500 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500"
                size={48}
                strokeWidth={1}
              />
              <div>
                <h3 className="futuristic-font mb-3 text-2xl font-bold text-white">
                  Evidence-aware selection
                </h3>
                <p className="text-sm font-light leading-relaxed text-slate-300">
                  Compare devices through research links, support context, and clear rental or
                  ownership paths before choosing a system.
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          </PreviewStaggerItem>

          <PreviewStaggerItem className="md:col-span-4 md:row-span-1">
            <div className="group flex h-full cursor-default items-center gap-6 overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-8 transition-colors duration-200 hover:border-purple-300/35 hover:bg-white/[0.07]">
              <Zap
                className="text-purple-500 shrink-0 group-hover:scale-110 transition-transform duration-300"
                size={36}
                strokeWidth={1.5}
              />
              <div>
                <h3 className="futuristic-font text-lg font-bold text-white">
                  Routine planning
                </h3>
                <p className="text-sm font-light text-slate-300">
                  Start with daily-use fit, setup needs, and handoff questions before device
                  selection.
                </p>
              </div>
            </div>
          </PreviewStaggerItem>

          <PreviewStaggerItem className="md:col-span-3 md:row-span-1">
            <div className="group flex h-full cursor-default flex-col justify-between overflow-hidden rounded-lg border border-cyan-300/20 bg-cyan-300/[0.08] p-8 text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Modalities covered
              </span>
              <div className="text-4xl font-black text-cyan-400 futuristic-font">
                <AnimatedCounter end={4} suffix="" />
              </div>
            </div>
          </PreviewStaggerItem>

          <PreviewStaggerItem className="md:col-span-4 md:row-span-1">
            <div className="group flex h-full cursor-default items-center gap-6 overflow-hidden rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-8 transition-colors duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/[0.09]">
              <Star
                className="text-cyan-500 shrink-0 group-hover:scale-110 transition-transform duration-300"
                size={36}
                strokeWidth={1.5}
              />
              <div>
                <h3 className="futuristic-font text-lg font-bold text-white">Access Layer</h3>
                <p className="text-sm font-light text-slate-300">
                  Compare rental and ownership paths before a purchase decision.
                </p>
              </div>
            </div>
          </PreviewStaggerItem>

          <PreviewStaggerItem className="md:col-span-3 md:row-span-1">
            <div className="group flex h-full cursor-default flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-8 transition-colors duration-200 hover:border-cyan-300/35 hover:bg-white/[0.07]">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Access paths
              </span>
              <div className="futuristic-font text-4xl font-black text-white">
                <AnimatedCounter end={2} suffix="" />
              </div>
            </div>
          </PreviewStaggerItem>

          <PreviewStaggerItem className="md:col-span-7 md:row-span-1">
            <div
              className="group flex h-full cursor-pointer items-center justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-8 transition-colors duration-200 hover:border-emerald-300/40 hover:bg-white/[0.07]"
              onClick={() => onNavigate('rental')}
            >
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-300">
                  Rental Model
                </p>
                <h3 className="text-xl font-bold text-white">Compare rental paths</h3>
              </div>
              <motion.div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-400"
                whileHover={{ scale: 1.15 }}
              >
                <ArrowRight className="text-slate-950" size={20} />
              </motion.div>
            </div>
          </PreviewStaggerItem>
        </PreviewStaggerContainer>
      </div>
    </section>
  );
}

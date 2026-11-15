'use client';

import React from 'react';
import { Activity, Brain, Sparkles } from 'lucide-react';
import {
  PreviewReveal,
  PreviewStaggerContainer,
  PreviewStaggerItem,
} from '../PreviewReveal';

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Discover',
    desc: 'Explore wellness technology categories and use goal-based filtering to shortlist realistic options.',
    icon: Brain,
  },
  {
    step: '02',
    title: 'Configure',
    desc: 'Build a planning stack with suggested combinations, timing notes, and handoff questions.',
    icon: Sparkles,
  },
  {
    step: '03',
    title: 'Adjust',
    desc: 'Use onboarding, support notes, and routine checks to refine the plan over time.',
    icon: Activity,
  },
] as const;

export function HomeHowItWorksSection(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.cyan.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <PreviewReveal direction="up" className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Simple Process
          </span>
          <h2 className="futuristic-font mt-4 text-3xl font-bold text-white md:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            From comparison to a practical access plan in three steps
          </p>
        </PreviewReveal>

        <PreviewStaggerContainer className="grid gap-8 md:grid-cols-3" staggerDelay={0.15}>
          {HOW_IT_WORKS_STEPS.map((item) => (
            <PreviewStaggerItem key={item.step}>
              <div className="group relative h-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-8 transition-colors duration-200 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.07]">
                <div className="futuristic-font absolute top-2 right-4 select-none text-8xl font-black text-white/[0.04] transition-colors group-hover:text-cyan-300/10">
                  {item.step}
                </div>
                <item.icon
                  className="relative z-10 mb-6 text-cyan-500 transition-transform duration-300 group-hover:scale-110"
                  size={32}
                />
                <h3 className="futuristic-font relative z-10 mb-3 text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="relative z-10 text-sm leading-relaxed text-slate-300">{item.desc}</p>
              </div>
            </PreviewStaggerItem>
          ))}
        </PreviewStaggerContainer>
      </div>
    </section>
  );
}

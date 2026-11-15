"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Clock, Sun, Zap, Moon } from 'lucide-react';

interface ProtocolStep {
  step: number;
  title: string;
  duration: string;
  description: string;
  intensity?: string;
}

interface ProtocolStepsSectionProps {
  steps: ProtocolStep[];
  title?: string;
  subtitle?: string;
}

export const ProtocolStepsSection: React.FC<ProtocolStepsSectionProps> = ({
  steps,
  title = "Step-by-Step Session Execution",
  subtitle = "Optimized clinical sequence for peak bio-absorption and safe operation"
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:p-12 backdrop-blur-xl">
      <div>
        <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
          Operating Sequence
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-medium text-white mt-2 mb-3">
          {title}
        </h2>
        <p className="text-slate-400 text-base max-w-2xl">
          {subtitle}
        </p>
      </div>

      <div className="relative border-l-2 border-white/10 ml-4 md:ml-6 space-y-8 pl-6 md:pl-8">
        {steps.map((step: ProtocolStep, idx: number) => (
          <motion.div
            key={step.step || idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative group"
          >
            {/* Timeline indicator node */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-400/80 flex items-center justify-center text-[10px] font-mono text-emerald-400 font-semibold group-hover:border-emerald-300 group-hover:scale-110 transition-transform">
              {step.step || idx + 1}
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h3 className="text-lg font-medium text-white">{step.title}</h3>
                <div className="flex items-center gap-3">
                  {step.intensity && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {step.intensity}
                    </span>
                  )}
                  {step.duration && (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {step.duration}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

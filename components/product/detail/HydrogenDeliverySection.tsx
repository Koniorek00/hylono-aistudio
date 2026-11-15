"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Wind, Eye, Ear, Flame, Heart } from 'lucide-react';

export const HydrogenDeliverySection: React.FC = () => {
  return (
    <div className="mt-12 overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-slate-900/90 p-8 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
              Multi-Route Bio-Availability
            </span>
            <span className="text-xs font-semibold text-slate-400">SPE / PEM 99.996% Purity</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Hydrogen Delivery Ecosystem
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Targeted molecular hydrogen administration protocols tailored for physiological absorption routes.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Route 1: Inhalation */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-300">
                <Wind className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono font-medium text-cyan-400/80">Systemic Circulation</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Direct Respiratory Inhalation</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              High-flow H2 inhalation via medical-grade nasal cannula. Immediate blood-brain barrier diffusion and central nervous system antioxidant support within 15 minutes.
            </p>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4 text-xs font-semibold text-cyan-300 flex items-center justify-between">
            <span>600 - 1200 mL/min</span>
            <span className="text-slate-400 font-normal">30-60 min/session</span>
          </div>
        </motion.div>

        {/* Route 2: Molecular Dissolution */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-300">
                <Flame className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono font-medium text-cyan-400/80">Enteric Absorption</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Enriched Water Dissolution</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Rapid infusion generating &gt;1.6 PPM to 3.0+ PPM dissolved hydrogen water. Supports gastrointestinal microbiota balance and systemic oxidative stress reduction.
            </p>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4 text-xs font-semibold text-cyan-300 flex items-center justify-between">
            <span>&gt;1.6 - 3.0 PPM</span>
            <span className="text-slate-400 font-normal">500ml - 1.5L daily</span>
          </div>
        </motion.div>

        {/* Route 3: Target Applicators */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-300">
                  <Eye className="h-5 w-5" />
                </div>
                <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-300">
                  <Ear className="h-5 w-5" />
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-cyan-400/80">Local Neuro-Sensory</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Ocular & Auditory Applicators</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Specialized goggle and acoustic cup attachments for localized hydrogen mist and gas application to soothe eye strain and inner ear tissue micro-environment.
            </p>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4 text-xs font-semibold text-cyan-300 flex items-center justify-between">
            <span>Specialized Attachment</span>
            <span className="text-slate-400 font-normal">10-20 min/session</span>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-slate-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-cyan-400 flex-shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Hylono hydrogen generators utilize solid polymer electrolyte (SPE) and proton exchange membrane (PEM) technology to ensure zero chlorine or ozone byproduct.
          </p>
        </div>
        <Link
          href="/science?tech=hydrogen"
          className="whitespace-nowrap rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
        >
          Review Molecular Science →
        </Link>
      </div>
    </div>
  );
};

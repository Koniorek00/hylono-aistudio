'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MedicalDisclaimer } from '../../shared/MedicalDisclaimer';

interface ResearchStat {
  value: string;
  label: string;
  sub: string;
}

interface ResearchApplication {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface ResearchOverviewSectionProps {
  themeLabel: string;
  themeColorClass: string;
  title: string;
  intro: string;
  stats: ResearchStat[];
  supportTitle: string;
  applications: ResearchApplication[];
  hoverBorderClass: string;
  iconBgClass: string;
  iconColorClass: string;
}

export function ResearchOverviewSection({
  themeLabel,
  themeColorClass,
  title,
  intro,
  stats,
  supportTitle,
  applications,
  hoverBorderClass,
  iconBgClass,
  iconColorClass,
}: ResearchOverviewSectionProps): React.ReactElement {
  return (
    <section
      data-testid="research-overview-section"
      className="relative overflow-hidden border-y border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-slate-950 bg-[var(--pdp-page,#020617)] py-20 text-white text-[var(--pdp-title,#ffffff)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.16),transparent_34%,rgba(16,185,129,0.12))]"
      />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className={`${themeColorClass || 'text-cyan-200'} text-[10px] font-bold uppercase tracking-widest block mb-3`}>
            {themeLabel}
          </span>
          <h2 className="text-4xl font-bold text-[var(--pdp-title,#ffffff)] mb-4">{title}</h2>
          <p className="text-lg text-[var(--pdp-body,#cbd5e1)] max-w-2xl mx-auto leading-relaxed">{intro}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg rounded-[var(--pdp-radius,0.5rem)] border border-white/10 border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-white/[0.045] bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_4.5%,transparent))] p-6 text-center shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_8%,transparent))]"
            >
              <div className={`${themeColorClass || 'text-cyan-200'} text-3xl font-black mb-1`}>{stat.value}</div>
              <div className="font-bold text-[var(--pdp-body,#f1f5f9)] text-sm mb-0.5">{stat.label}</div>
              <div className="text-xs text-[var(--pdp-muted,#94a3b8)]">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-10">
          <span className="text-[var(--pdp-accent,#a5f3fc)] text-[10px] font-bold uppercase tracking-widest block mb-3">
            Research-Backed Applications
          </span>
          <h3 className="text-3xl font-bold text-[var(--pdp-title,#ffffff)]">{supportTitle}</h3>
          <MedicalDisclaimer type="research" compact className="mt-3 text-center max-w-2xl mx-auto text-[var(--pdp-muted,#94a3b8)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {applications.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg rounded-[var(--pdp-radius,0.5rem)] border border-white/10 border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-white/[0.045] bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_4.5%,transparent))] p-5 shadow-none ${hoverBorderClass} transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_8%,transparent))]`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${iconBgClass} rounded-[var(--pdp-radius,0.5rem)] flex items-center justify-center ${iconColorClass} shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--pdp-body,#f1f5f9)] text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-[var(--pdp-muted,#94a3b8)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

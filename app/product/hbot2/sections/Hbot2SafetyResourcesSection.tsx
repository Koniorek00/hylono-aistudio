'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  Shield,
  ShoppingBag,
} from 'lucide-react';
import { MedicalDisclaimer } from '@/components/shared/MedicalDisclaimer';

export interface Hbot2ContraindicationItem {
  condition: string;
  status: string;
  reason: string;
}

export interface Hbot2DrugInteractionItem {
  drugName: string;
  reason: string;
}

export interface Hbot2DocumentItem {
  title: string;
  href: string;
  type: string;
  size: string;
}

export interface Hbot2SafetyResourcesSectionProps {
  showSafety: boolean;
  onToggleSafety: () => void;
  onSafetyFocus: () => void;
  approvedClaims?: string[];
  contraindications?: Hbot2ContraindicationItem[];
  expandedContraindication: string | null;
  onToggleContraindication: (condition: string) => void;
  onContraindicationFocus: (condition: string) => void;
  drugInteractions?: Hbot2DrugInteractionItem[];
  disclaimerText?: string;
  pdpDocumentsEnabled: boolean;
  productDocuments: Hbot2DocumentItem[];
  onDocumentFocus: (title: string) => void;
  onDocumentClick: (title: string) => void;
  productContactHref: string;
  productRentalHref: string;
  onGuidanceFocus: () => void;
  onGuidanceClick: () => void;
  onRentalFocus: () => void;
  onRentalClick: () => void;
  focusRing: string;
  pageActionStatusId: string;
}

export function Hbot2SafetyResourcesSection({
  showSafety,
  onToggleSafety,
  onSafetyFocus,
  approvedClaims,
  contraindications,
  expandedContraindication,
  onToggleContraindication,
  onContraindicationFocus,
  drugInteractions,
  disclaimerText,
  pdpDocumentsEnabled,
  productDocuments,
  onDocumentFocus,
  onDocumentClick,
  productContactHref,
  productRentalHref,
  onGuidanceFocus,
  onGuidanceClick,
  onRentalFocus,
  onRentalClick,
  focusRing,
  pageActionStatusId,
}: Hbot2SafetyResourcesSectionProps) {
  return (
    <section
      data-testid="hbot2-safety-resources-surface"
      className="border-b border-white/10 bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
            <button
              type="button"
              onFocus={onSafetyFocus}
              onClick={onToggleSafety}
              aria-expanded={showSafety}
              aria-controls="hbot2-safety-panel"
              aria-describedby={pageActionStatusId}
              className={`${focusRing} flex w-full items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-4 text-left transition-colors hover:border-emerald-300/35 hover:bg-slate-950`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                    Safety and compliance
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Contraindications, evidence themes, and usage boundaries
                  </p>
                </div>
              </div>
              {showSafety ? (
                <ChevronUp size={20} className="text-slate-300" />
              ) : (
                <ChevronDown size={20} className="text-slate-300" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {showSafety ? (
                <motion.div
                  id="hbot2-safety-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    {approvedClaims && approvedClaims.length > 0 ? (
                      <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-sm font-semibold text-white">Evidence and safety themes</p>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          {approvedClaims.map((claim) => (
                            <div key={claim} className="flex gap-2 text-sm leading-7 text-slate-300">
                              <CheckCircle size={14} className="mt-1 shrink-0 text-emerald-300" />
                              <span>{claim}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {contraindications && contraindications.length > 0 ? (
                      <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-sm font-semibold text-white">
                          Contraindications and safety
                        </p>
                        <div className="mt-3 space-y-3">
                          {contraindications.map((item) => {
                            const isExpanded = expandedContraindication === item.condition;
                            const tone =
                              item.status === 'safe'
                                ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
                                : item.status === 'caution'
                                  ? 'border-amber-300/25 bg-amber-300/10 text-amber-100'
                                  : 'border-red-300/25 bg-red-300/10 text-red-100';

                            return (
                              <div key={item.condition} className={`rounded-lg border ${tone}`}>
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  onFocus={() => onContraindicationFocus(item.condition)}
                                  onClick={() => onToggleContraindication(item.condition)}
                                  aria-describedby={pageActionStatusId}
                                  className={`${focusRing} flex w-full items-center justify-between gap-3 px-4 py-4 text-left`}
                                >
                                  <div>
                                    <p className="text-sm font-semibold">{item.condition}</p>
                                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em]">
                                      {item.status}
                                    </p>
                                  </div>
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                <AnimatePresence initial={false}>
                                  {isExpanded ? (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-4 text-sm leading-7">{item.reason}</div>
                                    </motion.div>
                                  ) : null}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {drugInteractions && drugInteractions.length > 0 ? (
                      <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-sm font-semibold text-white">Drug interactions</p>
                        <div className="mt-3 space-y-2">
                          {drugInteractions.map((interaction) => (
                            <div
                              key={interaction.drugName}
                              className="rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3"
                            >
                              <p className="text-sm font-semibold text-white">
                                {interaction.drugName}
                              </p>
                              <p className="mt-1 text-sm leading-7 text-slate-300">
                                {interaction.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <MedicalDisclaimer compact customText={disclaimerText} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                  Resources
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  Planning and policy resources
                </h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {pdpDocumentsEnabled
                ? productDocuments.map((document) => (
                    <Link
                      key={document.href}
                      href={document.href}
                      onFocus={() => onDocumentFocus(document.title)}
                      onClick={() => onDocumentClick(document.title)}
                      aria-describedby={pageActionStatusId}
                      className={`${focusRing} flex min-h-11 items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-950/55 px-4 py-4 text-left transition-colors hover:border-cyan-300/45 hover:bg-white/[0.045]`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{document.title}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {document.type} · {document.size}
                        </p>
                      </div>
                      <ExternalLink size={16} className="text-slate-400" />
                    </Link>
                  ))
                : null}
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-slate-950/55 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                Need a human?
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                If the configuration feels too advanced, too limited, or hard to place in a room,
                the fastest next move is sizing the protocol and the space before you commit.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={productContactHref}
                  onFocus={onGuidanceFocus}
                  onClick={onGuidanceClick}
                  aria-describedby={pageActionStatusId}
                  className={`${focusRing} inline-flex min-h-11 items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 text-xs font-bold uppercase tracking-[0.16em] text-cyan-50 transition-colors hover:bg-cyan-300/15`}
                >
                  <Phone size={14} className="mr-2" />
                  Request guidance
                </Link>
                <Link
                  href={productRentalHref}
                  onFocus={onRentalFocus}
                  onClick={onRentalClick}
                  aria-describedby={pageActionStatusId}
                  className={`${focusRing} inline-flex min-h-11 items-center rounded-lg border border-white/10 px-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-cyan-300/45 hover:bg-white/[0.045] hover:text-cyan-100`}
                >
                  <ShoppingBag size={14} className="mr-2" />
                  Review rental
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

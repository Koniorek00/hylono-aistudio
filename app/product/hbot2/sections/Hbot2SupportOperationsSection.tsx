'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, Truck } from 'lucide-react';

export interface Hbot2FaqItem {
  question: string;
  answer: string;
}

export interface Hbot2SupportOperationsSectionProps {
  showDelivery: boolean;
  onToggleDelivery: () => void;
  onDeliveryFocus: () => void;
  faqs?: Hbot2FaqItem[];
  showFaqId: number | null;
  onToggleFaq: (index: number, question: string) => void;
  onFaqFocus: (question: string) => void;
  focusRing: string;
  pageActionStatusId: string;
}

const DELIVERY_REGIONS = [
  {
    region: 'European Union',
    days: '5–10 business days',
    note: 'Timing is confirmed after product and address review',
  },
  {
    region: 'United Kingdom',
    days: '7–14 business days',
    note: 'Customs clearance may add 1–2 days',
  },
  {
    region: 'United States',
    days: '10–21 business days',
    note: 'Expedited options are confirmed when available',
  },
];

const SETUP_STEPS = [
  'Unpacking and debris-removal scope confirmed where available',
  'Placement discussion before setup',
  'System setup using product guidance',
  'Safety briefing and protocol walkthrough',
  'First-use guidance from Hylono support',
  'Follow-up support path confirmed before delivery',
];

export function Hbot2SupportOperationsSection({
  showDelivery,
  onToggleDelivery,
  onDeliveryFocus,
  faqs,
  showFaqId,
  onToggleFaq,
  onFaqFocus,
  focusRing,
  pageActionStatusId,
}: Hbot2SupportOperationsSectionProps) {
  return (
    <section
      data-testid="hbot2-support-operations-surface"
      className="border-b border-white/10 bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
            <button
              type="button"
              onFocus={onDeliveryFocus}
              onClick={onToggleDelivery}
              aria-expanded={showDelivery}
              aria-controls="hbot2-delivery-panel"
              aria-describedby={pageActionStatusId}
              className={`${focusRing} flex w-full items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-4 text-left transition-colors hover:border-cyan-300/35 hover:bg-slate-950`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                    Delivery and installation
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    What happens after you order
                  </p>
                </div>
              </div>
              {showDelivery ? (
                <ChevronUp size={20} className="text-slate-300" />
              ) : (
                <ChevronDown size={20} className="text-slate-300" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {showDelivery ? (
                <motion.div
                  id="hbot2-delivery-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                      <p className="text-sm font-semibold text-white">Delivery timing guidance</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {DELIVERY_REGIONS.map((region) => (
                          <div
                            key={region.region}
                            className="rounded-lg border border-white/10 bg-slate-950/55 p-4"
                          >
                            <p className="text-sm font-semibold text-white">{region.region}</p>
                            <p className="mt-2 text-sm font-bold text-cyan-200">{region.days}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-300">{region.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                      <p className="text-sm font-semibold text-white">
                        Delivery and setup planning
                      </p>
                      <div className="mt-3 grid gap-2">
                        {SETUP_STEPS.map((item) => (
                          <div key={item} className="flex gap-2 text-sm leading-7 text-slate-300">
                            <CheckCircle size={14} className="mt-1 shrink-0 text-emerald-300" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                  Frequently asked
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">Operator answers</h2>
              </div>
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-950/60 text-cyan-100">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {(faqs ?? []).map((faq, index) => {
                const isOpen = showFaqId === index;

                return (
                  <div
                    key={faq.question}
                    className="rounded-lg border border-white/10 bg-slate-950/55"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onFocus={() => onFaqFocus(faq.question)}
                      onClick={() => onToggleFaq(index, faq.question)}
                      aria-describedby={pageActionStatusId}
                      className={`${focusRing} flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.045]`}
                    >
                      <span className="text-sm font-semibold text-white">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-slate-300" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-300" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 text-sm leading-7 text-slate-300">
                            {faq.answer}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

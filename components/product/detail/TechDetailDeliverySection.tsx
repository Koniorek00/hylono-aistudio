'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Calendar, CheckCircle, ChevronDown, ChevronUp, Sparkles, Truck } from 'lucide-react';

interface TechDetailDeliverySectionProps {
  dataName: string;
  showDelivery: boolean;
  onToggleDelivery: () => void;
}

export const TECH_DETAIL_DELIVERY_ACTION_STATUS_ID = 'tech-detail-delivery-action-status';
export const TECH_DETAIL_DELIVERY_ACTION_STATUS_LABEL = 'Delivery disclosure action status';

export function TechDetailDeliverySection({
  dataName,
  showDelivery,
  onToggleDelivery,
}: TechDetailDeliverySectionProps) {
  const deliveryActionStatus = showDelivery
    ? `Delivery and installation information for ${dataName} is expanded.`
    : `Delivery and installation information for ${dataName} is collapsed. Activate the disclosure to review delivery planning and setup scope.`;

  return (
    <section
      id="delivery"
      data-testid="delivery-section"
      className="relative overflow-hidden border-y border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-page,#020617)] py-8 text-[var(--pdp-title,#ffffff)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.14),transparent_36%,rgba(16,185,129,0.1))]" />
      </div>
      <div className="max-w-4xl mx-auto px-6">
        <button
          type="button"
          onClick={onToggleDelivery}
          aria-expanded={showDelivery}
          aria-controls="delivery-panel"
          aria-describedby={TECH_DETAIL_DELIVERY_ACTION_STATUS_ID}
          className="relative z-10 flex w-full items-center justify-between gap-4 overflow-hidden rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_4.5%,transparent))] p-4 text-left shadow-none backdrop-blur-md transition-all duration-200 hover:border-cyan-300/40 hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_8%,transparent))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pdp-focus,#67e8f9)]"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--pdp-radius,0.5rem)] border border-cyan-300/20 bg-cyan-300/10 text-[var(--pdp-accent,#a5f3fc)]">
              <Truck size={20} />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-[var(--pdp-title,#ffffff)] block">Delivery and Installation Information</span>
              <span className="text-xs text-[var(--pdp-muted,#94a3b8)]">
                Delivery planning, setup scope, and what to confirm before delivery day
              </span>
            </div>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-page,#020617)] text-[var(--pdp-body,#cbd5e1)]">
            {showDelivery ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </span>
        </button>
        <p
          id={TECH_DETAIL_DELIVERY_ACTION_STATUS_ID}
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={TECH_DETAIL_DELIVERY_ACTION_STATUS_LABEL}
        >
          {deliveryActionStatus}
        </p>
        <AnimatePresence>
          {showDelivery && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                id="delivery-panel"
                data-testid="delivery-panel"
                className="relative z-10 mt-4 overflow-hidden rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_4.5%,transparent))] p-5 shadow-none sm:p-6"
              >
                <div className="mb-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { step: '01', title: 'Confirm timing', body: 'Dates stay tied to product and address review.' },
                    { step: '02', title: 'Plan placement', body: 'Room access and setup scope are checked before scheduling.' },
                    { step: '03', title: 'Review handoff', body: 'Support path and first-use guidance are confirmed before delivery.' },
                  ].map((item) => (
                    <div key={item.step} className="relative overflow-hidden rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_4.5%,transparent))] p-4">
                      <span className="absolute -bottom-4 right-3 text-6xl font-black leading-none text-[var(--pdp-decoration,color-mix(in_srgb,#ffffff_4%,transparent))]">
                        {item.step}
                      </span>
                      <span className="relative block text-[10px] font-black uppercase tracking-[0.22em] text-[var(--pdp-accent,#a5f3fc)]">
                        {item.step}
                      </span>
                      <span className="relative mt-2 block text-sm font-bold text-[var(--pdp-body,#f1f5f9)]">{item.title}</span>
                      <span className="relative mt-1 block text-xs leading-5 text-[var(--pdp-muted,#94a3b8)]">{item.body}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-[var(--pdp-body,#f1f5f9)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Truck size={14} className="text-[var(--pdp-accent,#a5f3fc)]" /> Delivery timing guidance
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        region: 'European Union',
                        days: '5-10 business days',
                        note: 'Timing is confirmed after product and address review',
                      },
                      {
                        region: 'United Kingdom',
                        days: '7-14 business days',
                        note: 'Customs clearance may add 1-2 days',
                      },
                      {
                        region: 'United States',
                        days: '10-21 business days',
                        note: 'Expedited options are confirmed when available',
                      },
                    ].map((region) => (
                      <div
                        key={region.region}
                        className="group relative overflow-hidden rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-inset,color-mix(in_srgb,#020617_45%,transparent))] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-[var(--pdp-hover,color-mix(in_srgb,#ffffff_8%,transparent))]"
                      >
                        <div className="relative">
                        <div className="font-semibold text-[var(--pdp-body,#f1f5f9)] text-sm">{region.region}</div>
                        <div className="text-[var(--pdp-accent,#a5f3fc)] font-bold text-sm mt-1">{region.days}</div>
                        <div className="text-xs text-[var(--pdp-muted,#94a3b8)] mt-1">{region.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-inset,color-mix(in_srgb,#020617_45%,transparent))] p-5">
                  <h4 className="text-sm font-bold text-[var(--pdp-body,#f1f5f9)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--pdp-accent,#a5f3fc)]" /> Delivery and setup planning
                  </h4>
                  <p className="text-sm text-[var(--pdp-body,#cbd5e1)] leading-relaxed mb-4">
                    Eligible {dataName} orders can include white-glove delivery support. The
                    logistics team confirms unboxing, placement, setup, and first-use guidance
                    before delivery is scheduled.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Unpacking and debris-removal scope confirmed where available',
                      'Placement discussion before setup',
                      'System setup using product guidance',
                      'Safety briefing and protocol walkthrough',
                      'First-use guidance from Hylono support',
                      'Follow-up support path confirmed before delivery',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_4.5%,transparent))] p-3 text-sm text-[var(--pdp-body,#cbd5e1)]">
                        <CheckCircle size={14} className="text-[var(--pdp-success,#6ee7b7)] mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--pdp-body,#f1f5f9)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar size={14} className="text-[var(--pdp-accent,#a5f3fc)]" /> What Happens on Delivery Day
                  </h4>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        time: 'Morning',
                        event: 'Our logistics team calls to confirm your 2-hour arrival window',
                      },
                      {
                        time: 'On arrival',
                        event:
                          'The delivery team unboxes and begins setup in your chosen room',
                      },
                      {
                        time: 'After 2 hrs',
                        event:
                          'System setup is checked and Hylono support reviews first-use guidance',
                      },
                      {
                        time: 'Same evening',
                        event: 'Digital setup guide and protocol library sent to your email',
                      },
                    ].map((step, idx) => (
                      <div key={step.time} className="relative flex items-start gap-4 rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-[var(--pdp-inset,color-mix(in_srgb,#020617_45%,transparent))] p-4 pl-5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--pdp-radius,0.5rem)] border border-cyan-300/20 bg-cyan-300/10 text-[10px] font-black text-[var(--pdp-accent,#cffafe)]">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                        <span className="text-xs font-black text-[var(--pdp-accent,#a5f3fc)] uppercase tracking-wider">
                          {step.time}
                        </span>
                        <span className="mt-1 block text-sm text-[var(--pdp-body,#cbd5e1)]">{step.event}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[var(--pdp-radius,0.5rem)] border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <div className="p-1.5 bg-cyan-300/10 rounded-[var(--pdp-radius,0.5rem)] text-[var(--pdp-accent,#a5f3fc)] shrink-0">
                    <Truck size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[var(--pdp-accent,#cffafe)] block">Track Your Order</span>
                    <span className="text-xs text-[var(--pdp-accent,color-mix(in_srgb,#a5f3fc_80%,transparent))]">
                      Once shipped, you will receive a tracking link via email and SMS. Our support
                      team can help with delivery questions during published support hours.
                    </span>
                  </div>
                </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

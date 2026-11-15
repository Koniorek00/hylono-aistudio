'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { pdpCommerceContent } from '@/content/pdpCommerce';

export interface InstallmentOption {
  months: number;
  monthlyAmount: number;
  interestRate: number;
}

export interface Hbot2FinancingDrawerProps {
  showFinancing: boolean;
  activeInstallment?: InstallmentOption;
  loanTerm: number;
  availableInstallmentOptions: InstallmentOption[];
  financingActionStatusMessage: string;
  focusRing: string;
  financingActionStatusId: string;
  financingActionStatusLabel: string;
  'aria-describedby'?: string;
  formatPrice: (value: number) => string;
  onClose: () => void;
  onSelectTerm: (option: InstallmentOption) => void;
  onLearnMore: () => void;
}

export function Hbot2FinancingDrawer({
  showFinancing,
  activeInstallment,
  loanTerm,
  availableInstallmentOptions,
  financingActionStatusMessage,
  focusRing,
  financingActionStatusId,
  financingActionStatusLabel,
  formatPrice,
  onClose,
  onSelectTerm,
  onLearnMore,
}: Hbot2FinancingDrawerProps) {
  return (
    <AnimatePresence>
      {showFinancing && activeInstallment ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 70 }}
            className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="hbot2-financing-title"
            aria-describedby={financingActionStatusId}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            style={{ zIndex: 80 }}
            data-testid="hbot2-financing-drawer-surface"
            className="fixed right-0 top-0 z-[80] h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-950 text-white"
          >
            <div className="px-6 pb-6 pt-28">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                    Financing
                  </p>
                  <h2 id="hbot2-financing-title" className="mt-1 text-2xl font-bold text-white">
                    {pdpCommerceContent.pricing.financingTitle}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className={`${focusRing} inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.045] hover:text-white`}
                  aria-label="Close financing options"
                  aria-describedby={financingActionStatusId}
                >
                  <X size={16} />
                </button>
              </div>

              <p
                id={financingActionStatusId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={financingActionStatusLabel}
                className="mt-4 text-sm leading-6 text-slate-300"
              >
                {financingActionStatusMessage}
              </p>

              <div className="mt-6 space-y-3">
                {availableInstallmentOptions.map((option) => {
                  const isSelected = option.months === loanTerm;
                  return (
                    <button
                      key={option.months}
                      type="button"
                      onClick={() => onSelectTerm(option)}
                      aria-pressed={isSelected}
                      aria-describedby={financingActionStatusId}
                      className={`${focusRing} w-full rounded-lg border px-4 py-4 text-left transition-colors ${
                        isSelected
                          ? 'border-cyan-300/45 bg-cyan-300/10'
                          : 'border-white/10 bg-white/[0.045] hover:border-cyan-300/45 hover:bg-white/[0.07]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">
                        {option.months} payments × {formatPrice(option.monthlyAmount)}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {option.interestRate === 0
                          ? '0% interest'
                          : `${option.interestRate.toFixed(1)}% interest`}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                  Estimated monthly amount
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  {formatPrice(activeInstallment.monthlyAmount)}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {pdpCommerceContent.pricing.noHiddenFees}
                </p>
              </div>

              <Link
                href="/financing"
                aria-describedby={financingActionStatusId}
                onClick={onLearnMore}
                className={`${focusRing} mt-6 inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 transition-colors hover:bg-cyan-200`}
              >
                {pdpCommerceContent.pricing.financingCta}
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

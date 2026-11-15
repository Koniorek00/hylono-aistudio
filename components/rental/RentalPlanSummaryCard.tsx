import React from 'react';
import Link from 'next/link';
import { rentalCheckoutContent } from '../../content/rentalCheckout';
import { priceBookMonthlyText } from '@/lib/money';

export interface RentalLineItem {
  productId: string;
  productTitle: string;
  monthlyPrice: number;
  deposit: number;
}

export interface CheckoutPlanOption {
  deposit: number;
  id: string;
  label: string;
  lineItems: RentalLineItem[];
  monthlyPrice: number;
  minPeriod: string;
  productLabel: string;
  termMonths: number;
}

interface RentalPlanSummaryCardProps {
  selectedPlan: CheckoutPlanOption;
  checkoutPlanOptions: CheckoutPlanOption[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  formatPrice: (amount: number) => string;
  firstInvoiceEstimate: number;
  actionStatusId: string;
  announceAction: (message: string) => void;
  trackAction: (action: string, properties?: Record<string, unknown>) => void;
}

export const RentalPlanSummaryCard: React.FC<RentalPlanSummaryCardProps> = ({
  selectedPlan,
  checkoutPlanOptions,
  selectedPlanId,
  onSelectPlan,
  formatPrice,
  firstInvoiceEstimate,
  actionStatusId,
  announceAction,
  trackAction,
}) => {
  return (
    <aside className="h-fit rounded-lg border border-slate-100 bg-white p-5 sm:p-6 lg:col-span-1 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto min-w-0 shadow-sm">
      <h1 className="mb-4 text-2xl font-black text-slate-900 futuristic-font">
        {rentalCheckoutContent.title}
      </h1>

      <div className="rounded-lg border border-slate-200 p-3.5 sm:p-4 min-w-0">
        <h2 className="text-sm font-semibold text-slate-900 break-words">{selectedPlan.productLabel}</h2>
        <p className="mt-1 text-xs text-slate-500">Plan: {selectedPlan.label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {priceBookMonthlyText(selectedPlan.monthlyPrice)}
        </p>
        <div className="mt-3 space-y-2">
          {selectedPlan.lineItems.map((plan) => (
            <div key={plan.productId} className="rounded-lg bg-slate-50 p-2.5 sm:px-3 sm:py-2 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 break-words">
                {plan.productTitle}
              </p>
              <p className="mt-1 text-sm text-slate-700 break-words">
                {priceBookMonthlyText(plan.monthlyPrice)} · Deposit {formatPrice(plan.deposit)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {checkoutPlanOptions.length > 1 && (
        <fieldset className="mt-6">
          <legend className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Term option
          </legend>
          <div className="space-y-2" role="radiogroup" aria-label="Rental term option">
            {checkoutPlanOptions.map((planOption) => {
              const isSelected = selectedPlanId === planOption.id;
              return (
                <label
                  key={planOption.id}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition min-w-0 ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rental-plan"
                    value={planOption.id}
                    checked={isSelected}
                    aria-describedby={actionStatusId}
                    onFocus={() => {
                      announceAction(`${planOption.label} option is ready.`);
                    }}
                    onChange={() => {
                      announceAction(`Selected ${planOption.label}.`);
                      onSelectPlan(planOption.id);
                    }}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-600"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
                      <span>{planOption.label}</span>
                      <span className="shrink-0">{priceBookMonthlyText(planOption.monthlyPrice)}</span>
                    </span>
                    <span
                      className={`mt-1 block text-xs break-words ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      Deposit {formatPrice(planOption.deposit)} · Minimum {planOption.minPeriod}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex justify-between items-baseline gap-2 min-w-0">
          <dt className="text-slate-500 min-w-0 break-words">Estimated monthly total</dt>
          <dd className="text-slate-800 shrink-0 font-medium">{formatPrice(selectedPlan.monthlyPrice)}</dd>
        </div>
        <div className="flex justify-between items-baseline gap-2 min-w-0">
          <dt className="text-slate-500 min-w-0 break-words">Estimated refundable deposit</dt>
          <dd className="text-slate-800 shrink-0 font-medium">{formatPrice(selectedPlan.deposit)}</dd>
        </div>
        <div className="flex justify-between items-baseline gap-2 min-w-0">
          <dt className="text-slate-500 min-w-0 break-words">Delivery and setup</dt>
          <dd className="text-emerald-700 shrink-0 font-medium">Included</dd>
        </div>
        <div className="flex justify-between items-baseline gap-2 border-t border-slate-100 pt-2.5 font-bold min-w-0">
          <dt className="text-slate-900 min-w-0 break-words">Estimated first invoice after review</dt>
          <dd className="text-slate-900 shrink-0 text-base">{formatPrice(firstInvoiceEstimate)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 break-words">
        {rentalCheckoutContent.depositNote}
      </p>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 min-w-0">
        <p className="font-semibold text-slate-900">Need a different configuration?</p>
        <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/rental"
            aria-describedby={actionStatusId}
            onFocus={() => {
              announceAction('Back to rental hub link is ready.');
            }}
            onClick={() => {
              announceAction('Opening rental hub.');
              trackAction('support_link_clicked', {
                destination: '/rental',
              });
            }}
            className="inline-flex min-h-11 items-center rounded-lg px-2.5 sm:px-3 font-semibold text-cyan-700 transition-colors hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 motion-reduce:transition-none"
          >
            Back to rental hub
          </Link>
          <Link
            href="/contact?intent=rental"
            aria-describedby={actionStatusId}
            onFocus={() => {
              announceAction('Ask for guidance link is ready.');
            }}
            onClick={() => {
              announceAction('Opening rental guidance contact.');
              trackAction('support_link_clicked', {
                destination: '/contact?intent=rental',
              });
            }}
            className="inline-flex min-h-11 items-center rounded-lg px-2.5 sm:px-3 font-semibold text-cyan-700 transition-colors hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 motion-reduce:transition-none"
          >
            Ask for guidance
          </Link>
        </div>
      </div>
    </aside>
  );
};

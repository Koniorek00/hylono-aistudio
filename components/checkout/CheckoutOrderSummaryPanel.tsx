import React from 'react';
import { Shield } from 'lucide-react';
import { checkoutContent } from '../../content/checkout';
import { siteEntity } from '../../content/site-entity';
import { formatMoney, priceBookMoney } from '../../lib/money';
import {
    CheckoutItem,
    focusRingClass,
    CHECKOUT_SUPPORT_ACTION_STATUS_ID,
    CHECKOUT_SUPPORT_ACTION_STATUS_LABEL,
    CHECKOUT_POLICY_ROUTE_ACTION_STATUS_ID,
    CHECKOUT_POLICY_ROUTE_ACTION_STATUS_LABEL,
} from './CheckoutPageData';

interface CheckoutOrderSummaryPanelProps {
    items: CheckoutItem[];
    total: number;
    supportActionStatus: string;
    policyRouteActionStatus: string;
    onAnnounceSupportAction: () => void;
    onHandleSupportAction: () => void;
    onAnnouncePolicyRouteAction: (href: string) => void;
    onHandlePolicyRouteAction: (href: string) => void;
}

export const CheckoutOrderSummaryPanel: React.FC<CheckoutOrderSummaryPanelProps> = ({
    items,
    total,
    supportActionStatus,
    policyRouteActionStatus,
    onAnnounceSupportAction,
    onHandleSupportAction,
    onAnnouncePolicyRouteAction,
    onHandlePolicyRouteAction,
}) => {
    return (
        <div className="bg-white/[0.03] backdrop-blur-md rounded-lg p-5 sm:p-6 h-fit lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto min-w-0 border border-white/10 text-white">
            <h3 className="font-bold text-white mb-4">{checkoutContent.summary.title}</h3>
            <div className="space-y-3 mb-4">
                {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                        <span className="text-slate-300 min-w-0 break-words">
                            {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium shrink-0 text-white">{formatMoney(priceBookMoney(item.price * item.quantity), { currencyDisplay: 'code' })}</span>
                    </div>
                ))}
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between items-baseline gap-2 text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="shrink-0 text-white font-medium">{formatMoney(priceBookMoney(total), { currencyDisplay: 'code' })}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2 text-sm">
                    <span className="text-slate-400">Shipping</span>
                    <span className="text-emerald-400 font-medium shrink-0">{checkoutContent.summary.shippingFree}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2 font-bold text-lg pt-2 border-t border-white/10">
                    <span className="text-white">{checkoutContent.summary.total}</span>
                    <span className="text-cyan-400 shrink-0">{formatMoney(priceBookMoney(total), { currencyDisplay: 'code' })}</span>
                </div>
            </div>

            <div className="mt-6 sm:mt-8 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="text-emerald-400 shrink-0" size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{checkoutContent.support.title}</span>
                </div>

                <p className="text-xs text-emerald-100/70 leading-relaxed break-words">{checkoutContent.support.description}</p>
                <dl className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between items-baseline gap-3">
                        <dt className="text-slate-400 shrink-0">{checkoutContent.support.emailLabel}</dt>
                        <dd className="min-w-0 text-right">
                            <a
                                className={`font-medium text-white hover:text-cyan-400 transition-colors break-all ${focusRingClass}`}
                                href={`mailto:${siteEntity.supportEmail}`}
                                aria-describedby={CHECKOUT_SUPPORT_ACTION_STATUS_ID}
                                onFocus={onAnnounceSupportAction}
                                onClick={onHandleSupportAction}
                            >
                                {siteEntity.supportEmail}
                            </a>
                        </dd>
                    </div>
                    <div className="flex justify-between items-baseline gap-3">
                        <dt className="text-slate-400 shrink-0">{checkoutContent.support.hoursLabel}</dt>
                        <dd className="text-right font-medium text-white">{siteEntity.supportHours}</dd>
                    </div>
                </dl>
                <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {checkoutContent.support.policyTitle}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {checkoutContent.policyLinks.map((policy) => (
                            <a
                                key={policy.href}
                                href={policy.href}
                                aria-describedby={CHECKOUT_POLICY_ROUTE_ACTION_STATUS_ID}
                                onFocus={() => onAnnouncePolicyRouteAction(policy.href)}
                                onClick={() => onHandlePolicyRouteAction(policy.href)}
                                className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors ${focusRingClass}`}
                            >
                                {policy.label}
                            </a>
                        ))}
                    </div>
                    <p
                        id={CHECKOUT_SUPPORT_ACTION_STATUS_ID}
                        role="status"
                        aria-label={CHECKOUT_SUPPORT_ACTION_STATUS_LABEL}
                        aria-live="polite"
                        aria-atomic="true"
                        className="sr-only"
                    >
                        {supportActionStatus}
                    </p>
                    <p
                        id={CHECKOUT_POLICY_ROUTE_ACTION_STATUS_ID}
                        role="status"
                        aria-label={CHECKOUT_POLICY_ROUTE_ACTION_STATUS_LABEL}
                        aria-live="polite"
                        aria-atomic="true"
                        className="sr-only"
                    >
                        {policyRouteActionStatus}
                    </p>
                </div>
                <ul className="mt-4 space-y-2 text-[11px] text-emerald-100/50">
                    {checkoutContent.trustSignals.map((signal) => (
                        <li key={signal} className="break-words">- {signal}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

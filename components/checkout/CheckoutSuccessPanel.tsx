import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { checkoutContent } from '../../content/checkout';
import {
    focusRingClass,
    CHECKOUT_SUCCESS_ACTION_STATUS_ID,
    CHECKOUT_SUCCESS_ACTION_STATUS_LABEL,
} from './CheckoutPageData';

interface CheckoutSuccessPanelProps {
    shouldReduceMotion: boolean | null;
    orderOutcomeMessage: string;
    shippingEmail: string;
    orderId: string | null;
    successActionStatus: string;
    onAnnounceSuccessAction: () => void;
    onHandleSuccessAction: () => void;
}

export const CheckoutSuccessPanel: React.FC<CheckoutSuccessPanelProps> = ({
    shouldReduceMotion,
    orderOutcomeMessage,
    shippingEmail,
    orderId,
    successActionStatus,
    onAnnounceSuccessAction,
    onHandleSuccessAction,
}) => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24">
            <div className="max-w-lg mx-auto px-6 text-center">
                <motion.div
                    initial={shouldReduceMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={shouldReduceMotion ? { duration: 0 } : undefined}
                    className="w-24 h-24 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-8"
                >
                    <Check className="text-white" size={48} />
                </motion.div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{checkoutContent.success.title}</h1>
                <p className="text-slate-600 mb-8">
                    {orderOutcomeMessage || `${checkoutContent.success.messagePrefix} ${shippingEmail}`}
                </p>
                {orderId && <p className="text-sm text-slate-400 mb-8">{checkoutContent.success.orderPrefix} {orderId}</p>}
                <button
                    aria-describedby={CHECKOUT_SUCCESS_ACTION_STATUS_ID}
                    onFocus={onAnnounceSuccessAction}
                    onClick={onHandleSuccessAction}
                    className={`px-8 py-4 bg-slate-900 text-white rounded-lg font-bold ${focusRingClass}`}
                >
                    {checkoutContent.success.cta}
                </button>
                <p
                    id={CHECKOUT_SUCCESS_ACTION_STATUS_ID}
                    role="status"
                    aria-label={CHECKOUT_SUCCESS_ACTION_STATUS_LABEL}
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                >
                    {successActionStatus}
                </p>
            </div>
        </div>
    );
};

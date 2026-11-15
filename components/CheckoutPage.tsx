import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ShoppingBag, Truck, CreditCard, Check, ChevronRight, Lock, MapPin, Shield } from 'lucide-react';
import { useCart } from './Cart';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { checkoutContent } from '../content/checkout';
import { regulatoryGateContent } from '../content/rentalCheckout';
import { siteEntity } from '../content/site-entity';
import { submitCheckoutFormAction, type FormActionResult } from '../src/actions/formActions';
import { HoneypotField } from './shared/HoneypotField';
import { TurnstileWidget } from './shared/TurnstileWidget';
import { summarizeClientErrorForLog } from '../utils/clientLogSafety';
import {
    Step,
    PaymentMethod,
    ShippingFieldKey,
    focusRingClass,
    CHECKOUT_SUBMIT_HELP_ID,
    CHECKOUT_SUBMIT_ERROR_ID,
    CHECKOUT_SUBMIT_STATUS_ID,
    CHECKOUT_SUBMIT_STATUS_LABEL,
    CHECKOUT_SHIPPING_FIELD_HELP_ID,
    CHECKOUT_SHIPPING_FIELD_STATUS_ID,
    CHECKOUT_SHIPPING_FIELD_STATUS_LABEL,
    CHECKOUT_SHIPPING_FIELD_READY_STATUS,
    CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_ID,
    CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_LABEL,
    CHECKOUT_EMPTY_ROUTE_ACTION_READY_STATUS,
    CHECKOUT_POLICY_ROUTE_ACTION_STATUS_ID,
    CHECKOUT_POLICY_ROUTE_ACTION_READY_STATUS,
    CHECKOUT_STEP_ACTION_STATUS_ID,
    CHECKOUT_STEP_ACTION_STATUS_LABEL,
    CHECKOUT_STEP_ACTION_READY_STATUS,
    CHECKOUT_SUPPORT_ACTION_READY_STATUS,
    CHECKOUT_SUCCESS_ACTION_READY_STATUS,
    getCheckoutEmptyRouteActionStatus,
    getCheckoutPolicyRouteActionStatus,
    getCheckoutStepActionStatus,
    getCheckoutShippingFieldStatus,
    getCheckoutSupportActionStatus,
    getCheckoutSuccessActionStatus,
    trackCheckoutAction,
    trackCartView,
    trackCheckoutStepView,
    trackCheckoutComplete,
} from './checkout/CheckoutPageData';
import { CheckoutOrderSummaryPanel } from './checkout/CheckoutOrderSummaryPanel';
import { CheckoutSuccessPanel } from './checkout/CheckoutSuccessPanel';
import { CheckoutEmptyState } from './checkout/CheckoutEmptyState';
import { formatMoneyParts, priceBookMoney } from '../lib/money';

// Help text ids for the two Article 7 / privacy gates added alongside the existing
// intended-use attestation. Declared here rather than in
// `components/checkout/CheckoutPageData.tsx`, which is owned by another lane.
const CHECKOUT_SUPPORT_ONLY_GATE_HELP_ID = 'checkout-support-only-gate-help';
const CHECKOUT_PRIVACY_GATE_HELP_ID = 'checkout-privacy-gate-help';

export const CheckoutPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const { items, total, clearCart } = useCart();
    const [step, setStep] = useState<Step>('shipping');
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderOutcomeMessage, setOrderOutcomeMessage] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [checkoutActionState, setCheckoutActionState] = useState<FormActionResult>({
        success: false,
        message: '',
    });
    const [checkoutPending, setCheckoutPending] = useState(false);
    const [intendedUseAttestation, setIntendedUseAttestation] = useState(false);
    const [supportOnlyAcknowledged, setSupportOnlyAcknowledged] = useState(false);
    const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
    const [emptyRouteActionStatus, setEmptyRouteActionStatus] = useState(
        CHECKOUT_EMPTY_ROUTE_ACTION_READY_STATUS
    );
    const [policyRouteActionStatus, setPolicyRouteActionStatus] = useState(
        CHECKOUT_POLICY_ROUTE_ACTION_READY_STATUS
    );
    const [stepActionStatus, setStepActionStatus] = useState(CHECKOUT_STEP_ACTION_READY_STATUS);
    const [supportActionStatus, setSupportActionStatus] = useState(CHECKOUT_SUPPORT_ACTION_READY_STATUS);
    const [successActionStatus, setSuccessActionStatus] = useState(CHECKOUT_SUCCESS_ACTION_READY_STATUS);
    const [shippingFieldStatus, setShippingFieldStatus] = useState(
        CHECKOUT_SHIPPING_FIELD_READY_STATUS
    );
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('bank_transfer');
    const cartViewTrackedRef = useRef(false);
    const checkoutCompleteTrackedRef = useRef(false);
    const checkoutStepViewsTrackedRef = useRef<Set<Step>>(new Set());

    const checkoutTrustEnabled = useFeatureFlag('feature_checkout_trust');
    const shouldReduceMotion = useReducedMotion();
    const stepPanelMotion = shouldReduceMotion
        ? {
              initial: false as const,
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 1, x: 0 },
              transition: { duration: 0 },
          }
        : {
              initial: { opacity: 0, x: 20 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -20 },
          };

    const [shipping, setShipping] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Poland',
    });

    const isShippingValid =
        shipping.firstName.trim().length > 0 &&
        shipping.lastName.trim().length > 0 &&
        shipping.email.trim().includes('@') &&
        shipping.address.trim().length > 0 &&
        shipping.city.trim().length > 0 &&
        shipping.postalCode.trim().length > 0 &&
        shipping.country.trim().length > 0;
    const checkoutShippingFieldDescriptionIds = [
        CHECKOUT_SHIPPING_FIELD_HELP_ID,
        CHECKOUT_SHIPPING_FIELD_STATUS_ID,
    ].join(' ');
    const checkoutContinueDescriptionIds = [
        CHECKOUT_STEP_ACTION_STATUS_ID,
        !isShippingValid ? CHECKOUT_SHIPPING_FIELD_HELP_ID : null,
    ].filter(Boolean).join(' ');

    const updateShippingField = (field: ShippingFieldKey, value: string) => {
        setShipping((currentShipping) => ({
            ...currentShipping,
            [field]: value,
        }));
        setShippingFieldStatus(getCheckoutShippingFieldStatus(field, value));
    };

    const announceShippingField = (field: ShippingFieldKey) => {
        setShippingFieldStatus(getCheckoutShippingFieldStatus(field, shipping[field]));
    };

    const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
        { key: 'shipping', label: checkoutContent.steps.shipping, icon: <Truck size={18} /> },
        { key: 'payment', label: checkoutContent.steps.payment, icon: <CreditCard size={18} /> },
        { key: 'confirm', label: checkoutContent.steps.confirm, icon: <Check size={18} /> },
    ];

    useEffect(() => {
        if (cartViewTrackedRef.current) {
            return;
        }

        cartViewTrackedRef.current = true;
        trackCartView({
            has_items: items.length > 0,
            item_count: items.length,
        });
    }, [items.length]);

    useEffect(() => {
        if (orderComplete || items.length === 0 || checkoutStepViewsTrackedRef.current.has(step)) {
            return;
        }

        checkoutStepViewsTrackedRef.current.add(step);
        trackCheckoutStepView(step, {
            item_count: items.length,
            payment_method: selectedPaymentMethod,
            trust_enabled: checkoutTrustEnabled,
        });
    }, [checkoutTrustEnabled, items.length, orderComplete, selectedPaymentMethod, step]);

    useEffect(() => {
        if (checkoutActionState.success) {
            if (!checkoutCompleteTrackedRef.current) {
                checkoutCompleteTrackedRef.current = true;
                trackCheckoutComplete({
                    result: 'succeeded',
                    item_count: items.length,
                    payment_method: selectedPaymentMethod,
                    trust_enabled: checkoutTrustEnabled,
                    intended_use_attested: intendedUseAttestation,
                });
            }

            setOrderId(checkoutActionState.orderId ?? null);
            setOrderOutcomeMessage(
                checkoutActionState.message || `Order ${checkoutActionState.orderId ?? ''} received.`
            );
            try {
                if (checkoutActionState.orderId) {
                    sessionStorage.setItem('hylono_last_order_ref', checkoutActionState.orderId);
                }
            } catch {
                // no-op
            }
            clearCart();
            setOrderComplete(true);
            setSubmitError(null);
            return;
        }

        if (checkoutActionState.message) {
            setSubmitError(checkoutActionState.message);
        }
    }, [
        checkoutActionState,
        checkoutTrustEnabled,
        clearCart,
        intendedUseAttestation,
        items.length,
        selectedPaymentMethod,
    ]);

    const visibleSubmitError =
        checkoutActionState.success ? null : submitError || checkoutActionState.message || null;
    const checkoutSubmitAttestationStatusVisible = checkoutTrustEnabled && !intendedUseAttestation;
    const checkoutSubmitDescriptionIds = [
        CHECKOUT_SUBMIT_HELP_ID,
        visibleSubmitError ? CHECKOUT_SUBMIT_ERROR_ID : null,
        checkoutSubmitAttestationStatusVisible ? CHECKOUT_SUBMIT_STATUS_ID : null,
    ].filter(Boolean).join(' ');
    const checkoutSubmitAttestationDescriptionId = checkoutSubmitAttestationStatusVisible
        ? CHECKOUT_SUBMIT_STATUS_ID
        : CHECKOUT_SUBMIT_HELP_ID;

    const handleCheckoutSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        setCheckoutPending(true);
        setSubmitError(null);
        trackCheckoutAction('place_order_submitted', {
            step,
            payment_method: selectedPaymentMethod,
            item_count: items.length,
            trust_enabled: checkoutTrustEnabled,
            intended_use_attested: intendedUseAttestation,
        });

        try {
            const result = await submitCheckoutFormAction(checkoutActionState, formData);
            trackCheckoutAction('place_order_completed', {
                result: result.success ? 'success' : 'failed',
                payment_method: selectedPaymentMethod,
                item_count: items.length,
            });
            setCheckoutActionState(result);
        } catch (error) {
            console.error(
                '[CheckoutPage] submitCheckoutFormAction failed',
                summarizeClientErrorForLog(error)
            );
            trackCheckoutAction('place_order_completed', {
                result: 'failed',
                failure_source: 'exception',
                payment_method: selectedPaymentMethod,
                item_count: items.length,
            });
            setCheckoutActionState({
                success: false,
                message: checkoutContent.confirmation.submitErrorFallback,
            });
        } finally {
            setCheckoutPending(false);
        }
    };

    const announceEmptyCartRouteAction = (destination: '/store' | '/rental' | '/help') => {
        setEmptyRouteActionStatus(getCheckoutEmptyRouteActionStatus(destination));
    };

    const handleEmptyCartRouteAction = (destination: '/store' | '/rental' | '/help') => {
        announceEmptyCartRouteAction(destination);
        trackCheckoutAction('empty_cart_transition', {
            destination,
        });
    };

    const announcePolicyRouteAction = (destination: string) => {
        setPolicyRouteActionStatus(getCheckoutPolicyRouteActionStatus(destination));
    };

    const handlePolicyRouteAction = (destination: string) => {
        announcePolicyRouteAction(destination);
        trackCheckoutAction('policy_link_clicked', {
            destination,
        });
    };

    const announceCheckoutStepAction = (
        action:
            | 'shipping_continue_clicked'
            | 'payment_method_selected'
            | 'review_order_clicked'
            | 'step_back_clicked',
        details: {
            paymentMethod?: PaymentMethod;
            fromStep?: Step;
            toStep?: Step;
        } = {}
    ) => {
        setStepActionStatus(getCheckoutStepActionStatus(action, details));
    };

    const announceCheckoutSupportAction = () => {
        setSupportActionStatus(getCheckoutSupportActionStatus());
    };

    const handleCheckoutSupportAction = () => {
        announceCheckoutSupportAction();
        trackCheckoutAction('support_email_clicked', {
            destination: 'support_email',
        });
    };

    const announceCheckoutSuccessAction = () => {
        setSuccessActionStatus(getCheckoutSuccessActionStatus());
    };

    const handleCheckoutSuccessAction = () => {
        announceCheckoutSuccessAction();
        trackCheckoutAction('success_account_transition', {
            destination: '/account',
        });
        onNavigate('account');
    };

    if (orderComplete) {
        return (
            <CheckoutSuccessPanel
                shouldReduceMotion={shouldReduceMotion}
                orderOutcomeMessage={orderOutcomeMessage}
                shippingEmail={shipping.email}
                orderId={orderId}
                successActionStatus={successActionStatus}
                onAnnounceSuccessAction={announceCheckoutSuccessAction}
                onHandleSuccessAction={handleCheckoutSuccessAction}
            />
        );
    }

    if (items.length === 0) {
        return (
            <CheckoutEmptyState
                emptyRouteActionStatus={emptyRouteActionStatus}
                onAnnounceEmptyCartRouteAction={announceEmptyCartRouteAction}
                onHandleEmptyCartRouteAction={handleEmptyCartRouteAction}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-32 pb-24 text-white">
            <div className="max-w-5xl mx-auto px-6">
                <div className="mb-8 max-w-3xl">
                    <h1 className="text-3xl font-bold tracking-tight text-white">{checkoutContent.meta.title}</h1>
                    <p className="mt-3 text-slate-400">{checkoutContent.meta.intro}</p>
                </div>

                <div className="flex items-center justify-center mb-8 sm:mb-12 overflow-x-auto py-1 px-2 max-w-full" aria-label="Checkout progress">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <div
                                aria-current={step === s.key ? 'step' : undefined}
                                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg shrink-0 transition-all ${
                                    step === s.key
                                        ? 'bg-white/[0.08] text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                        : steps.findIndex((x) => x.key === step) > i
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-white/[0.04] text-slate-500 border border-white/5'
                                }`}
                            >
                                <span className="shrink-0">{s.icon}</span>
                                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && <ChevronRight className="mx-1 sm:mx-2 text-slate-600 shrink-0" size={18} />}
                        </React.Fragment>
                    ))}
                </div>
                <p
                    id={CHECKOUT_STEP_ACTION_STATUS_ID}
                    role="status"
                    aria-label={CHECKOUT_STEP_ACTION_STATUS_LABEL}
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                >
                    {stepActionStatus}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 min-w-0">
                        <AnimatePresence mode="wait">
                            {step === 'shipping' && (
                                <motion.div
                                    key="shipping"
                                    {...stepPanelMotion}
                                    className="bg-white/[0.03] backdrop-blur-md rounded-lg p-5 sm:p-8 min-w-0 border border-white/10"
                                >
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <MapPin size={20} className="shrink-0 text-cyan-400" /> {checkoutContent.shipping.title}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input
                                            aria-label={checkoutContent.shipping.firstName}
                                            aria-describedby={checkoutShippingFieldDescriptionIds}
                                            placeholder={checkoutContent.shipping.firstName}
                                            value={shipping.firstName}
                                            onFocus={() => announceShippingField('firstName')}
                                            onChange={(event) => updateShippingField('firstName', event.target.value)}
                                            className="px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 focus:outline-none min-h-11 w-full transition-colors"
                                        />
                                        <input
                                            aria-label={checkoutContent.shipping.lastName}
                                            aria-describedby={checkoutShippingFieldDescriptionIds}
                                            placeholder={checkoutContent.shipping.lastName}
                                            value={shipping.lastName}
                                            onFocus={() => announceShippingField('lastName')}
                                            onChange={(event) => updateShippingField('lastName', event.target.value)}
                                            className="px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 focus:outline-none min-h-11 w-full transition-colors"
                                        />
                                        <input
                                            aria-label={checkoutContent.shipping.email}
                                            aria-describedby={checkoutShippingFieldDescriptionIds}
                                            placeholder={checkoutContent.shipping.email}
                                            type="email"
                                            value={shipping.email}
                                            onFocus={() => announceShippingField('email')}
                                            onChange={(event) => updateShippingField('email', event.target.value)}
                                            className="col-span-1 sm:col-span-2 px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 focus:outline-none min-h-11 w-full transition-colors"
                                        />
                                        <input
                                            aria-label={checkoutContent.shipping.phone}
                                            aria-describedby={checkoutShippingFieldDescriptionIds}
                                            placeholder={checkoutContent.shipping.phone}
                                            value={shipping.phone}
                                            onFocus={() => announceShippingField('phone')}
                                            onChange={(event) => updateShippingField('phone', event.target.value)}
                                            className="col-span-1 sm:col-span-2 px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 focus:outline-none min-h-11 w-full transition-colors"
                                        />
                                        <input
                                            aria-label={checkoutContent.shipping.streetAddress}
                                            aria-describedby={checkoutShippingFieldDescriptionIds}
                                            placeholder={checkoutContent.shipping.streetAddress}
                                            value={shipping.address}
                                            onFocus={() => announceShippingField('address')}
                                            onChange={(event) => updateShippingField('address', event.target.value)}
                                            className="col-span-1 sm:col-span-2 px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 focus:outline-none min-h-11 w-full transition-colors"
                                        />
                                        <input
                                            aria-label={checkoutContent.shipping.city}
                                            aria-describedby={checkoutShippingFieldDescriptionIds}
                                            placeholder={checkoutContent.shipping.city}
                                            value={shipping.city}
                                            onFocus={() => announceShippingField('city')}
                                            onChange={(event) => updateShippingField('city', event.target.value)}
                                            className="px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 focus:outline-none min-h-11 w-full transition-colors"
                                        />
                                        <input
                                            aria-label={checkoutContent.shipping.postalCode}
                                            aria-describedby={checkoutShippingFieldDescriptionIds}
                                            placeholder={checkoutContent.shipping.postalCode}
                                            value={shipping.postalCode}
                                            onFocus={() => announceShippingField('postalCode')}
                                            onChange={(event) => updateShippingField('postalCode', event.target.value)}
                                            className="px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 focus:outline-none min-h-11 w-full transition-colors"
                                        />
                                    </div>
                                    <p id={CHECKOUT_SHIPPING_FIELD_HELP_ID} className="sr-only">
                                        Complete first name, last name, email, address, city, and postal code before continuing to payment.
                                    </p>
                                    <p
                                        id={CHECKOUT_SHIPPING_FIELD_STATUS_ID}
                                        role="status"
                                        aria-label={CHECKOUT_SHIPPING_FIELD_STATUS_LABEL}
                                        aria-live="polite"
                                        aria-atomic="true"
                                        className="sr-only"
                                    >
                                        {shippingFieldStatus}
                                    </p>
                                    <button
                                        aria-describedby={checkoutContinueDescriptionIds}
                                        onFocus={() =>
                                            announceCheckoutStepAction('shipping_continue_clicked', {
                                                fromStep: 'shipping',
                                                toStep: 'payment',
                                            })
                                        }
                                        onClick={() => {
                                            announceCheckoutStepAction('shipping_continue_clicked', {
                                                fromStep: 'shipping',
                                                toStep: 'payment',
                                            });
                                            trackCheckoutAction('shipping_continue_clicked', {
                                                from_step: 'shipping',
                                                to_step: 'payment',
                                                item_count: items.length,
                                            });
                                            setStep('payment');
                                        }}
                                        disabled={!isShippingValid}
                                        className={`w-full mt-6 py-4 bg-cyan-500 text-slate-950 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-colors min-h-11 disabled:opacity-60 disabled:cursor-not-allowed border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] ${focusRingClass}`}
                                    >
                                        {checkoutContent.shipping.continueToPayment}
                                    </button>
                                    {!isShippingValid && (
                                        <p className="mt-3 text-sm text-slate-500">
                                            Complete the shipping fields before continuing to payment.
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {step === 'payment' && (
                                <motion.div
                                    key="payment"
                                    {...stepPanelMotion}
                                    className="bg-white/[0.03] backdrop-blur-md rounded-lg p-5 sm:p-8 min-w-0 border border-white/10"
                                >
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <CreditCard size={20} className="shrink-0 text-cyan-400" /> {checkoutContent.payment.title}
                                    </h2>
                                    <div className="space-y-4">
                                        <label className="flex items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 border border-white/10 bg-white/[0.02] rounded-lg min-h-11 min-w-0 opacity-60">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="card"
                                                checked={selectedPaymentMethod === 'card'}
                                                aria-describedby={CHECKOUT_STEP_ACTION_STATUS_ID}
                                                onChange={() => setSelectedPaymentMethod('card')}
                                                className="accent-cyan-400 mt-1 sm:mt-0 shrink-0"
                                                disabled
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-white">{checkoutContent.payment.cardTitle}</span>
                                                <p className="text-xs text-slate-500 break-words">Temporarily unavailable in this checkout. Choose bank transfer or financing.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 border border-white/10 bg-white/[0.02] rounded-lg cursor-pointer hover:border-cyan-400/50 hover:bg-white/[0.04] min-h-11 min-w-0 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="bank_transfer"
                                                checked={selectedPaymentMethod === 'bank_transfer'}
                                                aria-describedby={CHECKOUT_STEP_ACTION_STATUS_ID}
                                                onFocus={() =>
                                                    announceCheckoutStepAction('payment_method_selected', {
                                                        paymentMethod: 'bank_transfer',
                                                    })
                                                }
                                                onChange={() => {
                                                    announceCheckoutStepAction('payment_method_selected', {
                                                        paymentMethod: 'bank_transfer',
                                                    });
                                                    trackCheckoutAction('payment_method_selected', {
                                                        payment_method: 'bank_transfer',
                                                    });
                                                    setSelectedPaymentMethod('bank_transfer');
                                                }}
                                                className="accent-cyan-400 mt-1 sm:mt-0 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-white">{checkoutContent.payment.bankTransferTitle}</span>
                                                <p className="text-xs text-slate-400 break-words">{checkoutContent.payment.bankTransferDescription}</p>
                                            </div>
                                        </label>
                                        <label className="flex items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 border border-white/10 bg-white/[0.02] rounded-lg cursor-pointer hover:border-cyan-400/50 hover:bg-white/[0.04] min-h-11 min-w-0 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="financing"
                                                checked={selectedPaymentMethod === 'financing'}
                                                aria-describedby={CHECKOUT_STEP_ACTION_STATUS_ID}
                                                onFocus={() =>
                                                    announceCheckoutStepAction('payment_method_selected', {
                                                        paymentMethod: 'financing',
                                                    })
                                                }
                                                onChange={() => {
                                                    announceCheckoutStepAction('payment_method_selected', {
                                                        paymentMethod: 'financing',
                                                    });
                                                    trackCheckoutAction('payment_method_selected', {
                                                        payment_method: 'financing',
                                                    });
                                                    setSelectedPaymentMethod('financing');
                                                }}
                                                className="accent-cyan-400 mt-1 sm:mt-0 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-white">{checkoutContent.payment.financingTitle}</span>
                                                <p className="text-xs text-slate-400 break-words">{checkoutContent.payment.financingFromPrefix} {formatMoneyParts(priceBookMoney(Math.round(total / 36)), { currencyDisplay: 'code' }).amount} {checkoutContent.payment.financingPerMonthSuffix}</p>
                                            </div>
                                        </label>
                                    </div>

                                    {checkoutTrustEnabled && (
                                        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 min-w-0">
                                            <div className="flex flex-wrap gap-3 text-xs text-slate-600 font-medium" aria-label="Checkout trust signals">
                                                {checkoutContent.trustSignals.map((signal) => (
                                                    <span key={signal} className="break-words">{signal}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-6">
                                        <button
                                            aria-describedby={CHECKOUT_STEP_ACTION_STATUS_ID}
                                            onFocus={() =>
                                                announceCheckoutStepAction('step_back_clicked', {
                                                    fromStep: 'payment',
                                                    toStep: 'shipping',
                                                })
                                            }
                                            onClick={() => {
                                                announceCheckoutStepAction('step_back_clicked', {
                                                    fromStep: 'payment',
                                                    toStep: 'shipping',
                                                });
                                                trackCheckoutAction('step_back_clicked', {
                                                    from_step: 'payment',
                                                    to_step: 'shipping',
                                                });
                                                setStep('shipping');
                                            }}
                                            className={`w-full sm:w-auto px-6 py-3.5 sm:py-4 text-slate-300 font-medium min-h-11 text-center justify-center flex items-center border border-white/10 sm:border-transparent bg-white/[0.04] sm:bg-transparent rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors ${focusRingClass}`}
                                        >
                                            {checkoutContent.payment.back}
                                        </button>
                                        <button
                                            aria-describedby={CHECKOUT_STEP_ACTION_STATUS_ID}
                                            onFocus={() =>
                                                announceCheckoutStepAction('review_order_clicked', {
                                                    fromStep: 'payment',
                                                    toStep: 'confirm',
                                                    paymentMethod: selectedPaymentMethod,
                                                })
                                            }
                                            onClick={() => {
                                                announceCheckoutStepAction('review_order_clicked', {
                                                    fromStep: 'payment',
                                                    toStep: 'confirm',
                                                    paymentMethod: selectedPaymentMethod,
                                                });
                                                trackCheckoutAction('review_order_clicked', {
                                                    from_step: 'payment',
                                                    to_step: 'confirm',
                                                    payment_method: selectedPaymentMethod,
                                                    item_count: items.length,
                                                });
                                                setStep('confirm');
                                            }}
                                            className={`flex-1 py-3.5 sm:py-4 bg-cyan-500 text-slate-950 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-colors min-h-11 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] ${focusRingClass}`}
                                        >
                                            {checkoutContent.payment.reviewOrder}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'confirm' && (
                                <motion.div
                                    key="confirm"
                                    {...stepPanelMotion}
                                    className="bg-white/[0.03] backdrop-blur-md rounded-lg p-5 sm:p-8 min-w-0 border border-white/10"
                                >
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Check size={20} className="shrink-0 text-emerald-400" /> {checkoutContent.confirmation.title}
                                    </h2>
                                    <div className="space-y-4 mb-6">
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg min-w-0 break-words">
                                            <p className="text-xs text-slate-500 mb-1">{checkoutContent.confirmation.shippingTo}</p>
                                            <p className="font-medium text-white">
                                                {shipping.firstName} {shipping.lastName}
                                            </p>
                                            <p className="text-sm text-slate-300">
                                                {shipping.address}, {shipping.city} {shipping.postalCode}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg min-w-0 break-words">
                                            <p className="text-xs text-slate-500 mb-1">
                                                {checkoutContent.confirmation.paymentRoute}
                                            </p>
                                            <p className="font-medium text-white">
                                                {selectedPaymentMethod === 'bank_transfer'
                                                    ? checkoutContent.payment.bankTransferTitle
                                                    : checkoutContent.payment.financingTitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/*
                                     * The three gates below are legal gates, not trust
                                     * signals, so they are NOT behind
                                     * `feature_checkout_trust` (which is off by default).
                                     * `src/actions/formActions.ts` and
                                     * `app/api/checkout/route.ts` both require these three
                                     * fields, so hiding them behind a flag would make the
                                     * form unsubmittable rather than unguarded.
                                     * `checkoutContent.intendedUseAttestation` stays the
                                     * rendered wording so the existing copy is reused
                                     * verbatim; the help lines are the new, honest text.
                                     */}
                                    <label className="flex items-start gap-3 text-sm text-slate-300 mb-5 min-h-11 min-w-0 hover:text-white transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={intendedUseAttestation}
                                            required
                                            aria-describedby={checkoutSubmitAttestationDescriptionId}
                                            onChange={(event) => setIntendedUseAttestation(event.target.checked)}
                                            className="mt-1 accent-cyan-400 shrink-0"
                                            name="intended_use_attestation"
                                        />
                                        <span className="flex-1 min-w-0 break-words">
                                            {checkoutContent.intendedUseAttestation}
                                            <span className="block text-xs text-slate-400 break-words">{regulatoryGateContent.intendedUseHelp}</span>
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 text-sm text-slate-300 mb-5 min-h-11 min-w-0 hover:text-white transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={supportOnlyAcknowledged}
                                            required
                                            aria-describedby={CHECKOUT_SUPPORT_ONLY_GATE_HELP_ID}
                                            onChange={(event) => setSupportOnlyAcknowledged(event.target.checked)}
                                            className="mt-1 accent-cyan-400 shrink-0"
                                            name="support_only_acknowledgement"
                                        />
                                        <span className="flex-1 min-w-0 break-words">
                                            {regulatoryGateContent.supportOnlyLabel}
                                            <span id={CHECKOUT_SUPPORT_ONLY_GATE_HELP_ID} className="block text-xs text-slate-400 break-words">{regulatoryGateContent.supportOnlyHelp}</span>
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 text-sm text-slate-300 mb-5 min-h-11 min-w-0 hover:text-white transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={privacyAcknowledged}
                                            required
                                            aria-describedby={CHECKOUT_PRIVACY_GATE_HELP_ID}
                                            onChange={(event) => setPrivacyAcknowledged(event.target.checked)}
                                            className="mt-1 accent-cyan-400 shrink-0"
                                            name="privacy_acknowledged"
                                        />
                                        <span className="flex-1 min-w-0 break-words">
                                            {regulatoryGateContent.privacyLabel}
                                            <span id={CHECKOUT_PRIVACY_GATE_HELP_ID} className="block text-xs text-slate-400 break-words">{regulatoryGateContent.privacyHelp}</span>
                                        </span>
                                    </label>

                                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
                                        <button
                                            aria-describedby={CHECKOUT_STEP_ACTION_STATUS_ID}
                                            onFocus={() =>
                                                announceCheckoutStepAction('step_back_clicked', {
                                                    fromStep: 'confirm',
                                                    toStep: 'payment',
                                                })
                                            }
                                            onClick={() => {
                                                announceCheckoutStepAction('step_back_clicked', {
                                                    fromStep: 'confirm',
                                                    toStep: 'payment',
                                                });
                                                trackCheckoutAction('step_back_clicked', {
                                                    from_step: 'confirm',
                                                    to_step: 'payment',
                                                });
                                                setStep('payment');
                                            }}
                                            className={`w-full sm:w-auto px-6 py-3.5 sm:py-4 text-slate-300 font-medium min-h-11 text-center justify-center flex items-center border border-white/10 sm:border-transparent bg-white/[0.04] sm:bg-transparent rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors ${focusRingClass}`}
                                        >
                                            {checkoutContent.payment.back}
                                        </button>
                                        {visibleSubmitError && (
                                            <p
                                                id={CHECKOUT_SUBMIT_ERROR_ID}
                                                className="flex-1 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 break-words"
                                                role="alert"
                                            >
                                                {visibleSubmitError}
                                            </p>
                                        )}
                                        <form onSubmit={handleCheckoutSubmit} className="flex-1 min-w-0">
                                            <HoneypotField />
                                            <TurnstileWidget />
                                            <input
                                                type="hidden"
                                                name="itemsJson"
                                                value={JSON.stringify(
                                                    items.map((item) => ({
                                                        id: item.id,
                                                        name: item.name,
                                                        price: item.price,
                                                        quantity: item.quantity,
                                                    }))
                                                )}
                                            />
                                            <input type="hidden" name="shippingJson" value={JSON.stringify(shipping)} />
                                            <input type="hidden" name="paymentMethod" value={selectedPaymentMethod} />
                                            <button
                                                type="submit"
                                                disabled={checkoutPending || checkoutSubmitAttestationStatusVisible}
                                                aria-describedby={checkoutSubmitDescriptionIds}
                                                className={`w-full py-3.5 sm:py-4 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed min-h-11 ${focusRingClass}`}
                                            >
                                                {checkoutPending ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                        {checkoutContent.confirmation.processing}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={16} /> {checkoutContent.confirmation.placeOrder}
                                                    </>
                                                )}
                                            </button>
                                            <p id={CHECKOUT_SUBMIT_HELP_ID} className="mt-3 text-sm text-slate-500 break-words">{checkoutContent.confirmation.submitHelp}</p>
                                            {checkoutSubmitAttestationStatusVisible && (
                                                <p
                                                    id={CHECKOUT_SUBMIT_STATUS_ID}
                                                    className="mt-2 text-sm text-amber-700 break-words"
                                                    role="status"
                                                    aria-label={CHECKOUT_SUBMIT_STATUS_LABEL}
                                                    aria-live="polite"
                                                    aria-atomic="true"
                                                >
                                                    {checkoutContent.confirmation.disabledAttestation}
                                                </p>
                                            )}
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <CheckoutOrderSummaryPanel
                        items={items}
                        total={total}
                        supportActionStatus={supportActionStatus}
                        policyRouteActionStatus={policyRouteActionStatus}
                        onAnnounceSupportAction={announceCheckoutSupportAction}
                        onHandleSupportAction={handleCheckoutSupportAction}
                        onAnnouncePolicyRouteAction={announcePolicyRouteAction}
                        onHandlePolicyRouteAction={handlePolicyRouteAction}
                    />
                </div>
            </div>
        </div>
    );
};

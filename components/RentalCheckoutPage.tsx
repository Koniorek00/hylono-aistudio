import React, { useActionState, useEffect, useMemo, useState } from 'react';
import { type ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  getRentalPlanOptions,
  resolveRentalPlan,
  resolveRentalProductId,
  type RentalPlanOption,
} from '@/lib/commerce/rental-catalog';
import { productById } from '@/content/products';
import { NavigateFunction } from '../types';
import { FeatureGate } from './FeatureGate';
import { rentalCheckoutContent } from '../content/rentalCheckout';
import { submitRentalFormAction, type FormActionResult } from '../src/actions/formActions';
import { HoneypotField } from './shared/HoneypotField';
import { TurnstileWidget } from './shared/TurnstileWidget';
import analytics from '../src/lib/analytics';
import { RentalPlanSummaryCard } from './rental/RentalPlanSummaryCard';
import { formatMoney, money } from '../lib/money';
import { priceBookMonthlyText, priceBookText } from '../lib/money';

interface RentalCheckoutPageProps {
  onNavigate: NavigateFunction;
}

interface CheckoutPlanOption {
  deposit: number;
  id: string;
  label: string;
  lineItems: RentalPlanOption[];
  monthlyPrice: number;
  minPeriod: string;
  productLabel: string;
  termMonths: number;
}

const DEFAULT_RENTAL_PRODUCT_ID = 'hbot-st1700';
export const RENTAL_CHECKOUT_ACTION_STATUS_ID = 'rental-checkout-action-status';
const RENTAL_SUBMIT_STATUS_ID = 'rental-submit-status';
const RENTAL_SUBMIT_ERROR_ID = 'rental-submit-error';
const RENTAL_CHECKOUT_ACTION_STATUS_LABEL = 'Rental checkout action status';
const RENTAL_CHECKOUT_ACTION_READY_STATUS = 'Rental checkout actions are ready.';
const RENTAL_SUBMIT_STATUS_LABEL = 'Rental checkout submit status';

/**
 * The rental path's money rendering, routed through lib/money.ts.
 *
 * This used to be `` `EUR ${amount}` `` — a bare template string, so a monthly
 * plan of 1499 rendered as "EUR 1499": no thousands separator at all, on the one
 * screen where a renter commits to a recurring charge.
 *
 * The output is deliberately identical to `formatEuro` in
 * components/product/detail/TechDetailData.tsx (`Intl.NumberFormat('en-IE')`,
 * no decimals), which is how every other surface on the site already renders
 * euro — hence `locale: 'en-IE'` rather than the module's de-DE default for EUR,
 * which would have produced "1.499 EUR" and swapped one inconsistency for
 * another. It goes through formatMoney rather than importing that helper because
 * lib/money.ts is documented as the only sanctioned price renderer and its
 * `Money` type makes a currency-less amount unrepresentable.
 *
 * The currency stays EUR deliberately. `PRICE_BOOK_CURRENCY` is PLN and the
 * purchase path was migrated to it, but which currency a RENTAL is transacted in
 * is an owner decision this lane must not make silently — see the currency
 * contradiction in the launch-board audit. Only the number formatting changes.
 */
const formatPrice = (amount: number): string => priceBookText(amount);

const formatMissingRequirements = (requirements: string[]): string => {
  if (requirements.length === 0) {
    return '';
  }

  if (requirements.length === 1) {
    return requirements[0] ?? '';
  }

  return `${requirements.slice(0, -1).join(', ')} and ${
    requirements[requirements.length - 1]
  }`;
};

const trackRentalCheckoutAction = (
  action: string,
  properties: Record<string, unknown> = {}
): void => {
  analytics.capture('rental_checkout_route_action_clicked', {
    route: '/rental/checkout',
    action,
    ...properties,
  });
};

const shouldHandleClientRouteClick = (event: React.MouseEvent<HTMLAnchorElement>): boolean =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

const navigateToRentalOverview = (
  event: React.MouseEvent<HTMLAnchorElement>,
  onNavigate: NavigateFunction
): void => {
  if (!shouldHandleClientRouteClick(event)) {
    return;
  }

  event.preventDefault();
  onNavigate('rental');
};

const toTitleCase = (value: string): string =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const formatProductLabel = (productIds: string[]): string => {
  if (productIds.length === 0) {
    return 'Selected rental plan';
  }

  if (productIds.length === 1) {
    const firstProductId = productIds[0];
    return firstProductId
      ? productById[firstProductId]?.title ?? 'Selected rental plan'
      : 'Selected rental plan';
  }

  return `${productIds.length} selected devices`;
};

const getRequestedProductIds = (params: ReadonlyURLSearchParams): string[] => {
  const itemCandidates = (params.get('items') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const deviceCandidate = params.get('device')?.trim();
  const candidates = [
    ...itemCandidates,
    ...(deviceCandidate ? [deviceCandidate] : []),
  ];

  if (candidates.length === 0) {
    return [DEFAULT_RENTAL_PRODUCT_ID];
  }

  const resolved = candidates
    .map((candidate) => resolveRentalProductId(candidate))
    .filter((value): value is string => Boolean(value));

  if (resolved.length !== candidates.length) {
    return [];
  }

  return [...new Set(resolved)];
};

const buildCheckoutPlanOptions = (productIds: string[]): CheckoutPlanOption[] => {
  const planGroups = productIds
    .map((productId) => ({
      productId,
      plans: getRentalPlanOptions(productId),
    }))
    .filter((entry) => entry.plans.length > 0);

  if (planGroups.length === 0) {
    return [];
  }

  const commonTerms = planGroups.reduce<number[]>((terms, entry, index) => {
    const entryTerms = entry.plans.map((plan) => plan.termMonths);

    if (index === 0) {
      return entryTerms;
    }

    return terms.filter((term) => entryTerms.includes(term));
  }, []);

  return commonTerms
    .sort((left, right) => left - right)
    .map((termMonths) => {
      const lineItems = planGroups
        .map((entry) => entry.plans.find((plan) => plan.termMonths === termMonths))
        .filter((plan): plan is RentalPlanOption => Boolean(plan));
      const firstLineItem = lineItems[0];

      if (lineItems.length !== planGroups.length || !firstLineItem) {
        return null;
      }

      return {
        id:
          productIds.length === 1
            ? firstLineItem.id
            : `bundle-${productIds.join('-')}-${termMonths}`,
        label: `${termMonths} month${termMonths === 1 ? '' : 's'} plan`,
        monthlyPrice: lineItems.reduce((sum, plan) => sum + plan.monthlyPrice, 0),
        deposit: lineItems.reduce((sum, plan) => sum + plan.deposit, 0),
        minPeriod: firstLineItem.minPeriod,
        termMonths,
        lineItems,
        productLabel: formatProductLabel(productIds),
      } satisfies CheckoutPlanOption;
    })
    .filter((option): option is CheckoutPlanOption => Boolean(option));
};

const LegacyRentalCheckoutFallback: React.FC<{
  message?: string;
  onNavigate: NavigateFunction;
}> = ({
  message = 'We could not load rental checkout for this session. Please return to the rental hub or contact Hylono for guidance.',
  onNavigate,
}) => {
  const [fallbackActionStatus, setFallbackActionStatus] = useState(
    RENTAL_CHECKOUT_ACTION_READY_STATUS
  );

  return (
    <div className="min-h-screen bg-slate-50 px-6 pb-24 pt-32">
      <div className="mx-auto max-w-3xl rounded-lg border border-slate-100 bg-white p-8 text-center">
        <h1 className="mb-3 text-3xl font-black text-slate-900 futuristic-font">Rental checkout</h1>
        <p className="mb-6 text-slate-600">{message}</p>
        <p
          id={RENTAL_CHECKOUT_ACTION_STATUS_ID}
          aria-label={RENTAL_CHECKOUT_ACTION_STATUS_LABEL}
          aria-live="polite"
          aria-atomic="true"
          role="status"
          className="sr-only"
        >
          {fallbackActionStatus}
        </p>
        <Link
          href="/rental"
          aria-describedby={RENTAL_CHECKOUT_ACTION_STATUS_ID}
          onFocus={() => {
            setFallbackActionStatus('Back to rental plans link is ready.');
          }}
          onClick={(event) => {
            setFallbackActionStatus('Opening rental plans.');
            navigateToRentalOverview(event, onNavigate);
          }}
          className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white"
        >
          Back to rental plans
        </Link>
      </div>
    </div>
  );
};

const EnhancedRentalCheckout: React.FC<RentalCheckoutPageProps> = ({ onNavigate }) => {
  const reduced = useReducedMotion();
  const searchParams = useSearchParams();
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryCompany, setDeliveryCompany] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('Poland');
  const [acceptRentalTerms, setAcceptRentalTerms] = useState(false);
  const [acceptIntendedUse, setAcceptIntendedUse] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState(RENTAL_CHECKOUT_ACTION_READY_STATUS);

  const productIds = useMemo(() => getRequestedProductIds(searchParams), [searchParams]);
  const checkoutPlanOptions = useMemo(
    () => buildCheckoutPlanOptions(productIds),
    [productIds]
  );
  const defaultPlanId = checkoutPlanOptions[1]?.id ?? checkoutPlanOptions[0]?.id ?? '';
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);

  useEffect(() => {
    setSelectedPlanId((current) => {
      if (checkoutPlanOptions.some((plan) => plan.id === current)) {
        return current;
      }

      return defaultPlanId;
    });
  }, [checkoutPlanOptions, defaultPlanId]);

  const [rentalState, rentalFormAction, rentalPending] = useActionState<FormActionResult, FormData>(
    submitRentalFormAction,
    { success: false, message: '' }
  );

  const selectedPlan = useMemo(
    () => checkoutPlanOptions.find((plan) => plan.id === selectedPlanId) ?? checkoutPlanOptions[0] ?? null,
    [checkoutPlanOptions, selectedPlanId]
  );

  useEffect(() => {
    if (rentalState.success) {
      trackRentalCheckoutAction('rental_request_completed', {
        result: 'succeeded',
        item_count: selectedPlan?.lineItems.length ?? productIds.length,
        term_months: selectedPlan?.termMonths,
      });
      setSubmitted(true);
      setSubmitError(null);
      return;
    }

    if (rentalState.message) {
      trackRentalCheckoutAction('rental_request_completed', {
        result: 'failed',
        item_count: selectedPlan?.lineItems.length ?? productIds.length,
        term_months: selectedPlan?.termMonths,
      });
      setSubmitError(rentalState.message);
    }
  }, [productIds.length, rentalState, selectedPlan]);

  if (!selectedPlan) {
    return (
      <LegacyRentalCheckoutFallback
        onNavigate={onNavigate}
        message="We could not resolve a compatible rental plan for the selected device or bundle. Please return to the rental hub or contact Hylono for guidance."
      />
    );
  }

  const rentalItemsJson = JSON.stringify(
    selectedPlan.lineItems.map((plan) => ({
      techId: plan.productId,
      quantity: 1,
      monthlyPrice: plan.monthlyPrice,
    }))
  );

  const productTitle = selectedPlan.productLabel;
  const firstInvoiceEstimate = selectedPlan.monthlyPrice + selectedPlan.deposit;
  const selectedDeviceTokens = productIds.map((productId) => {
    const product = productById[productId];
    return product?.title ?? toTitleCase(productId);
  });

  const isDeliveryValid =
    deliveryName.trim().length > 1 &&
    deliveryEmail.includes('@') &&
    deliveryAddress.trim().length > 4 &&
    deliveryCity.trim().length > 1 &&
    deliveryPostalCode.trim().length > 2 &&
    deliveryCountry.trim().length > 1;

  const canSubmit = isDeliveryValid && acceptRentalTerms && acceptIntendedUse;
  const missingSubmitRequirements = [
    ...(deliveryName.trim().length > 1 ? [] : ['full name']),
    ...(deliveryEmail.includes('@') ? [] : ['valid email']),
    ...(deliveryAddress.trim().length > 4 ? [] : ['address']),
    ...(deliveryCity.trim().length > 1 ? [] : ['city']),
    ...(deliveryPostalCode.trim().length > 2 ? [] : ['postal code']),
    ...(deliveryCountry.trim().length > 1 ? [] : ['country']),
    ...(acceptRentalTerms ? [] : ['rental program terms']),
    ...(acceptIntendedUse ? [] : ['intended-use attestation']),
  ];
  const submitStatusMessage = rentalPending
    ? 'Submitting your rental request for review.'
    : missingSubmitRequirements.length > 0
      ? `To submit, add ${formatMissingRequirements(missingSubmitRequirements)}.`
      : 'All required details are complete. You can submit the rental request.';
  const announceRentalCheckoutAction = (message: string): void => {
    setActionStatus(message);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 pb-24 pt-32">
        <div className="mx-auto max-w-2xl rounded-lg border border-slate-100 bg-white p-8 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle size={30} />
          </div>
          <h1 className="mb-3 text-3xl font-black text-slate-900 futuristic-font">Rental request received</h1>
          <p className="mb-2 text-slate-600">
            We recorded your rental request for {productTitle} and will contact {deliveryEmail} with
            the next steps, payment options, and delivery timing.
          </p>
          <p className="mb-4 text-sm text-slate-500">
            Selected devices: {selectedDeviceTokens.join(', ')}.
          </p>
          {rentalState.rentalId && (
            <p className="mb-6 text-sm text-slate-500">Reference: {rentalState.rentalId}</p>
          )}
          <p
            id={RENTAL_CHECKOUT_ACTION_STATUS_ID}
            aria-label={RENTAL_CHECKOUT_ACTION_STATUS_LABEL}
            aria-live="polite"
            aria-atomic="true"
            role="status"
            className="sr-only"
          >
            {actionStatus}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/rental"
              aria-describedby={RENTAL_CHECKOUT_ACTION_STATUS_ID}
              onFocus={() => {
                announceRentalCheckoutAction('Return to rental overview link is ready.');
              }}
              onClick={(event) => {
                announceRentalCheckoutAction('Opening rental overview.');
                trackRentalCheckoutAction('success_overview_clicked', {
                  destination: '/rental',
                });
                navigateToRentalOverview(event, onNavigate);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white"
            >
              Return to rental overview
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/contact?intent=rental"
              aria-describedby={RENTAL_CHECKOUT_ACTION_STATUS_ID}
              onFocus={() => {
                announceRentalCheckoutAction('Talk to an advisor link is ready.');
              }}
              onClick={() => {
                announceRentalCheckoutAction('Opening rental advisor contact.');
                trackRentalCheckoutAction('success_guidance_clicked', {
                  destination: '/contact?intent=rental',
                });
              }}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Talk to an advisor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
        <RentalPlanSummaryCard
          selectedPlan={selectedPlan}
          checkoutPlanOptions={checkoutPlanOptions}
          selectedPlanId={selectedPlanId}
          onSelectPlan={setSelectedPlanId}
          formatPrice={formatPrice}
          firstInvoiceEstimate={firstInvoiceEstimate}
          actionStatusId={RENTAL_CHECKOUT_ACTION_STATUS_ID}
          announceAction={announceRentalCheckoutAction}
          trackAction={trackRentalCheckoutAction}
        />

        <motion.section
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-lg border border-slate-100 bg-white p-5 sm:p-6 md:p-8 lg:col-span-2 min-w-0"
        >
          <form action={rentalFormAction} className="space-y-8">
            <HoneypotField />
            <TurnstileWidget />
            <input type="hidden" name="itemsJson" value={rentalItemsJson} />
            <input type="hidden" name="termMonths" value={String(selectedPlan.termMonths)} />

            <fieldset>
              <legend className="mb-3 text-lg font-bold text-slate-900">Select rental plan</legend>
              <div className="space-y-2">
                {checkoutPlanOptions.map((plan) => (
                  <label
                    key={plan.id}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3.5 sm:px-4 sm:py-3 min-w-0 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="rental-plan"
                      value={plan.id}
                      aria-describedby={RENTAL_CHECKOUT_ACTION_STATUS_ID}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-600"
                      checked={selectedPlanId === plan.id}
                      onFocus={() => {
                        announceRentalCheckoutAction(`${plan.label} option is ready.`);
                      }}
                      onChange={() => {
                        announceRentalCheckoutAction(`${plan.label} selected.`);
                        trackRentalCheckoutAction('plan_selected', {
                          term_months: plan.termMonths,
                          item_count: plan.lineItems.length,
                        });
                        setSelectedPlanId(plan.id);
                      }}
                    />
                    <span className="text-sm text-slate-700 min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2 font-semibold text-slate-900">
                        <span>{plan.label}</span>
                        <span className="text-cyan-700 font-bold shrink-0">{priceBookMonthlyText(plan.monthlyPrice)}</span>
                      </span>
                      <span className="block text-xs text-slate-500 mt-1 break-words">
                        Deposit {formatPrice(plan.deposit)} · {plan.productLabel}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-lg font-bold text-slate-900">Delivery details</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rental-name" className="mb-2 block text-sm font-semibold text-slate-700">
                    Full name
                  </label>
                  <input
                    id="rental-name"
                    name="fullName"
                    aria-describedby={RENTAL_SUBMIT_STATUS_ID}
                    value={deliveryName}
                    onChange={(event) => setDeliveryName(event.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rental-email" className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    id="rental-email"
                    name="email"
                    type="email"
                    aria-describedby={RENTAL_SUBMIT_STATUS_ID}
                    value={deliveryEmail}
                    onChange={(event) => setDeliveryEmail(event.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rental-phone" className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>
                  <input
                    id="rental-phone"
                    name="phone"
                    value={deliveryPhone}
                    onChange={(event) => setDeliveryPhone(event.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label htmlFor="rental-company" className="mb-2 block text-sm font-semibold text-slate-700">
                    Company or clinic (optional)
                  </label>
                  <input
                    id="rental-company"
                    name="company"
                    value={deliveryCompany}
                    onChange={(event) => setDeliveryCompany(event.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="rental-address" className="mb-2 block text-sm font-semibold text-slate-700">
                  Address
                </label>
                <input
                  id="rental-address"
                  name="address"
                  aria-describedby={RENTAL_SUBMIT_STATUS_ID}
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  className="w-full min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
                  required
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label htmlFor="rental-city" className="mb-2 block text-sm font-semibold text-slate-700">
                    City
                  </label>
                  <input
                    id="rental-city"
                    name="city"
                    aria-describedby={RENTAL_SUBMIT_STATUS_ID}
                    value={deliveryCity}
                    onChange={(event) => setDeliveryCity(event.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rental-postal" className="mb-2 block text-sm font-semibold text-slate-700">
                    Postal code
                  </label>
                  <input
                    id="rental-postal"
                    name="postalCode"
                    aria-describedby={RENTAL_SUBMIT_STATUS_ID}
                    value={deliveryPostalCode}
                    onChange={(event) => setDeliveryPostalCode(event.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rental-country" className="mb-2 block text-sm font-semibold text-slate-700">
                    Country
                  </label>
                  <input
                    id="rental-country"
                    name="country"
                    aria-describedby={RENTAL_SUBMIT_STATUS_ID}
                    value={deliveryCountry}
                    onChange={(event) => setDeliveryCountry(event.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
                    required
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-lg font-bold text-slate-900">Rental terms</legend>
              <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4 min-w-0">
                <div className="mb-2 flex items-start gap-2 text-cyan-900">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-semibold">Program conditions</p>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-cyan-900 break-words">
                  {rentalCheckoutContent.terms.map((term) => (
                    <li key={term}>{term.replace('{selectedPlan.minPeriod}', selectedPlan.minPeriod)}</li>
                  ))}
                </ul>
              </div>
              <label
                htmlFor="rental-terms-accepted"
                className="mt-4 flex min-h-11 items-start gap-3 text-sm text-slate-700 min-w-0"
              >
                <input
                  id="rental-terms-accepted"
                  name="rentalTermsAccepted"
                  type="checkbox"
                  aria-describedby={`${RENTAL_CHECKOUT_ACTION_STATUS_ID} ${RENTAL_SUBMIT_STATUS_ID}`}
                  checked={acceptRentalTerms}
                  onFocus={() => {
                    announceRentalCheckoutAction('Rental program terms checkbox is ready.');
                  }}
                  onChange={(event) => {
                    announceRentalCheckoutAction(
                      event.target.checked
                        ? 'Rental program terms accepted.'
                        : 'Rental program terms cleared.'
                    );
                    setAcceptRentalTerms(event.target.checked);
                  }}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-600"
                  required
                />
                <span className="flex-1 min-w-0 break-words">
                  {rentalCheckoutContent.termsAcceptance}{' '}
                  <Link
                    href="/terms"
                    aria-describedby={RENTAL_CHECKOUT_ACTION_STATUS_ID}
                    className="inline-flex min-h-8 items-center rounded-md px-1 text-cyan-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                    target="_blank"
                    rel="noreferrer"
                    onFocus={() => {
                      announceRentalCheckoutAction('Full terms link is ready.');
                    }}
                    onClick={() => {
                      announceRentalCheckoutAction('Opening rental program terms.');
                      trackRentalCheckoutAction('policy_link_clicked', {
                        destination: '/terms',
                      });
                    }}
                  >
                    Full terms {'->'}
                  </Link>
                </span>
              </label>
            </fieldset>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 min-w-0 break-words">
              This form submits a rental request for manual review. We confirm payment method,
              deposit timing, and delivery details with you after the request is accepted.
            </div>

            <label
              htmlFor="rental-intended-use-attested"
              className="flex min-h-11 items-start gap-3 text-sm text-slate-700 min-w-0"
            >
              <input
                id="rental-intended-use-attested"
                name="rentalIntendedUseAttested"
                type="checkbox"
                aria-describedby={`${RENTAL_CHECKOUT_ACTION_STATUS_ID} ${RENTAL_SUBMIT_STATUS_ID}`}
                checked={acceptIntendedUse}
                onFocus={() => {
                  announceRentalCheckoutAction('Intended-use attestation checkbox is ready.');
                }}
                onChange={(event) => {
                  announceRentalCheckoutAction(
                    event.target.checked
                      ? 'Intended-use attestation accepted.'
                      : 'Intended-use attestation cleared.'
                  );
                  setAcceptIntendedUse(event.target.checked);
                }}
                className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-600"
                required
              />
              <span className="flex-1 min-w-0 break-words">{rentalCheckoutContent.intendedUse}</span>
            </label>

            {submitError && (
              <p
                id={RENTAL_SUBMIT_ERROR_ID}
                role="alert"
                className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {submitError}
              </p>
            )}

            <p
              id={RENTAL_CHECKOUT_ACTION_STATUS_ID}
              aria-label={RENTAL_CHECKOUT_ACTION_STATUS_LABEL}
              aria-live="polite"
              aria-atomic="true"
              role="status"
              className="sr-only"
            >
              {actionStatus}
            </p>

            <p
              id={RENTAL_SUBMIT_STATUS_ID}
              aria-label={RENTAL_SUBMIT_STATUS_LABEL}
              aria-live="polite"
              aria-atomic="true"
              role="status"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              {submitStatusMessage}
            </p>

            <button
              type="submit"
              disabled={rentalPending}
              aria-disabled={!canSubmit || rentalPending}
              aria-describedby={
                submitError
                  ? `${RENTAL_SUBMIT_STATUS_ID} ${RENTAL_SUBMIT_ERROR_ID}`
                  : RENTAL_SUBMIT_STATUS_ID
              }
              onClick={(event) => {
                if (!canSubmit || rentalPending) {
                  event.preventDefault();
                  return;
                }

                trackRentalCheckoutAction('rental_request_submitted', {
                  item_count: selectedPlan.lineItems.length,
                  term_months: selectedPlan.termMonths,
                  rental_terms_accepted: acceptRentalTerms,
                  intended_use_attested: acceptIntendedUse,
                });
              }}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {rentalPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {rentalCheckoutContent.paymentButtonPrefix}
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export const RentalCheckoutPage: React.FC<RentalCheckoutPageProps> = ({ onNavigate }) => {
  return (
    <FeatureGate
      flag="feature_rental_checkout"
      fallback={<LegacyRentalCheckoutFallback onNavigate={onNavigate} />}
    >
      <EnhancedRentalCheckout onNavigate={onNavigate} />
    </FeatureGate>
  );
};

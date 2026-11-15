import analytics from '../../src/lib/analytics';
import { checkoutContent } from '../../content/checkout';

export type Step = 'shipping' | 'payment' | 'confirm';
export type PaymentMethod = 'card' | 'bank_transfer' | 'financing';
export type ShippingFieldKey =
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'address'
    | 'city'
    | 'postalCode';

export interface CheckoutItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export const focusRingClass =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900';

export const CHECKOUT_SUBMIT_HELP_ID = 'checkout-submit-help';
export const CHECKOUT_SUBMIT_ERROR_ID = 'checkout-submit-error';
export const CHECKOUT_SUBMIT_STATUS_ID = 'checkout-submit-status';
export const CHECKOUT_SUBMIT_STATUS_LABEL = 'Checkout submit status';
export const CHECKOUT_SHIPPING_FIELD_HELP_ID = 'checkout-shipping-field-help';
export const CHECKOUT_SHIPPING_FIELD_STATUS_ID = 'checkout-shipping-field-status';
export const CHECKOUT_SHIPPING_FIELD_STATUS_LABEL = 'Checkout shipping field status';
export const CHECKOUT_SHIPPING_FIELD_READY_STATUS =
    'Shipping field guidance is ready. Complete the required shipping fields before continuing to payment.';
export const CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_ID = 'checkout-empty-route-action-status';
export const CHECKOUT_EMPTY_ROUTE_ACTION_STATUS_LABEL = 'Checkout empty route action status';
export const CHECKOUT_EMPTY_ROUTE_ACTION_READY_STATUS =
    'Checkout recovery links are ready. Continue shopping, review rental options, or open help before checkout.';
export const CHECKOUT_POLICY_ROUTE_ACTION_STATUS_ID = 'checkout-policy-route-action-status';
export const CHECKOUT_POLICY_ROUTE_ACTION_STATUS_LABEL = 'Checkout policy route action status';
export const CHECKOUT_POLICY_ROUTE_ACTION_READY_STATUS =
    'Checkout policy links are ready. Review shipping, returns, warranty, or terms before placing an order.';
export const CHECKOUT_STEP_ACTION_STATUS_ID = 'checkout-step-action-status';
export const CHECKOUT_STEP_ACTION_STATUS_LABEL = 'Checkout step action status';
export const CHECKOUT_STEP_ACTION_READY_STATUS =
    'Checkout step controls are ready. Continue to payment, choose a payment route, review the order, or go back before placing it.';
export const CHECKOUT_SUPPORT_ACTION_STATUS_ID = 'checkout-support-action-status';
export const CHECKOUT_SUPPORT_ACTION_STATUS_LABEL = 'Checkout support action status';
export const CHECKOUT_SUPPORT_ACTION_READY_STATUS =
    'Checkout support actions are ready. Email support before placing an order.';
export const CHECKOUT_SUCCESS_ACTION_STATUS_ID = 'checkout-success-action-status';
export const CHECKOUT_SUCCESS_ACTION_STATUS_LABEL = 'Checkout success action status';
export const CHECKOUT_SUCCESS_ACTION_READY_STATUS =
    'Checkout success actions are ready. Go to account after the order request is recorded.';

export const getCheckoutEmptyRouteActionStatus = (destination: string) => {
    switch (destination) {
        case '/store':
            return 'Opening store from empty checkout recovery.';
        case '/rental':
            return 'Opening rental options from empty checkout recovery.';
        case '/help':
            return 'Opening help from empty checkout recovery.';
        default:
            return 'Opening checkout recovery destination.';
    }
};

export const getCheckoutPolicyRouteActionStatus = (destination: string) => {
    switch (destination) {
        case '/shipping':
            return 'Opening shipping policy from checkout.';
        case '/returns':
            return 'Opening returns policy from checkout.';
        case '/warranty':
            return 'Opening warranty policy from checkout.';
        case '/terms':
            return 'Opening terms from checkout.';
        default:
            return 'Opening checkout policy link.';
    }
};

export const getCheckoutPaymentMethodLabel = (paymentMethod: PaymentMethod) => {
    switch (paymentMethod) {
        case 'bank_transfer':
            return 'bank transfer';
        case 'financing':
            return 'financing';
        case 'card':
            return 'card';
        default:
            return 'payment route';
    }
};

export const getCheckoutStepActionStatus = (
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
    switch (action) {
        case 'shipping_continue_clicked':
            return 'Opening payment step from checkout shipping.';
        case 'payment_method_selected':
            return `Payment method set to ${getCheckoutPaymentMethodLabel(details.paymentMethod ?? 'bank_transfer')}.`;
        case 'review_order_clicked':
            return 'Opening review step from checkout payment.';
        case 'step_back_clicked':
            if (details.toStep === 'shipping') {
                return 'Returning to shipping step from checkout payment.';
            }
            return 'Returning to payment step from checkout review.';
        default:
            return CHECKOUT_STEP_ACTION_READY_STATUS;
    }
};

export const checkoutShippingFieldLabels: Record<ShippingFieldKey, string> = {
    firstName: checkoutContent.shipping.firstName,
    lastName: checkoutContent.shipping.lastName,
    email: checkoutContent.shipping.email,
    phone: checkoutContent.shipping.phone,
    address: checkoutContent.shipping.streetAddress,
    city: checkoutContent.shipping.city,
    postalCode: checkoutContent.shipping.postalCode,
};

export const getCheckoutShippingFieldStatus = (field: ShippingFieldKey, value: string) => {
    const label = checkoutShippingFieldLabels[field];
    const trimmedValue = value.trim();

    if (field === 'phone' && trimmedValue.length === 0) {
        return `${label} is optional for checkout shipping.`;
    }

    if (trimmedValue.length > 0) {
        return `${label} captured for checkout shipping.`;
    }

    return `${label} is required before payment.`;
};

export const getCheckoutSupportActionStatus = () => 'Opening checkout support email.';

export const getCheckoutSuccessActionStatus = () => 'Opening account after checkout success.';

export const trackCheckoutAction = (
    action: string,
    properties: Record<string, string | number | boolean> = {},
) => {
    analytics.capture('checkout_route_action_clicked', {
        route: '/checkout',
        action,
        ...properties,
    });
};

export const trackCartView = (
    properties: Record<string, string | number | boolean> = {},
) => {
    analytics.capture('cart_view', {
        route: '/checkout',
        cart_surface: 'checkout',
        ...properties,
    });
};

export const trackCheckoutStepView = (
    step: Step,
    properties: Record<string, string | number | boolean> = {},
) => {
    analytics.capture('checkout_step_view', {
        route: '/checkout',
        step,
        ...properties,
    });
};

export const trackCheckoutComplete = (
    properties: Record<string, string | number | boolean> = {},
) => {
    analytics.capture('checkout_complete', {
        route: '/checkout',
        ...properties,
    });
};

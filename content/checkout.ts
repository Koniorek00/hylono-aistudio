export const checkoutContent = {
  meta: {
    title: 'Checkout',
    intro:
      'Review shipping details, choose an available payment method, and submit the order request for Hylono follow-up.',
    emptyCartTitle: 'Your cart is empty',
    emptyCartMessage:
      'Add a product before checkout, or use support if you need help choosing a product or rental option.',
    continueShopping: 'Continue shopping',
    browseRental: 'Review rental options',
    openHelp: 'Open help',
    emptyCartSupportTitle: 'Need help choosing?',
  },
  steps: {
    shipping: 'Shipping',
    payment: 'Payment',
    confirm: 'Confirm',
  },
  shipping: {
    title: 'Shipping details',
    description:
      'Enter the delivery contact details needed to process the order request.',
    requiredNotice: 'Required fields are marked in the field label.',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone (optional)',
    streetAddress: 'Street address',
    city: 'City',
    postalCode: 'Postal code',
    continueToPayment: 'Continue to payment',
    continueHelp: 'Complete the required shipping fields before continuing to payment.',
  },
  payment: {
    title: 'Payment method',
    description: 'Choose the available payment method for this order request.',
    cardTitle: 'Card payment',
    cardDescription: 'Temporarily unavailable in this checkout.',
    bankTransferTitle: 'Bank transfer',
    bankTransferDescription: 'Direct bank transfer (EU)',
    financingTitle: 'Financing (36 months)',
    financingFromPrefix: 'From',
    financingPerMonthSuffix: 'PLN/month',
    back: 'Back',
    reviewOrder: 'Review order',
  },
  confirmation: {
    title: 'Review and submit',
    description:
      'Check the delivery details, selected payment method, and order summary before submitting.',
    shippingTo: 'Shipping to',
    paymentRoute: 'Payment method',
    placeOrder: 'Place order',
    processing: 'Processing...',
    submitHelp:
      'Submitting creates an order request. Use support if the selected payment method needs manual handling.',
    submitErrorFallback:
      'Checkout could not be submitted. Please review the details or contact support.',
    disabledAttestation: 'Confirm intended use before placing your order.',
  },
  success: {
    title: 'Order request received',
    messagePrefix: 'Thank you. Your order request is recorded for',
    orderPrefix: 'Order',
    cta: 'Go to account',
  },
  errors: {
    attestRequired: 'Please confirm intended use before placing your order.',
    orderFailed: 'Order failed. Please try again.',
    network: 'Network error. Please check your connection and try again.',
  },
  summary: {
    title: 'Order summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    shippingFree: 'Calculated during review',
    total: 'Total',
  },
  support: {
    title: 'Checkout support',
    description:
      'Use support or the public policy pages before submitting if any delivery, return, warranty, or payment detail is unclear.',
    emailLabel: 'Support email',
    hoursLabel: 'Support hours',
    policyTitle: 'Review before placing an order',
    help: 'Help',
    shipping: 'Shipping',
    returns: 'Returns',
    warranty: 'Warranty',
  },
  policyLinks: [
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Warranty', href: '/warranty' },
    { label: 'Terms', href: '/terms' },
  ],
  intendedUseAttestation:
    "I confirm that I have reviewed the product's intended use and proper usage information.",
  trustSignals: [
    'Order request is validated server-side',
    'Policy pages remain available before submission',
    'Support is available for unclear checkout details',
  ],
} as const;

import { MDR_COMPLIANCE_STATEMENT } from './disclaimers';

export const rentalCheckoutContent = {
  title: 'Rental request summary',
  terms: [
    'Minimum period: {selectedPlan.minPeriod}',
    'Service and support: included',
    'Payment method and delivery timing are confirmed after operator review',
    'Return, extension, and buy-later options depend on the selected agreement',
  ],
  termsAcceptance: 'I accept the rental program terms.',
  intendedUse:
    "I confirm that I have reviewed the product's intended use and proper usage information.",
  paymentButtonPrefix: 'Submit rental request',
  depositNote:
    'Deposit and first invoice are confirmed after operator review. Refund timing depends on post-rental inspection and the applicable agreement.',
} as const;

/**
 * The EU MDR Article 7 support-only boundary and the privacy gate shared by the
 * purchase and rental intake paths.
 *
 * This lives beside the rental checkout copy because both are the same regulatory
 * sentence set, and because `content/checkout.ts` is owned by another lane. It should
 * move next to the rest of the checkout copy once that file is free to edit.
 *
 * These are legal gates, not trust signals: `components/CheckoutPage.tsx` must not
 * gate them behind `feature_checkout_trust`, because a gate that a flag can switch
 * off is not a gate.
 *
 * `supportOnlyHelp` is `MDR_COMPLIANCE_STATEMENT` from `content/disclaimers.ts`,
 * reused rather than restated so the tick box and the site's own compliance
 * statement cannot drift apart.
 */
export const regulatoryGateContent = {
  intendedUseHelp:
    'Intended use and contraindications are published on the product page and in the product documents.',
  supportOnlyLabel:
    'I understand this is a wellness device for general wellbeing, and that it does not replace advice from a qualified healthcare professional.',
  supportOnlyHelp: MDR_COMPLIANCE_STATEMENT,
  privacyLabel:
    'I agree that Hylono may process the personal and delivery data on this form to answer my request.',
  privacyHelp:
    'This form collects the contact and delivery details needed to answer your request. They are used to answer that request and the linked order, and are described in the privacy notice.',
  errors: {
    intendedUseRequired: 'Please confirm intended use before placing your order.',
    supportOnlyRequired:
      'Please confirm that this is a wellness device, not medical care, before placing your order.',
    privacyRequired: 'Please acknowledge the privacy notice before placing your order.',
  },
} as const;

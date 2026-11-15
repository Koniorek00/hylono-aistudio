export const CUSTOMER_CONNECTION_FLOW_IDS = [
  'contact_request',
  'booking_request',
  'newsletter_subscription',
  'checkout_order_request',
  'rental_request',
] as const;

export type CustomerConnectionFlowId = (typeof CUSTOMER_CONNECTION_FLOW_IDS)[number];

export type CustomerConnectionStage =
  | 'assisted_contact'
  | 'booking_intake'
  | 'audience_subscription'
  | 'commerce_intake'
  | 'rental_intake';

export type CustomerConnectionOwner =
  | 'support_sales'
  | 'growth'
  | 'commerce_ops'
  | 'rental_ops';

export type CustomerConnectionIntegration = 'n8n' | 'twenty' | 'novu' | 'resend' | 'stripe';

export type CustomerConnectionProofStatus =
  | 'source_present'
  | 'external_readback_required'
  | 'not_applicable';

export type CustomerConnectionReadBackStatus =
  | 'observed'
  | 'failed'
  | 'pending_owner_review'
  | 'rejected';

export type CustomerConnectionEnvironment = 'local' | 'preview' | 'staging' | 'production';

export type CustomerConnectionPrivacyLegalBasisStatus =
  | 'owner_reviewed'
  | 'privacy_review_required'
  | 'legal_basis_confirmed'
  | 'not_applicable';

export const CUSTOMER_CONNECTION_FORBIDDEN_BROWSER_FIELDS = [
  'name',
  'email',
  'phone',
  'address',
  'city',
  'postalCode',
  'company',
  'message',
  'notes',
  'free_text',
  'orderId',
  'rentalId',
  'ticketId',
  'bookingRef',
  'crm_record_id',
  'stripePaymentIntentId',
  'amount',
  'price',
  'deposit',
  'medical_condition',
  'diagnosis',
  'symptoms',
  'outcome',
  'competitor_name',
] as const;

export interface CustomerConnectionIntegrationGate {
  integration: CustomerConnectionIntegration;
  localSourceStatus: CustomerConnectionProofStatus;
  requiredReadBack: string;
}

export interface CustomerConnectionReadBackRowContract {
  flowId: CustomerConnectionFlowId;
  integration: CustomerConnectionIntegration;
  correlationId: string;
  eventId: string | null;
  providerRecordId: string | null;
  executionId: string | null;
  environment: CustomerConnectionEnvironment;
  observedAt: string;
  readBackStatus: CustomerConnectionReadBackStatus;
  evidenceRef: string;
  ownerTeam: CustomerConnectionOwner;
  privacyLegalBasisStatus: CustomerConnectionPrivacyLegalBasisStatus;
}

export interface CustomerConnectionFlow {
  id: CustomerConnectionFlowId;
  stage: CustomerConnectionStage;
  ownerTeam: CustomerConnectionOwner;
  publicEntryRoute: string;
  apiEndpoint: string;
  sourceFile: string;
  persistenceTable: string;
  localRequestStatus: 'source_present';
  localRequestMeaning: string;
  n8nEventType: string;
  crmSource: string;
  successReferenceField: string;
  integrations: readonly CustomerConnectionIntegrationGate[];
  externalOutcomeStatus: 'external_readback_required';
  externalOutcomesBlockedUntil: readonly string[];
  browserAnalyticsAllowedPayload: readonly string[];
  browserAnalyticsForbiddenPayload: readonly (typeof CUSTOMER_CONNECTION_FORBIDDEN_BROWSER_FIELDS)[number][];
  publicClaimBoundary: string;
}

const browserRoutePayload = ['route', 'source', 'cta_role', 'destination'] as const;
const browserContactPayload = ['route', 'source', 'locale', 'topic', 'inquiry_type', 'has_prefill'] as const;
const browserCheckoutPayload = ['route', 'checkout_step', 'payment_method', 'source'] as const;
const browserRentalPayload = [
  'route',
  'action',
  'source',
  'destination',
  'term_months',
  'product_count',
  'accepts_terms',
  'accepts_intended_use',
] as const;

const externalReadBacks = {
  n8n: 'n8n execution id or signed webhook read-back for the exact event id',
  twenty: 'Twenty person/task/opportunity read-back with durable ids',
  novu: 'Novu subscriber/workflow trigger read-back with durable ids',
  resend: 'Resend email or audience contact read-back when that channel is configured',
  stripe: 'Stripe PaymentIntent plus webhook reconciliation read-back for card checkout',
} as const;

const baseIntegrations = (
  include: readonly CustomerConnectionIntegration[]
): readonly CustomerConnectionIntegrationGate[] =>
  include.map((integration) => ({
    integration,
    localSourceStatus: integration === 'stripe' ? 'external_readback_required' : 'source_present',
    requiredReadBack: externalReadBacks[integration],
  }));

export const customerConnectionOperatingSpine: readonly CustomerConnectionFlow[] = [
  {
    id: 'contact_request',
    stage: 'assisted_contact',
    ownerTeam: 'support_sales',
    publicEntryRoute: '/contact',
    apiEndpoint: '/api/contact',
    sourceFile: 'app/api/contact/route.ts',
    persistenceTable: 'contact_inquiries',
    localRequestStatus: 'source_present',
    localRequestMeaning: 'A validated contact request can be persisted and return a ticket reference.',
    n8nEventType: 'contact.created',
    crmSource: 'contact:<inquiryType>',
    successReferenceField: 'ticketId',
    integrations: baseIntegrations(['n8n', 'twenty', 'novu', 'resend']),
    externalOutcomeStatus: 'external_readback_required',
    externalOutcomesBlockedUntil: [
      'DATABASE_URL-backed write observed in target environment',
      'n8n contact.created execution read-back',
      'Twenty contact follow-up task read-back',
      'Novu subscriber/workflow read-back',
      'Resend delivery read-back if outbound notification is enabled',
    ],
    browserAnalyticsAllowedPayload: browserContactPayload,
    browserAnalyticsForbiddenPayload: CUSTOMER_CONNECTION_FORBIDDEN_BROWSER_FIELDS,
    publicClaimBoundary:
      'May claim request intake exists only after local/API proof; may not claim qualified lead, staffed response, or SLA without external read-back.',
  },
  {
    id: 'booking_request',
    stage: 'booking_intake',
    ownerTeam: 'support_sales',
    publicEntryRoute: '/consultation',
    apiEndpoint: '/api/booking',
    sourceFile: 'app/api/booking/route.ts',
    persistenceTable: 'booking_requests',
    localRequestStatus: 'source_present',
    localRequestMeaning: 'A validated booking/demo request can be persisted and return a booking reference.',
    n8nEventType: 'booking.requested',
    crmSource: 'booking:<bookingType>',
    successReferenceField: 'bookingRef',
    integrations: baseIntegrations(['n8n', 'twenty', 'novu', 'resend']),
    externalOutcomeStatus: 'external_readback_required',
    externalOutcomesBlockedUntil: [
      'DATABASE_URL-backed write observed in target environment',
      'n8n booking.requested execution read-back',
      'Twenty booking follow-up task read-back',
      'Novu subscriber/workflow read-back',
      'Resend delivery read-back if outbound notification is enabled',
    ],
    browserAnalyticsAllowedPayload: browserRoutePayload,
    browserAnalyticsForbiddenPayload: CUSTOMER_CONNECTION_FORBIDDEN_BROWSER_FIELDS,
    publicClaimBoundary:
      'May claim request capture exists only after local/API proof; may not claim confirmed appointment, demo slot, or response time without owner/operator read-back.',
  },
  {
    id: 'newsletter_subscription',
    stage: 'audience_subscription',
    ownerTeam: 'growth',
    publicEntryRoute: 'footer/newsletter surfaces',
    apiEndpoint: '/api/newsletter',
    sourceFile: 'app/api/newsletter/route.ts',
    persistenceTable: 'newsletter_subscriptions',
    localRequestStatus: 'source_present',
    localRequestMeaning: 'A validated newsletter subscription can be persisted and optionally synced to provider/audience tooling.',
    n8nEventType: 'newsletter.subscribed',
    crmSource: 'newsletter:<source>',
    successReferenceField: 'email',
    integrations: baseIntegrations(['n8n', 'twenty', 'novu', 'resend']),
    externalOutcomeStatus: 'external_readback_required',
    externalOutcomesBlockedUntil: [
      'DATABASE_URL-backed write observed in target environment',
      'n8n newsletter.subscribed execution read-back',
      'Twenty person sync read-back',
      'Novu subscriber/workflow read-back',
      'Resend audience contact read-back if audience sync is enabled',
    ],
    browserAnalyticsAllowedPayload: ['source', 'route', 'placement'],
    browserAnalyticsForbiddenPayload: CUSTOMER_CONNECTION_FORBIDDEN_BROWSER_FIELDS,
    publicClaimBoundary:
      'May claim subscription request handling exists only after local/API proof; may not claim audience delivery, campaign send, or subscriber growth without provider read-back.',
  },
  {
    id: 'checkout_order_request',
    stage: 'commerce_intake',
    ownerTeam: 'commerce_ops',
    publicEntryRoute: '/checkout',
    apiEndpoint: '/api/checkout',
    sourceFile: 'app/api/checkout/route.ts',
    persistenceTable: 'checkout_orders',
    localRequestStatus: 'source_present',
    localRequestMeaning:
      'A validated checkout request can be persisted with server-trusted pricing and a pending/offline/card-configuration status.',
    n8nEventType: 'order.created',
    crmSource: 'checkout:<paymentMethod>',
    successReferenceField: 'orderId',
    integrations: baseIntegrations(['n8n', 'twenty', 'novu', 'stripe']),
    externalOutcomeStatus: 'external_readback_required',
    externalOutcomesBlockedUntil: [
      'DATABASE_URL-backed write observed in target environment',
      'n8n order.created execution read-back',
      'Twenty checkout follow-up task/opportunity read-back',
      'Novu subscriber/workflow read-back',
      'Stripe PaymentIntent and webhook reconciliation if card checkout is enabled',
    ],
    browserAnalyticsAllowedPayload: browserCheckoutPayload,
    browserAnalyticsForbiddenPayload: CUSTOMER_CONNECTION_FORBIDDEN_BROWSER_FIELDS,
    publicClaimBoundary:
      'May claim order request handling exists only after local/API proof; may not claim paid order, financing approval, payment success, delivery, or fulfillment without reconciliation read-back.',
  },
  {
    id: 'rental_request',
    stage: 'rental_intake',
    ownerTeam: 'rental_ops',
    publicEntryRoute: '/rental/checkout',
    apiEndpoint: '/api/rental',
    sourceFile: 'app/api/rental/route.ts',
    persistenceTable: 'rental_applications',
    localRequestStatus: 'source_present',
    localRequestMeaning: 'A validated rental application can be persisted with pending status and a rental reference.',
    n8nEventType: 'rental.requested',
    crmSource: 'rental:pending',
    successReferenceField: 'rental.id',
    integrations: baseIntegrations(['n8n', 'twenty', 'novu']),
    externalOutcomeStatus: 'external_readback_required',
    externalOutcomesBlockedUntil: [
      'DATABASE_URL-backed write observed in target environment',
      'n8n rental.requested execution read-back',
      'Twenty rental follow-up task/opportunity read-back',
      'Novu subscriber/workflow read-back',
      'operator review state read-back for approved/rejected/deposit/delivery/activated outcomes',
    ],
    browserAnalyticsAllowedPayload: browserRentalPayload,
    browserAnalyticsForbiddenPayload: CUSTOMER_CONNECTION_FORBIDDEN_BROWSER_FIELDS,
    publicClaimBoundary:
      'May claim pending rental request intake exists only after local/API proof; may not claim approval, deposit requested, delivery scheduled, activated rental, staffed queue, or SLA without operations/CRM read-back.',
  },
];

export const customerConnectionExternalOutcomeNames = [
  'lead.qualified',
  'lead.disqualified',
  'booking.confirmed',
  'subscriber.delivery_confirmed',
  'order.payment_succeeded',
  'order.fulfilled',
  'rental.review_started',
  'rental.approved',
  'rental.rejected',
  'deposit.requested',
  'delivery.scheduled',
  'rental.activated',
] as const;

export const getCustomerConnectionOperatingSpineSummary = () => {
  const integrationCounts = customerConnectionOperatingSpine.reduce(
    (counts, flow) => {
      for (const gate of flow.integrations) {
        counts[gate.integration] = (counts[gate.integration] ?? 0) + 1;
      }

      return counts;
    },
    {} as Record<CustomerConnectionIntegration, number>
  );

  return {
    totalFlows: customerConnectionOperatingSpine.length,
    sourcePresentFlows: customerConnectionOperatingSpine.filter(
      (flow) => flow.localRequestStatus === 'source_present'
    ).length,
    externalReadbackRequiredFlows: customerConnectionOperatingSpine.filter(
      (flow) => flow.externalOutcomeStatus === 'external_readback_required'
    ).length,
    externalOutcomeNames: customerConnectionExternalOutcomeNames.length,
    integrationCounts,
  };
};

export const RENTAL_FUNNEL_WEB_EVENTS = [
  'landing_acquisition_detected',
  'page_view',
  'hero_cta_click',
  'product_route_cta_clicked',
  'product_detail_action_clicked',
  'rental_route_transition_clicked',
  'rental_hub_contact_clicked',
  'rental_hub_filter_changed',
  'rental_hub_planner_clicked',
  'rental_hub_primary_cta_clicked',
  'rental_hub_product_link_clicked',
  'rental_hub_program_fact_clicked',
  'rental_hub_request_started',
  'rental_hub_resource_clicked',
  'rental_checkout_route_action_clicked',
  'contact_callback_modal_opened',
  'contact_callback_slot_selected',
  'contact_form_start',
  'contact_form_submission_failed',
  'contact_form_submit_attempt',
  'contact_form_submission_succeeded',
  'contact_post_submit_handoff_clicked',
  'contact_route_cta_clicked',
  'contact_support_route_clicked',
  'support_contact_click',
] as const;

export const RENTAL_FUNNEL_EXTERNAL_OUTCOMES = [
  'lead.qualified',
  'lead.disqualified',
  'rental.review_started',
  'rental.approved',
  'rental.rejected',
  'deposit.requested',
  'delivery.scheduled',
  'rental.activated',
] as const;

export const RENTAL_FUNNEL_FORBIDDEN_PAYLOAD_FIELDS = [
  'name',
  'fullName',
  'full_name',
  'first_name',
  'firstName',
  'last_name',
  'lastName',
  'email',
  'phone',
  'address',
  'city',
  'postalCode',
  'postal_code',
  'company',
  'clinicName',
  'clinic_name',
  'serialNumber',
  'serial_number',
  'ticketId',
  'ticket_id',
  'rentalId',
  'rental_id',
  'orderId',
  'order_id',
  'userId',
  'user_id',
  'submissionHash',
  'submission_hash',
  'distinctId',
  'distinct_id',
  'message',
  'notes',
  'subject',
  'free_text',
  'price',
  'monthlyPrice',
  'monthly_price',
  'totalMonthly',
  'total_monthly',
  'deposit',
  'amount',
  'value',
  'currency',
  'medical_goal',
  'medicalGoal',
  'medical_condition',
  'medicalCondition',
  'diagnosis',
  'symptoms',
  'condition',
  'contraindication',
  'pregnancy',
  'medication',
  'pacemaker',
  'implant',
  'biometric',
  'outcome',
  'medical_outcome',
  'medicalOutcome',
  'competitor_name',
  'competitorName',
] as const;

export type RentalFunnelWebEventName = (typeof RENTAL_FUNNEL_WEB_EVENTS)[number];
export type RentalFunnelExternalOutcomeName = (typeof RENTAL_FUNNEL_EXTERNAL_OUTCOMES)[number];

export type RentalFunnelStage =
  | 'acquisition_entry'
  | 'decision_routing'
  | 'rental_hub_intent'
  | 'rental_checkout_request'
  | 'manual_review'
  | 'contact_support_recovery'
  | 'crm_sales_follow_up';

export type RentalFunnelOwnerTeam =
  | 'analytics_cro'
  | 'growth'
  | 'product_engineering'
  | 'rental_ops'
  | 'support_sales';

export type RentalFunnelConsentClass =
  | 'analytics_consent_required'
  | 'operational_follow_up_required'
  | 'external_crm_required';

export type RentalFunnelProofStatus = 'source_present' | 'external_required';

interface RentalFunnelEventBase {
  eventName: RentalFunnelWebEventName | RentalFunnelExternalOutcomeName;
  stage: RentalFunnelStage;
  ownerTeam: RentalFunnelOwnerTeam;
  sourceRoute: string;
  sourceFile: string | null;
  consentClass: RentalFunnelConsentClass;
  allowedPayload: readonly string[];
  forbiddenPayload: readonly (typeof RENTAL_FUNNEL_FORBIDDEN_PAYLOAD_FIELDS)[number][];
  crmOutcomeLink: string | null;
  proofStatus: RentalFunnelProofStatus;
}

export interface RentalFunnelWebEvent extends RentalFunnelEventBase {
  eventName: RentalFunnelWebEventName;
  sourceFile: string;
  consentClass: 'analytics_consent_required';
  proofStatus: 'source_present';
}

export interface RentalFunnelExternalOutcome extends RentalFunnelEventBase {
  eventName: RentalFunnelExternalOutcomeName;
  sourceFile: null;
  consentClass: 'external_crm_required' | 'operational_follow_up_required';
  proofStatus: 'external_required';
}

const routePayload = ['route', 'destination', 'cta_role', 'source'] as const;
const productPayload = ['product_slug', 'tech_id', 'destination_path', 'source', 'cta_role'] as const;
const rentalHubLinkPayload = ['destination', 'selected_product', 'source'] as const;
const rentalHubProductPayload = ['destination', 'product_id', 'source'] as const;
const rentalHubFilterPayload = ['budget', 'filter', 'technology', 'value'] as const;
const rentalRequestPayload = [
  'route',
  'action',
  'source',
  'destination',
  'term_months',
  'product_count',
  'accepts_terms',
  'accepts_intended_use',
] as const;
const contactPayload = ['route', 'source', 'locale', 'topic', 'inquiry_type', 'has_prefill'] as const;
const contactCallbackPayload = [
  'inquiry_type',
  'selected_date',
  'selected_slot',
  'source',
  'submitted',
] as const;
const contactSubmissionStatusPayload = [
  'error_type',
  'field_error_count',
  'has_callback_slot',
  'has_ticket_id',
  'inquiry_type',
  'status_code',
] as const;

const forbiddenPayload = RENTAL_FUNNEL_FORBIDDEN_PAYLOAD_FIELDS;

export const rentalFunnelEventMap: readonly (
  | RentalFunnelWebEvent
  | RentalFunnelExternalOutcome
)[] = [
  {
    eventName: 'landing_acquisition_detected',
    stage: 'acquisition_entry',
    ownerTeam: 'growth',
    sourceRoute: 'global',
    sourceFile: 'src/lib/acquisition.ts',
    consentClass: 'analytics_consent_required',
    allowedPayload: [
      'channel',
      'source',
      'medium',
      'referrerHost',
      'landingPath',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'isAiAssistant',
      'isSearch',
    ],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'source_present',
  },
  {
    eventName: 'page_view',
    stage: 'acquisition_entry',
    ownerTeam: 'analytics_cro',
    sourceRoute: 'global',
    sourceFile: 'src/components/layout/SiteChrome.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: ['route', 'route_scope'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'source_present',
  },
  {
    eventName: 'hero_cta_click',
    stage: 'decision_routing',
    ownerTeam: 'growth',
    sourceRoute: '/',
    sourceFile: 'app/HomeClient.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: routePayload,
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'source_present',
  },
  {
    eventName: 'product_route_cta_clicked',
    stage: 'decision_routing',
    ownerTeam: 'product_engineering',
    sourceRoute: '/product/[tech]',
    sourceFile: 'app/product/[tech]/ProductTrackedLink.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: productPayload,
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'source_present',
  },
  {
    eventName: 'product_detail_action_clicked',
    stage: 'decision_routing',
    ownerTeam: 'product_engineering',
    sourceRoute: 'product detail surfaces',
    sourceFile: 'src/lib/product-detail-analytics.ts',
    consentClass: 'analytics_consent_required',
    allowedPayload: [
      'action',
      'active_track',
      'canonical_product_slug',
      'chamber_slug',
      'compare_count',
      'destination_path',
      'is_expanded',
      'is_selected',
      'loan_term_months',
      'product_slug',
      'rental_period',
      'resource_type',
      'route_variant',
      'selected_addon_count',
      'selected_track',
      'source',
      'tech_id',
      'view_mode',
    ],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_route_transition_clicked',
    stage: 'rental_hub_intent',
    ownerTeam: 'rental_ops',
    sourceRoute: '/rental',
    sourceFile: 'app/rental/RentalTrackedLink.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: routePayload,
    forbiddenPayload,
    crmOutcomeLink: 'rental.review_started',
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_hub_contact_clicked',
    stage: 'rental_hub_intent',
    ownerTeam: 'rental_ops',
    sourceRoute: '/rental',
    sourceFile: 'components/RentalLandingPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: [...rentalHubLinkPayload, 'budget', 'technology'],
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_hub_filter_changed',
    stage: 'rental_hub_intent',
    ownerTeam: 'analytics_cro',
    sourceRoute: '/rental',
    sourceFile: 'components/RentalLandingPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: rentalHubFilterPayload,
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_hub_planner_clicked',
    stage: 'rental_hub_intent',
    ownerTeam: 'rental_ops',
    sourceRoute: '/rental',
    sourceFile: 'components/RentalLandingPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: ['destination'],
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_hub_primary_cta_clicked',
    stage: 'rental_hub_intent',
    ownerTeam: 'rental_ops',
    sourceRoute: '/rental',
    sourceFile: 'components/RentalLandingPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: ['destination', 'selected_product'],
    forbiddenPayload,
    crmOutcomeLink: 'rental.review_started',
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_hub_product_link_clicked',
    stage: 'rental_hub_intent',
    ownerTeam: 'product_engineering',
    sourceRoute: '/rental',
    sourceFile: 'components/RentalLandingPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: rentalHubProductPayload,
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_hub_program_fact_clicked',
    stage: 'rental_hub_intent',
    ownerTeam: 'rental_ops',
    sourceRoute: '/rental',
    sourceFile: 'components/RentalLandingPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: ['destination', 'title'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_hub_request_started',
    stage: 'rental_hub_intent',
    ownerTeam: 'rental_ops',
    sourceRoute: '/rental',
    sourceFile: 'components/RentalLandingPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: ['route', 'source', 'destination', 'device', 'product_id', 'product_slug'],
    forbiddenPayload,
    crmOutcomeLink: 'rental.review_started',
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_hub_resource_clicked',
    stage: 'rental_hub_intent',
    ownerTeam: 'rental_ops',
    sourceRoute: '/rental',
    sourceFile: 'components/RentalLandingPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: ['destination'],
    forbiddenPayload,
    crmOutcomeLink: 'rental.review_started',
    proofStatus: 'source_present',
  },
  {
    eventName: 'rental_checkout_route_action_clicked',
    stage: 'rental_checkout_request',
    ownerTeam: 'rental_ops',
    sourceRoute: '/rental/checkout',
    sourceFile: 'components/RentalCheckoutPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: rentalRequestPayload,
    forbiddenPayload,
    crmOutcomeLink: 'rental.review_started',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_callback_modal_opened',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact',
    sourceFile: 'components/ContactPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: contactCallbackPayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_callback_slot_selected',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact',
    sourceFile: 'components/ContactPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: contactCallbackPayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_form_start',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact and /pl/contact',
    sourceFile: 'components/ContactPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: contactPayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_form_submission_failed',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact',
    sourceFile: 'components/ContactPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: contactSubmissionStatusPayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.disqualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_form_submit_attempt',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact and /pl/contact',
    sourceFile: 'components/ContactPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: contactPayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_form_submission_succeeded',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact',
    sourceFile: 'components/ContactPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: contactSubmissionStatusPayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_post_submit_handoff_clicked',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact',
    sourceFile: 'components/ContactPage.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: routePayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_route_cta_clicked',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact',
    sourceFile: 'app/contact/ContactTrackedLink.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: routePayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'contact_support_route_clicked',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/contact',
    sourceFile: 'app/contact/ContactTrackedLink.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: routePayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'support_contact_click',
    stage: 'contact_support_recovery',
    ownerTeam: 'support_sales',
    sourceRoute: '/help and /service-and-support',
    sourceFile: 'app/help/HelpTrackedLink.tsx',
    consentClass: 'analytics_consent_required',
    allowedPayload: routePayload,
    forbiddenPayload,
    crmOutcomeLink: 'lead.qualified',
    proofStatus: 'source_present',
  },
  {
    eventName: 'lead.qualified',
    stage: 'crm_sales_follow_up',
    ownerTeam: 'support_sales',
    sourceRoute: 'CRM/manual follow-up',
    sourceFile: null,
    consentClass: 'external_crm_required',
    allowedPayload: ['crm_record_id', 'qualified_reason_code', 'created_at'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'external_required',
  },
  {
    eventName: 'lead.disqualified',
    stage: 'crm_sales_follow_up',
    ownerTeam: 'support_sales',
    sourceRoute: 'CRM/manual follow-up',
    sourceFile: null,
    consentClass: 'external_crm_required',
    allowedPayload: ['crm_record_id', 'disqualified_reason_code', 'created_at'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'external_required',
  },
  {
    eventName: 'rental.review_started',
    stage: 'manual_review',
    ownerTeam: 'rental_ops',
    sourceRoute: 'rental operations',
    sourceFile: null,
    consentClass: 'operational_follow_up_required',
    allowedPayload: ['crm_record_id', 'request_id', 'created_at'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'external_required',
  },
  {
    eventName: 'rental.approved',
    stage: 'manual_review',
    ownerTeam: 'rental_ops',
    sourceRoute: 'rental operations',
    sourceFile: null,
    consentClass: 'operational_follow_up_required',
    allowedPayload: ['crm_record_id', 'request_id', 'reviewed_at'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'external_required',
  },
  {
    eventName: 'rental.rejected',
    stage: 'manual_review',
    ownerTeam: 'rental_ops',
    sourceRoute: 'rental operations',
    sourceFile: null,
    consentClass: 'operational_follow_up_required',
    allowedPayload: ['crm_record_id', 'request_id', 'reviewed_at', 'reason_code'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'external_required',
  },
  {
    eventName: 'deposit.requested',
    stage: 'crm_sales_follow_up',
    ownerTeam: 'rental_ops',
    sourceRoute: 'rental operations',
    sourceFile: null,
    consentClass: 'external_crm_required',
    allowedPayload: ['crm_record_id', 'request_id', 'requested_at'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'external_required',
  },
  {
    eventName: 'delivery.scheduled',
    stage: 'crm_sales_follow_up',
    ownerTeam: 'rental_ops',
    sourceRoute: 'rental operations',
    sourceFile: null,
    consentClass: 'external_crm_required',
    allowedPayload: ['crm_record_id', 'request_id', 'scheduled_at'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'external_required',
  },
  {
    eventName: 'rental.activated',
    stage: 'crm_sales_follow_up',
    ownerTeam: 'rental_ops',
    sourceRoute: 'rental operations',
    sourceFile: null,
    consentClass: 'external_crm_required',
    allowedPayload: ['crm_record_id', 'request_id', 'activated_at'],
    forbiddenPayload,
    crmOutcomeLink: null,
    proofStatus: 'external_required',
  },
];

export const rentalFunnelWebEventMap = rentalFunnelEventMap.filter(
  (event): event is RentalFunnelWebEvent => event.proofStatus === 'source_present'
);

export const rentalFunnelExternalOutcomeMap = rentalFunnelEventMap.filter(
  (event): event is RentalFunnelExternalOutcome => event.proofStatus === 'external_required'
);

export const getRentalFunnelReadinessSummary = () => ({
  totalEvents: rentalFunnelEventMap.length,
  sourcePresentWebEvents: rentalFunnelWebEventMap.length,
  externalRequiredOutcomes: rentalFunnelExternalOutcomeMap.length,
  analyticsConsentEvents: rentalFunnelWebEventMap.filter(
    (event) => event.consentClass === 'analytics_consent_required'
  ).length,
});

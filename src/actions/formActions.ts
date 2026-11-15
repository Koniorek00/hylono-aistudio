'use server';

import { revalidateTag, updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';
import { checkoutContent } from '@/content/checkout';
import { regulatoryGateContent } from '@/content/rentalCheckout';
import { TECH_DETAILS } from '@/constants';
import { summarizeErrorForOperationalLog } from '@/app/api/_shared/log-safety';
import { createServerActionForwardingHeaders } from '@/app/api/_shared/server-action-forwarding';
import { env } from '@/lib/env';
import { actionClient } from '@/lib/safe-action';
import {
  SPAM_CAPTCHA_TOKEN_FIELDS,
  SPAM_HONEYPOT_FIELD,
} from '@/lib/spam-gate-fields';
import { TechType } from '@/types';

export interface FormActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  ticketId?: string;
  bookingRef?: string;
  orderId?: string;
  rentalId?: string;
  statusCode?: number;
}

interface RentalActionItem {
  techId: string;
  quantity: number;
  monthlyPrice: number;
}

interface RentalActionContact {
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  company?: string;
}

interface RentalActionResponse {
  id: string;
  userId: string;
  contact: RentalActionContact;
  items: RentalActionItem[];
  termMonths: number;
  status: 'pending' | 'active' | 'cancelled';
  totalMonthly: number;
  createdAt: string;
}

interface ContactApiResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

interface BookingApiResponse {
  success: boolean;
  message: string;
  bookingRef?: string;
}

interface CheckoutApiResponse {
  success: boolean;
  message: string;
  orderId?: string;
}

interface NewsletterApiResponse {
  success: boolean;
  message: string;
}

interface RentalApiResponse {
  success: boolean;
  message: string;
  rental?: RentalActionResponse;
}

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10).max(5000),
  privacyAcknowledged: z.literal('on', {
    error: 'Privacy acknowledgement is required.',
  }),
  privacyContext: z.string().trim().max(100).optional().default('contact form'),
  userType: z.string().trim().optional(),
  serialNumber: z.string().trim().max(100).optional(),
  clinicName: z.string().trim().max(100).optional(),
  monthlySessionCount: z.string().trim().max(50).optional(),
  interest: z.string().trim().max(100).optional(),
});

const newsletterSchema = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().max(100).optional().default('unknown'),
  consentToUpdates: z.literal('on', {
    error: 'Newsletter consent is required.',
  }),
  consentContext: z.string().trim().max(100).optional().default('newsletter form'),
});

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  preferredDate: z.string().trim().optional(),
  preferredTime: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
  bookingType: z.string().trim().optional().default('consultation'),
  interest: z.string().trim().max(100).optional(),
  date: z.string().trim().optional(),
  type: z.string().trim().optional(),
});

const rentalSchema = z.object({
  itemsJson: z.string().min(1).max(4096, 'itemsJson must be <=4096 characters.'),
  userId: z.string().trim().min(1).optional(),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(50),
  company: z.string().trim().max(100).optional(),
  termMonths: z.coerce.number().int().min(1).max(60).optional().default(12),
  rentalTermsAccepted: z.literal('on', {
    error: 'Rental program terms must be accepted.',
  }),
  rentalIntendedUseAttested: z.literal('on', {
    error: 'Intended-use attestation is required.',
  }),
});

const checkoutSchema = z.object({
  itemsJson: z.string().min(1).max(2048, 'itemsJson must be <=2048 characters.'),
  shippingJson: z
    .string()
    .min(1)
    .max(2048, 'shippingJson must be <=2048 characters.'),
  paymentMethod: z.enum(['card', 'bank_transfer', 'financing']),
  // The Article 7 support-only boundary plus the privacy gate. These three used to
  // be rendered and then dropped on the floor: `intended_use_attestation` reached
  // this action through FormData and was read by nobody, so a client could satisfy
  // the checkbox, skip it entirely, or post straight to /api/checkout and the order
  // was accepted all the same. They are read here and required here, and
  // `app/api/checkout/route.ts` requires them again server-side.
  intended_use_attestation: z.literal('on', {
    error: regulatoryGateContent.errors.intendedUseRequired,
  }),
  support_only_acknowledgement: z.literal('on', {
    error: regulatoryGateContent.errors.supportOnlyRequired,
  }),
  privacy_acknowledged: z.literal('on', {
    error: regulatoryGateContent.errors.privacyRequired,
  }),
});

const CONTACT_MESSAGE_API_MAX_LENGTH = 5000;

const checkoutItemSchema = z.object({
  id: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(100),
});

const shippingSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(50),
});

const rentalItemSchema = z.object({
  techId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(100),
  monthlyPrice: z.number().nonnegative(),
});

const TECH_ID_TO_TYPE: Record<string, TechType> = {
  'tech-hbot': TechType.HBOT,
  'tech-pemf': TechType.PEMF,
  'tech-rlt': TechType.RLT,
  'tech-hydrogen': TechType.HYDROGEN,
  'tech-ewot': TechType.EWOT,
  'tech-sauna_blanket': TechType.SAUNA_BLANKET,
  'tech-ems': TechType.EMS,
  'tech-vns': TechType.VNS,
  'tech-hypoxic': TechType.HYPOXIC,
  'tech-cryo': TechType.CRYO,
};

const parsePriceToMinorUnit = (amountText: string): number => {
  const parsed = Number(amountText.replace(/[^0-9.]/g, ''));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.round(parsed * 100);
};

const getTrustedUnitPriceCents = (itemId: string): number | null => {
  const techType = TECH_ID_TO_TYPE[itemId.trim().toLowerCase()];

  if (!techType) {
    return null;
  }

  const techDetails = TECH_DETAILS[techType];
  const unitPriceCents = parsePriceToMinorUnit(techDetails.price);

  return unitPriceCents > 0 ? unitPriceCents : null;
};

const safeParseJson = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

async function parseApiResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

const resolveApiBaseUrl = async (): Promise<string> => {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.trim();
  if (env.NODE_ENV !== 'development' && /^https?:\/\//i.test(siteUrl)) {
    return siteUrl.replace(/\/$/, '');
  }

  try {
    const headerList = await headers();
    const host =
      headerList.get('host') ??
      headerList.get('x-original-host');

    if (host) {
      const protocol =
        headerList.get('x-forwarded-proto') ??
        (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');

      return `${protocol}://${host}`.replace(/\/$/, '');
    }
  } catch {
    // no-op: fallback below handles environments without request context
  }

  const configured = env.NEXT_PUBLIC_API_BASE_URL.trim();
  if (/^https?:\/\//i.test(configured)) {
    return configured.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
};

const toApiUrl = async (path: string): Promise<string> => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${await resolveApiBaseUrl()}${normalizedPath}`;
};

/**
 * Reads the hidden decoy field rendered by `HoneypotField`. Only a non-empty value is
 * forwarded, so an ordinary submission adds nothing to the payload.
 */
const readHoneypotValue = (formData: FormData): string | undefined => {
  const value = formData.get(SPAM_HONEYPOT_FIELD);

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

/** Reads a captcha token from whichever supported field the form used, if any. */
const readCaptchaTokenValue = (formData: FormData): string | undefined => {
  for (const field of SPAM_CAPTCHA_TOKEN_FIELDS) {
    const value = formData.get(field);

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

/**
 * Builds the API request for an intake action.
 *
 * When `formData` is supplied, the spam-gate fields are forwarded onto the payload so
 * the server gate in `app/api/_shared/spam-gate.ts` can see them. The action schemas
 * intentionally do not model these fields - they are transport, not business data.
 */
const createApiRequestInit = async (
  body: unknown,
  formData?: FormData
): Promise<RequestInit> => {
  const forwardingHeaders = await headers()
    .then((headerList) => createServerActionForwardingHeaders(headerList))
    .catch(() => ({}));

  const honeypot = formData ? readHoneypotValue(formData) : undefined;
  const captchaToken = formData ? readCaptchaTokenValue(formData) : undefined;
  const isPlainPayload = Boolean(body) && typeof body === 'object' && !Array.isArray(body);
  const payload =
    isPlainPayload && (honeypot || captchaToken)
      ? {
          ...(body as Record<string, unknown>),
          ...(honeypot ? { [SPAM_HONEYPOT_FIELD]: honeypot } : {}),
          ...(captchaToken ? { captchaToken } : {}),
        }
      : body;

  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...forwardingHeaders,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  };
};

const asFallbackStatusCode = (error: unknown): number => {
  if (error instanceof TypeError) {
    return 503;
  }

  return 500;
};

const checkoutSubmitFailureMessage =
  checkoutContent.confirmation.submitErrorFallback;
const contactSubmitFailureMessage = 'Contact submission failed. Please try again shortly.';
const newsletterSubmitFailureMessage = 'Newsletter subscription failed. Please try again.';
const bookingSubmitFailureMessage = 'Booking request failed. Please try again.';
const rentalSubmitFailureMessage = 'Rental request failed. Please try again shortly.';

const unsafeForwardedActionMessagePattern =
  /(DATABASE_URL|API[_-]?KEY|SECRET|TOKEN|postgres:\/\/|sk_(live|test)_|[^\s@]+@[^\s@]+\.[^\s@]+)/i;

const resolveForwardedActionMessage = ({
  fallback,
  message,
  statusCode,
  success,
}: {
  fallback: string;
  message: string | undefined;
  statusCode: number;
  success: boolean;
}): string => {
  if (success && message) {
    return message;
  }

  if (!message || statusCode >= 500 || unsafeForwardedActionMessagePattern.test(message)) {
    return fallback;
  }

  return message;
};

const normalizeInquiryType = (
  userType: string | undefined
): 'general' | 'rental' | 'b2b' | 'support' | 'press' => {
  if (userType === 'clinic') {
    return 'b2b';
  }

  if (userType === 'owner') {
    return 'support';
  }

  if (userType === 'press') {
    return 'press';
  }

  if (userType === 'rental') {
    return 'rental';
  }

  return 'general';
};

const appendContactContext = (
  message: string,
  context: Array<[label: string, value: string | undefined]>
): string => {
  const normalizedContext = context
    .map(([label, value]) => [label, value?.trim()] as const)
    .filter(([, value]) => Boolean(value));

  if (normalizedContext.length === 0) {
    return message;
  }

  const detailLines = normalizedContext.map(
    ([label, value]) => `${label}: ${value}`
  );

  return `${message}\n\nAdditional details:\n${detailLines.join('\n')}`;
};

function flattenFieldErrors(error: z.ZodError): Record<string, string[]> | undefined {
  const flattened = z.flattenError(error);
  const fieldErrors: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      fieldErrors[field] = messages;
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

export async function submitContactFormAction(
  _prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject') || undefined,
    message: formData.get('message'),
    privacyAcknowledged: formData.get('privacyAcknowledged'),
    privacyContext: formData.get('privacyContext') || undefined,
    userType: formData.get('userType') || undefined,
    serialNumber: formData.get('serialNumber') || undefined,
    clinicName: formData.get('clinicName') || undefined,
    monthlySessionCount: formData.get('monthlySessionCount') || undefined,
    interest: formData.get('interest') || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid contact form.',
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const payload = {
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: appendContactContext(parsed.data.message, [
      ['Serial number', parsed.data.serialNumber],
      ['Clinic name', parsed.data.clinicName],
      ['Monthly client sessions', parsed.data.monthlySessionCount],
      ['Interest', parsed.data.interest],
    ]),
    phone: undefined,
    company: parsed.data.clinicName,
    inquiryType: normalizeInquiryType(parsed.data.userType),
    privacyAcknowledged: true,
    privacyContext: parsed.data.privacyContext,
  };

  if (payload.message.length > CONTACT_MESSAGE_API_MAX_LENGTH) {
    return {
      success: false,
      message: 'Contact message is too long after adding request context.',
    };
  }

  try {
    const response = await fetch(
      await toApiUrl('/api/contact'),
      await createApiRequestInit(payload, formData)
    );
    const result = await parseApiResponse<ContactApiResponse>(response);

    if (!result) {
      return {
        success: false,
        message: contactSubmitFailureMessage,
        statusCode: response.status,
      };
    }

    return {
      success: result.success,
      message: resolveForwardedActionMessage({
        fallback: contactSubmitFailureMessage,
        message: result.message,
        statusCode: response.status,
        success: result.success,
      }),
      ticketId: result.ticketId,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('[formActions] submitContactFormAction failed', {
      error: summarizeErrorForOperationalLog(error),
    });
    return {
      success: false,
      message: 'Unable to submit contact request right now. Please try again shortly.',
      statusCode: asFallbackStatusCode(error),
    };
  }
}

export async function submitNewsletterFormAction(
  _prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get('email'),
    source: formData.get('source') || undefined,
    consentToUpdates: formData.get('consentToUpdates'),
    consentContext: formData.get('consentContext') || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid email address.',
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }
  const payload = {
    email: parsed.data.email,
    source: parsed.data.source,
    consentToUpdates: true,
    consentContext: parsed.data.consentContext,
  };

  try {
    const response = await fetch(
      await toApiUrl('/api/newsletter'),
      await createApiRequestInit(payload, formData)
    );
    const result = await parseApiResponse<NewsletterApiResponse>(response);

    if (!result) {
      return {
        success: false,
        message: newsletterSubmitFailureMessage,
        statusCode: response.status,
      };
    }

    if (result.success) {
      updateTag('newsletter');
      revalidateTag('newsletter', 'max');
    }

    return {
      success: result.success,
      message: resolveForwardedActionMessage({
        fallback: newsletterSubmitFailureMessage,
        message: result.message,
        statusCode: response.status,
        success: result.success,
      }),
      statusCode: response.status,
    };
  } catch (error) {
    console.error('[formActions] submitNewsletterFormAction failed', {
      error: summarizeErrorForOperationalLog(error),
    });
    return {
      success: false,
      message: 'Unable to subscribe right now. Please try again shortly.',
      statusCode: asFallbackStatusCode(error),
    };
  }
}

export async function submitBookingFormAction(
  _prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const parsed = bookingSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    preferredDate: formData.get('preferredDate') || formData.get('date') || undefined,
    preferredTime: formData.get('preferredTime') || undefined,
    notes: formData.get('notes') || undefined,
    bookingType: formData.get('bookingType') || formData.get('type') || undefined,
    interest: formData.get('interest') || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid booking data.',
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const payload = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    preferredDate: parsed.data.preferredDate,
    preferredTime: parsed.data.preferredTime,
    notes: parsed.data.notes,
    bookingType: parsed.data.bookingType,
    techInterest: parsed.data.interest,
  };

  try {
    const response = await fetch(
      await toApiUrl('/api/booking'),
      await createApiRequestInit(payload, formData)
    );
    const result = await parseApiResponse<BookingApiResponse>(response);

    if (!result) {
      return {
        success: false,
        message: bookingSubmitFailureMessage,
        statusCode: response.status,
      };
    }

    return {
      success: result.success,
      message: resolveForwardedActionMessage({
        fallback: bookingSubmitFailureMessage,
        message: result.message,
        statusCode: response.status,
        success: result.success,
      }),
      bookingRef: result.bookingRef,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('[formActions] submitBookingFormAction failed', {
      error: summarizeErrorForOperationalLog(error),
    });
    return {
      success: false,
      message: 'Unable to submit booking request right now. Please try again shortly.',
      statusCode: asFallbackStatusCode(error),
    };
  }
}

export async function submitCheckoutFormAction(
  _prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const parsed = checkoutSchema.safeParse({
    itemsJson: formData.get('itemsJson'),
    shippingJson: formData.get('shippingJson'),
    paymentMethod: formData.get('paymentMethod'),
    intended_use_attestation: formData.get('intended_use_attestation'),
    support_only_acknowledgement: formData.get('support_only_acknowledgement'),
    privacy_acknowledged: formData.get('privacy_acknowledged'),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid checkout payload.',
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const parsedItemsRaw = safeParseJson<unknown>(parsed.data.itemsJson);
  const parsedShippingRaw = safeParseJson<unknown>(parsed.data.shippingJson);

  if (!Array.isArray(parsedItemsRaw) || !parsedShippingRaw) {
    return {
      success: false,
      message: 'Invalid checkout payload.',
    };
  }

  const itemsResult = z.array(checkoutItemSchema).safeParse(parsedItemsRaw);
  const shippingResult = shippingSchema.safeParse(parsedShippingRaw);

  if (!itemsResult.success || !shippingResult.success) {
    return {
      success: false,
      message: 'Invalid checkout payload.',
    };
  }

  const trustedItems = itemsResult.data.map((item) => {
    const unitPriceCents = getTrustedUnitPriceCents(item.id);

    if (!unitPriceCents) {
      return null;
    }

    return {
      id: item.id,
      quantity: item.quantity,
      unitPriceCents,
    };
  });

  if (trustedItems.some((item) => item === null)) {
    return {
      success: false,
      message:
        'One or more cart items are invalid. Please refresh your cart and try again.',
    };
  }

  const resolvedItems = trustedItems.filter(
    (item): item is NonNullable<typeof item> => Boolean(item)
  );

  const totalCents = resolvedItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );

  if (totalCents <= 0) {
    return {
      success: false,
      message: 'Unable to process checkout for this cart.',
    };
  }

  const payload = {
    items: resolvedItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    })),
    shipping: shippingResult.data,
    paymentMethod: parsed.data.paymentMethod,
    // `z.literal('on')` above means these can only reach this line by having been
    // ticked, so the booleans are a truthful restatement rather than a cast.
    intendedUseAttested: true,
    supportOnlyAcknowledged: true,
    privacyAcknowledged: true,
  };

  try {
    const response = await fetch(
      await toApiUrl('/api/checkout'),
      await createApiRequestInit(payload, formData)
    );
    const result = await parseApiResponse<CheckoutApiResponse>(response);

    if (!result) {
      return {
        success: false,
        message: checkoutSubmitFailureMessage,
        statusCode: response.status,
      };
    }

    return {
      success: result.success,
      message: resolveForwardedActionMessage({
        fallback: checkoutSubmitFailureMessage,
        message: result.message,
        statusCode: response.status,
        success: result.success,
      }),
      orderId: result.orderId,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('[formActions] submitCheckoutFormAction failed', {
      error: summarizeErrorForOperationalLog(error),
    });
    return {
      success: false,
      message: 'Unable to process checkout right now. Please try again shortly.',
      statusCode: asFallbackStatusCode(error),
    };
  }
}

export async function submitRentalFormAction(
  _prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const parsed = rentalSchema.safeParse({
    itemsJson: formData.get('itemsJson'),
    userId: formData.get('userId') || undefined,
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    address: formData.get('address'),
    city: formData.get('city'),
    postalCode: formData.get('postalCode'),
    country: formData.get('country'),
    company: formData.get('company') || undefined,
    termMonths: formData.get('termMonths') || undefined,
    rentalTermsAccepted: formData.get('rentalTermsAccepted'),
    rentalIntendedUseAttested: formData.get('rentalIntendedUseAttested'),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid rental payload.',
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const parsedItemsRaw = safeParseJson<unknown>(parsed.data.itemsJson);
  if (!Array.isArray(parsedItemsRaw)) {
    return {
      success: false,
      message: 'Invalid rental payload.',
    };
  }

  const itemsResult = z.array(rentalItemSchema).safeParse(parsedItemsRaw);
  if (!itemsResult.success) {
    return {
      success: false,
      message: 'Invalid rental payload.',
      fieldErrors: flattenFieldErrors(itemsResult.error),
    };
  }

  const payload = {
    items: itemsResult.data,
    // Forwarded only when the form actually carried one. This used to be
    // `parsed.data.userId || parsed.data.email`, which fabricated a userId for every
    // anonymous lead and shipped it as if the customer had asserted it;
    // `app/api/rental/route.ts` now rejects a body userId that does not match an
    // authenticated session, so inventing one here would turn ordinary unauthenticated
    // lead capture into a 403. Absent means "claim no identity".
    userId: parsed.data.userId,
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    address: parsed.data.address,
    city: parsed.data.city,
    postalCode: parsed.data.postalCode,
    country: parsed.data.country,
    company: parsed.data.company,
    termMonths: parsed.data.termMonths,
    // Both attestations are already enforced by `rentalSchema` above via
    // `z.literal('on')`, but they were dropped on the floor here: the forwarded
    // payload omitted them, so /api/rental had nothing to require, nothing to store,
    // and a direct POST bypassed the rental gate entirely. Forwarded now.
    rentalTermsAccepted: true,
    rentalIntendedUseAttested: true,
    // Informational only. `app/api/rental/route.ts` ignores this value and stamps
    // its own server-side `attestedAt` on the stored record, so a client cannot
    // backdate or forward-date the attestation.
    attestedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(
      await toApiUrl('/api/rental'),
      await createApiRequestInit(payload, formData)
    );
    const result = await parseApiResponse<RentalApiResponse>(response);

    if (!result) {
      return {
        success: false,
        message: rentalSubmitFailureMessage,
        statusCode: response.status,
      };
    }

    return {
      success: result.success,
      message: resolveForwardedActionMessage({
        fallback: rentalSubmitFailureMessage,
        message: result.message,
        statusCode: response.status,
        success: result.success,
      }),
      rentalId: result.rental?.id,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('[formActions] submitRentalFormAction failed', {
      error: summarizeErrorForOperationalLog(error),
    });
    return {
      success: false,
      message: 'Unable to submit rental request right now. Please try again shortly.',
      statusCode: asFallbackStatusCode(error),
    };
  }
}

const submitNewsletterInputSchema = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().max(100).optional().default('unknown'),
  consentToUpdates: z.literal(true),
  consentContext: z.string().trim().max(100).optional().default('newsletter safe action'),
});

export const submitNewsletterSafeAction = actionClient
  .inputSchema(submitNewsletterInputSchema)
  .action(async ({ parsedInput }) => {
    updateTag('newsletter');

    return {
      success: true,
      message: 'Thank you for subscribing! Check your inbox to confirm.',
      email: parsedInput.email,
      source: parsedInput.source,
    };
  });

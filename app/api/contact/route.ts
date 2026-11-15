/**
 * POST /api/contact
 * Handles contact form submissions.
 * Validates input, sanitizes fields, and sends notification email.
 */

import { and, eq, gte } from 'drizzle-orm';
import { z } from 'zod';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { contactInquiriesTable } from '@/lib/db/schema';
import { dispatchIntakeEventToN8n, type IntakeDispatchResult } from '@/lib/integrations/n8n';
import { syncAndNotifySubscriberViaNovu } from '@/lib/integrations/novu';
import { syncPersonAndFollowUpToTwenty } from '@/lib/integrations/twenty';
import {
  buildRequestFingerprint,
  recentSubmissionThreshold,
} from '../_shared/fingerprints';
import { appendIntakeWorkflowSyncDelayNotice } from '../_shared/intake-handoff';
import {
  buildDirectContactFallbackMessage,
  logIntakeDurabilityAlarm,
  resolveIntakeDurability,
  sendIntakeNotificationEmail,
  type IntakeNotificationStatus,
} from '../_shared/intake-durability';
import {
  createDistributedRateLimitResponse,
  consumeDistributedRateLimit,
} from '../_shared/distributed-rate-limit';
import {
  formatMissingDatabaseConfigurationLogMessage,
  summarizeErrorForOperationalLog,
} from '../_shared/log-safety';
import { consumeRateLimit, createRateLimitResponse } from '../_shared/rate-limit';
import { createSpamGateResponse, resolveSpamGate } from '../_shared/spam-gate';
import { readJsonBody, sanitizeText, validationErrorResponse } from '../_shared/validation';

interface ContactRequest {
    name: string;
    email: string;
    subject?: string;
    message: string;
    privacyAcknowledged: true;
    privacyContext?: string;
    phone?: string;
    company?: string;
    inquiryType?: 'general' | 'rental' | 'b2b' | 'support' | 'press';
}

interface ContactResponse {
    success: boolean;
    message: string;
    ticketId?: string;
}

type SanitizedContactRequest = {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone?: string;
    company?: string;
    inquiryType: ContactRequest['inquiryType'];
};

const CONTACT_AREA = 'contact';

const COMMON_EMAIL_DOMAINS = new Set([
    'gmail.com',
    'googlemail.com',
    'hotmail.com',
    'icloud.com',
    'interia.pl',
    'o2.pl',
    'outlook.com',
    'proton.me',
    'protonmail.com',
    'wp.pl',
    'yahoo.com',
]);

function inferCompanyNameFromEmail(email: string): string | undefined {
    const domain = email.trim().toLowerCase().split('@')[1];

    if (!domain || COMMON_EMAIL_DOMAINS.has(domain)) {
        return undefined;
    }

    return domain;
}

const contactSchema = z.object({
    name: z.string().trim().min(2, 'Please enter your full name (minimum 2 characters).').max(100),
    email: z.string().trim().email('Please enter a valid email address.'),
    subject: z.string().trim().max(200).optional(),
    message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(5000, 'Message cannot exceed 5,000 characters.'),
    privacyAcknowledged: z.literal(true, {
        error: 'Privacy acknowledgement is required.',
    }),
    privacyContext: z.string().trim().max(100).optional().default('contact form'),
    phone: z.string().trim().max(30).optional(),
    company: z.string().trim().max(100).optional(),
    inquiryType: z.enum(['general', 'rental', 'b2b', 'support', 'press']).optional().default('general'),
}) satisfies z.ZodType<ContactRequest>;

const CONTACT_RATE_LIMIT = {
    bucket: 'contact',
    limit: 5,
    windowMs: 10 * 60 * 1000,
} as const;

/** Single source of the operator notification body for this route. */
const buildContactNotificationText = (
    ticketId: string,
    sanitized: SanitizedContactRequest
): string =>
    [
        `From: ${sanitized.name} <${sanitized.email}>`,
        `Company: ${sanitized.company ?? 'N/A'}`,
        `Phone: ${sanitized.phone ?? 'N/A'}`,
        `Inquiry Type: ${sanitized.inquiryType}`,
        `Ticket: ${ticketId}`,
        '',
        sanitized.message,
    ].join('\n');

const notifyContactOperator = (
    ticketId: string,
    sanitized: SanitizedContactRequest,
    isDatabaseFallback: boolean
): Promise<IntakeNotificationStatus> =>
    sendIntakeNotificationEmail({
        area: CONTACT_AREA,
        reference: ticketId,
        subject: sanitized.subject,
        text: buildContactNotificationText(ticketId, sanitized),
        replyTo: sanitized.email,
        isDatabaseFallback,
    });

export async function POST(request: Request): Promise<Response> {
    try {
        const rateLimitState = consumeRateLimit(request, CONTACT_RATE_LIMIT);
        if (!rateLimitState.allowed) {
            return createRateLimitResponse(
                rateLimitState,
                'Too many contact requests. Please wait a few minutes and try again.'
            );
        }

        // Second layer: the limit that holds across serverless instances. Fails open.
        const distributedRateLimit = await consumeDistributedRateLimit(
            request,
            CONTACT_AREA
        );
        if (!distributedRateLimit.allowed) {
            return createDistributedRateLimitResponse(
                distributedRateLimit,
                'Too many contact requests. Please wait a few minutes and try again.'
            );
        }

        const rawBody = await readJsonBody(request);

        // Evaluated on the raw body: the schema strips unknown keys and would discard
        // the honeypot decoy before it could be read.
        const spamGate = await resolveSpamGate({
            request,
            rawBody,
            area: CONTACT_AREA,
        });
        if (spamGate.blocked) {
            return createSpamGateResponse();
        }

        const parsed = contactSchema.safeParse(rawBody);

        if (!parsed.success) {
            return validationErrorResponse(parsed.error);
        }

        const body = parsed.data;
        const { name, email, message, subject, privacyContext, phone, company, inquiryType = 'general' } = body;

        // --- Sanitize ---
        const sanitized = {
            name: sanitizeText(name, 100),
            email: sanitizeText(email, {
                maxLength: 254,
                context: 'email',
            }),
            subject: subject ? sanitizeText(subject, 200) : `Contact: ${inquiryType}`,
            message: sanitizeText(message, {
                maxLength: 5000,
                context: 'multiline',
            }),
            privacyAcknowledged: true,
            privacyContext: sanitizeText(privacyContext, 100),
            phone: phone
                ? sanitizeText(phone, {
                    maxLength: 30,
                    context: 'phone',
                })
                : undefined,
            company: company ? sanitizeText(company, 100) : undefined,
            inquiryType,
        };
        const inferredCompanyName = sanitized.company ?? inferCompanyNameFromEmail(sanitized.email);

        // Generate a simple ticket ID for tracking
        const ticketId = `HYL-${Date.now().toString(36).toUpperCase()}`;

        // Durability step 1: attempt the authoritative database row. Any failure here
        // must fall through to the email fallback rather than dropping the lead.
        let databaseAccepted = false;
        let duplicateTicketId: string | undefined;

        if (!isDatabaseConfigured()) {
            console.error(formatMissingDatabaseConfigurationLogMessage(CONTACT_AREA), {
                ticketId,
            });
        } else {
            try {
                await ensureDatabaseReady();
                const db = getDb();
                const submissionHash = buildRequestFingerprint({
                    email: sanitized.email,
                    inquiryType: sanitized.inquiryType,
                    message: sanitized.message,
                    subject: sanitized.subject,
                });
                const duplicateAfter = recentSubmissionThreshold();
                const recentDuplicate = (await db
                    .select()
                    .from(contactInquiriesTable)
                    .where(
                        and(
                            eq(contactInquiriesTable.submissionHash, submissionHash),
                            gte(contactInquiriesTable.createdAt, duplicateAfter)
                        )
                    ))
                    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

                if (recentDuplicate) {
                    duplicateTicketId = recentDuplicate.ticketId;
                } else {
                    await db.insert(contactInquiriesTable).values({
                        id: crypto.randomUUID(),
                        ticketId,
                        name: sanitized.name,
                        email: sanitized.email,
                        subject: sanitized.subject,
                        message: sanitized.message,
                        phone: sanitized.phone,
                        company: sanitized.company,
                        inquiryType: sanitized.inquiryType,
                        submissionHash,
                    });
                }

                databaseAccepted = true;
            } catch (error) {
                console.error('[contact] Database persistence failed', {
                    error: summarizeErrorForOperationalLog(error),
                    ticketId,
                });
            }
        }

        if (duplicateTicketId) {
            return Response.json(
                {
                    success: true,
                    message: `We already received this request. Reference: ${duplicateTicketId}.`,
                    ticketId: duplicateTicketId,
                } satisfies ContactResponse,
                { status: 200 }
            );
        }

        // Durability step 2: no database row means the notification email is the only
        // surviving record, so it is attempted before any failure is reported.
        if (!databaseAccepted) {
            const fallbackNotification = await notifyContactOperator(ticketId, sanitized, true);
            const fallbackDispatch = await dispatchIntakeEventToN8n({
                target: 'contact',
                eventType: 'contact.created',
                payload: {
                    ticketId,
                    databaseFallback: true,
                    ...sanitized,
                },
            });
            const outcome = resolveIntakeDurability({
                persistence: fallbackNotification === 'sent' ? 'email_fallback' : 'none',
                notification: fallbackNotification,
            });

            logIntakeDurabilityAlarm({
                area: CONTACT_AREA,
                reference: ticketId,
                persistence: outcome.persistence,
                notification: outcome.notification,
            });

            if (!outcome.accepted) {
                return Response.json(
                    {
                        success: false,
                        message: buildDirectContactFallbackMessage(),
                    } satisfies ContactResponse,
                    { status: outcome.status }
                );
            }

            return Response.json(
                {
                    success: true,
                    message: appendIntakeWorkflowSyncDelayNotice(
                        `Thank you, ${sanitized.name}. Your request has been recorded under ${ticketId}; our team will follow up soon.`,
                        fallbackDispatch
                    ),
                    ticketId,
                } satisfies ContactResponse,
                { status: outcome.status }
            );
        }

        const n8nDispatchResult: IntakeDispatchResult = await dispatchIntakeEventToN8n({
            target: 'contact',
            eventType: 'contact.created',
            payload: {
                ticketId,
                ...sanitized,
            },
        });

        await Promise.allSettled([
            syncPersonAndFollowUpToTwenty({
                email: sanitized.email,
                fullName: sanitized.name,
                phone: sanitized.phone,
                companyName: inferredCompanyName,
                source: `contact:${sanitized.inquiryType}`,
                taskTitle: `Contact follow-up ${ticketId}`,
                taskBodyText: [
                    `Ticket: ${ticketId}`,
                    `Inquiry type: ${sanitized.inquiryType}`,
                    `Subject: ${sanitized.subject}`,
                    `Name: ${sanitized.name}`,
                    `Email: ${sanitized.email}`,
                    `Phone: ${sanitized.phone ?? 'N/A'}`,
                    `Company: ${inferredCompanyName ?? 'N/A'}`,
                    `Privacy acknowledgement: yes (${sanitized.privacyContext})`,
                    '',
                    sanitized.message,
                ].join('\n'),
            }),
            syncAndNotifySubscriberViaNovu({
                email: sanitized.email,
                fullName: sanitized.name,
                phone: sanitized.phone,
                source: `contact:${sanitized.inquiryType}`,
                title: 'Contact request received',
                message: `Thanks for reaching out to Hylono. Your request is recorded under ${ticketId} and we will review "${sanitized.subject}" shortly.`,
                data: {
                    ticketId,
                    company: sanitized.company ?? null,
                    inquiryType: sanitized.inquiryType,
                    privacyAcknowledged: true,
                    privacyContext: sanitized.privacyContext,
                    subject: sanitized.subject,
                },
                payload: {
                    ticketId,
                    inquiryType: sanitized.inquiryType,
                    privacyAcknowledged: true,
                    privacyContext: sanitized.privacyContext,
                    subject: sanitized.subject,
                    company: sanitized.company ?? null,
                },
            }),
        ]);

        // Durability step 3: the row is already safe, so a notification problem is an
        // operator alarm rather than a customer-facing failure.
        const notification = await notifyContactOperator(ticketId, sanitized, false);
        const outcome = resolveIntakeDurability({
            persistence: 'database',
            notification,
        });

        if (notification !== 'sent') {
            return Response.json(
                {
                    success: true,
                    message: appendIntakeWorkflowSyncDelayNotice(
                        notification === 'not_configured'
                            ? `Thank you, ${sanitized.name}! Your request has been received. We'll respond within 1 business day. Reference: ${ticketId}`
                            : `Thank you, ${sanitized.name}. Your request has been recorded under ${ticketId}; our team will follow up soon.`,
                        n8nDispatchResult
                    ),
                    ticketId,
                } satisfies ContactResponse,
                { status: outcome.status }
            );
        }

        console.info(`[contact] Contact inquiry accepted: ticket=${ticketId}, type=${sanitized.inquiryType}`);

        return Response.json(
            {
                success: true,
                message: appendIntakeWorkflowSyncDelayNotice(
                    `Thank you, ${sanitized.name}! We'll respond within 1 business day. Reference: ${ticketId}`,
                    n8nDispatchResult
                ),
                ticketId,
            } satisfies ContactResponse,
            { status: 200 }
        );
    } catch (error) {
        console.error('[contact] Error processing contact form', {
            error: summarizeErrorForOperationalLog(error),
        });
        return Response.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' } satisfies ContactResponse,
            { status: 500 }
        );
    }
}

export function GET(): Response {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}

/**
 * POST /api/booking
 * Handles consultation/demo booking requests.
 * Validates input and creates a booking record.
 */

import { and, eq, gte } from 'drizzle-orm';
import { z } from 'zod';
import { bookingRequestsTable } from '@/lib/db/schema';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { dispatchIntakeEventToN8n, type IntakeDispatchResult } from '@/lib/integrations/n8n';
import { syncAndNotifySubscriberViaNovu } from '@/lib/integrations/novu';
import { syncPersonAndFollowUpToTwenty } from '@/lib/integrations/twenty';
import { siteEntity } from '@/content/site-entity';
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

interface BookingRequest {
    name: string;
    email: string;
    phone?: string;
    preferredDate?: string; // ISO date string
    preferredTime?: string; // e.g. "10:00", "14:30"
    timezone?: string;
    techInterest?: string; // e.g. "HBOT", "PEMF", "RLT", "HYDROGEN"
    notes?: string;
    bookingType?: 'consultation' | 'demo' | 'rental-inquiry' | 'b2b';
}

interface BookingResponse {
    success: boolean;
    message: string;
    bookingRef?: string;
}

type SanitizedBookingRequest = {
    name: string;
    email: string;
    phone?: string;
    preferredDate?: string;
    preferredTime?: string;
    timezone: string;
    techInterest?: string;
    notes?: string;
    bookingType: NonNullable<BookingRequest['bookingType']>;
};

const BOOKING_AREA = 'booking';

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

const bookingSchema = z.object({
    name: z.string().trim().min(2, 'Please enter your full name.').max(100),
    email: z.string().trim().email('Please enter a valid email address.'),
    phone: z.string().trim().max(30).optional(),
    preferredDate: z.string().trim().max(100).optional(),
    preferredTime: z.string().trim().max(20).optional(),
    timezone: z.string().trim().max(80).optional().default('Europe/Amsterdam'),
    techInterest: z.string().trim().max(50).optional(),
    notes: z.string().trim().max(1000).optional(),
    bookingType: z.enum(['consultation', 'demo', 'rental-inquiry', 'b2b']).optional().default('consultation'),
}) satisfies z.ZodType<BookingRequest>;

const BOOKING_RATE_LIMIT = {
    bucket: 'booking',
    limit: 5,
    windowMs: 10 * 60 * 1000,
} as const;

/** Single source of the operator notification body for this route. */
const buildBookingNotificationText = (
    bookingRef: string,
    sanitized: SanitizedBookingRequest
): string =>
    [
        `Booking reference: ${bookingRef}`,
        `Type: ${sanitized.bookingType}`,
        `Customer: ${sanitized.name} <${sanitized.email}>`,
        `Phone: ${sanitized.phone ?? 'N/A'}`,
        `Preferred date: ${sanitized.preferredDate ?? 'N/A'}`,
        `Preferred time: ${sanitized.preferredTime ?? 'N/A'}`,
        `Timezone: ${sanitized.timezone ?? 'N/A'}`,
        `Technology interest: ${sanitized.techInterest ?? 'N/A'}`,
        '',
        `Notes: ${sanitized.notes ?? 'N/A'}`,
    ].join('\n');

const notifyBookingOperator = (
    bookingRef: string,
    sanitized: SanitizedBookingRequest,
    isDatabaseFallback: boolean
): Promise<IntakeNotificationStatus> =>
    sendIntakeNotificationEmail({
        area: BOOKING_AREA,
        reference: bookingRef,
        subject: `${sanitized.bookingType} request`,
        text: buildBookingNotificationText(bookingRef, sanitized),
        replyTo: sanitized.email,
        isDatabaseFallback,
    });

export async function POST(request: Request): Promise<Response> {
    try {
        const rateLimitState = consumeRateLimit(request, BOOKING_RATE_LIMIT);
        if (!rateLimitState.allowed) {
            return createRateLimitResponse(
                rateLimitState,
                'Too many booking requests. Please wait a few minutes and try again.'
            );
        }

        // Second layer: the limit that holds across serverless instances. Fails open.
        const distributedRateLimit = await consumeDistributedRateLimit(
            request,
            BOOKING_AREA
        );
        if (!distributedRateLimit.allowed) {
            return createDistributedRateLimitResponse(
                distributedRateLimit,
                'Too many booking requests. Please wait a few minutes and try again.'
            );
        }

        const rawBody = await readJsonBody(request);

        // Evaluated on the raw body: the schema strips unknown keys and would discard
        // the honeypot decoy before it could be read.
        const spamGate = await resolveSpamGate({
            request,
            rawBody,
            area: BOOKING_AREA,
        });
        if (spamGate.blocked) {
            return createSpamGateResponse();
        }

        const parsed = bookingSchema.safeParse(rawBody);

        if (!parsed.success) {
            return validationErrorResponse(parsed.error);
        }

        const body = parsed.data;
        const {
            name,
            email,
            phone,
            preferredDate,
            preferredTime,
            timezone = 'Europe/Amsterdam',
            techInterest,
            notes,
            bookingType = 'consultation',
        } = body;

        // --- Sanitize ---
        const sanitized = {
            name: sanitizeText(name, 100),
            email: sanitizeText(email, {
                maxLength: 254,
                context: 'email',
            }),
            phone: phone
                ? sanitizeText(phone, {
                    maxLength: 30,
                    context: 'phone',
                })
                : undefined,
            preferredDate,
            preferredTime,
            timezone,
            techInterest: techInterest ? sanitizeText(techInterest, 50) : undefined,
            notes: notes
                ? sanitizeText(notes, {
                    maxLength: 1000,
                    context: 'multiline',
                })
                : undefined,
            bookingType,
        };
        const inferredCompanyName = inferCompanyNameFromEmail(sanitized.email);

        // Generate booking reference
        const bookingRef = `BK-${Date.now().toString(36).toUpperCase()}`;

        // Durability step 1: attempt the authoritative database row. Any failure here
        // must fall through to the email fallback rather than dropping the lead.
        let databaseAccepted = false;
        let duplicateBookingRef: string | undefined;

        if (!isDatabaseConfigured()) {
            console.error(formatMissingDatabaseConfigurationLogMessage(BOOKING_AREA), {
                bookingRef,
            });
        } else {
            try {
                await ensureDatabaseReady();
                const db = getDb();
                const submissionHash = buildRequestFingerprint({
                    bookingType: sanitized.bookingType,
                    email: sanitized.email,
                    notes: sanitized.notes ?? null,
                    preferredDate: sanitized.preferredDate ?? null,
                    preferredTime: sanitized.preferredTime ?? null,
                    techInterest: sanitized.techInterest ?? null,
                });
                const duplicateAfter = recentSubmissionThreshold();
                const recentDuplicate = (await db
                    .select()
                    .from(bookingRequestsTable)
                    .where(
                        and(
                            eq(bookingRequestsTable.submissionHash, submissionHash),
                            gte(bookingRequestsTable.createdAt, duplicateAfter)
                        )
                    ))
                    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

                if (recentDuplicate) {
                    duplicateBookingRef = recentDuplicate.bookingRef;
                } else {
                    await db.insert(bookingRequestsTable).values({
                        id: crypto.randomUUID(),
                        bookingRef,
                        name: sanitized.name,
                        email: sanitized.email,
                        phone: sanitized.phone,
                        preferredDate: sanitized.preferredDate,
                        preferredTime: sanitized.preferredTime,
                        timezone: sanitized.timezone,
                        techInterest: sanitized.techInterest,
                        notes: sanitized.notes,
                        bookingType: sanitized.bookingType,
                        submissionHash,
                    });
                }

                databaseAccepted = true;
            } catch (error) {
                console.error('[booking] Database persistence failed', {
                    bookingRef,
                    error: summarizeErrorForOperationalLog(error),
                });
            }
        }

        if (duplicateBookingRef) {
            return Response.json(
                {
                    success: true,
                    message: `We already received this booking request. Reference: ${duplicateBookingRef}.`,
                    bookingRef: duplicateBookingRef,
                } satisfies BookingResponse,
                { status: 200 }
            );
        }

        // Durability step 2: no database row means the notification email is the only
        // surviving record, so it is attempted before any failure is reported.
        if (!databaseAccepted) {
            const fallbackNotification = await notifyBookingOperator(bookingRef, sanitized, true);
            const fallbackDispatch = await dispatchIntakeEventToN8n({
                target: 'booking',
                eventType: 'booking.requested',
                payload: {
                    bookingRef,
                    databaseFallback: true,
                    ...sanitized,
                },
            });
            const outcome = resolveIntakeDurability({
                persistence: fallbackNotification === 'sent' ? 'email_fallback' : 'none',
                notification: fallbackNotification,
            });

            logIntakeDurabilityAlarm({
                area: BOOKING_AREA,
                reference: bookingRef,
                persistence: outcome.persistence,
                notification: outcome.notification,
            });

            if (!outcome.accepted) {
                return Response.json(
                    {
                        success: false,
                        message: buildDirectContactFallbackMessage(),
                    } satisfies BookingResponse,
                    { status: outcome.status }
                );
            }

            return Response.json(
                {
                    success: true,
                    message: appendIntakeWorkflowSyncDelayNotice(
                        `Booking request received! Reference: ${bookingRef}. Your slot is not yet confirmed. The team replies by email during support hours (${siteEntity.supportHours}); the published service response window is ${siteEntity.serviceResponseSummary}`,
                        fallbackDispatch
                    ),
                    bookingRef,
                } satisfies BookingResponse,
                { status: outcome.status }
            );
        }

        const n8nDispatchResult: IntakeDispatchResult = await dispatchIntakeEventToN8n({
            target: 'booking',
            eventType: 'booking.requested',
            payload: {
                bookingRef,
                ...sanitized,
            },
        });

        await Promise.allSettled([
            syncPersonAndFollowUpToTwenty({
                email: sanitized.email,
                fullName: sanitized.name,
                phone: sanitized.phone,
                companyName: inferredCompanyName,
                source: `booking:${sanitized.bookingType}`,
                taskTitle: `Booking follow-up ${bookingRef}`,
                taskBodyText: [
                    `Booking reference: ${bookingRef}`,
                    `Type: ${sanitized.bookingType}`,
                    `Name: ${sanitized.name}`,
                    `Email: ${sanitized.email}`,
                    `Phone: ${sanitized.phone ?? 'N/A'}`,
                    `Company: ${inferredCompanyName ?? 'N/A'}`,
                    `Preferred date: ${sanitized.preferredDate ?? 'N/A'}`,
                    `Preferred time: ${sanitized.preferredTime ?? 'N/A'}`,
                    `Timezone: ${sanitized.timezone}`,
                    `Technology interest: ${sanitized.techInterest ?? 'N/A'}`,
                    '',
                    `Notes: ${sanitized.notes ?? 'N/A'}`,
                ].join('\n'),
            }),
            syncAndNotifySubscriberViaNovu({
                email: sanitized.email,
                fullName: sanitized.name,
                phone: sanitized.phone,
                source: `booking:${sanitized.bookingType}`,
                title: 'Booking request received',
                message: `Your ${sanitized.bookingType} booking request is saved as ${bookingRef}. We will confirm timing for ${sanitized.preferredDate ?? 'your preferred date'} shortly.`,
                data: {
                    bookingRef,
                    bookingType: sanitized.bookingType,
                    preferredDate: sanitized.preferredDate ?? null,
                    preferredTime: sanitized.preferredTime ?? null,
                    techInterest: sanitized.techInterest ?? null,
                    timezone: sanitized.timezone,
                },
                payload: {
                    bookingRef,
                    bookingType: sanitized.bookingType,
                    preferredDate: sanitized.preferredDate ?? null,
                    preferredTime: sanitized.preferredTime ?? null,
                    techInterest: sanitized.techInterest ?? null,
                    timezone: sanitized.timezone,
                },
            }),
        ]);

        // Durability step 3: the row is already safe, so a notification problem is an
        // operator alarm rather than a customer-facing failure.
        const notification = await notifyBookingOperator(bookingRef, sanitized, false);
        const outcome = resolveIntakeDurability({
            persistence: 'database',
            notification,
        });

        if (notification !== 'sent') {
            return Response.json(
                {
                    success: true,
                    message: appendIntakeWorkflowSyncDelayNotice(
                        `Booking request received! Reference: ${bookingRef}. Your slot is not yet confirmed. The team replies by email during support hours (${siteEntity.supportHours}); the published service response window is ${siteEntity.serviceResponseSummary}`,
                        n8nDispatchResult
                    ),
                    bookingRef,
                } satisfies BookingResponse,
                { status: outcome.status }
            );
        }

        console.info(`[booking] Booking request accepted: ref=${bookingRef}, type=${sanitized.bookingType}`);

        return Response.json(
            {
                success: true,
                message: appendIntakeWorkflowSyncDelayNotice(
                    `Booking request received! Reference: ${bookingRef}. Your slot is not yet confirmed. The team replies by email during support hours (${siteEntity.supportHours}); the published service response window is ${siteEntity.serviceResponseSummary}`,
                    n8nDispatchResult
                ),
                bookingRef,
            } satisfies BookingResponse,
            { status: 200 }
        );
    } catch (error) {
        console.error('[booking] Error processing booking', {
            error: summarizeErrorForOperationalLog(error),
        });
        return Response.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' } satisfies BookingResponse,
            { status: 500 }
        );
    }
}

export function GET(): Response {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}

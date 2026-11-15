/**
 * POST /api/newsletter
 * Handles newsletter subscription requests.
 * Validates input, sanitizes email, and stores/forwards to email provider.
 */

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { env } from '@/lib/env';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { newsletterSubscriptionsTable } from '@/lib/db/schema';
import { dispatchIntakeEventToN8n, type IntakeDispatchResult } from '@/lib/integrations/n8n';
import { syncAndNotifySubscriberViaNovu } from '@/lib/integrations/novu';
import { syncPersonToTwenty } from '@/lib/integrations/twenty';
import { fetchWithTimeout } from '../_shared/http';
import { appendIntakeWorkflowSyncDelayNotice } from '../_shared/intake-handoff';
import {
  buildDirectContactFallbackMessage,
  logIntakeDurabilityAlarm,
  resolveIntakeDurability,
  sendIntakeNotificationEmail,
} from '../_shared/intake-durability';
import {
  createDistributedRateLimitResponse,
  consumeDistributedRateLimit,
} from '../_shared/distributed-rate-limit';
import {
  formatMissingDatabaseConfigurationLogMessage,
  summarizeErrorForOperationalLog,
  summarizeProviderResponseBody,
} from '../_shared/log-safety';
import { consumeRateLimit, createRateLimitResponse } from '../_shared/rate-limit';
import { createSpamGateResponse, resolveSpamGate } from '../_shared/spam-gate';
import { readJsonBody, sanitizeText, validationErrorResponse } from '../_shared/validation';

interface NewsletterRequest {
    email: string;
    firstName?: string;
    source?: string; // e.g. "footer", "exit-intent", "blog"
    consentToUpdates: true;
    consentContext?: string;
}

interface NewsletterResponse {
    success: boolean;
    message: string;
}

interface ResendAudiencePayload {
    email: string;
    first_name?: string;
    unsubscribed: boolean;
}

const newsletterSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address.').max(254, 'Email address is too long.'),
    firstName: z.string().trim().max(100).optional(),
    source: z.string().trim().max(100).optional().default('unknown'),
    consentToUpdates: z.literal(true, {
        error: 'Newsletter consent is required.',
    }),
    consentContext: z.string().trim().max(100).optional().default('newsletter form'),
}) satisfies z.ZodType<NewsletterRequest>;

const NEWSLETTER_RATE_LIMIT = {
    bucket: 'newsletter',
    limit: 8,
    windowMs: 10 * 60 * 1000,
} as const;

const NEWSLETTER_AREA = 'newsletter';

export async function POST(request: Request): Promise<Response> {
    try {
        const rateLimitState = consumeRateLimit(request, NEWSLETTER_RATE_LIMIT);
        if (!rateLimitState.allowed) {
            return createRateLimitResponse(
                rateLimitState,
                'Too many newsletter requests. Please wait a few minutes and try again.'
            );
        }

        // Second layer: the limit that holds across serverless instances. Fails open.
        const distributedRateLimit = await consumeDistributedRateLimit(
            request,
            NEWSLETTER_AREA
        );
        if (!distributedRateLimit.allowed) {
            return createDistributedRateLimitResponse(
                distributedRateLimit,
                'Too many newsletter requests. Please wait a few minutes and try again.'
            );
        }

        const rawBody = await readJsonBody(request);

        // Evaluated on the raw body: the schema strips unknown keys and would discard
        // the honeypot decoy before it could be read.
        const spamGate = await resolveSpamGate({
            request,
            rawBody,
            area: NEWSLETTER_AREA,
        });
        if (spamGate.blocked) {
            return createSpamGateResponse();
        }

        const parsed = newsletterSchema.safeParse(rawBody);

        if (!parsed.success) {
            return validationErrorResponse(parsed.error);
        }

        const { email, firstName, source = 'unknown', consentContext } = parsed.data;

        const sanitizedEmail = sanitizeText(email, {
            maxLength: 254,
            context: 'email',
        });
        const sanitizedFirstName = firstName?.trim()
            ? sanitizeText(firstName, 100)
            : undefined;

        // Durability step 1: attempt the authoritative subscription row. A failure must
        // fall through to the notification fallback rather than dropping the subscriber.
        let databaseAccepted = false;

        if (!isDatabaseConfigured()) {
            console.error(formatMissingDatabaseConfigurationLogMessage(NEWSLETTER_AREA));
        } else {
            try {
                await ensureDatabaseReady();
                const db = getDb();

                const persistedAt = new Date();

                await db
                    .insert(newsletterSubscriptionsTable)
                    .values({
                        id: crypto.randomUUID(),
                        email: sanitizedEmail,
                        firstName: sanitizedFirstName,
                        source,
                        providerSynced: false,
                        updatedAt: persistedAt,
                    })
                    .onConflictDoUpdate({
                        target: newsletterSubscriptionsTable.email,
                        set: {
                            firstName: sanitizedFirstName,
                            source,
                            providerSynced: false,
                            updatedAt: persistedAt,
                        },
                    });

                databaseAccepted = true;
            } catch (error) {
                console.error('[newsletter] Database persistence failed', {
                    error: summarizeErrorForOperationalLog(error),
                    source,
                });
            }
        }

        // Durability step 2: without a row, the operator notification is the only record
        // of the subscription request.
        if (!databaseAccepted) {
            const fallbackReference = `NL-${Date.now().toString(36).toUpperCase()}`;
            const fallbackNotification = await sendIntakeNotificationEmail({
                area: NEWSLETTER_AREA,
                reference: fallbackReference,
                subject: `newsletter subscription (${source})`,
                text: [
                    `Reference: ${fallbackReference}`,
                    `Email: ${sanitizedEmail}`,
                    `First name: ${sanitizedFirstName ?? 'N/A'}`,
                    `Source: ${source}`,
                    `Consent context: ${consentContext ?? 'N/A'}`,
                    'Consent to updates: yes',
                ].join('\n'),
                replyTo: sanitizedEmail,
                isDatabaseFallback: true,
            });
            const fallbackDispatch = await dispatchIntakeEventToN8n({
                target: 'newsletter',
                eventType: 'newsletter.subscribed',
                payload: {
                    email: sanitizedEmail,
                    firstName: sanitizedFirstName,
                    providerSynced: false,
                    databaseFallback: true,
                    source,
                    consentContext,
                    consentToUpdates: true,
                },
            });
            const outcome = resolveIntakeDurability({
                persistence: fallbackNotification === 'sent' ? 'email_fallback' : 'none',
                notification: fallbackNotification,
            });

            logIntakeDurabilityAlarm({
                area: NEWSLETTER_AREA,
                reference: fallbackReference,
                persistence: outcome.persistence,
                notification: outcome.notification,
            });

            if (!outcome.accepted) {
                return Response.json(
                    {
                        success: false,
                        message: buildDirectContactFallbackMessage(),
                    } satisfies NewsletterResponse,
                    { status: outcome.status }
                );
            }

            return Response.json(
                {
                    success: true,
                    message: appendIntakeWorkflowSyncDelayNotice(
                        'Your subscription request is saved, but email delivery sync is temporarily delayed.',
                        fallbackDispatch
                    ),
                } satisfies NewsletterResponse,
                { status: outcome.status }
            );
        }

        const db = getDb();
        const resendApiKey = env.RESEND_API_KEY;
        const resendAudienceId = env.RESEND_AUDIENCE_ID;

        let providerSynced = false;

        if (resendApiKey && resendAudienceId) {
            const audiencePayload: ResendAudiencePayload = {
                email: sanitizedEmail,
                ...(sanitizedFirstName ? { first_name: sanitizedFirstName } : {}),
                unsubscribed: false,
            };

            try {
                const audienceResponse = await fetchWithTimeout(
                    `https://api.resend.com/audiences/${resendAudienceId}/contacts`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${resendApiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(audiencePayload),
                    }
                );

                if (!audienceResponse.ok && audienceResponse.status !== 409) {
                    const audienceErrorText = await audienceResponse.text();
                    console.error('[newsletter] Resend audience upsert failed', {
                        responseBody: summarizeProviderResponseBody(audienceErrorText),
                        source,
                        status: audienceResponse.status,
                    });
                } else {
                    providerSynced = true;
                }
            } catch (error) {
                console.error('[newsletter] Resend audience upsert failed', {
                    error: summarizeErrorForOperationalLog(error),
                    source,
                });
            }
        }

        const updatedAt = new Date();

        await db
            .update(newsletterSubscriptionsTable)
            .set({
                providerSynced,
                updatedAt,
            })
            .where(eq(newsletterSubscriptionsTable.email, sanitizedEmail));

        const n8nDispatchResult: IntakeDispatchResult = await dispatchIntakeEventToN8n({
            target: 'newsletter',
            eventType: 'newsletter.subscribed',
            payload: {
                email: sanitizedEmail,
                firstName: sanitizedFirstName,
                providerSynced,
                source,
                consentContext,
                consentToUpdates: true,
            },
        });

        await Promise.allSettled([
            syncPersonToTwenty({
                email: sanitizedEmail,
                firstName: sanitizedFirstName,
                source: `newsletter:${source}`,
            }),
            syncAndNotifySubscriberViaNovu({
                email: sanitizedEmail,
                firstName: sanitizedFirstName,
                source: `newsletter:${source}`,
                title: 'Newsletter subscription confirmed',
                message: `You are subscribed to Hylono updates from the ${source} flow. We will use this channel for product, protocol, and research updates.`,
                data: {
                    consentContext,
                    consentToUpdates: true,
                    providerSynced,
                    source,
                },
                payload: {
                    consentContext,
                    consentToUpdates: true,
                    providerSynced,
                    source,
                },
            }),
        ]);

        // Non-PII operational log (keep for observability until provider integration is wired)
        console.info(`[newsletter] Subscription accepted: source=${source}`);

        const responseStatus = providerSynced ? 200 : 202;
        const responseMessage = providerSynced
            ? 'You are subscribed to Hylono updates.'
            : 'Your subscription request is saved, but email delivery sync is temporarily delayed.';

        return Response.json(
            {
                success: true,
                message: appendIntakeWorkflowSyncDelayNotice(
                    responseMessage,
                    n8nDispatchResult
                ),
            } satisfies NewsletterResponse,
            { status: responseStatus }
        );
    } catch (error) {
        console.error('[newsletter] Error processing subscription', {
            error: summarizeErrorForOperationalLog(error),
        });
        return Response.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' } satisfies NewsletterResponse,
            { status: 500 }
        );
    }
}

// Reject non-POST methods
export function GET(): Response {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}

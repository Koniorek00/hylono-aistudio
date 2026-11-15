import { z } from 'zod';
import { and, eq, gte, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import {
    MOBILE_AUTH_SCOPE_RENTALS_READ,
    readBearerToken,
    verifyMobileAuthToken,
} from '@/lib/mobile-auth';
import { resolveRentalPlan } from '@/lib/commerce/rental-catalog';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { rentalApplicationsTable, type RentalContactRecord } from '@/lib/db/schema';
import { dispatchIntakeEventToN8n } from '@/lib/integrations/n8n';
import { syncAndNotifySubscriberViaNovu } from '@/lib/integrations/novu';
import { syncPersonAndFollowUpToTwenty } from '@/lib/integrations/twenty';
import {
    buildRequestFingerprint,
    recentSubmissionThreshold,
} from '../_shared/fingerprints';
import {
    createRateLimitResponse,
    consumeRateLimit,
} from '../_shared/rate-limit';
import { createSpamGateResponse, resolveSpamGate } from '../_shared/spam-gate';
import {
    createDistributedRateLimitResponse,
    consumeDistributedRateLimit,
} from '../_shared/distributed-rate-limit';
import {
    readJsonBody,
    sanitizeText,
    validationErrorResponse,
} from '../_shared/validation';
import {
    formatMissingDatabaseConfigurationLogMessage,
    summarizeErrorForOperationalLog,
} from '../_shared/log-safety';
import { appendIntakeWorkflowSyncDelayNotice } from '../_shared/intake-handoff';
import {
    buildDirectContactFallbackMessage,
    logIntakeDurabilityAlarm,
    resolveIntakeDurability,
    sendIntakeNotificationEmail,
} from '../_shared/intake-durability';
import { PRICE_BOOK_CURRENCY } from '@/lib/money';

const RENTAL_AREA = 'rental';

export interface RentalItem {
    techId: string;
    quantity: number;
    monthlyPrice: number;
}

export interface RentalContact {
    fullName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    company?: string;
}

export interface CreateRentalPayload {
    items: RentalItem[];
    userId?: string;
    fullName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    company?: string;
    termMonths?: number;
    rentalTermsAccepted: true;
    rentalIntendedUseAttested: true;
    attestedAt?: string;
}

export interface RentalResponse {
    id: string;
    userId: string;
    contact: RentalContactRecord | null;
    items: RentalItem[];
    termMonths: number;
    status: 'pending' | 'active' | 'cancelled';
    totalMonthly: number;
    createdAt: string;
}

/**
 * The Article 7 support-only attestation carried on every rental application.
 *
 * `attestedAt` is stamped by this route. `attestedAtClient` is the value the client
 * claimed, kept only so support can see clock skew, never as the record of when the
 * attestation happened.
 *
 * There is no column to write this to: `rental_applications` has only the two
 * typed jsonb columns `contact` and `items` plus scalars (see
 * `lib/db/schema.ts:169-180`), so this record rides the operator dispatch channels
 * below rather than the row. A dedicated `rental_applications.attestations` jsonb
 * column is required to make it durable; see the handoff notes.
 */
export interface RentalAttestationRecord {
    rentalTermsAccepted: true;
    rentalIntendedUseAttested: true;
    attestedAt: string;
    attestedAtClient: string | null;
}

interface RentalCreateResponse {
    success: boolean;
    message: string;
    rental?: RentalResponse;
    fieldErrors?: Record<string, string[]>;
}

interface RentalListResponse {
    success: boolean;
    message: string;
    rentals: RentalResponse[];
}

const createRentalPayloadSchema = z.object({
    items: z.array(
        z.object({
            techId: z.string().trim().min(1, 'Missing or invalid required field: items'),
            quantity: z.number().int().min(1, 'Missing or invalid required field: items'),
            monthlyPrice: z.number().nonnegative('Missing or invalid required field: items'),
        })
    ).min(1, 'Missing or invalid required field: items'),
    userId: z.string().trim().min(1).optional(),
    fullName: z.string().trim().min(2, 'Missing required field: fullName').max(120),
    email: z.string().trim().email('Missing or invalid required field: email').max(254),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().min(3, 'Missing required field: address').max(200),
    city: z.string().trim().min(2, 'Missing required field: city').max(100),
    postalCode: z.string().trim().min(2, 'Missing required field: postalCode').max(20),
    country: z.string().trim().min(2, 'Missing required field: country').max(50),
    company: z.string().trim().max(100).optional(),
    termMonths: z.number().int().min(1).max(60).optional().default(12),
    // Both gates are enforced in `src/actions/formActions.ts` and were then dropped
    // from the forwarded payload, so this route modelled neither and a direct
    // `POST /api/rental` skipped both. Required here now: the signed attestation is
    // what reserves a serial number for the application
    // (`notebooklm-docs/v2/GEMS_DISTILLED/01_SALES_OUTBOUND_PROSPECTING_GEMS.md:163`),
    // so it is commercially load-bearing, not decorative.
    rentalTermsAccepted: z.literal(true, {
        error: 'Rental program terms must be accepted.',
    }),
    rentalIntendedUseAttested: z.literal(true, {
        error: 'Intended-use attestation is required.',
    }),
    // Client-supplied and informational only. The stored record is stamped with a
    // server-generated `attestedAt`, so a caller cannot backdate or forward-date it.
    attestedAt: z.string().trim().datetime({ offset: true }).max(64).optional(),
}) satisfies z.ZodType<CreateRentalPayload>;

const RENTAL_RATE_LIMIT = {
    bucket: 'rental',
    limit: 5,
    windowMs: 10 * 60 * 1000,
} as const;

const normalizeEmail = (value: string): string =>
    sanitizeText(value, {
        maxLength: 254,
        context: 'email',
    });

const normalizeUserId = (userId: string): string => {
    const trimmed = userId.trim();

    if (isEmailLike(trimmed)) {
        return normalizeEmail(trimmed);
    }

    return sanitizeText(trimmed, {
        maxLength: 120,
        context: 'slug',
    }).toLowerCase();
};

const normalizeRentalItems = (
    items: RentalItem[],
    termMonths: number
): RentalItem[] | null => {
    const resolvedItems = items.map((item) => {
        const normalizedTechId = sanitizeText(item.techId, {
            maxLength: 80,
            context: 'slug',
        }).toLowerCase();
        const resolvedPlan = resolveRentalPlan(normalizedTechId, termMonths);

        if (!resolvedPlan) {
            return null;
        }

        return {
            techId: resolvedPlan.productId,
            quantity: item.quantity,
            monthlyPrice: Number(resolvedPlan.monthlyPrice.toFixed(2)),
        } satisfies RentalItem;
    });

    if (resolvedItems.some((item) => item === null)) {
        return null;
    }

    return resolvedItems.filter(
        (item): item is RentalItem => Boolean(item)
    );
};

const toMinorUnit = (value: number): number => Math.round(value * 100);

const fromMinorUnit = (value: number): number => Number((value / 100).toFixed(2));

const isEmailLike = (value: string): boolean =>
    z.string().email().safeParse(value).success;

const normalizeContact = (contact: RentalContact): RentalContactRecord => ({
    fullName: sanitizeText(contact.fullName, {
        maxLength: 120,
        context: 'default',
    }),
    email: normalizeEmail(contact.email),
    phone: contact.phone
        ? sanitizeText(contact.phone, {
            maxLength: 30,
            context: 'phone',
        })
        : undefined,
    address: sanitizeText(contact.address, {
        maxLength: 200,
        context: 'multiline',
    }),
    city: sanitizeText(contact.city, {
        maxLength: 100,
        context: 'default',
    }),
    postalCode: sanitizeText(contact.postalCode, {
        maxLength: 20,
        context: 'default',
    }),
    country: sanitizeText(contact.country, {
        maxLength: 50,
        context: 'default',
    }),
    company: contact.company
        ? sanitizeText(contact.company, {
            maxLength: 100,
            context: 'default',
        })
        : undefined,
});

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

async function resolveAuthenticatedRentalUserId(
    request: Request
): Promise<string> {
    const session = await auth();
    const sessionEmail = session?.user?.email
        ? normalizeUserId(session.user.email)
        : '';

    if (sessionEmail) {
        return sessionEmail;
    }

    const bearerToken = readBearerToken(request);
    if (!bearerToken) {
        return '';
    }

    const claims = verifyMobileAuthToken(bearerToken, 'access');
    if (
        !claims ||
        !claims.scope.includes(MOBILE_AUTH_SCOPE_RENTALS_READ)
    ) {
        return '';
    }

    return normalizeUserId(claims.email);
}

/**
 * POST /api/rental
 * Creates a new rental agreement record.
 */
export async function POST(request: Request): Promise<Response> {
    try {
        const rateLimitState = consumeRateLimit(request, RENTAL_RATE_LIMIT);
        if (!rateLimitState.allowed) {
            return createRateLimitResponse(
                rateLimitState,
                'Too many rental requests. Please wait a few minutes and try again.'
            );
        }

        // Second layer: the limit that holds across serverless instances. Fails open.
        const distributedRateLimit = await consumeDistributedRateLimit(
            request,
            RENTAL_AREA
        );
        if (!distributedRateLimit.allowed) {
            return createDistributedRateLimitResponse(
                distributedRateLimit,
                'Too many rental requests. Please wait a few minutes and try again.'
            );
        }

        const rawBody = await readJsonBody(request);

        // Evaluated on the raw body: the schema strips unknown keys and would discard
        // the honeypot decoy before it could be read.
        const spamGate = await resolveSpamGate({
            request,
            rawBody,
            area: RENTAL_AREA,
        });
        if (spamGate.blocked) {
            return createSpamGateResponse();
        }

        const parsed = createRentalPayloadSchema.safeParse(rawBody);

        if (!parsed.success) {
            return validationErrorResponse(parsed.error);
        }

        const {
            items,
            userId,
            fullName,
            email,
            phone,
            address,
            city,
            postalCode,
            country,
            company,
            termMonths = 12,
            rentalTermsAccepted,
            rentalIntendedUseAttested,
            attestedAt: clientAttestedAt,
        } = parsed.data;
        const normalizedContact = normalizeContact({
            fullName,
            email,
            phone,
            address,
            city,
            postalCode,
            country,
            company,
        });

        // The signed attestation record. Both flags are required literals by the
        // schema above, so reaching this line means the caller asserted them; the
        // timestamp is generated here rather than trusted from the body, so the
        // recorded moment is the server's, not the caller's.
        const attestations = {
            rentalTermsAccepted,
            rentalIntendedUseAttested,
            attestedAt: new Date().toISOString(),
            attestedAtClient: clientAttestedAt ?? null,
        } satisfies RentalAttestationRecord;

        // Attribution. This used to be `normalizeUserId(userId ?? email)`, straight
        // from the request body, and the row is persisted under that key and then
        // filtered on it by GET /api/rental (`:711`), so any caller could file a
        // rental under a victim's address and have it surface in that account's
        // listing. The session identity is authoritative instead, exactly as it
        // already is on the read path.
        const sessionUserId = await resolveAuthenticatedRentalUserId(request);
        let normalizedUserId: string;

        if (sessionUserId) {
            const requestedUserId = userId ? normalizeUserId(userId) : '';

            // Rejected rather than silently re-pointed: a request claiming to be
            // somebody else's is a client bug or an attempt to write into another
            // account, and quietly filing it under the session owner would hide both.
            if (requestedUserId && requestedUserId !== sessionUserId) {
                return Response.json(
                    {
                        success: false,
                        message: 'You are not allowed to file a rental application for another account.',
                    } satisfies RentalCreateResponse,
                    { status: 403 }
                );
            }

            normalizedUserId = sessionUserId;
        } else {
            // Unauthenticated: this is the public lead form, and it stays open. There
            // is no account to attribute to, so the lookup key is derived from the
            // contact email and the body `userId` is discarded entirely. The result is
            // an anonymous lead: the row exists, but nobody is signed in to read it
            // back until they authenticate with that same email. There is no
            // `is_anonymous_lead` column on `rental_applications` to record that fact
            // - see the handoff notes.
            normalizedUserId = normalizedContact.email;
        }

        const normalizedItems = normalizeRentalItems(items, termMonths);

        if (!normalizedItems) {
            return Response.json(
                {
                    success: false,
                    message: 'One or more rental items or term selections are invalid. Please refresh and try again.',
                } satisfies RentalCreateResponse,
                { status: 400 }
            );
        }

        const totalMonthlyAmount = normalizedItems.reduce(
            (sum, item) => sum + item.monthlyPrice * item.quantity,
            0
        );
        const rentalId = crypto.randomUUID();
        const createdAt = new Date();

        const buildRentalNotificationText = (reference: string): string =>
            [
                `Rental: ${reference}`,
                `Customer: ${normalizedContact.fullName} <${normalizedContact.email}>`,
                `Phone: ${normalizedContact.phone ?? 'N/A'}`,
                `Address: ${normalizedContact.address}`,
                `City: ${normalizedContact.city}`,
                `Postal code: ${normalizedContact.postalCode}`,
                `Country: ${normalizedContact.country}`,
                `Company: ${normalizedContact.company ?? 'N/A'}`,
                `Term months: ${termMonths}`,
                `Total monthly: ${Number(totalMonthlyAmount.toFixed(2))}`,
                `Attested at (server): ${attestations.attestedAt}`,
                `Rental terms accepted: ${attestations.rentalTermsAccepted}`,
                `Intended use attested: ${attestations.rentalIntendedUseAttested}`,
                '',
                `Items: ${normalizedItems.map((item) => `${item.techId} x${item.quantity} @ ${item.monthlyPrice}`).join(', ')}`,
            ].join('\n');

        // Durability step 1: attempt the authoritative rental application row. A failure
        // must fall through to the email fallback rather than dropping the application.
        let databaseAccepted = false;
        let duplicateRental: RentalResponse | undefined;

        if (!isDatabaseConfigured()) {
            console.error(formatMissingDatabaseConfigurationLogMessage(RENTAL_AREA));
        } else {
            try {
                await ensureDatabaseReady();
                const db = getDb();

                const submissionHash = buildRequestFingerprint({
                    contact: normalizedContact,
                    items: normalizedItems,
                    termMonths,
                    userId: normalizedUserId,
                });
                const duplicateAfter = recentSubmissionThreshold();
                const recentDuplicate = (await db
                    .select()
                    .from(rentalApplicationsTable)
                    .where(
                        and(
                            eq(rentalApplicationsTable.submissionHash, submissionHash),
                            gte(rentalApplicationsTable.createdAt, duplicateAfter)
                        )
                    ))
                    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

                if (recentDuplicate) {
                    duplicateRental = {
                        id: recentDuplicate.rentalId,
                        userId: recentDuplicate.userId,
                        contact:
                            (recentDuplicate.contact as RentalContactRecord | null) ?? null,
                        items: recentDuplicate.items,
                        termMonths: recentDuplicate.termMonths,
                        status: recentDuplicate.status as RentalResponse['status'],
                        totalMonthly: fromMinorUnit(recentDuplicate.totalMonthlyCents),
                        createdAt: recentDuplicate.createdAt.toISOString(),
                    };
                } else {
                    // `attestations` is deliberately NOT written here: every column on
                    // `rental_applications` is either a scalar or one of the two typed
                    // jsonb columns `contact` / `items`, so there is nowhere for it to
                    // go without a migration. Writing it into `contact` would corrupt a
                    // column that GET casts back to `RentalContactRecord`. It rides the
                    // n8n dispatch, the operator email and the CRM task body instead,
                    // pending an `attestations` jsonb column.
                    await db.insert(rentalApplicationsTable).values({
                        id: crypto.randomUUID(),
                        rentalId,
                        userId: normalizedUserId,
                        contact: normalizedContact,
                        items: normalizedItems,
                        termMonths,
                        status: 'pending',
                        totalMonthlyCents: toMinorUnit(totalMonthlyAmount),
                        submissionHash,
                        createdAt,
                    });
                }

                databaseAccepted = true;
            } catch (error) {
                console.error('[RentalAPI] Database persistence failed', {
                    error: summarizeErrorForOperationalLog(error),
                    reference: rentalId,
                });
            }
        }

        if (duplicateRental) {
            return Response.json(
                {
                    success: true,
                    message: `We already received this rental request. Reference: ${duplicateRental.id}.`,
                    rental: duplicateRental,
                } satisfies RentalCreateResponse,
                { status: 200 }
            );
        }

        // Durability step 2: no row means the operator notification is the only surviving
        // record of the rental application.
        if (!databaseAccepted) {
            const fallbackNotification = await sendIntakeNotificationEmail({
                area: RENTAL_AREA,
                reference: rentalId,
                subject: 'rental application',
                text: buildRentalNotificationText(rentalId),
                replyTo: normalizedContact.email,
                isDatabaseFallback: true,
            });
            const fallbackDispatch = await dispatchIntakeEventToN8n({
                target: 'rental',
                eventType: 'rental.requested',
                payload: {
                    id: rentalId,
                    databaseFallback: true,
                    userId: normalizedUserId,
                    contact: normalizedContact,
                    items: normalizedItems,
                    termMonths,
                    status: 'pending',
                    totalMonthly: Number(totalMonthlyAmount.toFixed(2)),
                    attestations,
                },
            });
            const outcome = resolveIntakeDurability({
                persistence: fallbackNotification === 'sent' ? 'email_fallback' : 'none',
                notification: fallbackNotification,
            });

            logIntakeDurabilityAlarm({
                area: RENTAL_AREA,
                reference: rentalId,
                persistence: outcome.persistence,
                notification: outcome.notification,
            });

            if (!outcome.accepted) {
                return Response.json(
                    {
                        success: false,
                        message: buildDirectContactFallbackMessage(),
                    } satisfies RentalCreateResponse,
                    { status: outcome.status }
                );
            }

            return Response.json(
                {
                    success: true,
                    message: appendIntakeWorkflowSyncDelayNotice(
                        `Rental application ${rentalId} received. Our team will contact you with next steps.`,
                        fallbackDispatch
                    ),
                } satisfies RentalCreateResponse,
                { status: outcome.status }
            );
        }

        const rental: RentalResponse = {
            id: rentalId,
            userId: normalizedUserId,
            contact: normalizedContact,
            items: normalizedItems,
            termMonths,
            status: 'pending',
            totalMonthly: Number(totalMonthlyAmount.toFixed(2)),
            createdAt: createdAt.toISOString(),
        };

        const emailBackedRental = isEmailLike(normalizedContact.email);
        const estimatedContractValueCents = toMinorUnit(totalMonthlyAmount) * termMonths;

        const n8nDispatchResult = await dispatchIntakeEventToN8n({
            target: 'rental',
            eventType: 'rental.requested',
            // The operator event is the durable home of the attestation record today.
            // `rental_applications` has no column for it (see
            // `RentalAttestationRecord`), so without this the signed attestation would
            // exist for exactly as long as the request did.
            payload: { ...rental, attestations },
        });

        await Promise.allSettled([
            emailBackedRental
                ? syncPersonAndFollowUpToTwenty({
                    email: normalizedContact.email,
                    fullName: normalizedContact.fullName,
                    phone: normalizedContact.phone,
                    city: normalizedContact.city,
                    companyName: normalizedContact.company ?? inferCompanyNameFromEmail(normalizedContact.email),
                    source: 'rental:pending',
                    taskTitle: `Rental follow-up ${rental.id}`,
                    taskBodyText: [
                        `Rental: ${rental.id}`,
                        `Customer: ${normalizedContact.fullName}`,
                        `Email: ${normalizedContact.email}`,
                        `Phone: ${normalizedContact.phone ?? 'N/A'}`,
                        `Address: ${normalizedContact.address}`,
                        `City: ${normalizedContact.city}`,
                        `Postal code: ${normalizedContact.postalCode}`,
                        `Country: ${normalizedContact.country}`,
                        `Company: ${normalizedContact.company ?? 'N/A'}`,
                        `Status: ${rental.status}`,
                        `Term months: ${rental.termMonths}`,
                        `Total monthly: ${rental.totalMonthly}`,
                        `Estimated contract value: ${fromMinorUnit(estimatedContractValueCents)}`,
                        `Rental terms accepted: ${attestations.rentalTermsAccepted}`,
                        `Intended use attested: ${attestations.rentalIntendedUseAttested}`,
                        `Attested at (server): ${attestations.attestedAt}`,
                        '',
                        `Items: ${rental.items.map((item) => `${item.techId} x${item.quantity} @ ${item.monthlyPrice}`).join(', ')}`,
                        '',
                        `Lookup key: ${normalizedUserId}`,
                    ].join('\n'),
                    opportunity: {
                        name: `Rental request ${rental.id}`,
                        amountMicros: estimatedContractValueCents * 10000,
                        // Was the literal 'EUR' while the amount derives from a
                        // price book denominated in PLN — so every rental request
                        // booked CRM pipeline value at roughly four times its real
                        // size, permanently, in the sales record. The checkout route
                        // already books 'PLN' and charges Stripe 'pln' from the same
                        // price book, so this was an internal contradiction rather
                        // than a deliberate second currency.
                        currencyCode: PRICE_BOOK_CURRENCY,
                        stage: 'NEW',
                    },
                })
                : Promise.resolve(),
            emailBackedRental
                ? syncAndNotifySubscriberViaNovu({
                    email: normalizedContact.email,
                    fullName: normalizedContact.fullName,
                    phone: normalizedContact.phone,
                    source: 'rental:pending',
                    title: 'Rental request received',
                    message: `Your rental request ${rental.id} is recorded and awaiting operator review.`,
                    data: {
                        rentalId: rental.id,
                        fullName: normalizedContact.fullName,
                        email: normalizedContact.email,
                        phone: normalizedContact.phone ?? null,
                        address: normalizedContact.address,
                        city: normalizedContact.city,
                        postalCode: normalizedContact.postalCode,
                        country: normalizedContact.country,
                        company: normalizedContact.company ?? null,
                        status: rental.status,
                        termMonths: rental.termMonths,
                        totalMonthly: rental.totalMonthly,
                        items: rental.items,
                    },
                    payload: {
                        rentalId: rental.id,
                        fullName: normalizedContact.fullName,
                        email: normalizedContact.email,
                        city: normalizedContact.city,
                        country: normalizedContact.country,
                        status: rental.status,
                        termMonths: rental.termMonths,
                        totalMonthly: rental.totalMonthly,
                    },
                })
                : Promise.resolve(),
        ]);

        return Response.json(
            {
                success: true,
                message: appendIntakeWorkflowSyncDelayNotice(
                    `Rental application ${rental.id} received. Our team will contact you with next steps.`,
                    n8nDispatchResult
                ),
                rental,
            } satisfies RentalCreateResponse,
            { status: 201 }
        );
    } catch (error) {
        console.error('[RentalAPI] Error creating rental', {
            error: summarizeErrorForOperationalLog(error),
        });
        return Response.json(
            {
                success: false,
                message: 'An unexpected error occurred while creating the rental application.',
            } satisfies RentalCreateResponse,
            { status: 500 }
        );
    }
}

/**
 * GET /api/rental?userId=<id>
 * Fetches all non-cancelled rentals currently stored for a user.
 */
export async function GET(request: Request): Promise<Response> {
    try {
        const sessionEmail = await resolveAuthenticatedRentalUserId(request);

        if (!sessionEmail) {
            return Response.json(
                {
                    success: false,
                    message: 'Authentication required.',
                    rentals: [],
                } satisfies RentalListResponse,
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const rawUserId =
            url.searchParams.get('userId') ?? url.searchParams.get('email');
        const userId = rawUserId ? normalizeUserId(rawUserId) : sessionEmail;

        if (!isDatabaseConfigured()) {
            return Response.json(
                {
                    success: false,
                    message: 'Rental channel is temporarily unavailable. Please try again shortly.',
                    rentals: [],
                } satisfies RentalListResponse,
                { status: 503 }
            );
        }

        if (userId !== sessionEmail) {
            return Response.json(
                {
                    success: false,
                    message: 'You are not allowed to access rental records for another account.',
                    rentals: [],
                } satisfies RentalListResponse,
                { status: 403 }
            );
        }

        await ensureDatabaseReady();
        const db = getDb();
        const persistedRentals = await db
            .select()
            .from(rentalApplicationsTable)
            .where(
                and(
                    eq(rentalApplicationsTable.userId, userId),
                    ne(rentalApplicationsTable.status, 'cancelled')
                )
            );

        const rentals = persistedRentals
            .map((rental) => ({
                id: rental.rentalId,
                userId: rental.userId,
                contact: (rental.contact as RentalContactRecord | null) ?? null,
                items: rental.items,
                termMonths: rental.termMonths,
                status: rental.status as RentalResponse['status'],
                totalMonthly: fromMinorUnit(rental.totalMonthlyCents),
                createdAt: rental.createdAt.toISOString(),
            }))
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

        return Response.json(
            {
                success: true,
                message: 'Rental applications retrieved successfully.',
                rentals,
            } satisfies RentalListResponse,
            { status: 200 }
        );
    } catch (error) {
        console.error('[RentalAPI] Error fetching rentals', {
            error: summarizeErrorForOperationalLog(error),
        });
        return Response.json(
            {
                success: false,
                message: 'An unexpected error occurred while fetching rentals.',
                rentals: [],
            } satisfies RentalListResponse,
            { status: 500 }
        );
    }
}

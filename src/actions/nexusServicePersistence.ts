'use server';

import { randomUUID } from 'node:crypto';
import { and, desc, eq, or } from 'drizzle-orm';
import type { NexusServiceActionInput } from '@/content/nexus-service-persistence-contract';
import {
  NEXUS_SERVICE_MANUAL_LIBRARY,
  NEXUS_SERVICE_PART_LINES,
  type NexusServiceManualExtractionQueueItem,
  type NexusServiceManualLinkHistoryItem,
  type NexusServiceNote,
  type NexusServiceOwnerManualReference,
  type NexusServiceOwnerReportHistoryItem,
  type NexusServicePartsDraftHistoryItem,
  type NexusServiceTodo,
} from '@/content/nexus-service-operations';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import {
  nexusServiceManualExtractionQueueTable,
  nexusServiceManualDocumentLinksTable,
  nexusServiceNotesTable,
  nexusServicePartsDraftsTable,
  nexusServiceProfilesTable,
  nexusServiceReportsTable,
  nexusServiceTodosTable,
} from '@/lib/db/schema';
import {
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusServicePersistenceWriteResult =
  | {
      persisted: true;
      recordId: string;
    }
  | {
      persisted: false;
      reason:
        | 'database_not_configured'
        | 'database_error'
        | 'auth_context_missing'
        | 'service_profile_required'
        | 'scope_not_allowed'
        | 'unsupported_action';
    };

export type NexusServicePersistedBaseListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing';

export type NexusServicePersistedRoleRestrictedListStatus =
  | NexusServicePersistedBaseListStatus
  | 'role_not_allowed';

export type NexusServicePersistedNoteListStatus =
  | NexusServicePersistedBaseListStatus
  | 'service_profile_required';

export interface NexusServicePersistedNoteListResult {
  status: NexusServicePersistedNoteListStatus;
  notes: NexusServiceNote[];
}

export type NexusServicePersistedTodoListStatus =
  | NexusServicePersistedBaseListStatus
  | 'service_profile_required';

export interface NexusServicePersistedTodoListResult {
  status: NexusServicePersistedTodoListStatus;
  todos: NexusServiceTodo[];
}

export type NexusServicePersistedPartsDraftListStatus =
  | NexusServicePersistedRoleRestrictedListStatus
  | 'service_profile_required';

export interface NexusServicePersistedPartsDraftListResult {
  status: NexusServicePersistedPartsDraftListStatus;
  partsDrafts: NexusServicePartsDraftHistoryItem[];
}

export type NexusServicePersistedManualLinkListStatus =
  NexusServicePersistedRoleRestrictedListStatus;

export interface NexusServicePersistedManualLinkListResult {
  status: NexusServicePersistedManualLinkListStatus;
  manualLinks: NexusServiceManualLinkHistoryItem[];
}

export type NexusServicePersistedManualExtractionQueueListStatus =
  | NexusServicePersistedRoleRestrictedListStatus
  | 'service_profile_required';

export interface NexusServicePersistedManualExtractionQueueListResult {
  status: NexusServicePersistedManualExtractionQueueListStatus;
  extractionQueue: NexusServiceManualExtractionQueueItem[];
}

export type NexusServicePersistedOwnerReportListStatus =
  NexusServicePersistedRoleRestrictedListStatus
  | 'service_profile_required';

export interface NexusServicePersistedOwnerReportListResult {
  status: NexusServicePersistedOwnerReportListStatus;
  ownerReports: NexusServiceOwnerReportHistoryItem[];
}

type NexusServicePartsDraftInput = Extract<
  NexusServiceActionInput,
  { actionId: 'parts.draft.create' }
>;

type NexusServiceManualExtractionQueueInput = Extract<
  NexusServiceActionInput,
  { actionId: 'manual.extraction.queue' }
>;

type NexusServiceManualExtractionReviewInput = Extract<
  NexusServiceActionInput,
  { actionId: 'manual.extraction.review' }
>;

type NexusServiceOwnerReportInput = Extract<
  NexusServiceActionInput,
  { actionId: 'report.publishOwner' }
>;

type NexusServiceOwnerReportStatusInput = Extract<
  NexusServiceActionInput,
  { actionId: 'report.publishOwnerStatus' }
>;

type NexusServiceOwnerDeviceScopeInput = Extract<
  NexusServiceActionInput,
  { actionId: 'profile.ownerDeviceScope.assign' }
>;

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const NOTE_SCOPE_LABELS: Record<
  'owner-visible' | 'technician-only' | 'company',
  NexusServiceNote['target']
> = {
  'owner-visible': 'Owner',
  'technician-only': 'Technician',
  company: 'Company',
};

const PART_PRICE_CENTS_BY_SKU = new Map(
  NEXUS_SERVICE_PART_LINES.map((part) => [part.sku, Math.round(part.unitPrice * 100)])
);

const MANUAL_LIBRARY_BY_ID = new Map(
  NEXUS_SERVICE_MANUAL_LIBRARY.map((manual) => [manual.id, manual])
);

const PARTS_DRAFT_STATUS_LABELS: Record<
  'review-draft' | 'manager-review' | 'approved' | 'cancelled',
  NexusServicePartsDraftHistoryItem['status']
> = {
  'review-draft': 'Review draft',
  'manager-review': 'Manager review',
  approved: 'Approved',
  cancelled: 'Cancelled',
};

const MANUAL_LINK_STATUS_LABELS: Record<
  'linked' | 'review-needed',
  NexusServiceManualLinkHistoryItem['reviewStatus']
> = {
  linked: 'Linked',
  'review-needed': 'Review needed',
};

const MANUAL_EXTRACTION_STATUS_LABELS: Record<
  'queued' | 'in-review' | 'owner-safe-draft' | 'blocked',
  NexusServiceManualExtractionQueueItem['reviewStatus']
> = {
  queued: 'Queued',
  'in-review': 'In review',
  'owner-safe-draft': 'Owner-safe draft',
  blocked: 'Blocked',
};

const OWNER_REPORT_STATUS_LABELS: Record<
  'draft-review' | 'owner-ready' | 'published' | 'cancelled',
  NexusServiceOwnerReportHistoryItem['finalStatus']
> = {
  'draft-review': 'Draft review',
  'owner-ready': 'Owner-ready',
  published: 'Published',
  cancelled: 'Cancelled',
};

const formatPersistedNoteTime = (createdAt: Date | string | null): string => {
  if (!createdAt) {
    return 'Saved in private storage';
  }

  const parsed = createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return 'Saved in private storage';
  }

  return `Saved ${parsed.toISOString().slice(0, 16).replace('T', ' ')}`;
};

type NexusServiceResolvedAuthContext = NonNullable<
  ReturnType<typeof resolveNexusServiceAuthContextForSession>
>;

const getNexusServiceTodoReadPolicy = (
  authContext: NexusServiceResolvedAuthContext
) => {
  const organizationFilter = eq(
    nexusServiceTodosTable.organizationId,
    authContext.organizationId
  );

  if (authContext.role === 'OWNER') {
    return {
      canRead: true as const,
      filter: and(organizationFilter, eq(nexusServiceTodosTable.scope, 'Owner')),
    };
  }

  if (authContext.role === 'TECHNICIAN') {
    if (!authContext.personId) {
      return {
        canRead: false as const,
        status: 'service_profile_required' as const,
      };
    }

    return {
      canRead: true as const,
      filter: and(
        organizationFilter,
        eq(nexusServiceTodosTable.assigneePersonId, authContext.personId)
      ),
    };
  }

  return {
    canRead: true as const,
    filter: organizationFilter,
  };
};

const getNexusServicePartsDraftReadPolicy = (
  authContext: NexusServiceResolvedAuthContext
) => {
  if (authContext.role === 'OWNER') {
    return {
      canRead: false as const,
      status: 'role_not_allowed' as const,
    };
  }

  if (authContext.role === 'TECHNICIAN') {
    if (!authContext.personId) {
      return {
        canRead: false as const,
        status: 'service_profile_required' as const,
      };
    }

    return {
      canRead: true as const,
      authorPersonId: authContext.personId,
    };
  }

  return {
    canRead: true as const,
  };
};

const getNexusServiceManualExtractionQueueReadPolicy =
  getNexusServicePartsDraftReadPolicy;

const normalizePartsDraftLines = (lines: NexusServicePartsDraftInput['lines']) =>
  lines.map((line) => ({
    partNumber: line.partNumber,
    ...(line.label ? { label: line.label } : {}),
    quantity: Math.max(1, Math.trunc(line.quantity)),
    ...(line.reason ? { reason: line.reason } : {}),
  }));

const calculatePartsDraftTotalCents = (
  lines: ReturnType<typeof normalizePartsDraftLines>
): number =>
  lines.reduce(
    (total, line) =>
      total + (PART_PRICE_CENTS_BY_SKU.get(line.partNumber) ?? 0) * line.quantity,
    0
  );

const normalizeOwnerReportChecklistCount = (
  input: NexusServiceOwnerReportInput
): number => Math.max(0, Math.trunc(input.checklistCount ?? 0));

const getManualReviewStatus = (
  manual: (typeof NEXUS_SERVICE_MANUAL_LIBRARY)[number] | undefined
): 'linked' | 'review-needed' =>
  manual?.status === 'Ready' ? 'linked' : 'review-needed';

const isManualExtractionQueueable = (
  manual: (typeof NEXUS_SERVICE_MANUAL_LIBRARY)[number] | undefined
): manual is (typeof NEXUS_SERVICE_MANUAL_LIBRARY)[number] =>
  manual?.status === 'Needs extraction' && manual.visibility === 'Owner-safe';

const normalizeManualExtractionChecklist = (
  checklist: NexusServiceManualExtractionQueueInput['extractionChecklist']
) =>
  checklist
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((label) => ({ label }));

const buildManualDocumentMetadata = (
  manual: (typeof NEXUS_SERVICE_MANUAL_LIBRARY)[number] | undefined
) =>
  manual
    ? {
        packetKind: manual.packetKind,
        visibility: manual.visibility,
        sourceRef: manual.sourceRef,
        ownerReportLabel: manual.ownerReportLabel,
        ownerReportEligible: manual.ownerReportEligible,
      }
    : null;

const buildOwnerManualReferenceKey = (
  reference: Pick<
    NexusServiceOwnerManualReference,
    'targetType' | 'targetId' | 'documentId' | 'documentVersion'
  >
): string =>
  [
    reference.targetType,
    reference.targetId,
    reference.documentId,
    reference.documentVersion,
  ].join(':');

interface NormalizeOwnerReportManualReferenceOptions {
  approvedExtractionReferenceKeys?: ReadonlySet<string>;
  trustStoredApprovedExtractions?: boolean;
}

const normalizeOwnerReportManualReferences = (
  references: NexusServiceOwnerReportInput['manualReferences'] = [],
  options: NormalizeOwnerReportManualReferenceOptions = {}
): NexusServiceOwnerManualReference[] =>
  references
    .map((reference) => {
      const manual = MANUAL_LIBRARY_BY_ID.get(reference.documentId);
      const referenceKey = buildOwnerManualReferenceKey(reference);
      const approvedExtractionReference =
        isManualExtractionQueueable(manual) &&
        (options.approvedExtractionReferenceKeys?.has(referenceKey) ||
          (options.trustStoredApprovedExtractions &&
            reference.reviewStatus === 'Linked'));

      if (
        !manual ||
        reference.documentVersion !== manual.documentVersion ||
        manual.visibility === 'Manager-only' ||
        (!manual.ownerReportEligible && !approvedExtractionReference)
      ) {
        return null;
      }

      return {
        targetType: reference.targetType,
        targetId: reference.targetId,
        documentId: manual.id,
        documentTitle: manual.title,
        documentVersion: manual.documentVersion,
        ownerReportLabel: manual.ownerReportLabel,
        reviewStatus: (manual.status === 'Ready' || approvedExtractionReference
          ? 'Linked'
          : 'Review needed') as NexusServiceOwnerManualReference['reviewStatus'],
      };
    })
    .filter((reference): reference is NonNullable<typeof reference> => Boolean(reference));

const filterOwnerSafeManualReferences = (
  references: NexusServiceOwnerReportInput['manualReferences'] | null | undefined
) =>
  normalizeOwnerReportManualReferences(references ?? [], {
    trustStoredApprovedExtractions: true,
  });

const normalizeOwnerDeviceScope = (deviceIds: readonly string[] | undefined): string[] =>
  Array.from(
    new Set(
      (deviceIds ?? [])
        .map((deviceId) => deviceId.trim())
        .filter(Boolean)
    )
  );

const normalizeOwnerDeviceScopeForWrite = (
  deviceIds: readonly string[] | undefined
): string[] => normalizeOwnerDeviceScope(deviceIds).slice(0, 30);

const buildOwnerDeviceScopeCondition = (deviceIds: readonly string[]) => {
  const [firstDeviceId, ...remainingDeviceIds] = deviceIds;

  if (!firstDeviceId) return undefined;

  if (remainingDeviceIds.length === 0) {
    return eq(nexusServiceReportsTable.deviceId, firstDeviceId);
  }

  return or(
    eq(nexusServiceReportsTable.deviceId, firstDeviceId),
    ...remainingDeviceIds.map((deviceId) => eq(nexusServiceReportsTable.deviceId, deviceId))
  );
};

const listApprovedExtractionReferenceKeysForOwnerReport = async (
  organizationId: string,
  input: NexusServiceOwnerReportInput
): Promise<ReadonlySet<string>> => {
  const candidateKeys = new Set(
    (input.manualReferences ?? [])
      .filter((reference) =>
        isManualExtractionQueueable(MANUAL_LIBRARY_BY_ID.get(reference.documentId))
      )
      .map(buildOwnerManualReferenceKey)
  );

  if (candidateKeys.size === 0) {
    return new Set<string>();
  }

  const rows = await getDb()
    .select({
      deviceId: nexusServiceManualExtractionQueueTable.deviceId,
      targetType: nexusServiceManualExtractionQueueTable.targetType,
      targetId: nexusServiceManualExtractionQueueTable.targetId,
      documentId: nexusServiceManualExtractionQueueTable.documentId,
      documentVersion: nexusServiceManualExtractionQueueTable.documentVersion,
      visibility: nexusServiceManualExtractionQueueTable.visibility,
      ownerReportLabel: nexusServiceManualExtractionQueueTable.ownerReportLabel,
      reviewStatus: nexusServiceManualExtractionQueueTable.reviewStatus,
    })
    .from(nexusServiceManualExtractionQueueTable)
    .where(
      and(
        eq(nexusServiceManualExtractionQueueTable.organizationId, organizationId),
        eq(nexusServiceManualExtractionQueueTable.reviewStatus, 'owner-safe-draft')
      )
    )
    .orderBy(desc(nexusServiceManualExtractionQueueTable.updatedAt))
    .limit(50);

  return new Set(
    rows
      .filter((row) => {
        const manual = MANUAL_LIBRARY_BY_ID.get(row.documentId);
        const key = buildOwnerManualReferenceKey(row);

        return (
          row.deviceId === input.deviceId &&
          (!input.visitId || row.targetType !== 'visit' || row.targetId === input.visitId) &&
          row.reviewStatus === 'owner-safe-draft' &&
          row.visibility === 'Owner-safe' &&
          Boolean(row.ownerReportLabel) &&
          isManualExtractionQueueable(manual) &&
          row.documentVersion === manual.documentVersion &&
          candidateKeys.has(key)
        );
      })
      .map(buildOwnerManualReferenceKey)
  );
};

export const persistNexusServiceNote = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'note.create') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role === 'OWNER' && input.scope !== 'owner-visible') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (authContext.role === 'TECHNICIAN' && !authContext.personId) {
    return {
      persisted: false,
      reason: 'service_profile_required',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const recordId = randomUUID();
    await getDb().insert(nexusServiceNotesTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      deviceId: input.deviceId,
      visitId: input.visitId ?? null,
      scope: input.scope,
      body: input.body,
      authorUserId: authContext.userId,
      authorPersonId: authContext.personId ?? null,
      authorEmail,
    });

    return {
      persisted: true,
      recordId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const persistNexusServiceTodo = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'todo.assign') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role !== 'SERVICE_MANAGER' && authContext.role !== 'OPERATIONS_ADMIN') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const recordId = randomUUID();
    await getDb().insert(nexusServiceTodosTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      deviceId: input.deviceId,
      title: input.title,
      scope: input.scope ?? 'Company',
      assigneePersonId: input.assigneePersonId ?? null,
      dueDate: input.dueDate ?? null,
      priority: input.priority ?? 'Medium',
      status: input.status ?? 'open',
      authorUserId: authContext.userId,
      authorPersonId: authContext.personId ?? null,
      authorEmail,
    });

    return {
      persisted: true,
      recordId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const persistNexusServiceOwnerDeviceScopeAssignment = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'profile.ownerDeviceScope.assign') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const assignment = input as NexusServiceOwnerDeviceScopeInput;
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role !== 'SERVICE_MANAGER' && authContext.role !== 'OPERATIONS_ADMIN') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  const ownerDeviceIds = normalizeOwnerDeviceScopeForWrite(assignment.ownerDeviceIds);

  if (ownerDeviceIds.length === 0) {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const updatedRows = await getDb()
      .update(nexusServiceProfilesTable)
      .set({
        ownerDeviceIds,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(nexusServiceProfilesTable.organizationId, authContext.organizationId),
          eq(nexusServiceProfilesTable.id, assignment.ownerProfileId),
          eq(nexusServiceProfilesTable.role, 'OWNER'),
          eq(nexusServiceProfilesTable.status, 'active')
        )
      )
      .returning();

    if (updatedRows.length === 0) {
      return {
        persisted: false,
        reason: 'scope_not_allowed',
      };
    }

    return {
      persisted: true,
      recordId: assignment.ownerProfileId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const persistNexusServicePartsDraft = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'parts.draft.create') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role === 'OWNER') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (authContext.role === 'TECHNICIAN' && !authContext.personId) {
    return {
      persisted: false,
      reason: 'service_profile_required',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const recordId = randomUUID();
    const lines = normalizePartsDraftLines(input.lines);
    await getDb().insert(nexusServicePartsDraftsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      deviceId: input.deviceId,
      visitId: input.visitId ?? null,
      status: 'review-draft',
      lines,
      lineCount: lines.length,
      quantityTotal: lines.reduce((total, line) => total + line.quantity, 0),
      totalCents: calculatePartsDraftTotalCents(lines),
      authorUserId: authContext.userId,
      authorPersonId: authContext.personId ?? null,
      authorEmail,
    });

    return {
      persisted: true,
      recordId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const persistNexusServiceManualDocumentLink = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'manual.link') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role !== 'SERVICE_MANAGER' && authContext.role !== 'OPERATIONS_ADMIN') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  const manual = MANUAL_LIBRARY_BY_ID.get(input.documentId);
  if (!manual || manual.documentVersion !== input.documentVersion) {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const recordId = randomUUID();
    await getDb().insert(nexusServiceManualDocumentLinksTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      deviceId: input.deviceId,
      targetType: input.targetType,
      targetId: input.targetId,
      targetLabel: input.targetLabel ?? null,
      documentId: manual.id,
      documentTitle: manual.title,
      documentSource: manual.source,
      documentVersion: manual.documentVersion,
      documentMetadata: buildManualDocumentMetadata(manual),
      reviewStatus: getManualReviewStatus(manual),
      authorUserId: authContext.userId,
      authorPersonId: authContext.personId ?? null,
      authorEmail,
    });

    return {
      persisted: true,
      recordId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const persistNexusServiceManualExtractionQueue = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'manual.extraction.queue') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role === 'OWNER') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (authContext.role === 'TECHNICIAN' && !authContext.personId) {
    return {
      persisted: false,
      reason: 'service_profile_required',
    };
  }

  const manual = MANUAL_LIBRARY_BY_ID.get(input.documentId);
  if (!isManualExtractionQueueable(manual)) {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const checklist = normalizeManualExtractionChecklist(input.extractionChecklist);
    const recordId = randomUUID();
    await getDb().insert(nexusServiceManualExtractionQueueTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      deviceId: input.deviceId,
      targetType: input.targetType,
      targetId: input.targetId,
      targetLabel: input.targetLabel ?? null,
      documentId: manual.id,
      documentTitle: manual.title,
      documentVersion: manual.documentVersion,
      sourceRef: manual.sourceRef,
      packetKind: manual.packetKind,
      visibility: manual.visibility,
      ownerReportLabel: manual.ownerReportLabel,
      requestedOutcome: input.requestedOutcome.trim(),
      extractionChecklist: checklist,
      checklistCount: checklist.length,
      reviewStatus: 'queued',
      authorUserId: authContext.userId,
      authorPersonId: authContext.personId ?? null,
      authorEmail,
    });

    return {
      persisted: true,
      recordId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const persistNexusServiceManualExtractionReview = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'manual.extraction.review') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const reviewInput = input as NexusServiceManualExtractionReviewInput;
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role !== 'SERVICE_MANAGER' && authContext.role !== 'OPERATIONS_ADMIN') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  const manual = MANUAL_LIBRARY_BY_ID.get(reviewInput.documentId);
  if (!isManualExtractionQueueable(manual)) {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const updatedRows = await getDb()
      .update(nexusServiceManualExtractionQueueTable)
      .set({
        reviewStatus: reviewInput.reviewStatus,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(nexusServiceManualExtractionQueueTable.organizationId, authContext.organizationId),
          eq(nexusServiceManualExtractionQueueTable.id, reviewInput.queueId),
          eq(nexusServiceManualExtractionQueueTable.documentId, manual.id),
          eq(nexusServiceManualExtractionQueueTable.reviewStatus, 'queued')
        )
      )
      .returning();

    if (updatedRows.length === 0) {
      return {
        persisted: false,
        reason: 'scope_not_allowed',
      };
    }

    return {
      persisted: true,
      recordId: reviewInput.queueId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const persistNexusServiceOwnerReport = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'report.publishOwner') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role !== 'SERVICE_MANAGER' && authContext.role !== 'OPERATIONS_ADMIN') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const recordId = randomUUID();
    const ownerSummary = input.ownerSummary.trim();
    const approvedExtractionReferenceKeys =
      await listApprovedExtractionReferenceKeysForOwnerReport(
        authContext.organizationId,
        input
      );
    const manualReferences = normalizeOwnerReportManualReferences(
      input.manualReferences,
      { approvedExtractionReferenceKeys }
    );
    await getDb().insert(nexusServiceReportsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      deviceId: input.deviceId,
      visitId: input.visitId ?? null,
      reportId: input.reportId,
      reportNumber: input.reportId.toUpperCase(),
      finalStatus: input.finalStatus ?? 'owner-ready',
      ownerSummary,
      ownerSummaryLength: ownerSummary.length,
      checklistCount: normalizeOwnerReportChecklistCount(input),
      manualReferences,
      authorUserId: authContext.userId,
      authorPersonId: authContext.personId ?? null,
      authorEmail,
    });

    return {
      persisted: true,
      recordId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const persistNexusServiceOwnerReportStatusTransition = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): Promise<NexusServicePersistenceWriteResult> => {
  if (input.actionId !== 'report.publishOwnerStatus') {
    return {
      persisted: false,
      reason: 'unsupported_action',
    };
  }

  const transition = input as NexusServiceOwnerReportStatusInput;
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (authContext.role !== 'SERVICE_MANAGER' && authContext.role !== 'OPERATIONS_ADMIN') {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const updatedRows = await getDb()
      .update(nexusServiceReportsTable)
      .set({
        finalStatus: transition.finalStatus,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(nexusServiceReportsTable.organizationId, authContext.organizationId),
          eq(nexusServiceReportsTable.reportId, transition.reportId),
          eq(nexusServiceReportsTable.finalStatus, 'owner-ready')
        )
      )
      .returning();

    if (updatedRows.length === 0) {
      return {
        persisted: false,
        reason: 'scope_not_allowed',
      };
    }

    return {
      persisted: true,
      recordId: transition.reportId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const listNexusServiceNotesForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 20
): Promise<NexusServicePersistedNoteListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      notes: [],
    };
  }

  if (authContext.role === 'TECHNICIAN' && !authContext.personId) {
    return {
      status: 'service_profile_required',
      notes: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      notes: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 50);
    const noteVisibilityFilter =
      profile?.role === 'OWNER'
        ? and(
            eq(nexusServiceNotesTable.organizationId, authContext.organizationId),
            eq(nexusServiceNotesTable.scope, 'owner-visible')
          )
        : eq(nexusServiceNotesTable.organizationId, authContext.organizationId);
    const rows = await getDb()
      .select({
        id: nexusServiceNotesTable.id,
        scope: nexusServiceNotesTable.scope,
        body: nexusServiceNotesTable.body,
        authorPersonId: nexusServiceNotesTable.authorPersonId,
        authorEmail: nexusServiceNotesTable.authorEmail,
        createdAt: nexusServiceNotesTable.createdAt,
      })
      .from(nexusServiceNotesTable)
      .where(noteVisibilityFilter)
      .orderBy(desc(nexusServiceNotesTable.createdAt))
      .limit(boundedLimit);
    const visibleRows =
      authContext.role === 'OWNER'
        ? rows.filter((row) => row.scope === 'owner-visible')
        : rows;

    return {
      status: 'loaded',
      notes: visibleRows.map((row) => ({
        id: row.id,
        author: row.authorPersonId || row.authorEmail,
        target: NOTE_SCOPE_LABELS[row.scope] ?? 'Company',
        body: row.body,
        time: formatPersistedNoteTime(row.createdAt),
        source: 'authenticated',
      })),
    };
  } catch {
    return {
      status: 'database_error',
      notes: [],
    };
  }
};

export const listNexusServicePartsDraftsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusServicePersistedPartsDraftListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      partsDrafts: [],
    };
  }

  const partsDraftReadPolicy = getNexusServicePartsDraftReadPolicy(authContext);

  if (!partsDraftReadPolicy.canRead) {
    return {
      status: partsDraftReadPolicy.status,
      partsDrafts: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      partsDrafts: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 25);
    const baseFilter = eq(
      nexusServicePartsDraftsTable.organizationId,
      authContext.organizationId
    );
    const partsDraftVisibilityFilter = partsDraftReadPolicy.authorPersonId
      ? and(
          baseFilter,
          eq(
            nexusServicePartsDraftsTable.authorPersonId,
            partsDraftReadPolicy.authorPersonId
          )
        )
      : baseFilter;
    const rows = await getDb()
      .select({
        id: nexusServicePartsDraftsTable.id,
        deviceId: nexusServicePartsDraftsTable.deviceId,
        visitId: nexusServicePartsDraftsTable.visitId,
        status: nexusServicePartsDraftsTable.status,
        lineCount: nexusServicePartsDraftsTable.lineCount,
        quantityTotal: nexusServicePartsDraftsTable.quantityTotal,
        totalCents: nexusServicePartsDraftsTable.totalCents,
        authorPersonId: nexusServicePartsDraftsTable.authorPersonId,
        authorEmail: nexusServicePartsDraftsTable.authorEmail,
        createdAt: nexusServicePartsDraftsTable.createdAt,
      })
      .from(nexusServicePartsDraftsTable)
      .where(partsDraftVisibilityFilter)
      .orderBy(desc(nexusServicePartsDraftsTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      partsDrafts: rows.map((row) => ({
        id: row.id,
        deviceId: row.deviceId,
        visitId: row.visitId ?? undefined,
        createdBy: row.authorPersonId || row.authorEmail,
        status: PARTS_DRAFT_STATUS_LABELS[row.status] ?? 'Review draft',
        lineCount: row.lineCount,
        quantityTotal: row.quantityTotal,
        totalValue: row.totalCents / 100,
        submittedAt: formatPersistedNoteTime(row.createdAt),
        source: 'authenticated',
      })),
    };
  } catch {
    return {
      status: 'database_error',
      partsDrafts: [],
    };
  }
};

export const listNexusServiceManualDocumentLinksForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusServicePersistedManualLinkListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      manualLinks: [],
    };
  }

  if (authContext.role !== 'SERVICE_MANAGER' && authContext.role !== 'OPERATIONS_ADMIN') {
    return {
      status: 'role_not_allowed',
      manualLinks: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      manualLinks: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 25);
    const rows = await getDb()
      .select({
        id: nexusServiceManualDocumentLinksTable.id,
        deviceId: nexusServiceManualDocumentLinksTable.deviceId,
        targetType: nexusServiceManualDocumentLinksTable.targetType,
        targetId: nexusServiceManualDocumentLinksTable.targetId,
        targetLabel: nexusServiceManualDocumentLinksTable.targetLabel,
        documentId: nexusServiceManualDocumentLinksTable.documentId,
        documentTitle: nexusServiceManualDocumentLinksTable.documentTitle,
        documentSource: nexusServiceManualDocumentLinksTable.documentSource,
        documentVersion: nexusServiceManualDocumentLinksTable.documentVersion,
        documentMetadata: nexusServiceManualDocumentLinksTable.documentMetadata,
        reviewStatus: nexusServiceManualDocumentLinksTable.reviewStatus,
        authorPersonId: nexusServiceManualDocumentLinksTable.authorPersonId,
        authorEmail: nexusServiceManualDocumentLinksTable.authorEmail,
        createdAt: nexusServiceManualDocumentLinksTable.createdAt,
      })
      .from(nexusServiceManualDocumentLinksTable)
      .where(eq(nexusServiceManualDocumentLinksTable.organizationId, authContext.organizationId))
      .orderBy(desc(nexusServiceManualDocumentLinksTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      manualLinks: rows.map((row) => {
        const metadata = row.documentMetadata ?? {};

        return {
          id: row.id,
          deviceId: row.deviceId,
          targetType: row.targetType ?? 'device',
          targetId: row.targetId ?? row.deviceId,
          targetLabel: row.targetLabel ?? undefined,
          documentId: row.documentId,
          documentTitle: row.documentTitle,
          documentSource: row.documentSource ?? undefined,
          documentVersion: row.documentVersion ?? 'legacy-import',
          packetKind: metadata.packetKind as NexusServiceManualLinkHistoryItem['packetKind'],
          visibility: metadata.visibility as NexusServiceManualLinkHistoryItem['visibility'],
          ownerReportLabel: metadata.ownerReportLabel,
          ownerReportEligible: metadata.ownerReportEligible,
          reviewStatus: MANUAL_LINK_STATUS_LABELS[row.reviewStatus] ?? 'Linked',
          linkedBy: row.authorPersonId || row.authorEmail,
          linkedAt: formatPersistedNoteTime(row.createdAt),
          source: 'authenticated',
        };
      }),
    };
  } catch {
    return {
      status: 'database_error',
      manualLinks: [],
    };
  }
};

export const listNexusServiceManualExtractionQueueForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusServicePersistedManualExtractionQueueListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      extractionQueue: [],
    };
  }

  const readPolicy = getNexusServiceManualExtractionQueueReadPolicy(authContext);

  if (!readPolicy.canRead) {
    return {
      status: readPolicy.status,
      extractionQueue: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      extractionQueue: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 25);
    const baseFilter = eq(
      nexusServiceManualExtractionQueueTable.organizationId,
      authContext.organizationId
    );
    const visibilityFilter = readPolicy.authorPersonId
      ? and(
          baseFilter,
          eq(
            nexusServiceManualExtractionQueueTable.authorPersonId,
            readPolicy.authorPersonId
          )
        )
      : baseFilter;
    const rows = await getDb()
      .select({
        id: nexusServiceManualExtractionQueueTable.id,
        deviceId: nexusServiceManualExtractionQueueTable.deviceId,
        targetType: nexusServiceManualExtractionQueueTable.targetType,
        targetId: nexusServiceManualExtractionQueueTable.targetId,
        targetLabel: nexusServiceManualExtractionQueueTable.targetLabel,
        documentId: nexusServiceManualExtractionQueueTable.documentId,
        documentTitle: nexusServiceManualExtractionQueueTable.documentTitle,
        documentVersion: nexusServiceManualExtractionQueueTable.documentVersion,
        sourceRef: nexusServiceManualExtractionQueueTable.sourceRef,
        packetKind: nexusServiceManualExtractionQueueTable.packetKind,
        visibility: nexusServiceManualExtractionQueueTable.visibility,
        ownerReportLabel: nexusServiceManualExtractionQueueTable.ownerReportLabel,
        requestedOutcome: nexusServiceManualExtractionQueueTable.requestedOutcome,
        checklistCount: nexusServiceManualExtractionQueueTable.checklistCount,
        reviewStatus: nexusServiceManualExtractionQueueTable.reviewStatus,
        authorPersonId: nexusServiceManualExtractionQueueTable.authorPersonId,
        authorEmail: nexusServiceManualExtractionQueueTable.authorEmail,
        createdAt: nexusServiceManualExtractionQueueTable.createdAt,
      })
      .from(nexusServiceManualExtractionQueueTable)
      .where(visibilityFilter)
      .orderBy(desc(nexusServiceManualExtractionQueueTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      extractionQueue: rows.map((row) => ({
        id: row.id,
        deviceId: row.deviceId,
        targetType: row.targetType,
        targetId: row.targetId,
        targetLabel: row.targetLabel ?? undefined,
        documentId: row.documentId,
        documentTitle: row.documentTitle,
        documentVersion: row.documentVersion,
        sourceRef: row.sourceRef ?? undefined,
        packetKind: row.packetKind as NexusServiceManualExtractionQueueItem['packetKind'],
        visibility: row.visibility as NexusServiceManualExtractionQueueItem['visibility'],
        ownerReportLabel: row.ownerReportLabel ?? undefined,
        requestedOutcome: row.requestedOutcome,
        checklistCount: row.checklistCount,
        reviewStatus: MANUAL_EXTRACTION_STATUS_LABELS[row.reviewStatus] ?? 'Queued',
        requestedBy: row.authorPersonId || row.authorEmail,
        queuedAt: formatPersistedNoteTime(row.createdAt),
        source: 'authenticated',
      })),
    };
  } catch {
    return {
      status: 'database_error',
      extractionQueue: [],
    };
  }
};

export const listNexusServiceOwnerReportsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusServicePersistedOwnerReportListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      ownerReports: [],
    };
  }

  const canReadPrivateReportHistory =
    authContext.role === 'SERVICE_MANAGER' || authContext.role === 'OPERATIONS_ADMIN';
  const canReadPublishedOwnerReports = authContext.role === 'OWNER';
  const ownerDeviceScope = canReadPublishedOwnerReports
    ? normalizeOwnerDeviceScope(authContext.ownerDeviceIds)
    : [];

  if (!canReadPrivateReportHistory && !canReadPublishedOwnerReports) {
    return {
      status: 'role_not_allowed',
      ownerReports: [],
    };
  }

  if (canReadPublishedOwnerReports && ownerDeviceScope.length === 0) {
    return {
      status: 'service_profile_required',
      ownerReports: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      ownerReports: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 25);
    const reportScopeCondition = canReadPublishedOwnerReports
      ? and(
          eq(nexusServiceReportsTable.organizationId, authContext.organizationId),
          eq(nexusServiceReportsTable.finalStatus, 'published'),
          buildOwnerDeviceScopeCondition(ownerDeviceScope)
        )
      : eq(nexusServiceReportsTable.organizationId, authContext.organizationId);

    const rows = await getDb()
      .select({
        id: nexusServiceReportsTable.id,
        deviceId: nexusServiceReportsTable.deviceId,
        visitId: nexusServiceReportsTable.visitId,
        reportId: nexusServiceReportsTable.reportId,
        reportNumber: nexusServiceReportsTable.reportNumber,
        finalStatus: nexusServiceReportsTable.finalStatus,
        ownerSummary: nexusServiceReportsTable.ownerSummary,
        ownerSummaryLength: nexusServiceReportsTable.ownerSummaryLength,
        checklistCount: nexusServiceReportsTable.checklistCount,
        manualReferences: nexusServiceReportsTable.manualReferences,
        authorPersonId: nexusServiceReportsTable.authorPersonId,
        authorEmail: nexusServiceReportsTable.authorEmail,
        createdAt: nexusServiceReportsTable.createdAt,
      })
      .from(nexusServiceReportsTable)
      .where(reportScopeCondition)
      .orderBy(desc(nexusServiceReportsTable.createdAt))
      .limit(boundedLimit);
    const visibleRows = canReadPublishedOwnerReports
      ? rows.filter(
          (row) =>
            row.finalStatus === 'published' &&
            ownerDeviceScope.includes(row.deviceId)
        )
      : rows;

    return {
      status: 'loaded',
      ownerReports: visibleRows.map((row) => ({
        id: row.id,
        deviceId: row.deviceId,
        visitId: row.visitId ?? undefined,
        reportId: row.reportId,
        reportNumber: row.reportNumber,
        finalStatus: OWNER_REPORT_STATUS_LABELS[row.finalStatus] ?? 'Owner-ready',
        summary: row.ownerSummary,
        ownerSummaryLength: row.ownerSummaryLength,
        checklistCount: row.checklistCount,
        manualReferences: filterOwnerSafeManualReferences(row.manualReferences),
        createdBy: row.authorPersonId || row.authorEmail,
        publishedAt: formatPersistedNoteTime(row.createdAt),
        source: 'authenticated',
      })),
    };
  } catch {
    return {
      status: 'database_error',
      ownerReports: [],
    };
  }
};

export const listNexusServiceTodosForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 20
): Promise<NexusServicePersistedTodoListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      todos: [],
    };
  }

  const todoReadPolicy = getNexusServiceTodoReadPolicy(authContext);

  if (!todoReadPolicy.canRead) {
    return {
      status: todoReadPolicy.status,
      todos: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      todos: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 50);
    const rows = await getDb()
      .select({
        id: nexusServiceTodosTable.id,
        title: nexusServiceTodosTable.title,
        scope: nexusServiceTodosTable.scope,
        assigneePersonId: nexusServiceTodosTable.assigneePersonId,
        dueDate: nexusServiceTodosTable.dueDate,
        priority: nexusServiceTodosTable.priority,
        status: nexusServiceTodosTable.status,
      })
      .from(nexusServiceTodosTable)
      .where(todoReadPolicy.filter)
      .orderBy(desc(nexusServiceTodosTable.createdAt))
      .limit(boundedLimit);
    const visibleRows =
      authContext.role === 'OWNER'
        ? rows.filter((row) => row.scope === 'Owner')
        : authContext.role === 'TECHNICIAN'
          ? rows.filter((row) => row.assigneePersonId === authContext.personId)
          : rows;

    return {
      status: 'loaded',
      todos: visibleRows.map((row) => ({
        id: row.id,
        title: row.title,
        scope: row.scope,
        owner: row.assigneePersonId || 'Company queue',
        due: row.dueDate || 'Unscheduled',
        priority: row.priority,
        done: row.status === 'done',
        source: 'authenticated',
      })),
    };
  } catch {
    return {
      status: 'database_error',
      todos: [],
    };
  }
};

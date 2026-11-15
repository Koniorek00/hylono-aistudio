import { z } from 'zod';
import {
  type NexusServiceActionInput,
  type NexusServiceAuditPayload,
  type NexusServiceAuthContext,
  type NexusServicePersistenceMode,
  resolveNexusServiceActionDecision,
} from '@/content/nexus-service-persistence-contract';
import { NEXUS_SERVICE_MANUAL_LIBRARY } from '@/content/nexus-service-operations';
import type { NexusServiceRole } from '@/content/nexus-service-app-contract';

export type NexusServiceServerActionStatus =
  | 'validation_error'
  | 'auth_required'
  | 'service_profile_required'
  | 'role_not_allowed'
  | 'external_ordering_disabled'
  | 'persistence_error'
  | 'private_write_ready'
  | 'review_draft_ready';

export interface NexusServiceSessionLike {
  user?: {
    id?: string | null;
    email?: string | null;
  } | null;
}

export interface NexusServiceSessionProfile {
  role: NexusServiceRole;
  organizationId: string;
  personId?: string;
  ownerDeviceIds?: string[];
}

export interface NexusServiceServerActionResult {
  success: boolean;
  status: NexusServiceServerActionStatus;
  message: string;
  persisted: boolean;
  persistedRecordId?: string;
  futureTable: string | null;
  persistenceMode: NexusServicePersistenceMode;
  auditPayload?: NexusServiceAuditPayload;
  fieldErrors?: Record<string, string[]>;
}

const optionalTrimmedString = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .optional();

const MANUAL_LIBRARY_BY_ID = new Map(
  NEXUS_SERVICE_MANUAL_LIBRARY.map((manual) => [manual.id, manual])
);

const isKnownManualDocumentReference = (
  documentId: string,
  documentVersion: string
): boolean => {
  const manual = MANUAL_LIBRARY_BY_ID.get(documentId);
  return Boolean(manual && manual.documentVersion === documentVersion);
};

const noteInputSchema = z.object({
  actionId: z.literal('note.create'),
  deviceId: z.string().trim().min(1).max(160),
  visitId: optionalTrimmedString,
  scope: z.enum(['owner-visible', 'technician-only', 'company']),
  body: z.string().trim().min(1).max(5000),
});

const todoInputSchema = z.object({
  actionId: z.literal('todo.assign'),
  deviceId: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(240),
  scope: z.enum(['Company', 'Owner', 'Technician']).optional(),
  assigneePersonId: optionalTrimmedString,
  dueDate: z.string().trim().max(40).optional(),
  priority: z.enum(['High', 'Medium', 'Routine']).optional(),
  status: z.enum(['open', 'done']).optional(),
});

const partDraftLineSchema = z.object({
  partNumber: z.string().trim().min(1).max(120),
  label: z.string().trim().max(180).optional(),
  quantity: z.coerce.number().int().min(1).max(99),
  reason: z.string().trim().max(500).optional(),
});

const partsDraftInputSchema = z.object({
  actionId: z.literal('parts.draft.create'),
  deviceId: z.string().trim().min(1).max(160),
  visitId: optionalTrimmedString,
  lines: z.array(partDraftLineSchema).min(1).max(30),
});

const partsOrderInputSchema = z.object({
  actionId: z.literal('parts.order.submit'),
  draftId: z.string().trim().min(1).max(160),
  managerApprovalToken: optionalTrimmedString,
});

const manualLinkInputSchema = z
  .object({
    actionId: z.literal('manual.link'),
    deviceId: z.string().trim().min(1).max(160),
    targetType: z.enum(['device', 'visit', 'part']),
    targetId: z.string().trim().min(1).max(160),
    targetLabel: optionalTrimmedString,
    documentId: z.string().trim().min(1).max(160),
    documentVersion: z.string().trim().min(1).max(80),
  })
  .superRefine((input, context) => {
    if (isKnownManualDocumentReference(input.documentId, input.documentVersion)) {
      return;
    }

    context.addIssue({
      code: 'custom',
      path: ['documentId'],
      message: 'Manual document must match the source-backed manual register.',
    });
  });

const manualExtractionQueueInputSchema = z.object({
  actionId: z.literal('manual.extraction.queue'),
  deviceId: z.string().trim().min(1).max(160),
  targetType: z.enum(['device', 'visit', 'part']),
  targetId: z.string().trim().min(1).max(160),
  targetLabel: optionalTrimmedString,
  documentId: z.string().trim().min(1).max(160),
  documentVersion: z.string().trim().min(1).max(80),
  requestedOutcome: z.string().trim().min(10).max(500),
  extractionChecklist: z.array(z.string().trim().min(1).max(240)).min(1).max(8),
});

const manualExtractionReviewInputSchema = z.object({
  actionId: z.literal('manual.extraction.review'),
  queueId: z.string().trim().min(1).max(160),
  documentId: z.string().trim().min(1).max(160),
  reviewStatus: z.enum(['in-review', 'owner-safe-draft', 'blocked']),
});

const ownerManualReferenceInputSchema = z.object({
  targetType: z.enum(['device', 'visit', 'part']),
  targetId: z.string().trim().min(1).max(160),
  documentId: z.string().trim().min(1).max(160),
  documentTitle: z.string().trim().min(1).max(240),
  documentVersion: z.string().trim().min(1).max(80),
  ownerReportLabel: z.string().trim().min(1).max(240),
  reviewStatus: z.enum(['Linked', 'Review needed']),
});

const ownerReportInputSchema = z.object({
  actionId: z.literal('report.publishOwner'),
  reportId: z.string().trim().min(1).max(160),
  deviceId: z.string().trim().min(1).max(160),
  visitId: optionalTrimmedString,
  ownerSummary: z.string().trim().min(10).max(1400),
  finalStatus: z
    .enum(['draft-review', 'owner-ready', 'published', 'cancelled'])
    .optional(),
  checklistCount: z.coerce.number().int().min(0).max(20).optional(),
  manualReferences: z.array(ownerManualReferenceInputSchema).max(12).optional(),
});

const ownerReportStatusInputSchema = z.object({
  actionId: z.literal('report.publishOwnerStatus'),
  reportId: z.string().trim().min(1).max(160),
  finalStatus: z.enum(['published', 'cancelled']),
});

const ownerDeviceScopeInputSchema = z.object({
  actionId: z.literal('profile.ownerDeviceScope.assign'),
  ownerProfileId: z.string().trim().min(1).max(160),
  ownerDeviceIds: z.array(z.string().trim().min(1).max(160)).min(1).max(30),
});

const getFormString = (formData: FormData, key: string): string | undefined => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
};

const parseJsonArrayField = (
  formData: FormData,
  key: string
): unknown[] | undefined => {
  const rawValue = getFormString(formData, key);

  if (!rawValue) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const parseNormalizedStringArrayField = (
  formData: FormData,
  key: string
): string[] | undefined => {
  const parsed = parseJsonArrayField(formData, key);

  if (!parsed) {
    return undefined;
  }

  const normalized = Array.from(
    new Set(
      parsed
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    )
  );

  return normalized.length > 0 ? normalized : undefined;
};

const formatValidationErrors = (
  error: z.ZodError
): Record<string, string[]> =>
  z.flattenError(error).fieldErrors as Record<string, string[]>;

const buildValidationErrorResult = (
  error: z.ZodError
): NexusServiceServerActionResult => ({
  success: false,
  status: 'validation_error',
  message: 'Service action input could not be accepted.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
  fieldErrors: formatValidationErrors(error),
});

export const parseNexusServiceNoteFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = noteInputSchema.safeParse({
    actionId: 'note.create',
    deviceId: getFormString(formData, 'deviceId'),
    visitId: getFormString(formData, 'visitId'),
    scope: getFormString(formData, 'scope'),
    body: getFormString(formData, 'body'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServiceTodoFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = todoInputSchema.safeParse({
    actionId: 'todo.assign',
    deviceId: getFormString(formData, 'deviceId'),
    title: getFormString(formData, 'title'),
    scope: getFormString(formData, 'scope'),
    assigneePersonId: getFormString(formData, 'assigneePersonId'),
    dueDate: getFormString(formData, 'dueDate'),
    priority: getFormString(formData, 'priority'),
    status: getFormString(formData, 'status'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServicePartsDraftFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = partsDraftInputSchema.safeParse({
    actionId: 'parts.draft.create',
    deviceId: getFormString(formData, 'deviceId'),
    visitId: getFormString(formData, 'visitId'),
    lines: parseJsonArrayField(formData, 'linesJson'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServicePartsOrderFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = partsOrderInputSchema.safeParse({
    actionId: 'parts.order.submit',
    draftId: getFormString(formData, 'draftId'),
    managerApprovalToken: getFormString(formData, 'managerApprovalToken'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServiceManualLinkFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = manualLinkInputSchema.safeParse({
    actionId: 'manual.link',
    deviceId: getFormString(formData, 'deviceId'),
    targetType: getFormString(formData, 'targetType'),
    targetId: getFormString(formData, 'targetId'),
    targetLabel: getFormString(formData, 'targetLabel'),
    documentId: getFormString(formData, 'documentId'),
    documentVersion: getFormString(formData, 'documentVersion'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServiceManualExtractionQueueFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = manualExtractionQueueInputSchema.safeParse({
    actionId: 'manual.extraction.queue',
    deviceId: getFormString(formData, 'deviceId'),
    targetType: getFormString(formData, 'targetType'),
    targetId: getFormString(formData, 'targetId'),
    targetLabel: getFormString(formData, 'targetLabel'),
    documentId: getFormString(formData, 'documentId'),
    documentVersion: getFormString(formData, 'documentVersion'),
    requestedOutcome: getFormString(formData, 'requestedOutcome'),
    extractionChecklist: parseJsonArrayField(formData, 'extractionChecklistJson'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServiceManualExtractionReviewFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = manualExtractionReviewInputSchema.safeParse({
    actionId: 'manual.extraction.review',
    queueId: getFormString(formData, 'queueId'),
    documentId: getFormString(formData, 'documentId'),
    reviewStatus: getFormString(formData, 'reviewStatus'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServiceOwnerReportFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = ownerReportInputSchema.safeParse({
    actionId: 'report.publishOwner',
    reportId: getFormString(formData, 'reportId'),
    deviceId: getFormString(formData, 'deviceId'),
    visitId: getFormString(formData, 'visitId'),
    ownerSummary: getFormString(formData, 'ownerSummary'),
    finalStatus: getFormString(formData, 'finalStatus'),
    checklistCount: getFormString(formData, 'checklistCount'),
    manualReferences: parseJsonArrayField(formData, 'manualReferencesJson'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServiceOwnerReportStatusFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = ownerReportStatusInputSchema.safeParse({
    actionId: 'report.publishOwnerStatus',
    reportId: getFormString(formData, 'reportId'),
    finalStatus: getFormString(formData, 'finalStatus'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const parseNexusServiceOwnerDeviceScopeFormData = (
  formData: FormData
): NexusServiceActionInput | NexusServiceServerActionResult => {
  const parsed = ownerDeviceScopeInputSchema.safeParse({
    actionId: 'profile.ownerDeviceScope.assign',
    ownerProfileId: getFormString(formData, 'ownerProfileId'),
    ownerDeviceIds: parseNormalizedStringArrayField(formData, 'ownerDeviceIdsJson'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const resolveNexusServiceAuthContextForSession = (
  session: NexusServiceSessionLike | null,
  profile?: NexusServiceSessionProfile | null
): NexusServiceAuthContext | null => {
  const email = session?.user?.email?.trim();

  if (!email || !profile?.organizationId) {
    return null;
  }

  return {
    userId: session?.user?.id?.trim() || email,
    role: profile.role,
    organizationId: profile.organizationId,
    personId: profile.personId,
    ownerDeviceIds: profile.ownerDeviceIds,
  };
};

const statusForAllowedMode = (
  mode: NexusServicePersistenceMode
): NexusServiceServerActionStatus =>
  mode === 'review-draft' ? 'review_draft_ready' : 'private_write_ready';

export const NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE =
  'Authenticated private storage is not configured for this preview, so no database row was written.';

export const resolveNexusServiceServerActionRequest = (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusServiceActionInput
): NexusServiceServerActionResult => {
  const hasAuthenticatedIdentity = Boolean(session?.user?.email?.trim());

  if (!hasAuthenticatedIdentity) {
    const decision = resolveNexusServiceActionDecision(null, input);
    return {
      success: false,
      status: 'auth_required',
      message: 'Sign in before saving Nexus service workspace changes.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    const decision = resolveNexusServiceActionDecision(null, input);
    return {
      success: false,
      status: 'service_profile_required',
      message: 'A verified Nexus service profile is required before this action can write data.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const decision = resolveNexusServiceActionDecision(authContext, input);

  if (
    input.actionId === 'note.create' &&
    authContext.role === 'TECHNICIAN' &&
    !authContext.personId
  ) {
    return {
      success: false,
      status: 'service_profile_required',
      message:
        'A verified technician person scope is required before saving service notes.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  if (
    input.actionId === 'parts.draft.create' &&
    authContext.role === 'TECHNICIAN' &&
    !authContext.personId
  ) {
    return {
      success: false,
      status: 'service_profile_required',
      message:
        'A verified technician person scope is required before staging replacement parts.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  if (!decision.allowed) {
    return {
      success: false,
      status:
        decision.reason === 'external_ordering_disabled'
          ? 'external_ordering_disabled'
          : 'role_not_allowed',
      message:
        decision.reason === 'external_ordering_disabled'
          ? 'Real replacement-part ordering is blocked until supplier, stock, pricing, payment, and approval integrations exist.'
          : 'Your Nexus service role cannot perform this action.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  return {
    success: true,
    status: statusForAllowedMode(decision.persistenceMode),
    message: `Service action passed the authenticated persistence boundary. ${NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE}`,
    persisted: false,
    futureTable: decision.futureTable,
    persistenceMode: decision.persistenceMode,
    auditPayload: decision.auditPayload,
  };
};

export const isNexusServiceServerActionResult = (
  value: NexusServiceActionInput | NexusServiceServerActionResult
): value is NexusServiceServerActionResult =>
  'success' in value &&
  typeof value.success === 'boolean' &&
  'message' in value &&
  'persisted' in value &&
  'persistenceMode' in value;

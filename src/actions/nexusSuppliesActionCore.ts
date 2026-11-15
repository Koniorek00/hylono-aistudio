import { z } from 'zod';
import {
  NEXUS_SUPPLIES_REQUISITION_STATUSES,
  type NexusSuppliesActionInput,
  type NexusSuppliesAuditPayload,
  type NexusSuppliesRequisitionStatus,
  resolveNexusSuppliesActionDecision,
} from '@/content/nexus-supplies-persistence-contract';
import {
  NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_APPROVAL_ONLY_LINES,
  NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_LINE_COUNT,
  resolveNexusSuppliesRequisitionAggregateViolation,
} from '@/content/nexus-supplies-operations';
import type { NexusServicePersistenceMode } from '@/content/nexus-service-persistence-contract';
import {
  NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE,
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusSuppliesServerActionStatus =
  | 'validation_error'
  | 'auth_required'
  | 'service_profile_required'
  | 'role_not_allowed'
  | 'persistence_error'
  | 'private_write_ready';

export interface NexusSuppliesRequisitionActionResult {
  success: boolean;
  status: NexusSuppliesServerActionStatus;
  message: string;
  persisted: boolean;
  persistedRecordId?: string;
  futureTable: string | null;
  persistenceMode: NexusServicePersistenceMode;
  auditPayload?: NexusSuppliesAuditPayload;
  fieldErrors?: Record<string, string[]>;
}

export interface NexusSuppliesPersistedRequisition {
  id: string;
  lineCount: number;
  totalPacks: number;
  approvalOnlyLines: number;
  status: NexusSuppliesRequisitionStatus;
  createdAtLabel: string;
  source: 'authenticated';
}

const suppliesRequisitionInputSchema = z
  .object({
    actionId: z.literal('supplies.requisition.create'),
    lineCount: z.coerce
      .number()
      .int()
      .min(1)
      .max(NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_LINE_COUNT),
    totalPacks: z.coerce.number().int().min(1).max(999),
    approvalOnlyLines: z.coerce
      .number()
      .int()
      .min(0)
      .max(NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_APPROVAL_ONLY_LINES),
    nextStatus: z.enum(NEXUS_SUPPLIES_REQUISITION_STATUSES),
  })
  .superRefine((input, context) => {
    const violation = resolveNexusSuppliesRequisitionAggregateViolation(input);

    if (!violation) {
      return;
    }

    context.addIssue({
      code: 'custom',
      path: [violation.field],
      message: violation.message,
    });
  })
  .refine((input) => input.approvalOnlyLines <= input.lineCount, {
    path: ['approvalOnlyLines'],
    message: 'Approval-only line count cannot exceed total line count.',
  })
  .refine(
    (input) =>
      input.approvalOnlyLines === 0 || input.nextStatus === 'Needs review',
    {
      path: ['nextStatus'],
      message: 'Approval-only requisitions must stay in review.',
    }
  );

const getFormString = (formData: FormData, key: string): string | undefined => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
};

const formatValidationErrors = (
  error: z.ZodError
): Record<string, string[]> =>
  z.flattenError(error).fieldErrors as Record<string, string[]>;

const buildValidationErrorResult = (
  error: z.ZodError
): NexusSuppliesRequisitionActionResult => ({
  success: false,
  status: 'validation_error',
  message: 'Supply requisition input could not be accepted.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
  fieldErrors: formatValidationErrors(error),
});

export const parseNexusSuppliesRequisitionFormData = (
  formData: FormData
): NexusSuppliesActionInput | NexusSuppliesRequisitionActionResult => {
  const parsed = suppliesRequisitionInputSchema.safeParse({
    actionId: 'supplies.requisition.create',
    lineCount: getFormString(formData, 'lineCount'),
    totalPacks: getFormString(formData, 'totalPacks'),
    approvalOnlyLines: getFormString(formData, 'approvalOnlyLines'),
    nextStatus: getFormString(formData, 'nextStatus'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const resolveNexusSuppliesServerActionRequest = (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusSuppliesActionInput
): NexusSuppliesRequisitionActionResult => {
  const hasAuthenticatedIdentity = Boolean(session?.user?.email?.trim());

  if (!hasAuthenticatedIdentity) {
    const decision = resolveNexusSuppliesActionDecision(null, input);
    return {
      success: false,
      status: 'auth_required',
      message: 'Sign in before sending Nexus supply requisitions.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    const decision = resolveNexusSuppliesActionDecision(null, input);
    return {
      success: false,
      status: 'service_profile_required',
      message: 'A verified Nexus service profile is required before supply requisitions can be saved.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const decision = resolveNexusSuppliesActionDecision(authContext, input);

  if (!decision.allowed) {
    return {
      success: false,
      status: 'role_not_allowed',
      message: 'Your Nexus service role cannot create supply requisitions.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  return {
    success: true,
    status: 'private_write_ready',
    message: `Supply requisition passed the authenticated persistence boundary. ${NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE}`,
    persisted: false,
    futureTable: decision.futureTable,
    persistenceMode: decision.persistenceMode,
    auditPayload: decision.auditPayload,
  };
};

export const isNexusSuppliesRequisitionActionResult = (
  value: NexusSuppliesActionInput | NexusSuppliesRequisitionActionResult
): value is NexusSuppliesRequisitionActionResult =>
  'success' in value &&
  typeof value.success === 'boolean' &&
  'message' in value &&
  'persisted' in value &&
  'persistenceMode' in value;

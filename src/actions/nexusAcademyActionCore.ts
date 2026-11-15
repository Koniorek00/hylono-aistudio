import { z } from 'zod';
import {
  NEXUS_ACADEMY_ROLE_TRACKS,
  type NexusAcademyActionInput,
  type NexusAcademyAuditPayload,
  type NexusAcademyRoleTrack,
  resolveNexusAcademyActionDecision,
} from '@/content/nexus-academy-persistence-contract';
import type { NexusServicePersistenceMode } from '@/content/nexus-service-persistence-contract';
import {
  NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE,
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusAcademyServerActionStatus =
  | 'validation_error'
  | 'auth_required'
  | 'service_profile_required'
  | 'role_not_allowed'
  | 'persistence_error'
  | 'private_write_ready';

export interface NexusAcademyAssignmentActionResult {
  success: boolean;
  status: NexusAcademyServerActionStatus;
  message: string;
  persisted: boolean;
  persistedRecordId?: string;
  futureTable: string | null;
  persistenceMode: NexusServicePersistenceMode;
  auditPayload?: NexusAcademyAuditPayload;
  fieldErrors?: Record<string, string[]>;
}

export interface NexusAcademyPersistedAssignment {
  id: string;
  roleTrack: NexusAcademyRoleTrack;
  moduleCount: number;
  requiredCount: number;
  drillIncluded: boolean;
  createdAtLabel: string;
  source: 'authenticated';
}

const academyAssignmentInputSchema = z.object({
  actionId: z.literal('academy.assignment.create'),
  roleTrack: z.enum(NEXUS_ACADEMY_ROLE_TRACKS),
  moduleCount: z.coerce.number().int().min(1).max(20),
  requiredCount: z.coerce.number().int().min(0).max(20),
  drillIncluded: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true'),
});

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
): NexusAcademyAssignmentActionResult => ({
  success: false,
  status: 'validation_error',
  message: 'Academy assignment input could not be accepted.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
  fieldErrors: formatValidationErrors(error),
});

export const parseNexusAcademyAssignmentFormData = (
  formData: FormData
): NexusAcademyActionInput | NexusAcademyAssignmentActionResult => {
  const parsed = academyAssignmentInputSchema.safeParse({
    actionId: 'academy.assignment.create',
    roleTrack: getFormString(formData, 'roleTrack'),
    moduleCount: getFormString(formData, 'moduleCount'),
    requiredCount: getFormString(formData, 'requiredCount'),
    drillIncluded: getFormString(formData, 'drillIncluded'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const resolveNexusAcademyServerActionRequest = (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusAcademyActionInput
): NexusAcademyAssignmentActionResult => {
  const hasAuthenticatedIdentity = Boolean(session?.user?.email?.trim());

  if (!hasAuthenticatedIdentity) {
    const decision = resolveNexusAcademyActionDecision(null, input);
    return {
      success: false,
      status: 'auth_required',
      message: 'Sign in before sending Nexus academy assignments.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    const decision = resolveNexusAcademyActionDecision(null, input);
    return {
      success: false,
      status: 'service_profile_required',
      message: 'A verified Nexus service profile is required before academy assignments can be saved.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const decision = resolveNexusAcademyActionDecision(authContext, input);

  if (!decision.allowed) {
    return {
      success: false,
      status: 'role_not_allowed',
      message: 'Your Nexus service role cannot create academy assignments.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  return {
    success: true,
    status: 'private_write_ready',
    message: `Academy assignment passed the authenticated persistence boundary. ${NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE}`,
    persisted: false,
    futureTable: decision.futureTable,
    persistenceMode: decision.persistenceMode,
    auditPayload: decision.auditPayload,
  };
};

export const isNexusAcademyAssignmentActionResult = (
  value: NexusAcademyActionInput | NexusAcademyAssignmentActionResult
): value is NexusAcademyAssignmentActionResult =>
  'success' in value &&
  typeof value.success === 'boolean' &&
  'message' in value &&
  'persisted' in value &&
  'persistenceMode' in value;

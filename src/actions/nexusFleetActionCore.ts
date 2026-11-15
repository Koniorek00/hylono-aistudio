import { z } from 'zod';
import {
  type NexusFleetActionInput,
  type NexusFleetAuditPayload,
  type NexusFleetServiceLogType,
  resolveNexusFleetActionDecision,
} from '@/content/nexus-fleet-persistence-contract';
import { NEXUS_FLEET_SAMPLE_DEVICE_IDS } from '@/content/nexus-fleet-operations';
import type { NexusServicePersistenceMode } from '@/content/nexus-service-persistence-contract';
import {
  NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE,
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusFleetServerActionStatus =
  | 'validation_error'
  | 'auth_required'
  | 'service_profile_required'
  | 'role_not_allowed'
  | 'persistence_error'
  | 'private_write_ready';

export interface NexusFleetServiceLogActionResult {
  success: boolean;
  status: NexusFleetServerActionStatus;
  message: string;
  persisted: boolean;
  persistedRecordId?: string;
  futureTable: string | null;
  persistenceMode: NexusServicePersistenceMode;
  auditPayload?: NexusFleetAuditPayload;
  fieldErrors?: Record<string, string[]>;
}

export interface NexusFleetPersistedServiceLog {
  id: string;
  deviceId: string;
  date: string;
  type: NexusFleetServiceLogType;
  description: string;
  technician: string;
  source: 'authenticated';
}

const fleetLogInputSchema = z.object({
  actionId: z.literal('fleet.log.create'),
  deviceId: z.enum(NEXUS_FLEET_SAMPLE_DEVICE_IDS),
  date: z.string().trim().min(1).max(40),
  type: z.enum(['routine', 'repair', 'issue']),
  description: z.string().trim().min(1).max(5000),
  technician: z.string().trim().min(1).max(160),
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
): NexusFleetServiceLogActionResult => ({
  success: false,
  status: 'validation_error',
  message: 'Fleet service log input could not be accepted.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
  fieldErrors: formatValidationErrors(error),
});

export const parseNexusFleetServiceLogFormData = (
  formData: FormData
): NexusFleetActionInput | NexusFleetServiceLogActionResult => {
  const parsed = fleetLogInputSchema.safeParse({
    actionId: 'fleet.log.create',
    deviceId: getFormString(formData, 'deviceId'),
    date: getFormString(formData, 'date'),
    type: getFormString(formData, 'type'),
    description: getFormString(formData, 'description'),
    technician: getFormString(formData, 'technician'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const resolveNexusFleetServerActionRequest = (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusFleetActionInput
): NexusFleetServiceLogActionResult => {
  const hasAuthenticatedIdentity = Boolean(session?.user?.email?.trim());

  if (!hasAuthenticatedIdentity) {
    const decision = resolveNexusFleetActionDecision(null, input);
    return {
      success: false,
      status: 'auth_required',
      message: 'Sign in before saving Nexus fleet service logs.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    const decision = resolveNexusFleetActionDecision(null, input);
    return {
      success: false,
      status: 'service_profile_required',
      message: 'A verified Nexus service profile is required before fleet records can be saved.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const decision = resolveNexusFleetActionDecision(authContext, input);

  if (!decision.allowed) {
    return {
      success: false,
      status: 'role_not_allowed',
      message: 'Your Nexus service role cannot create fleet service logs.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  return {
    success: true,
    status: 'private_write_ready',
    message: `Fleet service log passed the authenticated persistence boundary. ${NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE}`,
    persisted: false,
    futureTable: decision.futureTable,
    persistenceMode: decision.persistenceMode,
    auditPayload: decision.auditPayload,
  };
};

export const isNexusFleetServiceLogActionResult = (
  value: NexusFleetActionInput | NexusFleetServiceLogActionResult
): value is NexusFleetServiceLogActionResult =>
  'success' in value &&
  typeof value.success === 'boolean' &&
  'message' in value &&
  'persisted' in value &&
  'persistenceMode' in value;

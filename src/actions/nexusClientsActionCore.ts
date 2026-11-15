import { z } from 'zod';
import {
  NEXUS_CLIENT_RISK_LEVELS,
  type NexusClientRiskLevel,
  type NexusClientsActionInput,
  type NexusClientsAuditPayload,
  resolveNexusClientsActionDecision,
} from '@/content/nexus-clients-persistence-contract';
import type { NexusServicePersistenceMode } from '@/content/nexus-service-persistence-contract';
import {
  NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE,
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusClientsServerActionStatus =
  | 'validation_error'
  | 'auth_required'
  | 'service_profile_required'
  | 'role_not_allowed'
  | 'persistence_error'
  | 'private_write_ready';

export interface NexusClientsIntakeDraftActionResult {
  success: boolean;
  status: NexusClientsServerActionStatus;
  message: string;
  persisted: boolean;
  persistedRecordId?: string;
  futureTable: string | null;
  persistenceMode: NexusServicePersistenceMode;
  auditPayload?: NexusClientsAuditPayload;
  fieldErrors?: Record<string, string[]>;
}

export interface NexusClientsPersistedIntakeDraft {
  id: string;
  risk: NexusClientRiskLevel;
  identityFieldCount: number;
  protocolProvided: boolean;
  dobProvided: boolean;
  nextSessionProvided: boolean;
  previewOnly: boolean;
  createdAtLabel: string;
  source: 'authenticated';
}

const clientsIntakeDraftInputSchema = z.object({
  actionId: z.literal('clients.intake.draft.create'),
  risk: z.enum(NEXUS_CLIENT_RISK_LEVELS),
  identityFieldCount: z.coerce.number().int().min(0).max(3),
  protocolProvided: z.enum(['true', 'false']).transform((value) => value === 'true'),
  dobProvided: z.enum(['true', 'false']).transform((value) => value === 'true'),
  nextSessionProvided: z.enum(['true', 'false']).transform((value) => value === 'true'),
  previewOnly: z.literal('true').transform(() => true),
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
): NexusClientsIntakeDraftActionResult => ({
  success: false,
  status: 'validation_error',
  message: 'Client intake draft input could not be accepted.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
  fieldErrors: formatValidationErrors(error),
});

export const parseNexusClientsIntakeDraftFormData = (
  formData: FormData
): NexusClientsActionInput | NexusClientsIntakeDraftActionResult => {
  const parsed = clientsIntakeDraftInputSchema.safeParse({
    actionId: 'clients.intake.draft.create',
    risk: getFormString(formData, 'risk'),
    identityFieldCount: getFormString(formData, 'identityFieldCount'),
    protocolProvided: getFormString(formData, 'protocolProvided'),
    dobProvided: getFormString(formData, 'dobProvided'),
    nextSessionProvided: getFormString(formData, 'nextSessionProvided'),
    previewOnly: getFormString(formData, 'previewOnly'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const resolveNexusClientsServerActionRequest = (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusClientsActionInput
): NexusClientsIntakeDraftActionResult => {
  const hasAuthenticatedIdentity = Boolean(session?.user?.email?.trim());

  if (!hasAuthenticatedIdentity) {
    const decision = resolveNexusClientsActionDecision(null, input);
    return {
      success: false,
      status: 'auth_required',
      message: 'Sign in before sending Nexus client intake drafts.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    const decision = resolveNexusClientsActionDecision(null, input);
    return {
      success: false,
      status: 'service_profile_required',
      message: 'A verified Nexus service profile is required before client intake drafts can be saved.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const decision = resolveNexusClientsActionDecision(authContext, input);

  if (!decision.allowed) {
    return {
      success: false,
      status: 'role_not_allowed',
      message: 'Your Nexus service role cannot create client intake drafts.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  return {
    success: true,
    status: 'private_write_ready',
    message: `Client intake draft passed the authenticated persistence boundary. ${NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE}`,
    persisted: false,
    futureTable: decision.futureTable,
    persistenceMode: decision.persistenceMode,
    auditPayload: decision.auditPayload,
  };
};

export const isNexusClientsIntakeDraftActionResult = (
  value: NexusClientsActionInput | NexusClientsIntakeDraftActionResult
): value is NexusClientsIntakeDraftActionResult =>
  'success' in value &&
  typeof value.success === 'boolean' &&
  'message' in value &&
  'persisted' in value &&
  'persistenceMode' in value;

import { z } from 'zod';
import {
  NEXUS_TEAM_HANDOFF_MODULES,
  NEXUS_TEAM_HANDOFF_TARGETS,
  type NexusTeamActionInput,
  type NexusTeamAuditPayload,
  type NexusTeamHandoffModule,
  type NexusTeamHandoffTarget,
  resolveNexusTeamActionDecision,
} from '@/content/nexus-team-persistence-contract';
import type { NexusServicePersistenceMode } from '@/content/nexus-service-persistence-contract';
import {
  NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE,
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusTeamServerActionStatus =
  | 'validation_error'
  | 'auth_required'
  | 'service_profile_required'
  | 'role_not_allowed'
  | 'persistence_error'
  | 'private_write_ready';

export interface NexusTeamHandoffActionResult {
  success: boolean;
  status: NexusTeamServerActionStatus;
  message: string;
  persisted: boolean;
  persistedRecordId?: string;
  futureTable: string | null;
  persistenceMode: NexusServicePersistenceMode;
  auditPayload?: NexusTeamAuditPayload;
  fieldErrors?: Record<string, string[]>;
}

export interface NexusTeamPersistedHandoff {
  id: string;
  moduleName: NexusTeamHandoffModule;
  targetAudience: NexusTeamHandoffTarget;
  createdAtLabel: string;
  source: 'authenticated';
}

const teamHandoffInputSchema = z.object({
  actionId: z.literal('team.handoff.create'),
  moduleName: z.enum(NEXUS_TEAM_HANDOFF_MODULES),
  targetAudience: z.enum(NEXUS_TEAM_HANDOFF_TARGETS),
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
): NexusTeamHandoffActionResult => ({
  success: false,
  status: 'validation_error',
  message: 'Team handoff input could not be accepted.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
  fieldErrors: formatValidationErrors(error),
});

export const parseNexusTeamHandoffFormData = (
  formData: FormData
): NexusTeamActionInput | NexusTeamHandoffActionResult => {
  const parsed = teamHandoffInputSchema.safeParse({
    actionId: 'team.handoff.create',
    moduleName: getFormString(formData, 'moduleName'),
    targetAudience: getFormString(formData, 'targetAudience'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const resolveNexusTeamServerActionRequest = (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusTeamActionInput
): NexusTeamHandoffActionResult => {
  const hasAuthenticatedIdentity = Boolean(session?.user?.email?.trim());

  if (!hasAuthenticatedIdentity) {
    const decision = resolveNexusTeamActionDecision(null, input);
    return {
      success: false,
      status: 'auth_required',
      message: 'Sign in before sending Nexus team handoffs.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    const decision = resolveNexusTeamActionDecision(null, input);
    return {
      success: false,
      status: 'service_profile_required',
      message: 'A verified Nexus service profile is required before team handoffs can be saved.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const decision = resolveNexusTeamActionDecision(authContext, input);

  if (!decision.allowed) {
    return {
      success: false,
      status: 'role_not_allowed',
      message: 'Your Nexus service role cannot create team handoffs.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  return {
    success: true,
    status: 'private_write_ready',
    message: `Team handoff passed the authenticated persistence boundary. ${NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE}`,
    persisted: false,
    futureTable: decision.futureTable,
    persistenceMode: decision.persistenceMode,
    auditPayload: decision.auditPayload,
  };
};

export const isNexusTeamHandoffActionResult = (
  value: NexusTeamActionInput | NexusTeamHandoffActionResult
): value is NexusTeamHandoffActionResult =>
  'success' in value &&
  typeof value.success === 'boolean' &&
  'message' in value &&
  'persisted' in value &&
  'persistenceMode' in value;

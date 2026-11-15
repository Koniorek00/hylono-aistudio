import { z } from 'zod';
import {
  NEXUS_STUDIO_CAMPAIGN_FORMATS,
  NEXUS_STUDIO_CAMPAIGN_GOALS,
  NEXUS_STUDIO_MODALITIES,
  NEXUS_STUDIO_THEMES,
  NEXUS_STUDIO_VOICES,
  type NexusStudioActionInput,
  type NexusStudioAuditPayload,
  type NexusStudioCampaignFormat,
  type NexusStudioCampaignGoal,
  type NexusStudioModality,
  type NexusStudioTheme,
  type NexusStudioVoice,
  resolveNexusStudioActionDecision,
} from '@/content/nexus-studio-persistence-contract';
import type { NexusServicePersistenceMode } from '@/content/nexus-service-persistence-contract';
import {
  NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE,
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusStudioServerActionStatus =
  | 'validation_error'
  | 'auth_required'
  | 'service_profile_required'
  | 'role_not_allowed'
  | 'persistence_error'
  | 'private_write_ready';

export interface NexusStudioCampaignHandoffActionResult {
  success: boolean;
  status: NexusStudioServerActionStatus;
  message: string;
  persisted: boolean;
  persistedRecordId?: string;
  futureTable: string | null;
  persistenceMode: NexusServicePersistenceMode;
  auditPayload?: NexusStudioAuditPayload;
  fieldErrors?: Record<string, string[]>;
}

export interface NexusStudioPersistedCampaignHandoff {
  id: string;
  campaignGoal: NexusStudioCampaignGoal;
  format: NexusStudioCampaignFormat;
  modality: NexusStudioModality;
  theme: NexusStudioTheme;
  voice: NexusStudioVoice;
  checklistTotal: number;
  checklistComplete: number;
  assetFormatCount: number;
  qrEnabled: boolean;
  logoIncluded: boolean;
  createdAtLabel: string;
  source: 'authenticated';
}

const studioCampaignHandoffInputSchema = z
  .object({
    actionId: z.literal('studio.campaign.handoff.create'),
    campaignGoal: z.enum(NEXUS_STUDIO_CAMPAIGN_GOALS),
    format: z.enum(NEXUS_STUDIO_CAMPAIGN_FORMATS),
    modality: z.enum(NEXUS_STUDIO_MODALITIES),
    theme: z.enum(NEXUS_STUDIO_THEMES),
    voice: z.enum(NEXUS_STUDIO_VOICES),
    checklistTotal: z.coerce.number().int().min(0).max(12),
    checklistComplete: z.coerce.number().int().min(0).max(12),
    assetFormatCount: z.coerce.number().int().min(1).max(6),
    qrEnabled: z.enum(['true', 'false']).transform((value) => value === 'true'),
    logoIncluded: z.enum(['true', 'false']).transform((value) => value === 'true'),
  })
  .refine((input) => input.checklistComplete <= input.checklistTotal, {
    path: ['checklistComplete'],
    message: 'Completed checklist count cannot exceed the total checklist count.',
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
): NexusStudioCampaignHandoffActionResult => ({
  success: false,
  status: 'validation_error',
  message: 'Studio campaign handoff input could not be accepted.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
  fieldErrors: formatValidationErrors(error),
});

export const parseNexusStudioCampaignHandoffFormData = (
  formData: FormData
): NexusStudioActionInput | NexusStudioCampaignHandoffActionResult => {
  const parsed = studioCampaignHandoffInputSchema.safeParse({
    actionId: 'studio.campaign.handoff.create',
    campaignGoal: getFormString(formData, 'campaignGoal'),
    format: getFormString(formData, 'format'),
    modality: getFormString(formData, 'modality'),
    theme: getFormString(formData, 'theme'),
    voice: getFormString(formData, 'voice'),
    checklistTotal: getFormString(formData, 'checklistTotal'),
    checklistComplete: getFormString(formData, 'checklistComplete'),
    assetFormatCount: getFormString(formData, 'assetFormatCount'),
    qrEnabled: getFormString(formData, 'qrEnabled'),
    logoIncluded: getFormString(formData, 'logoIncluded'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const resolveNexusStudioServerActionRequest = (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusStudioActionInput
): NexusStudioCampaignHandoffActionResult => {
  const hasAuthenticatedIdentity = Boolean(session?.user?.email?.trim());

  if (!hasAuthenticatedIdentity) {
    const decision = resolveNexusStudioActionDecision(null, input);
    return {
      success: false,
      status: 'auth_required',
      message: 'Sign in before sending Nexus Studio campaign handoffs.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    const decision = resolveNexusStudioActionDecision(null, input);
    return {
      success: false,
      status: 'service_profile_required',
      message: 'A verified Nexus service profile is required before campaign handoffs can be saved.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const decision = resolveNexusStudioActionDecision(authContext, input);

  if (!decision.allowed) {
    return {
      success: false,
      status: 'role_not_allowed',
      message: 'Your Nexus service role cannot create Studio campaign handoffs.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  return {
    success: true,
    status: 'private_write_ready',
    message: `Studio campaign handoff passed the authenticated persistence boundary. ${NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE}`,
    persisted: false,
    futureTable: decision.futureTable,
    persistenceMode: decision.persistenceMode,
    auditPayload: decision.auditPayload,
  };
};

export const isNexusStudioCampaignHandoffActionResult = (
  value: NexusStudioActionInput | NexusStudioCampaignHandoffActionResult
): value is NexusStudioCampaignHandoffActionResult =>
  'success' in value &&
  typeof value.success === 'boolean' &&
  'message' in value &&
  'persisted' in value &&
  'persistenceMode' in value;

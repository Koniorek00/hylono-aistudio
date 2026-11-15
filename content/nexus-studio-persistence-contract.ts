import type {
  NexusServiceAuthContext,
  NexusServicePersistenceMode,
} from './nexus-service-persistence-contract';
import type { NexusServiceLiveEffect, NexusServiceRole } from './nexus-service-app-contract';

export const NEXUS_STUDIO_CAMPAIGN_GOALS = [
  'launch',
  'education',
  'promotion',
  'event',
] as const;
export const NEXUS_STUDIO_CAMPAIGN_FORMATS = [
  'social-square',
  'social-story',
  'print-poster',
] as const;
export const NEXUS_STUDIO_MODALITIES = ['HBOT', 'PEMF', 'RLT', 'Hydrogen'] as const;
export const NEXUS_STUDIO_THEMES = ['modern', 'luxury', 'bold'] as const;
export const NEXUS_STUDIO_VOICES = ['balanced', 'clinical', 'luxury'] as const;

export type NexusStudioCampaignGoal = (typeof NEXUS_STUDIO_CAMPAIGN_GOALS)[number];
export type NexusStudioCampaignFormat = (typeof NEXUS_STUDIO_CAMPAIGN_FORMATS)[number];
export type NexusStudioModality = (typeof NEXUS_STUDIO_MODALITIES)[number];
export type NexusStudioTheme = (typeof NEXUS_STUDIO_THEMES)[number];
export type NexusStudioVoice = (typeof NEXUS_STUDIO_VOICES)[number];
export type NexusStudioPersistenceRecordKind = 'studio-campaign-handoff';

const isNexusStudioCampaignGoal = (value: unknown): value is NexusStudioCampaignGoal =>
  typeof value === 'string' &&
  (NEXUS_STUDIO_CAMPAIGN_GOALS as readonly string[]).includes(value);

const isNexusStudioCampaignFormat = (
  value: unknown
): value is NexusStudioCampaignFormat =>
  typeof value === 'string' &&
  (NEXUS_STUDIO_CAMPAIGN_FORMATS as readonly string[]).includes(value);

const isNexusStudioModality = (value: unknown): value is NexusStudioModality =>
  typeof value === 'string' &&
  (NEXUS_STUDIO_MODALITIES as readonly string[]).includes(value);

const isNexusStudioTheme = (value: unknown): value is NexusStudioTheme =>
  typeof value === 'string' && (NEXUS_STUDIO_THEMES as readonly string[]).includes(value);

const isNexusStudioVoice = (value: unknown): value is NexusStudioVoice =>
  typeof value === 'string' && (NEXUS_STUDIO_VOICES as readonly string[]).includes(value);

export interface NexusStudioCampaignHandoffInput {
  actionId: 'studio.campaign.handoff.create';
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
}

export type NexusStudioActionInput = NexusStudioCampaignHandoffInput;

export const isNexusStudioActionId = (
  value: unknown
): value is NexusStudioActionInput['actionId'] =>
  value === 'studio.campaign.handoff.create';

export const isPlausibleNexusStudioCampaignHandoff = (
  input: Pick<
    NexusStudioCampaignHandoffInput,
    | 'campaignGoal'
    | 'format'
    | 'modality'
    | 'theme'
    | 'voice'
    | 'checklistTotal'
    | 'checklistComplete'
    | 'assetFormatCount'
    | 'qrEnabled'
    | 'logoIncluded'
  >
): input is Pick<
  NexusStudioCampaignHandoffInput,
  | 'campaignGoal'
  | 'format'
  | 'modality'
  | 'theme'
  | 'voice'
  | 'checklistTotal'
  | 'checklistComplete'
  | 'assetFormatCount'
  | 'qrEnabled'
  | 'logoIncluded'
> =>
  isNexusStudioCampaignGoal(input.campaignGoal) &&
  isNexusStudioCampaignFormat(input.format) &&
  isNexusStudioModality(input.modality) &&
  isNexusStudioTheme(input.theme) &&
  isNexusStudioVoice(input.voice) &&
  Number.isInteger(input.checklistTotal) &&
  input.checklistTotal >= 0 &&
  input.checklistTotal <= 12 &&
  Number.isInteger(input.checklistComplete) &&
  input.checklistComplete >= 0 &&
  input.checklistComplete <= input.checklistTotal &&
  Number.isInteger(input.assetFormatCount) &&
  input.assetFormatCount >= 1 &&
  input.assetFormatCount <= 6 &&
  typeof input.qrEnabled === 'boolean' &&
  typeof input.logoIncluded === 'boolean';

export interface NexusStudioActionBoundary {
  id: NexusStudioActionInput['actionId'];
  label: string;
  purpose: string;
  allowedRoles: readonly NexusServiceRole[];
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: 'aggregate-only' | 'redacted' | 'no-client-fields';
}

export interface NexusStudioAuditPayload {
  actionId: NexusStudioActionInput['actionId'];
  entityKind: NexusStudioPersistenceRecordKind;
  requestedByRole?: NexusServiceRole;
  organizationScoped: boolean;
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
}

export interface NexusStudioActionDecision {
  allowed: boolean;
  reason: 'allowed' | 'auth_required' | 'role_not_allowed';
  actionId: NexusStudioActionInput['actionId'];
  requestedByRole?: NexusServiceRole;
  persistenceMode: NexusServicePersistenceMode;
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  auditPayload: NexusStudioAuditPayload;
}

const NEXUS_STUDIO_CAMPAIGN_HANDOFF_BOUNDARY: NexusStudioActionBoundary = {
  id: 'studio.campaign.handoff.create',
  label: 'Create studio campaign handoff',
  purpose:
    'Create an organization-scoped campaign handoff summary while keeping clinic names, URLs, phone numbers, draft copy, captions, image URLs, brand colors, uploaded assets, and contact details out of public preview telemetry and server audit payloads.',
  allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
  futureTable: 'nexus_studio_campaign_handoffs',
  liveEffect: 'private-write',
  piiLogPolicy: 'aggregate-only',
};

export const NEXUS_STUDIO_ACTION_BOUNDARIES: readonly NexusStudioActionBoundary[] = [
  NEXUS_STUDIO_CAMPAIGN_HANDOFF_BOUNDARY,
];

export const getNexusStudioActionBoundary = (
  actionId: NexusStudioActionInput['actionId']
): NexusStudioActionBoundary =>
  NEXUS_STUDIO_ACTION_BOUNDARIES.find((boundary) => boundary.id === actionId) ??
  NEXUS_STUDIO_CAMPAIGN_HANDOFF_BOUNDARY;

export const buildNexusStudioAuditPayload = (
  input: NexusStudioActionInput,
  authContext?: NexusServiceAuthContext | null
): NexusStudioAuditPayload => ({
  actionId: input.actionId,
  entityKind: 'studio-campaign-handoff',
  requestedByRole: authContext?.role,
  organizationScoped: Boolean(authContext?.organizationId),
  campaignGoal: input.campaignGoal,
  format: input.format,
  modality: input.modality,
  theme: input.theme,
  voice: input.voice,
  checklistTotal: input.checklistTotal,
  checklistComplete: input.checklistComplete,
  assetFormatCount: input.assetFormatCount,
  qrEnabled: input.qrEnabled,
  logoIncluded: input.logoIncluded,
});

export const resolveNexusStudioActionDecision = (
  authContext: NexusServiceAuthContext | null,
  input: NexusStudioActionInput
): NexusStudioActionDecision => {
  const boundary = getNexusStudioActionBoundary(input.actionId);
  const auditPayload = buildNexusStudioAuditPayload(input, authContext);

  if (!authContext) {
    return {
      allowed: false,
      reason: 'auth_required',
      actionId: input.actionId,
      persistenceMode: 'blocked',
      futureTable: boundary.futureTable,
      liveEffect: boundary.liveEffect,
      auditPayload,
    };
  }

  if (!boundary.allowedRoles.includes(authContext.role)) {
    return {
      allowed: false,
      reason: 'role_not_allowed',
      actionId: input.actionId,
      requestedByRole: authContext.role,
      persistenceMode: 'blocked',
      futureTable: boundary.futureTable,
      liveEffect: boundary.liveEffect,
      auditPayload,
    };
  }

  return {
    allowed: true,
    reason: 'allowed',
    actionId: input.actionId,
    requestedByRole: authContext.role,
    persistenceMode: 'private-write',
    futureTable: boundary.futureTable,
    liveEffect: boundary.liveEffect,
    auditPayload,
  };
};

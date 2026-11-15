import type {
  NexusServiceAuthContext,
  NexusServicePersistenceMode,
} from './nexus-service-persistence-contract';
import type { NexusServiceLiveEffect, NexusServiceRole } from './nexus-service-app-contract';

export const NEXUS_CLIENT_RISK_LEVELS = ['stable', 'monitor', 'high'] as const;

export type NexusClientRiskLevel = (typeof NEXUS_CLIENT_RISK_LEVELS)[number];
export type NexusClientsPersistenceRecordKind = 'client-intake-draft';

const isNexusClientRiskLevel = (value: unknown): value is NexusClientRiskLevel =>
  typeof value === 'string' &&
  (NEXUS_CLIENT_RISK_LEVELS as readonly string[]).includes(value);

export interface NexusClientsIntakeDraftInput {
  actionId: 'clients.intake.draft.create';
  risk: NexusClientRiskLevel;
  identityFieldCount: number;
  protocolProvided: boolean;
  dobProvided: boolean;
  nextSessionProvided: boolean;
  previewOnly: boolean;
}

export type NexusClientsActionInput = NexusClientsIntakeDraftInput;

export const isNexusClientsActionId = (
  value: unknown
): value is NexusClientsActionInput['actionId'] =>
  value === 'clients.intake.draft.create';

export const isPlausibleNexusClientsIntakeDraft = (
  input: Pick<
    NexusClientsIntakeDraftInput,
    | 'risk'
    | 'identityFieldCount'
    | 'protocolProvided'
    | 'dobProvided'
    | 'nextSessionProvided'
    | 'previewOnly'
  >
): input is Pick<
  NexusClientsIntakeDraftInput,
  | 'risk'
  | 'identityFieldCount'
  | 'protocolProvided'
  | 'dobProvided'
  | 'nextSessionProvided'
  | 'previewOnly'
> =>
  isNexusClientRiskLevel(input.risk) &&
  Number.isInteger(input.identityFieldCount) &&
  input.identityFieldCount >= 0 &&
  input.identityFieldCount <= 3 &&
  typeof input.protocolProvided === 'boolean' &&
  typeof input.dobProvided === 'boolean' &&
  typeof input.nextSessionProvided === 'boolean' &&
  input.previewOnly === true;

export interface NexusClientsActionBoundary {
  id: NexusClientsActionInput['actionId'];
  label: string;
  purpose: string;
  allowedRoles: readonly NexusServiceRole[];
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: 'aggregate-only' | 'redacted' | 'no-client-fields';
}

export interface NexusClientsAuditPayload {
  actionId: NexusClientsActionInput['actionId'];
  entityKind: NexusClientsPersistenceRecordKind;
  requestedByRole?: NexusServiceRole;
  organizationScoped: boolean;
  risk: NexusClientRiskLevel;
  identityFieldCount: number;
  protocolProvided: boolean;
  dobProvided: boolean;
  nextSessionProvided: boolean;
  previewOnly: boolean;
}

export interface NexusClientsActionDecision {
  allowed: boolean;
  reason: 'allowed' | 'auth_required' | 'role_not_allowed';
  actionId: NexusClientsActionInput['actionId'];
  requestedByRole?: NexusServiceRole;
  persistenceMode: NexusServicePersistenceMode;
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  auditPayload: NexusClientsAuditPayload;
}

const NEXUS_CLIENTS_INTAKE_DRAFT_BOUNDARY: NexusClientsActionBoundary = {
  id: 'clients.intake.draft.create',
  label: 'Create client intake draft',
  purpose:
    'Create an organization-scoped client intake draft marker while keeping names, emails, phones, dates of birth, protocols, session notes, client notes, and contact details out of public preview telemetry and server audit payloads.',
  allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
  futureTable: 'nexus_client_intake_drafts',
  liveEffect: 'private-write',
  piiLogPolicy: 'aggregate-only',
};

export const NEXUS_CLIENTS_ACTION_BOUNDARIES: readonly NexusClientsActionBoundary[] = [
  NEXUS_CLIENTS_INTAKE_DRAFT_BOUNDARY,
];

export const getNexusClientsActionBoundary = (
  actionId: NexusClientsActionInput['actionId']
): NexusClientsActionBoundary =>
  NEXUS_CLIENTS_ACTION_BOUNDARIES.find((boundary) => boundary.id === actionId) ??
  NEXUS_CLIENTS_INTAKE_DRAFT_BOUNDARY;

export const buildNexusClientsAuditPayload = (
  input: NexusClientsActionInput,
  authContext?: NexusServiceAuthContext | null
): NexusClientsAuditPayload => ({
  actionId: input.actionId,
  entityKind: 'client-intake-draft',
  requestedByRole: authContext?.role,
  organizationScoped: Boolean(authContext?.organizationId),
  risk: input.risk,
  identityFieldCount: input.identityFieldCount,
  protocolProvided: input.protocolProvided,
  dobProvided: input.dobProvided,
  nextSessionProvided: input.nextSessionProvided,
  previewOnly: input.previewOnly,
});

export const resolveNexusClientsActionDecision = (
  authContext: NexusServiceAuthContext | null,
  input: NexusClientsActionInput
): NexusClientsActionDecision => {
  const boundary = getNexusClientsActionBoundary(input.actionId);
  const auditPayload = buildNexusClientsAuditPayload(input, authContext);

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

import type {
  NexusServiceAuthContext,
  NexusServicePersistenceMode,
} from './nexus-service-persistence-contract';
import type { NexusServiceLiveEffect, NexusServiceRole } from './nexus-service-app-contract';

export const NEXUS_TEAM_HANDOFF_MODULES = [
  'Safety handoff review',
  'Support escalation contact path',
  'Client intake readiness',
] as const;

export const NEXUS_TEAM_HANDOFF_TARGETS = ['All', 'Operators', 'New hires'] as const;

export type NexusTeamHandoffModule = (typeof NEXUS_TEAM_HANDOFF_MODULES)[number];
export type NexusTeamHandoffTarget = (typeof NEXUS_TEAM_HANDOFF_TARGETS)[number];

const isNexusTeamHandoffModule = (value: unknown): value is NexusTeamHandoffModule =>
  typeof value === 'string' &&
  (NEXUS_TEAM_HANDOFF_MODULES as readonly string[]).includes(value);

const isNexusTeamHandoffTarget = (value: unknown): value is NexusTeamHandoffTarget =>
  typeof value === 'string' &&
  (NEXUS_TEAM_HANDOFF_TARGETS as readonly string[]).includes(value);

export const isPlausibleNexusTeamHandoff = (
  input: Pick<NexusTeamHandoffInput, 'moduleName' | 'targetAudience'>
): input is Pick<NexusTeamHandoffInput, 'moduleName' | 'targetAudience'> =>
  isNexusTeamHandoffModule(input.moduleName) &&
  isNexusTeamHandoffTarget(input.targetAudience);

export type NexusTeamPersistenceRecordKind = 'team-handoff';

export interface NexusTeamHandoffInput {
  actionId: 'team.handoff.create';
  moduleName: NexusTeamHandoffModule;
  targetAudience: NexusTeamHandoffTarget;
}

export type NexusTeamActionInput = NexusTeamHandoffInput;

export const isNexusTeamActionId = (
  value: unknown
): value is NexusTeamActionInput['actionId'] => value === 'team.handoff.create';

export interface NexusTeamActionBoundary {
  id: NexusTeamActionInput['actionId'];
  label: string;
  purpose: string;
  allowedRoles: readonly NexusServiceRole[];
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: 'aggregate-only' | 'redacted' | 'no-client-fields';
}

export interface NexusTeamAuditPayload {
  actionId: NexusTeamActionInput['actionId'];
  entityKind: NexusTeamPersistenceRecordKind;
  requestedByRole?: NexusServiceRole;
  organizationScoped: boolean;
  moduleName: NexusTeamHandoffModule;
  targetAudience: NexusTeamHandoffTarget;
}

export interface NexusTeamActionDecision {
  allowed: boolean;
  reason: 'allowed' | 'auth_required' | 'role_not_allowed';
  actionId: NexusTeamActionInput['actionId'];
  requestedByRole?: NexusServiceRole;
  persistenceMode: NexusServicePersistenceMode;
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  auditPayload: NexusTeamAuditPayload;
}

const NEXUS_TEAM_HANDOFF_BOUNDARY: NexusTeamActionBoundary = {
  id: 'team.handoff.create',
  label: 'Create team handoff',
  purpose:
    'Create an organization-scoped staff-readiness handoff without exposing staff identities on the public preview.',
  allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
  futureTable: 'nexus_team_handoffs',
  liveEffect: 'private-write',
  piiLogPolicy: 'aggregate-only',
};

export const NEXUS_TEAM_ACTION_BOUNDARIES: readonly NexusTeamActionBoundary[] = [
  NEXUS_TEAM_HANDOFF_BOUNDARY,
];

export const getNexusTeamActionBoundary = (
  actionId: NexusTeamActionInput['actionId']
): NexusTeamActionBoundary =>
  NEXUS_TEAM_ACTION_BOUNDARIES.find((boundary) => boundary.id === actionId) ??
  NEXUS_TEAM_HANDOFF_BOUNDARY;

export const buildNexusTeamAuditPayload = (
  input: NexusTeamActionInput,
  authContext?: NexusServiceAuthContext | null
): NexusTeamAuditPayload => ({
  actionId: input.actionId,
  entityKind: 'team-handoff',
  requestedByRole: authContext?.role,
  organizationScoped: Boolean(authContext?.organizationId),
  moduleName: input.moduleName,
  targetAudience: input.targetAudience,
});

export const resolveNexusTeamActionDecision = (
  authContext: NexusServiceAuthContext | null,
  input: NexusTeamActionInput
): NexusTeamActionDecision => {
  const boundary = getNexusTeamActionBoundary(input.actionId);
  const auditPayload = buildNexusTeamAuditPayload(input, authContext);

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

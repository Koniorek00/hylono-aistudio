import type {
  NexusServiceAuthContext,
  NexusServicePersistenceMode,
} from './nexus-service-persistence-contract';
import type { NexusServiceLiveEffect, NexusServiceRole } from './nexus-service-app-contract';

export const NEXUS_ACADEMY_ROLE_TRACKS = ['operator', 'manager', 'sales'] as const;

export type NexusAcademyRoleTrack = (typeof NEXUS_ACADEMY_ROLE_TRACKS)[number];
export type NexusAcademyPersistenceRecordKind = 'academy-assignment';

const isNexusAcademyRoleTrack = (value: unknown): value is NexusAcademyRoleTrack =>
  typeof value === 'string' &&
  (NEXUS_ACADEMY_ROLE_TRACKS as readonly string[]).includes(value);

export interface NexusAcademyAssignmentInput {
  actionId: 'academy.assignment.create';
  roleTrack: NexusAcademyRoleTrack;
  moduleCount: number;
  requiredCount: number;
  drillIncluded: boolean;
}

export type NexusAcademyActionInput = NexusAcademyAssignmentInput;

export const isNexusAcademyActionId = (
  value: unknown
): value is NexusAcademyActionInput['actionId'] =>
  value === 'academy.assignment.create';

export const isPlausibleNexusAcademyAssignment = (
  input: Pick<
    NexusAcademyAssignmentInput,
    'roleTrack' | 'moduleCount' | 'requiredCount' | 'drillIncluded'
  >
): input is Pick<
  NexusAcademyAssignmentInput,
  'roleTrack' | 'moduleCount' | 'requiredCount' | 'drillIncluded'
> =>
  isNexusAcademyRoleTrack(input.roleTrack) &&
  Number.isInteger(input.moduleCount) &&
  input.moduleCount >= 1 &&
  input.moduleCount <= 20 &&
  Number.isInteger(input.requiredCount) &&
  input.requiredCount >= 0 &&
  input.requiredCount <= 20 &&
  typeof input.drillIncluded === 'boolean';

export interface NexusAcademyActionBoundary {
  id: NexusAcademyActionInput['actionId'];
  label: string;
  purpose: string;
  allowedRoles: readonly NexusServiceRole[];
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: 'aggregate-only' | 'redacted' | 'no-client-fields';
}

export interface NexusAcademyAuditPayload {
  actionId: NexusAcademyActionInput['actionId'];
  entityKind: NexusAcademyPersistenceRecordKind;
  requestedByRole?: NexusServiceRole;
  organizationScoped: boolean;
  roleTrack: NexusAcademyRoleTrack;
  moduleCount: number;
  requiredCount: number;
  drillIncluded: boolean;
}

export interface NexusAcademyActionDecision {
  allowed: boolean;
  reason: 'allowed' | 'auth_required' | 'role_not_allowed';
  actionId: NexusAcademyActionInput['actionId'];
  requestedByRole?: NexusServiceRole;
  persistenceMode: NexusServicePersistenceMode;
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  auditPayload: NexusAcademyAuditPayload;
}

const NEXUS_ACADEMY_ASSIGNMENT_BOUNDARY: NexusAcademyActionBoundary = {
  id: 'academy.assignment.create',
  label: 'Create academy assignment',
  purpose:
    'Create an organization-scoped training assignment summary while keeping learner identities, clinic names, module titles, notes, and contact details out of public preview telemetry and server audit payloads.',
  allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
  futureTable: 'nexus_academy_assignments',
  liveEffect: 'private-write',
  piiLogPolicy: 'aggregate-only',
};

export const NEXUS_ACADEMY_ACTION_BOUNDARIES: readonly NexusAcademyActionBoundary[] = [
  NEXUS_ACADEMY_ASSIGNMENT_BOUNDARY,
];

export const getNexusAcademyActionBoundary = (
  actionId: NexusAcademyActionInput['actionId']
): NexusAcademyActionBoundary =>
  NEXUS_ACADEMY_ACTION_BOUNDARIES.find((boundary) => boundary.id === actionId) ??
  NEXUS_ACADEMY_ASSIGNMENT_BOUNDARY;

export const buildNexusAcademyAuditPayload = (
  input: NexusAcademyActionInput,
  authContext?: NexusServiceAuthContext | null
): NexusAcademyAuditPayload => ({
  actionId: input.actionId,
  entityKind: 'academy-assignment',
  requestedByRole: authContext?.role,
  organizationScoped: Boolean(authContext?.organizationId),
  roleTrack: input.roleTrack,
  moduleCount: input.moduleCount,
  requiredCount: input.requiredCount,
  drillIncluded: input.drillIncluded,
});

export const resolveNexusAcademyActionDecision = (
  authContext: NexusServiceAuthContext | null,
  input: NexusAcademyActionInput
): NexusAcademyActionDecision => {
  const boundary = getNexusAcademyActionBoundary(input.actionId);
  const auditPayload = buildNexusAcademyAuditPayload(input, authContext);

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

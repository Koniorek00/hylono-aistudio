import type {
  NexusServiceAuthContext,
  NexusServicePersistenceMode,
} from './nexus-service-persistence-contract';
import type { NexusServiceLiveEffect, NexusServiceRole } from './nexus-service-app-contract';
import {
  isKnownNexusFleetDeviceId,
  type NexusFleetSampleDeviceId,
} from './nexus-fleet-operations';

export type NexusFleetServiceLogType = 'routine' | 'repair' | 'issue';
const NEXUS_FLEET_SERVICE_LOG_TYPES: readonly NexusFleetServiceLogType[] = [
  'routine',
  'repair',
  'issue',
];

export type NexusFleetPersistenceRecordKind = 'fleet-service-log';

export interface NexusFleetServiceLogInput {
  actionId: 'fleet.log.create';
  deviceId: NexusFleetSampleDeviceId;
  date: string;
  type: NexusFleetServiceLogType;
  description: string;
  technician: string;
}

export type NexusFleetActionInput = NexusFleetServiceLogInput;

export const isNexusFleetActionId = (
  value: unknown
): value is NexusFleetActionInput['actionId'] => value === 'fleet.log.create';

const isNexusFleetServiceLogType = (
  value: unknown
): value is NexusFleetServiceLogType =>
  typeof value === 'string' &&
  (NEXUS_FLEET_SERVICE_LOG_TYPES as readonly string[]).includes(value);

export const isPlausibleNexusFleetServiceLog = (
  input: Pick<
    NexusFleetServiceLogInput,
    'deviceId' | 'date' | 'type' | 'description' | 'technician'
  >
): input is Pick<
  NexusFleetServiceLogInput,
  'deviceId' | 'date' | 'type' | 'description' | 'technician'
> =>
  isKnownNexusFleetDeviceId(input.deviceId) &&
  isNexusFleetServiceLogType(input.type) &&
  typeof input.date === 'string' &&
  input.date.trim().length >= 1 &&
  input.date.trim().length <= 40 &&
  typeof input.description === 'string' &&
  input.description.trim().length >= 1 &&
  input.description.trim().length <= 5000 &&
  typeof input.technician === 'string' &&
  input.technician.trim().length >= 1 &&
  input.technician.trim().length <= 160;

export interface NexusFleetActionBoundary {
  id: NexusFleetActionInput['actionId'];
  label: string;
  purpose: string;
  allowedRoles: readonly NexusServiceRole[];
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: 'aggregate-only' | 'redacted' | 'no-client-fields';
}

export interface NexusFleetAuditPayload {
  actionId: NexusFleetActionInput['actionId'];
  entityKind: NexusFleetPersistenceRecordKind;
  requestedByRole?: NexusServiceRole;
  organizationScoped: boolean;
  deviceId: string;
  logType: NexusFleetServiceLogType;
  datePresent: boolean;
  descriptionLength: number;
  technicianLength: number;
}

export interface NexusFleetActionDecision {
  allowed: boolean;
  reason: 'allowed' | 'auth_required' | 'role_not_allowed';
  actionId: NexusFleetActionInput['actionId'];
  requestedByRole?: NexusServiceRole;
  persistenceMode: NexusServicePersistenceMode;
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  auditPayload: NexusFleetAuditPayload;
}

const NEXUS_FLEET_SERVICE_LOG_BOUNDARY: NexusFleetActionBoundary = {
  id: 'fleet.log.create',
  label: 'Create fleet service log',
  purpose: 'Add an organization-scoped service history record for a registered Nexus fleet device.',
  allowedRoles: ['TECHNICIAN', 'SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
  futureTable: 'nexus_fleet_service_logs',
  liveEffect: 'private-write',
  piiLogPolicy: 'no-client-fields',
};

export const NEXUS_FLEET_ACTION_BOUNDARIES: readonly NexusFleetActionBoundary[] = [
  NEXUS_FLEET_SERVICE_LOG_BOUNDARY,
];

export const getNexusFleetActionBoundary = (
  actionId: NexusFleetActionInput['actionId']
): NexusFleetActionBoundary =>
  NEXUS_FLEET_ACTION_BOUNDARIES.find((boundary) => boundary.id === actionId) ??
  NEXUS_FLEET_SERVICE_LOG_BOUNDARY;

export const buildNexusFleetAuditPayload = (
  input: NexusFleetActionInput,
  authContext?: NexusServiceAuthContext | null
): NexusFleetAuditPayload => ({
  actionId: input.actionId,
  entityKind: 'fleet-service-log',
  requestedByRole: authContext?.role,
  organizationScoped: Boolean(authContext?.organizationId),
  deviceId: input.deviceId,
  logType: input.type,
  datePresent: input.date.trim().length > 0,
  descriptionLength: input.description.trim().length,
  technicianLength: input.technician.trim().length,
});

export const resolveNexusFleetActionDecision = (
  authContext: NexusServiceAuthContext | null,
  input: NexusFleetActionInput
): NexusFleetActionDecision => {
  const boundary = getNexusFleetActionBoundary(input.actionId);
  const auditPayload = buildNexusFleetAuditPayload(input, authContext);

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

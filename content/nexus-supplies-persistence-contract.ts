import type {
  NexusServiceAuthContext,
  NexusServicePersistenceMode,
} from './nexus-service-persistence-contract';
import type { NexusServiceLiveEffect, NexusServiceRole } from './nexus-service-app-contract';

export const NEXUS_SUPPLIES_REQUISITION_STATUSES = [
  'Queued',
  'Needs review',
] as const;

export type NexusSuppliesRequisitionStatus =
  (typeof NEXUS_SUPPLIES_REQUISITION_STATUSES)[number];

export type NexusSuppliesPersistenceRecordKind = 'supply-requisition';

export interface NexusSuppliesRequisitionInput {
  actionId: 'supplies.requisition.create';
  lineCount: number;
  totalPacks: number;
  approvalOnlyLines: number;
  nextStatus: NexusSuppliesRequisitionStatus;
}

export type NexusSuppliesActionInput = NexusSuppliesRequisitionInput;

export const isNexusSuppliesActionId = (
  value: unknown
): value is NexusSuppliesActionInput['actionId'] =>
  value === 'supplies.requisition.create';

export interface NexusSuppliesActionBoundary {
  id: NexusSuppliesActionInput['actionId'];
  label: string;
  purpose: string;
  allowedRoles: readonly NexusServiceRole[];
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: 'aggregate-only' | 'redacted' | 'no-client-fields';
}

export interface NexusSuppliesAuditPayload {
  actionId: NexusSuppliesActionInput['actionId'];
  entityKind: NexusSuppliesPersistenceRecordKind;
  requestedByRole?: NexusServiceRole;
  organizationScoped: boolean;
  lineCount: number;
  totalPacks: number;
  approvalOnlyLines: number;
  nextStatus: NexusSuppliesRequisitionStatus;
}

export interface NexusSuppliesActionDecision {
  allowed: boolean;
  reason: 'allowed' | 'auth_required' | 'role_not_allowed';
  actionId: NexusSuppliesActionInput['actionId'];
  requestedByRole?: NexusServiceRole;
  persistenceMode: NexusServicePersistenceMode;
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  auditPayload: NexusSuppliesAuditPayload;
}

const NEXUS_SUPPLIES_REQUISITION_BOUNDARY: NexusSuppliesActionBoundary = {
  id: 'supplies.requisition.create',
  label: 'Create supply requisition',
  purpose:
    'Create an organization-scoped supply requisition summary while keeping item names, SKUs, prices, contacts, and clinic details out of public preview telemetry and server audit payloads.',
  allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
  futureTable: 'nexus_supply_requisitions',
  liveEffect: 'private-write',
  piiLogPolicy: 'aggregate-only',
};

export const NEXUS_SUPPLIES_ACTION_BOUNDARIES: readonly NexusSuppliesActionBoundary[] = [
  NEXUS_SUPPLIES_REQUISITION_BOUNDARY,
];

export const getNexusSuppliesActionBoundary = (
  actionId: NexusSuppliesActionInput['actionId']
): NexusSuppliesActionBoundary =>
  NEXUS_SUPPLIES_ACTION_BOUNDARIES.find((boundary) => boundary.id === actionId) ??
  NEXUS_SUPPLIES_REQUISITION_BOUNDARY;

export const buildNexusSuppliesAuditPayload = (
  input: NexusSuppliesActionInput,
  authContext?: NexusServiceAuthContext | null
): NexusSuppliesAuditPayload => ({
  actionId: input.actionId,
  entityKind: 'supply-requisition',
  requestedByRole: authContext?.role,
  organizationScoped: Boolean(authContext?.organizationId),
  lineCount: input.lineCount,
  totalPacks: input.totalPacks,
  approvalOnlyLines: input.approvalOnlyLines,
  nextStatus: input.nextStatus,
});

export const resolveNexusSuppliesActionDecision = (
  authContext: NexusServiceAuthContext | null,
  input: NexusSuppliesActionInput
): NexusSuppliesActionDecision => {
  const boundary = getNexusSuppliesActionBoundary(input.actionId);
  const auditPayload = buildNexusSuppliesAuditPayload(input, authContext);

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

import type {
  NexusServiceAuthContext,
  NexusServicePersistenceMode,
} from './nexus-service-persistence-contract';
import type { NexusServiceLiveEffect, NexusServiceRole } from './nexus-service-app-contract';

export const NEXUS_DOCS_TEMPLATE_IDS = [
  'informed-consent',
  'liability-waiver',
  'hbot-consent',
  'pemf-consent',
  'health-intake',
  'protocol-agreement',
] as const;

export const NEXUS_DOCS_TEMPLATE_CATEGORIES = [
  'consent',
  'liability',
  'intake',
  'protocol',
] as const;

export type NexusDocsTemplateId = (typeof NEXUS_DOCS_TEMPLATE_IDS)[number];
export type NexusDocsTemplateCategory =
  (typeof NEXUS_DOCS_TEMPLATE_CATEGORIES)[number];

export type NexusDocsPersistenceRecordKind = 'document-packet';

const isNexusDocsTemplateId = (value: unknown): value is NexusDocsTemplateId =>
  typeof value === 'string' &&
  (NEXUS_DOCS_TEMPLATE_IDS as readonly string[]).includes(value);

const isNexusDocsTemplateCategory = (
  value: unknown
): value is NexusDocsTemplateCategory =>
  typeof value === 'string' &&
  (NEXUS_DOCS_TEMPLATE_CATEGORIES as readonly string[]).includes(value);

export interface NexusDocsDocumentPacketInput {
  actionId: 'docs.packet.prepare';
  templateId: NexusDocsTemplateId;
  category: NexusDocsTemplateCategory;
  required: boolean;
  clientNamePresent: boolean;
  clinicNamePresent: boolean;
}

export type NexusDocsActionInput = NexusDocsDocumentPacketInput;

export const isNexusDocsActionId = (
  value: unknown
): value is NexusDocsActionInput['actionId'] => value === 'docs.packet.prepare';

export const isPlausibleNexusDocsDocumentPacket = (
  input: Pick<
    NexusDocsDocumentPacketInput,
    | 'templateId'
    | 'category'
    | 'required'
    | 'clientNamePresent'
    | 'clinicNamePresent'
  >
): input is Pick<
  NexusDocsDocumentPacketInput,
  | 'templateId'
  | 'category'
  | 'required'
  | 'clientNamePresent'
  | 'clinicNamePresent'
> =>
  isNexusDocsTemplateId(input.templateId) &&
  isNexusDocsTemplateCategory(input.category) &&
  typeof input.required === 'boolean' &&
  typeof input.clientNamePresent === 'boolean' &&
  typeof input.clinicNamePresent === 'boolean';

export interface NexusDocsActionBoundary {
  id: NexusDocsActionInput['actionId'];
  label: string;
  purpose: string;
  allowedRoles: readonly NexusServiceRole[];
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: 'aggregate-only' | 'redacted' | 'no-client-fields';
}

export interface NexusDocsAuditPayload {
  actionId: NexusDocsActionInput['actionId'];
  entityKind: NexusDocsPersistenceRecordKind;
  requestedByRole?: NexusServiceRole;
  organizationScoped: boolean;
  templateId: NexusDocsTemplateId;
  category: NexusDocsTemplateCategory;
  required: boolean;
  clientNamePresent: boolean;
  clinicNamePresent: boolean;
}

export interface NexusDocsActionDecision {
  allowed: boolean;
  reason: 'allowed' | 'auth_required' | 'role_not_allowed';
  actionId: NexusDocsActionInput['actionId'];
  requestedByRole?: NexusServiceRole;
  persistenceMode: NexusServicePersistenceMode;
  futureTable: string;
  liveEffect: NexusServiceLiveEffect;
  auditPayload: NexusDocsAuditPayload;
}

const NEXUS_DOCS_DOCUMENT_PACKET_BOUNDARY: NexusDocsActionBoundary = {
  id: 'docs.packet.prepare',
  label: 'Prepare document packet',
  purpose:
    'Prepare an organization-scoped document packet while keeping client and facility names out of public preview telemetry and server audit payloads.',
  allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
  futureTable: 'nexus_document_packets',
  liveEffect: 'private-write',
  piiLogPolicy: 'no-client-fields',
};

export const NEXUS_DOCS_ACTION_BOUNDARIES: readonly NexusDocsActionBoundary[] = [
  NEXUS_DOCS_DOCUMENT_PACKET_BOUNDARY,
];

export const getNexusDocsActionBoundary = (
  actionId: NexusDocsActionInput['actionId']
): NexusDocsActionBoundary =>
  NEXUS_DOCS_ACTION_BOUNDARIES.find((boundary) => boundary.id === actionId) ??
  NEXUS_DOCS_DOCUMENT_PACKET_BOUNDARY;

export const buildNexusDocsAuditPayload = (
  input: NexusDocsActionInput,
  authContext?: NexusServiceAuthContext | null
): NexusDocsAuditPayload => ({
  actionId: input.actionId,
  entityKind: 'document-packet',
  requestedByRole: authContext?.role,
  organizationScoped: Boolean(authContext?.organizationId),
  templateId: input.templateId,
  category: input.category,
  required: input.required,
  clientNamePresent: input.clientNamePresent,
  clinicNamePresent: input.clinicNamePresent,
});

export const resolveNexusDocsActionDecision = (
  authContext: NexusServiceAuthContext | null,
  input: NexusDocsActionInput
): NexusDocsActionDecision => {
  const boundary = getNexusDocsActionBoundary(input.actionId);
  const auditPayload = buildNexusDocsAuditPayload(input, authContext);

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

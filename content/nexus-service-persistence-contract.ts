import {
  NEXUS_SERVICE_ACTION_BOUNDARIES,
  type NexusServiceActionBoundary,
  type NexusServiceLiveEffect,
  type NexusServiceRole,
  canNexusServiceRolePerform,
} from './nexus-service-app-contract';

export type NexusServicePersistenceMode =
  | 'none'
  | 'private-write'
  | 'review-draft'
  | 'blocked';

export type NexusServicePersistenceRecordKind =
  | 'visit'
  | 'profile'
  | 'shared-note'
  | 'company-todo'
  | 'parts-draft'
  | 'parts-order'
  | 'manual-link'
  | 'manual-extraction'
  | 'owner-report';

export interface NexusServiceAuthContext {
  userId: string;
  role: NexusServiceRole;
  organizationId: string;
  personId?: string;
  ownerDeviceIds?: string[];
}

export interface NexusServicePartDraftLineInput {
  partNumber: string;
  label?: string;
  quantity: number;
  reason?: string;
}

export type NexusServiceManualLinkTargetType = 'device' | 'visit' | 'part';

export interface NexusServiceOwnerManualReferenceInput {
  targetType: NexusServiceManualLinkTargetType;
  targetId: string;
  documentId: string;
  documentTitle: string;
  documentVersion: string;
  ownerReportLabel: string;
  reviewStatus: 'Linked' | 'Review needed';
}

export type NexusServiceActionInput =
  | {
      actionId: 'visit.select';
      deviceId: string;
      visitId: string;
    }
  | {
      actionId: 'note.create';
      deviceId: string;
      visitId?: string;
      scope: 'owner-visible' | 'technician-only' | 'company';
      body: string;
    }
  | {
      actionId: 'todo.assign';
      deviceId: string;
      title: string;
      scope?: 'Company' | 'Owner' | 'Technician';
      assigneePersonId?: string;
      dueDate?: string;
      priority?: 'High' | 'Medium' | 'Routine';
      status?: 'open' | 'done';
    }
  | {
      actionId: 'parts.draft.create';
      deviceId: string;
      visitId?: string;
      lines: NexusServicePartDraftLineInput[];
    }
  | {
      actionId: 'parts.order.submit';
      draftId: string;
      managerApprovalToken?: string;
    }
  | {
      actionId: 'manual.link';
      deviceId: string;
      targetType: NexusServiceManualLinkTargetType;
      targetId: string;
      targetLabel?: string;
      documentId: string;
      documentVersion: string;
    }
  | {
      actionId: 'manual.extraction.queue';
      deviceId: string;
      targetType: NexusServiceManualLinkTargetType;
      targetId: string;
      targetLabel?: string;
      documentId: string;
      documentVersion: string;
      requestedOutcome: string;
      extractionChecklist: string[];
    }
  | {
      actionId: 'manual.extraction.review';
      queueId: string;
      documentId: string;
      reviewStatus: 'in-review' | 'owner-safe-draft' | 'blocked';
    }
  | {
      actionId: 'report.publishOwner';
      reportId: string;
      deviceId: string;
      visitId?: string;
      ownerSummary: string;
      finalStatus?: 'draft-review' | 'owner-ready' | 'published' | 'cancelled';
      checklistCount?: number;
      manualReferences?: NexusServiceOwnerManualReferenceInput[];
    }
  | {
      actionId: 'report.publishOwnerStatus';
      reportId: string;
      finalStatus: 'published' | 'cancelled';
    }
  | {
      actionId: 'profile.ownerDeviceScope.assign';
      ownerProfileId: string;
      ownerDeviceIds: string[];
    };

export type NexusServiceActionId = NexusServiceActionInput['actionId'];

export interface NexusServicePersistencePlan {
  actionId: NexusServiceActionId;
  recordKind: NexusServicePersistenceRecordKind;
  futureTable: string | null;
  mode: NexusServicePersistenceMode;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: NexusServiceActionBoundary['piiLogPolicy'];
}

export interface NexusServiceActionDecision {
  allowed: boolean;
  reason:
    | 'allowed'
    | 'auth_required'
    | 'role_not_allowed'
    | 'scope_not_allowed'
    | 'external_ordering_disabled'
    | 'unknown_action';
  actionId: NexusServiceActionId;
  requestedByRole?: NexusServiceRole;
  persistenceMode: NexusServicePersistenceMode;
  futureTable: string | null;
  liveEffect: NexusServiceLiveEffect;
  auditPayload: NexusServiceAuditPayload;
}

export interface NexusServiceAuditPayload {
  actionId: string;
  entityKind: NexusServicePersistenceRecordKind | 'unknown';
  requestedByRole?: NexusServiceRole;
  organizationScoped: boolean;
  scope?: string;
  lineCount?: number;
  quantityTotal?: number;
  bodyLength?: number;
  titleLength?: number;
  hasAssignee?: boolean;
  hasDueDate?: boolean;
  summaryLength?: number;
  checklistCount?: number;
  manualReferenceCount?: number;
  ownerDeviceCount?: number;
  targetType?: string;
  hasDocumentVersion?: boolean;
  extractionChecklistCount?: number;
  requestedOutcomeLength?: number;
  hasQueueId?: boolean;
  reviewStatus?: string;
  finalStatus?: string;
}

const ACTION_TO_RECORD_KIND = {
  'visit.select': 'visit',
  'profile.ownerDeviceScope.assign': 'profile',
  'note.create': 'shared-note',
  'todo.assign': 'company-todo',
  'parts.draft.create': 'parts-draft',
  'parts.order.submit': 'parts-order',
  'manual.link': 'manual-link',
  'manual.extraction.queue': 'manual-extraction',
  'manual.extraction.review': 'manual-extraction',
  'report.publishOwner': 'owner-report',
  'report.publishOwnerStatus': 'owner-report',
} satisfies Record<
  NexusServiceActionId,
  NexusServicePersistenceRecordKind
>;

const ACTION_TO_FUTURE_TABLE = {
  'visit.select': 'nexus_service_visits',
  'profile.ownerDeviceScope.assign': 'nexus_service_profiles',
  'note.create': 'nexus_service_notes',
  'todo.assign': 'nexus_service_todos',
  'parts.draft.create': 'nexus_service_parts_drafts',
  'parts.order.submit': 'nexus_service_parts_orders',
  'manual.link': 'nexus_service_manual_document_links',
  'manual.extraction.queue': 'nexus_service_manual_extraction_queue',
  'manual.extraction.review': 'nexus_service_manual_extraction_queue',
  'report.publishOwner': 'nexus_service_reports',
  'report.publishOwnerStatus': 'nexus_service_reports',
} satisfies Record<NexusServiceActionId, string>;

const LIVE_EFFECT_TO_PERSISTENCE_MODE = {
  none: 'none',
  'private-write': 'private-write',
  'review-draft': 'review-draft',
  'external-write-blocked': 'blocked',
} satisfies Record<NexusServiceLiveEffect, NexusServicePersistenceMode>;

const KNOWN_ACTION_IDS = Object.keys(
  ACTION_TO_RECORD_KIND
) as NexusServiceActionId[];

const isNexusServiceActionId = (actionId: string): actionId is NexusServiceActionId =>
  KNOWN_ACTION_IDS.includes(actionId as NexusServiceActionId);

const getBoundary = (actionId: NexusServiceActionId): NexusServiceActionBoundary | undefined =>
  NEXUS_SERVICE_ACTION_BOUNDARIES.find(
    (boundary) => boundary.id === actionId
  );

export const getNexusServicePersistencePlanForAction = (
  actionId: string
): NexusServicePersistencePlan | null => {
  if (!isNexusServiceActionId(actionId)) {
    return null;
  }

  const boundary = getBoundary(actionId);

  if (!boundary) {
    return null;
  }

  return {
    actionId,
    recordKind: ACTION_TO_RECORD_KIND[actionId],
    futureTable: ACTION_TO_FUTURE_TABLE[actionId],
    mode: LIVE_EFFECT_TO_PERSISTENCE_MODE[boundary.liveEffect],
    liveEffect: boundary.liveEffect,
    piiLogPolicy: boundary.piiLogPolicy,
  };
};

export const buildNexusServiceAuditPayload = (
  input: NexusServiceActionInput,
  authContext?: NexusServiceAuthContext | null
): NexusServiceAuditPayload => {
  const plan = getNexusServicePersistencePlanForAction(input.actionId);
  const basePayload: NexusServiceAuditPayload = {
    actionId: input.actionId,
    entityKind: plan?.recordKind ?? 'unknown',
    requestedByRole: authContext?.role,
    organizationScoped: Boolean(authContext?.organizationId),
  };

  if (input.actionId === 'note.create') {
    return {
      ...basePayload,
      scope: input.scope,
      bodyLength: input.body.trim().length,
    };
  }

  if (input.actionId === 'todo.assign') {
    return {
      ...basePayload,
      titleLength: input.title.trim().length,
      hasAssignee: Boolean(input.assigneePersonId),
      hasDueDate: Boolean(input.dueDate),
    };
  }

  if (input.actionId === 'parts.draft.create') {
    return {
      ...basePayload,
      lineCount: input.lines.length,
      quantityTotal: input.lines.reduce(
        (total, line) => total + Math.max(0, Math.trunc(line.quantity || 0)),
        0
      ),
    };
  }

  if (input.actionId === 'report.publishOwner') {
    return {
      ...basePayload,
      summaryLength: input.ownerSummary.trim().length,
      checklistCount: Math.max(0, Math.trunc(input.checklistCount ?? 0)),
      manualReferenceCount: input.manualReferences?.length ?? 0,
    };
  }

  if (input.actionId === 'report.publishOwnerStatus') {
    return {
      ...basePayload,
      finalStatus: input.finalStatus,
    };
  }

  if (input.actionId === 'manual.link') {
    return {
      ...basePayload,
      targetType: input.targetType,
      hasDocumentVersion: Boolean(input.documentVersion),
    };
  }

  if (input.actionId === 'manual.extraction.queue') {
    return {
      ...basePayload,
      targetType: input.targetType,
      hasDocumentVersion: Boolean(input.documentVersion),
      extractionChecklistCount: input.extractionChecklist.length,
      requestedOutcomeLength: input.requestedOutcome.trim().length,
    };
  }

  if (input.actionId === 'manual.extraction.review') {
    return {
      ...basePayload,
      hasQueueId: Boolean(input.queueId.trim()),
      reviewStatus: input.reviewStatus,
    };
  }

  if (input.actionId === 'profile.ownerDeviceScope.assign') {
    return {
      ...basePayload,
      ownerDeviceCount: input.ownerDeviceIds.length,
    };
  }

  return basePayload;
};

export const resolveNexusServiceActionDecision = (
  authContext: NexusServiceAuthContext | null,
  input: NexusServiceActionInput
): NexusServiceActionDecision => {
  const plan = getNexusServicePersistencePlanForAction(input.actionId);
  const auditPayload = buildNexusServiceAuditPayload(input, authContext);

  if (!plan) {
    return {
      allowed: false,
      reason: 'unknown_action',
      actionId: input.actionId,
      requestedByRole: authContext?.role,
      persistenceMode: 'blocked',
      futureTable: null,
      liveEffect: 'external-write-blocked',
      auditPayload,
    };
  }

  if (!authContext) {
    return {
      allowed: false,
      reason: 'auth_required',
      actionId: input.actionId,
      persistenceMode: 'blocked',
      futureTable: plan.futureTable,
      liveEffect: plan.liveEffect,
      auditPayload,
    };
  }

  if (!canNexusServiceRolePerform(authContext.role, input.actionId)) {
    return {
      allowed: false,
      reason: 'role_not_allowed',
      actionId: input.actionId,
      requestedByRole: authContext.role,
      persistenceMode: 'blocked',
      futureTable: plan.futureTable,
      liveEffect: plan.liveEffect,
      auditPayload,
    };
  }

  if (
    input.actionId === 'note.create' &&
    authContext.role === 'OWNER' &&
    input.scope !== 'owner-visible'
  ) {
    return {
      allowed: false,
      reason: 'scope_not_allowed',
      actionId: input.actionId,
      requestedByRole: authContext.role,
      persistenceMode: 'blocked',
      futureTable: plan.futureTable,
      liveEffect: plan.liveEffect,
      auditPayload,
    };
  }

  if (plan.liveEffect === 'external-write-blocked') {
    return {
      allowed: false,
      reason: 'external_ordering_disabled',
      actionId: input.actionId,
      requestedByRole: authContext.role,
      persistenceMode: 'blocked',
      futureTable: plan.futureTable,
      liveEffect: plan.liveEffect,
      auditPayload,
    };
  }

  return {
    allowed: true,
    reason: 'allowed',
    actionId: input.actionId,
    requestedByRole: authContext.role,
    persistenceMode: plan.mode,
    futureTable: plan.futureTable,
    liveEffect: plan.liveEffect,
    auditPayload,
  };
};

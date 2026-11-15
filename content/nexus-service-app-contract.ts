export const NEXUS_SERVICE_ROLES = [
  'OWNER',
  'TECHNICIAN',
  'SERVICE_MANAGER',
  'OPERATIONS_ADMIN',
] as const;

export type NexusServiceRole = (typeof NEXUS_SERVICE_ROLES)[number];

export const isNexusServiceRole = (role: string): role is NexusServiceRole =>
  NEXUS_SERVICE_ROLES.includes(role as NexusServiceRole);

export const NEXUS_SERVICE_VISIBILITY_SCOPES = [
  'owner-visible',
  'technician-only',
  'company',
  'manager-review',
] as const;

export type NexusServiceVisibilityScope =
  (typeof NEXUS_SERVICE_VISIBILITY_SCOPES)[number];

export type NexusServiceLiveEffect =
  | 'none'
  | 'private-write'
  | 'review-draft'
  | 'external-write-blocked';

export interface NexusServiceEntityPlan {
  id: string;
  futureTable: string;
  purpose: string;
  serviceAppSource: string;
  requiredFields: readonly string[];
  privateFields: readonly string[];
  visibility: NexusServiceVisibilityScope;
}

export interface NexusServiceActionBoundary {
  id: string;
  label: string;
  purpose: string;
  allowedRoles: readonly NexusServiceRole[];
  requiredScope: NexusServiceVisibilityScope;
  liveEffect: NexusServiceLiveEffect;
  piiLogPolicy: 'aggregate-only' | 'redacted' | 'no-client-fields';
  blocksUntil?: string;
}

export const NEXUS_SERVICE_ENTITY_PLAN: readonly NexusServiceEntityPlan[] = [
  {
    id: 'organization',
    futureTable: 'nexus_service_organizations',
    purpose: 'Company or owner account that owns people, devices, visits, notes, and tasks.',
    serviceAppSource: 'ClientRecord plus future Hylono account organization',
    requiredFields: ['id', 'displayName', 'accountType', 'createdAt', 'updatedAt'],
    privateFields: ['billingEmail', 'phone', 'address'],
    visibility: 'company',
  },
  {
    id: 'person',
    futureTable: 'nexus_service_people',
    purpose: 'Owner, technician, manager, or operations teammate that can receive tasks.',
    serviceAppSource: 'Contact and serviceman/owner signature fields from the service app',
    requiredFields: ['id', 'organizationId', 'role', 'displayName', 'status'],
    privateFields: ['email', 'phone', 'signatureRef'],
    visibility: 'company',
  },
  {
    id: 'device',
    futureTable: 'nexus_service_devices',
    purpose: 'Installed chamber or hydrogen product linked to catalog model facts and manuals.',
    serviceAppSource: 'DeviceData, ClientRegistryDevice, and ChamberModelProfile',
    requiredFields: [
      'id',
      'organizationId',
      'modelSlug',
      'serialNumber',
      'installationStatus',
    ],
    privateFields: ['installAddress', 'ownerNotes'],
    visibility: 'owner-visible',
  },
  {
    id: 'serviceVisit',
    futureTable: 'nexus_service_visits',
    purpose: 'Scheduled or active service visit with status, checklist, assigned people, and closeout state.',
    serviceAppSource: 'ReportData, ChecklistSection, ChecklistItem, and HistoryEntry',
    requiredFields: ['id', 'deviceId', 'status', 'priority', 'serviceWindow', 'assignedPersonIds'],
    privateFields: ['technicianNotes', 'rawMeasurements', 'photoRefs'],
    visibility: 'technician-only',
  },
  {
    id: 'serviceReport',
    futureTable: 'nexus_service_reports',
    purpose: 'Owner-safe service closeout assembled from checklist, photos, signatures, and recommendations.',
    serviceAppSource: 'ReportData plus reportPdfBuilder output',
    requiredFields: ['id', 'visitId', 'reportNumber', 'finalStatus', 'ownerAcceptedAt'],
    privateFields: ['clientSignatureRef', 'techSignatureRef', 'internalFindings'],
    visibility: 'manager-review',
  },
  {
    id: 'sharedNote',
    futureTable: 'nexus_service_notes',
    purpose: 'Note routed to owner, technician, or company context without leaking note body to analytics.',
    serviceAppSource: 'SmartNoteArea and report observations/recommendations fields',
    requiredFields: ['id', 'visitId', 'authorPersonId', 'scope', 'body', 'createdAt'],
    privateFields: ['body'],
    visibility: 'manager-review',
  },
  {
    id: 'todo',
    futureTable: 'nexus_service_todos',
    purpose: 'Company-wide or person-specific task linked to visits, devices, or manual follow-up.',
    serviceAppSource: 'ServicePlanningPanel task planning concepts',
    requiredFields: ['id', 'organizationId', 'scope', 'assigneePersonId', 'title', 'status'],
    privateFields: ['internalNote'],
    visibility: 'company',
  },
  {
    id: 'partsDraft',
    futureTable: 'nexus_service_parts_drafts',
    purpose: 'Replacement-part request draft that can be reviewed before any real order or stock mutation.',
    serviceAppSource: 'PartsModal, CatalogPart, and AdditionalPart',
    requiredFields: ['id', 'visitId', 'createdByPersonId', 'status', 'lines', 'totalCents'],
    privateFields: ['managerComment', 'supplierQuoteRef'],
    visibility: 'manager-review',
  },
  {
    id: 'manualDocumentLink',
    futureTable: 'nexus_service_manual_document_links',
    purpose: 'Version-aware link between devices, parts, visits, and imported manual/catalogue documents.',
    serviceAppSource: 'ManualsModal and Omega-AI asset catalog document IDs',
    requiredFields: ['id', 'targetType', 'targetId', 'documentId', 'documentVersion', 'reviewStatus'],
    privateFields: ['internalExtractionNote'],
    visibility: 'company',
  },
  {
    id: 'manualExtractionQueue',
    futureTable: 'nexus_service_manual_extraction_queue',
    purpose: 'Review-draft queue for extracting owner-safe snippets from imported manuals before report use.',
    serviceAppSource: 'ManualsModal extraction checklist plus Omega-AI asset catalog document IDs',
    requiredFields: ['id', 'targetType', 'targetId', 'documentId', 'documentVersion', 'reviewStatus'],
    privateFields: ['internalExtractionNote', 'rawPageText'],
    visibility: 'manager-review',
  },
];

export const NEXUS_SERVICE_ACTION_BOUNDARIES: readonly NexusServiceActionBoundary[] = [
  {
    id: 'visit.select',
    label: 'Open service visit',
    purpose: 'Read the visit workspace and linked device facts.',
    allowedRoles: ['OWNER', 'TECHNICIAN', 'SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'owner-visible',
    liveEffect: 'none',
    piiLogPolicy: 'aggregate-only',
  },
  {
    id: 'note.create',
    label: 'Create shared note',
    purpose: 'Create a scoped owner, technician, or company note.',
    allowedRoles: ['OWNER', 'TECHNICIAN', 'SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'manager-review',
    liveEffect: 'private-write',
    piiLogPolicy: 'no-client-fields',
  },
  {
    id: 'todo.assign',
    label: 'Assign todo',
    purpose: 'Assign a task to the company, owner, or specific serviceperson.',
    allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'company',
    liveEffect: 'private-write',
    piiLogPolicy: 'aggregate-only',
  },
  {
    id: 'parts.draft.create',
    label: 'Create parts draft',
    purpose: 'Stage replacement parts for review without touching stock or fulfillment.',
    allowedRoles: ['TECHNICIAN', 'SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'manager-review',
    liveEffect: 'review-draft',
    piiLogPolicy: 'aggregate-only',
  },
  {
    id: 'parts.order.submit',
    label: 'Submit real parts order',
    purpose: 'Convert an approved draft into an external order.',
    allowedRoles: ['OPERATIONS_ADMIN'],
    requiredScope: 'manager-review',
    liveEffect: 'external-write-blocked',
    piiLogPolicy: 'redacted',
    blocksUntil: 'stock, pricing, payment, supplier, and manager approval integrations exist',
  },
  {
    id: 'manual.link',
    label: 'Link manual document',
    purpose: 'Attach an imported manual/catalogue document to a device, part, or visit.',
    allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'company',
    liveEffect: 'private-write',
    piiLogPolicy: 'aggregate-only',
  },
  {
    id: 'manual.extraction.queue',
    label: 'Queue manual extraction',
    purpose: 'Queue an owner-safe extraction review for a catalogue/manual document before report use.',
    allowedRoles: ['TECHNICIAN', 'SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'manager-review',
    liveEffect: 'review-draft',
    piiLogPolicy: 'aggregate-only',
  },
  {
    id: 'manual.extraction.review',
    label: 'Review manual extraction',
    purpose: 'Promote or block a queued owner-safe manual extraction row after manager review.',
    allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'manager-review',
    liveEffect: 'private-write',
    piiLogPolicy: 'aggregate-only',
  },
  {
    id: 'report.publishOwner',
    label: 'Publish owner report',
    purpose: 'Publish owner-safe closeout after checklist, parts, and notes are reviewed.',
    allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'manager-review',
    liveEffect: 'private-write',
    piiLogPolicy: 'redacted',
  },
  {
    id: 'report.publishOwnerStatus',
    label: 'Release owner report status',
    purpose: 'Move an owner-ready report into the published owner-visible state after manager review.',
    allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'manager-review',
    liveEffect: 'private-write',
    piiLogPolicy: 'aggregate-only',
  },
  {
    id: 'profile.ownerDeviceScope.assign',
    label: 'Assign owner device scope',
    purpose: 'Grant an owner profile access to published reports for assigned device IDs.',
    allowedRoles: ['SERVICE_MANAGER', 'OPERATIONS_ADMIN'],
    requiredScope: 'manager-review',
    liveEffect: 'private-write',
    piiLogPolicy: 'aggregate-only',
  },
];

export const getNexusServiceActionsForRole = (
  role: NexusServiceRole
): readonly NexusServiceActionBoundary[] =>
  NEXUS_SERVICE_ACTION_BOUNDARIES.filter((action) => action.allowedRoles.includes(role));

export const canNexusServiceRolePerform = (
  role: NexusServiceRole,
  actionId: string
): boolean =>
  NEXUS_SERVICE_ACTION_BOUNDARIES.some(
    (action) => action.id === actionId && action.allowedRoles.includes(role)
  );

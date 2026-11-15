import {
  hydrogenModelBySlug,
  type HydrogenModel,
} from '@/content/hydrogen-catalog-2026';

export type ServicePriority = 'High' | 'Medium' | 'Routine';
export type ServiceVisitStatus = 'Owner review' | 'Technician active' | 'Parts pending';
export type ServiceTaskScope = 'Company' | 'Owner' | 'Technician';
export type ServiceManualStatus = 'Ready' | 'Needs extraction' | 'Manager-only';
export type ServiceManualPacketKind =
  | 'User manual'
  | 'Product brochure'
  | 'Price list'
  | 'Offer packet';
export type ServiceManualVisibility = 'Technician' | 'Owner-safe' | 'Manager-only';
export type NexusServiceManualLinkTargetType = 'device' | 'visit' | 'part';
export type NexusServiceManualExtractionStatus =
  | 'Queued'
  | 'In review'
  | 'Owner-safe draft'
  | 'Blocked';

export interface NexusServiceVisit {
  id: string;
  client: string;
  location: string;
  modelSlug: string;
  serial: string;
  status: ServiceVisitStatus;
  priority: ServicePriority;
  window: string;
  technician: string;
  owner: string;
  summary: string;
  openTasks: number;
  partsCount: number;
}

export interface NexusServiceNote {
  id: string;
  author: string;
  target: ServiceTaskScope;
  body: string;
  time: string;
  source?: 'authenticated' | 'local';
}

export interface NexusServiceTodo {
  id: string;
  title: string;
  scope: ServiceTaskScope;
  owner: string;
  due: string;
  priority: ServicePriority;
  done: boolean;
  source?: 'authenticated' | 'local';
}

export interface NexusServicePartLine {
  id: string;
  name: string;
  sku: string;
  modelScope: string;
  availability: string;
  unitPrice: number;
  reason: string;
  defaultQty: number;
}

export interface NexusServicePartsDraftHistoryItem {
  id: string;
  deviceId: string;
  visitId?: string;
  createdBy: string;
  status: 'Review draft' | 'Manager review' | 'Approved' | 'Cancelled';
  lineCount: number;
  quantityTotal: number;
  totalValue: number;
  submittedAt: string;
  source: 'authenticated';
}

export interface NexusServiceOwnerReportHistoryItem {
  id: string;
  deviceId: string;
  visitId?: string;
  reportId: string;
  reportNumber: string;
  finalStatus: 'Draft review' | 'Owner-ready' | 'Published' | 'Cancelled';
  summary: string;
  ownerSummaryLength: number;
  checklistCount: number;
  manualReferences?: NexusServiceOwnerManualReference[];
  createdBy: string;
  publishedAt: string;
  source: 'authenticated';
}

export interface NexusServiceManualEntry {
  id: string;
  title: string;
  source: string;
  status: ServiceManualStatus;
  audience: string;
  modelHint: string;
  packetKind: ServiceManualPacketKind;
  visibility: ServiceManualVisibility;
  documentVersion: string;
  sourceRef: string;
  serviceUse: string;
  ownerHandoff: string;
  nextAction: string;
  ownerReportLabel: string;
  ownerReportEligible: boolean;
  extractionChecklist: readonly string[];
}

export interface NexusServiceManualLinkHistoryItem {
  id: string;
  deviceId: string;
  targetType: NexusServiceManualLinkTargetType;
  targetId: string;
  targetLabel?: string;
  documentId: string;
  documentTitle: string;
  documentSource?: string;
  documentVersion: string;
  packetKind?: ServiceManualPacketKind;
  visibility?: ServiceManualVisibility;
  ownerReportLabel?: string;
  ownerReportEligible?: boolean;
  reviewStatus: 'Linked' | 'Review needed';
  linkedBy: string;
  linkedAt: string;
  source: 'authenticated';
}

export interface NexusServiceManualExtractionQueueItem {
  id: string;
  deviceId: string;
  targetType: NexusServiceManualLinkTargetType;
  targetId: string;
  targetLabel?: string;
  documentId: string;
  documentTitle: string;
  documentVersion: string;
  sourceRef?: string;
  packetKind?: ServiceManualPacketKind;
  visibility?: ServiceManualVisibility;
  ownerReportLabel?: string;
  requestedOutcome: string;
  checklistCount: number;
  reviewStatus: NexusServiceManualExtractionStatus;
  requestedBy: string;
  queuedAt: string;
  source: 'authenticated';
}

export interface NexusServiceOwnerManualReference {
  targetType: NexusServiceManualLinkTargetType;
  targetId: string;
  documentId: string;
  documentTitle: string;
  documentVersion: string;
  ownerReportLabel: string;
  reviewStatus: 'Linked' | 'Review needed';
}

export interface NexusServiceOperationsSummary {
  activeVisits: number;
  openTodos: number;
  ownerNotes: number;
  activePartPacks: number;
  readyManuals: number;
  draftLineCount: number;
  totalDraftValue: number;
}

export interface NexusServiceDraftSnapshot {
  version: 1;
  notes: NexusServiceNote[];
  todos: NexusServiceTodo[];
  draft: Record<string, number>;
  updatedAt: string;
}

export const NEXUS_SERVICE_DRAFT_STORAGE_KEY =
  'hylono:nexus-service-preview-draft:v1';
export const NEXUS_SERVICE_DRAFT_PREVIEW_UPDATED_AT =
  '2026-01-20T10:00:00.000Z';
export const NEXUS_SERVICE_DRAFT_PREVIEW_UPDATED_LABEL = '10:00 preview';

export const SERVICE_MODEL_SLUGS = [
  'pr-ho900',
  'pr-ho1800-p',
  'za-ho6000',
  'wo-b600',
] as const;

export const SERVICE_TASK_FILTERS: ReadonlyArray<'All' | ServiceTaskScope> = [
  'All',
  'Company',
  'Owner',
  'Technician',
];

export const NEXUS_SERVICE_VISITS: readonly NexusServiceVisit[] = [
  {
    id: 'svc-2407',
    client: 'Clinic owner sample',
    location: 'Warsaw operator room',
    modelSlug: 'pr-ho900',
    serial: 'HY-PR-0900-014',
    status: 'Technician active',
    priority: 'High',
    window: 'Today 10:00-12:00',
    technician: 'Service lead',
    owner: 'Facility owner',
    summary:
      'Pressure check, tubing route review, owner handoff note, and parts draft before closeout.',
    openTasks: 5,
    partsCount: 2,
  },
  {
    id: 'svc-2411',
    client: 'Home owner sample',
    location: 'Krakow private setup',
    modelSlug: 'pr-ho1800-p',
    serial: 'HY-PRP-1800-031',
    status: 'Owner review',
    priority: 'Medium',
    window: 'Tomorrow 14:30',
    technician: 'Remote support',
    owner: 'Device owner',
    summary:
      'Owner needs a clear note about pulse-mode accessories and safe next support step.',
    openTasks: 3,
    partsCount: 1,
  },
  {
    id: 'svc-2418',
    client: 'Performance studio sample',
    location: 'Gdansk studio floor',
    modelSlug: 'za-ho6000',
    serial: 'HY-ZA-6000-006',
    status: 'Parts pending',
    priority: 'Routine',
    window: 'Friday 09:00',
    technician: 'Field team',
    owner: 'Studio manager',
    summary:
      'High-output unit needs filter review, photo proof, and owner-visible closeout summary.',
    openTasks: 4,
    partsCount: 3,
  },
];

export const INITIAL_NEXUS_SERVICE_NOTES: readonly NexusServiceNote[] = [
  {
    id: 'note-1',
    author: 'Service lead',
    target: 'Owner',
    body:
      'Owner can see: visit is active, warranty outcome is not promised, support will confirm the next part route.',
    time: '10 min ago',
  },
  {
    id: 'note-2',
    author: 'Technician',
    target: 'Company',
    body:
      'Keep the PR-HO900 tubing replacement as manager review until compatibility is confirmed.',
    time: '22 min ago',
  },
];

export const INITIAL_NEXUS_SERVICE_TODOS: readonly NexusServiceTodo[] = [
  {
    id: 'todo-1',
    title: 'Capture serial plate and setup photos',
    scope: 'Technician',
    owner: 'Field team',
    due: 'Today',
    priority: 'High',
    done: false,
  },
  {
    id: 'todo-2',
    title: 'Approve owner-visible service note',
    scope: 'Owner',
    owner: 'Facility owner',
    due: 'Today',
    priority: 'Medium',
    done: false,
  },
  {
    id: 'todo-3',
    title: 'Review company parts queue every Friday',
    scope: 'Company',
    owner: 'Operations',
    due: 'Weekly',
    priority: 'Routine',
    done: true,
  },
  {
    id: 'todo-4',
    title: 'Attach manual page reference before closeout',
    scope: 'Technician',
    owner: 'Service lead',
    due: 'Before report',
    priority: 'Medium',
    done: false,
  },
];

export const NEXUS_SERVICE_PART_LINES: readonly NexusServicePartLine[] = [
  {
    id: 'tubing-kit',
    name: 'Quick-connect tubing set',
    sku: 'HY-SVC-TUBE-041',
    modelScope: 'PR-HO platform',
    availability: 'Manager review',
    unitPrice: 390,
    reason: 'Often needed after route or pressure review.',
    defaultQty: 1,
  },
  {
    id: 'filter-set',
    name: 'Service filter cartridge set',
    sku: 'HY-SVC-FLT-118',
    modelScope: 'Advanced stations',
    availability: 'Draft ready',
    unitPrice: 520,
    reason: 'Recommended when run hours or pressure notes indicate review.',
    defaultQty: 1,
  },
  {
    id: 'seal-bundle',
    name: 'Door seal gasket bundle',
    sku: 'HY-SVC-SEAL-102',
    modelScope: 'Chamber service',
    availability: 'Quote required',
    unitPrice: 760,
    reason: 'Owner approval and technician note required before order.',
    defaultQty: 0,
  },
];

export const NEXUS_SERVICE_MANUAL_LIBRARY: readonly NexusServiceManualEntry[] = [
  {
    id: 'manual-hx3000',
    title: 'GY-HX3000 user manual',
    source: 'New Catalogue/GY-HX3000-01 -user manual-English.pdf',
    status: 'Ready',
    audience: 'Technician',
    modelHint: 'Hydrogen inhaler setup and operation',
    packetKind: 'User manual',
    visibility: 'Technician',
    documentVersion: 'catalog-source-v1',
    sourceRef: 'H2-MAN-HX3000-V1',
    serviceUse: 'Use for setup, operating sequence, and visit closeout checks.',
    ownerHandoff: 'Attach owner-safe setup or care reference after confirming the exact page.',
    nextAction: 'Ready for manager linking when the visit model and serial match.',
    ownerReportLabel: 'GY-HX3000 setup reference',
    ownerReportEligible: true,
    extractionChecklist: [
      'Confirm model and serial match before attaching',
      'Reference setup or owner-care page in the closeout note',
      'Keep raw technician findings outside the owner report',
    ],
  },
  {
    id: 'manual-suyzeko',
    title: 'Suyzeko hydrogen inhaler brochure',
    source: 'New Catalogue/Suyzeko hydrogen inhaler.pdf',
    status: 'Needs extraction',
    audience: 'Service lead',
    modelHint: 'Hydrogen line comparison',
    packetKind: 'Product brochure',
    visibility: 'Owner-safe',
    documentVersion: 'catalog-source-v1',
    sourceRef: 'H2-BRO-SUYZEKO-V1',
    serviceUse: 'Compare H2 model options before replacement or accessory recommendations.',
    ownerHandoff: 'Use extracted model options in owner-visible notes after manager review.',
    nextAction: 'Extract the model/spec table before this document is used in a report.',
    ownerReportLabel: 'Suyzeko hydrogen model reference',
    ownerReportEligible: false,
    extractionChecklist: [
      'Extract model names and capacity notes',
      'Separate product facts from marketing language',
      'Map relevant accessories to the parts draft queue',
    ],
  },
  {
    id: 'manual-price',
    title: 'Hydrogen products price list',
    source: 'New Catalogue/Suyzeko Hydrogen products price list.pdf',
    status: 'Manager-only',
    audience: 'Owner and operations',
    modelHint: 'Replacement and quote context',
    packetKind: 'Price list',
    visibility: 'Manager-only',
    documentVersion: 'catalog-source-v1',
    sourceRef: 'H2-COM-PRICE-V1',
    serviceUse: 'Support quote review for replacement parts and H2 accessories.',
    ownerHandoff: 'Share only manager-approved quote context; never imply live stock or fixed pricing.',
    nextAction: 'Keep behind manager review until supplier, stock, and approval proof exist.',
    ownerReportLabel: 'Commercial quote reference',
    ownerReportEligible: false,
    extractionChecklist: [
      'Flag rows that require current supplier confirmation',
      'Keep service-report pricing as manager-reviewed context',
      'Do not expose price rows as automatic ordering proof',
    ],
  },
  {
    id: 'manual-omega3-offer',
    title: 'Omega3 H2 offer packet',
    source: 'New Catalogue/Omega3_Oferta_H2_podzielony_A4.pdf',
    status: 'Needs extraction',
    audience: 'Owner and service operations',
    modelHint: 'H2 offer package and service handoff context',
    packetKind: 'Offer packet',
    visibility: 'Owner-safe',
    documentVersion: 'catalog-source-v1',
    sourceRef: 'H2-OFFER-OMEGA3-V1',
    serviceUse: 'Cross-check package scope when a service visit becomes an owner handoff.',
    ownerHandoff: 'Turn only reviewed package details into owner-safe next steps.',
    nextAction: 'Extract owner-safe package sections before linking from closeout reports.',
    ownerReportLabel: 'Omega3 H2 package reference',
    ownerReportEligible: false,
    extractionChecklist: [
      'Extract product/package names without unsupported claims',
      'Mark warranty or commercial language for manager approval',
      'Connect package accessories to the replacement-part draft queue',
    ],
  },
];

export const getServiceModel = (slug: string): HydrogenModel | undefined =>
  hydrogenModelBySlug[slug];

export const getServiceModelLabel = (slug: string): string =>
  getServiceModel(slug)?.model ?? slug.toUpperCase();

export const selectedServiceModelFacts: readonly HydrogenModel[] = SERVICE_MODEL_SLUGS.map(
  (slug) => getServiceModel(slug)
).filter((model): model is HydrogenModel => Boolean(model));

export const buildInitialPartsDraft = (): Record<string, number> =>
  Object.fromEntries(
    NEXUS_SERVICE_PART_LINES.map((part) => [part.id, part.defaultQty])
  );

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isServiceTaskScope = (value: unknown): value is ServiceTaskScope =>
  value === 'Company' || value === 'Owner' || value === 'Technician';

const isServicePriority = (value: unknown): value is ServicePriority =>
  value === 'High' || value === 'Medium' || value === 'Routine';

const normalizeNote = (value: unknown): NexusServiceNote | null => {
  if (!isRecord(value) || !isServiceTaskScope(value.target)) {
    return null;
  }

  const { author, body, id, time } = value;
  if (
    typeof author !== 'string' ||
    typeof body !== 'string' ||
    typeof id !== 'string' ||
    typeof time !== 'string'
  ) {
    return null;
  }

  return {
    id,
    author,
    target: value.target,
    body,
    time,
  };
};

const normalizeTodo = (value: unknown): NexusServiceTodo | null => {
  if (
    !isRecord(value) ||
    !isServiceTaskScope(value.scope) ||
    !isServicePriority(value.priority)
  ) {
    return null;
  }

  const { done, due, id, owner, title } = value;
  if (
    typeof done !== 'boolean' ||
    typeof due !== 'string' ||
    typeof id !== 'string' ||
    typeof owner !== 'string' ||
    typeof title !== 'string'
  ) {
    return null;
  }

  return {
    id,
    title,
    scope: value.scope,
    owner,
    due,
    priority: value.priority,
    done,
  };
};

const normalizeDraft = (value: unknown): Record<string, number> => {
  if (!isRecord(value)) {
    return buildInitialPartsDraft();
  }

  return Object.fromEntries(
    NEXUS_SERVICE_PART_LINES.map((part) => {
      const quantity = value[part.id];
      return [
        part.id,
        typeof quantity === 'number' && Number.isFinite(quantity)
          ? Math.max(0, Math.floor(quantity))
          : part.defaultQty,
      ];
    })
  );
};

export const buildNexusServiceDraftSnapshot = ({
  draft = buildInitialPartsDraft(),
  notes = INITIAL_NEXUS_SERVICE_NOTES,
  todos = INITIAL_NEXUS_SERVICE_TODOS,
  updatedAt = NEXUS_SERVICE_DRAFT_PREVIEW_UPDATED_AT,
}: {
  draft?: Record<string, number>;
  notes?: readonly NexusServiceNote[];
  todos?: readonly NexusServiceTodo[];
  updatedAt?: string;
} = {}): NexusServiceDraftSnapshot => ({
  version: 1,
  notes: [...notes],
  todos: [...todos],
  draft: normalizeDraft(draft),
  updatedAt,
});

export const normalizeNexusServiceDraftSnapshot = (
  value: unknown
): NexusServiceDraftSnapshot | null => {
  if (!isRecord(value) || value.version !== 1) {
    return null;
  }

  const notes = Array.isArray(value.notes)
    ? value.notes.map(normalizeNote).filter((note): note is NexusServiceNote => Boolean(note))
    : [...INITIAL_NEXUS_SERVICE_NOTES];
  const todos = Array.isArray(value.todos)
    ? value.todos.map(normalizeTodo).filter((todo): todo is NexusServiceTodo => Boolean(todo))
    : [...INITIAL_NEXUS_SERVICE_TODOS];

  return {
    version: 1,
    notes: notes.length > 0 ? notes : [...INITIAL_NEXUS_SERVICE_NOTES],
    todos: todos.length > 0 ? todos : [...INITIAL_NEXUS_SERVICE_TODOS],
    draft: normalizeDraft(value.draft),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
};

export const buildNexusServiceOperationsSummary = ({
  visits = NEXUS_SERVICE_VISITS,
  todos = INITIAL_NEXUS_SERVICE_TODOS,
  notes = INITIAL_NEXUS_SERVICE_NOTES,
  manuals = NEXUS_SERVICE_MANUAL_LIBRARY,
  parts = NEXUS_SERVICE_PART_LINES,
  draft = buildInitialPartsDraft(),
}: {
  visits?: readonly NexusServiceVisit[];
  todos?: readonly NexusServiceTodo[];
  notes?: readonly NexusServiceNote[];
  manuals?: readonly NexusServiceManualEntry[];
  parts?: readonly NexusServicePartLine[];
  draft?: Record<string, number>;
} = {}): NexusServiceOperationsSummary => {
  const draftLines = parts.filter((part) => (draft[part.id] ?? 0) > 0);

  return {
    activeVisits: visits.length,
    openTodos: todos.filter((todo) => !todo.done).length,
    ownerNotes: notes.filter((note) => note.target === 'Owner').length,
    activePartPacks: draftLines.reduce((sum, part) => sum + (draft[part.id] ?? 0), 0),
    readyManuals: manuals.filter((manual) => manual.status === 'Ready').length,
    draftLineCount: draftLines.length,
    totalDraftValue: draftLines.reduce(
      (sum, part) => sum + part.unitPrice * (draft[part.id] ?? 0),
      0
    ),
  };
};

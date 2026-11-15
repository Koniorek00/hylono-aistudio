'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  MessageSquareText,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRoundCheck,
  Wrench,
} from 'lucide-react';
import { formatPln } from '@/content/hydrogen-catalog-2026';
import {
  buildInitialPartsDraft,
  buildNexusServiceDraftSnapshot,
  buildNexusServiceOperationsSummary,
  getServiceModel,
  getServiceModelLabel,
  INITIAL_NEXUS_SERVICE_NOTES,
  INITIAL_NEXUS_SERVICE_TODOS,
  NEXUS_SERVICE_DRAFT_PREVIEW_UPDATED_LABEL,
  NEXUS_SERVICE_DRAFT_STORAGE_KEY,
  NEXUS_SERVICE_MANUAL_LIBRARY,
  NEXUS_SERVICE_PART_LINES,
  NEXUS_SERVICE_VISITS,
  normalizeNexusServiceDraftSnapshot,
  selectedServiceModelFacts,
  SERVICE_TASK_FILTERS,
  type NexusServiceManualEntry,
  type NexusServiceManualExtractionQueueItem,
  type NexusServiceManualLinkHistoryItem,
  type NexusServiceOwnerManualReference,
  type NexusServiceNote,
  type NexusServiceOwnerReportHistoryItem,
  type NexusServicePartsDraftHistoryItem,
  type NexusServiceTodo,
  type ServiceManualStatus,
  type ServicePriority,
  type ServiceTaskScope,
  type ServiceVisitStatus,
} from '@/content/nexus-service-operations';
import analytics from '@/src/lib/analytics';
import type {
  NexusServiceServerActionResult,
  NexusServiceServerActionStatus,
} from '@/src/actions/nexusServiceActionCore';
import type { NexusServiceRole } from '@/content/nexus-service-app-contract';
import type { NexusServiceOwnerDeviceScopeItem } from '@/src/actions/nexusServiceProfile';
import { PartnerLayout } from './PartnerLayout';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';

const VISIT_STATUS_CLASSES: Record<ServiceVisitStatus, string> = {
  'Owner review': 'border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] text-cyan-800',
  'Technician active': 'border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] text-emerald-800',
  'Parts pending': 'border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] text-amber-800',
};

const PRIORITY_CLASSES: Record<ServicePriority, string> = {
  High: 'border border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10] text-rose-800',
  Medium: 'border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] text-amber-800',
  Routine: 'border border-[#e2e8f0] bg-[#f1f5f9] text-[#475569]',
};

const MANUAL_STATUS_CLASSES: Record<ServiceManualStatus, string> = {
  Ready: 'border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] text-emerald-800',
  'Needs extraction': 'border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] text-amber-800',
  'Manager-only': 'border border-[#e2e8f0] bg-[#f8fafc] text-[#475569]',
};

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none';
const DARK_FOCUS_RING = FOCUS_RING;
const SERVICE_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.service.href;
const SERVICE_SUPPLIES_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.supplies.href;
const SERVICE_ACTION_STATUS_ID = 'nexus-service-action-status';
const SERVICE_HANDOFF_EXPORT_STATUS_ID = 'nexus-service-handoff-export-status';
const SERVICE_HANDOFF_EXPORT_STATUS_LABEL = 'Nexus service handoff export status';
const SERVICE_OWNER_REPORT_BRIDGE_STATUS_ID = 'nexus-service-owner-report-bridge-status';
const SERVICE_OWNER_REPORT_BRIDGE_STATUS_LABEL =
  'Nexus service owner report bridge status';
const SERVICE_QUEUE_STATUS_ID = 'nexus-service-queue-status';
const SERVICE_QUEUE_STATUS_LABEL = 'Nexus service queue status';
const SERVICE_TODO_FILTER_STATUS_ID = 'nexus-service-todo-filter-status';
const SERVICE_TODO_FILTER_STATUS_LABEL = 'Nexus service todo filter status';
const SERVICE_CLOSEOUT_DRAFT_COPY_STATUS_ID =
  'nexus-service-closeout-draft-copy-status';
const SERVICE_CLOSEOUT_DRAFT_COPY_STATUS_LABEL =
  'Nexus service closeout draft copy status';
const SERVICE_PARTS_DRAFT_STATUS_ID = 'nexus-service-parts-draft-status';
const SERVICE_PARTS_DRAFT_STATUS_LABEL = 'Nexus service parts draft status';
const SERVICE_DRAFT_NOTICE_STATUS_ID = 'nexus-service-draft-notice-status';
const SERVICE_DRAFT_NOTICE_STATUS_LABEL = 'Nexus service draft notice status';
const SERVICE_OWNER_DEVICE_SCOPE_STATUS_ID =
  'nexus-service-owner-device-scope-status';
const SERVICE_OWNER_DEVICE_SCOPE_STATUS_LABEL =
  'Nexus service owner device scope status';
const buildLocalServiceNoteId = (sequence: number) =>
  `note-local-${String(sequence).padStart(2, '0')}`;

type PersistedStorageStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing';
type PersistedRestrictedStorageStatus = PersistedStorageStatus | 'role_not_allowed';
type PersistedNoteStorageStatus = PersistedStorageStatus | 'service_profile_required';
type PersistedTodoStorageStatus = PersistedStorageStatus | 'service_profile_required';
type PersistedPartsDraftStorageStatus =
  | PersistedRestrictedStorageStatus
  | 'service_profile_required';
type PersistedOwnerReportStorageStatus =
  | PersistedRestrictedStorageStatus
  | 'service_profile_required';
type ServiceReadbackStorageStatus =
  | PersistedRestrictedStorageStatus
  | PersistedNoteStorageStatus
  | PersistedTodoStorageStatus
  | PersistedPartsDraftStorageStatus
  | PersistedOwnerReportStorageStatus;
type ServiceReadbackTone = 'ready' | 'watch' | 'blocked' | 'neutral';

const SERVICE_STORAGE_STATUS_META = {
  loaded: {
    label: 'Connected',
    tone: 'ready',
    summary: 'Authenticated storage is reachable.',
  },
  database_error: {
    label: 'Storage error',
    tone: 'blocked',
    summary: 'Authenticated storage could not be reached.',
  },
  database_not_configured: {
    label: 'Not configured',
    tone: 'blocked',
    summary: 'Private storage is not configured in this environment.',
  },
  auth_context_missing: {
    label: 'Sign-in needed',
    tone: 'watch',
    summary: 'Sign in with a verified Nexus service profile to load private records.',
  },
  service_profile_required: {
    label: 'Profile needed',
    tone: 'watch',
    summary: 'A verified Nexus service profile is required before private records load.',
  },
  role_not_allowed: {
    label: 'Role limited',
    tone: 'neutral',
    summary: 'This role can read the lane boundary but cannot manage those private records.',
  },
} satisfies Record<
  ServiceReadbackStorageStatus,
  {
    label: string;
    tone: ServiceReadbackTone;
    summary: string;
  }
>;

type NexusServiceActionRunner = (
  prevState: NexusServiceServerActionResult,
  formData: FormData
) => Promise<NexusServiceServerActionResult>;

type NexusServiceActivityTimelineItem = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  actor: string;
  timeLabel: string;
  status: string;
  scope: string;
  sortValue: number;
};

type NexusServiceManualEvidenceGapRow = {
  id: string;
  reportNumber: string;
  deviceId: string;
  finalStatus: string;
  savedAt: string;
  manualReferenceCount: number;
  linkedOwnerSafeCount: number;
  ownerSafeExtractionCount: number;
  status: string;
  detail: string;
  hasGap: boolean;
};

type NexusServiceHandoffStatusItem = {
  id: string;
  label: string;
  value: string;
  status: string;
  detail: string;
  tone: 'ready' | 'watch' | 'blocked' | 'neutral';
};

type NexusServiceVisitHandoffPacketItem = {
  id: string;
  label: string;
  value: string;
  status: string;
  detail: string;
  audience: 'Owner' | 'Technician' | 'Company';
  tone: ServiceReadbackTone;
};

type NexusServiceCloseoutComposerItem = {
  id: string;
  label: string;
  status: string;
  detail: string;
  source: string;
  tone: 'ready' | 'watch' | 'blocked' | 'neutral';
};

type NexusServiceSharedDispatchItem = {
  id: ServiceTaskScope;
  label: string;
  status: string;
  noteCount: number;
  openTaskCount: number;
  detail: string;
  tone: ServiceReadbackTone;
};

type NexusServiceReadbackIndexItem = {
  id: string;
  label: string;
  value: string;
  status: string;
  detail: string;
  tone: ServiceReadbackTone;
  storageStatus: ServiceReadbackStorageStatus;
};

type NexusServiceStorageRecoveryActionItem = {
  id: 'parts-drafts' | 'owner-reports';
  label: string;
  value: string;
  status: string;
  detail: string;
  action: string;
  tone: ServiceReadbackTone;
};

type NexusServiceOwnerPublishedReportDigestRow = {
  id: string;
  deviceId: string;
  reportNumber: string;
  finalStatus: string;
  summary: string;
  publishedAt: string;
  ownerNoteCount: number;
  manualReferenceCount: number;
  manualReferenceLabels: string[];
};

type NexusServiceOwnerPublishedHandoffPolishItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: 'ready' | 'watch' | 'neutral';
};

type NexusServiceOwnerServiceTimelineItem = {
  id: string;
  label: string;
  status: string;
  detail: string;
  timeLabel: string;
  tone: 'ready' | 'watch' | 'neutral';
};

type NexusServiceTechnicianWorkDigestItem = {
  id: string;
  label: string;
  value: string;
  status: string;
  detail: string;
  tone: 'ready' | 'watch' | 'neutral';
};

type NexusServiceTechnicianPartsManualHandoffItem = {
  id: string;
  label: string;
  value: string;
  status: string;
  detail: string;
  tone: 'ready' | 'watch' | 'neutral';
};

type NexusServicePartsManualEvidenceItem = {
  id: string;
  sku: string;
  label: string;
  quantity: number;
  status: string;
  manualStatus: string;
  catalogueDetail: string;
  manualDetail: string;
  approvalDetail: string;
  tone: 'ready' | 'watch';
};

type NexusServicePersistedPartsManualReadbackItem = {
  id: string;
  label: string;
  value: string;
  status: string;
  detail: string;
  tone: ServiceReadbackTone;
};

type NexusServiceNextActionCockpitItem = {
  id: 'attach-manual' | 'stage-parts' | 'owner-draft' | 'release-status';
  label: string;
  status: string;
  detail: string;
  actionLabel: string;
  actionState: 'available' | 'readonly' | 'blocked';
  backingLabel: string;
  backingDetail: string;
  tone: 'ready' | 'watch' | 'blocked' | 'neutral';
};

type NexusServiceManualExtractionReviewStatus =
  | 'in-review'
  | 'owner-safe-draft'
  | 'blocked';

interface ServiceOperationsProps {
  assignOwnerDeviceScopeAction?: NexusServiceActionRunner;
  assignTodoAction?: NexusServiceActionRunner;
  createNoteAction?: NexusServiceActionRunner;
  createPartsDraftAction?: NexusServiceActionRunner;
  currentServiceRole?: NexusServiceRole | null;
  queueManualExtractionAction?: NexusServiceActionRunner;
  reviewManualExtractionAction?: NexusServiceActionRunner;
  linkManualAction?: NexusServiceActionRunner;
  initialPersistedManualExtractionQueue?: NexusServiceManualExtractionQueueItem[];
  initialPersistedManualLinks?: NexusServiceManualLinkHistoryItem[];
  initialPersistedNotes?: NexusServiceNote[];
  initialPersistedOwnerReports?: NexusServiceOwnerReportHistoryItem[];
  initialPersistedPartsDrafts?: NexusServicePartsDraftHistoryItem[];
  initialPersistedTodos?: NexusServiceTodo[];
  initialOwnerDeviceScopes?: NexusServiceOwnerDeviceScopeItem[];
  ownerDeviceScopeStatus?: PersistedRestrictedStorageStatus;
  persistedManualLinksStatus?: PersistedRestrictedStorageStatus;
  persistedManualExtractionQueueStatus?: PersistedPartsDraftStorageStatus;
  persistedNotesStatus?: PersistedNoteStorageStatus;
  persistedOwnerReportsStatus?: PersistedOwnerReportStorageStatus;
  persistedPartsDraftsStatus?: PersistedPartsDraftStorageStatus;
  persistedTodosStatus?: PersistedTodoStorageStatus;
  publishOwnerReportAction?: NexusServiceActionRunner;
  publishOwnerReportStatusAction?: NexusServiceActionRunner;
  submitPartsOrderAction?: NexusServiceActionRunner;
}

const INITIAL_NEXUS_SERVICE_ACTION_STATE: NexusServiceServerActionResult = {
  success: false,
  status: 'auth_required',
  message: 'Server action boundary has not been requested yet.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
};

const ACTION_STATUS_LABELS: Record<NexusServiceServerActionStatus, string> = {
  validation_error: 'Input check failed',
  auth_required: 'Authentication required',
  service_profile_required: 'Service profile required',
  role_not_allowed: 'Role not allowed',
  external_ordering_disabled: 'Ordering disabled',
  persistence_error: 'Persistence failed',
  private_write_ready: 'Private write boundary ready',
  review_draft_ready: 'Review draft boundary ready',
};

const getManualActionLabel = (status: ServiceManualStatus) => {
  if (status === 'Needs extraction') {
    return 'Queue extraction';
  }

  if (status === 'Manager-only') {
    return 'Hold commercial ref';
  }

  return 'Link to visit';
};

const NOTE_SCOPE_FOR_ACTION: Record<ServiceTaskScope, 'owner-visible' | 'technician-only' | 'company'> = {
  Owner: 'owner-visible',
  Technician: 'technician-only',
  Company: 'company',
};

const trackServiceAction = (action: string, properties: Record<string, unknown> = {}) => {
  analytics.capture('nexus_service_route_action_clicked', {
    route: SERVICE_ROUTE_HREF,
    preview_record: true,
    action,
    ...properties,
  });
};

const normalizeOwnerDeviceScopeText = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 30);

const buildTimelineSortValue = (value: string, fallbackIndex: number) => {
  const timestampMatch = value.match(
    /(?<date>\d{4}-\d{2}-\d{2})(?:\s+(?<time>\d{2}:\d{2}))?/
  );

  if (!timestampMatch?.groups?.date) {
    return -fallbackIndex;
  }

  const parsed = Date.parse(
    `${timestampMatch.groups.date}T${timestampMatch.groups.time ?? '00:00'}:00Z`
  );

  return Number.isFinite(parsed) ? parsed : -fallbackIndex;
};

const getServiceStorageStatusMeta = (status: ServiceReadbackStorageStatus) =>
  SERVICE_STORAGE_STATUS_META[status];

const formatReadbackCount = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

export const ServiceOperations: React.FC<ServiceOperationsProps> = ({
  assignOwnerDeviceScopeAction,
  assignTodoAction,
  createNoteAction,
  createPartsDraftAction,
  currentServiceRole = null,
  queueManualExtractionAction,
  reviewManualExtractionAction,
  initialPersistedManualLinks = [],
  initialPersistedManualExtractionQueue = [],
  initialPersistedNotes = [],
  initialPersistedOwnerReports = [],
  initialPersistedPartsDrafts = [],
  initialPersistedTodos = [],
  initialOwnerDeviceScopes = [],
  linkManualAction,
  ownerDeviceScopeStatus = 'auth_context_missing',
  persistedManualExtractionQueueStatus = 'auth_context_missing',
  persistedManualLinksStatus = 'auth_context_missing',
  persistedNotesStatus = 'auth_context_missing',
  persistedOwnerReportsStatus = 'auth_context_missing',
  persistedPartsDraftsStatus = 'auth_context_missing',
  persistedTodosStatus = 'auth_context_missing',
  publishOwnerReportAction,
  publishOwnerReportStatusAction,
  submitPartsOrderAction,
}) => {
  const hasAuthenticatedManualLinkHistory = initialPersistedManualLinks.length > 0;
  const hasAuthenticatedManualExtractionQueue =
    initialPersistedManualExtractionQueue.length > 0;
  const hasAuthenticatedNoteHistory = initialPersistedNotes.length > 0;
  const hasAuthenticatedOwnerReportHistory = initialPersistedOwnerReports.length > 0;
  const hasAuthenticatedPartsDraftHistory = initialPersistedPartsDrafts.length > 0;
  const hasAuthenticatedTodoHistory = initialPersistedTodos.length > 0;
  const manualReadinessCounts = useMemo(
    () => [
      {
        label: 'Ready',
        value: NEXUS_SERVICE_MANUAL_LIBRARY.filter((manual) => manual.status === 'Ready')
          .length,
      },
      {
        label: 'Needs extraction',
        value: NEXUS_SERVICE_MANUAL_LIBRARY.filter(
          (manual) => manual.status === 'Needs extraction'
        ).length,
      },
      {
        label: 'Manager-only',
        value: NEXUS_SERVICE_MANUAL_LIBRARY.filter(
          (manual) => manual.status === 'Manager-only'
        ).length,
      },
      {
        label: 'Linked',
        value: initialPersistedManualLinks.length,
      },
    ],
    [initialPersistedManualLinks.length]
  );
  const canPublishOwnerReport =
    currentServiceRole === null ||
    currentServiceRole === 'SERVICE_MANAGER' ||
    currentServiceRole === 'OPERATIONS_ADMIN';
  const canReleaseOwnerReport =
    currentServiceRole === 'SERVICE_MANAGER' ||
    currentServiceRole === 'OPERATIONS_ADMIN';
  const canReadServiceActivityTimeline =
    currentServiceRole === 'SERVICE_MANAGER' ||
    currentServiceRole === 'OPERATIONS_ADMIN';
  const canReviewManualExtraction =
    currentServiceRole === 'SERVICE_MANAGER' ||
    currentServiceRole === 'OPERATIONS_ADMIN';
  const canAssignOwnerDeviceScope =
    currentServiceRole === 'SERVICE_MANAGER' ||
    currentServiceRole === 'OPERATIONS_ADMIN';
  const canManageSelectedVisitNextActions =
    currentServiceRole === null ||
    currentServiceRole === 'SERVICE_MANAGER' ||
    currentServiceRole === 'OPERATIONS_ADMIN';
  const canReadOwnerPublishedReportDigest = currentServiceRole === 'OWNER';
  const canReadTechnicianWorkDigest =
    currentServiceRole === null ||
    currentServiceRole === 'TECHNICIAN';
  const canReadSelectedVisitHandoffStatus =
    currentServiceRole === null ||
    canReleaseOwnerReport;
  const canReadSelectedVisitNextActionCockpit = currentServiceRole !== 'OWNER';
  const canUsePartsDraftWorkspace =
    currentServiceRole === null ||
    currentServiceRole === 'TECHNICIAN' ||
    currentServiceRole === 'SERVICE_MANAGER' ||
    currentServiceRole === 'OPERATIONS_ADMIN';
  const canCheckPartsOrderAuthority =
    currentServiceRole === null ||
    currentServiceRole === 'SERVICE_MANAGER' ||
    currentServiceRole === 'OPERATIONS_ADMIN';
  const partsDraftAuthorityMessage =
    currentServiceRole === 'TECHNICIAN'
      ? 'Technician access can stage replacement-part drafts for manager review. Supplier order gates and the supplies module stay manager/admin-only.'
      : currentServiceRole === 'SERVICE_MANAGER' || currentServiceRole === 'OPERATIONS_ADMIN'
        ? 'Manager/admin access can review staged drafts and check the blocked supplier order gate. External ordering remains disabled.'
        : 'Preview mode shows draft and manager order-gate boundaries. No supplier order is placed.';
  const ownerReportPublishBoundaryMessage =
    currentServiceRole === 'OWNER'
      ? 'Published reports are available here; a service manager must publish new owner report records.'
      : 'Report publishing is manager/admin-only for this service role.';
  const defaultLocalNotes = useMemo(
    () => (hasAuthenticatedNoteHistory ? [] : [...INITIAL_NEXUS_SERVICE_NOTES]),
    [hasAuthenticatedNoteHistory]
  );
  const defaultLocalTodos = useMemo(
    () => (hasAuthenticatedTodoHistory ? [] : [...INITIAL_NEXUS_SERVICE_TODOS]),
    [hasAuthenticatedTodoHistory]
  );
  const [selectedVisitId, setSelectedVisitId] = useState(NEXUS_SERVICE_VISITS[0]?.id ?? '');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState<'All' | ServiceTaskScope>('All');
  const [notes, setNotes] = useState<NexusServiceNote[]>(() => defaultLocalNotes);
  const [noteTarget, setNoteTarget] = useState<ServiceTaskScope>('Owner');
  const [noteText, setNoteText] = useState('');
  const [todos, setTodos] = useState<NexusServiceTodo[]>(() => defaultLocalTodos);
  const [draft, setDraft] = useState<Record<string, number>>(() => buildInitialPartsDraft());
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [serverActionResult, setServerActionResult] =
    useState<NexusServiceServerActionResult | null>(null);
  const [serverActionPending, setServerActionPending] = useState(false);
  const [handoffExportStatus, setHandoffExportStatus] = useState<
    'idle' | 'copied' | 'unavailable'
  >('idle');
  const [partsDraftExportStatus, setPartsDraftExportStatus] = useState<
    'idle' | 'copied' | 'unavailable'
  >('idle');
  const [partsManualReadbackCopyStatus, setPartsManualReadbackCopyStatus] = useState<
    'idle' | 'copied' | 'unavailable'
  >('idle');
  const [closeoutComposerCopyStatus, setCloseoutComposerCopyStatus] = useState<
    'idle' | 'copied' | 'unavailable'
  >('idle');
  const [ownerScopeProfileId, setOwnerScopeProfileId] = useState(
    initialOwnerDeviceScopes[0]?.id ?? ''
  );
  const [ownerDeviceScopeText, setOwnerDeviceScopeText] = useState(() => {
    const firstScope = initialOwnerDeviceScopes[0];
    if (firstScope && firstScope.ownerDeviceIds.length > 0) {
      return firstScope.ownerDeviceIds.join('\n');
    }

    return NEXUS_SERVICE_VISITS[0]?.serial ?? '';
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NEXUS_SERVICE_DRAFT_STORAGE_KEY);
      const snapshot = raw ? normalizeNexusServiceDraftSnapshot(JSON.parse(raw)) : null;

      if (snapshot) {
        setNotes(snapshot.notes);
        setTodos(snapshot.todos);
        setDraft(snapshot.draft);
        setLastSavedAt(snapshot.updatedAt || null);
      }
    } catch {
      setLastSavedAt(null);
    } finally {
      setDraftHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!draftHydrated) {
      return;
    }

    try {
      const snapshot = buildNexusServiceDraftSnapshot({ notes, todos, draft });
      window.localStorage.setItem(
        NEXUS_SERVICE_DRAFT_STORAGE_KEY,
        JSON.stringify(snapshot)
      );
      setLastSavedAt(snapshot.updatedAt);
    } catch {
      setLastSavedAt(null);
    }
  }, [draft, draftHydrated, notes, todos]);

  useEffect(() => {
    if (ownerScopeProfileId || initialOwnerDeviceScopes.length === 0) {
      return;
    }

    const firstOwnerScope = initialOwnerDeviceScopes[0];
    if (!firstOwnerScope) {
      return;
    }

    setOwnerScopeProfileId(firstOwnerScope.id);
    setOwnerDeviceScopeText(
      firstOwnerScope.ownerDeviceIds.length
        ? firstOwnerScope.ownerDeviceIds.join('\n')
        : NEXUS_SERVICE_VISITS[0]?.serial ?? ''
    );
  }, [initialOwnerDeviceScopes, ownerScopeProfileId]);

  const selectedVisit =
    NEXUS_SERVICE_VISITS.find((visit) => visit.id === selectedVisitId) ??
    NEXUS_SERVICE_VISITS[0];
  const selectedModel = selectedVisit ? getServiceModel(selectedVisit.modelSlug) : undefined;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredVisits = NEXUS_SERVICE_VISITS.filter((visit) => {
    if (normalizedSearchTerm.length === 0) return true;

    return [
      visit.id,
      visit.client,
      visit.location,
      visit.serial,
      getServiceModelLabel(visit.modelSlug),
      visit.technician,
      visit.owner,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearchTerm);
  });
  const serviceQueueStatusMessage = `${filteredVisits.length} of ${
    NEXUS_SERVICE_VISITS.length
  } service visit${NEXUS_SERVICE_VISITS.length === 1 ? '' : 's'} visible. Selected: ${
    selectedVisit ? `${selectedVisit.id} ${selectedVisit.serial}` : 'no selected visit'
  }. Search: ${normalizedSearchTerm.length > 0 ? searchTerm.trim() : 'no search term'}.`;
  const ownerDeviceScopeIds = useMemo(
    () => normalizeOwnerDeviceScopeText(ownerDeviceScopeText),
    [ownerDeviceScopeText]
  );
  const selectedOwnerDeviceScope = initialOwnerDeviceScopes.find(
    (scope) => scope.id === ownerScopeProfileId
  );
  const ownerDeviceScopeStorageMessage =
    ownerDeviceScopeStatus === 'loaded'
      ? initialOwnerDeviceScopes.length > 0
        ? `${initialOwnerDeviceScopes.length} active owner profile${
            initialOwnerDeviceScopes.length === 1 ? '' : 's'
          } loaded for device access.`
        : 'No active owner profiles are loaded for this organization yet.'
      : ownerDeviceScopeStatus === 'database_not_configured'
        ? 'Owner profile storage is not configured in this environment.'
        : ownerDeviceScopeStatus === 'database_error'
          ? 'Owner profile storage could not be reached.'
          : ownerDeviceScopeStatus === 'role_not_allowed'
            ? 'Owner device scope assignment is manager/admin-only.'
            : 'Sign in with a verified manager profile to load owner device scopes.';
  const ownerDeviceScopeStatusMessage = `${
    ownerDeviceScopeIds.length
  } device ID${ownerDeviceScopeIds.length === 1 ? '' : 's'} selected for ${
    ownerScopeProfileId.trim() || 'no owner profile'
  }. ${
    ownerScopeProfileId.trim() && ownerDeviceScopeIds.length > 0
      ? 'Save access scope will submit only ownerProfileId and normalized device IDs.'
      : 'Save access scope is blocked until an owner profile and at least one device ID are selected.'
  }`;

  const visibleTodos = useMemo(
    () =>
      [...initialPersistedTodos, ...todos].filter(
        (todo) => taskFilter === 'All' || todo.scope === taskFilter
      ),
    [initialPersistedTodos, taskFilter, todos]
  );
  const visibleOpenTodos = visibleTodos.filter((todo) => !todo.done);
  const serviceTodoFilterStatusMessage = `${visibleTodos.length} task${
    visibleTodos.length === 1 ? '' : 's'
  } visible for ${
    taskFilter === 'All' ? 'all scopes' : `${taskFilter} scope`
  }. ${visibleOpenTodos.length} open task${
    visibleOpenTodos.length === 1 ? '' : 's'
  } shown. Authenticated task rows stay read-only; local sample tasks can be toggled from the table.`;
  const visibleNotes = useMemo(
    () => [...initialPersistedNotes, ...notes],
    [initialPersistedNotes, notes]
  );
  const ownerVisibleNotes = useMemo(
    () => visibleNotes.filter((note) => note.target === 'Owner'),
    [visibleNotes]
  );
  const sharedDispatchItems = useMemo<NexusServiceSharedDispatchItem[]>(
    () =>
      (['Owner', 'Technician', 'Company'] as const).map((scope) => {
        const scopedNotes = visibleNotes.filter((note) => note.target === scope);
        const openScopedTodos = visibleTodos.filter(
          (todo) => todo.scope === scope && !todo.done
        );
        const label =
          scope === 'Owner'
            ? 'Owner sharing'
            : scope === 'Technician'
              ? 'Technician follow-up'
              : 'Company queue';
        const hasReadyNote = scopedNotes.length > 0;
        const hasOpenTasks = openScopedTodos.length > 0;
        const status =
          scope === 'Owner'
            ? hasReadyNote
              ? 'Owner note ready'
              : 'Needs owner note'
            : hasOpenTasks
              ? 'Action needed'
              : 'Clear';
        const detail =
          scope === 'Owner'
            ? hasReadyNote
              ? 'Owner-visible handoff text is available; keep private diagnostics out of owner notes.'
              : 'Add one owner-visible note before publishing a closeout.'
            : hasOpenTasks
              ? `${openScopedTodos.length} open ${scope.toLowerCase()} task${
                  openScopedTodos.length === 1 ? '' : 's'
                } need dispatch.`
              : `No open ${scope.toLowerCase()} task is blocking the selected visit.`;

        return {
          id: scope,
          label,
          status,
          noteCount: scopedNotes.length,
          openTaskCount: openScopedTodos.length,
          detail,
          tone:
            scope === 'Owner'
              ? hasReadyNote
                ? 'ready'
                : 'watch'
              : hasOpenTasks
                ? 'watch'
                : 'ready',
        };
      }),
    [visibleNotes, visibleTodos]
  );
  const ownerReportManualReferences = useMemo<NexusServiceOwnerManualReference[]>(() => {
    const selectedTargetId = selectedVisit?.id ?? 'sample-service-visit';
    const selectedDeviceId = selectedVisit?.serial;
    const readyManualReferences = NEXUS_SERVICE_MANUAL_LIBRARY.filter(
        (manual) => manual.ownerReportEligible && manual.status === 'Ready'
      ).map<NexusServiceOwnerManualReference>((manual) => ({
        targetType: 'visit' as const,
        targetId: selectedTargetId,
        documentId: manual.id,
        documentTitle: manual.title,
        documentVersion: manual.documentVersion,
        ownerReportLabel: manual.ownerReportLabel,
        reviewStatus: 'Linked' as const,
      }));
    const approvedExtractionReferences = initialPersistedManualExtractionQueue
      .filter(
        (queueItem) =>
          queueItem.reviewStatus === 'Owner-safe draft' &&
          queueItem.visibility === 'Owner-safe' &&
          Boolean(queueItem.ownerReportLabel) &&
          (queueItem.targetId === selectedTargetId ||
            (selectedDeviceId && queueItem.deviceId === selectedDeviceId))
      )
      .map<NexusServiceOwnerManualReference>((queueItem) => ({
        targetType: queueItem.targetType,
        targetId: queueItem.targetId,
        documentId: queueItem.documentId,
        documentTitle: queueItem.documentTitle,
        documentVersion: queueItem.documentVersion,
        ownerReportLabel: queueItem.ownerReportLabel ?? queueItem.documentTitle,
        reviewStatus: 'Linked' as const,
      }));
    const uniqueReferences = new Map<string, NexusServiceOwnerManualReference>();

    [...readyManualReferences, ...approvedExtractionReferences].forEach((reference) => {
      uniqueReferences.set(
        `${reference.targetType}:${reference.targetId}:${reference.documentId}:${reference.documentVersion}`,
        reference
      );
    });

    return [...uniqueReferences.values()];
  }, [initialPersistedManualExtractionQueue, selectedVisit?.id, selectedVisit?.serial]);
  const managerOnlyManualCount = useMemo(
    () =>
      NEXUS_SERVICE_MANUAL_LIBRARY.filter(
        (manual) => manual.visibility === 'Manager-only'
      ).length,
    []
  );

  const draftLines = NEXUS_SERVICE_PART_LINES.filter((part) => (draft[part.id] ?? 0) > 0).map((part) => ({
    ...part,
    quantity: draft[part.id] ?? 0,
  }));

  const operationsSummary = buildNexusServiceOperationsSummary({
    notes: visibleNotes,
    todos: visibleTodos,
    draft,
  });

  const {
    activePartPacks,
    activeVisits,
    openTodos,
    ownerNotes,
    readyManuals,
    totalDraftValue,
  } = operationsSummary;

  const checklist = useMemo(
    () => [
      {
        title: 'Identify unit',
        detail: selectedVisit
          ? `${getServiceModelLabel(selectedVisit.modelSlug)} - ${selectedVisit.serial}`
          : 'No visit selected',
        done: true,
      },
      {
        title: 'Attach owner-visible note',
        detail:
          ownerNotes > 0
            ? `${ownerNotes} owner note${ownerNotes === 1 ? '' : 's'} ready`
            : 'Owner note still needed',
        done: ownerNotes > 0,
      },
      {
        title: 'Stage parts request',
        detail:
          activePartPacks > 0
            ? `${activePartPacks} part pack${activePartPacks === 1 ? '' : 's'} staged`
            : 'No parts staged',
        done: activePartPacks > 0,
      },
      {
        title: 'Reference manual',
        detail: `${ownerReportManualReferences.length} owner-safe reference${
          ownerReportManualReferences.length === 1 ? '' : 's'
        } attached`,
        done: ownerReportManualReferences.length > 0,
      },
      {
        title: 'Save owner-safe report',
        detail: hasAuthenticatedOwnerReportHistory
          ? `${initialPersistedOwnerReports.length} report${
              initialPersistedOwnerReports.length === 1 ? '' : 's'
            } available for this profile`
          : 'Owner-safe report still needs publishing',
        done: hasAuthenticatedOwnerReportHistory,
      },
    ],
    [
      activePartPacks,
      hasAuthenticatedOwnerReportHistory,
      initialPersistedOwnerReports.length,
      ownerNotes,
      ownerReportManualReferences.length,
      selectedVisit,
    ]
  );

  const ownerReportSummary = useMemo(() => {
    const modelLabel = selectedVisit
      ? getServiceModelLabel(selectedVisit.modelSlug)
      : 'Selected Hylono unit';
    const deviceLabel = selectedVisit?.serial ?? 'sample-service-visit';
    const partsText =
      draftLines.length > 0
        ? `${draftLines.length} replacement-part line${
            draftLines.length === 1 ? '' : 's'
          } staged for manager review`
        : 'no replacement-part lines staged';

    return [
      `Owner-safe closeout for ${modelLabel} ${deviceLabel}.`,
      selectedVisit?.summary ?? 'Service visit summary is pending.',
      `${ownerVisibleNotes.length} owner-visible note${
        ownerVisibleNotes.length === 1 ? '' : 's'
      }, ${partsText}, and ${ownerReportManualReferences.length} owner-safe manual reference${
        ownerReportManualReferences.length === 1 ? '' : 's'
      } are attached for review.`,
    ].join(' ');
  }, [
    draftLines.length,
    ownerReportManualReferences.length,
    ownerVisibleNotes.length,
    selectedVisit,
  ]);

  const selectedVisitHandoffPacketItems = useMemo<NexusServiceVisitHandoffPacketItem[]>(() => {
    const openHandoffTodos = visibleTodos.filter((todo) => !todo.done);
    const manualLabels = ownerReportManualReferences
      .map((reference) => reference.documentTitle)
      .slice(0, 2);
    const manualDetail =
      ownerReportManualReferences.length > 0
        ? `${ownerReportManualReferences.length} owner-safe manual reference${
            ownerReportManualReferences.length === 1 ? '' : 's'
          } ready for closeout: ${manualLabels.join(', ')}.`
        : 'Attach one reviewed owner-safe manual reference before publishing the owner report.';
    const modelFactsDetail =
      selectedVisit && selectedModel
        ? `${getServiceModelLabel(selectedVisit.modelSlug)} ${selectedVisit.serial} has catalog facts ready: ${selectedModel.gas}, ${selectedModel.h2Value}.`
        : 'Catalog device facts are not mapped for the selected service visit yet.';

    return [
      {
        id: 'device-instructions',
        label: 'Device instructions',
        value: selectedVisit?.serial ?? 'No visit',
        status: selectedModel ? 'Ready' : 'Catalog gap',
        detail: modelFactsDetail,
        audience: 'Technician',
        tone: selectedModel ? 'ready' : 'blocked',
      },
      {
        id: 'owner-note',
        label: 'Owner note',
        value: String(ownerVisibleNotes.length),
        status: ownerVisibleNotes.length > 0 ? 'Ready' : 'Needs note',
        detail:
          ownerVisibleNotes.length > 0
            ? `${ownerVisibleNotes.length} owner-visible note${
                ownerVisibleNotes.length === 1 ? '' : 's'
              } available for the closeout report.`
            : 'Add a plain-language owner note before closing this visit.',
        audience: 'Owner',
        tone: ownerVisibleNotes.length > 0 ? 'ready' : 'watch',
      },
      {
        id: 'company-person-tasks',
        label: 'Company/person tasks',
        value: String(openHandoffTodos.length),
        status: openHandoffTodos.length > 0 ? 'Open' : 'Clear',
        detail:
          openHandoffTodos.length > 0
            ? `${openHandoffTodos.length} company/person task${
                openHandoffTodos.length === 1 ? '' : 's'
              } still ${openHandoffTodos.length === 1 ? 'needs' : 'need'} owner, technician, or company follow-up.`
            : 'No open company/person task is blocking this handoff.',
        audience: 'Company',
        tone: openHandoffTodos.length > 0 ? 'watch' : 'ready',
      },
      {
        id: 'review-only-parts',
        label: 'Review-only parts',
        value: String(draftLines.length),
        status: draftLines.length > 0 ? 'Manager review' : 'Empty',
        detail:
          draftLines.length > 0
            ? `${draftLines.length} replacement-part line${
                draftLines.length === 1 ? '' : 's'
              } staged for ${formatPln(totalDraftValue)}. Supplier ordering stays disabled until a manager approves.`
            : 'No replacement-part line is staged for manager review.',
        audience: 'Technician',
        tone: draftLines.length > 0 ? 'watch' : 'neutral',
      },
      {
        id: 'manual-references',
        label: 'Manual references',
        value: String(ownerReportManualReferences.length),
        status: ownerReportManualReferences.length > 0 ? 'Manual ready' : 'Missing',
        detail: manualDetail,
        audience: 'Owner',
        tone: ownerReportManualReferences.length > 0 ? 'ready' : 'watch',
      },
      {
        id: 'owner-closeout',
        label: 'Owner closeout',
        value: selectedVisit?.window ?? 'Draft',
        status: ownerVisibleNotes.length > 0 && ownerReportManualReferences.length > 0 ? 'Draft ready' : 'Needs review',
        detail: ownerReportSummary,
        audience: 'Owner',
        tone: ownerVisibleNotes.length > 0 && ownerReportManualReferences.length > 0 ? 'ready' : 'watch',
      },
    ];
  }, [
    draftLines.length,
    ownerReportManualReferences,
    ownerReportSummary,
    ownerVisibleNotes.length,
    selectedModel,
    selectedVisit,
    totalDraftValue,
    visibleTodos,
  ]);

  const selectedVisitHandoffReadyCount = selectedVisitHandoffPacketItems.filter(
    (item) => item.tone === 'ready'
  ).length;

  const selectedVisitHandoffExportText = useMemo(() => {
    const modelLabel = selectedVisit
      ? getServiceModelLabel(selectedVisit.modelSlug)
      : 'Selected Hylono unit';
    const openHandoffTodos = visibleTodos.filter((todo) => !todo.done);
    const ownerNoteLine =
      ownerVisibleNotes.length > 0
        ? `${ownerVisibleNotes.length} owner-visible note${
            ownerVisibleNotes.length === 1 ? '' : 's'
          } attached. Review the shared notes panel for exact owner text.`
        : 'No owner-visible note is attached yet.';
    const manualLine =
      ownerReportManualReferences.length > 0
        ? ownerReportManualReferences
            .map((reference) => reference.documentTitle)
            .slice(0, 3)
            .join('; ')
        : 'No owner-safe manual reference is attached yet.';
    const partsLine =
      draftLines.length > 0
        ? `${draftLines.length} review-only line${
            draftLines.length === 1 ? '' : 's'
          } / ${formatPln(totalDraftValue)}; manager approval required.`
        : 'No replacement-part line is staged for owner review.';

    return [
      'HYLONO OWNER-SAFE SERVICE HANDOFF',
      `Visit: ${selectedVisit?.id ?? 'sample-service-visit'} / ${
        selectedVisit?.serial ?? 'sample-service-visit'
      }`,
      `Device: ${modelLabel}`,
      `Window: ${selectedVisit?.window ?? 'Not scheduled'}`,
      `Owner note: ${ownerNoteLine}`,
      `Open company/person tasks: ${openHandoffTodos.length}`,
      `Review-only parts: ${partsLine}`,
      'Supplier ordering: disabled until manager approval.',
      `Manual references: ${manualLine}`,
      `Owner-safe closeout: ${ownerReportSummary}`,
      'Boundary: owner-safe summary only. Manager-only documents are withheld; raw technician notes, supplier quotes, commercial price lists, and photo evidence stay in the service workspace.',
    ].join('\n');
  }, [
    draftLines.length,
    ownerReportManualReferences,
    ownerReportSummary,
    ownerVisibleNotes,
    selectedVisit,
    totalDraftValue,
    visibleTodos,
  ]);

  const selectedVisitHandoffExportLineCount = selectedVisitHandoffExportText
    .split('\n')
    .filter(Boolean).length;

  const ownerReportStorageMessage =
    persistedOwnerReportsStatus === 'loaded'
      ? hasAuthenticatedOwnerReportHistory
        ? `${initialPersistedOwnerReports.length} authenticated owner report${
            initialPersistedOwnerReports.length === 1 ? '' : 's'
          } available for this service profile.`
        : 'Authenticated owner report storage is connected; no owner-visible reports are available yet.'
      : persistedOwnerReportsStatus === 'database_not_configured'
        ? 'Authenticated owner report storage is not configured in this environment.'
        : persistedOwnerReportsStatus === 'database_error'
          ? 'Authenticated owner report storage could not be reached.'
          : persistedOwnerReportsStatus === 'role_not_allowed'
            ? 'Owner report history is unavailable for this service role until a manager publishes an owner-safe report.'
            : persistedOwnerReportsStatus === 'service_profile_required'
              ? 'Owner report history requires a verified owner profile with assigned device scope.'
              : 'Sign in with a verified Nexus service profile to load owner report history.';
  const serviceReadbackIndexItems = useMemo<NexusServiceReadbackIndexItem[]>(() => {
    const authenticatedOpenTodoCount = initialPersistedTodos.filter(
      (todo) => !todo.done
    ).length;
    const buildItem = ({
      id,
      label,
      loadedDetail,
      storageStatus,
      unavailableDetail,
      value,
    }: {
      id: string;
      label: string;
      loadedDetail: string;
      storageStatus: ServiceReadbackStorageStatus;
      unavailableDetail: string;
      value: string;
    }): NexusServiceReadbackIndexItem => {
      const statusMeta = getServiceStorageStatusMeta(storageStatus);

      return {
        id,
        label,
        value,
        status: statusMeta.label,
        detail:
          storageStatus === 'loaded'
            ? loadedDetail
            : `${statusMeta.summary} ${unavailableDetail}`,
        tone: statusMeta.tone,
        storageStatus,
      };
    };

    return [
      buildItem({
        id: 'shared-notes',
        label: 'Shared notes',
        value: String(initialPersistedNotes.length),
        storageStatus: persistedNotesStatus,
        loadedDetail:
          initialPersistedNotes.length > 0
            ? `${formatReadbackCount(
                initialPersistedNotes.length,
                'authenticated shared note',
                'authenticated shared notes'
              )} loaded for owner/service handoff.`
            : 'Connected; no private shared notes are saved yet.',
        unavailableDetail: 'Local sample notes stay visible until private note storage loads.',
      }),
      buildItem({
        id: 'company-person-tasks',
        label: 'Company/person tasks',
        value: String(initialPersistedTodos.length),
        storageStatus: persistedTodosStatus,
        loadedDetail:
          initialPersistedTodos.length > 0
            ? `${formatReadbackCount(
                initialPersistedTodos.length,
                'authenticated company/person task',
                'authenticated company/person tasks'
              )} loaded; ${authenticatedOpenTodoCount} still open.`
            : 'Connected; no private company/person tasks are saved yet.',
        unavailableDetail: 'Local sample tasks stay visible until private task storage loads.',
      }),
      buildItem({
        id: 'parts-drafts',
        label: 'Parts drafts',
        value: String(initialPersistedPartsDrafts.length),
        storageStatus: persistedPartsDraftsStatus,
        loadedDetail:
          initialPersistedPartsDrafts.length > 0
            ? `${formatReadbackCount(
                initialPersistedPartsDrafts.length,
                'review-only replacement-part draft',
                'review-only replacement-part drafts'
              )} loaded. Supplier orders stay disabled.`
            : 'Connected; no review-only replacement-part drafts are saved yet. Supplier orders stay disabled.',
        unavailableDetail: 'Supplier order submission stays disabled until manager/admin review.',
      }),
      buildItem({
        id: 'manual-links',
        label: 'Manual links',
        value: String(initialPersistedManualLinks.length),
        storageStatus: persistedManualLinksStatus,
        loadedDetail:
          initialPersistedManualLinks.length > 0
            ? `${formatReadbackCount(
                initialPersistedManualLinks.length,
                'manual/catalogue link',
                'manual/catalogue links'
              )} loaded from source-backed history.`
            : 'Connected; no authenticated manual/catalogue links are saved yet.',
        unavailableDetail:
          'Source manuals remain listed below, but private link history waits for storage read-back.',
      }),
      buildItem({
        id: 'manual-extraction-queue',
        label: 'Manual extraction queue',
        value: String(initialPersistedManualExtractionQueue.length),
        storageStatus: persistedManualExtractionQueueStatus,
        loadedDetail:
          initialPersistedManualExtractionQueue.length > 0
            ? `${formatReadbackCount(
                initialPersistedManualExtractionQueue.length,
                'owner-safe manual extraction item',
                'owner-safe manual extraction items'
              )} loaded for review.`
            : 'Connected; no owner-safe manual extraction queue items are saved yet.',
        unavailableDetail:
          'Catalogue extraction can be prepared locally, but private queue read-back is unavailable.',
      }),
      buildItem({
        id: 'owner-reports',
        label: 'Owner reports',
        value: String(initialPersistedOwnerReports.length),
        storageStatus: persistedOwnerReportsStatus,
        loadedDetail:
          initialPersistedOwnerReports.length > 0
            ? `${formatReadbackCount(
                initialPersistedOwnerReports.length,
                'owner-visible report',
                'owner-visible reports'
              )} loaded for this service profile.`
            : 'Connected; no owner-visible reports are saved for this service profile yet.',
        unavailableDetail: 'Owner closeout reports stay manager-published before owner access.',
      }),
      buildItem({
        id: 'owner-device-access',
        label: 'Owner device access',
        value: String(initialOwnerDeviceScopes.length),
        storageStatus: ownerDeviceScopeStatus,
        loadedDetail:
          initialOwnerDeviceScopes.length > 0
            ? `${formatReadbackCount(
                initialOwnerDeviceScopes.length,
                'owner device scope',
                'owner device scopes'
              )} loaded for assigned devices.`
            : 'Connected; no owner device scopes are assigned yet.',
        unavailableDetail:
          'Owner device access waits for a verified manager/admin profile and assigned devices.',
      }),
    ];
  }, [
    initialOwnerDeviceScopes.length,
    initialPersistedManualExtractionQueue.length,
    initialPersistedManualLinks.length,
    initialPersistedNotes.length,
    initialPersistedOwnerReports.length,
    initialPersistedPartsDrafts.length,
    initialPersistedTodos,
    ownerDeviceScopeStatus,
    persistedManualExtractionQueueStatus,
    persistedManualLinksStatus,
    persistedNotesStatus,
    persistedOwnerReportsStatus,
    persistedPartsDraftsStatus,
    persistedTodosStatus,
  ]);
  const serviceReadbackReadyCount = serviceReadbackIndexItems.filter(
    (item) => item.tone === 'ready'
  ).length;
  const serviceReadbackBlockedCount = serviceReadbackIndexItems.filter(
    (item) => item.tone === 'blocked'
  ).length;
  const ownerReportReleaseAuditRows = useMemo(
    () =>
      initialPersistedOwnerReports.map((report) => {
        const manualReferenceCount = report.manualReferences?.length ?? 0;
        const visibilityGate =
          report.finalStatus === 'Published'
            ? 'Owner-visible for assigned device owners'
            : report.finalStatus === 'Owner-ready'
              ? 'Manager release required'
              : report.finalStatus === 'Cancelled'
                ? 'Cancelled before owner visibility'
                : 'Draft review only';

        return {
          id: report.id,
          reportId: report.reportId,
          reportNumber: report.reportNumber,
          deviceId: report.deviceId,
          visitId: report.visitId,
          finalStatus: report.finalStatus,
          savedAt: report.publishedAt,
          createdBy: report.createdBy,
          checklistCount: report.checklistCount,
          manualReferenceCount,
          visibilityGate,
        };
      }),
    [initialPersistedOwnerReports]
  );
  const ownerReportReleaseAuditSummary = useMemo(() => {
    const publishedCount = ownerReportReleaseAuditRows.filter(
      (row) => row.finalStatus === 'Published'
    ).length;
    const readyCount = ownerReportReleaseAuditRows.filter(
      (row) => row.finalStatus === 'Owner-ready'
    ).length;

    return `${publishedCount} published / ${readyCount} ready for owner release`;
  }, [ownerReportReleaseAuditRows]);
  const ownerPublishedReportDigestRows = useMemo<
    NexusServiceOwnerPublishedReportDigestRow[]
  >(
    () =>
      initialPersistedOwnerReports
        .filter((report) => report.finalStatus === 'Published')
        .map((report) => ({
          id: report.id,
          deviceId: report.deviceId,
          reportNumber: report.reportNumber,
          finalStatus: report.finalStatus,
          summary: report.summary,
          publishedAt: report.publishedAt,
          ownerNoteCount: ownerVisibleNotes.length,
          manualReferenceCount: report.manualReferences?.length ?? 0,
          manualReferenceLabels:
            report.manualReferences?.map((reference) => reference.ownerReportLabel) ?? [],
        })),
    [initialPersistedOwnerReports, ownerVisibleNotes.length]
  );
  const ownerPublishedReportManualReferenceCount = ownerPublishedReportDigestRows.reduce(
    (total, row) => total + row.manualReferenceCount,
    0
  );
  const ownerPublishedHandoffPolishItems =
    useMemo<NexusServiceOwnerPublishedHandoffPolishItem[]>(() => {
      const publishedReportCount = ownerPublishedReportDigestRows.length;
      const ownerSafeNoteCount = ownerVisibleNotes.length;
      const manualReferenceLabels = ownerPublishedReportDigestRows
        .flatMap((row) => row.manualReferenceLabels)
        .slice(0, 3);

      return [
        {
          id: 'published-closeouts',
          label: 'Published closeouts',
          value: `${publishedReportCount}`,
          detail:
            publishedReportCount > 0
              ? `${publishedReportCount} published report${
                  publishedReportCount === 1 ? '' : 's'
                } available for assigned devices.`
              : 'No published report is available for this owner profile yet.',
          tone: publishedReportCount > 0 ? 'ready' : 'watch',
        },
        {
          id: 'owner-safe-notes',
          label: 'Owner-safe notes',
          value: `${ownerSafeNoteCount}`,
          detail:
            ownerSafeNoteCount > 0
              ? `${ownerSafeNoteCount} owner-safe note${
                  ownerSafeNoteCount === 1 ? '' : 's'
                } counted; note bodies stay out of this summary.`
              : 'No owner-safe note count is available yet.',
          tone: ownerSafeNoteCount > 0 ? 'ready' : 'watch',
        },
        {
          id: 'manual-references',
          label: 'Manual references',
          value: `${ownerPublishedReportManualReferenceCount}`,
          detail:
            ownerPublishedReportManualReferenceCount > 0
              ? `${ownerPublishedReportManualReferenceCount} owner-safe manual reference${
                  ownerPublishedReportManualReferenceCount === 1 ? '' : 's'
                }: ${manualReferenceLabels.join(', ')}.`
              : 'No owner-safe manual references are attached to published reports yet.',
          tone: ownerPublishedReportManualReferenceCount > 0 ? 'ready' : 'watch',
        },
        {
          id: 'parts-and-supplier-workflow',
          label: 'Parts and supplier workflow',
          value: 'Withheld',
          detail:
            'Supplier quotes, order gates, prices, fulfillment, warranty decisions, and internal manager review stay outside owner handoff.',
          tone: 'neutral',
        },
      ];
    }, [
      ownerPublishedReportDigestRows,
      ownerPublishedReportManualReferenceCount,
      ownerVisibleNotes.length,
    ]);
  const ownerServiceTimelineItems = useMemo<NexusServiceOwnerServiceTimelineItem[]>(() => {
    const manualLabels = ownerPublishedReportDigestRows.flatMap(
      (row) => row.manualReferenceLabels
    );
    const firstPublishedAt =
      ownerPublishedReportDigestRows[0]?.publishedAt ?? 'No owner release yet';
    const publishedItems = ownerPublishedReportDigestRows.map((row) => ({
      id: `published-${row.id}`,
      label: `Published report ${row.reportNumber}`,
      status: row.finalStatus,
      detail: `${row.summary} Manual references: ${
        row.manualReferenceLabels.length > 0
          ? row.manualReferenceLabels.join(', ')
          : 'none attached'
      }.`,
      timeLabel: row.publishedAt,
      tone: 'ready' as const,
    }));
    const ownerNoteCount = ownerVisibleNotes.length;

    return [
      ...publishedItems,
      {
        id: 'owner-safe-notes',
        label: 'Owner-safe notes',
        status: ownerNoteCount > 0 ? 'Available' : 'Pending',
        detail:
          ownerNoteCount > 0
            ? `${ownerNoteCount} owner-safe note${
                ownerNoteCount === 1 ? '' : 's'
              } available for this owner handoff.`
            : 'No owner-safe notes are available yet.',
        timeLabel: ownerVisibleNotes[0]?.time ?? 'No note timestamp',
        tone: ownerNoteCount > 0 ? 'ready' : 'watch',
      },
      {
        id: 'manual-references',
        label: 'Manual references',
        status: ownerPublishedReportManualReferenceCount > 0 ? 'Attached' : 'Pending',
        detail:
          ownerPublishedReportManualReferenceCount > 0
            ? `${ownerPublishedReportManualReferenceCount} owner-safe manual reference${
                ownerPublishedReportManualReferenceCount === 1 ? '' : 's'
              }: ${manualLabels.slice(0, 3).join(', ')}.`
            : 'Manual references are pending manager review.',
        timeLabel: firstPublishedAt,
        tone: ownerPublishedReportManualReferenceCount > 0 ? 'ready' : 'watch',
      },
      {
        id: 'parts-review',
        label: 'Parts review status',
        status: 'Manager review only',
        detail:
          ownerPublishedReportDigestRows.length > 0
            ? 'Replacement-part requests remain manager-reviewed service items. Supplier quotes, order gates, prices, and fulfilment details stay out of the owner handoff.'
            : 'No published closeout has been released yet; parts review is not owner-visible.',
        timeLabel: firstPublishedAt,
        tone: 'neutral',
      },
    ];
  }, [
    ownerPublishedReportDigestRows,
    ownerPublishedReportManualReferenceCount,
    ownerVisibleNotes,
  ]);
  const ownerReportManualEvidenceRows = useMemo<NexusServiceManualEvidenceGapRow[]>(
    () =>
      initialPersistedOwnerReports.map((report) => {
        const manualReferenceCount = report.manualReferences?.length ?? 0;
        const linkedOwnerSafeCount = initialPersistedManualLinks.filter(
          (manualLink) =>
            manualLink.deviceId === report.deviceId &&
            manualLink.ownerReportEligible &&
            manualLink.visibility === 'Owner-safe'
        ).length;
        const ownerSafeExtractionCount = initialPersistedManualExtractionQueue.filter(
          (queueItem) =>
            queueItem.deviceId === report.deviceId &&
            queueItem.visibility === 'Owner-safe' &&
            queueItem.reviewStatus === 'Owner-safe draft'
        ).length;
        const hasGap = manualReferenceCount === 0;
        const status = !hasGap
          ? 'Ready'
          : linkedOwnerSafeCount > 0
            ? 'Attach linked manual'
            : ownerSafeExtractionCount > 0
              ? 'Review extraction'
              : 'Evidence gap';
        const detail = !hasGap
          ? `${manualReferenceCount} owner-safe reference${
              manualReferenceCount === 1 ? '' : 's'
            } already attached.`
          : linkedOwnerSafeCount > 0
            ? `${linkedOwnerSafeCount} linked owner-safe manual${
                linkedOwnerSafeCount === 1 ? '' : 's'
              } available but not attached to the report.`
            : ownerSafeExtractionCount > 0
              ? `${ownerSafeExtractionCount} owner-safe extraction draft${
                  ownerSafeExtractionCount === 1 ? '' : 's'
                } waiting for report attachment.`
              : 'No owner-safe linked manual or extraction draft is attached to this report.';

        return {
          id: report.id,
          reportNumber: report.reportNumber,
          deviceId: report.deviceId,
          finalStatus: report.finalStatus,
          savedAt: report.publishedAt,
          manualReferenceCount,
          linkedOwnerSafeCount,
          ownerSafeExtractionCount,
          status,
          detail,
          hasGap,
        };
      }),
    [
      initialPersistedManualExtractionQueue,
      initialPersistedManualLinks,
      initialPersistedOwnerReports,
    ]
  );
  const ownerReportManualEvidenceGapCount = ownerReportManualEvidenceRows.filter(
    (row) => row.hasGap
  ).length;
  const ownerReportManualEvidenceSummary =
    ownerReportManualEvidenceRows.length > 0
      ? `${ownerReportManualEvidenceGapCount} gap${
          ownerReportManualEvidenceGapCount === 1 ? '' : 's'
        } / ${ownerReportManualEvidenceRows.length} report${
          ownerReportManualEvidenceRows.length === 1 ? '' : 's'
        }`
      : 'No authenticated reports';
  const selectedVisitOwnerReportRows = useMemo(
    () =>
      ownerReportReleaseAuditRows.filter(
        (row) => row.deviceId === selectedVisit?.serial || row.visitId === selectedVisit?.id
      ),
    [ownerReportReleaseAuditRows, selectedVisit?.id, selectedVisit?.serial]
  );
  const selectedVisitManualEvidenceRows = useMemo(
    () =>
      ownerReportManualEvidenceRows.filter(
        (row) => row.deviceId === selectedVisit?.serial
      ),
    [ownerReportManualEvidenceRows, selectedVisit?.serial]
  );
  const selectedVisitManualEvidenceGapCount = selectedVisitManualEvidenceRows.filter(
    (row) => row.hasGap
  ).length;
  const selectedVisitReleaseStatus = selectedVisitOwnerReportRows.some(
    (row) => row.finalStatus === 'Published'
  )
    ? 'Published'
    : selectedVisitOwnerReportRows.some((row) => row.finalStatus === 'Owner-ready')
      ? 'Ready for release'
      : selectedVisitOwnerReportRows.some((row) => row.finalStatus === 'Draft review')
        ? 'Draft review'
        : selectedVisitOwnerReportRows.length > 0
          ? 'Blocked'
          : 'No report';
  const serviceHandoffStatusItems = useMemo<NexusServiceHandoffStatusItem[]>(
    () => [
      {
        id: 'owner-note',
        label: 'Owner note',
        value: String(ownerVisibleNotes.length),
        status: ownerVisibleNotes.length > 0 ? 'Ready' : 'Needed',
        detail:
          ownerVisibleNotes.length > 0
            ? `${ownerVisibleNotes.length} owner-visible note${
                ownerVisibleNotes.length === 1 ? '' : 's'
              } available.`
            : 'Add an owner-visible note before closeout.',
        tone: ownerVisibleNotes.length > 0 ? 'ready' : 'watch',
      },
      {
        id: 'open-todos',
        label: 'Open tasks',
        value: String(openTodos),
        status: openTodos === 0 ? 'Clear' : 'Open',
        detail:
          openTodos === 0
            ? 'No open company or person-scoped tasks.'
            : `${openTodos} company/person task${openTodos === 1 ? '' : 's'} still open.`,
        tone: openTodos === 0 ? 'ready' : 'watch',
      },
      {
        id: 'staged-parts',
        label: 'Staged parts',
        value: String(activePartPacks),
        status: activePartPacks > 0 ? 'Staged' : 'No parts',
        detail:
          activePartPacks > 0
            ? `${activePartPacks} replacement-part pack${
                activePartPacks === 1 ? '' : 's'
              } ready for manager review.`
            : 'No replacement-part pack is staged for this draft.',
        tone: activePartPacks > 0 ? 'ready' : 'neutral',
      },
      {
        id: 'manual-evidence',
        label: 'Manual evidence',
        value:
          selectedVisitOwnerReportRows.length > 0
            ? String(selectedVisitManualEvidenceGapCount)
            : '-',
        status:
          selectedVisitOwnerReportRows.length === 0
            ? 'No report'
            : selectedVisitManualEvidenceGapCount > 0
              ? 'Gap'
              : 'Ready',
        detail:
          selectedVisitOwnerReportRows.length === 0
            ? 'Manual evidence check starts after an authenticated report exists.'
            : selectedVisitManualEvidenceGapCount > 0
              ? `${selectedVisitManualEvidenceGapCount} report${
                  selectedVisitManualEvidenceGapCount === 1 ? '' : 's'
                } missing owner-safe manual references.`
              : 'Owner-safe manual references are attached to selected visit reports.',
        tone:
          selectedVisitOwnerReportRows.length === 0
            ? 'neutral'
            : selectedVisitManualEvidenceGapCount > 0
              ? 'blocked'
              : 'ready',
      },
      {
        id: 'report-release',
        label: 'Report release',
        value: String(selectedVisitOwnerReportRows.length),
        status: selectedVisitReleaseStatus,
        detail:
          selectedVisitOwnerReportRows.length > 0
            ? `${selectedVisitOwnerReportRows.length} authenticated report${
                selectedVisitOwnerReportRows.length === 1 ? '' : 's'
              } for ${selectedVisit?.serial ?? 'selected visit'}.`
            : 'No authenticated owner report is loaded for the selected visit.',
        tone:
          selectedVisitReleaseStatus === 'Published' ||
          selectedVisitReleaseStatus === 'Ready for release'
            ? 'ready'
            : selectedVisitReleaseStatus === 'No report'
              ? 'neutral'
              : 'watch',
      },
    ],
    [
      activePartPacks,
      openTodos,
      ownerVisibleNotes.length,
      selectedVisit?.serial,
      selectedVisitManualEvidenceGapCount,
      selectedVisitOwnerReportRows.length,
      selectedVisitReleaseStatus,
    ]
  );
  const serviceHandoffReadyCount = serviceHandoffStatusItems.filter(
    (item) => item.tone === 'ready'
  ).length;
  const assignedTechnicianOpenTodos = useMemo(
    () =>
      visibleTodos.filter((todo) => todo.scope === 'Technician' && !todo.done),
    [visibleTodos]
  );
  const technicianWorkDigestItems = useMemo<NexusServiceTechnicianWorkDigestItem[]>(
    () => [
      {
        id: 'assigned-open-tasks',
        label: 'Assigned open tasks',
        value: String(assignedTechnicianOpenTodos.length),
        status: assignedTechnicianOpenTodos.length === 0 ? 'Clear' : 'Open',
        detail:
          assignedTechnicianOpenTodos.length === 0
            ? 'No technician-scoped tasks are open for this work queue.'
            : assignedTechnicianOpenTodos
                .map((todo) => `${todo.title} (${todo.owner})`)
                .join('; '),
        tone: assignedTechnicianOpenTodos.length === 0 ? 'ready' : 'watch',
      },
      {
        id: 'owner-note-readiness',
        label: 'Owner-visible note readiness',
        value: String(ownerVisibleNotes.length),
        status: ownerVisibleNotes.length > 0 ? 'Ready' : 'Needed',
        detail:
          ownerVisibleNotes.length > 0
            ? `${ownerVisibleNotes.length} owner-visible note${
                ownerVisibleNotes.length === 1 ? '' : 's'
              } ready for manager closeout.`
            : 'Add an owner-visible note before manager closeout.',
        tone: ownerVisibleNotes.length > 0 ? 'ready' : 'watch',
      },
      {
        id: 'manual-availability',
        label: 'Manual availability',
        value: String(ownerReportManualReferences.length),
        status: ownerReportManualReferences.length > 0 ? 'Available' : 'Missing',
        detail:
          ownerReportManualReferences.length > 0
            ? `${ownerReportManualReferences.length} owner-safe manual reference${
                ownerReportManualReferences.length === 1 ? '' : 's'
              } available from ${readyManuals} ready library packet${
                readyManuals === 1 ? '' : 's'
              }.`
            : 'No owner-safe manual reference is attached for the selected visit yet.',
        tone: ownerReportManualReferences.length > 0 ? 'ready' : 'neutral',
      },
    ],
    [
      assignedTechnicianOpenTodos,
      ownerReportManualReferences.length,
      ownerVisibleNotes.length,
      readyManuals,
    ]
  );
  const technicianWorkDigestReadyCount = technicianWorkDigestItems.filter(
    (item) => item.tone === 'ready'
  ).length;
  const selectedVisitPartsDraftRows = useMemo(
    () =>
      initialPersistedPartsDrafts.filter(
        (partsDraft) =>
          partsDraft.deviceId === selectedVisit?.serial ||
          partsDraft.visitId === selectedVisit?.id
      ),
    [initialPersistedPartsDrafts, selectedVisit?.id, selectedVisit?.serial]
  );
  const storageRecoveryActionItems = useMemo<NexusServiceStorageRecoveryActionItem[]>(() => {
    const partsDraftStatusMeta = getServiceStorageStatusMeta(persistedPartsDraftsStatus);
    const ownerReportsStatusMeta = getServiceStorageStatusMeta(persistedOwnerReportsStatus);
    const partsDraftAction = (() => {
      if (persistedPartsDraftsStatus === 'loaded') {
        return initialPersistedPartsDrafts.length > 0
          ? {
              detail: `${formatReadbackCount(
                initialPersistedPartsDrafts.length,
                'review-only parts draft',
                'review-only parts drafts'
              )} available; ${selectedVisitPartsDraftRows.length} linked to selected visit. Supplier order remains disabled.`,
              action: 'Review saved drafts before manager approval. Keep supplier ordering disabled.',
            }
          : {
              detail:
                'Private parts-draft storage is connected but empty. Local quick order draft stays available for manager review.',
              action:
                'Stage the local quick order draft; save a review draft when private storage is ready.',
            };
      }

      if (persistedPartsDraftsStatus === 'database_error') {
        return {
          detail:
            'Authenticated parts-draft storage failed. Do not claim a private parts-draft save.',
          action:
            'Keep the local quick order draft/export sheet and retry after storage recovers. Supplier ordering remains disabled.',
        };
      }

      if (persistedPartsDraftsStatus === 'database_not_configured') {
        return {
          detail: 'Private parts-draft storage is not configured.',
          action:
            'Use the local quick order draft only; configure private review storage before relying on history.',
        };
      }

      if (persistedPartsDraftsStatus === 'service_profile_required') {
        return {
          detail: 'A verified service profile is required before private parts drafts load.',
          action:
            'Continue with local draft and request profile scope before saving review history.',
        };
      }

      if (persistedPartsDraftsStatus === 'role_not_allowed') {
        return {
          detail: 'This role cannot manage private parts drafts.',
          action: 'Escalate to manager/admin review; supplier ordering remains disabled.',
        };
      }

      return {
        detail: 'Sign in needed before private parts-draft history can load.',
        action: 'Local quick order draft stays available; supplier ordering remains disabled.',
      };
    })();
    const ownerReportAction = (() => {
      if (persistedOwnerReportsStatus === 'loaded') {
        return initialPersistedOwnerReports.length > 0
          ? {
              detail: `${formatReadbackCount(
                initialPersistedOwnerReports.length,
                'owner report',
                'owner reports'
              )} available; ${ownerReportReleaseAuditSummary}.`,
              action:
                'Review owner-safe report state before sharing; publish only through manager release.',
            }
          : {
              detail:
                'Private owner-report storage is connected but empty for this service profile.',
              action:
                'Use owner-safe export sheet as draft input; save manager-reviewed report before owner release.',
            };
      }

      if (persistedOwnerReportsStatus === 'database_error') {
        return {
          detail:
            'Authenticated owner-report storage failed. Do not publish an owner report while private storage is failing.',
          action: 'Keep owner-safe export/report draft local and retry after storage recovers.',
        };
      }

      if (persistedOwnerReportsStatus === 'database_not_configured') {
        return {
          detail: 'Private owner-report storage is not configured.',
          action:
            'Owner-safe export sheet stays available; configure private storage before authenticated report history.',
        };
      }

      if (persistedOwnerReportsStatus === 'service_profile_required') {
        return {
          detail:
            'A verified owner profile with assigned device scope is required before report history loads.',
          action: 'Assign owner device access before releasing owner-visible reports.',
        };
      }

      if (persistedOwnerReportsStatus === 'role_not_allowed') {
        return {
          detail: 'This role can see the boundary but cannot manage private owner report history.',
          action:
            'Wait for a manager-published owner-safe report before owner access.',
        };
      }

      return {
        detail: 'Sign in needed before private owner-report history can load.',
        action:
          'Owner-safe export sheet stays available; do not treat it as published history.',
      };
    })();

    return [
      {
        id: 'parts-drafts',
        label: 'Parts drafts',
        value: `${initialPersistedPartsDrafts.length} saved`,
        status: partsDraftStatusMeta.label,
        detail: partsDraftAction.detail,
        action: partsDraftAction.action,
        tone: partsDraftStatusMeta.tone,
      },
      {
        id: 'owner-reports',
        label: 'Owner reports',
        value: `${initialPersistedOwnerReports.length} reports`,
        status: ownerReportsStatusMeta.label,
        detail: ownerReportAction.detail,
        action: ownerReportAction.action,
        tone: ownerReportsStatusMeta.tone,
      },
    ];
  }, [
    initialPersistedOwnerReports.length,
    initialPersistedPartsDrafts.length,
    ownerReportReleaseAuditSummary,
    persistedOwnerReportsStatus,
    persistedPartsDraftsStatus,
    selectedVisitPartsDraftRows.length,
  ]);
  const selectedVisitManualLinkRows = useMemo(
    () =>
      initialPersistedManualLinks.filter(
        (manualLink) =>
          manualLink.deviceId === selectedVisit?.serial ||
          manualLink.targetId === selectedVisit?.id
      ),
    [initialPersistedManualLinks, selectedVisit?.id, selectedVisit?.serial]
  );
  const selectedVisitManualExtractionRows = useMemo(
    () =>
      initialPersistedManualExtractionQueue.filter(
        (queueItem) =>
          queueItem.deviceId === selectedVisit?.serial ||
          queueItem.targetId === selectedVisit?.id
      ),
    [initialPersistedManualExtractionQueue, selectedVisit?.id, selectedVisit?.serial]
  );
  const stagedDraftPackCount = draftLines.reduce(
    (total, part) => total + part.quantity,
    0
  );
  const selectedVisitPartsManualEvidenceItems = useMemo<NexusServicePartsManualEvidenceItem[]>(() => {
    const catalogueDetail =
      selectedVisit && selectedModel
        ? `${getServiceModelLabel(selectedVisit.modelSlug)} ${
            selectedVisit.serial
          } catalogue facts ready: ${selectedModel.gas}; ${selectedModel.h2Value}.`
        : 'Selected device catalogue facts are not mapped yet.';
    const linkedManualLabels = selectedVisitManualLinkRows
      .map((manualLink) => manualLink.documentTitle)
      .slice(0, 2);
    const ownerSafeManualLabels = ownerReportManualReferences
      .map((reference) => reference.documentTitle)
      .slice(0, 2);
    const extractionLabels = selectedVisitManualExtractionRows
      .map((queueItem) => queueItem.documentTitle)
      .slice(0, 2);
    const manualStatus =
      selectedVisitManualLinkRows.length > 0
        ? 'Manual linked'
        : selectedVisitManualExtractionRows.length > 0
          ? 'Review queued'
          : ownerReportManualReferences.length > 0
            ? 'Owner-safe ref ready'
            : 'Manual link needed';
    const manualDetail =
      selectedVisitManualLinkRows.length > 0
        ? `Selected-visit manual link${selectedVisitManualLinkRows.length === 1 ? '' : 's'}: ${linkedManualLabels.join(', ')}.`
        : selectedVisitManualExtractionRows.length > 0
          ? `Manual extraction queue row${selectedVisitManualExtractionRows.length === 1 ? '' : 's'} waiting for review: ${extractionLabels.join(', ')}.`
          : ownerReportManualReferences.length > 0
            ? `Owner-safe manual reference available for review: ${ownerSafeManualLabels.join(', ')}. Link it to the visit before supplier ordering.`
            : 'No selected-visit manual evidence is linked yet. Attach a source-backed manual before order approval.';

    return draftLines.map((part) => ({
      id: part.id,
      sku: part.sku,
      label: part.name,
      quantity: part.quantity,
      status: part.availability,
      manualStatus,
      catalogueDetail,
      manualDetail,
      approvalDetail:
        'Manager approval required before supplier order, fulfillment, warranty decision, or owner-facing closeout.',
      tone: selectedVisitManualLinkRows.length > 0 ? 'ready' : 'watch',
    }));
  }, [
    draftLines,
    ownerReportManualReferences,
    selectedModel,
    selectedVisit,
    selectedVisitManualExtractionRows,
    selectedVisitManualLinkRows,
  ]);
  const selectedVisitPartsDraftExportText = useMemo(() => {
    const modelLabel = selectedVisit
      ? getServiceModelLabel(selectedVisit.modelSlug)
      : 'Selected Hylono unit';
    const localLineRows =
      draftLines.length > 0
        ? draftLines.map(
            (part) =>
              `- ${part.sku} x ${part.quantity}: ${part.name}; reason: ${
                part.reason
              }; preview value: ${formatPln(part.unitPrice * part.quantity)}.`
          )
        : ['- No local replacement-part line is staged.'];
    const evidenceRows =
      selectedVisitPartsManualEvidenceItems.length > 0
        ? selectedVisitPartsManualEvidenceItems.map(
            (item) =>
              `- ${item.sku}: ${item.manualStatus}; ${item.catalogueDetail} ${item.approvalDetail}`
          )
        : ['- No staged part line is available for manual/catalogue evidence review.'];
    const savedDraftLine =
      selectedVisitPartsDraftRows.length > 0
        ? `${selectedVisitPartsDraftRows.length} authenticated review draft${
            selectedVisitPartsDraftRows.length === 1 ? '' : 's'
          } linked to this selected visit.`
        : 'No authenticated review draft is linked to this selected visit yet.';

    return [
      'HYLONO MANAGER REVIEW PARTS DRAFT',
      `Visit: ${selectedVisit?.id ?? 'sample-service-visit'} / ${
        selectedVisit?.serial ?? 'sample-service-visit'
      }`,
      `Device: ${modelLabel}`,
      `Local staged lines: ${draftLines.length}`,
      `Local staged packs: ${stagedDraftPackCount}`,
      `Local staged preview value: ${formatPln(totalDraftValue)}`,
      `Saved selected-visit drafts: ${savedDraftLine}`,
      'Manager approval: required before supplier ordering, fulfillment, warranty decision, or owner-facing closeout.',
      'Draft lines:',
      ...localLineRows,
      'Manual/catalogue evidence:',
      ...evidenceRows,
      'Supplier ordering: disabled until manager/admin approval.',
      'Boundary: review-only draft for manager approval. Final pricing, supplier availability, and fulfillment are not promised to the owner.',
    ].join('\n');
  }, [
    draftLines,
    selectedVisit,
    selectedVisitPartsManualEvidenceItems,
    selectedVisitPartsDraftRows.length,
    stagedDraftPackCount,
    totalDraftValue,
  ]);
  const selectedVisitPartsDraftExportLineCount =
    selectedVisitPartsDraftExportText.split('\n').filter(Boolean).length;
  const technicianPartsManualHandoffItems = useMemo<
    NexusServiceTechnicianPartsManualHandoffItem[]
  >(
    () => [
      {
        id: 'saved-review-drafts',
        label: 'Saved review drafts',
        value: String(selectedVisitPartsDraftRows.length),
        status: selectedVisitPartsDraftRows.length > 0 ? 'Saved' : 'Not saved',
        detail:
          selectedVisitPartsDraftRows.length > 0
            ? `${selectedVisitPartsDraftRows.length} authenticated draft${
                selectedVisitPartsDraftRows.length === 1 ? '' : 's'
              } already linked to this visit.`
            : 'No authenticated parts draft is linked to this selected visit yet.',
        tone: selectedVisitPartsDraftRows.length > 0 ? 'ready' : 'watch',
      },
      {
        id: 'staged-local-draft',
        label: 'Staged local draft',
        value: String(draftLines.length),
        status: draftLines.length > 0 ? 'Ready for review' : 'Empty',
        detail:
          draftLines.length > 0
            ? `${draftLines.length} line${draftLines.length === 1 ? '' : 's'} / ${stagedDraftPackCount} pack${
                stagedDraftPackCount === 1 ? '' : 's'
              } staged for manager review.`
            : 'No local replacement-part lines are staged.',
        tone: draftLines.length > 0 ? 'ready' : 'neutral',
      },
      {
        id: 'linked-manuals',
        label: 'Linked manuals',
        value: String(selectedVisitManualLinkRows.length),
        status: selectedVisitManualLinkRows.length > 0 ? 'Linked' : 'Missing',
        detail:
          selectedVisitManualLinkRows.length > 0
            ? `${selectedVisitManualLinkRows.length} authenticated manual link${
                selectedVisitManualLinkRows.length === 1 ? '' : 's'
              } attached to this selected visit.`
            : 'Link a source-backed manual before closeout if the visit needs one.',
        tone: selectedVisitManualLinkRows.length > 0 ? 'ready' : 'watch',
      },
      {
        id: 'manual-review-queue',
        label: 'Manual review queue',
        value: String(selectedVisitManualExtractionRows.length),
        status: selectedVisitManualExtractionRows.length > 0 ? 'Queued' : 'No queue',
        detail:
          selectedVisitManualExtractionRows.length > 0
            ? `${selectedVisitManualExtractionRows.length} extraction row${
                selectedVisitManualExtractionRows.length === 1 ? '' : 's'
              } available for owner-safe manual review.`
            : 'No manual extraction queue row is linked to this visit.',
        tone: selectedVisitManualExtractionRows.length > 0 ? 'ready' : 'neutral',
      },
    ],
    [
      draftLines.length,
      selectedVisitManualExtractionRows.length,
      selectedVisitManualLinkRows.length,
      selectedVisitPartsDraftRows.length,
      stagedDraftPackCount,
    ]
  );
  const technicianPartsManualHandoffReadyCount =
    technicianPartsManualHandoffItems.filter((item) => item.tone === 'ready').length;
  const selectedVisitPersistedPartsManualReadbackItems = useMemo<
    NexusServicePersistedPartsManualReadbackItem[]
  >(() => {
    const partsDraftStatusMeta = getServiceStorageStatusMeta(persistedPartsDraftsStatus);
    const manualLinksStatusMeta = getServiceStorageStatusMeta(persistedManualLinksStatus);
    const manualExtractionStatusMeta = getServiceStorageStatusMeta(
      persistedManualExtractionQueueStatus
    );

    return [
      {
        id: 'persisted-parts-drafts',
        label: 'Persisted parts drafts',
        value: String(selectedVisitPartsDraftRows.length),
        status:
          selectedVisitPartsDraftRows.length > 0
            ? 'Read back'
            : partsDraftStatusMeta.label,
        detail:
          selectedVisitPartsDraftRows.length > 0
            ? `${selectedVisitPartsDraftRows.length} selected-visit review draft${
                selectedVisitPartsDraftRows.length === 1 ? '' : 's'
              } loaded from private parts-draft history.`
            : 'No selected-visit parts draft was read back from private history.',
        tone: selectedVisitPartsDraftRows.length > 0 ? 'ready' : partsDraftStatusMeta.tone,
      },
      {
        id: 'persisted-manual-links',
        label: 'Persisted manual links',
        value: String(selectedVisitManualLinkRows.length),
        status:
          selectedVisitManualLinkRows.length > 0
            ? 'Linked'
            : manualLinksStatusMeta.label,
        detail:
          selectedVisitManualLinkRows.length > 0
            ? `${selectedVisitManualLinkRows.length} selected-visit manual link${
                selectedVisitManualLinkRows.length === 1 ? '' : 's'
              } loaded with source-backed document metadata.`
            : 'No selected-visit manual link was read back from private history.',
        tone: selectedVisitManualLinkRows.length > 0 ? 'ready' : manualLinksStatusMeta.tone,
      },
      {
        id: 'persisted-manual-extraction',
        label: 'Manual extraction queue',
        value: String(selectedVisitManualExtractionRows.length),
        status:
          selectedVisitManualExtractionRows.length > 0
            ? 'Queued'
            : manualExtractionStatusMeta.label,
        detail:
          selectedVisitManualExtractionRows.length > 0
            ? `${selectedVisitManualExtractionRows.length} selected-visit extraction row${
                selectedVisitManualExtractionRows.length === 1 ? '' : 's'
              } loaded for owner-safe manual review.`
            : 'No selected-visit extraction queue row was read back from private history.',
        tone:
          selectedVisitManualExtractionRows.length > 0
            ? 'ready'
            : manualExtractionStatusMeta.tone,
      },
      {
        id: 'owner-safe-manual-references',
        label: 'Owner-safe manual refs',
        value: String(ownerReportManualReferences.length),
        status: ownerReportManualReferences.length > 0 ? 'Available' : 'Missing',
        detail:
          ownerReportManualReferences.length > 0
            ? `${ownerReportManualReferences.length} owner-safe manual reference${
                ownerReportManualReferences.length === 1 ? '' : 's'
              } available for report review.`
            : 'No owner-safe manual reference is available for the selected visit.',
        tone: ownerReportManualReferences.length > 0 ? 'ready' : 'watch',
      },
    ];
  }, [
    ownerReportManualReferences.length,
    persistedManualExtractionQueueStatus,
    persistedManualLinksStatus,
    persistedPartsDraftsStatus,
    selectedVisitManualExtractionRows.length,
    selectedVisitManualLinkRows.length,
    selectedVisitPartsDraftRows.length,
  ]);
  const selectedVisitPersistedPartsManualReadbackReadyCount =
    selectedVisitPersistedPartsManualReadbackItems.filter((item) => item.tone === 'ready').length;
  const selectedVisitPersistedPartsManualReadbackText = useMemo(() => {
    const savedDraftRows =
      selectedVisitPartsDraftRows.length > 0
        ? selectedVisitPartsDraftRows.map(
            (draftRow) =>
              `- ${draftRow.id}: ${draftRow.status}; ${draftRow.lineCount} line(s); ${draftRow.quantityTotal} pack(s); ${formatPln(
                draftRow.totalValue
              )}; created by ${draftRow.createdBy}; saved ${draftRow.submittedAt}.`
          )
        : ['- No selected-visit persisted parts draft is loaded.'];
    const manualLinkRows =
      selectedVisitManualLinkRows.length > 0
        ? selectedVisitManualLinkRows.map(
            (manualLink) =>
              `- ${manualLink.id}: ${manualLink.documentTitle}; ${manualLink.reviewStatus}; version ${manualLink.documentVersion}; linked by ${manualLink.linkedBy}.`
          )
        : ['- No selected-visit persisted manual link is loaded.'];
    const extractionRows =
      selectedVisitManualExtractionRows.length > 0
        ? selectedVisitManualExtractionRows.map(
            (queueItem) =>
              `- ${queueItem.id}: ${queueItem.documentTitle}; ${queueItem.reviewStatus}; ${queueItem.checklistCount} checklist item(s); requested by ${queueItem.requestedBy}.`
          )
        : ['- No selected-visit manual extraction queue row is loaded.'];

    return [
      'HYLONO PERSISTED PARTS MANUAL REVIEW READBACK',
      `Visit: ${selectedVisit?.id ?? 'sample-service-visit'} / ${
        selectedVisit?.serial ?? 'sample-service-visit'
      }`,
      `Storage states: parts drafts ${persistedPartsDraftsStatus}; manual links ${persistedManualLinksStatus}; manual extraction ${persistedManualExtractionQueueStatus}.`,
      `Readback readiness: ${selectedVisitPersistedPartsManualReadbackReadyCount} ready / ${selectedVisitPersistedPartsManualReadbackItems.length} lanes.`,
      `Saved parts drafts: ${selectedVisitPartsDraftRows.length}`,
      `Manual links: ${selectedVisitManualLinkRows.length}`,
      `Manual extraction rows: ${selectedVisitManualExtractionRows.length}`,
      `Owner-safe manual references: ${ownerReportManualReferences.length}`,
      'Persisted parts draft rows:',
      ...savedDraftRows,
      'Persisted manual link rows:',
      ...manualLinkRows,
      'Persisted manual extraction rows:',
      ...extractionRows,
      'Boundary: selected-visit read-back only. This packet creates no supplier quote, purchase order, payment, fulfillment, warranty approval, owner-send action, owner report save, or report status transition.',
    ].join('\n');
  }, [
    ownerReportManualReferences.length,
    persistedManualExtractionQueueStatus,
    persistedManualLinksStatus,
    persistedPartsDraftsStatus,
    selectedVisit,
    selectedVisitManualExtractionRows,
    selectedVisitManualLinkRows,
    selectedVisitPartsDraftRows,
    selectedVisitPersistedPartsManualReadbackItems.length,
    selectedVisitPersistedPartsManualReadbackReadyCount,
  ]);
  const selectedVisitPersistedPartsManualReadbackLineCount =
    selectedVisitPersistedPartsManualReadbackText.split('\n').filter(Boolean).length;
  const partsDraftActionStatus = useMemo(() => {
    if (draftNotice) {
      return draftNotice;
    }

    if (partsDraftExportStatus === 'copied') {
      return 'Manager review packet copied.';
    }

    if (partsDraftExportStatus === 'unavailable') {
      return 'Clipboard unavailable for the manager review packet. Select the export text manually.';
    }

    if (partsManualReadbackCopyStatus === 'copied') {
      return 'Persisted parts/manual read-back copied.';
    }

    if (partsManualReadbackCopyStatus === 'unavailable') {
      return 'Clipboard unavailable for the persisted parts/manual read-back. Select the read-back text manually.';
    }

    return `${draftLines.length} replacement part line${
      draftLines.length === 1 ? '' : 's'
    } staged, ${stagedDraftPackCount} pack${
      stagedDraftPackCount === 1 ? '' : 's'
    } selected, ${selectedVisitPartsDraftExportLineCount} manager packet lines ready, and ${selectedVisitPersistedPartsManualReadbackLineCount} persisted read-back lines ready. Supplier ordering remains disabled.`;
  }, [
    draftLines.length,
    draftNotice,
    partsDraftExportStatus,
    partsManualReadbackCopyStatus,
    selectedVisitPartsDraftExportLineCount,
    selectedVisitPersistedPartsManualReadbackLineCount,
    stagedDraftPackCount,
  ]);
  const firstOwnerSafeManualAction = useMemo(
    () =>
      NEXUS_SERVICE_MANUAL_LIBRARY.find(
        (manual) => manual.ownerReportEligible && manual.status === 'Ready'
      ) ??
      NEXUS_SERVICE_MANUAL_LIBRARY.find(
        (manual) => manual.ownerReportEligible && manual.status === 'Needs extraction'
      ),
    []
  );
  const firstOwnerReportReleaseCandidate = useMemo(
    () =>
      initialPersistedOwnerReports.find(
        (report) =>
          report.finalStatus === 'Owner-ready' &&
          (report.deviceId === selectedVisit?.serial || report.visitId === selectedVisit?.id)
      ),
    [initialPersistedOwnerReports, selectedVisit?.id, selectedVisit?.serial]
  );
  const selectedVisitNextActionItems = useMemo<NexusServiceNextActionCockpitItem[]>(
    () => {
      const hasManualLink = selectedVisitManualLinkRows.length > 0;
      const hasStagedParts = draftLines.length > 0 || selectedVisitPartsDraftRows.length > 0;
      const hasOwnerDraft = selectedVisitOwnerReportRows.length > 0;
      const releaseReady =
        selectedVisitReleaseStatus === 'Ready for release' ||
        selectedVisitReleaseStatus === 'Published';

      return [
        {
          id: 'attach-manual',
          label: 'Attach manual',
          status: hasManualLink ? 'Linked' : firstOwnerSafeManualAction ? 'Ready' : 'Missing',
          detail: hasManualLink
            ? `${selectedVisitManualLinkRows.length} selected-visit manual link${
                selectedVisitManualLinkRows.length === 1 ? '' : 's'
              } already attached.`
            : firstOwnerSafeManualAction
              ? `${firstOwnerSafeManualAction.title} is available for owner-safe visit linkage.`
              : 'No owner-safe manual action is available for this visit yet.',
          actionLabel: hasManualLink ? 'Review manual links' : 'Attach owner-safe manual',
          actionState: canManageSelectedVisitNextActions && firstOwnerSafeManualAction
            ? 'available'
            : currentServiceRole === 'TECHNICIAN'
              ? 'readonly'
              : 'blocked',
          backingLabel: linkManualAction
            ? 'Manual link private-write boundary mounted'
            : 'Manual link action not mounted',
          backingDetail: linkManualAction
            ? 'Submits only visit-targeted manual metadata to nexus_service_manual_document_links; the result still reports persisted yes/no.'
            : 'This render can preview the manual-link step, but no server action will run.',
          tone: hasManualLink ? 'ready' : firstOwnerSafeManualAction ? 'watch' : 'blocked',
        },
        {
          id: 'stage-parts',
          label: 'Stage parts',
          status: hasStagedParts ? 'Draft ready' : 'Empty',
          detail: hasStagedParts
            ? `${draftLines.length} local line${draftLines.length === 1 ? '' : 's'} and ${
                selectedVisitPartsDraftRows.length
              } authenticated draft${selectedVisitPartsDraftRows.length === 1 ? '' : 's'} are linked to the visit.`
            : 'No replacement-part draft is staged for the selected visit.',
          actionLabel:
            currentServiceRole === 'TECHNICIAN'
              ? 'Stage technician parts draft'
              : 'Stage selected-visit parts draft',
          actionState: canUsePartsDraftWorkspace && draftLines.length > 0 ? 'available' : 'blocked',
          backingLabel: createPartsDraftAction
            ? 'Parts draft review-draft boundary mounted'
            : 'Parts draft action not mounted',
          backingDetail: createPartsDraftAction
            ? 'Submits aggregate line metadata to nexus_service_parts_drafts for manager review; supplier ordering remains separate.'
            : 'This render can preview staged parts, but no review-draft server action will run.',
          tone: hasStagedParts ? 'ready' : 'watch',
        },
        {
          id: 'owner-draft',
          label: 'Owner draft',
          status: hasOwnerDraft ? selectedVisitReleaseStatus : 'Not saved',
          detail: hasOwnerDraft
            ? `${selectedVisitOwnerReportRows.length} authenticated owner report${
                selectedVisitOwnerReportRows.length === 1 ? '' : 's'
              } loaded for ${selectedVisit?.serial ?? 'the selected visit'}.`
            : 'Owner-safe closeout draft still needs manager/admin save.',
          actionLabel: 'Save selected owner draft',
          actionState: canPublishOwnerReport ? 'available' : 'readonly',
          backingLabel: publishOwnerReportAction
            ? 'Owner report private-write boundary mounted'
            : 'Owner report action not mounted',
          backingDetail: publishOwnerReportAction
            ? 'Submits owner-safe summary, checklist count, and manual references to nexus_service_reports; raw findings stay out.'
            : 'This render can preview owner-draft save, but no report server action will run.',
          tone: hasOwnerDraft ? 'ready' : canPublishOwnerReport ? 'watch' : 'neutral',
        },
        {
          id: 'release-status',
          label: 'Release status',
          status: selectedVisitReleaseStatus,
          detail: firstOwnerReportReleaseCandidate
            ? `${firstOwnerReportReleaseCandidate.reportNumber} is owner-ready and waiting for release.`
            : releaseReady
              ? 'Selected visit has an owner-ready or published report state.'
            : 'Manager/admin review is still required before release.',
          actionLabel: firstOwnerReportReleaseCandidate
            ? 'Release selected report'
            : 'Manager release required',
          actionState:
            canReleaseOwnerReport && firstOwnerReportReleaseCandidate ? 'available' : 'readonly',
          backingLabel: publishOwnerReportStatusAction
            ? 'Report status private-write boundary mounted'
            : 'Report status action not mounted',
          backingDetail: publishOwnerReportStatusAction
            ? 'Submits only reportId and published status to nexus_service_reports when an owner-ready report exists.'
            : 'This render can preview release state, but no status-transition server action will run.',
          tone: releaseReady ? 'ready' : canReleaseOwnerReport ? 'watch' : 'neutral',
        },
      ];
    },
    [
      canManageSelectedVisitNextActions,
      canPublishOwnerReport,
      canReleaseOwnerReport,
      canUsePartsDraftWorkspace,
      createPartsDraftAction,
      currentServiceRole,
      draftLines.length,
      firstOwnerReportReleaseCandidate,
      firstOwnerSafeManualAction,
      linkManualAction,
      publishOwnerReportAction,
      publishOwnerReportStatusAction,
      selectedVisit?.serial,
      selectedVisitManualLinkRows.length,
      selectedVisitOwnerReportRows.length,
      selectedVisitPartsDraftRows.length,
      selectedVisitReleaseStatus,
    ]
  );
  const selectedVisitNextActionReadyCount = selectedVisitNextActionItems.filter(
    (item) => item.tone === 'ready'
  ).length;
  const servicepersonCloseoutComposerItems = useMemo<
    NexusServiceCloseoutComposerItem[]
  >(() => {
    const openServiceTodos = visibleTodos.filter((todo) => !todo.done);

    return [
      {
        id: 'owner-release-timeline',
        label: 'Owner release timeline',
        status: selectedVisitReleaseStatus,
        detail: `${selectedVisitOwnerReportRows.length} owner report row${
          selectedVisitOwnerReportRows.length === 1 ? '' : 's'
        }, ${ownerVisibleNotes.length} owner-safe note${
          ownerVisibleNotes.length === 1 ? '' : 's'
        }, and ${ownerReportManualReferences.length} owner-safe manual reference${
          ownerReportManualReferences.length === 1 ? '' : 's'
        } are available for release review.`,
        source: 'Owner timeline + owner report read-back',
        tone:
          selectedVisitReleaseStatus === 'Published' ||
          selectedVisitReleaseStatus === 'Ready for release'
            ? 'ready'
            : selectedVisitOwnerReportRows.length > 0
              ? 'watch'
              : 'neutral',
      },
      {
        id: 'owner-safe-handoff',
        label: 'Owner-safe handoff',
        status: `${selectedVisitHandoffReadyCount} ready checks`,
        detail: `${selectedVisitHandoffExportLineCount} owner-safe export lines are ready; raw technician notes and manager-only documents stay outside the handoff.`,
        source: 'Selected visit handoff packet',
        tone: selectedVisitHandoffReadyCount > 0 ? 'ready' : 'watch',
      },
      {
        id: 'manager-parts-packet',
        label: 'Manager parts packet',
        status:
          draftLines.length > 0 || selectedVisitPartsDraftRows.length > 0
            ? 'Parts review draft'
            : 'No parts draft',
        detail: `${draftLines.length} local part line${
          draftLines.length === 1 ? '' : 's'
        }, ${selectedVisitPartsDraftRows.length} saved review draft${
          selectedVisitPartsDraftRows.length === 1 ? '' : 's'
        }, and ${selectedVisitPartsDraftExportLineCount} manager packet lines. Supplier workflow remains disabled.`,
        source: 'Manager review packet + quick parts draft',
        tone:
          draftLines.length > 0 || selectedVisitPartsDraftRows.length > 0
            ? 'watch'
            : 'neutral',
      },
      {
        id: 'manual-evidence',
        label: 'Manual evidence',
        status:
          selectedVisitPartsManualEvidenceItems.length > 0 ||
          selectedVisitManualLinkRows.length > 0
            ? 'Evidence ready'
            : 'Evidence gap',
        detail: `${selectedVisitPartsManualEvidenceItems.length} staged part evidence row${
          selectedVisitPartsManualEvidenceItems.length === 1 ? '' : 's'
        }, ${selectedVisitManualLinkRows.length} selected-visit manual link${
          selectedVisitManualLinkRows.length === 1 ? '' : 's'
        }, and ${selectedVisitManualExtractionRows.length} extraction queue row${
          selectedVisitManualExtractionRows.length === 1 ? '' : 's'
        } are connected to this closeout draft.`,
        source: 'Manual/catalogue evidence bridge',
        tone:
          selectedVisitPartsManualEvidenceItems.length > 0 ||
          selectedVisitManualLinkRows.length > 0
            ? 'ready'
            : 'watch',
      },
      {
        id: 'shared-notes-todos',
        label: 'Shared notes and todos',
        status: `${openServiceTodos.length} open task${
          openServiceTodos.length === 1 ? '' : 's'
        }`,
        detail: `${ownerVisibleNotes.length} owner-visible note${
          ownerVisibleNotes.length === 1 ? '' : 's'
        } and ${openServiceTodos.length} open company/person task${
          openServiceTodos.length === 1 ? '' : 's'
        } are summarized without copying raw note bodies.`,
        source: 'Shared notes dispatch + company todo board',
        tone: openServiceTodos.length > 0 ? 'watch' : 'ready',
      },
      {
        id: 'next-action-gates',
        label: 'Next action gates',
        status: `${selectedVisitNextActionReadyCount} ready gates`,
        detail: `${selectedVisitNextActionItems.length} gated actions are visible for manual attach, parts staging, owner draft save, and release review; the copy draft does not execute them, and the manager save bridge submits only owner-safe report fields separately.`,
        source: 'Selected visit next action cockpit',
        tone:
          selectedVisitNextActionReadyCount === selectedVisitNextActionItems.length
            ? 'ready'
            : 'watch',
      },
    ];
  }, [
    draftLines.length,
    ownerReportManualReferences.length,
    ownerVisibleNotes.length,
    selectedVisitHandoffExportLineCount,
    selectedVisitHandoffReadyCount,
    selectedVisitManualExtractionRows.length,
    selectedVisitManualLinkRows.length,
    selectedVisitNextActionItems.length,
    selectedVisitNextActionReadyCount,
    selectedVisitOwnerReportRows.length,
    selectedVisitPartsDraftExportLineCount,
    selectedVisitPartsDraftRows.length,
    selectedVisitPartsManualEvidenceItems.length,
    selectedVisitReleaseStatus,
    visibleTodos,
  ]);
  const servicepersonCloseoutComposerReadyCount =
    servicepersonCloseoutComposerItems.filter((item) => item.tone === 'ready').length;
  const servicepersonCloseoutComposerText = useMemo(() => {
    const modelLabel = selectedVisit
      ? getServiceModelLabel(selectedVisit.modelSlug)
      : 'Selected Hylono unit';
    const openServiceTodoCount = visibleTodos.filter((todo) => !todo.done).length;

    return [
      'HYLONO SERVICEPERSON CLOSEOUT REVIEW DRAFT',
      `Visit: ${selectedVisit?.id ?? 'sample-service-visit'} / ${
        selectedVisit?.serial ?? 'sample-service-visit'
      }`,
      `Device: ${modelLabel}`,
      `Role surface: ${currentServiceRole ?? 'Preview service workspace'}`,
      `Composer readiness: ${servicepersonCloseoutComposerReadyCount} ready / ${servicepersonCloseoutComposerItems.length} lanes`,
      `Owner release timeline: ${selectedVisitReleaseStatus}; ${selectedVisitOwnerReportRows.length} owner report row(s); ${ownerVisibleNotes.length} owner-safe note(s); ${ownerReportManualReferences.length} owner-safe manual reference(s).`,
      `Shared notes/todos: ${ownerVisibleNotes.length} owner-visible note(s); ${openServiceTodoCount} open company/person task(s); raw note bodies are not copied here.`,
      `Manual evidence: ${selectedVisitPartsManualEvidenceItems.length} staged part evidence row(s); ${selectedVisitManualLinkRows.length} selected-visit manual link(s); ${selectedVisitManualExtractionRows.length} extraction queue row(s).`,
      `Next action gates: ${selectedVisitNextActionReadyCount} ready / ${selectedVisitNextActionItems.length} gated actions; run source actions separately.`,
      'Boundary: review-only closeout draft. Copying this text creates no owner-send action, supplier quote, supplier order, payment, fulfillment, warranty approval, or published report transition. Manager owner-report save uses separate owner-safe fields only.',
      '',
      '-- OWNER-SAFE HANDOFF --',
      selectedVisitHandoffExportText,
      '',
      '-- MANAGER PARTS PACKET --',
      selectedVisitPartsDraftExportText,
    ].join('\n');
  }, [
    currentServiceRole,
    ownerReportManualReferences.length,
    ownerVisibleNotes.length,
    selectedVisit,
    selectedVisitHandoffExportText,
    selectedVisitManualExtractionRows.length,
    selectedVisitManualLinkRows.length,
    selectedVisitNextActionItems.length,
    selectedVisitNextActionReadyCount,
    selectedVisitOwnerReportRows.length,
    selectedVisitPartsDraftExportText,
    selectedVisitPartsManualEvidenceItems.length,
    selectedVisitReleaseStatus,
    servicepersonCloseoutComposerItems.length,
    servicepersonCloseoutComposerReadyCount,
    visibleTodos,
  ]);
  const servicepersonCloseoutComposerLineCount =
    servicepersonCloseoutComposerText.split('\n').filter(Boolean).length;
  const servicepersonOwnerReportSaveBridgeText = useMemo(() => {
    const modelLabel = selectedVisit
      ? getServiceModelLabel(selectedVisit.modelSlug)
      : 'Selected Hylono unit';

    return [
      'HYLONO OWNER REPORT SAVE BRIDGE',
      `Visit: ${selectedVisit?.id ?? 'sample-service-visit'} / ${
        selectedVisit?.serial ?? 'sample-service-visit'
      }`,
      `Device: ${modelLabel}`,
      `Owner summary: ${ownerReportSummary}`,
      `Checklist count: ${checklist.length}`,
      `Owner-safe manual references: ${ownerReportManualReferences.length}`,
      `Composer lanes reviewed: ${servicepersonCloseoutComposerReadyCount} ready / ${servicepersonCloseoutComposerItems.length}`,
      'Submitted fields: deviceId, visitId, reportId, ownerSummary, finalStatus, checklistCount, manualReferencesJson.',
      'Withheld fields: serviceperson composer text, raw note bodies, part SKUs or names, supplier quote, supplier order, payment, fulfillment, warranty approval, and report status transition.',
    ].join('\n');
  }, [
    checklist.length,
    ownerReportManualReferences.length,
    ownerReportSummary,
    selectedVisit,
    servicepersonCloseoutComposerItems.length,
    servicepersonCloseoutComposerReadyCount,
  ]);
  const servicepersonOwnerReportSaveBridgeLineCount =
    servicepersonOwnerReportSaveBridgeText.split('\n').filter(Boolean).length;
  const ownerDraftNextAction = selectedVisitNextActionItems.find(
    (item) => item.id === 'owner-draft'
  );
  const releaseStatusNextAction = selectedVisitNextActionItems.find(
    (item) => item.id === 'release-status'
  );
  const ownerDraftSaveBoundaryLabel = publishOwnerReportAction
    ? 'Private-write boundary mounted'
    : 'Preview-only owner draft gate';
  const servicepersonCloseoutSaveReadinessItems = useMemo<
    NexusServiceCloseoutComposerItem[]
  >(
    () => [
      {
        id: 'composer-readiness',
        label: 'Composer readiness',
        status: `${servicepersonCloseoutComposerReadyCount} ready lanes`,
        detail: `${servicepersonCloseoutComposerItems.length} composer lanes feed manager review before the existing save gate is used.`,
        source: 'Serviceperson closeout composer',
        tone:
          servicepersonCloseoutComposerReadyCount >=
          Math.ceil(servicepersonCloseoutComposerItems.length / 2)
            ? 'ready'
            : 'watch',
      },
      {
        id: 'owner-draft-save-gate',
        label: 'Owner draft save gate',
        status: ownerDraftSaveBoundaryLabel,
        detail: `${
          ownerDraftNextAction?.actionLabel ?? 'Save selected owner draft'
        } remains the only owner-report save trigger; composer data is review context, not an automatic submission.`,
        source: ownerDraftNextAction?.backingLabel ?? 'Owner report action not mounted',
        tone: publishOwnerReportAction ? 'ready' : 'watch',
      },
      {
        id: 'manual-evidence-save-check',
        label: 'Manual evidence check',
        status:
          selectedVisitManualLinkRows.length > 0
            ? 'Owner-safe refs attached'
            : 'Manual refs still pending',
        detail: `${selectedVisitManualLinkRows.length} selected-visit manual link${
          selectedVisitManualLinkRows.length === 1 ? '' : 's'
        }, ${selectedVisitManualExtractionRows.length} extraction review row${
          selectedVisitManualExtractionRows.length === 1 ? '' : 's'
        }, and ${selectedVisitPartsManualEvidenceItems.length} staged part evidence row${
          selectedVisitPartsManualEvidenceItems.length === 1 ? '' : 's'
        } stay visible before manager save review.`,
        source: 'Owner-safe manual evidence gate',
        tone:
          selectedVisitManualLinkRows.length > 0 ||
          selectedVisitPartsManualEvidenceItems.length > 0
            ? 'ready'
            : 'watch',
      },
      {
        id: 'release-separation',
        label: 'Release separation',
        status: releaseStatusNextAction?.status ?? selectedVisitReleaseStatus,
        detail: firstOwnerReportReleaseCandidate
          ? `${firstOwnerReportReleaseCandidate.reportNumber} can use the separate release control after manager save review.`
          : 'Report release stays separate from this save-readiness panel and still requires the release gate.',
        source: releaseStatusNextAction?.backingLabel ?? 'Report status action not mounted',
        tone: firstOwnerReportReleaseCandidate && publishOwnerReportStatusAction ? 'ready' : 'watch',
      },
      {
        id: 'privacy-analytics',
        label: 'Privacy and analytics',
        status: 'Aggregate telemetry only',
        detail:
          'Save-readiness display uses counts and statuses only; note bodies, part SKUs/names, supplier details, and report bodies are not sent from this panel.',
        source: 'Analytics boundary',
        tone: 'ready',
      },
    ],
    [
      firstOwnerReportReleaseCandidate,
      ownerDraftNextAction,
      ownerDraftSaveBoundaryLabel,
      publishOwnerReportAction,
      publishOwnerReportStatusAction,
      releaseStatusNextAction,
      selectedVisitManualExtractionRows.length,
      selectedVisitManualLinkRows.length,
      selectedVisitPartsManualEvidenceItems.length,
      selectedVisitReleaseStatus,
      servicepersonCloseoutComposerItems.length,
      servicepersonCloseoutComposerReadyCount,
    ]
  );
  const serviceActivityTimelineItems = useMemo<NexusServiceActivityTimelineItem[]>(() => {
    const rows: NexusServiceActivityTimelineItem[] = [];
    let fallbackIndex = 0;
    const pushRow = (row: Omit<NexusServiceActivityTimelineItem, 'sortValue'>) => {
      rows.push({
        ...row,
        sortValue: buildTimelineSortValue(row.timeLabel, fallbackIndex++),
      });
    };

    initialPersistedNotes.forEach((note) => {
      pushRow({
        id: `note:${note.id}`,
        kind: 'Shared note',
        title: `${note.target} note`,
        detail: `${note.body.length} characters routed to ${note.target.toLowerCase()} history.`,
        actor: note.author,
        timeLabel: note.time,
        status: note.source === 'authenticated' ? 'Authenticated' : 'Local draft',
        scope: note.target,
      });
    });
    initialPersistedTodos.forEach((todo) => {
      pushRow({
        id: `todo:${todo.id}`,
        kind: 'Task',
        title: todo.title,
        detail: `${todo.priority} priority for ${todo.owner}.`,
        actor: todo.owner,
        timeLabel: todo.due,
        status: todo.done ? 'Done' : 'Open',
        scope: todo.scope,
      });
    });
    initialPersistedPartsDrafts.forEach((draftItem) => {
      pushRow({
        id: `parts:${draftItem.id}`,
        kind: 'Parts draft',
        title: draftItem.id,
        detail: `${draftItem.lineCount} lines / ${draftItem.quantityTotal} units / ${formatPln(
          draftItem.totalValue
        )} review value.`,
        actor: draftItem.createdBy,
        timeLabel: draftItem.submittedAt,
        status: draftItem.status,
        scope: draftItem.deviceId,
      });
    });
    initialPersistedManualLinks.forEach((manualLink) => {
      pushRow({
        id: `manual-link:${manualLink.id}`,
        kind: 'Manual link',
        title: manualLink.documentTitle,
        detail: `${manualLink.documentVersion} linked to ${
          manualLink.targetLabel ?? manualLink.targetId ?? manualLink.deviceId
        }.`,
        actor: manualLink.linkedBy,
        timeLabel: manualLink.linkedAt,
        status: manualLink.reviewStatus,
        scope: manualLink.deviceId,
      });
    });
    initialPersistedManualExtractionQueue.forEach((queueItem) => {
      pushRow({
        id: `manual-review:${queueItem.id}`,
        kind: 'Manual review',
        title: queueItem.documentTitle,
        detail: `${queueItem.checklistCount} extraction checks for ${
          queueItem.targetLabel ?? queueItem.targetId
        }.`,
        actor: queueItem.requestedBy,
        timeLabel: queueItem.queuedAt,
        status: queueItem.reviewStatus,
        scope: queueItem.deviceId,
      });
    });
    initialPersistedOwnerReports.forEach((report) => {
      pushRow({
        id: `owner-report:${report.id}`,
        kind: 'Owner report',
        title: report.reportNumber,
        detail: `${report.checklistCount} checks / ${
          report.manualReferences?.length ?? 0
        } refs for ${report.deviceId}.`,
        actor: report.createdBy,
        timeLabel: report.publishedAt,
        status: report.finalStatus,
        scope: report.deviceId,
      });
    });

    return rows
      .sort((a, b) => b.sortValue - a.sortValue || a.kind.localeCompare(b.kind))
      .slice(0, 12);
  }, [
    initialPersistedManualExtractionQueue,
    initialPersistedManualLinks,
    initialPersistedNotes,
    initialPersistedOwnerReports,
    initialPersistedPartsDrafts,
    initialPersistedTodos,
  ]);
  const serviceActivityTimelineSummary =
    serviceActivityTimelineItems.length > 0
      ? `${serviceActivityTimelineItems.length} authenticated events`
      : 'No authenticated events';

  const buildSelectedVisitFormValue = () =>
    selectedVisit?.serial || selectedVisit?.id || 'sample-service-visit';

  const buildNoteActionFormData = (body: string) => {
    const formData = new FormData();
    formData.set('deviceId', buildSelectedVisitFormValue());
    formData.set('visitId', selectedVisit?.id ?? '');
    formData.set('scope', NOTE_SCOPE_FOR_ACTION[noteTarget]);
    formData.set('body', body);
    return formData;
  };

  const buildPartsDraftActionFormData = () => {
    const formData = new FormData();
    formData.set('deviceId', buildSelectedVisitFormValue());
    formData.set('visitId', selectedVisit?.id ?? '');
    formData.set(
      'linesJson',
      JSON.stringify(
        draftLines.map((part) => ({
          partNumber: part.sku,
          label: part.name,
          quantity: part.quantity,
          reason: part.reason,
        }))
      )
    );
    return formData;
  };

  const buildManualLinkActionFormData = (manual: NexusServiceManualEntry) => {
    const formData = new FormData();
    formData.set('deviceId', buildSelectedVisitFormValue());
    formData.set('targetType', 'visit');
    formData.set('targetId', selectedVisit?.id ?? buildSelectedVisitFormValue());
    formData.set(
      'targetLabel',
      selectedVisit
        ? `${selectedVisit.serial} service visit`
        : 'Sample service visit'
    );
    formData.set('documentId', manual.id);
    formData.set('documentVersion', manual.documentVersion);
    return formData;
  };

  const buildManualExtractionQueueActionFormData = (manual: NexusServiceManualEntry) => {
    const formData = buildManualLinkActionFormData(manual);
    formData.set('requestedOutcome', manual.ownerHandoff);
    formData.set('extractionChecklistJson', JSON.stringify(manual.extractionChecklist));
    return formData;
  };

  const buildManualExtractionReviewActionFormData = (
    queueItem: NexusServiceManualExtractionQueueItem,
    reviewStatus: NexusServiceManualExtractionReviewStatus
  ) => {
    const formData = new FormData();
    formData.set('queueId', queueItem.id);
    formData.set('documentId', queueItem.documentId);
    formData.set('reviewStatus', reviewStatus);
    return formData;
  };

  const buildTodoActionFormData = (todo: NexusServiceTodo) => {
    const formData = new FormData();
    formData.set('deviceId', buildSelectedVisitFormValue());
    formData.set('title', todo.title);
    formData.set('scope', todo.scope);
    formData.set('assigneePersonId', todo.owner);
    formData.set('dueDate', todo.due);
    formData.set('priority', todo.priority);
    formData.set('status', todo.done ? 'done' : 'open');
    return formData;
  };

  const buildPartsOrderActionFormData = () => {
    const formData = new FormData();
    const draftLineKey = draftLines.map((part) => `${part.sku}:${part.quantity}`).join('|');
    formData.set('draftId', `${selectedVisit?.id ?? 'sample-visit'}:${draftLineKey || 'empty'}`);
    return formData;
  };

  const buildOwnerReportActionFormData = () => {
    const formData = new FormData();
    formData.set('deviceId', buildSelectedVisitFormValue());
    formData.set('visitId', selectedVisit?.id ?? '');
    formData.set('reportId', `${selectedVisit?.id ?? 'sample-visit'}-owner-closeout`);
    formData.set('ownerSummary', ownerReportSummary);
    formData.set('finalStatus', 'owner-ready');
    formData.set('checklistCount', String(checklist.length));
    formData.set('manualReferencesJson', JSON.stringify(ownerReportManualReferences));
    return formData;
  };

  const buildOwnerDeviceScopeActionFormData = () => {
    const formData = new FormData();
    formData.set('ownerProfileId', ownerScopeProfileId.trim());
    formData.set('ownerDeviceIdsJson', JSON.stringify(ownerDeviceScopeIds));
    return formData;
  };

  const buildOwnerReportStatusActionFormData = (
    report: NexusServiceOwnerReportHistoryItem
  ) => {
    const formData = new FormData();
    formData.set('reportId', report.reportId);
    formData.set('finalStatus', 'published');
    return formData;
  };

  const runServiceActionBoundary = async (
    runner: NexusServiceActionRunner | undefined,
    formData: FormData
  ) => {
    if (!runner) {
      return;
    }

    setServerActionPending(true);
    try {
      const result = await runner(INITIAL_NEXUS_SERVICE_ACTION_STATE, formData);
      setServerActionResult(result);
    } catch {
      setServerActionResult({
        success: false,
        status: 'validation_error',
        message: 'Service action boundary could not be checked from this browser preview.',
        persisted: false,
        futureTable: null,
        persistenceMode: 'blocked',
      });
    } finally {
      setServerActionPending(false);
    }
  };

  const addNote = () => {
    const trimmed = noteText.trim();
    if (trimmed.length < 3) return;

    setNotes((current) => [
      {
        id: buildLocalServiceNoteId(current.length + 1),
        author: 'Current operator',
        target: noteTarget,
        body: trimmed,
        time: 'Just now',
        source: 'local',
      },
      ...current,
    ]);
    setNoteText('');
    trackServiceAction('shared_note_added', {
      target: noteTarget,
      body_length: trimmed.length,
    });
    void runServiceActionBoundary(createNoteAction, buildNoteActionFormData(trimmed));
  };

  const updateDraftQuantity = (partId: string, nextQuantity: number) => {
    setDraft((current) => {
      if (nextQuantity <= 0) {
        const { [partId]: _removed, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [partId]: nextQuantity,
      };
    });
    setDraftNotice(null);
    setPartsDraftExportStatus('idle');
  };

  const toggleTodo = (todoId: string) => {
    const todo = todos.find((item) => item.id === todoId);
    if (!todo) {
      return;
    }

    const nextTodo = {
      ...todo,
      done: !todo.done,
    };
    setTodos((current) =>
      current.map((todo) =>
        todo.id === todoId ? nextTodo : todo
      )
    );
    trackServiceAction('todo_toggled', { todo_id: todoId });
    void runServiceActionBoundary(assignTodoAction, buildTodoActionFormData(nextTodo));
  };

  const sendPartsDraft = () => {
    if (draftLines.length === 0) return;

    setDraftNotice(
      `${draftLines.length} replacement part line${draftLines.length === 1 ? '' : 's'} queued for manager review.`
    );
    trackServiceAction('parts_draft_sent', {
      line_count: draftLines.length,
      total_value: totalDraftValue,
    });
    void runServiceActionBoundary(createPartsDraftAction, buildPartsDraftActionFormData());
  };

  const checkPartsOrderGate = () => {
    if (draftLines.length === 0) return;

    setDraftNotice(
      'Order gate checked. Real supplier ordering remains blocked until integrations and approvals are live.'
    );
    trackServiceAction('parts_order_gate_checked', {
      line_count: draftLines.length,
      total_value: totalDraftValue,
    });
    void runServiceActionBoundary(submitPartsOrderAction, buildPartsOrderActionFormData());
  };

  const handleManualAction = (manual: NexusServiceManualEntry) => {
    if (manual.status === 'Needs extraction') {
      trackServiceAction('manual_extraction_queue_requested', {
        document_id: manual.id,
        document_status: manual.status,
        document_version: manual.documentVersion,
        source_ref: manual.sourceRef,
        checklist_count: manual.extractionChecklist.length,
        target_type: 'visit',
        target_id: selectedVisit?.id,
      });
      void runServiceActionBoundary(
        queueManualExtractionAction,
        buildManualExtractionQueueActionFormData(manual)
      );
      return;
    }

    if (manual.status === 'Manager-only') {
      trackServiceAction('manual_commercial_reference_withheld', {
        document_id: manual.id,
        document_status: manual.status,
        document_version: manual.documentVersion,
        source_ref: manual.sourceRef,
      });
      setServerActionResult({
        success: false,
        status: 'role_not_allowed',
        message:
          'Manager-only commercial references stay withheld from extraction and owner reports.',
        persisted: false,
        futureTable: 'nexus_service_manual_extraction_queue',
        persistenceMode: 'blocked',
      });
      return;
    }

    trackServiceAction('manual_link_requested', {
      document_id: manual.id,
      document_status: manual.status,
      document_version: manual.documentVersion,
      target_type: 'visit',
      target_id: selectedVisit?.id,
    });
    void runServiceActionBoundary(linkManualAction, buildManualLinkActionFormData(manual));
  };

  const handleManualExtractionReview = (
    queueItem: NexusServiceManualExtractionQueueItem,
    reviewStatus: NexusServiceManualExtractionReviewStatus
  ) => {
    trackServiceAction('manual_extraction_review_requested', {
      document_id: queueItem.documentId,
      queue_id_present: Boolean(queueItem.id),
      review_status: reviewStatus,
    });
    void runServiceActionBoundary(
      reviewManualExtractionAction,
      buildManualExtractionReviewActionFormData(queueItem, reviewStatus)
    );
  };

  const saveOwnerReport = () => {
    trackServiceAction('owner_report_publish_requested', {
      visit_id: selectedVisit?.id,
      checklist_count: checklist.length,
      owner_note_count: ownerVisibleNotes.length,
      part_line_count: draftLines.length,
    });
    void runServiceActionBoundary(
      publishOwnerReportAction,
      buildOwnerReportActionFormData()
    );
  };

  const saveOwnerReportFromCloseoutComposer = () => {
    if (!canPublishOwnerReport || !publishOwnerReportAction) {
      return;
    }

    trackServiceAction('serviceperson_closeout_owner_report_save_requested', {
      visit_id: selectedVisit?.id ?? 'sample-service-visit',
      bridge_line_count: servicepersonOwnerReportSaveBridgeLineCount,
      composer_line_count: servicepersonCloseoutComposerLineCount,
      composer_lane_count: servicepersonCloseoutComposerItems.length,
      ready_lane_count: servicepersonCloseoutComposerReadyCount,
      checklist_count: checklist.length,
      owner_note_count: ownerVisibleNotes.length,
      manual_reference_count: ownerReportManualReferences.length,
      part_line_count: draftLines.length,
      saved_parts_draft_count: selectedVisitPartsDraftRows.length,
    });
    void runServiceActionBoundary(
      publishOwnerReportAction,
      buildOwnerReportActionFormData()
    );
  };

  const saveOwnerDeviceScope = () => {
    if (!canAssignOwnerDeviceScope || !ownerScopeProfileId.trim() || ownerDeviceScopeIds.length === 0) {
      return;
    }

    trackServiceAction('owner_device_scope_assigned', {
      device_count: ownerDeviceScopeIds.length,
      has_profile: Boolean(ownerScopeProfileId.trim()),
    });
    void runServiceActionBoundary(
      assignOwnerDeviceScopeAction,
      buildOwnerDeviceScopeActionFormData()
    );
  };

  const releaseOwnerReport = (report: NexusServiceOwnerReportHistoryItem) => {
    if (!canReleaseOwnerReport || report.finalStatus !== 'Owner-ready') {
      return;
    }

    trackServiceAction('owner_report_status_publish_requested', {
      report_ready: true,
      checklist_count: report.checklistCount,
      manual_reference_count: report.manualReferences?.length ?? 0,
    });
    void runServiceActionBoundary(
      publishOwnerReportStatusAction,
      buildOwnerReportStatusActionFormData(report)
    );
  };

  const copySelectedVisitHandoffExport = async () => {
    trackServiceAction('handoff_export_copy_requested', {
      visit_id: selectedVisit?.id ?? 'sample-service-visit',
      line_count: selectedVisitHandoffExportLineCount,
      owner_note_count: ownerVisibleNotes.length,
      manual_reference_count: ownerReportManualReferences.length,
      part_line_count: draftLines.length,
    });

    if (!navigator.clipboard?.writeText) {
      setHandoffExportStatus('unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedVisitHandoffExportText);
      setHandoffExportStatus('copied');
    } catch {
      setHandoffExportStatus('unavailable');
    }
  };

  const copySelectedVisitPartsDraftExport = async () => {
    trackServiceAction('parts_draft_review_packet_copy_requested', {
      visit_id: selectedVisit?.id ?? 'sample-service-visit',
      export_line_count: selectedVisitPartsDraftExportLineCount,
      part_line_count: draftLines.length,
      pack_count: stagedDraftPackCount,
      saved_draft_count: selectedVisitPartsDraftRows.length,
      total_value: totalDraftValue,
    });

    if (!navigator.clipboard?.writeText) {
      setPartsDraftExportStatus('unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedVisitPartsDraftExportText);
      setPartsDraftExportStatus('copied');
    } catch {
      setPartsDraftExportStatus('unavailable');
    }
  };

  const copySelectedVisitPersistedPartsManualReadback = async () => {
    trackServiceAction('parts_manual_persisted_readback_copy_requested', {
      visit_id: selectedVisit?.id ?? 'sample-service-visit',
      line_count: selectedVisitPersistedPartsManualReadbackLineCount,
      readback_lane_count: selectedVisitPersistedPartsManualReadbackItems.length,
      ready_lane_count: selectedVisitPersistedPartsManualReadbackReadyCount,
      saved_parts_draft_count: selectedVisitPartsDraftRows.length,
      manual_link_count: selectedVisitManualLinkRows.length,
      manual_extraction_count: selectedVisitManualExtractionRows.length,
      owner_safe_reference_count: ownerReportManualReferences.length,
      staged_part_line_count: draftLines.length,
    });

    if (!navigator.clipboard?.writeText) {
      setPartsManualReadbackCopyStatus('unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedVisitPersistedPartsManualReadbackText);
      setPartsManualReadbackCopyStatus('copied');
    } catch {
      setPartsManualReadbackCopyStatus('unavailable');
    }
  };

  const copyServicepersonCloseoutComposer = async () => {
    trackServiceAction('serviceperson_closeout_composer_copy_requested', {
      visit_id: selectedVisit?.id ?? 'sample-service-visit',
      line_count: servicepersonCloseoutComposerLineCount,
      composer_lane_count: servicepersonCloseoutComposerItems.length,
      ready_lane_count: servicepersonCloseoutComposerReadyCount,
      owner_note_count: ownerVisibleNotes.length,
      open_task_count: visibleTodos.filter((todo) => !todo.done).length,
      manual_evidence_count: selectedVisitPartsManualEvidenceItems.length,
      part_line_count: draftLines.length,
      saved_parts_draft_count: selectedVisitPartsDraftRows.length,
    });

    if (!navigator.clipboard?.writeText) {
      setCloseoutComposerCopyStatus('unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(servicepersonCloseoutComposerText);
      setCloseoutComposerCopyStatus('copied');
    } catch {
      setCloseoutComposerCopyStatus('unavailable');
    }
  };

  const runSelectedVisitNextAction = (item: NexusServiceNextActionCockpitItem) => {
    if (item.actionState !== 'available') {
      return;
    }

    if (item.id === 'attach-manual' && firstOwnerSafeManualAction) {
      handleManualAction(firstOwnerSafeManualAction);
      return;
    }

    if (item.id === 'stage-parts') {
      sendPartsDraft();
      return;
    }

    if (item.id === 'owner-draft') {
      saveOwnerReport();
      return;
    }

    if (item.id === 'release-status' && firstOwnerReportReleaseCandidate) {
      releaseOwnerReport(firstOwnerReportReleaseCandidate);
    }
  };

  const toggleOwnerDeviceScopeId = (deviceId: string) => {
    setOwnerDeviceScopeText((current) => {
      const currentIds = normalizeOwnerDeviceScopeText(current);
      const nextIds = currentIds.includes(deviceId)
        ? currentIds.filter((item) => item !== deviceId)
        : [...currentIds, deviceId];

      return nextIds.join('\n');
    });
  };

  const resetLocalDraft = () => {
    setNotes(defaultLocalNotes);
    setTodos(defaultLocalTodos);
    setDraft(buildInitialPartsDraft());
    setDraftNotice('Local service draft reset to the source-backed sample.');
    trackServiceAction('local_draft_reset');
  };

  return (
    <PartnerLayout title="Service Operations">
      <div className="space-y-6" data-nexus-service-operations>
        <section
          className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] text-[#0f172a] shadow-xs"
        >
          {/* Background Panoramic Clinic / Hardware Image */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <Image
              src="/images/landing/hardware-catalog.jpg"
              alt="Clinical hardware and service operations panoramic view"
              fill
              priority
              sizes="100vw"
              className="object-cover object-right-top opacity-20 md:opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff] via-[#ffffff]/90 to-[#ffffff]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 grid gap-6 p-6 sm:p-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#f59e0b]/[0.20] bg-[#f59e0b]/[0.10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                <span className="h-1.5 w-1.5 rounded-[9999px] bg-[#f59e0b] animate-pulse" />
                <Sparkles className="h-3.5 w-3.5" />
                Owner and service workspace · Clinical Hardware
              </div>
              <h1 className="mt-3 max-w-4xl text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl">
                Run service visits, shared notes, tasks, manuals, and replacement parts from one Nexus module.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#475569] sm:text-base">
                This preview adapts the existing Omega3 inspection app concepts into the Hylono
                operator shell: technician workflow, owner-visible notes, company tasks, parts
                drafts, and source-backed manual references. Live customer data still belongs
                behind authenticated storage.
              </p>

              {/* Sample workspace tour compliance boundary note */}
              <div
                role="note"
                aria-label="Nexus public route boundary: sample workspace tour without live clinic records"
                className="sr-only"
              >
                Sample workspace tour without live clinic records. No live clinic records are shown.
                Choose a module. Move to account access. Escalate setup or support.
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'Active visits',
                    value: activeVisits,
                    detail: 'sample service queue',
                    icon: Wrench,
                    color: 'text-amber-700',
                    bg: 'bg-[#f59e0b]/[0.10]',
                  },
                  {
                    label: 'Open todos',
                    value: openTodos,
                    detail: 'company and person scopes',
                    icon: ClipboardCheck,
                    color: 'text-emerald-700',
                    bg: 'bg-[#10b981]/[0.10]',
                  },
                  {
                    label: 'Part packs',
                    value: activePartPacks,
                    detail: 'staged for review',
                    icon: PackageCheck,
                    color: 'text-cyan-700',
                    bg: 'bg-[#06b6d4]/[0.10]',
                  },
                  {
                    label: 'Manuals',
                    value: readyManuals,
                    detail: 'ready source entries',
                    icon: BookOpen,
                    color: 'text-teal-700',
                    bg: 'bg-[#0d9488]/[0.10]',
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-xs"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${metric.bg} ${metric.color}`}>
                      <metric.icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-[#0f172a]">{metric.value}</p>
                    <p className="mt-1 text-xs text-[#64748b]">{metric.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                    Local draft
                  </p>
                  <p className="mt-1 text-sm text-[#475569]">
                    {lastSavedAt
                      ? `Saved on this browser. Updated ${NEXUS_SERVICE_DRAFT_PREVIEW_UPDATED_LABEL}.`
                      : 'Saved on this browser after editing.'}
                  </p>
                </div>
                <button
                  type="button"
                  aria-describedby={SERVICE_PARTS_DRAFT_STATUS_ID}
                  onClick={resetLocalDraft}
                  className={`inline-flex min-h-11 items-center justify-center rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-xs hover:bg-[#f1f5f9] ${FOCUS_RING}`}
                >
                  Reset local draft
                </button>
              </div>
            </div>

            <aside className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                Selected visit
              </p>
              {selectedVisit ? (
                <>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-[#0f172a]">
                        {getServiceModelLabel(selectedVisit.modelSlug)}
                      </h2>
                      <p className="mt-1 text-sm text-[#64748b]">
                        {selectedVisit.client} - {selectedVisit.location}
                      </p>
                    </div>
                    <span
                      className={`rounded-[9999px] border px-3 py-1 text-xs font-bold ${VISIT_STATUS_CLASSES[selectedVisit.status]}`}
                    >
                      {selectedVisit.status}
                    </span>
                  </div>
                  <dl className="mt-5 grid gap-3 text-sm">
                    <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                      <dt className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Serial</dt>
                      <dd className="mt-1 font-bold text-[#0f172a]">{selectedVisit.serial}</dd>
                    </div>
                    <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                      <dt className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Window</dt>
                      <dd className="mt-1 font-bold text-[#0f172a]">{selectedVisit.window}</dd>
                    </div>
                    <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                      <dt className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Known catalog facts</dt>
                      <dd className="mt-1 font-bold text-[#0f172a]">
                        {selectedModel
                          ? `${selectedModel.gas} - ${selectedModel.h2Value}`
                          : 'Catalog match pending'}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="mt-4 text-sm text-[#64748b]">No service visit selected.</p>
              )}
            </aside>
          </div>
        </section>

        <section
          aria-label="Service workspace status index"
          className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Storage/read-back index
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                Know what is live before a visit handoff.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                Role-aware snapshot across owner notes, company/person tasks, parts drafts,
                manuals, reports, and owner device access.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] px-3 py-1 text-xs font-semibold text-emerald-700">
                {serviceReadbackReadyCount} connected / {serviceReadbackIndexItems.length} lanes
              </span>
              <span className="rounded-[14px] border border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10] px-3 py-1 text-xs font-semibold text-rose-700">
                {serviceReadbackBlockedCount} blocked
              </span>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            {serviceReadbackIndexItems.map((item) => (
              <article
                key={item.id}
                aria-label={
                  item.id === 'owner-device-access'
                    ? 'Owner device scope read-back status'
                    : `${item.label} read-back status`
                }
                className={`rounded-[14px] border p-4 ${
                  item.tone === 'ready'
                    ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                    : item.tone === 'blocked'
                      ? 'border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10]'
                      : item.tone === 'watch'
                        ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                        : 'border-[#e2e8f0] bg-[#f8fafc]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                    {item.label}
                  </p>
                  <span
                    className={`rounded-[14px] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold ${
                      item.tone === 'ready'
                        ? 'text-emerald-700'
                        : item.tone === 'blocked'
                          ? 'text-rose-700'
                          : item.tone === 'watch'
                            ? 'text-amber-700'
                            : 'text-[#475569]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-[#0f172a]">{item.value}</p>
                <p className="mt-2 text-xs leading-5 text-[#334155]">{item.detail}</p>
              </article>
            ))}
          </div>
          <div
            aria-label="Owner report and parts draft recovery actions"
            className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Private storage recovery actions
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#0f172a]">
                  Recover report and parts history without crossing boundaries.
                </h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-[#334155]">
                Use local drafts and owner-safe exports as recovery artifacts until private
                storage connection is confirmed.
              </p>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {storageRecoveryActionItems.map((item) => (
                <article
                  key={item.id}
                  aria-label={`${item.label} recovery action`}
                  className={`rounded-[14px] border p-4 ${
                    item.tone === 'ready'
                      ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                      : item.tone === 'blocked'
                        ? 'border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10]'
                        : item.tone === 'watch'
                          ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                          : 'border-[#e2e8f0] bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#0f172a]">{item.value}</p>
                    </div>
                    <span
                      className={`rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold ${
                        item.tone === 'ready'
                          ? 'text-emerald-700'
                          : item.tone === 'blocked'
                            ? 'text-rose-700'
                            : item.tone === 'watch'
                              ? 'text-amber-700'
                              : 'text-[#475569]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#334155]">{item.detail}</p>
                  <p className="mt-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm font-semibold leading-6 text-[#0f172a]">
                    {item.action}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-label="Selected visit handoff instructions packet"
          className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Visit handoff packet
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                Turn the selected visit into owner-safe instructions.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                Combines serviceperson instructions, owner notes, company tasks,
                manual references, and review-only replacement parts before closeout.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] px-3 py-1 text-xs font-semibold text-emerald-700">
                {selectedVisitHandoffReadyCount} ready / {selectedVisitHandoffPacketItems.length}{' '}
                checks
              </span>
              <span className="rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-3 py-1 text-xs font-semibold text-cyan-700">
                {selectedVisit?.id ?? 'No visit selected'}
              </span>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {selectedVisitHandoffPacketItems.map((item) => (
              <article
                key={item.id}
                className={`rounded-[14px] border p-4 ${
                  item.tone === 'ready'
                    ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                    : item.tone === 'blocked'
                      ? 'border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10]'
                      : item.tone === 'watch'
                        ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                        : 'border-[#e2e8f0] bg-[#f8fafc]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                    {item.label}
                  </p>
                  <span className="rounded-[14px] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
                    {item.audience}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <p className="text-2xl font-bold text-[#0f172a]">{item.value}</p>
                  <span
                    className={`rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold ${
                      item.tone === 'ready'
                        ? 'text-emerald-700'
                        : item.tone === 'blocked'
                          ? 'text-rose-700'
                          : item.tone === 'watch'
                            ? 'text-amber-700'
                            : 'text-[#475569]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#334155]">{item.detail}</p>
              </article>
            ))}
          </div>
          <div
            aria-label="Owner-safe handoff readback"
            className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Owner-safe read-back
            </p>
            <p className="mt-2 text-sm leading-6 text-[#334155]">{ownerReportSummary}</p>
          </div>
          <div
            aria-label="Owner-safe handoff export sheet"
            className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Owner-safe share sheet
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#0f172a]">
                  Copy-ready handoff text
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
                  This export keeps the owner handoff in plain text and repeats the manager
                  boundaries before anything leaves the service workspace.
                </p>
              </div>
              <button
                type="button"
                aria-describedby={SERVICE_HANDOFF_EXPORT_STATUS_ID}
                onClick={copySelectedVisitHandoffExport}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-4 py-2 text-sm font-semibold text-[#475569] transition hover:bg-[#06b6d4]/[0.18] ${DARK_FOCUS_RING}`}
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Copy owner-safe handoff
              </button>
            </div>
            <textarea
              readOnly
              aria-label="Owner-safe handoff export text"
              aria-describedby={SERVICE_HANDOFF_EXPORT_STATUS_ID}
              value={selectedVisitHandoffExportText}
              rows={9}
              className={`mt-4 w-full resize-y rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-4 font-mono text-xs leading-5 text-[#0f172a] ${DARK_FOCUS_RING}`}
            />
            <p
              id={SERVICE_HANDOFF_EXPORT_STATUS_ID}
              className="mt-2 text-xs leading-5 text-[#475569]"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={SERVICE_HANDOFF_EXPORT_STATUS_LABEL}
            >
              {handoffExportStatus === 'copied'
                ? 'Owner-safe handoff text copied.'
                : handoffExportStatus === 'unavailable'
                  ? 'Clipboard is unavailable in this browser; use the text field above.'
                  : `${selectedVisitHandoffExportLineCount} export lines ready; no raw technician notes, supplier quotes, or manager-only documents are included.`}
            </p>
          </div>
        </section>

        {canReadSelectedVisitNextActionCockpit ? (
          <section
            aria-label="Serviceperson closeout handoff composer"
            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Serviceperson closeout composer
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                  Build one review-only draft from every handoff lane.
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                  Pulls the owner release timeline, owner-safe handoff sheet, manager
                  parts packet, manual evidence, shared notes, assigned tasks, and gated
                  next actions into one serviceperson draft without sending anything to
                  an owner or supplier.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] px-3 py-1 text-xs font-semibold text-emerald-700">
                  {servicepersonCloseoutComposerReadyCount} ready / {servicepersonCloseoutComposerItems.length} lanes
                </span>
                <span className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#475569]">
                  Review-only closeout draft
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {servicepersonCloseoutComposerItems.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-[14px] border p-4 ${
                    item.tone === 'ready'
                      ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                      : item.tone === 'blocked'
                        ? 'border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10]'
                        : item.tone === 'watch'
                          ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                          : 'border-[#e2e8f0] bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                        {item.label}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[#0f172a]">
                        {item.status}
                      </h3>
                    </div>
                    <span
                      className={`rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${
                        item.tone === 'ready'
                          ? 'bg-[#10b981]/[0.10] text-emerald-700'
                          : item.tone === 'blocked'
                            ? 'bg-[#f43f5e]/[0.10] text-rose-700'
                            : item.tone === 'watch'
                              ? 'bg-[#f59e0b]/[0.10] text-amber-700'
                              : 'bg-[#f8fafc] text-[#475569]'
                      }`}
                    >
                      {item.tone === 'ready'
                        ? 'Ready'
                        : item.tone === 'blocked'
                          ? 'Blocked'
                          : item.tone === 'watch'
                            ? 'Review'
                            : 'Preview'}
                    </span>
                  </div>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-[#334155]">
                    {item.detail}
                  </p>
                  <p className="mt-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-xs font-semibold leading-5 text-[#475569]">
                    {item.source}
                  </p>
                </article>
              ))}
            </div>

            <div
              aria-label="Manager-reviewed owner report save readiness"
              className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Manager save readiness
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#0f172a]">
                    Review the composer before the owner draft save gate.
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                    Existing release actions stay in the selected visit next action
                    cockpit. Managers can save an owner-ready draft from this bridge;
                    release, publishing, sending, and supplier workflow still stay
                    separate.
                  </p>
                </div>
                <span className="rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-3 py-1 text-xs font-semibold text-[#475569]">
                  {ownerDraftSaveBoundaryLabel}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {servicepersonCloseoutSaveReadinessItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-[14px] border p-3 ${
                      item.tone === 'ready'
                        ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                        : item.tone === 'blocked'
                          ? 'border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10]'
                          : item.tone === 'watch'
                            ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                            : 'border-[#e2e8f0] bg-[#f8fafc]'
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#0f172a]">{item.status}</p>
                    <p className="mt-2 text-xs leading-5 text-[#334155]">{item.detail}</p>
                    <p className="mt-2 text-[11px] font-semibold leading-4 text-[#64748b]">
                      {item.source}
                    </p>
                  </div>
                ))}
              </div>
              {canPublishOwnerReport ? (
                <div
                  aria-label="Serviceperson closeout owner report save bridge"
                  className="mt-4 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                        Owner report save bridge
                      </p>
                      <h4 className="mt-1 text-base font-semibold text-[#0f172a]">
                        Save the manager-reviewed owner draft from composer context.
                      </h4>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
                        The action posts the existing owner-safe report fields only:
                        summary, checklist count, final status, and reviewed manual
                        references. It does not submit the serviceperson draft text,
                        raw notes, part SKUs, supplier data, or release status.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-describedby={`${SERVICE_ACTION_STATUS_ID} ${SERVICE_OWNER_REPORT_BRIDGE_STATUS_ID}`}
                      disabled={serverActionPending || !publishOwnerReportAction}
                      onClick={saveOwnerReportFromCloseoutComposer}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-4 py-2 text-sm font-semibold text-[#475569] transition hover:bg-[#06b6d4]/[0.18] disabled:cursor-not-allowed disabled:border-[#e2e8f0] disabled:bg-[#f8fafc] disabled:text-slate-500 ${DARK_FOCUS_RING}`}
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Save owner draft from composer
                    </button>
                  </div>
                  <textarea
                    readOnly
                    aria-label="Owner report save bridge payload readback"
                    aria-describedby={SERVICE_OWNER_REPORT_BRIDGE_STATUS_ID}
                    value={servicepersonOwnerReportSaveBridgeText}
                    rows={9}
                    className={`mt-4 w-full resize-y rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-4 font-mono text-xs leading-5 text-[#0f172a] ${DARK_FOCUS_RING}`}
                  />
                  <p
                    id={SERVICE_OWNER_REPORT_BRIDGE_STATUS_ID}
                    className="mt-2 text-xs leading-5 text-[#475569]"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={SERVICE_OWNER_REPORT_BRIDGE_STATUS_LABEL}
                  >
                    {publishOwnerReportAction
                      ? `${servicepersonOwnerReportSaveBridgeLineCount} bridge lines ready; owner report save remains manager-reviewed and release stays separate.`
                      : 'Owner report action is not mounted in this preview; no private save will run from this bridge.'}
                  </p>
                </div>
              ) : (
                <div
                  aria-label="Serviceperson closeout owner report save boundary"
                  className="mt-4 rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] p-4"
                >
                  <p className="text-sm font-semibold text-amber-700">
                    Manager save required
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-700">
                    This role can review the serviceperson closeout draft, but owner
                    report saving remains manager/admin-only and uses the separate
                    owner-safe report action.
                  </p>
                </div>
              )}
            </div>

            <div
              aria-label="Serviceperson closeout review draft sheet"
              className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Combined draft
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#0f172a]">
                    Copy serviceperson review draft
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
                    The draft is copy-only. Source actions for owner report publishing,
                    parts approval, manual linking, and supplier workflow stay separate.
                  </p>
                </div>
                <button
                  type="button"
                  aria-describedby={SERVICE_CLOSEOUT_DRAFT_COPY_STATUS_ID}
                  onClick={copyServicepersonCloseoutComposer}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-4 py-2 text-sm font-semibold text-[#475569] transition hover:bg-[#06b6d4]/[0.18] ${DARK_FOCUS_RING}`}
                >
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  Copy serviceperson draft
                </button>
              </div>
              <textarea
                readOnly
                aria-label="Serviceperson closeout review draft text"
                aria-describedby={SERVICE_CLOSEOUT_DRAFT_COPY_STATUS_ID}
                value={servicepersonCloseoutComposerText}
                rows={14}
                className={`mt-4 w-full resize-y rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-4 font-mono text-xs leading-5 text-[#0f172a] ${DARK_FOCUS_RING}`}
              />
              <p
                id={SERVICE_CLOSEOUT_DRAFT_COPY_STATUS_ID}
                className="mt-2 text-xs leading-5 text-[#475569]"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={SERVICE_CLOSEOUT_DRAFT_COPY_STATUS_LABEL}
              >
                {closeoutComposerCopyStatus === 'copied'
                  ? 'Serviceperson closeout draft copied.'
                  : closeoutComposerCopyStatus === 'unavailable'
                    ? 'Clipboard is unavailable in this browser; use the text field above.'
                    : `${servicepersonCloseoutComposerLineCount} draft lines ready; no owner-send action, supplier order, payment, fulfillment, or report status transition is created.`}
              </p>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-6">
            <section
              aria-label="Service queue"
              className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Service queue
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                    Choose the visit before writing notes or staging parts.
                  </h2>
                </div>
                <label className="relative block w-full md:max-w-xs">
                  <span className="sr-only">Search service visits</span>
                  <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#64748b]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    aria-describedby={SERVICE_QUEUE_STATUS_ID}
                    className={`min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] py-2 pl-9 pr-3 text-sm text-[#0f172a] placeholder:text-slate-500 ${DARK_FOCUS_RING}`}
                    placeholder="Search serial, owner, model..."
                  />
                </label>
              </div>

              <p
                id={SERVICE_QUEUE_STATUS_ID}
                className="mt-4 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-3 py-2 text-xs font-semibold leading-5 text-[#475569]"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={SERVICE_QUEUE_STATUS_LABEL}
              >
                {serviceQueueStatusMessage}
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {filteredVisits.map((visit) => {
                  const active = selectedVisit?.id === visit.id;

                  return (
                    <button
                      key={visit.id}
                      type="button"
                      aria-pressed={active}
                      aria-describedby={SERVICE_QUEUE_STATUS_ID}
                      onClick={() => {
                        setSelectedVisitId(visit.id);
                        trackServiceAction('service_visit_selected', { visit_id: visit.id });
                      }}
                      className={`rounded-[14px] border p-4 text-left transition hover:-translate-y-0.5 ${DARK_FOCUS_RING} ${
                        active
                          ? 'border-[#06b6d4]/[0.40] bg-[#06b6d4]/[0.10]'
                          : 'border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                          {visit.id}
                        </span>
                        <span
                          className={`rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${PRIORITY_CLASSES[visit.priority]}`}
                        >
                          {visit.priority}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-[#0f172a]">
                        {getServiceModelLabel(visit.modelSlug)}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#334155]">
                        {visit.summary}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#64748b]">
                        <span>{visit.technician}</span>
                        <span className="text-right">{visit.openTasks} tasks</span>
                      </div>
                    </button>
                  );
                })}
                {filteredVisits.length === 0 ? (
                  <p className="rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] p-4 text-sm font-semibold leading-6 text-amber-50 lg:col-span-3">
                    No service visits match this search. Clear the search to restore the sample queue.
                  </p>
                ) : null}
              </div>
            </section>

            {canReadSelectedVisitNextActionCockpit ? (
            <section
              aria-label="Selected visit next action cockpit"
              className="overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-[#ffffff]"
            >
              <div className="grid gap-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.45fr)]">
                <div className="border-b border-[#e2e8f0] bg-[#f8fafc] p-5 lg:border-b-0 lg:border-r">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Next action cockpit
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#0f172a]">
                    Move this visit without losing role boundaries.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#334155]">
                    One selected-visit lane for manual attachment, parts draft staging,
                    owner-safe draft save, and release review for{' '}
                    {selectedVisit?.serial ?? 'the selected visit'}.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-cyan-700">
                      {selectedVisitNextActionReadyCount} ready / {selectedVisitNextActionItems.length} actions
                    </span>
                    <span className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-[#475569]">
                      {currentServiceRole ?? 'Preview'} role
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 bg-[#ffffff] p-4 md:grid-cols-2">
                  {selectedVisitNextActionItems.map((item) => {
                    const actionDisabled =
                      item.actionState !== 'available' ||
                      serverActionPending ||
                      (item.id === 'release-status' && !publishOwnerReportStatusAction);

                    return (
                      <article
                        key={item.id}
                        className={`rounded-[14px] border p-4 ${
                          item.tone === 'ready'
                            ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                            : item.tone === 'watch'
                              ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                              : item.tone === 'blocked'
                                ? 'border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10]'
                                : 'border-[#e2e8f0] bg-[#f8fafc]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                              {item.label}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">
                              {item.status}
                            </h3>
                          </div>
                          <span
                            className={`rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${
                              item.actionState === 'available'
                                ? 'border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] text-[#475569]'
                                : item.actionState === 'readonly'
                                  ? 'border border-[#e2e8f0] bg-[#f8fafc] text-[#475569]'
                                  : 'border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] text-amber-700'
                            }`}
                          >
                            {item.actionState === 'available'
                              ? 'Action ready'
                              : item.actionState === 'readonly'
                                ? 'Read-only'
                                : 'Blocked'}
                          </span>
                        </div>
                        <p className="mt-3 min-h-12 text-sm leading-6 text-[#334155]">
                          {item.detail}
                        </p>
                        <div
                          aria-label={`${item.label} action backing`}
                          className="mt-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                            Backing
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#0f172a]">
                            {item.backingLabel}
                          </p>
                          <p className="mt-1 break-words text-xs leading-5 text-[#64748b]">
                            {item.backingDetail}
                          </p>
                        </div>
                        {item.actionState === 'available' ? (
                          <button
                            type="button"
                            aria-describedby={SERVICE_ACTION_STATUS_ID}
                            disabled={actionDisabled}
                            onClick={() => runSelectedVisitNextAction(item)}
                            className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-3 text-sm font-semibold text-[#475569] hover:bg-[#06b6d4]/[0.18] disabled:cursor-not-allowed disabled:border-[#e2e8f0] disabled:bg-[#f8fafc] disabled:text-slate-500 ${DARK_FOCUS_RING}`}
                          >
                            {item.actionLabel}
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <p className="mt-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-xs font-semibold leading-5 text-[#334155]">
                            {item.actionLabel}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
            ) : null}

            {canReadTechnicianWorkDigest ? (
              <section
                aria-label="Technician selected visit work digest"
                className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Work digest
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                      Selected visit work queue.
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                      Read-only technician view for assigned open tasks, owner-visible
                      note readiness, and manual availability for{' '}
                      {selectedVisit?.serial ?? 'the selected visit'}.
                    </p>
                  </div>
                  <span className="w-fit rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#475569]">
                    {technicianWorkDigestReadyCount} ready / {technicianWorkDigestItems.length} signals
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {technicianWorkDigestItems.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-[14px] border p-4 ${
                        item.tone === 'ready'
                          ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                          : item.tone === 'watch'
                            ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                            : 'border-[#e2e8f0] bg-[#f8fafc]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                          {item.label}
                        </p>
                        <span
                          className={`rounded-[14px] border px-2.5 py-1 text-[11px] font-semibold ${
                            item.tone === 'ready'
                              ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10] text-emerald-700'
                              : item.tone === 'watch'
                                ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] text-amber-700'
                                : 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-[#0f172a]">{item.value}</p>
                      <p className="mt-2 text-xs leading-5 text-[#334155]">{item.detail}</p>
                    </article>
                  ))}
                </div>

                <div
                  aria-label="Technician parts and manual readiness handoff"
                  className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                        Parts + manuals
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-[#0f172a]">
                        Selected-visit readiness handoff.
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                        Connects saved parts drafts, staged review lines, linked manuals,
                        and manual extraction rows for{' '}
                        {selectedVisit?.serial ?? 'the selected visit'} without supplier
                        ordering controls.
                      </p>
                    </div>
                    <span className="w-fit rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                      {technicianPartsManualHandoffReadyCount} ready / {technicianPartsManualHandoffItems.length} signals
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    {technicianPartsManualHandoffItems.map((item) => (
                      <article
                        key={item.id}
                        className={`rounded-[14px] border bg-[#f8fafc] p-3 ${
                          item.tone === 'ready'
                            ? 'border-[#10b981]/[0.30]'
                            : item.tone === 'watch'
                              ? 'border-[#f59e0b]/[0.30]'
                              : 'border-[#e2e8f0]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                            {item.label}
                          </p>
                          <span
                            className={`rounded-[14px] px-2 py-0.5 text-[11px] font-semibold ${
                              item.tone === 'ready'
                                ? 'bg-[#10b981]/[0.10] text-emerald-700'
                                : item.tone === 'watch'
                                  ? 'bg-[#f59e0b]/[0.10] text-amber-700'
                                  : 'bg-[#f8fafc] text-[#475569]'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-[#0f172a]">
                          {item.value}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[#334155]">
                          {item.detail}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <p className="mt-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs leading-5 text-[#334155]">
                  This digest does not expose owner report release controls, manager audit
                  queues, supplier quotes, order approvals, or raw report bodies.
                </p>
              </section>
            ) : null}

            {canReadSelectedVisitHandoffStatus ? (
              <section
                aria-label="Selected visit handoff status"
                className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Handoff status
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                      Selected visit readiness at a glance.
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                      Read-only pulse across owner notes, open tasks, staged parts,
                      manual evidence, and owner-report release state for{' '}
                      {selectedVisit?.serial ?? 'the selected visit'}.
                    </p>
                  </div>
                  <span className="w-fit rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#475569]">
                    {serviceHandoffReadyCount} ready / {serviceHandoffStatusItems.length} signals
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  {serviceHandoffStatusItems.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-[14px] border p-4 ${
                        item.tone === 'ready'
                          ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                          : item.tone === 'blocked'
                            ? 'border-[#f43f5e]/[0.30] bg-[#f43f5e]/[0.10]'
                            : item.tone === 'watch'
                              ? 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                              : 'border-[#e2e8f0] bg-[#f8fafc]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                          {item.label}
                        </p>
                        <span
                          className={`rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${
                            item.tone === 'ready'
                              ? 'bg-[#10b981]/[0.10] text-emerald-700'
                              : item.tone === 'blocked'
                                ? 'bg-[#f43f5e]/[0.10] text-rose-700'
                              : item.tone === 'watch'
                                  ? 'bg-[#f59e0b]/[0.10] text-amber-700'
                                  : 'bg-[#f8fafc] text-[#475569]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-[#0f172a]">{item.value}</p>
                      <p className="mt-2 text-xs leading-5 text-[#334155]">{item.detail}</p>
                    </article>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-5 text-[#64748b]">
                  Read-only handoff band. Use the notes, todo, parts, manuals, and report
                  sections below to change source records.
                </p>
              </section>
            ) : null}

            <section
              aria-label="Closeout checklist and shared notes grid"
              className="grid gap-6 2xl:grid-cols-2"
            >
              <div
                aria-label="Closeout checklist panel"
                className="min-w-0 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-3 text-cyan-700">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Closeout checklist
                    </p>
                    <h2 className="text-xl font-semibold text-[#0f172a]">
                      Proof needed before a visit is complete.
                    </h2>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {checklist.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                    >
                      {item.done ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#334155]">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                aria-label="Shared notes panel"
                className="min-w-0 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-[14px] border border-blue-300/[0.26] bg-blue-300/[0.10] p-3 text-blue-100">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Shared notes
                    </p>
                    <h2 className="text-xl font-semibold text-[#0f172a]">
                      Write once, route to owner or company.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#334155]">
                      {persistedNotesStatus === 'loaded'
                        ? hasAuthenticatedNoteHistory
                          ? `${initialPersistedNotes.length} authenticated note${
                              initialPersistedNotes.length === 1 ? '' : 's'
                            } loaded before local draft notes.`
                          : 'Authenticated storage is connected; no shared notes exist for this organization yet.'
                        : persistedNotesStatus === 'database_not_configured'
                          ? 'Authenticated storage is not configured in this environment, so this view is using local draft notes.'
                          : persistedNotesStatus === 'database_error'
                            ? 'Authenticated storage could not be reached, so this view is using local draft notes.'
                            : persistedNotesStatus === 'service_profile_required'
                              ? 'A verified technician person scope is required before loading private shared note history.'
                              : 'Sign in with a verified Nexus service profile to load private shared note history.'}
                    </p>
                  </div>
                </div>

                <div
                  id={SERVICE_ACTION_STATUS_ID}
                  role="status"
                  aria-live="polite"
                  aria-label="Nexus service action status"
                  className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4"
                >
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                        {serverActionPending
                          ? 'Checking authenticated action'
                          : serverActionResult
                            ? ACTION_STATUS_LABELS[serverActionResult.status]
                            : 'Service action boundary'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#475569]">
                        {serverActionPending
                          ? 'Checking the authenticated Nexus service boundary before any private write or supplier action.'
                          : serverActionResult
                            ? serverActionResult.message
                            : 'Ready to check authenticated Nexus service action boundaries; private writes, owner releases, manual extraction, and supplier order gates stay separated.'}
                      </p>
                      {!serverActionPending && serverActionResult ? (
                        <p className="mt-2 text-xs font-semibold text-[#334155]">
                          Persisted: {serverActionResult.persisted ? 'yes' : 'no'}.
                          {serverActionResult.futureTable
                            ? ` Future table: ${serverActionResult.futureTable}.`
                            : ''}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div
                  aria-label="Shared note and task dispatch rail"
                  className="mt-5 grid gap-3 sm:grid-cols-3"
                >
                  {sharedDispatchItems.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-[14px] border p-4 ${
                        item.tone === 'ready'
                          ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10]'
                          : 'border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                            {item.label}
                          </p>
                          <h3 className="mt-2 text-base font-semibold text-[#0f172a]">
                            {item.status}
                          </h3>
                        </div>
                        <span
                          className={`shrink-0 rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${
                            item.tone === 'ready'
                              ? 'bg-[#10b981]/[0.10] text-emerald-700'
                              : 'bg-[#f59e0b]/[0.10] text-amber-700'
                          }`}
                        >
                          {item.id}
                        </span>
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5 sm:p-3">
                          <dt className="text-xs font-semibold text-[#64748b]">Notes</dt>
                          <dd className="mt-1 font-semibold text-[#0f172a] whitespace-nowrap">
                            {item.noteCount} note{item.noteCount === 1 ? '' : 's'}
                          </dd>
                        </div>
                        <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5 sm:p-3">
                          <dt className="text-xs font-semibold text-[#64748b]">
                            Open tasks
                          </dt>
                          <dd className="mt-1 font-semibold text-[#0f172a] whitespace-nowrap">
                            {item.openTaskCount} open task
                            {item.openTaskCount === 1 ? '' : 's'}
                          </dd>
                        </div>
                      </dl>
                      <p className="mt-3 text-xs leading-5 text-[#334155]">
                        {item.detail}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <div className="flex flex-col gap-3">
                    <select
                      value={noteTarget}
                      onChange={(event) =>
                        setNoteTarget(event.target.value as ServiceTaskScope)
                      }
                      aria-label="Note target"
                      aria-describedby={SERVICE_ACTION_STATUS_ID}
                      className={`min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a] ${DARK_FOCUS_RING}`}
                    >
                      <option value="Owner">Owner visible</option>
                      <option value="Technician">Technician only</option>
                      <option value="Company">Company note</option>
                    </select>
                    <input
                      value={noteText}
                      onChange={(event) => setNoteText(event.target.value)}
                      aria-label="Service note body"
                      aria-describedby={SERVICE_ACTION_STATUS_ID}
                      className={`min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a] placeholder:text-slate-500 ${DARK_FOCUS_RING}`}
                      placeholder="Add service note..."
                    />
                    <button
                      type="button"
                      aria-describedby={SERVICE_ACTION_STATUS_ID}
                      onClick={addNote}
                      className={`inline-flex min-h-11 w-full items-center justify-center rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-4 text-sm font-semibold text-[#475569] hover:bg-[#06b6d4]/[0.18] ${DARK_FOCUS_RING}`}
                    >
                      Add note
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {visibleNotes.length === 0 ? (
                    <div className="rounded-[14px] border border-dashed border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm leading-6 text-[#334155]">
                      No shared notes for this service workspace yet.
                    </div>
                  ) : null}
                  {visibleNotes.map((note) => (
                    <article
                      key={note.id}
                      className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">{note.author}</p>
                          <p className="mt-1 text-xs text-[#64748b]">{note.time}</p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {note.source === 'authenticated' ? (
                            <span className="rounded-[14px] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              Authenticated
                            </span>
                          ) : note.source === 'local' ? (
                            <span className="rounded-[14px] bg-[#f59e0b]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              Local draft
                            </span>
                          ) : null}
                          <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                            {note.target}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#334155]">{note.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section
              aria-label="Report release gate"
              className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-[14px] bg-[#06b6d4]/[0.10] p-3 text-cyan-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Report release gate
                    </p>
                    <h2 className="text-xl font-semibold text-[#0f172a]">
                      Owner report review
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#334155]">
                      {ownerReportStorageMessage}
                    </p>
                  </div>
                </div>
                <span className="inline-flex w-fit rounded-[14px] bg-[#06b6d4]/[0.10] px-3 py-1 text-xs font-semibold text-cyan-700">
                  {canPublishOwnerReport ? 'Private review' : 'Read-only reports'}
                </span>
              </div>

              {canAssignOwnerDeviceScope ? (
                <div
                  aria-label="Owner device access"
                  className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-[14px] bg-[#f8fafc] p-2.5 text-cyan-700">
                        <UserRoundCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                          Owner device access
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-[#0f172a]">
                          Assign published report scope
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                          {ownerDeviceScopeStorageMessage} Published owner reports become visible
                          only for these device IDs; draft reports and private service data stay
                          manager-only.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex w-fit rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                      Private profile write
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,0.75fr)_minmax(0,1.25fr)]">
                    <p
                      id={SERVICE_OWNER_DEVICE_SCOPE_STATUS_ID}
                      className="rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#f8fafc] px-3 py-2 text-xs font-semibold leading-5 text-[#475569] lg:col-span-2"
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                      aria-label={SERVICE_OWNER_DEVICE_SCOPE_STATUS_LABEL}
                    >
                      {ownerDeviceScopeStatusMessage}
                    </p>
                    <label className="block text-sm font-semibold text-[#0f172a]">
                      Owner profile
                      {initialOwnerDeviceScopes.length > 0 ? (
                        <select
                          value={ownerScopeProfileId}
                          aria-describedby={SERVICE_OWNER_DEVICE_SCOPE_STATUS_ID}
                          onChange={(event) => {
                            const nextProfileId = event.target.value;
                            const nextScope = initialOwnerDeviceScopes.find(
                              (scope) => scope.id === nextProfileId
                            );
                            setOwnerScopeProfileId(nextProfileId);
                            setOwnerDeviceScopeText(
                              nextScope?.ownerDeviceIds.length
                                ? nextScope.ownerDeviceIds.join('\n')
                                : selectedVisit?.serial ?? ''
                            );
                          }}
                          className={`mt-2 min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a] ${FOCUS_RING}`}
                        >
                          {initialOwnerDeviceScopes.map((scope) => (
                            <option key={scope.id} value={scope.id}>
                              {scope.ownerLabel} ({scope.ownerDeviceIds.length} devices)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={ownerScopeProfileId}
                          aria-describedby={SERVICE_OWNER_DEVICE_SCOPE_STATUS_ID}
                          onChange={(event) => setOwnerScopeProfileId(event.target.value)}
                          placeholder="owner-profile-id"
                          className={`mt-2 min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a] ${FOCUS_RING}`}
                        />
                      )}
                      {selectedOwnerDeviceScope ? (
                        <span className="mt-2 block text-xs font-normal leading-5 text-[#64748b]">
                          {selectedOwnerDeviceScope.updatedAt}
                        </span>
                      ) : null}
                    </label>

                    <div>
                      <fieldset>
                        <legend className="text-sm font-semibold text-[#0f172a]">
                          Device IDs
                        </legend>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {NEXUS_SERVICE_VISITS.map((visit) => {
                            const isSelected = ownerDeviceScopeIds.includes(visit.serial);

                            return (
                              <button
                                key={visit.id}
                                type="button"
                                role="checkbox"
                                aria-checked={isSelected}
                                aria-describedby={SERVICE_OWNER_DEVICE_SCOPE_STATUS_ID}
                                onClick={() => toggleOwnerDeviceScopeId(visit.serial)}
                                className={`min-h-11 rounded-[14px] border px-3 text-xs font-semibold transition ${FOCUS_RING} ${
                                  isSelected
                                    ? 'border-[#06b6d4]/[0.40] bg-[#06b6d4]/[0.10] text-cyan-700'
                                    : 'border-[#e2e8f0] bg-[#f8fafc] text-[#334155] hover:border-[#06b6d4]/[0.40]'
                                }`}
                              >
                                {visit.serial}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>

                      <label className="mt-3 block text-xs font-semibold text-[#64748b]">
                        Normalized scope list
                        <textarea
                          value={ownerDeviceScopeText}
                          aria-describedby={SERVICE_OWNER_DEVICE_SCOPE_STATUS_ID}
                          onChange={(event) => setOwnerDeviceScopeText(event.target.value)}
                          rows={3}
                          className={`mt-2 w-full resize-none rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#0f172a] ${FOCUS_RING}`}
                          placeholder="HY-PR-0900-014"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-[#64748b]">
                      {ownerDeviceScopeIds.length} device ID
                      {ownerDeviceScopeIds.length === 1 ? '' : 's'} will be written to the
                      owner profile. Owner email, notes, and report body are not submitted.
                    </p>
                    <button
                      type="button"
                      aria-describedby={`${SERVICE_OWNER_DEVICE_SCOPE_STATUS_ID} ${SERVICE_ACTION_STATUS_ID}`}
                      disabled={
                        serverActionPending ||
                        !assignOwnerDeviceScopeAction ||
                        !ownerScopeProfileId.trim() ||
                        ownerDeviceScopeIds.length === 0
                      }
                      onClick={saveOwnerDeviceScope}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-4 text-sm font-semibold text-[#475569] hover:bg-[#06b6d4]/[0.18] disabled:cursor-not-allowed disabled:border-[#e2e8f0] disabled:bg-[#f8fafc] disabled:text-slate-500 ${DARK_FOCUS_RING}`}
                    >
                      Save access scope
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {canReadOwnerPublishedReportDigest ? (
                <>
                  <div
                    aria-label="Owner service handoff center"
                    className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                          Owner handoff center
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-[#0f172a]">
                          Published service closeouts and owner-safe references.
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                          This read-only owner area shows published report summaries, owner-visible
                          notes, and approved manual references only. Technician notes, supplier
                          quotes, and manager audit controls stay hidden.
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-[14px] bg-[#06b6d4]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                        Published reports only
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        {
                          label: 'Published reports',
                          value: ownerPublishedReportDigestRows.length,
                        },
                        {
                          label: 'Owner-safe notes',
                          value: ownerVisibleNotes.length,
                        },
                        {
                          label: 'Manual references',
                          value: ownerPublishedReportManualReferenceCount,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3"
                        >
                          <dt className="text-xs font-semibold text-[#64748b]">
                            {item.label}
                          </dt>
                          <dd className="mt-1 text-2xl font-semibold text-[#0f172a]">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {ownerPublishedReportDigestRows.length > 0 ? (
                      <div
                        aria-label="Owner published report handoff rows"
                        className="mt-4 grid gap-3"
                      >
                        {ownerPublishedReportDigestRows.map((row) => (
                          <article
                            key={`owner-handoff-${row.id}`}
                            className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-[#0f172a]">
                                  {row.reportNumber}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-[#64748b]">
                                  {row.deviceId} - {row.publishedAt}
                                </p>
                              </div>
                              <span className="w-fit rounded-[14px] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                {row.finalStatus}
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-[#334155]">
                              {row.summary}
                            </p>
                            <div className="mt-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3">
                              <p className="text-xs font-semibold text-[#64748b]">
                                Owner-safe manual references
                              </p>
                              {row.manualReferenceLabels.length > 0 ? (
                                <ul className="mt-2 space-y-1 text-sm leading-5 text-[#334155]">
                                  {row.manualReferenceLabels.map((label) => (
                                    <li key={`${row.id}-${label}`}>{label}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="mt-2 text-sm leading-5 text-[#64748b]">
                                  No owner-safe manual reference is attached to this published
                                  report.
                                </p>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-[14px] border border-dashed border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-3 text-sm leading-6 text-[#334155]">
                        No published service closeout is available for this owner profile yet.
                      </p>
                    )}
                  </div>

                  <div
                    aria-label="Owner published handoff polish"
                    className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                          Published owner handoff summary
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-[#0f172a]">
                          What is visible to you now.
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                          This summary repeats only published owner closeout counts, approved manual
                          labels, and the private workflow boundary for parts and supplier review.
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                        No owner actions
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {ownerPublishedHandoffPolishItems.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0f172a]">{item.label}</p>
                              <p className="mt-1 text-2xl font-semibold text-[#0f172a]">
                                {item.value}
                              </p>
                            </div>
                            <span
                              className={`w-fit rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${
                                item.tone === 'ready'
                                  ? 'bg-[#10b981]/[0.10] text-emerald-700'
                                  : item.tone === 'watch'
                                    ? 'bg-[#f59e0b]/[0.10] text-amber-700'
                                    : 'bg-[#f8fafc] text-[#475569]'
                              }`}
                            >
                              {item.tone === 'ready'
                                ? 'Visible'
                                : item.tone === 'watch'
                                  ? 'Pending'
                                  : 'Private'}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-[#334155]">{item.detail}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div
                    aria-label="Owner service release timeline"
                    className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                          Owner release timeline
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-[#0f172a]">
                          Read-only release order for published service handoff.
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                          Published closeout summaries, owner-safe note availability, approved
                          manual references, and parts review status are shown without raw service
                          notes or supplier workflow details.
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                        Read-only owner handoff
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {ownerServiceTimelineItems.map((item) => (
                          <article
                            key={item.id}
                            className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                          >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-[#0f172a]">
                                  {item.label}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-[#64748b]">
                                  {item.timeLabel}
                                </p>
                            </div>
                            <span
                              className={`w-fit rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${
                                item.tone === 'ready'
                                  ? 'bg-[#10b981]/[0.10] text-emerald-700'
                                  : item.tone === 'watch'
                                    ? 'bg-[#f59e0b]/[0.10] text-amber-700'
                                    : 'bg-[#f8fafc] text-[#475569]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-[#334155]">
                            {item.detail}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div
                    aria-label="Owner published report digest"
                    className="mt-5 rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          Published report digest
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-[#0f172a]">
                          Owner-safe report status only.
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                          This owner view lists each published report with its release status,
                          owner-safe note count, and owner-safe manual reference count.
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        Read-only owner view
                      </span>
                    </div>

                    {ownerPublishedReportDigestRows.length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {ownerPublishedReportDigestRows.map((row) => (
                        <article
                          key={`owner-digest-${row.id}`}
                          className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <p className="text-sm font-semibold text-[#0f172a]">
                              {row.reportNumber}
                            </p>
                            <span className="rounded-[14px] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              {row.finalStatus}
                            </span>
                          </div>
                          <dl className="mt-3 grid gap-2 text-sm text-[#334155] sm:grid-cols-2">
                            <div>
                              <dt className="text-xs text-[#64748b]">Owner-safe notes</dt>
                              <dd className="font-semibold text-[#0f172a]">
                                {row.ownerNoteCount}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-[#64748b]">Manual references</dt>
                              <dd className="font-semibold text-[#0f172a]">
                                {row.manualReferenceCount}
                              </dd>
                            </div>
                          </dl>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-[14px] border border-dashed border-[#10b981]/[0.30] bg-[#f8fafc] p-3 text-sm leading-6 text-[#334155]">
                      No published owner reports are available for this owner profile yet.
                    </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                    Readiness rail
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      ...checklist,
                      {
                        title: 'Manager review required',
                        detail:
                          'Private record only; no PDF, email, or owner portal exposure is claimed.',
                        done: true,
                      },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3">
                        {item.done ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-[#334155]">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  aria-label="Owner report preview"
                  className="rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                        Owner-safe summary
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">
                        {selectedVisit?.serial ?? 'Sample service visit'}
                      </h3>
                    </div>
                    <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                      Owner-ready
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#334155]">
                    {ownerReportSummary}
                  </p>

                  <div className="mt-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">
                          Owner-safe references
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#64748b]">
                          {ownerReportManualReferences.length} shown to owner / {managerOnlyManualCount} withheld
                        </p>
                      </div>
                      <span className="rounded-[14px] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        Versioned
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-[#334155]">
                      {ownerReportManualReferences.map((reference) => (
                        <li key={reference.documentId} className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                          <span>
                            <span className="font-semibold text-[#0f172a]">
                              {reference.ownerReportLabel}
                            </span>{' - '}
                            {reference.documentVersion} - matched to{' '}
                            {selectedVisit?.serial ?? reference.targetId}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {managerOnlyManualCount > 0 ? (
                      <p className="mt-3 text-sm leading-6 text-[#64748b]">
                        {managerOnlyManualCount} manager-only commercial reference
                        {managerOnlyManualCount === 1 ? '' : 's'} withheld from owner reports.
                      </p>
                    ) : null}
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-[14px] bg-[#f8fafc] p-3">
                      <dt className="text-xs text-[#64748b]">Report ID</dt>
                      <dd className="mt-1 font-semibold text-[#0f172a]">
                        {selectedVisit?.id ?? 'sample'}-owner-closeout
                      </dd>
                    </div>
                    <div className="rounded-[14px] bg-[#f8fafc] p-3">
                      <dt className="text-xs text-[#64748b]">Owner notes</dt>
                      <dd className="mt-1 font-semibold text-[#0f172a]">
                        {ownerVisibleNotes.length}
                      </dd>
                    </div>
                    <div className="rounded-[14px] bg-[#f8fafc] p-3">
                      <dt className="text-xs text-[#64748b]">Checklist</dt>
                      <dd className="mt-1 font-semibold text-[#0f172a]">
                        {checklist.filter((item) => item.done).length}/{checklist.length}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                    <p className="text-sm font-semibold text-[#0f172a]">
                      Redacted from this record
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#334155]">
                      Technician-only notes, company comments, raw findings, signatures, supplier
                      quotes, and photo references stay out of the owner report save action.
                    </p>
                  </div>

                  {canPublishOwnerReport ? (
                    <button
                      type="button"
                      aria-describedby={SERVICE_ACTION_STATUS_ID}
                      disabled={serverActionPending}
                      onClick={saveOwnerReport}
                      className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-4 text-sm font-semibold text-[#475569] hover:bg-[#06b6d4]/[0.18] disabled:cursor-wait disabled:border-[#e2e8f0] disabled:bg-[#f8fafc] disabled:text-slate-500 ${DARK_FOCUS_RING}`}
                    >
                      Save owner-ready draft
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="mt-4 rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] p-4">
                      <p className="text-sm font-semibold text-amber-700">
                        Manager publish required
                      </p>
                      <p className="mt-2 text-sm leading-6 text-amber-700">
                        {ownerReportPublishBoundaryMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-[#e2e8f0] pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Authenticated owner reports
                </p>
                {hasAuthenticatedOwnerReportHistory ? (
                  <div className="mt-3 grid gap-3">
                    {initialPersistedOwnerReports.map((report) => (
                      <article
                        key={report.id}
                        className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-[#0f172a]">
                              {report.reportNumber}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-[#64748b]">
                              {report.deviceId} - {report.publishedAt}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-[14px] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              Authenticated
                            </span>
                            {canReleaseOwnerReport &&
                            report.finalStatus === 'Owner-ready' ? (
                              <button
                                type="button"
                                aria-label={`Release owner report ${report.reportNumber} to owner`}
                                aria-describedby={`${report.id}-release-helper ${SERVICE_ACTION_STATUS_ID}`}
                                disabled={serverActionPending || !publishOwnerReportStatusAction}
                                onClick={() => releaseOwnerReport(report)}
                                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#10b981] px-3 text-xs font-semibold text-emerald-950 hover:bg-[#10b981]/[0.18] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-[#64748b] ${FOCUS_RING}`}
                              >
                                Release to owner
                                <ShieldCheck className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#334155]">
                          {report.summary}
                        </p>
                        {canReleaseOwnerReport &&
                        report.finalStatus === 'Owner-ready' ? (
                          <p
                            id={`${report.id}-release-helper`}
                            className="mt-3 rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] p-3 text-xs leading-5 text-emerald-700"
                          >
                            Moves this owner-ready report to Published. Owners can only
                            see it when their profile includes this device ID.
                          </p>
                        ) : null}
                        <dl className="mt-3 grid gap-2 text-sm text-[#334155] sm:grid-cols-3">
                          <div>
                            <dt className="text-xs text-[#64748b]">Status</dt>
                            <dd className="font-semibold text-[#0f172a]">
                              {report.finalStatus}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-[#64748b]">Checklist items</dt>
                            <dd className="font-semibold text-[#0f172a]">
                              {report.checklistCount}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-[#64748b]">Saved by</dt>
                            <dd className="font-semibold text-[#0f172a]">
                              {report.createdBy}
                            </dd>
                          </div>
                        </dl>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-[14px] border border-dashed border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm leading-6 text-[#334155]">
                    No authenticated owner report history is loaded for this service profile.
                  </div>
                )}

                {canReleaseOwnerReport ? (
                  <div
                    aria-label="Owner report release audit trail"
                    className="mt-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">
                          Release audit trail
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#64748b]">
                          Read-only status trail for manager review. Report bodies,
                          notes, and raw service findings stay out of this audit view.
                        </p>
                      </div>
                      <span className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                        {hasAuthenticatedOwnerReportHistory
                          ? ownerReportReleaseAuditSummary
                          : 'No authenticated rows'}
                      </span>
                    </div>

                    {hasAuthenticatedOwnerReportHistory ? (
                      <div className="mt-3 grid gap-2">
                        {ownerReportReleaseAuditRows.map((row) => (
                          <article
                            key={`release-audit-${row.id}`}
                            className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xs font-semibold text-[#0f172a]">
                                  {row.reportNumber}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#64748b]">
                                  {row.reportId} - {row.deviceId}
                                </p>
                              </div>
                              <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                                {row.visibilityGate}
                              </span>
                            </div>
                            <dl className="mt-3 grid gap-2 text-xs text-[#334155] sm:grid-cols-4">
                              <div>
                                <dt className="text-[#64748b]">Status</dt>
                                <dd className="font-semibold text-[#0f172a]">
                                  {row.finalStatus}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[#64748b]">Saved</dt>
                                <dd className="font-semibold text-[#0f172a]">
                                  {row.savedAt}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[#64748b]">Reviewed by</dt>
                                <dd className="font-semibold text-[#0f172a]">
                                  {row.createdBy}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[#64748b]">Evidence</dt>
                                <dd className="font-semibold text-[#0f172a]">
                                  {row.checklistCount} checks / {row.manualReferenceCount} refs
                                </dd>
                              </div>
                            </dl>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-[14px] border border-dashed border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs leading-5 text-[#64748b]">
                        Release audit rows appear after authenticated owner report history loads.
                      </p>
                    )}
                  </div>
                ) : null}

                {canReleaseOwnerReport ? (
                  <div
                    aria-label="Owner report manual evidence gaps"
                    className="mt-4 rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">
                          Manual evidence gaps
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#334155]">
                          Read-only check for owner reports missing linked owner-safe
                          manual references. Report text, raw findings, and manual
                          payloads stay out of this summary.
                        </p>
                      </div>
                      <span className="rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        {ownerReportManualEvidenceSummary}
                      </span>
                    </div>

                    {ownerReportManualEvidenceRows.length > 0 ? (
                      <div className="mt-3 grid gap-2">
                        {ownerReportManualEvidenceRows.map((row) => (
                          <article
                            key={`manual-evidence-${row.id}`}
                            className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xs font-semibold text-[#0f172a]">
                                  {row.reportNumber}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#64748b]">
                                  {row.deviceId} - {row.finalStatus} - {row.savedAt}
                                </p>
                              </div>
                              <span
                                className={`rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${
                                  row.hasGap
                                    ? 'bg-[#f59e0b]/[0.10] text-amber-700'
                                    : 'bg-[#10b981]/[0.10] text-emerald-700'
                                }`}
                              >
                                {row.status}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-[#334155]">
                              {row.detail}
                            </p>
                            <dl className="mt-3 grid gap-2 text-xs text-[#334155] sm:grid-cols-3">
                              <div>
                                <dt className="text-[#64748b]">Report refs</dt>
                                <dd className="font-semibold text-[#0f172a]">
                                  {row.manualReferenceCount} refs
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[#64748b]">Linked manuals</dt>
                                <dd className="font-semibold text-[#0f172a]">
                                  {row.linkedOwnerSafeCount} owner-safe
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[#64748b]">Extraction drafts</dt>
                                <dd className="font-semibold text-[#0f172a]">
                                  {row.ownerSafeExtractionCount} owner-safe
                                </dd>
                              </div>
                            </dl>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-[14px] border border-dashed border-[#f59e0b]/[0.30] bg-[#f8fafc] p-3 text-xs leading-5 text-[#64748b]">
                        Manual evidence gap rows appear after authenticated owner report history loads.
                      </p>
                    )}
                  </div>
                ) : null}
                  </div>
                </>
              )}
            </section>

            {canReadServiceActivityTimeline ? (
              <section
                aria-label="Service visit activity timeline"
                data-testid="service-visit-activity-timeline"
                className="rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-5 text-[#0f172a]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-5 w-5 text-cyan-700" aria-hidden="true" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                        Service activity timeline
                      </p>
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-[#0f172a]">
                      Read-only manager activity across service records.
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#334155]">
                      Authenticated service events across notes, tasks, parts drafts,
                      manuals, extraction reviews, and owner reports. Raw note bodies
                      and service findings stay in their owning records.
                    </p>
                  </div>
                  <span className="w-fit rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#475569]">
                    {serviceActivityTimelineSummary}
                  </span>
                </div>

                {serviceActivityTimelineItems.length > 0 ? (
                  <ol aria-label="Selected visit activity events" className="mt-5 grid gap-3">
                    {serviceActivityTimelineItems.map((item) => (
                      <li
                        key={item.id}
                        aria-label={`${item.kind} for ${item.scope}`}
                        data-testid="service-activity-row"
                        data-activity-kind={item.kind.toLowerCase().replace(/\s+/g, '-')}
                        className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                                {item.kind}
                              </span>
                              <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                                {item.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-[#0f172a]">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[#334155]">
                              {item.detail}
                            </p>
                          </div>
                          <dl className="grid shrink-0 gap-2 text-xs text-[#334155] sm:min-w-64 sm:grid-cols-2">
                            <div>
                              <dt className="text-[#64748b]">Time</dt>
                              <dd className="font-semibold text-[#0f172a]">
                                {item.timeLabel}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[#64748b]">Actor</dt>
                              <dd className="font-semibold text-[#0f172a]">{item.actor}</dd>
                            </div>
                            <div>
                              <dt className="text-[#64748b]">Scope</dt>
                              <dd className="font-semibold text-[#0f172a]">{item.scope}</dd>
                            </div>
                            <div>
                              <dt className="text-[#64748b]">Mode</dt>
                              <dd className="font-semibold text-[#0f172a]">Read-only</dd>
                            </div>
                          </dl>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-5 rounded-[14px] border border-dashed border-[#f59e0b]/[0.30] bg-[#f8fafc] p-4 text-sm leading-6 text-[#334155]">
                    No authenticated activity is loaded for this service profile yet.
                  </p>
                )}

                <p className="mt-4 text-xs leading-5 text-[#64748b]">
                  Read-only chronology. Use each owning board to create or change records.
                </p>
              </section>
            ) : null}

            <section
              aria-label="Company todo board"
              data-testid="company-todo-board"
              className="rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-5 text-[#0f172a]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Company todo board
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                    Scope tasks to the whole company or a specific person.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#334155]">
                    {persistedTodosStatus === 'loaded'
                      ? hasAuthenticatedTodoHistory
                        ? `${initialPersistedTodos.length} authenticated task${
                            initialPersistedTodos.length === 1 ? '' : 's'
                          } loaded before local sample tasks.`
                        : 'Authenticated task storage is connected; no saved service tasks exist for this organization yet.'
                      : persistedTodosStatus === 'database_not_configured'
                        ? 'Authenticated task storage is not configured in this environment, so this board is using local sample tasks.'
                        : persistedTodosStatus === 'database_error'
                          ? 'Authenticated task storage could not be reached, so this board is using local sample tasks.'
                          : persistedTodosStatus === 'service_profile_required'
                            ? 'This technician profile needs a person assignment before private task history can be loaded.'
                            : 'Sign in with a verified Nexus service profile to load private task history.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TASK_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={taskFilter === filter}
                      aria-describedby={SERVICE_TODO_FILTER_STATUS_ID}
                      onClick={() => {
                        setTaskFilter(filter);
                        trackServiceAction('task_filter_changed', { filter });
                      }}
                      className={`min-h-11 rounded-[14px] px-3 text-sm font-semibold transition ${DARK_FOCUS_RING} ${
                        taskFilter === filter
                          ? 'border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] text-[#475569]'
                          : 'border border-[#e2e8f0] bg-[#f8fafc] text-[#334155] hover:bg-[#f8fafc]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <p
                id={SERVICE_TODO_FILTER_STATUS_ID}
                className="mt-4 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-3 py-2 text-xs font-semibold leading-5 text-[#475569]"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={SERVICE_TODO_FILTER_STATUS_LABEL}
              >
                {serviceTodoFilterStatusMessage}
              </p>

              <div className="mt-5 overflow-x-auto rounded-[14px] border border-[#e2e8f0]">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-[#f8fafc] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#334155]">
                    <tr>
                      <th className="px-4 py-3">Task</th>
                      <th className="px-4 py-3">Scope</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Due</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {visibleTodos.map((todo) => (
                      <tr key={todo.id} className="bg-[#f8fafc] hover:bg-[#f8fafc]">
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            aria-pressed={todo.done}
                            aria-describedby={SERVICE_ACTION_STATUS_ID}
                            disabled={todo.source === 'authenticated'}
                            onClick={() => toggleTodo(todo.id)}
                            className={`flex items-start gap-3 text-left disabled:cursor-not-allowed disabled:opacity-75 ${DARK_FOCUS_RING}`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[8px] border ${
                                todo.done
                                  ? 'border-[#10b981]/[0.30] bg-[#10b981]/[0.10] text-emerald-700'
                                  : 'border-[#e2e8f0] bg-[#f8fafc]'
                              }`}
                              aria-hidden="true"
                            >
                              {todo.done ? <CheckCircle2 className="h-4 w-4" /> : null}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-[#0f172a]">
                                {todo.title}
                              </span>
                              <span
                                className={`mt-1 inline-flex rounded-[14px] px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_CLASSES[todo.priority]}`}
                              >
                                {todo.priority}
                              </span>
                              {todo.source === 'authenticated' ? (
                                <span className="ml-2 mt-1 inline-flex rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-2 py-0.5 text-[11px] font-semibold text-cyan-700">
                                  Authenticated
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#334155]">{todo.scope}</td>
                        <td className="px-4 py-4 text-sm text-[#334155]">{todo.owner}</td>
                        <td className="px-4 py-4 text-sm text-[#334155]">{todo.due}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-xs font-semibold text-[#475569]">
                            {todo.done ? 'Done' : 'Open'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {canUsePartsDraftWorkspace ? (
          <aside className="space-y-6">
            <section className="sticky top-20 rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 text-[#0f172a] shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Replacement parts
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">Quick order draft</h2>
                </div>
                <PackageCheck className="h-6 w-6 text-cyan-700" />
              </div>

              <div
                aria-label="Replacement parts role boundary"
                className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4 text-xs leading-5 text-[#475569]"
              >
                {partsDraftAuthorityMessage}
              </div>
              <p
                id={SERVICE_PARTS_DRAFT_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={SERVICE_PARTS_DRAFT_STATUS_LABEL}
                className="sr-only"
              >
                {partsDraftActionStatus}
              </p>

              <div className="mt-5 space-y-3">
                {NEXUS_SERVICE_PART_LINES.map((part) => {
                  const quantity = draft[part.id] ?? 0;

                  return (
                    <article
                      key={part.id}
                      className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">{part.name}</p>
                          <p className="mt-1 text-xs text-[#334155]">
                            {part.sku} - {part.modelScope}
                          </p>
                        </div>
                        <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                          {part.availability}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-[#334155]">{part.reason}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-cyan-700">
                          {formatPln(part.unitPrice)}
                        </span>
                        <div className="inline-flex items-center rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc]">
                          <button
                            type="button"
                            aria-describedby={SERVICE_PARTS_DRAFT_STATUS_ID}
                            onClick={() => updateDraftQuantity(part.id, quantity - 1)}
                            className={`flex h-10 w-10 items-center justify-center rounded-l-[14px] text-[#334155] hover:bg-[#f8fafc] ${DARK_FOCUS_RING}`}
                            aria-label={`Decrease ${part.name}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-10 text-center text-sm font-semibold text-[#0f172a]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            aria-describedby={SERVICE_PARTS_DRAFT_STATUS_ID}
                            onClick={() => updateDraftQuantity(part.id, quantity + 1)}
                            className={`flex h-10 w-10 items-center justify-center rounded-r-[14px] text-[#334155] hover:bg-[#f8fafc] ${DARK_FOCUS_RING}`}
                            aria-label={`Increase ${part.name}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Draft value
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0f172a]">{formatPln(totalDraftValue)}</p>
                <p className="mt-1 text-xs leading-5 text-[#475569]">
                  Preview value only. Final pricing, availability, and fulfillment need manager
                  review.
                </p>
              </div>

              <div
                aria-label="Selected visit parts draft manager review packet"
                className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      Manager review packet
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#0f172a]">
                      Review-only parts draft for {selectedVisit?.serial ?? 'sample visit'}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#334155]">
                      {draftLines.length} staged line{draftLines.length === 1 ? '' : 's'} /{' '}
                      {stagedDraftPackCount} pack{stagedDraftPackCount === 1 ? '' : 's'} /{' '}
                      {formatPln(totalDraftValue)}. {selectedVisitPartsDraftRows.length}{' '}
                      authenticated selected-visit draft
                      {selectedVisitPartsDraftRows.length === 1 ? '' : 's'} linked.
                    </p>
                  </div>
                  <span className="rounded-[14px] bg-amber-200/[0.10] px-2.5 py-1 text-[11px] font-semibold text-amber-50">
                    Review
                  </span>
                </div>
                <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Packet text
                </label>
                <textarea
                  readOnly
                  aria-label="Selected visit parts draft manager review text"
                  aria-describedby={SERVICE_PARTS_DRAFT_STATUS_ID}
                  value={selectedVisitPartsDraftExportText}
                  className={`mt-2 min-h-48 w-full resize-none rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs leading-5 text-[#475569] ${DARK_FOCUS_RING}`}
                />
                <p className="mt-3 text-xs leading-5 text-[#334155]">
                  {selectedVisitPartsDraftExportLineCount} packet lines ready. Supplier
                  ordering remains disabled until manager/admin approval; no quote, purchase
                  order, fulfillment, or owner-facing approval is created.
                </p>
                <button
                  type="button"
                  aria-describedby={SERVICE_PARTS_DRAFT_STATUS_ID}
                  onClick={copySelectedVisitPartsDraftExport}
                  className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] px-4 text-sm font-semibold text-[#0f172a] hover:bg-[#f8fafc] ${DARK_FOCUS_RING}`}
                >
                  Copy review packet
                  <ClipboardCheck className="h-4 w-4" />
                </button>
                {partsDraftExportStatus === 'copied' ? (
                  <p className="mt-3 text-xs font-semibold text-emerald-700">
                    Manager review packet copied.
                  </p>
                ) : partsDraftExportStatus === 'unavailable' ? (
                  <p className="mt-3 text-xs font-semibold text-amber-800">
                    Clipboard unavailable. Select the export text manually.
                  </p>
                ) : null}
              </div>

              <div
                aria-label="Selected visit parts manual evidence bridge"
                className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      Manual/catalogue evidence
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#0f172a]">
                      Parts approval evidence before supplier workflow.
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#334155]">
                      Each staged line stays tied to selected-device catalogue facts and
                      manual readiness before any supplier quote, purchase order, or
                      owner-facing approval.
                    </p>
                  </div>
                  <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                    Evidence
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedVisitPartsManualEvidenceItems.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">
                            {item.sku} x {item.quantity} - {item.label}
                          </p>
                          <p className="mt-1 text-xs text-[#334155]">
                            {item.status} / {item.manualStatus}
                          </p>
                        </div>
                        <span
                          className={`w-fit rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${
                            item.tone === 'ready'
                              ? 'bg-[#10b981]/[0.10] text-emerald-700'
                              : 'bg-amber-200/[0.10] text-amber-50'
                          }`}
                        >
                          {item.tone === 'ready' ? 'Linked' : 'Review before order'}
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-3 text-xs leading-5 text-[#334155]">
                        <div>
                          <dt className="font-semibold text-[#64748b]">Catalogue</dt>
                          <dd>{item.catalogueDetail}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-[#64748b]">Manual readiness</dt>
                          <dd>{item.manualDetail}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-[#64748b]">Approval boundary</dt>
                          <dd>{item.approvalDetail}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>

              <div
                aria-label="Selected visit persisted parts manual review readback"
                className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      Persisted read-back
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#0f172a]">
                      Parts/manual review state for {selectedVisit?.serial ?? 'sample visit'}.
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#334155]">
                      Reconciles saved parts drafts, selected-visit manual links, manual
                      extraction rows, and owner-safe manual references before any supplier
                      or owner-release action.
                    </p>
                  </div>
                  <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                    {selectedVisitPersistedPartsManualReadbackReadyCount} /{' '}
                    {selectedVisitPersistedPartsManualReadbackItems.length} ready
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {selectedVisitPersistedPartsManualReadbackItems.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-[14px] border bg-[#f8fafc] p-3 ${
                        item.tone === 'ready'
                          ? 'border-[#10b981]/[0.30]'
                          : item.tone === 'blocked'
                            ? 'border-[#f43f5e]/[0.30]'
                            : item.tone === 'watch'
                              ? 'border-[#f59e0b]/[0.30]'
                              : 'border-[#e2e8f0]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                          {item.label}
                        </p>
                        <span
                          className={`rounded-[14px] px-2 py-0.5 text-[11px] font-semibold ${
                            item.tone === 'ready'
                              ? 'bg-[#10b981]/[0.10] text-emerald-700'
                              : item.tone === 'blocked'
                                ? 'bg-[#f43f5e]/[0.10] text-rose-700'
                                : item.tone === 'watch'
                                  ? 'bg-[#f59e0b]/[0.10] text-amber-700'
                                  : 'bg-[#f8fafc] text-[#475569]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-[#0f172a]">{item.value}</p>
                      <p className="mt-2 text-xs leading-5 text-[#334155]">{item.detail}</p>
                    </article>
                  ))}
                </div>

                <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Read-back packet
                </label>
                <textarea
                  readOnly
                  aria-label="Selected visit persisted parts manual readback text"
                  aria-describedby={SERVICE_PARTS_DRAFT_STATUS_ID}
                  value={selectedVisitPersistedPartsManualReadbackText}
                  className={`mt-2 min-h-56 w-full resize-none rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs leading-5 text-[#475569] ${DARK_FOCUS_RING}`}
                />
                <p className="mt-3 text-xs leading-5 text-[#334155]">
                  {selectedVisitPersistedPartsManualReadbackLineCount} read-back lines. This
                  packet is read-only and creates no supplier quote, purchase order, owner
                  report save, owner-send action, or report status transition.
                </p>
                <button
                  type="button"
                  aria-describedby={SERVICE_PARTS_DRAFT_STATUS_ID}
                  onClick={copySelectedVisitPersistedPartsManualReadback}
                  className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] px-4 text-sm font-semibold text-[#0f172a] hover:bg-[#f8fafc] ${DARK_FOCUS_RING}`}
                >
                  Copy persisted read-back
                  <ClipboardCheck className="h-4 w-4" />
                </button>
                {partsManualReadbackCopyStatus === 'copied' ? (
                  <p className="mt-3 text-xs font-semibold text-emerald-700">
                    Persisted read-back copied.
                  </p>
                ) : partsManualReadbackCopyStatus === 'unavailable' ? (
                  <p className="mt-3 text-xs font-semibold text-amber-50">
                    Clipboard unavailable. Select the read-back text manually.
                  </p>
                ) : null}
              </div>

              <div className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      Saved review drafts
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#334155]">
                      {persistedPartsDraftsStatus === 'loaded'
                        ? hasAuthenticatedPartsDraftHistory
                          ? `${initialPersistedPartsDrafts.length} authenticated parts draft${
                              initialPersistedPartsDrafts.length === 1 ? '' : 's'
                            } saved for review.`
                          : 'Authenticated parts draft storage is connected; no saved review drafts exist yet.'
                        : persistedPartsDraftsStatus === 'database_not_configured'
                          ? 'Authenticated parts draft storage is not configured in this environment.'
                          : persistedPartsDraftsStatus === 'database_error'
                            ? 'Authenticated parts draft storage could not be reached.'
                            : persistedPartsDraftsStatus === 'role_not_allowed'
                              ? 'Parts draft history is manager-review only until an owner-safe report is published.'
                              : persistedPartsDraftsStatus === 'service_profile_required'
                                ? 'Parts draft history requires a verified technician service profile with person scope.'
                                : 'Sign in with a verified Nexus service profile to load private parts drafts.'}
                    </p>
                  </div>
                  <span className="rounded-[14px] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                    Private
                  </span>
                </div>

                {hasAuthenticatedPartsDraftHistory ? (
                  <div className="mt-4 space-y-3">
                    {initialPersistedPartsDrafts.map((partsDraft) => (
                      <article
                        key={partsDraft.id}
                        className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#0f172a]">
                              {partsDraft.lineCount} line{partsDraft.lineCount === 1 ? '' : 's'} -
                              {` ${partsDraft.quantityTotal} pack${
                                partsDraft.quantityTotal === 1 ? '' : 's'
                              }`}
                            </p>
                            <p className="mt-1 text-xs text-[#334155]">
                              {partsDraft.id} - {partsDraft.submittedAt}
                            </p>
                          </div>
                          <span className="rounded-[14px] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            Authenticated
                          </span>
                        </div>
                        <dl className="mt-3 grid gap-2 text-xs text-[#334155] sm:grid-cols-2">
                          <div>
                            <dt className="text-slate-500">Status</dt>
                            <dd className="font-semibold text-[#0f172a]">{partsDraft.status}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Value</dt>
                            <dd className="font-semibold text-[#0f172a]">
                              {formatPln(partsDraft.totalValue)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Device</dt>
                            <dd className="font-semibold text-[#0f172a]">{partsDraft.deviceId}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Created by</dt>
                            <dd className="font-semibold text-[#0f172a]">{partsDraft.createdBy}</dd>
                          </div>
                        </dl>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>

              {draftNotice ? (
                <div
                  id={SERVICE_DRAFT_NOTICE_STATUS_ID}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={SERVICE_DRAFT_NOTICE_STATUS_LABEL}
                  className="mt-4 rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] p-4 text-sm leading-6 text-emerald-50"
                >
                  {draftNotice}
                </div>
              ) : null}

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  aria-describedby={SERVICE_ACTION_STATUS_ID}
                  disabled={draftLines.length === 0}
                  onClick={sendPartsDraft}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-4 text-sm font-semibold text-[#475569] hover:bg-[#06b6d4]/[0.18] disabled:cursor-not-allowed disabled:border-[#e2e8f0] disabled:bg-[#f8fafc] disabled:text-slate-500 ${DARK_FOCUS_RING}`}
                >
                  Send draft for review
                  <ArrowRight className="h-4 w-4" />
                </button>
                {canCheckPartsOrderAuthority ? (
                  <>
                    <button
                      type="button"
                      aria-describedby={SERVICE_ACTION_STATUS_ID}
                      disabled={draftLines.length === 0}
                      onClick={checkPartsOrderGate}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-amber-200/[0.30] px-4 text-sm font-semibold text-amber-50 hover:bg-amber-200/[0.10] disabled:cursor-not-allowed disabled:border-[#e2e8f0] disabled:text-slate-500 ${DARK_FOCUS_RING}`}
                    >
                      Check order gate
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                    <Link
                      href={SERVICE_SUPPLIES_ROUTE_HREF}
                      aria-describedby={SERVICE_PARTS_DRAFT_STATUS_ID}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] px-4 text-sm font-semibold text-[#0f172a] hover:bg-[#f8fafc] ${DARK_FOCUS_RING}`}
                      onClick={() => trackServiceAction('open_supplies_from_service')}
                    >
                      Open supplies module
                    </Link>
                  </>
                ) : (
                  <div className="rounded-[14px] border border-amber-200/[0.30] bg-amber-200/[0.10] p-4 text-sm leading-6 text-amber-50">
                    Supplier order checks are manager/admin-only. This technician draft can
                    be sent for review, but it cannot open order gates or the supplies module.
                  </div>
                )}
              </div>
            </section>
          </aside>
          ) : null}
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs text-[#0f172a]">
            <div className="flex items-center gap-3">
              <div className="rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] p-3 text-emerald-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Manuals and instructions
                </p>
                <h2 className="text-xl font-semibold text-[#0f172a]">
                  Source-backed library queue from local catalogues.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#334155]">
                  {persistedManualLinksStatus === 'loaded'
                    ? hasAuthenticatedManualLinkHistory
                      ? `${initialPersistedManualLinks.length} authenticated manual link${
                          initialPersistedManualLinks.length === 1 ? '' : 's'
                        } saved for this organization.`
                      : 'Authenticated manual-link storage is connected; no saved links exist yet.'
                    : persistedManualLinksStatus === 'database_not_configured'
                      ? 'Authenticated manual-link storage is not configured in this environment.'
                      : persistedManualLinksStatus === 'database_error'
                        ? 'Authenticated manual-link storage could not be reached.'
                        : persistedManualLinksStatus === 'role_not_allowed'
                          ? 'Manual-link history is manager-only while this page remains a public preview.'
                          : 'Sign in with a verified Nexus service manager profile to load private manual links.'}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="grid gap-2 sm:grid-cols-4" aria-label="Manual readiness summary">
                {manualReadinessCounts.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-h-16 items-center justify-between gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                      {item.label}
                    </span>
                    <span className="text-lg font-semibold text-[#0f172a]">{item.value}</span>
                  </div>
                ))}
              </div>

              {NEXUS_SERVICE_MANUAL_LIBRARY.map((manual) => (
                <article
                  key={manual.id}
                  className="rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-5 transition-all hover:border-[#cbd5e1] hover:bg-white hover:shadow-xs"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 border-b border-[#e2e8f0] pb-3.5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[#0f172a] font-sans">
                            {manual.title}
                          </h3>
                          <span className="rounded-[9999px] border border-[#cbd5e1] bg-[#ffffff] px-2.5 py-0.5 text-[11px] font-semibold text-[#475569]">
                            {manual.packetKind}
                          </span>
                          <span
                            className={`inline-flex rounded-[9999px] px-2.5 py-0.5 text-[11px] font-semibold ${MANUAL_STATUS_CLASSES[manual.status]}`}
                          >
                            {manual.status}
                          </span>
                        </div>
                        <p className="mt-1 break-words text-xs leading-5 text-[#64748b]">
                          {manual.source}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <button
                          type="button"
                          aria-label={`${getManualActionLabel(manual.status)} ${manual.title}`}
                          aria-describedby={SERVICE_ACTION_STATUS_ID}
                          onClick={() => handleManualAction(manual)}
                          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#cbd5e1] bg-[#ffffff] px-3.5 text-xs font-bold text-[#0f172a] shadow-2xs hover:bg-[#f1f5f9] hover:border-[#94a3b8] transition-colors ${DARK_FOCUS_RING}`}
                        >
                          {getManualActionLabel(manual.status)}
                          <ArrowRight className="h-3.5 w-3.5 text-[#64748b]" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 text-xs leading-relaxed text-[#334155] sm:grid-cols-2">
                      <div className="min-w-0">
                        <p className="font-bold text-[#0f172a]">{manual.modelHint}</p>
                        <p className="mt-1 text-[#475569]">{manual.serviceUse}</p>
                        <p className="mt-1.5 text-[#64748b]">{manual.ownerHandoff}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-[#475569]">
                          <span className="rounded-[8px] border border-[#e2e8f0] bg-[#ffffff] px-2 py-0.5">
                            {manual.visibility}
                          </span>
                          <span className="rounded-[8px] border border-[#e2e8f0] bg-[#ffffff] px-2 py-0.5">
                            {manual.audience}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 rounded-[12px] border border-[#e2e8f0] bg-[#ffffff] p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">Extraction Checklist</p>
                        <ul className="space-y-1.5 text-xs text-[#475569]">
                          {manual.extractionChecklist.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2.5 border-t border-[#f1f5f9] pt-2 text-[11px] text-[#64748b]">
                          {manual.nextAction}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                    Extraction review queue
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#334155]">
                    {persistedManualExtractionQueueStatus === 'loaded'
                      ? hasAuthenticatedManualExtractionQueue
                        ? `${initialPersistedManualExtractionQueue.length} authenticated extraction request${
                            initialPersistedManualExtractionQueue.length === 1 ? '' : 's'
                          } queued for this service profile.`
                        : 'Authenticated extraction queue storage is connected; no reviewed queue rows exist yet.'
                      : persistedManualExtractionQueueStatus === 'database_not_configured'
                        ? 'Authenticated extraction queue storage is not configured in this environment.'
                        : persistedManualExtractionQueueStatus === 'database_error'
                          ? 'Authenticated extraction queue storage could not be reached.'
                          : persistedManualExtractionQueueStatus === 'role_not_allowed'
                            ? 'Extraction queue history is manager/technician-only.'
                            : persistedManualExtractionQueueStatus === 'service_profile_required'
                              ? 'A verified technician person scope is required to load extraction queue history.'
                              : 'Sign in with a verified Nexus service profile to load extraction queue history.'}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  Review draft only
                </span>
              </div>

              {hasAuthenticatedManualExtractionQueue ? (
                <div className="mt-3 grid gap-3">
                  {initialPersistedManualExtractionQueue.map((queueItem) => (
                    <article
                      key={queueItem.id}
                      className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[#0f172a]">
                            {queueItem.documentTitle}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#64748b]">
                            {queueItem.ownerReportLabel ?? queueItem.sourceRef ?? queueItem.documentId}
                          </p>
                        </div>
                        <span className="inline-flex w-fit rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          {queueItem.reviewStatus}
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-3 text-sm text-[#334155] sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-[#64748b]">Target</dt>
                          <dd className="font-semibold text-[#0f172a]">
                            {queueItem.targetLabel ?? queueItem.targetId}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-[#64748b]">Version</dt>
                          <dd className="font-semibold text-[#0f172a]">
                            {queueItem.documentVersion}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-[#64748b]">Checklist</dt>
                          <dd className="font-semibold text-[#0f172a]">
                            {queueItem.checklistCount} extraction checks
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-[#64748b]">Queued by</dt>
                          <dd className="font-semibold text-[#0f172a]">
                            {queueItem.requestedBy}
                          </dd>
                        </div>
                      </dl>
                      <p className="mt-3 text-xs leading-5 text-[#64748b]">
                        {queueItem.requestedOutcome}
                      </p>
                      {canReviewManualExtraction &&
                      (queueItem.reviewStatus === 'Queued' ||
                        queueItem.reviewStatus === 'In review') ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {queueItem.reviewStatus === 'Queued' ? (
                            <button
                              type="button"
                              aria-label={`Mark in review ${queueItem.documentTitle}`}
                              aria-describedby={SERVICE_ACTION_STATUS_ID}
                              onClick={() =>
                                handleManualExtractionReview(queueItem, 'in-review')
                              }
                              className={`inline-flex min-h-11 items-center justify-center rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-3 text-xs font-semibold text-cyan-700 hover:bg-[#06b6d4]/[0.18] ${DARK_FOCUS_RING}`}
                            >
                              Mark in review
                            </button>
                          ) : null}
                          <button
                            type="button"
                            aria-label={`Approve owner-safe draft ${queueItem.documentTitle}`}
                            aria-describedby={SERVICE_ACTION_STATUS_ID}
                            onClick={() =>
                              handleManualExtractionReview(
                                queueItem,
                                'owner-safe-draft'
                              )
                            }
                            className={`inline-flex min-h-11 items-center justify-center rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] px-3 text-xs font-semibold text-emerald-700 hover:bg-[#10b981]/[0.10] ${DARK_FOCUS_RING}`}
                          >
                            Approve owner-safe draft
                          </button>
                          <button
                            type="button"
                            aria-label={`Block extraction ${queueItem.documentTitle}`}
                            aria-describedby={SERVICE_ACTION_STATUS_ID}
                            onClick={() =>
                              handleManualExtractionReview(queueItem, 'blocked')
                            }
                            className={`inline-flex min-h-11 items-center justify-center rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-xs font-semibold text-[#0f172a] hover:bg-[#f8fafc] ${DARK_FOCUS_RING}`}
                          >
                            Block
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </div>

            {hasAuthenticatedManualLinkHistory ? (
              <div className="mt-5 border-t border-[#e2e8f0] pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Authenticated manual links
                </p>
                <div className="mt-3 grid gap-3">
                  {initialPersistedManualLinks.map((manualLink) => (
                    <article
                      key={manualLink.id}
                      className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[#0f172a]">
                            {manualLink.documentTitle}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#64748b]">
                            {manualLink.documentSource ?? manualLink.documentId}
                          </p>
                        </div>
                        <span className="rounded-[14px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          Authenticated
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-2 text-sm text-[#334155] sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-[#64748b]">Device</dt>
                          <dd className="font-semibold text-[#0f172a]">{manualLink.deviceId}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-[#64748b]">Target</dt>
                          <dd className="font-semibold text-[#0f172a]">
                            {manualLink.targetLabel ?? manualLink.targetId}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-[#64748b]">Version</dt>
                          <dd className="font-semibold text-[#0f172a]">
                            {manualLink.documentVersion}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-[#64748b]">Status</dt>
                          <dd className="font-semibold text-[#0f172a]">
                            {manualLink.reviewStatus}
                          </dd>
                        </div>
                        {manualLink.visibility ? (
                          <div>
                            <dt className="text-xs text-[#64748b]">Visibility</dt>
                            <dd className="font-semibold text-[#0f172a]">
                              {manualLink.visibility}
                            </dd>
                          </div>
                        ) : null}
                        <div>
                          <dt className="text-xs text-[#64748b]">Linked by</dt>
                          <dd className="font-semibold text-[#0f172a]">{manualLink.linkedBy}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-[#64748b]">Linked</dt>
                          <dd className="font-semibold text-[#0f172a]">{manualLink.linkedAt}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs text-[#0f172a]">
            <div className="flex items-center gap-3">
              <div className="rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-3 text-cyan-700">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Product facts
                </p>
                <h2 className="text-xl font-semibold text-[#0f172a]">
                  Service app starts from current Hylono catalog data.
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {selectedServiceModelFacts.map((model) => (
                <article
                  key={model.id}
                  className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                >
                  <p className="text-sm font-semibold text-[#0f172a]">{model.model}</p>
                  <p className="mt-1 text-xs text-[#64748b]">{model.family}</p>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#64748b]">Gas</dt>
                      <dd className="font-semibold text-[#0f172a]">{model.gas}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#64748b]">Output</dt>
                      <dd className="font-semibold text-[#0f172a]">{model.h2Value}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#64748b]">Price</dt>
                      <dd className="font-semibold text-[#0f172a]">
                        {formatPln(model.grossPrice)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
                <p className="text-sm leading-6 text-[#475569]">
                  This module displays sample workflows and in-repo catalog facts. It does not
                  expose private client records, confirm warranty decisions, or submit real parts
                  orders.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs text-[#0f172a]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Reuse boundary
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                What was adopted from the existing service app.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#334155]">
                The original Omega3 app already covers inspection reports, parts catalogues,
                manual library, contacts, saved drafts, photos, offline behavior, and AI-assisted
                review. This Nexus module keeps the same operational spine while redesigning it
                for an owner plus service team workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: FileText,
                  title: 'Inspection report spine',
                  detail: 'Visit checklist and closeout evidence are first-class objects.',
                },
                {
                  icon: UserRoundCheck,
                  title: 'Owner sharing',
                  detail: 'Notes are scoped before they become visible to owners or company.',
                },
                {
                  icon: PackageCheck,
                  title: 'Replacement parts',
                  detail: 'Draft lines are queued for review instead of pretending to order live.',
                },
                {
                  icon: Clock3,
                  title: 'Offline-ready next step',
                  detail: 'Future persistence can reuse the original IndexedDB/report patterns.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                >
                  <item.icon className="h-5 w-5 text-cyan-700" />
                  <h3 className="mt-3 text-sm font-semibold text-[#0f172a]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#334155]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PartnerLayout>
  );
};

export default ServiceOperations;

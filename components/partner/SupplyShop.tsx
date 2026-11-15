'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useDeferredValue, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';
import analytics from '@/src/lib/analytics';
import type {
    NexusSuppliesPersistedRequisition,
    NexusSuppliesRequisitionActionResult,
    NexusSuppliesServerActionStatus,
} from '@/src/actions/nexusSuppliesActionCore';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import { PartnerLayout } from './PartnerLayout';
import {
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Clock3,
    Minus,
    Package,
    Plus,
    RefreshCw,
    Repeat2,
    Search,
    ShieldCheck,
    ShoppingBag,
    Boxes,
    MapPin,
    LogIn,
    MessageSquare,
} from 'lucide-react';

type SupplyCategory = 'Consumables' | 'Accessories' | 'Service Parts';
type InventoryStatus = 'healthy' | 'reorder' | 'review';
type ApprovalMode = 'Auto-release' | 'Manager review' | 'Partner ops review';
type CategoryFilter = 'All' | SupplyCategory;
type PersistedRequisitionsStatus =
    | 'loaded'
    | 'database_error'
    | 'database_not_configured'
    | 'auth_context_missing'
    | 'role_not_allowed';

type NexusSuppliesRequisitionActionRunner = (
    prevState: NexusSuppliesRequisitionActionResult,
    formData: FormData
) => Promise<NexusSuppliesRequisitionActionResult>;

interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    category: SupplyCategory;
    status: InventoryStatus;
    onHand: number;
    parLevel: number;
    monthlyBurn: number;
    packSize: string;
    lastOrder: string;
    approvalMode: ApprovalMode;
    note: string;
    recommendedQty: number;
    templateEligible: boolean;
}

interface RequisitionRow {
    id: string;
    label: string;
    submittedAt: string;
    lines: number;
    status: 'Queued' | 'Needs review' | 'Packed';
}

interface StandingTemplate {
    id: string;
    name: string;
    cadence: string;
    itemCount: number;
    owner: string;
    lines: Array<{
        itemId: string;
        quantity: number;
    }>;
}

const INVENTORY_ITEMS: InventoryItem[] = [
    {
        id: 'mask-liners',
        name: 'Session Mask Liner Pack',
        sku: 'NX-CNS-014',
        category: 'Consumables',
        status: 'reorder',
        onHand: 18,
        parLevel: 32,
        monthlyBurn: 26,
        packSize: '20 liners',
        lastOrder: '02 Apr 2026',
        approvalMode: 'Auto-release',
        note: 'Usage has climbed with weekend booking blocks. Recommended draft already reflects current burn.',
        recommendedQty: 1,
        templateEligible: true,
    },
    {
        id: 'surface-kit',
        name: 'Surface Reset Cleaning Kit',
        sku: 'NX-CNS-027',
        category: 'Consumables',
        status: 'healthy',
        onHand: 9,
        parLevel: 8,
        monthlyBurn: 5,
        packSize: '6 kits',
        lastOrder: '28 Mar 2026',
        approvalMode: 'Auto-release',
        note: 'Coverage is stable. Keep in the next standing template if session volume remains above target.',
        recommendedQty: 0,
        templateEligible: true,
    },
    {
        id: 'quick-connect',
        name: 'Quick-Connect Tubing Set',
        sku: 'NX-ACC-041',
        category: 'Accessories',
        status: 'review',
        onHand: 4,
        parLevel: 6,
        monthlyBurn: 3,
        packSize: '2 sets',
        lastOrder: '16 Feb 2026',
        approvalMode: 'Partner ops review',
        note: 'Compatibility should be confirmed against the latest chamber service record before release.',
        recommendedQty: 1,
        templateEligible: false,
    },
    {
        id: 'client-wraps',
        name: 'Client Compression Wrap Set',
        sku: 'NX-ACC-063',
        category: 'Accessories',
        status: 'healthy',
        onHand: 11,
        parLevel: 10,
        monthlyBurn: 4,
        packSize: '4 sets',
        lastOrder: '31 Mar 2026',
        approvalMode: 'Manager review',
        note: 'Counts are healthy, but manager sign-off still applies for any non-template accessory request.',
        recommendedQty: 0,
        templateEligible: false,
    },
    {
        id: 'seal-gasket',
        name: 'Door Seal Gasket Bundle',
        sku: 'NX-SVC-102',
        category: 'Service Parts',
        status: 'review',
        onHand: 1,
        parLevel: 2,
        monthlyBurn: 1,
        packSize: '1 bundle',
        lastOrder: '11 Jan 2026',
        approvalMode: 'Partner ops review',
        note: 'Service parts stay quote-based and require a maintenance note attached to the draft.',
        recommendedQty: 1,
        templateEligible: false,
    },
    {
        id: 'filter-cartridge',
        name: 'Air Filter Cartridge Set',
        sku: 'NX-SVC-118',
        category: 'Service Parts',
        status: 'reorder',
        onHand: 2,
        parLevel: 5,
        monthlyBurn: 2,
        packSize: '3 cartridges',
        lastOrder: '18 Mar 2026',
        approvalMode: 'Manager review',
        note: 'Recommended quantity tops the clinic back up to par without over-ordering the service shelf.',
        recommendedQty: 1,
        templateEligible: true,
    },
];

const INITIAL_RECENT_REQUISITIONS: RequisitionRow[] = [
    { id: 'rq-1048', label: 'Weekend turnover restock', submittedAt: '09 Apr 2026', lines: 6, status: 'Packed' },
    { id: 'rq-1043', label: 'Monthly accessory refresh', submittedAt: '04 Apr 2026', lines: 3, status: 'Queued' },
    { id: 'rq-1036', label: 'Seal review follow-up', submittedAt: '29 Mar 2026', lines: 2, status: 'Needs review' },
];

const STANDING_TEMPLATES: StandingTemplate[] = [
    {
        id: 'st-01',
        name: 'High-turnover session pack',
        cadence: 'Every 14 sessions',
        itemCount: 3,
        owner: 'Front desk ops',
        lines: [
            { itemId: 'mask-liners', quantity: 1 },
            { itemId: 'surface-kit', quantity: 1 },
            { itemId: 'client-wraps', quantity: 1 },
        ],
    },
    {
        id: 'st-02',
        name: 'Weekly reset shelf',
        cadence: 'Every Friday',
        itemCount: 2,
        owner: 'Clinic manager',
        lines: [
            { itemId: 'mask-liners', quantity: 1 },
            { itemId: 'surface-kit', quantity: 1 },
        ],
    },
    {
        id: 'st-03',
        name: 'Service bench essentials',
        cadence: 'Every 30 days',
        itemCount: 2,
        owner: 'Maintenance lead',
        lines: [
            { itemId: 'seal-gasket', quantity: 1 },
            { itemId: 'filter-cartridge', quantity: 1 },
        ],
    },
];

const CATEGORY_FILTERS: CategoryFilter[] = ['All', 'Consumables', 'Accessories', 'Service Parts'];
const INVENTORY_SEARCH_INPUT_ID = 'supplyshop-search';
const INVENTORY_SEARCH_HINT_ID = 'supplyshop-search-hint';
const INVENTORY_FILTER_SUMMARY_ID = 'supplyshop-filter-summary';
const SUPPLY_INVENTORY_FILTER_STATUS_LABEL = 'Supply inventory filter status';
const SUPPLY_DRAFT_ACTION_STATUS_ID = 'supply-draft-action-status';
const SUPPLY_WORKSPACE_ACCESS_STATUS_ID = 'supply-workspace-access-status';
const SUPPLY_WORKSPACE_ACCESS_STATUS_LABEL = 'Supply workspace access status';
const SUPPLYSHOP_FOCUS_RING =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500';
const SUPPLYSHOP_DARK_FOCUS_RING = SUPPLYSHOP_FOCUS_RING;
const SUPPLY_REQUISITION_PREVIEW_SUBMITTED_AT = '20 Jan 2026';
const SUPPLIES_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.supplies.href;
const INITIAL_NEXUS_SUPPLIES_REQUISITION_ACTION_STATE: NexusSuppliesRequisitionActionResult = {
    success: false,
    status: 'auth_required',
    message: 'Supply requisition boundary has not been requested yet.',
    persisted: false,
    futureTable: null,
    persistenceMode: 'blocked',
};
const SUPPLIES_ACTION_STATUS_LABELS: Record<NexusSuppliesServerActionStatus, string> = {
    validation_error: 'Input check failed',
    auth_required: 'Authentication required',
    service_profile_required: 'Service profile required',
    role_not_allowed: 'Role not allowed',
    persistence_error: 'Persistence failed',
    private_write_ready: 'Private write boundary ready',
};
const PERSISTED_REQUISITIONS_STATUS_COPY: Record<PersistedRequisitionsStatus, string> = {
    loaded: 'Authenticated supply requisition history is connected for signed-in service profiles.',
    database_error: 'Authenticated supply requisition storage could not load, so this screen keeps sample drafts.',
    database_not_configured: 'Authenticated supply requisition storage is ready for deployment database configuration.',
    auth_context_missing: 'Authenticated supply requisition storage waits for sign-in and a verified Nexus service profile.',
    role_not_allowed: 'Supply requisition history is manager-only for this Nexus service role.',
};
type SupplyShopEntranceMotion = {
    initial: false | { opacity: number; y: number };
    animate?: { opacity: number; y: number };
    transition?: { delay: number };
};

export const getSupplyShopEntranceMotion = (
    index: number,
    delayStep: number,
    prefersReducedMotion: boolean,
): SupplyShopEntranceMotion => {
    if (prefersReducedMotion) {
        return { initial: false };
    }

    return {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * delayStep },
    };
};

const trackSupplyShopAction = (
    action: string,
    properties: Record<string, string | number | boolean> = {},
) => {
    analytics.capture('nexus_supplies_route_action_clicked', {
        route: SUPPLIES_ROUTE_HREF,
        preview_record: true,
        action,
        ...properties,
    });
};

const buildDefaultDraft = (): Record<string, number> =>
    Object.fromEntries(
        INVENTORY_ITEMS.filter((item) => item.recommendedQty > 0).map((item) => [item.id, item.recommendedQty]),
    );

const buildTemplateDraft = (template: StandingTemplate): Record<string, number> =>
    Object.fromEntries(template.lines.map((line) => [line.itemId, line.quantity]));

const buildNextRequisitionId = (existingRows: RequisitionRow[]): string => {
    const nextNumericId =
        existingRows.reduce((highest, row) => {
            const numericId = Number.parseInt(row.id.replace(/\D/g, ''), 10);
            return Number.isFinite(numericId) ? Math.max(highest, numericId) : highest;
        }, 0) + 1;

    return `rq-${nextNumericId}`;
};

const statusLabel: Record<InventoryStatus, string> = {
    healthy: 'Healthy',
    reorder: 'Restock soon',
    review: 'Needs review',
};

const statusClasses: Record<InventoryStatus, string> = {
    healthy: 'border-emerald-200 bg-[#10b981]/[0.10] text-emerald-700',
    reorder: 'border-amber-200 bg-[#f59e0b]/[0.10] text-amber-700',
    review: 'border-rose-200 bg-[#f43f5e]/[0.10] text-rose-700',
};

const requisitionStatusClasses: Record<RequisitionRow['status'], string> = {
    Queued: 'border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700',
    'Needs review': 'border border-rose-200 bg-[#f43f5e]/[0.10] text-rose-700',
    Packed: 'border border-emerald-200 bg-[#10b981]/[0.10] text-emerald-700',
};

const MetricCard: React.FC<{
    label: string;
    value: string | number;
    subcopy: string;
    icon: typeof ShoppingBag;
    iconWrap: string;
    iconColor: string;
}> = ({ label, value, subcopy, icon: Icon, iconWrap, iconColor }) => (
    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">{label}</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${iconWrap}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-[#0f172a]">{value}</span>
        </div>
        <p className="mt-1 text-xs text-[#64748b]">{subcopy}</p>
    </div>
);

const InventoryStatusBadge: React.FC<{ status: InventoryStatus }> = ({ status }) => (
    <span className={`inline-flex items-center gap-1 rounded-[9999px] border px-2.5 py-1 text-[11px] font-bold ${statusClasses[status]}`}>
        {status === 'healthy' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
        {statusLabel[status]}
    </span>
);

const QuantityControl: React.FC<{
    itemName: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
    statusId?: string;
}> = ({ itemName, value, onDecrease, onIncrease, statusId }) => (
    <div className="inline-flex items-center rounded-[12px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs">
        <button
            type="button"
            onClick={onDecrease}
            className={`flex h-10 w-10 items-center justify-center rounded-l-[12px] text-[#475569] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a] ${SUPPLYSHOP_FOCUS_RING}`}
            aria-label={`Decrease draft quantity for ${itemName}`}
            aria-describedby={statusId}
        >
            <Minus className="w-4 h-4" />
        </button>
        <span className="min-w-10 text-center text-sm font-bold text-[#0f172a]">{value}</span>
        <button
            type="button"
            onClick={onIncrease}
            className={`flex h-10 w-10 items-center justify-center rounded-r-[12px] text-[#475569] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a] ${SUPPLYSHOP_FOCUS_RING}`}
            aria-label={`Increase draft quantity for ${itemName}`}
            aria-describedby={statusId}
        >
            <Plus className="w-4 h-4" />
        </button>
    </div>
);

interface SupplyShopProps {
    createRequisitionAction?: NexusSuppliesRequisitionActionRunner;
    initialPersistedRequisitions?: NexusSuppliesPersistedRequisition[];
    persistedRequisitionsStatus?: PersistedRequisitionsStatus;
}

export const SupplyShop: React.FC<SupplyShopProps> = ({
    createRequisitionAction,
    initialPersistedRequisitions = [],
    persistedRequisitionsStatus = 'auth_context_missing',
}) => {
    const prefersReducedMotion = useReducedMotion() ?? false;
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
    const [draft, setDraft] = useState<Record<string, number>>(() => buildDefaultDraft());
    const [recentRequisitions, setRecentRequisitions] = useState<RequisitionRow[]>(INITIAL_RECENT_REQUISITIONS);
    const [serverActionResult, setServerActionResult] =
        useState<NexusSuppliesRequisitionActionResult | null>(null);
    const [serverActionPending, setServerActionPending] = useState(false);
    const [submissionNotice, setSubmissionNotice] = useState<{
        tone: 'info' | 'success';
        title: string;
        detail: string;
    } | null>(null);
    const [workspaceAccessStatus, setWorkspaceAccessStatus] = useState(
        'Supply workspace exits ready. Sign in opens account access; contact opens Hylono support.',
    );
    const [lastDraftAction, setLastDraftAction] = useState<'rebuilt' | 'cleared' | null>(null);
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const accessHref = buildLoginRedirectPath('/account');

    const filteredItems = INVENTORY_ITEMS.filter((item) => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const query = deferredSearchTerm.trim().toLowerCase();
        const matchesSearch =
            query.length === 0 ||
            item.name.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    const draftLines = INVENTORY_ITEMS.filter((item) => (draft[item.id] ?? 0) > 0).map((item) => ({
        ...item,
        quantity: draft[item.id] ?? 0,
    }));
    const belowParCount = INVENTORY_ITEMS.filter((item) => item.onHand < item.parLevel).length;
    const reviewCount = INVENTORY_ITEMS.filter((item) => item.status === 'review').length;
    const templateCount = INVENTORY_ITEMS.filter((item) => item.templateEligible).length;
    const totalDraftPacks = draftLines.reduce((sum, item) => sum + item.quantity, 0);
    const approvalOnlyDraftLines = draftLines.filter((item) => item.approvalMode !== 'Auto-release');
    const approvalOnlyLines = approvalOnlyDraftLines.length;
    const serviceEvidenceDraftLines = draftLines.filter(
        (item) => item.category === 'Service Parts' || item.approvalMode === 'Partner ops review',
    );
    const managerApprovalStatus =
        approvalOnlyLines === 0
            ? 'Auto-release eligible'
            : serviceEvidenceDraftLines.length > 0
                ? 'Manual evidence required'
                : 'Manager review required';
    const autoReleaseEligibleLines = draftLines.length - approvalOnlyLines;
    const managerReviewLines = approvalOnlyLines;
    const manualEvidenceSummary =
        serviceEvidenceDraftLines.length > 0
            ? `${serviceEvidenceDraftLines.length} staged line${serviceEvidenceDraftLines.length === 1 ? '' : 's'} need latest service record, maintenance note, or catalogue compatibility evidence before supplier action.`
            : approvalOnlyLines > 0
                ? `${approvalOnlyLines} approval-only line${approvalOnlyLines === 1 ? '' : 's'} stay in manager review before supplier action.`
                : 'All staged lines are auto-release preview items; authenticated workspace still confirms stock before fulfilment.';
    const approvalReadinessFacts = [
        {
            label: 'Supply approval status',
            value: managerApprovalStatus,
        },
        {
            label: 'Staged requisition lines',
            value: String(draftLines.length),
        },
        {
            label: 'Manual evidence lines',
            value: String(serviceEvidenceDraftLines.length),
        },
        {
            label: 'Auto-release eligible lines',
            value: String(autoReleaseEligibleLines),
        },
        {
            label: 'Manager review required lines',
            value: String(managerReviewLines),
        },
        {
            label: 'Supplier action boundary',
            value: 'Disabled',
        },
    ];
    const approvalReadinessItems = [
        {
            label: 'Draft status',
            value: managerApprovalStatus,
            detail:
                approvalOnlyLines > 0
                    ? `${approvalOnlyLines} approval-only line${approvalOnlyLines === 1 ? '' : 's'} cannot auto-submit.`
                    : 'No approval-only lines are staged in this draft.',
        },
        {
            label: 'Evidence required',
            value: String(serviceEvidenceDraftLines.length),
            detail: manualEvidenceSummary,
        },
        {
            label: 'Supplier action',
            value: 'Disabled',
            detail: 'No supplier quote, purchase order, payment, fulfilment, or owner promise is created from this preview.',
        },
    ];
    const normalizedSearchTerm = deferredSearchTerm.trim();
    const hasActiveInventoryFilters = normalizedSearchTerm.length > 0 || activeCategory !== 'All';
    const inventoryFilterSummary =
        filteredItems.length === 1
            ? 'Showing 1 inventory line in this view.'
            : `Showing ${filteredItems.length} inventory lines in this view.`;
    const inventoryFilterStatus = `${inventoryFilterSummary} Category: ${activeCategory}. Search: ${
        normalizedSearchTerm.length > 0 ? normalizedSearchTerm : 'no search term'
    }.`;
    const draftActionStatus =
        draftLines.length === 0
            ? 'No requisition lines are staged. Use inventory, a template, or reset from par levels before sending for review.'
            : `${draftLines.length} staged line${draftLines.length === 1 ? '' : 's'} and ${totalDraftPacks} pack${totalDraftPacks === 1 ? '' : 's'} ready for manager review; supplier quote, purchase order, payment, and fulfilment remain disabled.`;

    const updateDraftQuantity = (itemId: string, nextQuantity: number) => {
        const safeQty = Math.max(0, Math.floor(nextQuantity));
        setDraft((current) => {
            if (safeQty <= 0) {
                const nextDraft = { ...current };
                delete nextDraft[itemId];
                return nextDraft;
            }

            return { ...current, [itemId]: safeQty };
        });
    };

    const handleApplyTemplate = (template: StandingTemplate) => {
        setDraft((current) => ({
            ...current,
            ...buildTemplateDraft(template),
        }));
        trackSupplyShopAction('template_applied', {
            template_id: template.id,
            item_count: template.itemCount,
        });
        setServerActionResult(null);
        setSubmissionNotice({
            tone: 'info',
            title: `${template.name} added to the draft`,
            detail: `${template.itemCount} replenishment lines are now staged for ${template.cadence.toLowerCase()}.`,
        });
    };

    const buildRequisitionFormData = (
        nextStatus: Extract<RequisitionRow['status'], 'Queued' | 'Needs review'>
    ) => {
        const formData = new FormData();
        formData.set('lineCount', String(draftLines.length));
        formData.set('totalPacks', String(totalDraftPacks));
        formData.set('approvalOnlyLines', String(approvalOnlyLines));
        formData.set('nextStatus', nextStatus);
        return formData;
    };

    const runRequisitionBoundary = async (
        runner: NexusSuppliesRequisitionActionRunner | undefined,
        formData: FormData
    ) => {
        if (!runner) {
            return;
        }

        setServerActionPending(true);
        setServerActionResult(null);

        try {
            const result = await runner(INITIAL_NEXUS_SUPPLIES_REQUISITION_ACTION_STATE, formData);
            setServerActionResult(result);
        } catch {
            setServerActionResult({
                success: false,
                status: 'validation_error',
                message: 'Supply requisition boundary could not be checked from this browser preview.',
                persisted: false,
                futureTable: null,
                persistenceMode: 'blocked',
            });
        } finally {
            setServerActionPending(false);
        }
    };

    const handleSendDraftForReview = () => {
        if (draftLines.length === 0) {
            return;
        }

        const nextStatus: Extract<RequisitionRow['status'], 'Queued' | 'Needs review'> =
            draftLines.some((item) => item.approvalMode !== 'Auto-release') ? 'Needs review' : 'Queued';
        const requisitionFormData = buildRequisitionFormData(nextStatus);
        trackSupplyShopAction('draft_sent_for_review', {
            line_count: draftLines.length,
            approval_only_lines: approvalOnlyLines,
            draft_packs: totalDraftPacks,
            next_status: nextStatus,
            approval_status: managerApprovalStatus,
            evidence_line_count: serviceEvidenceDraftLines.length,
        });

        setRecentRequisitions((current) => [
            {
                id: buildNextRequisitionId(current),
                label:
                    draftLines.length === 1
                        ? `${draftLines[0]?.name ?? 'Replenishment'} draft`
                        : `${draftLines.length}-line replenishment draft`,
                submittedAt: SUPPLY_REQUISITION_PREVIEW_SUBMITTED_AT,
                lines: draftLines.length,
                status: nextStatus,
            },
            ...current,
        ]);
        setDraft({});
        setSubmissionNotice({
            tone: 'success',
            title: 'Draft sent for review',
            detail: `${draftLines.length} line${draftLines.length === 1 ? '' : 's'} queued as ${nextStatus.toLowerCase()}.`,
        });
        void runRequisitionBoundary(createRequisitionAction, requisitionFormData);
    };

    const resetInventoryFilters = () => {
        trackSupplyShopAction('inventory_filters_reset', {
            active_category: activeCategory,
            had_search_term: searchTerm.trim().length > 0,
        });
        setSearchTerm('');
        setActiveCategory('All');
    };

    return (
        <PartnerLayout title="Supplies">
            {/* Public sample boundary note for compliance testing */}
            <div
                role="note"
                aria-label="Nexus public route boundary: sample workspace tour without live clinic records"
                className="sr-only"
            >
                Sample workspace tour without live clinic records. No live clinic records are shown.
            </div>

            {/* Grand Clinical Hero Banner */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs mb-6 md:mb-8"
            >
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <Image
                        src="/images/landing/card-hydrogen-v2.jpg"
                        alt="Clinical supplies fulfillment background"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-right-top opacity-15 md:opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff] via-[#ffffff]/90 to-[#ffffff]/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-transparent to-transparent" />
                </div>

                <div className="relative z-10 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                            <span className="h-1.5 w-1.5 rounded-[9999px] bg-[#06b6d4] animate-pulse" />
                            CLINICAL REQUISITIONS · v2.0.1
                        </div>

                        <h1 className="mt-3 text-2xl md:text-3xl font-extrabold font-sans tracking-tight text-[#0f172a]">
                            Build a clean requisition before your clinic runs low.
                        </h1>

                        <p className="mt-2 text-sm md:text-base leading-relaxed text-[#475569]">
                            Track shelf coverage, convert below-par items into draft lines, and direct approval-only parts
                            to the right reviewer without turning this workspace into a public commerce page.
                        </p>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                            {PERSISTED_REQUISITIONS_STATUS_COPY[persistedRequisitionsStatus]}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                aria-describedby={SUPPLY_DRAFT_ACTION_STATUS_ID}
                                onClick={() => {
                                    trackSupplyShopAction('rebuild_from_par_levels', {
                                        below_par_count: belowParCount,
                                    });
                                    setLastDraftAction('rebuilt');
                                    setDraft(buildDefaultDraft());
                                    setServerActionResult(null);
                                    setSubmissionNotice({
                                        tone: 'info',
                                        title: 'Draft rebuilt from par levels',
                                        detail: `${belowParCount} below-par item${belowParCount === 1 ? '' : 's'} refreshed into the requisition draft.`,
                                    });
                                }}
                                aria-pressed={lastDraftAction === 'rebuilt'}
                                className={`inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] ${SUPPLYSHOP_FOCUS_RING}`}
                            >
                                <RefreshCw className="w-4 h-4 text-cyan-700" />
                                Rebuild from par levels
                            </button>
                            <button
                                type="button"
                                aria-describedby={SUPPLY_DRAFT_ACTION_STATUS_ID}
                                onClick={() => {
                                    trackSupplyShopAction('draft_cleared', {
                                        line_count: draftLines.length,
                                        draft_packs: totalDraftPacks,
                                    });
                                    setLastDraftAction('cleared');
                                    setDraft({});
                                    setServerActionResult(null);
                                    setSubmissionNotice({
                                        tone: 'info',
                                        title: 'Draft cleared',
                                        detail:
                                            draftLines.length === 0
                                                ? 'The requisition draft is already empty.'
                                                : `${draftLines.length} line${draftLines.length === 1 ? '' : 's'} removed from the requisition draft.`,
                                    });
                                }}
                                aria-pressed={lastDraftAction === 'cleared'}
                                className={`inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] ${SUPPLYSHOP_FOCUS_RING}`}
                            >
                                <ClipboardList className="w-4 h-4" />
                                Clear draft
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff]/95 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-md lg:w-72">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] text-cyan-700">
                                <Boxes className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#0f172a] break-words">Valley Wellness Clinic</p>
                                <p className="text-[11px] text-[#64748b] flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3 w-3 text-[#94a3b8]" />
                                    Central Supply Shelf · Bay 4
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-[#f1f5f9] pt-3 flex items-center justify-between text-xs">
                            <span className="text-[#64748b]">Monitored SKUs</span>
                            <span className="font-bold text-[#0f172a]">{INVENTORY_ITEMS.length} items</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-[#64748b]">Standing Cadence</span>
                            <span className="font-semibold text-cyan-700">Bi-Weekly Reset</span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 4 Operational KPI Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6 md:mb-8">
                {[
                    {
                        label: 'Below Par',
                        value: belowParCount,
                        subcopy: 'Items currently driving the reorder queue',
                        icon: AlertTriangle,
                        iconWrap: 'bg-[#f59e0b]/[0.10]',
                        iconColor: 'text-amber-700',
                    },
                    {
                        label: 'Draft Packs',
                        value: totalDraftPacks,
                        subcopy: 'Packs currently staged in the requisition',
                        icon: ShoppingBag,
                        iconWrap: 'bg-[#06b6d4]/[0.10]',
                        iconColor: 'text-cyan-700',
                    },
                    {
                        label: 'Standing Templates',
                        value: templateCount,
                        subcopy: 'Reusable replenishment templates available',
                        icon: Repeat2,
                        iconWrap: 'bg-[#6366f1]/[0.10]',
                        iconColor: 'text-indigo-700',
                    },
                    {
                        label: 'Approval Flags',
                        value: reviewCount,
                        subcopy: 'Lines that need ops or manager review',
                        icon: ShieldCheck,
                        iconWrap: 'bg-[#f43f5e]/[0.10]',
                        iconColor: 'text-rose-700',
                    },
                ].map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        {...getSupplyShopEntranceMotion(index, 0.05, prefersReducedMotion)}
                    >
                        <MetricCard {...metric} />
                    </motion.div>
                ))}
            </div>

            {/* Workspace Access Banner */}
            <section
                aria-label="Supply workspace preview status"
                className="mb-6 rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 md:mb-8 md:p-6 shadow-xs"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">
                            Workspace access
                        </p>
                        <h2
                            id="supply-workspace-support-heading"
                            className="mt-2 text-lg font-bold font-sans text-[#0f172a]"
                        >
                            Preview the supply flow, then hand live inventory access back to the real workspace.
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                            This sample page stays public so teams can review the replenishment flow, but live stock
                            sync, clinic approvals, and fulfilment still belong behind sign-in or a Hylono support
                            handoff.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={accessHref}
                            aria-describedby={SUPPLY_WORKSPACE_ACCESS_STATUS_ID}
                            onFocus={() =>
                                setWorkspaceAccessStatus(`Sign-in route selected. Opens ${accessHref}.`)
                            }
                            onClick={() => {
                                setWorkspaceAccessStatus(`Opening sign-in route ${accessHref}.`);
                                trackSupplyShopAction('sign_in_transition', {
                                    destination: accessHref,
                                });
                            }}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-colors hover:bg-[#1e293b] ${SUPPLYSHOP_FOCUS_RING}`}
                        >
                            <LogIn className="w-4 h-4" />
                            Sign in for live supply workspace
                        </Link>
                        <Link
                            href="/contact"
                            aria-describedby={SUPPLY_WORKSPACE_ACCESS_STATUS_ID}
                            onFocus={() =>
                                setWorkspaceAccessStatus('Contact route selected. Opens /contact.')
                            }
                            onClick={() => {
                                setWorkspaceAccessStatus('Opening contact route /contact.');
                                trackSupplyShopAction('contact_transition', {
                                    destination: '/contact',
                                });
                            }}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a] ${SUPPLYSHOP_FOCUS_RING}`}
                        >
                            <MessageSquare className="w-4 h-4 text-[#64748b]" />
                            Contact Hylono about supply access
                        </Link>
                    </div>
                </div>
                <p
                    id={SUPPLY_WORKSPACE_ACCESS_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={SUPPLY_WORKSPACE_ACCESS_STATUS_LABEL}
                    className="mt-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-cyan-800"
                >
                    {workspaceAccessStatus}
                </p>
            </section>

            {submissionNotice && (
                <div
                    role="status"
                    className={`mb-6 rounded-[14px] border px-5 py-4 text-sm ${
                        submissionNotice.tone === 'success'
                            ? 'border-emerald-200 bg-[#10b981]/[0.10] text-emerald-800'
                            : 'border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-800'
                    }`}
                >
                    <p className="font-bold">{submissionNotice.title}</p>
                    <p className="mt-1 text-sm/6">{submissionNotice.detail}</p>
                </div>
            )}

            {(serverActionPending || serverActionResult) && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-6 rounded-[14px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-5 py-4 text-sm text-cyan-800"
                >
                    {serverActionPending ? (
                        <p className="font-semibold">Checking private supply requisition boundary...</p>
                    ) : (
                        serverActionResult && (
                            <>
                                <p className="font-bold">
                                    {SUPPLIES_ACTION_STATUS_LABELS[serverActionResult.status]}
                                </p>
                                <p className="mt-1 text-sm/6">{serverActionResult.message}</p>
                                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-cyan-700">
                                    Future table: {serverActionResult.futureTable ?? 'none'} | Persisted:{' '}
                                    {serverActionResult.persisted ? 'yes' : 'no'}
                                </p>
                            </>
                        )
                    )}
                </div>
            )}

            {initialPersistedRequisitions.length > 0 && (
                <div className="mb-6 rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-800">
                        Authenticated supply requisition queue
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {initialPersistedRequisitions.slice(0, 3).map((requisition) => (
                            <div key={requisition.id} className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-xs">
                                <div className="font-bold text-[#0f172a]">
                                    {requisition.lineCount} lines | {requisition.totalPacks} packs
                                </div>
                                <div className="mt-1 text-[#475569]">
                                    {requisition.approvalOnlyLines} approval-only | {requisition.status}
                                </div>
                                <div className="mt-2 font-semibold uppercase tracking-wider text-cyan-700">
                                    {requisition.createdAtLabel}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_360px] gap-6">
                <div className="space-y-6">
                    <section
                        aria-label="Supply inventory signals panel"
                        className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs"
                    >
                        <div className="border-b border-[#e2e8f0] p-5 md:p-6 bg-[#ffffff]">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-[#0f172a]">Inventory signals</h2>
                                    <p className="mt-1 text-sm text-[#475569]">
                                        Search by item type or SKU, then move the right pack counts into the draft requisition.
                                    </p>
                                    <p
                                        id={INVENTORY_SEARCH_HINT_ID}
                                        className="mt-2 text-xs font-medium text-[#64748b]"
                                    >
                                        Search by item name, SKU, or category.
                                    </p>
                                </div>
                                <div
                                    role="search"
                                    aria-label="Inventory search"
                                    className="relative w-full lg:w-80"
                                >
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                                    <label htmlFor={INVENTORY_SEARCH_INPUT_ID} className="sr-only">
                                        Search inventory by item, SKU, or category
                                    </label>
                                    <input
                                        id={INVENTORY_SEARCH_INPUT_ID}
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        aria-describedby={`${INVENTORY_SEARCH_HINT_ID} ${INVENTORY_FILTER_SUMMARY_ID}`}
                                        placeholder="Search inventory"
                                        className={`min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder:text-[#94a3b8] transition-colors focus:border-cyan-500 focus:bg-[#ffffff] focus:outline-none ${SUPPLYSHOP_FOCUS_RING}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p
                                        id={INVENTORY_FILTER_SUMMARY_ID}
                                        role="status"
                                        aria-live="polite"
                                        aria-atomic="true"
                                        aria-label={SUPPLY_INVENTORY_FILTER_STATUS_LABEL}
                                        className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748b]"
                                    >
                                        {inventoryFilterStatus}
                                    </p>
                                    {hasActiveInventoryFilters ? (
                                        <p className="mt-1 text-xs text-[#64748b]">
                                            Clear the current view if you need to return to the full replenishment list.
                                        </p>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {CATEGORY_FILTERS.map((filter) => {
                                        const active = activeCategory === filter;
                                        return (
                                            <button
                                                key={filter}
                                                type="button"
                                                aria-describedby={INVENTORY_FILTER_SUMMARY_ID}
                                                onClick={() => {
                                                    trackSupplyShopAction('inventory_category_filter_selected', {
                                                        category: filter,
                                                        had_search_term: normalizedSearchTerm.length > 0,
                                                    });
                                                    setActiveCategory(filter);
                                                }}
                                                aria-pressed={active}
                                                className={`min-h-11 rounded-[9999px] px-3.5 py-1.5 text-xs font-bold transition-all ${SUPPLYSHOP_FOCUS_RING} ${
                                                    active
                                                        ? 'bg-[#0f172a] text-[#ffffff] shadow-xs'
                                                        : 'border border-[#e2e8f0] bg-[#ffffff] text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                                                }`}
                                            >
                                                {filter}
                                            </button>
                                        );
                                    })}
                                    {hasActiveInventoryFilters ? (
                                        <button
                                            type="button"
                                            aria-describedby={INVENTORY_FILTER_SUMMARY_ID}
                                            onClick={resetInventoryFilters}
                                            className={`min-h-11 rounded-[9999px] border border-[#e2e8f0] bg-[#ffffff] px-3.5 py-1.5 text-xs font-bold text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] ${SUPPLYSHOP_FOCUS_RING}`}
                                        >
                                            Clear search and filters
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 p-5 md:p-6 bg-[#f8fafc]">
                            {filteredItems.map((item, index) => {
                                const coverage = Math.min(100, Math.round((item.onHand / item.parLevel) * 100));
                                const quantity = draft[item.id] ?? 0;
                                const coverageDays = Math.max(5, Math.round((item.onHand / item.monthlyBurn) * 30));

                                return (
                                    <motion.article
                                        key={item.id}
                                        {...getSupplyShopEntranceMotion(index, 0.04, prefersReducedMotion)}
                                        className="rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all duration-200 hover:border-[#06b6d4] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                                                    {item.category}
                                                </p>
                                                <h3 className="mt-1 text-base font-bold text-[#0f172a]">{item.name}</h3>
                                                <p className="mt-1 text-xs text-[#64748b]">
                                                    SKU {item.sku} · Pack size {item.packSize}
                                                </p>
                                            </div>
                                            <InventoryStatusBadge status={item.status} />
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-3">
                                            <div className="rounded-[12px] bg-[#f8fafc] border border-[#f1f5f9] p-3 text-center">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">On hand</p>
                                                <p className="mt-1 text-lg font-extrabold text-[#0f172a]">{item.onHand}</p>
                                            </div>
                                            <div className="rounded-[12px] bg-[#f8fafc] border border-[#f1f5f9] p-3 text-center">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Par level</p>
                                                <p className="mt-1 text-lg font-extrabold text-[#0f172a]">{item.parLevel}</p>
                                            </div>
                                            <div className="rounded-[12px] bg-[#f8fafc] border border-[#f1f5f9] p-3 text-center">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Coverage</p>
                                                <p className="mt-1 text-lg font-extrabold text-[#0f172a]">{coverageDays}d</p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-xs font-semibold text-[#475569]">
                                                <span>Shelf coverage</span>
                                                <span className="font-bold text-[#0f172a]">{coverage}% of par</span>
                                            </div>
                                            <div className="mt-2 h-2 overflow-hidden rounded-[9999px] bg-[#f1f5f9]">
                                                <div
                                                    className={`h-full rounded-[9999px] ${
                                                        item.status === 'healthy'
                                                            ? 'bg-[#10b981]'
                                                            : item.status === 'reorder'
                                                                ? 'bg-[#f59e0b]'
                                                                : 'bg-[#f43f5e]'
                                                    }`}
                                                    style={{ width: `${coverage}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                                                Review path
                                            </p>
                                            <p className="mt-1 text-xs font-bold text-[#0f172a]">{item.approvalMode}</p>
                                            <p className="mt-1 text-xs leading-relaxed text-[#475569]">{item.note}</p>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-[#f1f5f9]">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                                                    Draft quantity
                                                </p>
                                                <p className="mt-0.5 text-sm font-bold text-[#0f172a]">
                                                    {quantity > 0 ? `${quantity} pack${quantity === 1 ? '' : 's'} staged` : 'Not in draft'}
                                                </p>
                                            </div>
                                            <QuantityControl
                                                itemName={item.name}
                                                value={quantity}
                                                onDecrease={() => updateDraftQuantity(item.id, quantity - 1)}
                                                onIncrease={() => updateDraftQuantity(item.id, quantity + 1)}
                                                statusId={SUPPLY_DRAFT_ACTION_STATUS_ID}
                                            />
                                        </div>

                                        <div className="mt-3 flex flex-col gap-2 text-xs text-[#64748b] sm:flex-row sm:items-center sm:justify-between">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    trackSupplyShopAction('recommended_quantity_used', {
                                                        item_id: item.id,
                                                        category: item.category,
                                                        recommended_qty: item.recommendedQty,
                                                        status: item.status,
                                                    });
                                                    updateDraftQuantity(item.id, item.recommendedQty);
                                                }}
                                                aria-label={`Use recommended draft quantity for ${item.name}`}
                                                aria-describedby={SUPPLY_DRAFT_ACTION_STATUS_ID}
                                                className={`inline-flex min-h-11 items-center gap-1 rounded-[12px] px-2.5 font-bold text-cyan-700 transition-colors hover:text-cyan-800 ${SUPPLYSHOP_FOCUS_RING}`}
                                            >
                                                Use recommended
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                            <span>Last ordered {item.lastOrder}</span>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>

                        {filteredItems.length === 0 && (
                            <div className="border-t border-[#e2e8f0] p-6 bg-[#ffffff]">
                                <p className="text-sm font-bold text-[#0f172a]">No inventory lines match this view.</p>
                                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                                    Clear the current filters, then sign in or contact Hylono if the live workspace
                                    still needs a manual stock check.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        aria-describedby={INVENTORY_FILTER_SUMMARY_ID}
                                        onClick={resetInventoryFilters}
                                        className={`inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] ${SUPPLYSHOP_FOCUS_RING}`}
                                    >
                                        Clear search and filters
                                    </button>
                                    <Link
                                        href={accessHref}
                                        aria-describedby={SUPPLY_WORKSPACE_ACCESS_STATUS_ID}
                                        onFocus={() =>
                                            setWorkspaceAccessStatus(`Sign-in route selected. Opens ${accessHref}.`)
                                        }
                                        onClick={() => {
                                            setWorkspaceAccessStatus(`Opening sign-in route ${accessHref}.`);
                                            trackSupplyShopAction('sign_in_transition', {
                                                destination: accessHref,
                                                source: 'empty_state',
                                            });
                                        }}
                                        className={`inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-colors hover:bg-[#1e293b] ${SUPPLYSHOP_FOCUS_RING}`}
                                    >
                                        Sign in for live supply workspace
                                    </Link>
                                    <Link
                                        href="/contact"
                                        aria-describedby={SUPPLY_WORKSPACE_ACCESS_STATUS_ID}
                                        onFocus={() =>
                                            setWorkspaceAccessStatus('Contact route selected. Opens /contact.')
                                        }
                                        onClick={() => {
                                            setWorkspaceAccessStatus('Opening contact route /contact.');
                                            trackSupplyShopAction('contact_transition', {
                                                destination: '/contact',
                                                source: 'empty_state',
                                            });
                                        }}
                                        className={`inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] ${SUPPLYSHOP_FOCUS_RING}`}
                                    >
                                        Contact Hylono about supply access
                                    </Link>
                                </div>
                            </div>
                        )}
                    </section>

                    <section
                        aria-label="Supply recent requisitions panel"
                        className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs"
                    >
                        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4 md:px-6">
                            <div>
                                <h2 className="text-lg font-bold font-sans text-[#0f172a]">Recent requisitions</h2>
                                <p className="mt-1 text-sm text-[#64748b]">
                                    Operational status only. Final fulfilment still goes through partner review when required.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 p-5 sm:hidden bg-[#f8fafc]">
                            {recentRequisitions.map((row) => (
                                <article
                                    key={row.id}
                                    className="rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-xs"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-[#0f172a]">
                                                {row.label}
                                            </p>
                                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">
                                                {row.id}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-flex shrink-0 rounded-[9999px] px-2.5 py-1 text-xs font-bold ${requisitionStatusClasses[row.status]}`}
                                        >
                                            {row.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-[12px] bg-[#f8fafc] border border-[#f1f5f9] p-3">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
                                                Submitted
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                                                {row.submittedAt}
                                            </p>
                                        </div>
                                        <div className="rounded-[12px] bg-[#f8fafc] border border-[#f1f5f9] p-3">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
                                                Lines
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                                                {row.lines}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full min-w-[560px] text-left">
                                <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b] border-b border-[#e2e8f0]">
                                    <tr>
                                        <th className="px-5 py-3 md:px-6">Draft</th>
                                        <th className="px-5 py-3 md:px-6">Submitted</th>
                                        <th className="px-5 py-3 md:px-6">Lines</th>
                                        <th className="px-5 py-3 md:px-6">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1f5f9]">
                                    {recentRequisitions.map((row) => (
                                        <tr key={row.id} className="transition-colors hover:bg-[#f8fafc]">
                                            <td className="px-5 py-4 md:px-6">
                                                <div>
                                                    <p className="text-sm font-bold text-[#0f172a]">{row.label}</p>
                                                    <p className="mt-1 text-xs text-[#94a3b8] uppercase tracking-[0.18em]">{row.id}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 md:px-6 text-sm text-[#475569]">{row.submittedAt}</td>
                                            <td className="px-5 py-4 md:px-6 text-sm font-bold text-[#0f172a]">{row.lines}</td>
                                            <td className="px-5 py-4 md:px-6">
                                                <span className={`inline-flex rounded-[9999px] px-2.5 py-1 text-xs font-bold ${requisitionStatusClasses[row.status]}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="sticky top-20 rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">
                                    Draft requisition
                                </p>
                                <h2 className="mt-1 text-lg font-bold font-sans text-[#0f172a]">Ready for partner review</h2>
                            </div>
                            <span className="rounded-[9999px] bg-[#f1f5f9] px-3 py-1 text-xs font-bold text-[#334155]">
                                {draftLines.length} lines
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            {draftLines.length > 0 ? (
                                draftLines.map((item) => (
                                    <div key={item.id} className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-bold text-[#0f172a]">{item.name}</p>
                                                <p className="mt-1 text-xs text-[#64748b]">
                                                    {item.quantity} pack{item.quantity === 1 ? '' : 's'} · {item.approvalMode}
                                                </p>
                                            </div>
                                            <Package className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-[14px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-center">
                                    <p className="text-sm font-bold text-[#0f172a]">No lines are staged yet.</p>
                                    <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                                        Use the inventory cards, a standing template, or the par-level reset to build a
                                        draft before sending it for review.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-[14px] bg-[#f8fafc] border border-[#e2e8f0] p-3.5 text-center">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">Packs</p>
                                <p className="mt-1 text-2xl font-extrabold text-[#0f172a]">{totalDraftPacks}</p>
                            </div>
                            <div className="rounded-[14px] bg-[#f8fafc] border border-[#e2e8f0] p-3.5 text-center">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">Approval lines</p>
                                <p className="mt-1 text-2xl font-extrabold text-[#0f172a]">{approvalOnlyLines}</p>
                            </div>
                        </div>

                        <div
                            aria-label="Supply approval readiness bridge"
                            className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
                        >
                            <div className="flex items-start gap-3">
                                <span className="rounded-[10px] bg-[#06b6d4]/[0.10] p-2 text-cyan-700">
                                    <ShieldCheck className="w-4 h-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-cyan-800">Approval readiness</p>
                                    <p className="mt-1 text-base font-extrabold text-[#0f172a]">{managerApprovalStatus}</p>
                                    <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                                        {manualEvidenceSummary}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 grid gap-3">
                                <dl className="grid gap-2 sm:grid-cols-2">
                                    {approvalReadinessFacts.map((fact) => (
                                        <div
                                            key={fact.label}
                                            aria-label={`${fact.label}: ${fact.value}`}
                                            className="rounded-[10px] bg-[#ffffff] border border-[#e2e8f0] p-2.5"
                                        >
                                            <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                                                {fact.label}
                                            </dt>
                                            <dd className="mt-1 text-sm font-extrabold text-[#0f172a]">{fact.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                {approvalReadinessItems.map((item) => (
                                    <div key={item.label} className="rounded-[10px] bg-[#ffffff] border border-[#e2e8f0] p-2.5">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                                                {item.label}
                                            </p>
                                            <p className="text-sm font-extrabold text-[#0f172a]">{item.value}</p>
                                        </div>
                                        <p className="mt-1 text-xs leading-relaxed text-[#475569]">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] p-4">
                            <p className="text-sm font-bold text-cyan-900">Review note</p>
                            <p className="mt-1 text-xs leading-relaxed text-cyan-900">
                                Approval-only lines stay in review rather than auto-submitting. This keeps the workspace
                                operational without exposing unsupported pricing or fulfilment promises.
                            </p>
                        </div>

                        <p
                            id={SUPPLY_DRAFT_ACTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            className="mt-5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#475569]"
                        >
                            {draftActionStatus}
                        </p>

                        <div className="mt-5 flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handleSendDraftForReview}
                                aria-describedby={SUPPLY_DRAFT_ACTION_STATUS_ID}
                                disabled={draftLines.length === 0}
                                className={`inline-flex items-center justify-center gap-2 min-h-11 rounded-[14px] bg-[#0f172a] px-4 py-3 text-sm font-semibold text-[#ffffff] shadow-xs transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] ${SUPPLYSHOP_FOCUS_RING}`}
                            >
                                <ClipboardList className="w-4 h-4" />
                                Send draft for review
                            </button>
                            <button
                                type="button"
                                aria-describedby={SUPPLY_DRAFT_ACTION_STATUS_ID}
                                onClick={() => {
                                    trackSupplyShopAction('draft_reset', {
                                        line_count: draftLines.length,
                                    });
                                    setDraft(buildDefaultDraft());
                                    setServerActionResult(null);
                                    setSubmissionNotice({
                                        tone: 'info',
                                        title: 'Draft reset',
                                        detail: `${belowParCount} below-par item${belowParCount === 1 ? '' : 's'} restored to the draft.`,
                                    });
                                }}
                                className={`inline-flex items-center justify-center gap-2 min-h-11 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a] ${SUPPLYSHOP_FOCUS_RING}`}
                            >
                                <RefreshCw className="w-4 h-4 text-cyan-700" />
                                Reset draft
                            </button>
                        </div>
                    </div>

                    <section
                        aria-label="Supply operations review queue"
                        className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs"
                    >
                        <div className="flex items-center gap-2">
                            <Clock3 className="w-4 h-4 text-amber-600" />
                            <h3 className="text-base font-bold text-[#0f172a]">Ops queue</h3>
                        </div>
                        <p className="mt-1 text-xs text-[#64748b]">
                            These lines need a human checkpoint before the draft can move forward cleanly.
                        </p>
                        <div className="mt-4 space-y-3">
                            {INVENTORY_ITEMS.filter((item) => item.status !== 'healthy').map((item) => (
                                <div key={item.id} className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-[#0f172a]">{item.name}</p>
                                            <p className="mt-1 text-xs text-[#64748b]">
                                                {item.onHand} on hand · par {item.parLevel} · {item.approvalMode}
                                            </p>
                                        </div>
                                        <InventoryStatusBadge status={item.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        aria-label="Supply standing template launcher"
                        className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs"
                    >
                        <div className="flex items-center gap-2">
                            <Repeat2 className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-base font-bold text-[#0f172a]">Standing templates</h3>
                        </div>
                        <p className="mt-1 text-xs text-[#64748b]">
                            Reusable replenishment patterns for fast requisition building.
                        </p>
                        <div className="mt-4 space-y-3">
                            {STANDING_TEMPLATES.map((template) => (
                                <div key={template.id} className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-[#0f172a]">{template.name}</p>
                                            <p className="mt-1 text-xs text-[#64748b]">
                                                {template.cadence} · {template.itemCount} items · owner {template.owner}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleApplyTemplate(template)}
                                            aria-label={`Use ${template.name} template`}
                                            aria-describedby={SUPPLY_DRAFT_ACTION_STATUS_ID}
                                            className={`inline-flex min-h-11 items-center gap-1 rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] px-3 text-xs font-bold text-cyan-700 shadow-xs transition-colors hover:bg-[#f8fafc] ${SUPPLYSHOP_FOCUS_RING}`}
                                        >
                                            Use
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </PartnerLayout>
    );
};

export default SupplyShop;

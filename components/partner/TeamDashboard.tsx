'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    Users,
    TrendingUp,
    Award,
    AlertTriangle,
    Search,
    Filter,
    Mail,
    ChevronRight,
    Clock,
    Zap,
    MoreHorizontal,
    Bell,
    ShieldCheck,
    Building2,
    LogIn,
    MessageSquare,
    Sparkles,
} from 'lucide-react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';
import { PartnerLayout } from './PartnerLayout';
import { SkillRadarChart } from './SkillRadarChart';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import analytics from '@/src/lib/analytics';
import type {
    NexusTeamHandoffActionResult,
    NexusTeamPersistedHandoff,
    NexusTeamServerActionStatus,
} from '@/src/actions/nexusTeamActionCore';

type TeamMemberStatus = 'Active' | 'In Training' | 'Needs Review';
type ReadinessPriority = 'high' | 'medium';
type TeamFilter = 'All' | TeamMemberStatus;

const TEAM_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.team.href;
const accessHref = buildLoginRedirectPath('/account');

interface TeamMember {
    id: number;
    name: string;
    role: string;
    status: TeamMemberStatus;
    progress: number;
    readiness: string;
    lastActive: string;
    checkpoints: number;
    station: string;
    shift: string;
}

interface ReadinessHandoff {
    id: number;
    user: string;
    issue: string;
    priority: ReadinessPriority;
}

const TEAM_MEMBERS: TeamMember[] = [
    {
        id: 1,
        name: 'Operator 01',
        role: 'Operator',
        status: 'Active',
        progress: 85,
        readiness: 'Ready',
        lastActive: '2h ago',
        checkpoints: 2450,
        station: 'Chamber Suite 1 (HBOT)',
        shift: 'Morning · 08:00 – 16:00',
    },
    {
        id: 2,
        name: 'Operator 02',
        role: 'Operator',
        status: 'In Training',
        progress: 45,
        readiness: 'In onboarding',
        lastActive: '1d ago',
        checkpoints: 850,
        station: 'Suite 2 (Hydrogen & PEMF)',
        shift: 'Midday · 10:00 – 18:00',
    },
    {
        id: 3,
        name: 'Front Desk 01',
        role: 'Front Desk',
        status: 'Needs Review',
        progress: 15,
        readiness: 'Supervisor review',
        lastActive: '5d ago',
        checkpoints: 200,
        station: 'Intake Reception & Desk',
        shift: 'Morning · 07:30 – 15:30',
    },
    {
        id: 4,
        name: 'Manager 01',
        role: 'Manager',
        status: 'Active',
        progress: 95,
        readiness: 'Coordinator',
        lastActive: '10m ago',
        checkpoints: 4200,
        station: 'Clinical Operations Hub',
        shift: 'Day · 08:30 – 17:00',
    },
];

const READINESS_HANDOFFS: ReadinessHandoff[] = [
    {
        id: 1,
        user: 'Front Desk 01',
        issue: 'Safety handoff review due',
        priority: 'high',
    },
    {
        id: 2,
        user: 'Operator 02',
        issue: 'Support escalation note pending',
        priority: 'medium',
    },
];

const TEAM_FILTERS: TeamFilter[] = ['All', 'Active', 'In Training', 'Needs Review'];

const TEAM_SKILLS = [
    { name: 'Operations', score: 92, icon: 'OP' },
    { name: 'Safety', score: 88, icon: 'SF' },
    { name: 'Client Care', score: 95, icon: 'CC' },
    { name: 'Technical', score: 72, icon: 'TE' },
    { name: 'Sales', score: 65, icon: 'SL' },
];

const RECENT_ACTIVITY = [
    { user: 'Operator 01', action: 'completed', item: 'readiness review', time: '10m ago' },
    { user: 'Manager 01', action: 'updated', item: 'team handoff note', time: '1h ago' },
    { user: 'Operator 02', action: 'started', item: 'support handoff review', time: '3h ago' },
];

const getRoleBadgeStyle = (role: string) => {
    if (role === 'Manager') {
        return 'border border-[#6366f1]/[0.20] bg-[#6366f1]/[0.10] text-indigo-700';
    }
    if (role === 'Front Desk') {
        return 'border border-[#10b981]/[0.20] bg-[#10b981]/[0.10] text-emerald-700';
    }
    return 'border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700';
};

const STATUS_STYLES: Record<TeamMemberStatus, string> = {
    Active: 'border border-[#10b981]/[0.20] bg-[#10b981]/[0.10] text-emerald-700',
    'In Training': 'border border-[#0284c7]/[0.20] bg-[#0284c7]/[0.10] text-sky-700',
    'Needs Review': 'border border-[#f59e0b]/[0.20] bg-[#f59e0b]/[0.10] text-amber-700',
};

const MODULE_OPTIONS = [
    'Safety handoff review',
    'Support escalation contact path',
    'Client intake readiness',
] as const;

const TARGET_OPTIONS = ['All', 'Operators', 'New hires'] as const;

type ModuleOption = (typeof MODULE_OPTIONS)[number];
type TargetOption = (typeof TARGET_OPTIONS)[number];
type NexusTeamHandoffActionRunner = (
    prevState: NexusTeamHandoffActionResult,
    formData: FormData
) => Promise<NexusTeamHandoffActionResult>;
type PersistedHandoffsStatus =
    | 'loaded'
    | 'database_error'
    | 'database_not_configured'
    | 'auth_context_missing'
    | 'role_not_allowed';

const INITIAL_NEXUS_TEAM_ACTION_STATE: NexusTeamHandoffActionResult = {
    success: false,
    status: 'auth_required',
    message: 'Team handoff boundary has not been requested yet.',
    persisted: false,
    futureTable: null,
    persistenceMode: 'blocked',
};

const TEAM_PREVIEW_ACTION_STATUS_ID = 'team-preview-action-status';
const TEAM_HANDOFF_ACTION_STATUS_ID = 'team-handoff-action-status';
const TEAM_ROSTER_ACTION_STATUS_ID = 'team-roster-action-status';
const TEAM_PREVIEW_ACTION_READY_COPY =
    'Ready to review sample team actions. Live staff records, reminders, and handoffs are not changed from preview actions.';

const TEAM_ACTION_STATUS_LABELS: Record<NexusTeamServerActionStatus, string> = {
    validation_error: 'Input check failed',
    auth_required: 'Authentication required',
    service_profile_required: 'Service profile required',
    role_not_allowed: 'Role not allowed',
    persistence_error: 'Persistence failed',
    private_write_ready: 'Private write boundary ready',
};

const PERSISTED_HANDOFF_STATUS_COPY: Record<PersistedHandoffsStatus, string> = {
    loaded: 'Authenticated team handoff history is connected for signed-in service profiles.',
    database_error: 'Authenticated team handoff storage could not load, so this screen keeps sample handoffs.',
    database_not_configured: 'Authenticated team handoff storage is ready for deployment database configuration.',
    auth_context_missing: 'Authenticated team handoff storage waits for sign-in and a verified Nexus service profile.',
    role_not_allowed: 'Team handoff history is manager-only for this Nexus service role.',
};

const formatTeamCheckpoints = (checkpoints: number) =>
    new Intl.NumberFormat('en-US').format(checkpoints);

interface TeamDashboardProps {
    createHandoffAction?: NexusTeamHandoffActionRunner;
    initialPersistedHandoffs?: NexusTeamPersistedHandoff[];
    persistedHandoffsStatus?: PersistedHandoffsStatus;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({
    createHandoffAction,
    initialPersistedHandoffs = [],
    persistedHandoffsStatus = 'auth_context_missing',
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TeamFilter>('All');
    const [moduleName, setModuleName] = useState<ModuleOption>(MODULE_OPTIONS[0]);
    const [targetAudience, setTargetAudience] = useState<TargetOption>(TARGET_OPTIONS[0]);
    const [serverActionResult, setServerActionResult] =
        useState<NexusTeamHandoffActionResult | null>(null);
    const [serverActionPending, setServerActionPending] = useState(false);
    const [openMemberActionId, setOpenMemberActionId] = useState<number | null>(null);
    const [dismissedHandoffPreview, setDismissedHandoffPreview] = useState(false);
    const [remindedHandoffIds, setRemindedHandoffIds] = useState<Set<number>>(
        () => new Set()
    );
    const [previewActionNotice, setPreviewActionNotice] = useState(
        TEAM_PREVIEW_ACTION_READY_COPY
    );
    const memberActionTriggerRef = useRef<HTMLButtonElement | null>(null);

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredTeamMembers = TEAM_MEMBERS.filter((member) => {
        const matchesSearch =
            normalizedSearchTerm.length === 0 ||
            [member.name, member.role, member.status, member.readiness, member.station, member.shift]
                .join(' ')
                .toLowerCase()
                .includes(normalizedSearchTerm);

        const matchesStatus =
            statusFilter === 'All' || member.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const readyStaffCount = TEAM_MEMBERS.filter(
        (member) => member.status === 'Active'
    ).length;
    const averageProgress = Math.round(
        TEAM_MEMBERS.reduce((total, member) => total + member.progress, 0) /
            TEAM_MEMBERS.length
    );
    const handoffReadinessRate = Math.round(
        ((TEAM_MEMBERS.length - READINESS_HANDOFFS.length) / TEAM_MEMBERS.length) * 100
    );
    const reviewNeededCount = TEAM_MEMBERS.filter(
        (member) => member.status === 'Needs Review'
    ).length;
    const trainingCount = TEAM_MEMBERS.filter(
        (member) => member.status === 'In Training'
    ).length;
    const highPriorityHandoffCount = READINESS_HANDOFFS.filter(
        (handoff) => handoff.priority === 'high'
    ).length;
    const openHandoffCount = dismissedHandoffPreview ? 0 : READINESS_HANDOFFS.length;
    const visibleHighPriorityHandoffCount = dismissedHandoffPreview
        ? 0
        : highPriorityHandoffCount;
    const handoffBridgeStatus =
        visibleHighPriorityHandoffCount > 0
            ? 'Supervisor review required'
            : trainingCount > 0
              ? 'Training follow-up queued'
              : 'Ready for private handoff check';
    const handoffBridgeItems = [
        {
            label: 'Open handoffs',
            value: openHandoffCount.toString(),
            detail: `${openHandoffCount} sample handoff alert${openHandoffCount === 1 ? '' : 's'} visible in preview.`,
            ariaLabel: `Open team handoffs: ${openHandoffCount}`,
        },
        {
            label: 'Staff needing review',
            value: reviewNeededCount.toString(),
            detail: `${reviewNeededCount} placeholder staff record${reviewNeededCount === 1 ? '' : 's'} marked for supervisor review.`,
            ariaLabel: `Team staff needing review: ${reviewNeededCount}`,
        },
        {
            label: 'High priority',
            value: visibleHighPriorityHandoffCount.toString(),
            detail:
                'High-priority reminders stay preview-only until authenticated manager action.',
            ariaLabel: `High priority team handoffs: ${visibleHighPriorityHandoffCount}`,
        },
        {
            label: 'Privacy',
            value: 'Preview only',
            detail:
                'Staff identities and authenticated handoff rows stay outside this bridge.',
            ariaLabel: 'Team handoff privacy: Preview only',
        },
    ];
    const filtersApplied =
        normalizedSearchTerm.length > 0 || statusFilter !== 'All';
    const teamRosterActionStatusMessage = `Showing ${filteredTeamMembers.length} of ${TEAM_MEMBERS.length} sample team members. Filter: ${
        statusFilter === 'All' ? 'All statuses' : statusFilter
    }. Search: ${normalizedSearchTerm.length > 0 ? searchTerm.trim() : 'no search term'}.`;
    const openMemberAction =
        openMemberActionId === null
            ? null
            : TEAM_MEMBERS.find((member) => member.id === openMemberActionId) ?? null;

    const closeMemberActionDetail = useCallback(() => {
        setOpenMemberActionId(null);
        setPreviewActionNotice(
            'Selected team action detail closed in preview. Live staff records were not changed.'
        );
        window.setTimeout(() => memberActionTriggerRef.current?.focus(), 0);
    }, []);

    useEffect(() => {
        if (openMemberActionId === null) {
            return undefined;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            event.preventDefault();
            closeMemberActionDetail();
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [closeMemberActionDetail, openMemberActionId]);

    const clearFilters = () => {
        analytics.capture('nexus_team_route_filter_reset', {
            route: TEAM_ROUTE_HREF,
            active_status_filter: statusFilter,
            had_search_term: normalizedSearchTerm.length > 0,
        });
        setSearchTerm('');
        setStatusFilter('All');
    };

    const handleStatusFilterChange = (nextFilter: TeamFilter) => {
        analytics.capture('nexus_team_route_filter_changed', {
            route: TEAM_ROUTE_HREF,
            filter: nextFilter,
            had_search_term: normalizedSearchTerm.length > 0,
        });
        setStatusFilter(nextFilter);
    };

    const handleOpenMemberActions = (
        member: TeamMember,
        trigger: HTMLButtonElement | null
    ) => {
        memberActionTriggerRef.current = trigger;
        analytics.capture('nexus_team_member_action_opened', {
            route: TEAM_ROUTE_HREF,
            member_id: String(member.id),
            status: member.status,
            preview_record: true,
        });
        setOpenMemberActionId(member.id);
        setPreviewActionNotice(
            `${member.name} preview actions opened. Sign in before changing live staff records.`
        );
    };

    const handleReminderClick = (alert: ReadinessHandoff) => {
        analytics.capture('nexus_team_alert_action_clicked', {
            route: TEAM_ROUTE_HREF,
            alert_id: String(alert.id),
            priority: alert.priority,
            preview_record: true,
        });
        setRemindedHandoffIds((current) => new Set(current).add(alert.id));
        setPreviewActionNotice(
            `Sample reminder queued for handoff ${alert.id}. Sign in before sending live team reminders.`
        );
    };

    const handleDismissAll = () => {
        analytics.capture('nexus_team_alert_action_clicked', {
            route: TEAM_ROUTE_HREF,
            action: 'dismiss_all',
            alert_count: READINESS_HANDOFFS.length,
            preview_record: true,
        });
        setDismissedHandoffPreview(true);
        setPreviewActionNotice(
            `${READINESS_HANDOFFS.length} sample handoff alerts dismissed in preview. Live alerts were not changed.`
        );
    };

    const handleModuleSelect = (module: ModuleOption) => {
        setModuleName(module);
        setPreviewActionNotice(
            `${module} sample handoff selected. Sign in before assigning training or changing live records.`
        );
    };

    const handleTargetSelect = (target: TargetOption) => {
        analytics.capture('nexus_team_assignment_target_selected', {
            route: TEAM_ROUTE_HREF,
            target,
        });
        setTargetAudience(target);
        setPreviewActionNotice(
            `${target} sample handoff target selected. Sign in before assigning training or changing live records.`
        );
    };

    const buildHandoffActionFormData = () => {
        const formData = new FormData();
        formData.set('moduleName', moduleName);
        formData.set('targetAudience', targetAudience);
        return formData;
    };

    const runTeamHandoffBoundary = async (
        runner: NexusTeamHandoffActionRunner | undefined,
        formData: FormData
    ) => {
        if (!runner) {
            return;
        }

        setServerActionPending(true);
        setServerActionResult(null);

        try {
            const result = await runner(INITIAL_NEXUS_TEAM_ACTION_STATE, formData);
            setServerActionResult(result);
        } catch {
            setServerActionResult({
                success: false,
                status: 'validation_error',
                message: 'Team handoff boundary could not be checked from this browser preview.',
                persisted: false,
                futureTable: null,
                persistenceMode: 'blocked',
            });
        } finally {
            setServerActionPending(false);
        }
    };

    const handleSendAssignment = () => {
        analytics.capture('nexus_team_assignment_cta_clicked', {
            route: TEAM_ROUTE_HREF,
            module: moduleName,
            target: targetAudience,
            preview_record: true,
            open_handoff_count: openHandoffCount,
            high_priority_handoff_count: visibleHighPriorityHandoffCount,
            staff_needing_review_count: reviewNeededCount,
            handoff_readiness_status: handoffBridgeStatus,
            readiness_rate: handoffReadinessRate,
        });
        void runTeamHandoffBoundary(createHandoffAction, buildHandoffActionFormData());
    };

    return (
        <PartnerLayout title="Team Management">
            {/* Semantic public route boundary note */}
            <div
                role="note"
                aria-label="Nexus public route boundary: sample workspace tour without live clinic records"
                className="sr-only"
            >
                Sample workspace tour without live clinic records. No live clinic records are shown.
                Choose a module. Move to account access. Escalate setup or support.
            </div>

            <div className="space-y-8 pb-12">
                {/* 01. GRAND CLINICAL HERO BANNER */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    aria-label="Team workspace preview status"
                    className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs sm:p-8"
                >
                    {/* Background Clinic Interior Photo */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <Image
                            src="/images/nexus/nexus-hero-clinic.jpg"
                            alt="Valley Wellness Clinic team operations suite"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-right-top opacity-20 md:opacity-25"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff] via-[#ffffff]/95 to-[#ffffff]/50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-[#06b6d4] animate-pulse" />
                                OPERATOR WORKSPACE · TEAM OPS & READINESS
                            </div>

                            <h1 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl md:text-4xl">
                                Review sample team readiness before live workspace access.
                            </h1>

                            <p className="mt-2 text-sm leading-relaxed text-[#475569] sm:text-base">
                                This team screen uses neutral placeholder staff labels until
                                authenticated staff records are connected to Nexus.
                                Review station rosters, shift coverage, team enablement, and readiness protocols for Valley Wellness Clinic.
                            </p>

                            <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-800">
                                <ShieldCheck className="h-3.5 w-3.5 text-cyan-700" />
                                {PERSISTED_HANDOFF_STATUS_COPY[persistedHandoffsStatus]}
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href={accessHref}
                                    aria-describedby={TEAM_PREVIEW_ACTION_STATUS_ID}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Sign in to account
                                </Link>

                                <Link
                                    href="/contact"
                                    aria-describedby={TEAM_PREVIEW_ACTION_STATUS_ID}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-5 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    <MessageSquare className="h-4 w-4 text-[#64748b]" />
                                    Contact Hylono
                                </Link>
                            </div>
                        </div>

                        {/* Facility Shift Card */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff]/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-md lg:w-72">
                            <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-[#f1f5f9]">
                                    <Image
                                        src="/images/nexus/clinic-valley-thumb.jpg"
                                        alt="Valley Wellness Clinic facility"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[#0f172a] break-words">
                                        Valley Wellness Clinic
                                    </p>
                                    <p className="text-[11px] text-[#64748b] flex items-center gap-1 mt-0.5">
                                        <Building2 className="h-3 w-3 text-[#94a3b8]" />
                                        Main facility · Warsaw, PL
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-[#f1f5f9] pt-3">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                    <span className="h-2 w-2 rounded-[9999px] bg-[#10b981]" />
                                    Shift Alpha Active
                                </span>
                                <span className="text-[11px] font-semibold text-cyan-700">
                                    4 Stations
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 02. ANNOUNCEMENT NOTICE STATUS */}
                <div
                    id={TEAM_PREVIEW_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label="Team preview action status"
                    className="rounded-[14px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.08] p-3 text-sm font-semibold text-cyan-900"
                >
                    {previewActionNotice}
                </div>

                {/* 03. 4 OPERATIONAL KPI CARDS */}
                <section aria-label="Team Operational Metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                    {[
                        {
                            label: 'Team Size',
                            value: TEAM_MEMBERS.length.toString(),
                            subtext: '4 active operators',
                            icon: Users,
                            iconColor: 'text-cyan-700',
                            iconBg: 'bg-[#06b6d4]/[0.10]',
                        },
                        {
                            label: 'Ready Staff',
                            value: readyStaffCount.toString(),
                            subtext: 'Fully qualified',
                            icon: Award,
                            iconColor: 'text-emerald-700',
                            iconBg: 'bg-[#10b981]/[0.10]',
                        },
                        {
                            label: 'Avg. Progress',
                            value: `${averageProgress}%`,
                            subtext: 'Core modules passed',
                            icon: Zap,
                            iconColor: 'text-amber-700',
                            iconBg: 'bg-[#f59e0b]/[0.10]',
                        },
                        {
                            label: 'Reviewed',
                            value: `${handoffReadinessRate}%`,
                            subtext: 'Handoff clear rate',
                            icon: TrendingUp,
                            iconColor: 'text-purple-700',
                            iconBg: 'bg-[#8b5cf6]/[0.10]',
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                                    {stat.label}
                                </span>
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-[12px] md:h-10 md:w-10 ${stat.iconBg} ${stat.iconColor}`}
                                >
                                    <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                            </div>
                            <div className="mt-3 text-2xl font-extrabold tracking-tight text-[#0f172a] md:text-3xl">
                                {stat.value}
                            </div>
                            <div className="mt-1 text-xs text-[#64748b]">
                                {stat.subtext}
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* 04. TEAM HANDOFF READINESS BRIDGE */}
                <section
                    aria-label="Team handoff readiness bridge"
                    className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#06b6d4]/[0.10] text-cyan-700">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                    Team handoff readiness
                                </p>
                                <h2 className="mt-1 font-sans text-xl font-extrabold text-[#0f172a]">
                                    {handoffBridgeStatus}
                                </h2>
                                <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-[#64748b] sm:text-sm">
                                    Sample staff labels stay in preview; private handoffs still
                                    require authenticated manager/admin storage before live
                                    reminders or assignments.
                                </p>
                            </div>
                        </div>
                        <div
                            aria-label={`Team readiness rate: ${handoffReadinessRate}% reviewed`}
                            className="inline-flex shrink-0 items-center justify-center rounded-[14px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-4 py-2.5 text-sm font-bold text-cyan-800 shadow-xs"
                        >
                            {handoffReadinessRate}% reviewed
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {handoffBridgeItems.map((item) => (
                            <div
                                key={item.label}
                                aria-label={item.ariaLabel}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                    {item.label}
                                </p>
                                <p className="mt-1.5 text-2xl font-extrabold text-[#0f172a]">
                                    {item.value}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                    {item.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 05. 2-COLUMN MAIN WORKSPACE */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN: Roster & Snapshot (2 cols) */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Team Roster Panel */}
                        <section
                            aria-label="Team staff readiness roster"
                            className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs"
                        >
                            <div className="flex flex-col items-start justify-between gap-3 border-b border-[#f1f5f9] p-4 sm:flex-row sm:items-center sm:p-6">
                                <div>
                                    <h2 className="font-sans text-base font-bold text-[#0f172a]">Staff readiness</h2>
                                    <p className="text-xs text-[#64748b] mt-0.5">Operator shift stations and onboarding progress</p>
                                </div>
                                <div className="flex w-full items-center gap-2 sm:w-auto md:gap-3">
                                    <div className="relative flex-1 sm:flex-initial">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                        <input
                                            type="text"
                                            aria-label="Search team members"
                                            aria-describedby={TEAM_ROSTER_ACTION_STATUS_ID}
                                            placeholder="Search staff or station..."
                                            className="min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] py-2 pl-9 pr-4 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 sm:w-auto"
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(event.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="relative shrink-0">
                                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                        <select
                                            className="min-h-11 appearance-none rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] py-2 pl-9 pr-8 text-xs font-semibold text-[#0f172a] focus:border-cyan-500 focus:bg-[#ffffff] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                            value={statusFilter}
                                            onChange={(event) =>
                                                handleStatusFilterChange(event.target.value as TeamFilter)
                                            }
                                            aria-label="Filter staff by status"
                                            aria-describedby={TEAM_ROSTER_ACTION_STATUS_ID}
                                        >
                                            {TEAM_FILTERS.map((filter) => (
                                                <option key={filter} value={filter}>
                                                    {filter === 'All'
                                                        ? 'All statuses'
                                                        : filter}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div
                                id={TEAM_ROSTER_ACTION_STATUS_ID}
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                aria-label="Team roster filter action status"
                                className="sr-only"
                            >
                                {teamRosterActionStatusMessage}
                            </div>

                            {/* Mobile Roster Cards */}
                            <div className="space-y-3 p-4 sm:hidden">
                                {filteredTeamMembers.length > 0 ? (
                                    filteredTeamMembers.map((member) => (
                                        <article
                                            key={member.id}
                                            className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-xs"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#cbd5e1] bg-gradient-to-br from-[#ffffff] to-[#f8fafc] text-xs font-bold font-mono text-[#0f172a] shadow-2xs">
                                                        {member.name
                                                            .split(' ')
                                                            .map((part) => part[0])
                                                            .join('')}
                                                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-[9999px] ring-2 ring-[#ffffff] ${
                                                            member.status === 'Active'
                                                                ? 'bg-[#10b981]'
                                                                : member.status === 'In Training'
                                                                  ? 'bg-[#06b6d4]'
                                                                  : 'bg-[#f59e0b]'
                                                        }`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-sans break-words text-sm font-bold text-[#0f172a]">
                                                            {member.name}
                                                        </h3>
                                                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                            <span className={`inline-flex rounded-[6px] px-2 py-0.5 text-[10px] font-bold uppercase ${getRoleBadgeStyle(member.role)}`}>
                                                                {member.role}
                                                            </span>
                                                            <span className="text-[11px] text-[#64748b]">
                                                                · {member.lastActive}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex shrink-0 rounded-[8px] px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_STYLES[member.status]}`}
                                                >
                                                    {member.status}
                                                </span>
                                            </div>

                                            <div className="mt-2 text-[11px] text-[#64748b]">
                                                <span className="font-semibold text-[#334155]">{member.station}</span> ({member.shift})
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
                                                <div className="rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] p-2.5">
                                                    <p className="font-semibold uppercase tracking-wider text-[10px] text-[#64748b]">
                                                        Readiness
                                                    </p>
                                                    <p className="mt-0.5 text-xs font-bold text-[#0f172a]">
                                                        {member.readiness}
                                                    </p>
                                                </div>
                                                <div className="rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] p-2.5">
                                                    <p className="font-semibold uppercase tracking-wider text-[10px] text-[#64748b]">
                                                        Checks
                                                    </p>
                                                    <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-[#0f172a]">
                                                        <Zap className="h-3 w-3 text-amber-500" />
                                                        {formatTeamCheckpoints(member.checkpoints)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] p-2.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold uppercase tracking-wider text-[10px] text-[#64748b]">
                                                        Course Progress
                                                    </span>
                                                    <span className="font-bold text-[#0f172a]">
                                                        {member.progress}%
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-[9999px] bg-[#f1f5f9]">
                                                    <div
                                                        className="h-full rounded-[9999px] bg-emerald-500"
                                                        style={{
                                                            width: `${member.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="rounded-[14px] border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-4 py-8 text-center">
                                        <p className="text-sm font-semibold text-[#0f172a]">
                                            No team members match the current filters.
                                        </p>
                                        <p className="mt-1 text-xs text-[#64748b]">
                                            Adjust the search term or status filter to restore the
                                            roster.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Roster Table */}
                            <div className="hidden overflow-x-auto sm:block">
                                <table className="w-full min-w-[600px] text-left">
                                    <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                        <tr>
                                            <th className="px-4 py-3.5 md:px-6">Member</th>
                                            <th className="px-4 py-3.5 md:px-6">Role & Station</th>
                                            <th className="px-4 py-3.5 md:px-6">Status</th>
                                            <th className="px-4 py-3.5 md:px-6">Course Progress</th>
                                            <th className="hidden px-4 py-3.5 md:px-6 sm:table-cell">Checks</th>
                                            <th className="px-4 py-3.5 text-right md:px-6" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1f5f9]">
                                        {filteredTeamMembers.length > 0 ? (
                                            filteredTeamMembers.map((member) => (
                                                <tr
                                                    key={member.id}
                                                    className="transition-colors hover:bg-[#f8fafc]"
                                                >
                                                    <td className="px-4 py-3.5 md:px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#cbd5e1] bg-gradient-to-br from-[#ffffff] to-[#f8fafc] text-xs font-bold font-mono text-[#0f172a] shadow-2xs">
                                                                {member.name
                                                                    .split(' ')
                                                                    .map((part) => part[0])
                                                                    .join('')}
                                                                <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-[9999px] ring-2 ring-[#ffffff] ${
                                                                    member.status === 'Active'
                                                                        ? 'bg-[#10b981]'
                                                                        : member.status === 'In Training'
                                                                          ? 'bg-[#06b6d4]'
                                                                          : 'bg-[#f59e0b]'
                                                                }`} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="break-words text-sm font-bold text-[#0f172a]">
                                                                    {member.name}
                                                                </div>
                                                                <div className="text-[11px] text-[#64748b]">
                                                                    Active: {member.lastActive}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 md:px-6">
                                                        <div>
                                                            <span
                                                                className={`inline-flex rounded-[6px] px-2 py-0.5 text-[10px] font-bold uppercase ${getRoleBadgeStyle(member.role)}`}
                                                            >
                                                                {member.role}
                                                            </span>
                                                            <div className="mt-1 text-[11px] text-[#64748b] break-words max-w-[180px]">
                                                                {member.station}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 md:px-6">
                                                        <span
                                                            className={`rounded-[8px] px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_STYLES[member.status]}`}
                                                        >
                                                            {member.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 md:px-6">
                                                        <div className="w-24 md:w-32">
                                                            <div className="mb-1 flex justify-between text-[11px]">
                                                                <span className="text-[#64748b]">
                                                                    {member.readiness}
                                                                </span>
                                                                <span className="font-bold text-[#0f172a]">
                                                                    {member.progress}%
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 overflow-hidden rounded-[9999px] bg-[#f1f5f9]">
                                                                <div
                                                                    className="h-full rounded-[9999px] bg-emerald-500"
                                                                    style={{
                                                                        width: `${member.progress}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden px-4 py-3.5 md:px-6 sm:table-cell">
                                                        <div className="flex items-center gap-1 text-xs font-bold text-[#0f172a]">
                                                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                                                            {formatTeamCheckpoints(member.checkpoints)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right md:px-6">
                                                        <button
                                                            type="button"
                                                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 motion-reduce:transition-none"
                                                            aria-label={`Open ${member.name} actions`}
                                                            aria-describedby={TEAM_PREVIEW_ACTION_STATUS_ID}
                                                            aria-pressed={openMemberActionId === member.id}
                                                            aria-expanded={openMemberActionId === member.id}
                                                            aria-controls={
                                                                openMemberActionId === member.id
                                                                    ? 'team-member-action-detail'
                                                                    : undefined
                                                            }
                                                            onClick={(event) =>
                                                                handleOpenMemberActions(member, event.currentTarget)
                                                            }
                                                        >
                                                            <MoreHorizontal className="h-4 w-4 md:h-5 md:w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-8 text-center md:px-6"
                                                >
                                                    <p className="text-sm font-semibold text-[#0f172a]">
                                                        No team members match the current filters.
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#64748b]">
                                                        Adjust the search term or status filter to restore the roster.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col items-center justify-between gap-3 border-t border-[#f1f5f9] bg-[#f8fafc] p-4 sm:flex-row">
                                <p className="text-xs text-[#64748b]">
                                    Showing {filteredTeamMembers.length} of {TEAM_MEMBERS.length} team members
                                </p>
                                {filtersApplied ? (
                                    <button
                                        type="button"
                                        className="flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] px-3 text-xs font-bold text-cyan-700 transition-colors hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 motion-reduce:transition-none"
                                        aria-describedby={TEAM_ROSTER_ACTION_STATUS_ID}
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <span className="text-xs font-semibold text-[#64748b]">
                                        Staff directory preview
                                    </span>
                                )}
                            </div>
                        </section>

                        {/* Selected Team Member Action Detail Drawer */}
                        {openMemberAction && (
                            <section
                                id="team-member-action-detail"
                                aria-label="Selected team member action detail"
                                className="rounded-[20px] border border-[#06b6d4]/[0.30] bg-[#f8fafc] p-5 shadow-xs"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                                            Selected staff action
                                        </p>
                                        <h3 className="mt-1 text-lg font-bold text-[#0f172a]">
                                            {openMemberAction.name}
                                        </h3>
                                        <p className="mt-0.5 text-xs text-[#64748b]">
                                            {openMemberAction.role} · {openMemberAction.status} · {openMemberAction.station}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2 text-xs font-semibold text-[#0f172a] shadow-xs transition-colors hover:bg-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 motion-reduce:transition-none"
                                        aria-label="Close selected team member action detail"
                                        aria-describedby={TEAM_PREVIEW_ACTION_STATUS_ID}
                                        onClick={closeMemberActionDetail}
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    {[
                                        {
                                            label: 'Readiness',
                                            value: openMemberAction.readiness,
                                            detail: 'Sample status only; authenticated staff records stay private.',
                                        },
                                        {
                                            label: 'Progress',
                                            value: `${openMemberAction.progress}%`,
                                            detail: `${formatTeamCheckpoints(openMemberAction.checkpoints)} sample checkpoints shown.`,
                                        },
                                        {
                                            label: 'Action boundary',
                                            value: 'Preview only',
                                            detail: 'Sign in before editing assignments, credentials, roles, or live handoffs.',
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-3.5 shadow-xs"
                                        >
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                {item.label}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-[#0f172a]">
                                                {item.value}
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                                {item.detail}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Team Readiness Snapshot Panel */}
                        <section
                            aria-label="Team readiness snapshot panel"
                            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                        >
                            <div className="mb-4 flex flex-col justify-between gap-2 border-b border-[#f1f5f9] pb-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="font-sans text-base font-bold text-[#0f172a]">
                                        Team readiness snapshot
                                    </h2>
                                    <p className="text-xs text-[#64748b]">Competency assessment across key operational domains</p>
                                </div>
                                <span className="text-[11px] font-semibold text-cyan-700 bg-[#06b6d4]/[0.10] px-2.5 py-1 rounded-[8px]">
                                    Sample aggregate view
                                </span>
                            </div>

                            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                                <div className="mx-auto w-full max-w-[18rem] md:max-w-[19rem] lg:max-w-none">
                                    <SkillRadarChart skills={TEAM_SKILLS} />
                                </div>
                                <div className="space-y-3">
                                    <div className="rounded-[14px] border border-[#10b981]/[0.20] bg-[#10b981]/[0.06] p-4">
                                        <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                                            Strength
                                        </h4>
                                        <p className="text-xs leading-relaxed text-emerald-900">
                                            The sample view marks <strong>Client Care</strong> as the
                                            strongest area. Live scoring requires authenticated records.
                                        </p>
                                    </div>
                                    <div className="rounded-[14px] border border-[#f59e0b]/[0.20] bg-[#f59e0b]/[0.06] p-4">
                                        <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                                            Improvement Area
                                        </h4>
                                        <p className="text-xs leading-relaxed text-amber-900">
                                            Commercial handoff review needs more context before a live
                                            team uses this workspace.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Handoffs, Assignment Form & Recent Activity (1 col) */}
                    <div className="space-y-6">
                        {/* Readiness Handoffs Panel */}
                        <section
                            aria-label="Team readiness handoffs panel"
                            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                        >
                            <div className="mb-4 flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                                <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-[#0f172a]">
                                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                                    Readiness Handoffs
                                </h3>
                                <button
                                    type="button"
                                    className="min-h-11 rounded-[10px] px-3 text-[11px] font-bold uppercase tracking-wider text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 motion-reduce:transition-none"
                                    aria-describedby={TEAM_PREVIEW_ACTION_STATUS_ID}
                                    aria-pressed={dismissedHandoffPreview}
                                    onClick={handleDismissAll}
                                >
                                    Dismiss All
                                </button>
                            </div>

                            <div className="space-y-3">
                                {READINESS_HANDOFFS.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="group relative rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 transition-shadow hover:shadow-xs"
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className={`h-9 w-1.5 shrink-0 rounded-[9999px] ${
                                                    alert.priority === 'high'
                                                        ? 'bg-rose-500'
                                                        : 'bg-amber-500'
                                                }`}
                                            />
                                            <div className="min-w-0 flex-1 pr-10">
                                                <div className="text-xs font-bold text-[#0f172a]">
                                                    {alert.user}
                                                </div>
                                                <div className="mt-0.5 text-xs text-[#64748b] leading-tight">
                                                    {alert.issue}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] p-2 text-cyan-700 shadow-xs transition-colors hover:bg-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 motion-reduce:transition-none"
                                            aria-label={`Send reminder for handoff ${alert.id}`}
                                            aria-describedby={TEAM_PREVIEW_ACTION_STATUS_ID}
                                            aria-pressed={remindedHandoffIds.has(alert.id)}
                                            onClick={() => handleReminderClick(alert)}
                                        >
                                            <Bell className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Prepare Handoff Panel */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <div className="mb-4 flex items-center gap-3 border-b border-[#f1f5f9] pb-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#06b6d4]/[0.10] text-cyan-700">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-sans text-sm font-bold text-[#0f172a]">Prepare Handoff</h3>
                                    <p className="text-xs text-[#64748b]">Configure team assignment</p>
                                </div>
                            </div>

                            <p className="mb-5 text-xs leading-relaxed text-[#64748b]">
                                Prepare a sample handoff for the selected staff group. Sign in before
                                assigning training or changing real records.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                        Handoff
                                    </label>
                                    <select
                                        aria-label="Handoff"
                                        aria-describedby={TEAM_PREVIEW_ACTION_STATUS_ID}
                                        className="min-h-11 w-full rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-xs font-semibold text-[#0f172a] focus:border-cyan-500 focus:bg-[#ffffff] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                        value={moduleName}
                                        onChange={(event) => handleModuleSelect(event.target.value as ModuleOption)}
                                    >
                                        {MODULE_OPTIONS.map((module) => (
                                            <option key={module}>{module}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                        Target
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {TARGET_OPTIONS.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                className={`min-h-11 rounded-[10px] border px-3 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 motion-reduce:transition-none ${
                                                    targetAudience === tag
                                                        ? 'border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.12] text-cyan-800'
                                                        : 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9]'
                                                }`}
                                                aria-pressed={targetAudience === tag}
                                                aria-describedby={TEAM_PREVIEW_ACTION_STATUS_ID}
                                                onClick={() => handleTargetSelect(tag)}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    aria-describedby={
                                        serverActionPending || serverActionResult
                                            ? `${TEAM_PREVIEW_ACTION_STATUS_ID} ${TEAM_HANDOFF_ACTION_STATUS_ID}`
                                            : TEAM_PREVIEW_ACTION_STATUS_ID
                                    }
                                    className="min-h-11 w-full rounded-[14px] bg-[#0f172a] py-3 text-xs font-bold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 motion-reduce:transition-none"
                                    onClick={handleSendAssignment}
                                >
                                    Send sample handoff
                                </button>

                                {(serverActionPending || serverActionResult) && (
                                    <div
                                        id={TEAM_HANDOFF_ACTION_STATUS_ID}
                                        role="status"
                                        aria-live="polite"
                                        aria-label="Team handoff action status"
                                        className="rounded-[12px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.08] p-3.5 text-xs text-cyan-900"
                                    >
                                        <p className="font-bold">
                                             {serverActionPending
                                                ? 'Checking authenticated storage'
                                                : serverActionResult
                                                  ? TEAM_ACTION_STATUS_LABELS[serverActionResult.status]
                                                  : ''}
                                        </p>
                                        {serverActionResult && (
                                            <>
                                                <p className="mt-1 text-[#334155]">
                                                    {serverActionResult.message}
                                                </p>
                                                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                                                    Future table: {serverActionResult.futureTable ?? 'none'} | Persisted:{' '}
                                                    {serverActionResult.persisted ? 'yes' : 'no'}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {initialPersistedHandoffs.length > 0 && (
                                    <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                                            Authenticated handoff queue
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {initialPersistedHandoffs.slice(0, 3).map((handoff) => (
                                                <div
                                                    key={handoff.id}
                                                    className="rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] p-3 text-xs shadow-xs"
                                                >
                                                    <div className="font-bold text-[#0f172a]">
                                                        {handoff.moduleName}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-[#64748b]">
                                                        Target: {handoff.targetAudience} | {handoff.createdAtLabel}
                                                    </div>
                                                    <span className="mt-2 inline-flex rounded-[6px] bg-[#10b981]/[0.10] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                                        Authenticated handoff
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Panel */}
                        <section
                            aria-label="Team recent activity panel"
                            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                        >
                            <h3 className="mb-4 flex items-center gap-2 border-b border-[#f1f5f9] pb-3 font-sans text-sm font-bold text-[#0f172a]">
                                <Clock className="h-4 w-4 text-[#64748b]" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {RECENT_ACTIVITY.map((activity) => (
                                    <div
                                        key={`${activity.user}-${activity.time}`}
                                        className="flex gap-3 text-xs"
                                    >
                                        <div className="mt-1 h-2 w-2 shrink-0 rounded-[9999px] bg-emerald-500" />
                                        <div className="min-w-0 flex-1">
                                            <span className="font-bold text-[#0f172a]">
                                                {activity.user}
                                            </span>
                                            <span className="mx-1 text-[#64748b]">
                                                {activity.action}
                                            </span>
                                            <span className="font-semibold text-cyan-700">
                                                {activity.item}
                                            </span>
                                            <div className="mt-0.5 text-[10px] text-[#94a3b8]">
                                                {activity.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </PartnerLayout>
    );
};

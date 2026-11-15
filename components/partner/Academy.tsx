'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import {
    ArrowRight,
    Brain,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    LucideIcon,
    ShieldCheck,
    Sparkles,
    Target,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { AITutor } from './AITutor';
import { CertificationTracker } from './CertificationTracker';
import { Leaderboard } from './Leaderboard';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import { MicroLearningFeed } from './MicroLearningFeed';
import { PartnerLayout } from './PartnerLayout';
import { RolePathSelector } from './RolePathSelector';
import analytics from '@/src/lib/analytics';
import type {
    NexusAcademyAssignmentActionResult,
    NexusAcademyPersistedAssignment,
    NexusAcademyServerActionStatus,
} from '@/src/actions/nexusAcademyActionCore';

type LearningRole = 'operator' | 'manager' | 'sales';
type PersistedAssignmentsStatus =
    | 'loaded'
    | 'database_error'
    | 'database_not_configured'
    | 'auth_context_missing'
    | 'role_not_allowed';
type NexusAcademyAssignmentActionRunner = (
    prevState: NexusAcademyAssignmentActionResult,
    formData: FormData
) => Promise<NexusAcademyAssignmentActionResult>;

const ACADEMY_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.academy.href;

interface StatCard {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    accent: string;
    iconColor: string;
}

interface AssignmentItem {
    title: string;
    status: string;
    detail: string;
    href: string;
    icon: LucideIcon;
    badgeTone: string;
}

interface ResourceLink {
    title: string;
    description: string;
    href: string;
}

interface AcademyAssignmentReadinessBridge {
    roleTrack: LearningRole;
    selectedRoleLabel: string;
    moduleCount: number;
    requiredCount: number;
    requiredDrillCount: number;
    drillIncluded: boolean;
    persistedAssignmentCount: number;
    trainingReadinessStatus: string;
}

const trackAcademyAction = (
    action: string,
    properties: Record<string, unknown> = {}
) => {
    analytics.capture('nexus_academy_route_action_clicked', {
        route: ACADEMY_ROUTE_HREF,
        preview_record: true,
        action,
        ...properties,
    });
};

const STAT_CARDS: StatCard[] = [
    {
        label: 'Learning rhythm',
        value: '3 checks',
        detail: 'Keep readiness current with one short review at a time.',
        icon: Zap,
        accent: 'bg-[#f59e0b]/[0.10]',
        iconColor: 'text-amber-700',
    },
    {
        label: 'Readiness badges',
        value: '1 of 4',
        detail: 'Operator level 1 is complete in this sample.',
        icon: Trophy,
        accent: 'bg-[#06b6d4]/[0.10]',
        iconColor: 'text-cyan-700',
    },
    {
        label: 'Required drills',
        value: '2 open',
        detail: 'Emergency refreshers need sign-off this week.',
        icon: ShieldCheck,
        accent: 'bg-[#f43f5e]/[0.10]',
        iconColor: 'text-rose-700',
    },
    {
        label: 'Team onboarding',
        value: '87%',
        detail: 'Most of the current cohort is nearly complete.',
        icon: Users,
        accent: 'bg-[#10b981]/[0.10]',
        iconColor: 'text-emerald-700',
    },
];

const TRACK_DETAILS: Record<
    LearningRole,
    {
        title: string;
        focus: string;
        duration: string;
        milestone: string;
        modules: string[];
    }
> = {
    operator: {
        title: 'Operator track',
        focus: 'Technical readiness, safety rituals, and hands-on chamber confidence.',
        duration: '2-3 hours',
        milestone: 'Prepares the operator for supervised practice review.',
        modules: ['Chamber prep', 'Pressurization basics', 'Client monitoring', 'Emergency response'],
    },
    manager: {
        title: 'Manager track',
        focus: 'Compliance oversight, staff coaching, and clinic-level reporting habits.',
        duration: '3-4 hours',
        milestone: 'Prepares managers to assign modules and review exceptions.',
        modules: ['Compliance essentials', 'Incident handling', 'Quality assurance', 'Team reporting'],
    },
    sales: {
        title: 'Sales track',
        focus: 'Consultation flow, expectation setting, and client education conversations.',
        duration: '1.5-2 hours',
        milestone: 'Builds a repeatable handoff from inquiry to booked session.',
        modules: ['Benefits overview', 'Consult flow', 'Objection handling', 'Follow-up rhythm'],
    },
};

const MODULE_CATEGORY_BADGE: Record<
    string,
    { label: string; className: string }
> = {
    'Chamber prep': {
        label: 'HBOT Safety',
        className: 'border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700',
    },
    'Pressurization basics': {
        label: 'HBOT Safety',
        className: 'border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700',
    },
    'Client monitoring': {
        label: 'Hydrogen Protocols',
        className: 'border border-[#14b8a6]/[0.20] bg-[#14b8a6]/[0.10] text-teal-700',
    },
    'Emergency response': {
        label: 'SOPs',
        className: 'border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700',
    },
    'Compliance essentials': {
        label: 'SOPs',
        className: 'border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700',
    },
    'Incident handling': {
        label: 'SOPs',
        className: 'border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700',
    },
    'Quality assurance': {
        label: 'SOPs',
        className: 'border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700',
    },
    'Team reporting': {
        label: 'SOPs',
        className: 'border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700',
    },
    'Benefits overview': {
        label: 'Hydrogen Protocols',
        className: 'border border-[#14b8a6]/[0.20] bg-[#14b8a6]/[0.10] text-teal-700',
    },
    'Consult flow': {
        label: 'SOPs',
        className: 'border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700',
    },
    'Objection handling': {
        label: 'SOPs',
        className: 'border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700',
    },
    'Follow-up rhythm': {
        label: 'SOPs',
        className: 'border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700',
    },
};

const ACADEMY_CONNECTED_MODULES = {
    team: NEXUS_MODULE_NAV_ITEM_BY_KEY.team,
    docs: NEXUS_MODULE_NAV_ITEM_BY_KEY.docs,
    fleet: NEXUS_MODULE_NAV_ITEM_BY_KEY.fleet,
};

const REQUIRED_ASSIGNMENTS: AssignmentItem[] = [
    {
        title: 'Run the emergency response refresher',
        status: 'Due today',
        detail: 'Operators must review the handoff steps before supervised practice is scheduled.',
        href: ACADEMY_CONNECTED_MODULES.team.href,
        icon: ShieldCheck,
        badgeTone: 'border border-[#f43f5e]/[0.20] bg-[#f43f5e]/[0.10] text-rose-700',
    },
    {
        title: 'Review the latest consent packet',
        status: 'New this week',
        detail: 'Confirm the document bundle before onboarding new clients.',
        href: ACADEMY_CONNECTED_MODULES.docs.href,
        icon: FileText,
        badgeTone: 'border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700',
    },
    {
        title: 'Pair training with fleet readiness',
        status: 'Ops check',
        detail: 'Use the fleet dashboard to match upcoming modules with device availability.',
        href: ACADEMY_CONNECTED_MODULES.fleet.href,
        icon: Target,
        badgeTone: 'border border-[#f59e0b]/[0.20] bg-[#f59e0b]/[0.10] text-amber-700',
    },
];

const RESOURCE_LINKS: ResourceLink[] = [
    {
        title: 'Team dashboard',
        description: 'Check compliance gaps, assignment progress, and readiness status.',
        href: ACADEMY_CONNECTED_MODULES.team.href,
    },
    {
        title: 'Document center',
        description: 'Pull the latest consent forms, SOPs, and onboarding material.',
        href: ACADEMY_CONNECTED_MODULES.docs.href,
    },
    {
        title: 'Fleet health',
        description: 'Match training modules to the devices that need operator attention.',
        href: ACADEMY_CONNECTED_MODULES.fleet.href,
    },
];

const getRequiredDrillCount = () =>
    REQUIRED_ASSIGNMENTS.filter((assignment) => {
        const searchableText = `${assignment.title} ${assignment.detail}`.toLowerCase();
        return (
            searchableText.includes('drill') ||
            searchableText.includes('emergency') ||
            searchableText.includes('refresher')
        );
    }).length;

const resolveAcademyAssignmentReadinessStatus = (
    persistedAssignmentCount: number,
    requiredDrillCount: number
) => {
    if (persistedAssignmentCount > 0 && requiredDrillCount > 0) {
        return 'Ready for manager review with required drill coverage.';
    }

    if (persistedAssignmentCount > 0) {
        return 'Ready for manager review with authenticated assignment history.';
    }

    if (requiredDrillCount > 0) {
        return 'Ready to queue after sign-in with required drill coverage.';
    }

    return 'Ready to queue after sign-in with aggregate training counts.';
};

const buildAcademyAssignmentReadinessBridge = (
    roleTrack: LearningRole,
    selectedTrack: (typeof TRACK_DETAILS)[LearningRole],
    persistedAssignmentCount: number
): AcademyAssignmentReadinessBridge => {
    const requiredDrillCount = getRequiredDrillCount();

    return {
        roleTrack,
        selectedRoleLabel: selectedTrack.title,
        moduleCount: selectedTrack.modules.length,
        requiredCount: REQUIRED_ASSIGNMENTS.length,
        requiredDrillCount,
        drillIncluded: requiredDrillCount > 0,
        persistedAssignmentCount,
        trainingReadinessStatus: resolveAcademyAssignmentReadinessStatus(
            persistedAssignmentCount,
            requiredDrillCount
        ),
    };
};

const INITIAL_NEXUS_ACADEMY_ACTION_STATE: NexusAcademyAssignmentActionResult = {
    success: false,
    status: 'auth_required',
    message: 'Academy assignment boundary has not been requested yet.',
    persisted: false,
    futureTable: null,
    persistenceMode: 'blocked',
};

const ACADEMY_ASSIGNMENT_ACTION_STATUS_ID = 'academy-assignment-action-status';
const ACADEMY_ASSIGNMENT_ACTION_STATUS_LABEL = 'Academy assignment action status';
const ACADEMY_ASSIGNMENT_READY_STATUS_MESSAGE =
    'Ready to queue an aggregate academy assignment after sign-in.';
const ACADEMY_ROUTE_ACTION_STATUS_ID = 'academy-route-action-status';
const ACADEMY_ROUTE_ACTION_STATUS_LABEL = 'Academy route action status';
const ACADEMY_ROUTE_ACTION_READY_STATUS_MESSAGE =
    'Academy route controls ready: micro-learning, training guide, required next steps, and connected resources.';

const ACADEMY_ACTION_STATUS_LABELS: Record<NexusAcademyServerActionStatus, string> = {
    validation_error: 'Input check failed',
    auth_required: 'Authentication required',
    service_profile_required: 'Service profile required',
    role_not_allowed: 'Role not allowed',
    persistence_error: 'Persistence failed',
    private_write_ready: 'Private write boundary ready',
};

const PERSISTED_ASSIGNMENTS_STATUS_COPY: Record<PersistedAssignmentsStatus, string> = {
    loaded: 'Authenticated academy assignment history is connected for signed-in service profiles.',
    database_error: 'Authenticated academy assignment storage could not load, so this screen keeps sample training only.',
    database_not_configured: 'Authenticated academy assignment storage is ready for deployment database configuration.',
    auth_context_missing: 'Authenticated academy assignment storage waits for sign-in and a verified Nexus service profile.',
    role_not_allowed: 'Academy assignment history is manager-only for this Nexus service role.',
};

interface AcademyProps {
    createAssignmentAction?: NexusAcademyAssignmentActionRunner;
    initialPersistedAssignments?: NexusAcademyPersistedAssignment[];
    persistedAssignmentsStatus?: PersistedAssignmentsStatus;
}

export const Academy: React.FC<AcademyProps> = ({
    createAssignmentAction,
    initialPersistedAssignments = [],
    persistedAssignmentsStatus = 'auth_context_missing',
}) => {
    const [selectedRole, setSelectedRole] = useState<LearningRole>('operator');
    const [showTutor, setShowTutor] = useState(false);
    const tutorTriggerRef = useRef<HTMLButtonElement | null>(null);
    const [serverActionResult, setServerActionResult] =
        useState<NexusAcademyAssignmentActionResult | null>(null);
    const [serverActionPending, setServerActionPending] = useState(false);
    const [routeActionStatus, setRouteActionStatus] = useState(
        ACADEMY_ROUTE_ACTION_READY_STATUS_MESSAGE
    );

    const selectedTrack = TRACK_DETAILS[selectedRole];
    const assignmentReadinessBridge = buildAcademyAssignmentReadinessBridge(
        selectedRole,
        selectedTrack,
        initialPersistedAssignments.length
    );

    const handleRoleSelect = (role: LearningRole) => {
        setSelectedRole(role);
        trackAcademyAction('role_track_selected', { role });
    };

    const handleStartMicroLearning = () => {
        setRouteActionStatus(`Opening Academy micro-learning feed for ${selectedTrack.title}.`);
        trackAcademyAction('start_micro_learning', {
            destination: '#academy-feed',
            role: selectedRole,
        });
    };

    const openTutor = (source: string, trigger?: HTMLButtonElement | null) => {
        tutorTriggerRef.current = trigger ?? null;
        setShowTutor(true);
        setRouteActionStatus(
            source === 'role_selector'
                ? `Training guide opened from role selector for ${selectedTrack.title}.`
                : `Training guide opened from Academy hero for ${selectedTrack.title}.`
        );
        trackAcademyAction('open_tutor', { source, role: selectedRole });
    };

    const closeTutor = () => {
        setShowTutor(false);
        setRouteActionStatus('Training guide closed; focus returned to Academy route controls.');
        window.setTimeout(() => tutorTriggerRef.current?.focus(), 0);
    };

    const buildAssignmentFormData = () => {
        const formData = new FormData();
        formData.set('roleTrack', selectedRole);
        formData.set('moduleCount', String(selectedTrack.modules.length));
        formData.set('requiredCount', String(REQUIRED_ASSIGNMENTS.length));
        formData.set(
            'drillIncluded',
            String(REQUIRED_ASSIGNMENTS.some((assignment) =>
                assignment.title.toLowerCase().includes('emergency')
            ))
        );
        return formData;
    };

    const runAcademyAssignmentBoundary = async (
        runner: NexusAcademyAssignmentActionRunner | undefined,
        formData: FormData
    ) => {
        if (!runner) {
            return;
        }

        setServerActionPending(true);
        setServerActionResult(null);

        try {
            const result = await runner(INITIAL_NEXUS_ACADEMY_ACTION_STATE, formData);
            setServerActionResult(result);
        } catch {
            setServerActionResult({
                success: false,
                status: 'validation_error',
                message: 'Academy assignment boundary could not be checked from this browser preview.',
                persisted: false,
                futureTable: null,
                persistenceMode: 'blocked',
            });
        } finally {
            setServerActionPending(false);
        }
    };

    const handleSendTrainingAssignment = () => {
        trackAcademyAction('training_assignment_sent', {
            role_track: selectedRole,
            module_count: assignmentReadinessBridge.moduleCount,
            required_count: assignmentReadinessBridge.requiredCount,
            required_drill_count: assignmentReadinessBridge.requiredDrillCount,
            drill_included: assignmentReadinessBridge.drillIncluded,
            persisted_assignment_count: assignmentReadinessBridge.persistedAssignmentCount,
            assignment_readiness_status: assignmentReadinessBridge.trainingReadinessStatus,
        });
        void runAcademyAssignmentBoundary(createAssignmentAction, buildAssignmentFormData());
    };

    const handleAssignmentTransition = (item: AssignmentItem) => {
        setRouteActionStatus(`Opening ${item.title} at ${item.href}. Status: ${item.status}.`);
        trackAcademyAction('assignment_transition', {
            destination: item.href,
            status: item.status,
        });
    };

    const handleResourceTransition = (resource: ResourceLink) => {
        setRouteActionStatus(`Opening ${resource.title} connected resource at ${resource.href}.`);
        trackAcademyAction('resource_transition', {
            destination: resource.href,
        });
    };

    return (
        <PartnerLayout title="Academy">
            <div className="max-w-full overflow-x-hidden space-y-8 pb-12">
                <p
                    id={ACADEMY_ROUTE_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={ACADEMY_ROUTE_ACTION_STATUS_LABEL}
                    className="sr-only"
                >
                    {routeActionStatus}
                </p>

                {/* Public route boundaries required for compliance testing */}
                <div
                    role="note"
                    aria-label="Nexus public route boundary: sample workspace tour without live clinic records"
                    className="sr-only"
                >
                    Sample workspace tour without live clinic records. No live clinic records are shown.
                </div>

                {/* 01. WORKSPACE PREVIEW STATUS BANNER (CLINICAL DAYLIGHT) */}
                <section
                    aria-label="Academy workspace preview status"
                    className="rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] px-5 py-3.5 text-[#0f172a] shadow-xs"
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-cyan-600" />
                                Workspace Preview
                            </span>
                            <span className="text-xs font-semibold text-[#64748b]">Clinical Training Environment</span>
                        </div>
                        <span className="rounded-[9999px] border border-[#e2e8f0] bg-[#ffffff] px-3 py-1 text-[11px] font-semibold text-[#475569] shadow-2xs">
                            {PERSISTED_ASSIGNMENTS_STATUS_COPY[persistedAssignmentsStatus]}
                        </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#64748b]">
                        This academy screen uses sample readiness paths until authenticated training records are connected.
                    </p>
                </section>

                {/* 02. GRAND CLINICAL HERO BANNER MATCHING OVERVIEW STANDARD */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs"
                >
                    {/* Background Clinic Interior Photo */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <Image
                            src="/images/landing/sol-protocols-v2.jpg"
                            alt="Academy clinical training space"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-right-top opacity-20 md:opacity-25"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff] via-[#ffffff]/90 to-[#ffffff]/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.3fr_0.7fr] xl:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-700">
                                <Sparkles className="h-3 w-3 text-purple-600" />
                                NEXUS ACADEMY · CLINICAL ONBOARDING & READINESS
                            </div>

                            <h1 className="mt-3 text-3xl font-extrabold font-sans tracking-tight text-[#0f172a] sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
                                Keep staff training, readiness, and drills in one workspace
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#475569] sm:text-base">
                                Run role-based onboarding, deliver quick refreshers, and track who is ready for live operations without leaving Nexus.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href="#academy-feed"
                                    aria-describedby={ACADEMY_ROUTE_ACTION_STATUS_ID}
                                    onClick={handleStartMicroLearning}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    Start micro-learning
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <button
                                    type="button"
                                    aria-describedby={ACADEMY_ROUTE_ACTION_STATUS_ID}
                                    onClick={(event) => openTutor('hero', event.currentTarget)}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#cbd5e1] bg-[#ffffff] px-5 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    <Brain className="h-4 w-4 text-cyan-600" />
                                    Open training guide
                                </button>
                            </div>
                        </div>

                        {/* Quick Hero Track Telemetry Cards */}
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <div className="rounded-[16px] border border-[#e2e8f0] bg-[#ffffff]/90 p-4 shadow-xs backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#8b5cf6]/[0.10] text-purple-700">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                            Active Path
                                        </p>
                                        <p className="text-base font-bold text-[#0f172a]">
                                            {selectedTrack.title}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                                    {selectedTrack.focus}
                                </p>
                            </div>

                            <div className="rounded-[16px] border border-[#e2e8f0] bg-[#ffffff]/90 p-4 shadow-xs backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#06b6d4]/[0.10] text-cyan-700">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                            Suggested Pace
                                        </p>
                                        <p className="text-base font-bold text-[#0f172a]">
                                            {selectedTrack.duration}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                                    {selectedTrack.milestone}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 03. STAT / KPI CARDS */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {STAT_CARDS.map((card, index) => (
                        <motion.article
                            key={card.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${card.accent}`}>
                                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                                        {card.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-[#0f172a]">
                                        {card.value}
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed text-[#64748b]">
                                        {card.detail}
                                    </p>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </section>

                {/* 04. ROLE TRACK WORKSPACE & ONBOARDING HUB */}
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <section
                            aria-label="Academy role track workspace"
                            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                        >
                            <div className="flex flex-col gap-3 border-b border-[#f1f5f9] pb-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                                        Personalized Onboarding
                                    </p>
                                    <h2 className="mt-1 text-xl font-extrabold font-sans text-[#0f172a] sm:text-2xl">
                                        Choose the track that matches the role
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    aria-describedby={ACADEMY_ROUTE_ACTION_STATUS_ID}
                                    onClick={(event) => openTutor('role_selector', event.currentTarget)}
                                    className="inline-flex min-h-11 items-center gap-2 self-start rounded-[14px] border border-[#cbd5e1] bg-[#ffffff] px-4 py-2 text-sm font-semibold text-[#334155] shadow-xs transition hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none"
                                >
                                    <Brain className="h-4 w-4 text-cyan-600" />
                                    Ask the guide
                                </button>
                            </div>

                            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                                <div className="min-w-0">
                                    <RolePathSelector onSelectPath={handleRoleSelect} />
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.aside
                                        aria-label="Academy current recommendation panel"
                                        key={selectedRole}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="min-w-0 rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                                                Current recommendation
                                            </p>
                                            <span className="rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-2.5 py-0.5 text-[10px] font-bold uppercase text-cyan-700">
                                                Active Selection
                                            </span>
                                        </div>

                                        <h3 className="mt-2 text-xl font-extrabold font-sans text-[#0f172a]">
                                            {selectedTrack.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                                            {selectedTrack.focus}
                                        </p>

                                        {/* Milestone Card */}
                                        <div className="mt-5 rounded-[14px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                                                Milestone
                                            </p>
                                            <p className="mt-1 text-sm font-semibold leading-relaxed text-cyan-950">
                                                {selectedTrack.milestone}
                                            </p>
                                        </div>

                                        {/* First Modules with Modality-Aligned Badges */}
                                        <div className="mt-5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                                                First modules
                                            </p>
                                            <ul className="mt-3 space-y-2">
                                                {selectedTrack.modules.map((module) => {
                                                    const badgeInfo = MODULE_CATEGORY_BADGE[module] || {
                                                        label: 'Core Protocol',
                                                        className: 'border border-[#e2e8f0] bg-[#f8fafc] text-[#334155]',
                                                    };
                                                    return (
                                                        <li
                                                            key={module}
                                                            className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e2e8f0] bg-[#ffffff] px-3.5 py-2.5 text-sm font-semibold text-[#0f172a] shadow-xs"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                                {module}
                                                            </span>
                                                            <span className={`inline-flex shrink-0 items-center rounded-[9999px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeInfo.className}`}>
                                                                {badgeInfo.label}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>

                                        {/* Assignment Readiness Bridge */}
                                        <div
                                            aria-label="Academy assignment readiness bridge"
                                            className="mt-5 rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-xs"
                                        >
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                                Assignment readiness bridge
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                                Aggregate route state for training assignment review before private storage is checked.
                                            </p>
                                            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                                <div
                                                    aria-label={`Selected academy role: ${assignmentReadinessBridge.selectedRoleLabel}`}
                                                    className="rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5"
                                                >
                                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                        Role
                                                    </dt>
                                                    <dd className="mt-0.5 font-bold text-[#0f172a]">
                                                        {assignmentReadinessBridge.selectedRoleLabel}
                                                    </dd>
                                                </div>
                                                <div
                                                    aria-label={`Academy module count: ${assignmentReadinessBridge.moduleCount}`}
                                                    className="rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5"
                                                >
                                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                        Modules
                                                    </dt>
                                                    <dd className="mt-0.5 font-bold text-[#0f172a]">
                                                        {assignmentReadinessBridge.moduleCount}
                                                    </dd>
                                                </div>
                                                <div
                                                    aria-label={`Academy required steps: ${assignmentReadinessBridge.requiredCount}`}
                                                    className="rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5"
                                                >
                                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                        Required
                                                    </dt>
                                                    <dd className="mt-0.5 font-bold text-[#0f172a]">
                                                        {assignmentReadinessBridge.requiredCount} steps
                                                    </dd>
                                                </div>
                                                <div
                                                    aria-label={`Academy required drills: ${assignmentReadinessBridge.requiredDrillCount}`}
                                                    className="rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5"
                                                >
                                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                        Drills
                                                    </dt>
                                                    <dd className="mt-0.5 font-bold text-[#0f172a]">
                                                        {assignmentReadinessBridge.requiredDrillCount}
                                                    </dd>
                                                </div>
                                                <div
                                                    aria-label={`Persisted academy assignments: ${assignmentReadinessBridge.persistedAssignmentCount}`}
                                                    className="rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5"
                                                >
                                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                        Drafts
                                                    </dt>
                                                    <dd className="mt-0.5 font-bold text-[#0f172a]">
                                                        {assignmentReadinessBridge.persistedAssignmentCount}
                                                    </dd>
                                                </div>
                                                <div
                                                    aria-label="Academy assignment privacy: Aggregate only"
                                                    className="rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5"
                                                >
                                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                        Privacy
                                                    </dt>
                                                    <dd className="mt-0.5 font-bold text-[#0f172a]">
                                                        Aggregate only
                                                    </dd>
                                                </div>
                                            </dl>
                                            <p className="mt-3 rounded-[12px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] p-2.5 text-xs font-semibold leading-relaxed text-cyan-800">
                                                {assignmentReadinessBridge.trainingReadinessStatus}
                                            </p>
                                        </div>

                                        {/* Authenticated Assignment Panel */}
                                        <div
                                            aria-label="Academy authenticated assignment panel"
                                            className="mt-5 rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-xs"
                                        >
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                                Authenticated assignment
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                                Queue this role track as an organization-scoped training assignment. The server receives only role, module count, required-step count, and drill status.
                                            </p>
                                            <button
                                                type="button"
                                                aria-describedby={ACADEMY_ASSIGNMENT_ACTION_STATUS_ID}
                                                onClick={handleSendTrainingAssignment}
                                                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none"
                                            >
                                                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                                                Send training assignment
                                            </button>
                                            <div
                                                id={ACADEMY_ASSIGNMENT_ACTION_STATUS_ID}
                                                role="status"
                                                aria-live="polite"
                                                aria-atomic="true"
                                                aria-label={ACADEMY_ASSIGNMENT_ACTION_STATUS_LABEL}
                                                className="mt-3 rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs text-[#475569]"
                                            >
                                                <p className="font-bold text-[#0f172a]">
                                                    {serverActionPending
                                                        ? 'Checking authenticated storage'
                                                        : serverActionResult
                                                          ? ACADEMY_ACTION_STATUS_LABELS[serverActionResult.status]
                                                          : 'Ready to send assignment'}
                                                </p>
                                                {serverActionResult ? (
                                                    <>
                                                        <p className="mt-1 leading-relaxed">
                                                            {serverActionResult.message}
                                                        </p>
                                                        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                            Future table: {serverActionResult.futureTable ?? 'none'} | Persisted:{' '}
                                                            {serverActionResult.persisted ? 'yes' : 'no'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="mt-1 leading-relaxed">
                                                        {ACADEMY_ASSIGNMENT_READY_STATUS_MESSAGE}
                                                    </p>
                                                )}
                                            </div>
                                            {initialPersistedAssignments.length > 0 && (
                                                <div className="mt-3 rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                                        Authenticated assignment queue
                                                    </p>
                                                    <div className="mt-2 space-y-1.5">
                                                        {initialPersistedAssignments.slice(0, 3).map((assignment) => (
                                                            <div
                                                                key={assignment.id}
                                                                className="rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] p-2.5 text-xs text-[#475569] shadow-xs"
                                                            >
                                                                <div className="font-bold capitalize text-[#0f172a]">
                                                                    {assignment.roleTrack} track
                                                                </div>
                                                                <div className="mt-0.5 text-[11px] text-[#64748b]">
                                                                    {assignment.moduleCount} modules - {assignment.requiredCount} required steps - {assignment.createdAtLabel}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.aside>
                                </AnimatePresence>
                            </div>
                        </section>

                        {/* 05. MICRO-LEARNING FEED SECTION */}
                        <section
                            id="academy-feed"
                            aria-label="Academy micro-learning feed panel"
                            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                        >
                            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-purple-700">
                                        Micro-learning
                                    </p>
                                    <h2 className="mt-1 text-2xl font-extrabold font-sans text-[#0f172a]">
                                        Short modules for busy clinic teams
                                    </h2>
                                </div>
                                <p className="max-w-md text-xs leading-relaxed text-[#64748b]">
                                    Use short lessons to refresh safety routines, operational basics, and scenario handoffs between supervised practice reviews.
                                </p>
                            </div>

                            <MicroLearningFeed />
                        </section>
                    </div>

                    {/* Secondary Column: Readiness Badges & Checkpoints */}
                    <div className="space-y-6">
                        <section
                            aria-label="Academy readiness badge tracker"
                            className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                        >
                            <CertificationTracker />
                        </section>

                        <Leaderboard />
                    </div>
                </div>

                {/* 06. REQUIRED NEXT STEPS & CONNECTED RESOURCES */}
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <section
                        aria-label="Academy required next steps panel"
                        className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                    >
                        <div className="flex items-end justify-between gap-4 border-b border-[#f1f5f9] pb-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                                    Required next steps
                                </p>
                                <h2 className="mt-1 text-2xl font-extrabold font-sans text-[#0f172a]">
                                    Keep this week on track
                                </h2>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {REQUIRED_ASSIGNMENTS.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    aria-describedby={ACADEMY_ROUTE_ACTION_STATUS_ID}
                                    onClick={() => handleAssignmentTransition(item)}
                                    className="group block min-h-11 rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none"
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0] text-cyan-700 transition-colors group-hover:bg-[#06b6d4]/[0.10]">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                                                <h3 className="text-sm font-bold font-sans text-[#0f172a] transition-colors group-hover:text-cyan-800">
                                                    {item.title}
                                                </h3>
                                                <span className={`inline-flex w-fit rounded-[9999px] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.badgeTone}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                                {item.detail}
                                            </p>
                                        </div>
                                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#94a3b8] transition-transform group-hover:translate-x-1 group-hover:text-cyan-700" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section
                        aria-label="Academy connected resources panel"
                        className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                            Connected resources
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold font-sans text-[#0f172a]">
                            Jump straight into connected tools
                        </h2>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#64748b]">
                            Academy works best when it stays tied to staffing, documents, and device readiness.
                        </p>

                        <div className="mt-5 space-y-3">
                            {RESOURCE_LINKS.map((resource) => (
                                <Link
                                    key={resource.href}
                                    href={resource.href}
                                    aria-describedby={ACADEMY_ROUTE_ACTION_STATUS_ID}
                                    onClick={() => handleResourceTransition(resource)}
                                    className="group flex min-h-11 items-center justify-between gap-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 shadow-xs transition-all hover:border-cyan-300 hover:bg-[#ffffff] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none"
                                >
                                    <div>
                                        <h3 className="text-sm font-bold text-[#0f172a] transition-colors group-hover:text-cyan-800">
                                            {resource.title}
                                        </h3>
                                        <p className="mt-0.5 text-xs leading-relaxed text-[#64748b]">
                                            {resource.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-[#94a3b8] transition-transform group-hover:translate-x-1 group-hover:text-cyan-700" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <AnimatePresence>
                    {showTutor && (
                        <AITutor
                            videoTitle={selectedTrack.title}
                            onClose={closeTutor}
                        />
                    )}
                </AnimatePresence>
            </div>
        </PartnerLayout>
    );
};

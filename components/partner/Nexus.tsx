'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PartnerLayout } from './PartnerLayout';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    Plus,
    X,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    LoaderCircle,
    Activity,
    Calendar,
    Phone,
    Mail,
    Clock,
    User,
    StickyNote,
    ClipboardList,
    ShieldCheck,
    Users,
    Sparkles,
    ArrowUpRight,
    TrendingUp,
} from 'lucide-react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';
import analytics from '@/src/lib/analytics';
import type {
    NexusClientsIntakeDraftActionResult,
    NexusClientsPersistedIntakeDraft,
    NexusClientsServerActionStatus,
} from '@/src/actions/nexusClientsActionCore';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

type RiskLevel = 'stable' | 'monitor' | 'high';
type FilterValue = 'all' | RiskLevel;
type PersistedIntakeDraftsStatus =
    | 'loaded'
    | 'database_error'
    | 'database_not_configured'
    | 'auth_context_missing'
    | 'role_not_allowed';
type NexusClientsIntakeDraftActionRunner = (
    prevState: NexusClientsIntakeDraftActionResult,
    formData: FormData
) => Promise<NexusClientsIntakeDraftActionResult>;

interface Session {
    id: string;
    date: string;
    modality: string;
    duration: string;
    notes: string;
    outcome: 'good' | 'neutral' | 'poor';
    phase?: string;
    vitals?: string;
    provider?: string;
}

interface ClientNote {
    id: string;
    author: string;
    date: string;
    text: string;
}

interface Client {
    id: string;
    name: string;
    initials: string;
    dob: string;
    email: string;
    phone: string;
    protocol: string;
    adherence: number;
    risk: RiskLevel;
    nextSession: string;
    sessions: Session[];
    notes: ClientNote[];
    joinedDate: string;
    totalSessions: number;
    previewOnly?: boolean;
}

interface NexusProps {
    initialRegistrationOpen?: boolean;
    initialSelectedClientId?: string;
    createIntakeDraftAction?: NexusClientsIntakeDraftActionRunner;
    initialPersistedIntakeDrafts?: NexusClientsPersistedIntakeDraft[];
    persistedIntakeDraftsStatus?: PersistedIntakeDraftsStatus;
}

interface NewClientFormState {
    name: string;
    email: string;
    phone: string;
    dob: string;
    protocol: string;
    risk: RiskLevel;
    nextSession: string;
}

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────

const CLIENTS: Client[] = [
    {
        id: '1',
        name: 'Client 01',
        initials: 'C1',
        dob: 'Profile pending',
        email: '',
        phone: '',
        protocol: 'Recovery Support Preview',
        adherence: 92,
        risk: 'stable',
        nextSession: 'Today, 14:00',
        joinedDate: 'Preview record',
        totalSessions: 22,
        previewOnly: true,
        sessions: [
            { id: 's1', date: '12 Feb 2026', modality: 'Guided session', duration: '60 min', notes: 'Sample session note for route preview only. Confirm the authenticated record before action.', outcome: 'good' },
            { id: 's2', date: '05 Feb 2026', modality: 'Protocol review', duration: '45 min', notes: 'Sample adherence checkpoint. Keep live client notes inside the authenticated workspace.', outcome: 'neutral' },
            { id: 's3', date: '28 Jan 2026', modality: 'Workspace demo',   duration: '30 min', notes: 'Sample activity entry used to show the client timeline layout.', outcome: 'good' },
        ],
        notes: [
            { id: 'n1', author: 'Nexus Preview', date: '12 Feb 2026', text: 'Sample operator note. Confirm ownership and record status after sign-in.' },
            { id: 'n2', author: 'Nexus Preview', date: '10 Jan 2026', text: 'Sample intake checkpoint. Replace with authenticated workspace data before live use.' },
        ],
    },
    {
        id: '2',
        name: 'Client 02',
        initials: 'C2',
        dob: 'Profile pending',
        email: '',
        phone: '',
        protocol: 'Hydrogen Setup Preview',
        adherence: 65,
        risk: 'monitor',
        nextSession: 'Tomorrow, 09:00',
        joinedDate: 'Preview record',
        totalSessions: 11,
        previewOnly: true,
        sessions: [
            { id: 's4', date: '10 Feb 2026', modality: 'Guided session', duration: '60 min', notes: 'Sample scheduling note. Use authenticated workspace data for live follow-up.', outcome: 'neutral' },
            { id: 's5', date: '24 Jan 2026', modality: 'Protocol review', duration: '45 min', notes: 'Sample adherence note. This preview does not represent a real client record.', outcome: 'neutral' },
        ],
        notes: [
            { id: 'n3', author: 'Nexus Preview', date: '11 Feb 2026', text: 'Sample follow-up note. Review the live record after account access.' },
        ],
    },
    {
        id: '3',
        name: 'Client 03',
        initials: 'C3',
        dob: 'Profile pending',
        email: '',
        phone: '',
        protocol: 'Pending Review',
        adherence: 0,
        risk: 'high',
        nextSession: 'Unscheduled',
        joinedDate: 'Preview record',
        totalSessions: 1,
        previewOnly: true,
        sessions: [
            { id: 's6', date: '20 Jan 2026', modality: 'Intake review', duration: '30 min', notes: 'Sample manual-review entry. Confirm live clearance and scheduling status inside the authenticated workspace.', outcome: 'neutral' },
        ],
        notes: [
            { id: 'n4', author: 'Nexus Preview', date: '20 Jan 2026', text: 'Sample review note. Keep detailed client history in the authenticated system of record.' },
        ],
    },
    {
        id: '4',
        name: 'Client 04',
        initials: 'C4',
        dob: 'Profile pending',
        email: '',
        phone: '',
        protocol: 'Performance Support Preview',
        adherence: 88,
        risk: 'stable',
        nextSession: 'Fri, 10:00',
        joinedDate: 'Preview record',
        totalSessions: 31,
        previewOnly: true,
        sessions: [
            { id: 's7', date: '13 Feb 2026', modality: 'Guided session',   duration: '30 min', notes: 'Sample activity entry for route preview only.', outcome: 'good' },
            { id: 's8', date: '11 Feb 2026', modality: 'Protocol review',  duration: '45 min', notes: 'Sample record note. Validate the authenticated session record after sign-in.', outcome: 'good' },
        ],
        notes: [
            { id: 'n5', author: 'Nexus Preview', date: '13 Feb 2026', text: 'Sample planning note. Replace with authenticated operator notes before live use.' },
        ],
    },
];

type DetailTab = 'overview' | 'sessions' | 'notes';

const DEFAULT_NEW_CLIENT_FORM: NewClientFormState = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    protocol: '',
    risk: 'stable',
    nextSession: '',
};

const INITIAL_NEXUS_CLIENTS_ACTION_STATE: NexusClientsIntakeDraftActionResult = {
    success: false,
    status: 'auth_required',
    message: 'Client intake draft boundary has not been requested yet.',
    persisted: false,
    futureTable: null,
    persistenceMode: 'blocked',
};

const CLIENTS_ACTION_STATUS_ID = 'nexus-clients-action-status';
const CLIENTS_LIST_ACTION_STATUS_ID = 'nexus-clients-list-action-status';
const CLIENTS_LIST_ACTION_STATUS_LABEL = 'Nexus clients list action status';
const CLIENTS_ROUTE_ACTION_STATUS_ID = 'nexus-clients-route-action-status';
const CLIENTS_ROUTE_ACTION_STATUS_LABEL = 'Nexus clients route action status';
const CLIENTS_ROUTE_ACTION_READY_STATUS = 'Nexus clients route handoffs are ready.';
const CLIENTS_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.clients.href;
const CLIENTS_DOCUMENTS_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.docs.href;

type ClientsRouteAction = 'sign_in_live_records' | 'contact_workspace_access' | 'empty_state_contact';

const getClientsRouteActionStatusMessage = (
    action: ClientsRouteAction,
    destination: string,
    phase: 'focus' | 'click'
) => {
    const messages: Record<ClientsRouteAction, { focus: string; click: string }> = {
        sign_in_live_records: {
            focus: `Sign in for live records selected. Opens ${destination}.`,
            click: `Opening sign-in for live records at ${destination}.`,
        },
        contact_workspace_access: {
            focus: `Workspace access contact selected. Opens ${destination}.`,
            click: `Opening Hylono contact route for workspace access at ${destination}.`,
        },
        empty_state_contact: {
            focus: `Empty clients view contact handoff selected. Opens ${destination}.`,
            click: `Opening Hylono contact route from the empty clients view at ${destination}.`,
        },
    };

    return messages[action][phase];
};

const CLIENTS_ACTION_STATUS_LABELS: Record<NexusClientsServerActionStatus, string> = {
    validation_error: 'Input check failed',
    auth_required: 'Authentication required',
    service_profile_required: 'Service profile required',
    role_not_allowed: 'Role not allowed',
    persistence_error: 'Private storage error',
    private_write_ready: 'Private write ready',
};

const PERSISTED_INTAKE_DRAFTS_STATUS_COPY: Record<PersistedIntakeDraftsStatus, string> = {
    loaded: 'Authenticated client intake draft history is connected for signed-in service profiles.',
    database_error: 'Authenticated client intake draft storage could not load, so this screen keeps sample records only.',
    database_not_configured: 'Authenticated client intake draft storage is ready for deployment database configuration.',
    auth_context_missing: 'Authenticated client intake draft storage waits for sign-in and a verified Nexus service profile.',
    role_not_allowed: 'Client intake draft history is manager-only for this Nexus service role.',
};

const NEXUS_CLIENTS_PREVIEW_NOTE_DATE_LABEL = '20 Jan 2026';
const NEXUS_CLIENTS_PREVIEW_JOINED_DATE_LABEL = 'Jan 2026';

const buildNexusClientsPreviewId = (prefix: 'client' | 'note', sequence: number) =>
    `${prefix}-preview-${String(sequence).padStart(2, '0')}`;

const resolveClientId = (clients: Client[], value?: string | null) => {
    if (!value) {
        return null;
    }

    return clients.some((client) => client.id === value) ? value : null;
};

const toInitials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');

const countProvidedIdentityFields = (form: NewClientFormState) =>
    [form.name, form.email, form.phone].filter((value) => value.trim().length > 0).length;

const buildIntakeDraftFormData = (form: NewClientFormState) => {
    const formData = new FormData();
    formData.set('risk', form.risk);
    formData.set('identityFieldCount', String(countProvidedIdentityFields(form)));
    formData.set('protocolProvided', String(form.protocol.trim().length > 0));
    formData.set('dobProvided', String(form.dob.trim().length > 0));
    formData.set('nextSessionProvided', String(form.nextSession.trim().length > 0));
    formData.set('previewOnly', 'true');
    return formData;
};

const focusControlClass =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0';
const previewActionClass =
    'inline-flex min-h-11 items-center justify-center rounded-[14px] px-5 py-2.5 text-sm font-semibold transition-all shadow-xs motion-reduce:transition-none motion-reduce:duration-0';

const trackNexusClientsEvent = (eventName: string, properties: Record<string, unknown>) => {
    analytics.capture(eventName, {
        route: CLIENTS_ROUTE_HREF,
        ...properties,
    });
};

const resolveIntakeReadinessStatus = (
    highRiskCount: number,
    monitorCount: number,
    persistedDraftCount: number
) => {
    if (highRiskCount > 0) {
        return 'High-risk preview records need manager review before live intake.';
    }

    if (monitorCount > 0 || persistedDraftCount > 0) {
        return 'Follow-up queue ready for authenticated manager review.';
    }

    return 'Ready for private intake draft after sign-in.';
};

const buildIntakeReadinessBridge = (
    clients: Client[],
    selectedId: string | null,
    persistedDraftCount: number
) => {
    const monitorClientCount = clients.filter((client) => client.risk === 'monitor').length;
    const highRiskClientCount = clients.filter((client) => client.risk === 'high').length;
    const selectedClientRisk = clients.find((client) => client.id === selectedId)?.risk ?? 'none';

    return {
        sampleClientCount: clients.length,
        reviewClientCount: monitorClientCount + highRiskClientCount,
        highRiskClientCount,
        persistedDraftCount,
        selectedClientRisk,
        status: resolveIntakeReadinessStatus(
            highRiskClientCount,
            monitorClientCount,
            persistedDraftCount
        ),
    };
};

const getModalityBadgeForProtocol = (protocol: string) => {
    const lower = protocol.toLowerCase();
    if (lower.includes('recovery') || lower.includes('hbot')) {
        return {
            label: 'HBOT Modality',
            badgeClass: 'border border-[#06b6d4]/20 bg-[#06b6d4]/10 text-cyan-700',
        };
    }
    if (lower.includes('hydrogen')) {
        return {
            label: 'Hydrogen Infusion',
            badgeClass: 'border border-[#14b8a6]/20 bg-[#14b8a6]/10 text-teal-700',
        };
    }
    if (lower.includes('performance') || lower.includes('light')) {
        return {
            label: 'Red Light (RLT)',
            badgeClass: 'border border-[#f43f5e]/20 bg-[#f43f5e]/10 text-rose-700',
        };
    }
    return {
        label: 'PEMF Cellular',
        badgeClass: 'border border-[#a855f7]/20 bg-[#a855f7]/10 text-purple-700',
    };
};

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

const RiskBadge: React.FC<{ risk: RiskLevel; size?: 'sm' | 'md' }> = ({ risk, size = 'md' }) => {
    const base = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
    if (risk === 'high') {
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-[9999px] border border-[#f43f5e]/20 bg-[#f43f5e]/10 font-bold uppercase text-[#be123c] ${base}`}>
                <AlertTriangle className="w-3 h-3" /> High Risk
            </span>
        );
    }
    if (risk === 'monitor') {
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-[9999px] border border-[#f59e0b]/20 bg-[#f59e0b]/10 font-bold uppercase text-[#b45309] ${base}`}>
                <Activity className="w-3 h-3" /> Monitor
            </span>
        );
    }
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-[9999px] border border-[#10b981]/20 bg-[#10b981]/10 font-bold uppercase text-[#047857] ${base}`}>
            <CheckCircle2 className="w-3 h-3" /> Stable
        </span>
    );
};

const AdherenceBar: React.FC<{ value: number; compact?: boolean }> = ({ value, compact }) => {
    const color = value >= 80 ? 'bg-[#10b981]' : value >= 50 ? 'bg-[#f59e0b]' : 'bg-[#f43f5e]';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 overflow-hidden rounded-[4px] bg-[#f1f5f9]">
                <div className={`h-full rounded-[4px] transition-all ${color}`} style={{ width: `${value}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-xs font-semibold text-[#334155]">{value}%</span>
        </div>
    );
};

const OutcomeDot: React.FC<{ outcome: Session['outcome'] }> = ({ outcome }) => {
    if (outcome === 'good')    return <span className="w-2 h-2 rounded-[2px] bg-[#10b981] shrink-0 mt-1.5" />;
    if (outcome === 'poor')    return <span className="w-2 h-2 rounded-[2px] bg-[#f43f5e] shrink-0 mt-1.5" />;
    return <span className="w-2 h-2 rounded-[2px] bg-[#94a3b8] shrink-0 mt-1.5" />;
};

const CreateClientModal: React.FC<{
    open: boolean;
    onClose: () => void;
    onCreate: (form: NewClientFormState) => void;
    actionStatusId: string;
}> = ({ open, onClose, onCreate, actionStatusId }) => {
    const [form, setForm] = useState<NewClientFormState>(DEFAULT_NEW_CLIENT_FORM);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (open) {
            setForm(DEFAULT_NEW_CLIENT_FORM);
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            event.preventDefault();
            onClose();
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    const updateField = useCallback((field: keyof NewClientFormState, value: NewClientFormState[keyof NewClientFormState]) => {
        setForm((current) => ({ ...current, [field]: value }));
    }, []);

    const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onCreate({
            ...form,
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            dob: form.dob.trim(),
            protocol: form.protocol.trim(),
            nextSession: form.nextSession.trim(),
        });
    }, [form, onCreate]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.button
                        type="button"
                        aria-label="Close sample-record modal"
                        aria-describedby={actionStatusId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-[#0f172a]/40 backdrop-blur-sm"
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Create sample record"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-x-4 top-6 z-50 mx-auto w-auto max-w-2xl rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] text-[#0f172a] shadow-[0_20px_50px_rgba(0,0,0,0.15)] lg:top-12"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-[#e2e8f0] px-6 py-5">
                            <div>
                                <div className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#06b6d4]/20 bg-[#06b6d4]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                                    <Sparkles className="w-3 h-3 text-cyan-600" />
                                    Preview Intake Workflow
                                </div>
                                <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#0f172a]">
                                    Create sample record
                                </h2>
                                <p className="mt-1 text-sm text-[#64748b]">
                                    Use draft fields to preview the intake workflow. Nothing here creates a live
                                    client record. Use sample labels, not real personal details.
                                </p>
                            </div>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={onClose}
                                className={`min-h-11 min-w-11 rounded-[10px] p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] ${focusControlClass}`}
                                aria-label="Close sample-record modal"
                                aria-describedby={actionStatusId}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            aria-describedby={actionStatusId}
                            className="space-y-5 px-6 py-6"
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#475569]">
                                        Full name
                                    </span>
                                    <input
                                        required
                                        value={form.name}
                                        aria-describedby={actionStatusId}
                                        onChange={(event) => updateField('name', event.target.value)}
                                        placeholder="Sample client label"
                                        className={`min-h-11 w-full rounded-[12px] border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] ${focusControlClass}`}
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#475569]">
                                        Email
                                    </span>
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        aria-describedby={actionStatusId}
                                        onChange={(event) => updateField('email', event.target.value)}
                                        placeholder="sample@example.com"
                                        className={`min-h-11 w-full rounded-[12px] border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] ${focusControlClass}`}
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#475569]">
                                        Phone
                                    </span>
                                    <input
                                        required
                                        value={form.phone}
                                        aria-describedby={actionStatusId}
                                        onChange={(event) => updateField('phone', event.target.value)}
                                        placeholder="Phone number for draft only"
                                        className={`min-h-11 w-full rounded-[12px] border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] ${focusControlClass}`}
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#475569]">
                                        Date of birth
                                    </span>
                                    <input
                                        value={form.dob}
                                        aria-describedby={actionStatusId}
                                        onChange={(event) => updateField('dob', event.target.value)}
                                        placeholder="Optional age range or note"
                                        className={`min-h-11 w-full rounded-[12px] border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] ${focusControlClass}`}
                                    />
                                </label>
                                <label className="block md:col-span-2">
                                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#475569]">
                                        Protocol
                                    </span>
                                    <input
                                        required
                                        value={form.protocol}
                                        aria-describedby={actionStatusId}
                                        onChange={(event) => updateField('protocol', event.target.value)}
                                        placeholder="Sample protocol label"
                                        className={`min-h-11 w-full rounded-[12px] border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] ${focusControlClass}`}
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#475569]">
                                        Risk tier
                                    </span>
                                    <select
                                        value={form.risk}
                                        aria-describedby={actionStatusId}
                                        onChange={(event) => updateField('risk', event.target.value as RiskLevel)}
                                        className={`min-h-11 w-full rounded-[12px] border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0f172a] outline-none transition-colors focus:border-cyan-500 focus:bg-[#ffffff] ${focusControlClass}`}
                                    >
                                        <option value="stable">Stable</option>
                                        <option value="monitor">Monitor</option>
                                        <option value="high">High risk</option>
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#475569]">
                                        Next session
                                    </span>
                                    <input
                                        value={form.nextSession}
                                        aria-describedby={actionStatusId}
                                        onChange={(event) => updateField('nextSession', event.target.value)}
                                        placeholder="Draft scheduling note"
                                        className={`min-h-11 w-full rounded-[12px] border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] ${focusControlClass}`}
                                    />
                                </label>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-[#e2e8f0] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-describedby={actionStatusId}
                                    className={`min-h-11 rounded-[12px] border border-[#e2e8f0] bg-[#ffffff] px-5 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] ${focusControlClass}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    aria-describedby={actionStatusId}
                                    className={`min-h-11 rounded-[12px] bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-colors hover:bg-[#1e293b] ${focusControlClass}`}
                                >
                                    Save sample record
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ─────────────────────────────────────────────────────────
// CLIENT DETAIL PANEL
// ─────────────────────────────────────────────────────────

const ClientDetail: React.FC<{
    client: Client;
    accessHref: string;
    onClose: () => void;
    listActionStatusId: string;
    detailSurface: 'desktop' | 'mobile';
    autoFocusClose?: boolean;
}> = ({
    client,
    accessHref,
    onClose,
    listActionStatusId,
    detailSurface,
    autoFocusClose = false,
}) => {
    const [tab, setTab] = useState<DetailTab>('overview');
    const [newNote, setNewNote] = useState('');
    const [localNotes, setLocalNotes] = useState<ClientNote[]>(client.notes);
    const [detailActionStatus, setDetailActionStatus] = useState(
        `Client detail preview ready for ${client.name}.`
    );
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const detailActionStatusId = `nexus-client-detail-${detailSurface}-action-status-${client.id}`;
    const modalityInfo = getModalityBadgeForProtocol(client.protocol);

    useEffect(() => {
        const isMobileViewport =
            typeof window !== 'undefined'
            && typeof window.matchMedia === 'function'
            && window.matchMedia('(max-width: 1023px)').matches;

        if (!autoFocusClose || !isMobileViewport) {
            return;
        }

        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            event.preventDefault();
            onClose();
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [autoFocusClose, client.id, onClose]);

    const handleAddNote = useCallback(() => {
        const noteText = newNote.trim();
        if (!noteText) return;
        setLocalNotes(prev => [
            {
                id: buildNexusClientsPreviewId('note', prev.length + 1),
                author: 'Nexus Preview',
                date: NEXUS_CLIENTS_PREVIEW_NOTE_DATE_LABEL,
                text: noteText,
            },
            ...prev,
        ]);
        setNewNote('');
        setDetailActionStatus(
            `Sample note saved locally for ${client.name}. Sign in before writing live client notes.`
        );
    }, [client.name, newNote]);

    const tabs: { id: DetailTab; label: string; icon: React.ElementType }[] = [
        { id: 'overview',  label: 'Overview',  icon: User },
        { id: 'sessions',  label: 'Sessions',  icon: ClipboardList },
        { id: 'notes',     label: 'Notes',     icon: StickyNote },
    ];

    return (
        <div
            role="region"
            aria-label={`Client details for ${client.name}`}
            className="flex h-full flex-col overflow-hidden border-l border-[#e2e8f0] bg-[#ffffff] text-[#0f172a]"
        >
            {/* Header */}
            <div className="shrink-0 border-b border-[#e2e8f0] px-6 py-5 bg-[#ffffff]">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[#06b6d4]/[0.25] bg-gradient-to-br from-[#ffffff] to-[#ecfeff] text-sm font-extrabold font-mono text-cyan-900 shadow-2xs">
                            {client.initials}
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-[9999px] ring-2 ring-[#ffffff] ${
                                client.risk === 'high' ? 'bg-[#f43f5e]' : client.risk === 'monitor' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                            }`} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="break-words font-extrabold font-sans text-[#0f172a] text-lg">{client.name}</h2>
                            <p className="break-words text-xs text-[#64748b]">{client.dob}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <RiskBadge risk={client.risk} size="sm" />
                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={() => {
                                setDetailActionStatus(`Closing ${client.name} detail preview.`);
                                onClose();
                            }}
                            className={`min-h-11 min-w-11 rounded-[10px] p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] ${focusControlClass}`}
                            aria-label="Close panel"
                            aria-describedby={`${listActionStatusId} ${detailActionStatusId}`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Contact row */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#f1f5f9]">
                    {client.previewOnly ? (
                        <>
                            <span className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] bg-[#f8fafc] px-3 py-1 text-xs text-[#64748b] border border-[#e2e8f0]">
                                <Mail className="w-3.5 h-3.5 text-cyan-600" />
                                <span className="break-words">Preview email hidden</span>
                            </span>
                            <span className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] bg-[#f8fafc] px-3 py-1 text-xs text-[#64748b] border border-[#e2e8f0]">
                                <Phone className="w-3.5 h-3.5 text-cyan-600" />
                                <span>Preview phone hidden</span>
                            </span>
                        </>
                    ) : (
                        <>
                            <a
                                href={`mailto:${client.email}`}
                                aria-describedby={detailActionStatusId}
                                className={`inline-flex min-h-11 items-center gap-1.5 text-xs text-[#334155] transition-colors hover:text-cyan-700 ${focusControlClass}`}
                            >
                                <Mail className="w-3.5 h-3.5" />
                                <span className="break-words">{client.email}</span>
                            </a>
                            <a
                                href={`tel:${client.phone}`}
                                aria-describedby={detailActionStatusId}
                                className={`inline-flex min-h-11 items-center gap-1.5 text-xs text-[#334155] transition-colors hover:text-cyan-700 ${focusControlClass}`}
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{client.phone}</span>
                            </a>
                        </>
                    )}
                </div>
                <p
                    id={detailActionStatusId}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`Nexus client detail ${detailSurface} action status`}
                    className="sr-only"
                >
                    {detailActionStatus}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 border-b border-[#e2e8f0] px-6 bg-[#f8fafc]" role="tablist" aria-label="Client detail sections">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === t.id}
                        aria-describedby={detailActionStatusId}
                        onFocus={() =>
                            setDetailActionStatus(`${t.label} detail tab ready for ${client.name}.`)
                        }
                        onClick={() => {
                            setTab(t.id);
                            setDetailActionStatus(
                                `${t.label} detail tab opened for ${client.name}. Preview only.`
                            );
                        }}
                        className={`flex min-h-11 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${focusControlClass} ${
                            tab === t.id
                                ? 'border-cyan-600 text-cyan-800'
                                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                        }`}
                    >
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto bg-[#ffffff]">
                <AnimatePresence mode="wait">
                    {tab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="p-6 space-y-5"
                        >
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-center shadow-xs">
                                    <p className="text-xl font-extrabold text-[#0f172a]">{client.totalSessions}</p>
                                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Sessions</p>
                                </div>
                                <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-center shadow-xs">
                                    <p className="text-xl font-extrabold text-[#0f172a]">{client.adherence}%</p>
                                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Adherence</p>
                                </div>
                                <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-center shadow-xs">
                                    <p className="mt-0.5 text-[13px] font-bold leading-tight text-[#0f172a]">{client.joinedDate}</p>
                                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Joined</p>
                                </div>
                            </div>

                            {/* Current protocol */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Current Protocol</p>
                                    <span className={`rounded-[9999px] px-2 py-0.5 text-[10px] font-bold uppercase ${modalityInfo.badgeClass}`}>
                                        {modalityInfo.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-3 shadow-xs">
                                    <span className="w-2 h-2 shrink-0 animate-pulse rounded-[9999px] bg-[#06b6d4]" />
                                    <span className="text-sm font-semibold text-[#0f172a]">{client.protocol}</span>
                                </div>
                            </div>

                            {/* Adherence */}
                            <div>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Adherence Telemetry</p>
                                <AdherenceBar value={client.adherence} />
                                {client.adherence < 70 && (
                                    <p className="mt-1.5 text-[10px] font-semibold text-[#b45309] flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-[#b45309]" />
                                        Below target. Consider a clinical check-in call.
                                    </p>
                                )}
                            </div>

                            {/* Next session */}
                            <div>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Next Session</p>
                                <div className={`flex items-center gap-2.5 px-3.5 py-3 rounded-[14px] border shadow-xs ${
                                    client.nextSession === 'Unscheduled'
                                        ? 'border-[#f43f5e]/20 bg-[#f43f5e]/10 text-[#be123c]'
                                        : 'border-[#10b981]/20 bg-[#10b981]/10 text-[#047857]'
                                }`}>
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span className="text-sm font-bold">{client.nextSession}</span>
                                </div>
                            </div>

                            {/* High-risk alert */}
                            {client.risk === 'high' && (
                                <div className="flex items-start gap-3 rounded-[14px] border border-[#f43f5e]/20 bg-[#f43f5e]/10 p-4">
                                    <AlertTriangle className="w-4 h-4 text-[#be123c] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-[#be123c]">Manual review required</p>
                                        <p className="mt-0.5 text-[11px] text-[#be123c] leading-relaxed">
                                            Review the sample notes and confirm live clearance before scheduling another session.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                                <Link
                                    href={accessHref}
                                    aria-describedby={detailActionStatusId}
                                    onFocus={() =>
                                        setDetailActionStatus(
                                            `Sign in to schedule selected for ${client.name}. Opens ${accessHref}.`
                                        )
                                    }
                                    onClick={() => {
                                        setDetailActionStatus(
                                            `Opening sign-in route to schedule ${client.name}.`
                                        );
                                        trackNexusClientsEvent('nexus_clients_detail_action_clicked', {
                                            action: 'sign_in_schedule',
                                            client_id: client.id,
                                            preview_record: Boolean(client.previewOnly),
                                            destination: accessHref,
                                        });
                                    }}
                                    className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-[14px] bg-[#0f172a] px-4 py-2.5 text-center text-xs font-bold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] ${focusControlClass}`}
                                >
                                    Sign in to schedule
                                </Link>
                                <Link
                                    href={CLIENTS_DOCUMENTS_ROUTE_HREF}
                                    aria-describedby={detailActionStatusId}
                                    onFocus={() =>
                                        setDetailActionStatus(
                                            `Sample documents route selected for ${client.name}. Opens ${CLIENTS_DOCUMENTS_ROUTE_HREF}.`
                                        )
                                    }
                                    onClick={() => {
                                        setDetailActionStatus(
                                            `Opening sample documents route for ${client.name}.`
                                        );
                                        trackNexusClientsEvent('nexus_clients_detail_action_clicked', {
                                            action: 'view_sample_documents',
                                            client_id: client.id,
                                            preview_record: Boolean(client.previewOnly),
                                            destination: CLIENTS_DOCUMENTS_ROUTE_HREF,
                                        });
                                    }}
                                    className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-center text-xs font-bold text-[#334155] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] ${focusControlClass}`}
                                >
                                    View sample documents
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {tab === 'sessions' && (
                        <motion.div
                            key="sessions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                                    {client.sessions.length} session{client.sessions.length !== 1 ? 's' : ''} recorded
                                </p>
                                <Link
                                    href={accessHref}
                                    aria-describedby={detailActionStatusId}
                                    onFocus={() =>
                                        setDetailActionStatus(
                                            `Sign in to log a session selected for ${client.name}. Opens ${accessHref}.`
                                        )
                                    }
                                    onClick={() => {
                                        setDetailActionStatus(
                                            `Opening sign-in route to log a session for ${client.name}.`
                                        );
                                        trackNexusClientsEvent('nexus_clients_detail_action_clicked', {
                                            action: 'sign_in_log_session',
                                            client_id: client.id,
                                            preview_record: Boolean(client.previewOnly),
                                            destination: accessHref,
                                        });
                                    }}
                                    className={`inline-flex min-h-11 items-center gap-1 text-xs font-bold text-cyan-700 transition-colors hover:text-cyan-900 ${focusControlClass}`}
                                >
                                    <Plus className="w-3.5 h-3.5" /> Sign in to log session
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {client.sessions.map((session, idx) => (
                                    <div
                                        key={session.id}
                                        className="relative rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-xs transition-all hover:border-cyan-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
                                    >
                                        {/* Top Meta Header: Modality + Phase Badge + Duration Chip */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f1f5f9] pb-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <OutcomeDot outcome={session.outcome} />
                                                <span className="text-xs font-bold text-[#0f172a]">
                                                    {session.modality}
                                                </span>
                                                <span className="rounded-[6px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                                                    {session.phase ?? (idx === 0 ? 'Plateau Saturation' : idx === 1 ? 'Induction Ramp' : 'Decompression Baseline')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 text-[10px] font-mono font-bold text-[#334155]">
                                                    <Clock className="w-3 h-3 text-[#64748b]" />
                                                    {session.duration} · {session.modality.includes('Hydrogen') ? '99.99% H2' : '1.82 ATA'}
                                                </span>
                                                <span className="text-[10px] font-mono text-[#64748b] shrink-0">
                                                    {session.date}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Clinician Notes & Vital Signs */}
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs leading-relaxed text-[#334155]">
                                                {session.notes}
                                            </p>
                                            
                                            {/* Vital Signs & Clinician Sign-off Bar */}
                                            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#f1f5f9] bg-[#f8fafc] px-3 py-2 text-[10px]">
                                                <div className="flex items-center gap-2 font-mono text-[#475569]">
                                                    <span className="font-bold text-[#0f172a]">Vitals:</span>
                                                    <span>{session.vitals ?? (idx === 0 ? 'BP 118/76 · SpO2 99.2% · HR 64' : 'BP 120/78 · SpO2 98.8% · HR 68')}</span>
                                                </div>
                                                <div className="flex items-center gap-1 font-semibold text-cyan-800">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>{session.provider ?? 'Signed: Dr. E. Rostova (Nominal)'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {tab === 'notes' && (
                        <motion.div
                            key="notes"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="p-6"
                        >
                            {/* Add note */}
                            <div className="mb-5">
                                <textarea
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                    onFocus={() =>
                                        setDetailActionStatus(
                                            `Local preview note editor selected for ${client.name}.`
                                        )
                                    }
                                    placeholder="Add an operator note..."
                                    rows={3}
                                    aria-describedby={detailActionStatusId}
                                    className={`w-full resize-none rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-3 text-sm text-[#0f172a] transition-colors placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] focus:outline-none ${focusControlClass}`}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    aria-describedby={detailActionStatusId}
                                    className={`mt-2 min-h-11 w-full rounded-[14px] bg-[#0f172a] py-2.5 text-xs font-bold text-[#ffffff] transition-all hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-40 shadow-xs ${focusControlClass}`}
                                >
                                    Save Note
                                </button>
                            </div>

                            {/* Notes list */}
                            <div className="space-y-3">
                                {localNotes.map((note) => (
                                    <div key={note.id} className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-xs">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-[#0f172a]">{note.author}</span>
                                            <span className="text-[10px] text-[#64748b]">{note.date}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-[#334155]">{note.text}</p>
                                    </div>
                                ))}
                                {localNotes.length === 0 && (
                                    <p className="py-6 text-center text-xs text-[#94a3b8]">No notes yet.</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// MAIN NEXUS COMPONENT
// ─────────────────────────────────────────────────────────

export const Nexus: React.FC<NexusProps> = ({
    initialRegistrationOpen = false,
    initialSelectedClientId,
    createIntakeDraftAction,
    initialPersistedIntakeDrafts = [],
    persistedIntakeDraftsStatus = 'auth_context_missing',
}) => {
    const router = useRouter();
    const pathname = usePathname() ?? CLIENTS_ROUTE_HREF;
    const searchParams = useSearchParams();
    const [clients, setClients] = useState<Client[]>(CLIENTS);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterValue>('all');
    const [selectedId, setSelectedId] = useState<string | null>(() =>
        resolveClientId(CLIENTS, initialSelectedClientId),
    );
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(initialRegistrationOpen);
    const [serverActionResult, setServerActionResult] =
        useState<NexusClientsIntakeDraftActionResult | null>(null);
    const [serverActionPending, setServerActionPending] = useState(false);
    const [routeActionStatus, setRouteActionStatus] = useState(CLIENTS_ROUTE_ACTION_READY_STATUS);
    const lastSyncedSelectedClientId = useRef(initialSelectedClientId);
    const registrationTriggerRef = useRef<HTMLButtonElement | null>(null);
    const selectedClientTriggerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (lastSyncedSelectedClientId.current === initialSelectedClientId) {
            return;
        }

        lastSyncedSelectedClientId.current = initialSelectedClientId;
        setSelectedId(resolveClientId(clients, initialSelectedClientId));
    }, [clients, initialSelectedClientId]);

    useEffect(() => {
        setIsRegistrationOpen(initialRegistrationOpen);
    }, [initialRegistrationOpen]);

    const syncRouteState = useCallback((nextSelectedId: string | null, nextRegistrationOpen: boolean) => {
        const params = new URLSearchParams(searchParams?.toString() ?? '');

        if (nextSelectedId) {
            params.set('patient', nextSelectedId);
        } else {
            params.delete('patient');
        }

        if (nextRegistrationOpen) {
            params.set('action', 'new');
        } else {
            params.delete('action');
        }

        const nextQuery = params.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }, [pathname, router, searchParams]);

    const handleCloseSelectedClient = useCallback(() => {
        if (selectedId) {
            trackNexusClientsEvent('nexus_clients_record_transition_clicked', {
                action: 'close_record',
                client_id: selectedId,
                destination: CLIENTS_ROUTE_HREF,
            });
        }
        setSelectedId(null);
        syncRouteState(null, false);
        selectedClientTriggerRef.current?.focus();
    }, [selectedId, syncRouteState]);

    const handleSelectClient = useCallback((clientId: string, trigger?: HTMLButtonElement) => {
        selectedClientTriggerRef.current = trigger ?? selectedClientTriggerRef.current;
        setIsRegistrationOpen(false);
        const nextSelectedId = selectedId === clientId ? null : clientId;
        const selectedClientRecord = clients.find((client) => client.id === clientId);

        trackNexusClientsEvent('nexus_clients_record_transition_clicked', {
            action: nextSelectedId ? 'open_record' : 'close_record',
            client_id: clientId,
            risk: selectedClientRecord?.risk ?? 'unknown',
            preview_record: true,
            destination: nextSelectedId
                ? `${CLIENTS_ROUTE_HREF}?patient=${encodeURIComponent(clientId)}`
                : CLIENTS_ROUTE_HREF,
        });

        setSelectedId(nextSelectedId);
        syncRouteState(nextSelectedId, false);
        if (!nextSelectedId) {
            selectedClientTriggerRef.current?.focus();
        }
    }, [clients, selectedId, syncRouteState]);

    const handleOpenRegistration = useCallback(() => {
        const bridge = buildIntakeReadinessBridge(
            clients,
            selectedId,
            initialPersistedIntakeDrafts.length
        );

        trackNexusClientsEvent('nexus_clients_route_cta_clicked', {
            action: 'open_sample_record_draft',
            destination: selectedId
                ? `${CLIENTS_ROUTE_HREF}?patient=${encodeURIComponent(selectedId)}&action=new`
                : `${CLIENTS_ROUTE_HREF}?action=new`,
            selected_client_id: selectedId,
            sample_client_count: bridge.sampleClientCount,
            review_client_count: bridge.reviewClientCount,
            high_risk_client_count: bridge.highRiskClientCount,
            persisted_draft_count: bridge.persistedDraftCount,
            selected_client_risk: bridge.selectedClientRisk,
        });
        setIsRegistrationOpen(true);
        syncRouteState(selectedId, true);
    }, [clients, initialPersistedIntakeDrafts.length, selectedId, syncRouteState]);

    const announceClientsRouteAction = useCallback((
        action: ClientsRouteAction,
        destination: string,
        phase: 'focus' | 'click'
    ) => {
        setRouteActionStatus(getClientsRouteActionStatusMessage(action, destination, phase));
    }, []);

    const handleCloseRegistration = useCallback(() => {
        setIsRegistrationOpen(false);
        syncRouteState(selectedId, false);
        registrationTriggerRef.current?.focus();
    }, [selectedId, syncRouteState]);

    const runIntakeDraftBoundary = useCallback(async (
        runner: NexusClientsIntakeDraftActionRunner | undefined,
        formData: FormData
    ) => {
        if (!runner) {
            return;
        }

        setServerActionPending(true);

        try {
            const result = await runner(INITIAL_NEXUS_CLIENTS_ACTION_STATE, formData);
            setServerActionResult(result);
        } catch {
            setServerActionResult({
                success: false,
                status: 'validation_error',
                message: 'Client intake draft boundary could not be checked from this browser preview.',
                persisted: false,
                futureTable: null,
                persistenceMode: 'blocked',
            });
        } finally {
            setServerActionPending(false);
        }
    }, []);

    const handleCreateClient = useCallback((form: NewClientFormState) => {
        const nextClientId = buildNexusClientsPreviewId('client', clients.length + 1);
        const dateLabel = NEXUS_CLIENTS_PREVIEW_NOTE_DATE_LABEL;
        const identityFieldCount = countProvidedIdentityFields(form);
        const bridge = buildIntakeReadinessBridge(
            clients,
            selectedId,
            initialPersistedIntakeDrafts.length
        );

        trackNexusClientsEvent('nexus_clients_route_cta_clicked', {
            action: 'save_sample_record',
            risk: form.risk,
            identity_field_count: identityFieldCount,
            protocol_provided: form.protocol.trim().length > 0,
            dob_provided: form.dob.trim().length > 0,
            next_session_provided: form.nextSession.trim().length > 0,
            preview_record: true,
            sample_client_count: bridge.sampleClientCount,
            review_client_count: bridge.reviewClientCount,
            high_risk_client_count: bridge.highRiskClientCount,
            persisted_draft_count: bridge.persistedDraftCount,
            intake_readiness_status: bridge.status,
        });
        void runIntakeDraftBoundary(
            createIntakeDraftAction,
            buildIntakeDraftFormData(form)
        );

        const nextClient: Client = {
            id: nextClientId,
            name: form.name,
            initials: toInitials(form.name),
            dob: form.dob || 'DOB pending',
            email: form.email,
            phone: form.phone,
            protocol: form.protocol,
            adherence: 0,
            risk: form.risk,
            nextSession: form.nextSession || 'Draft scheduling note',
            sessions: [],
            notes: [
                {
                    id: buildNexusClientsPreviewId('note', 1),
                    author: 'Nexus Preview',
                    date: dateLabel,
                    text: 'Sample record saved in this browser session. Sign in before using live client details or booking a session.',
                },
            ],
            joinedDate: NEXUS_CLIENTS_PREVIEW_JOINED_DATE_LABEL,
            totalSessions: 0,
            previewOnly: true,
        };

        setClients((currentClients) => [nextClient, ...currentClients]);
        setFilter('all');
        setSearch('');
        setSelectedId(nextClientId);
        setIsRegistrationOpen(false);
        syncRouteState(nextClientId, false);
    }, [
        clients,
        createIntakeDraftAction,
        initialPersistedIntakeDrafts.length,
        runIntakeDraftBoundary,
        selectedId,
        syncRouteState,
    ]);

    const filtered = useMemo(() => {
        let list = clients;
        if (filter !== 'all') list = list.filter(c => c.risk === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.protocol.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q),
            );
        }
        return list;
    }, [clients, search, filter]);

    const selectedClient = useMemo(
        () => clients.find(c => c.id === selectedId) ?? null,
        [clients, selectedId],
    );

    const counts = useMemo(() => ({
        total:   clients.length,
        stable:  clients.filter(c => c.risk === 'stable').length,
        monitor: clients.filter(c => c.risk === 'monitor').length,
        high:    clients.filter(c => c.risk === 'high').length,
    }), [clients]);

    const intakeReadinessBridge = useMemo(
        () => buildIntakeReadinessBridge(
            clients,
            selectedId,
            initialPersistedIntakeDrafts.length
        ),
        [clients, initialPersistedIntakeDrafts.length, selectedId]
    );

    const intakeReadinessMetricsLabel = [
        `Client intake aggregate metrics: ${intakeReadinessBridge.sampleClientCount} sample clients`,
        `${intakeReadinessBridge.reviewClientCount} review queue clients`,
        `${intakeReadinessBridge.highRiskClientCount} high risk clients`,
        `${intakeReadinessBridge.persistedDraftCount} persisted intake drafts`,
        `selected client risk ${intakeReadinessBridge.selectedClientRisk}`,
    ].join(', ');

    const hasActiveFilters = search.trim().length > 0 || filter !== 'all';
    const accessHref = buildLoginRedirectPath('/account');
    const actionStatusTitle = serverActionPending
        ? 'Checking private intake draft boundary...'
        : serverActionResult
          ? CLIENTS_ACTION_STATUS_LABELS[serverActionResult.status]
          : 'Ready for sample intake boundary check';
    const actionStatusMessage = serverActionPending
        ? null
        : serverActionResult?.message ??
          'Save a sample record to check whether authenticated private intake draft storage can accept aggregate-only fields.';

    const FILTERS: { value: FilterValue; label: string; count: number }[] = [
        { value: 'all',     label: 'All',     count: counts.total },
        { value: 'stable',  label: 'Stable',  count: counts.stable },
        { value: 'monitor', label: 'Monitor', count: counts.monitor },
        { value: 'high',    label: 'High Risk', count: counts.high },
    ];
    const currentFilterLabel = FILTERS.find((item) => item.value === filter)?.label ?? 'All';
    const normalizedSearch = search.trim();
    const clientsListActionStatusMessage = [
        `Showing ${filtered.length} sample client ${filtered.length === 1 ? 'record' : 'records'}.`,
        `Filter: ${currentFilterLabel}.`,
        `Search: ${normalizedSearch || 'no search term'}.`,
        `Selection: ${selectedClient ? `${selectedClient.name} selected` : 'no sample client record selected'}.`,
    ].join(' ');

    return (
        <PartnerLayout title="Clients">
            <div className="space-y-6 pb-12">
                {/* Screen-reader route action status */}
                <p
                    id={CLIENTS_ROUTE_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={CLIENTS_ROUTE_ACTION_STATUS_LABEL}
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

                {/* 01. GRAND CLINICAL HERO BANNER */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs"
                >
                    {/* Background Clinic Interior Photo */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <Image
                            src="/images/nexus/nexus-hero-clinic.jpg"
                            alt="Valley Wellness Clinic client recovery consultation suite"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-right-top opacity-20 md:opacity-25"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff] via-[#ffffff]/90 to-[#ffffff]/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#06b6d4]/20 bg-[#06b6d4]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-[#06b6d4] animate-pulse" />
                                CLIENT INTELLIGENCE · SAMPLE PROTOCOLS
                            </div>

                            <h1 className="mt-3 text-2xl font-extrabold font-sans tracking-tight text-[#0f172a] sm:text-3xl md:text-4xl">
                                Review sample client records before live workspace access.
                            </h1>

                            <p className="mt-2 text-sm leading-relaxed text-[#475569] sm:text-base">
                                These are sample records only. Sign in before viewing live client details,
                                contact data, or session actions. Active client profiles, adherence telemetry, and draft intake workflows for Valley Wellness Clinic.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href={accessHref}
                                    aria-describedby={CLIENTS_ROUTE_ACTION_STATUS_ID}
                                    onFocus={() =>
                                        announceClientsRouteAction('sign_in_live_records', accessHref, 'focus')
                                    }
                                    onClick={() => {
                                        announceClientsRouteAction('sign_in_live_records', accessHref, 'click');
                                        trackNexusClientsEvent('nexus_clients_route_cta_clicked', {
                                            action: 'sign_in_live_records',
                                            destination: accessHref,
                                        });
                                    }}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    Sign in for live records
                                </Link>

                                <Link
                                    href="/contact"
                                    aria-describedby={CLIENTS_ROUTE_ACTION_STATUS_ID}
                                    onFocus={() =>
                                        announceClientsRouteAction('contact_workspace_access', '/contact', 'focus')
                                    }
                                    onClick={() => {
                                        announceClientsRouteAction('contact_workspace_access', '/contact', 'click');
                                        trackNexusClientsEvent('nexus_clients_route_cta_clicked', {
                                            action: 'contact_workspace_access',
                                            destination: '/contact',
                                        });
                                    }}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-5 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    Contact Hylono about workspace access
                                </Link>
                            </div>
                        </div>

                        {/* Quick Trust / Tour Metric Badge */}
                        <div className="hidden lg:flex flex-col items-end gap-2 text-right">
                            <div className="rounded-[14px] border border-[#e2e8f0] bg-[#ffffff]/80 p-4 shadow-xs backdrop-blur-sm">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Active Clinic</p>
                                <p className="text-base font-extrabold text-[#0f172a]">Valley Wellness Clinic</p>
                                <p className="mt-1 text-xs text-[#10b981] font-semibold flex items-center gap-1 justify-end">
                                    <span className="h-2 w-2 rounded-[9999px] bg-[#10b981]" />
                                    HIPAA-Safe Preview Mode
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 02. OPERATIONAL KPI CARDS */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Sample Clients</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#06b6d4]/10 text-cyan-700">
                                <Users className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-[#0f172a]">{counts.total}</p>
                        <p className="mt-1 text-xs font-semibold text-[#10b981] flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            100% active tour profiles
                        </p>
                    </div>

                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Telemetry Adherence</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#10b981]/10 text-emerald-700">
                                <Activity className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-[#0f172a]">81.7%</p>
                        <p className="mt-1 text-xs font-semibold text-[#10b981] flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +4.2% across modalities
                        </p>
                    </div>

                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Review Queue</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f59e0b]/10 text-amber-700">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-[#0f172a]">{counts.monitor + counts.high}</p>
                        <p className="mt-1 text-xs font-semibold text-[#b45309]">
                            {counts.high} high risk · {counts.monitor} monitor
                        </p>
                    </div>

                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Logged Sessions</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#a855f7]/10 text-purple-700">
                                <ClipboardList className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-[#0f172a]">65</p>
                        <p className="mt-1 text-xs font-semibold text-[#64748b]">
                            HBOT, H2, PEMF & RLT
                        </p>
                    </div>
                </div>

                {/* 03. INTAKE READINESS BRIDGE & AUTHENTICATED STORAGE SECTION */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#06b6d4]/20 bg-[#06b6d4]/10 text-cyan-700">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold font-sans text-[#0f172a]">
                                    Authenticated intake storage
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-[#475569]">
                                    {PERSISTED_INTAKE_DRAFTS_STATUS_COPY[persistedIntakeDraftsStatus]}
                                </p>
                                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#64748b]">
                                    Private boundary stores risk tier and field-presence counts only.
                                </p>
                            </div>
                        </div>

                        <div
                            id={CLIENTS_ACTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-label="Nexus clients action status"
                            className="mt-5 rounded-[14px] border border-[#06b6d4]/20 bg-[#06b6d4]/[0.06] px-4 py-3.5"
                        >
                            <p className="flex items-center gap-2 text-sm font-bold text-cyan-900">
                                {serverActionPending ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin text-cyan-700" />
                                ) : null}
                                {actionStatusTitle}
                            </p>
                            {actionStatusMessage ? (
                                <p className="mt-1 text-xs leading-relaxed text-[#475569]">
                                    {actionStatusMessage}
                                </p>
                            ) : null}
                            {serverActionResult ? (
                                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-cyan-800">
                                    Future table: {serverActionResult.futureTable ?? 'none'} | Persisted:{' '}
                                    {serverActionResult.persisted ? 'yes' : 'no'}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {initialPersistedIntakeDrafts.length > 0 ? (
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                Authenticated intake draft queue
                            </p>
                            <div className="mt-4 space-y-3">
                                {initialPersistedIntakeDrafts.slice(0, 3).map((draft) => (
                                    <div
                                        key={draft.id}
                                        className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-xs text-[#334155] shadow-xs"
                                    >
                                        <p className="font-bold text-[#0f172a]">
                                             {draft.risk} risk | {draft.identityFieldCount} identity fields
                                        </p>
                                        <p className="mt-1 text-[#64748b]">
                                            Protocol {draft.protocolProvided ? 'provided' : 'not provided'} |
                                            DOB {draft.dobProvided ? 'provided' : 'not provided'} |
                                            Next session {draft.nextSessionProvided ? 'provided' : 'not provided'}
                                        </p>
                                        <p className="mt-2 font-bold uppercase tracking-wider text-cyan-700">
                                            {draft.createdAtLabel}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Client intake readiness bridge card */}
                <section
                    aria-label="Client intake readiness bridge"
                    className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#06b6d4]/20 bg-[#06b6d4]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                                <Sparkles className="w-3 h-3 text-cyan-600" />
                                TELEMETRY BRIDGE
                            </div>
                            <h2 className="mt-2 text-base font-extrabold font-sans text-[#0f172a]">
                                {intakeReadinessBridge.status}
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-[#64748b]">
                                Bridge uses sample counts, risk tiers, selected-record state, and persisted draft
                                totals only. Client names, contact details, protocols, notes, and session text stay
                                outside aggregate telemetry.
                            </p>
                        </div>
                        <dl
                            aria-label={intakeReadinessMetricsLabel}
                            className="grid min-w-0 grid-cols-2 gap-2.5 text-xs sm:grid-cols-5 lg:min-w-[540px]"
                        >
                            <div
                                aria-label={`Sample clients: ${intakeReadinessBridge.sampleClientCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-center shadow-xs transition-all hover:border-[#cbd5e1]"
                            >
                                <dt className="font-bold uppercase tracking-wider text-[#64748b] text-[10px]">
                                    Sample clients
                                </dt>
                                <dd className="mt-1 text-lg font-extrabold text-[#0f172a]">
                                    {intakeReadinessBridge.sampleClientCount}
                                </dd>
                            </div>
                            <div
                                aria-label={`Review queue clients: ${intakeReadinessBridge.reviewClientCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-center shadow-xs transition-all hover:border-[#cbd5e1]"
                            >
                                <dt className="font-bold uppercase tracking-wider text-[#64748b] text-[10px]">
                                    Review queue
                                </dt>
                                <dd className="mt-1 text-lg font-extrabold text-[#0f172a]">
                                    {intakeReadinessBridge.reviewClientCount}
                                </dd>
                            </div>
                            <div
                                aria-label={`High risk clients: ${intakeReadinessBridge.highRiskClientCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-center shadow-xs transition-all hover:border-[#cbd5e1]"
                            >
                                <dt className="font-bold uppercase tracking-wider text-[#64748b] text-[10px]">
                                    High risk
                                </dt>
                                <dd className="mt-1 text-lg font-extrabold text-[#0f172a]">
                                    {intakeReadinessBridge.highRiskClientCount}
                                </dd>
                            </div>
                            <div
                                aria-label={`Persisted intake drafts: ${intakeReadinessBridge.persistedDraftCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-center shadow-xs transition-all hover:border-[#cbd5e1]"
                            >
                                <dt className="font-bold uppercase tracking-wider text-[#64748b] text-[10px]">
                                    Drafts
                                </dt>
                                <dd className="mt-1 text-lg font-extrabold text-[#0f172a]">
                                    {intakeReadinessBridge.persistedDraftCount}
                                </dd>
                            </div>
                            <div
                                aria-label={`Selected client risk: ${intakeReadinessBridge.selectedClientRisk}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-center shadow-xs transition-all hover:border-[#cbd5e1]"
                            >
                                <dt className="font-bold uppercase tracking-wider text-[#64748b] text-[10px]">
                                    Selected
                                </dt>
                                <dd className="mt-1 text-lg font-extrabold text-[#0f172a] capitalize">
                                    {intakeReadinessBridge.selectedClientRisk}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {/* 04. CLIENT OPERATIONS HUB: SPLIT PANE WORKSPACE */}
                <div className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs">
                    {/* Toolbar */}
                    <div className="border-b border-[#e2e8f0] bg-[#ffffff] p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                            {/* Search */}
                            <div className="relative w-full sm:w-80">
                                <label htmlFor="nexus-client-search" className="sr-only">
                                    Search clients by name or protocol
                                </label>
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                <input
                                    id="nexus-client-search"
                                    type="search"
                                    placeholder="Search clients by name or protocol..."
                                    value={search}
                                    aria-describedby={CLIENTS_LIST_ACTION_STATUS_ID}
                                    onChange={e => setSearch(e.target.value)}
                                    className={`min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] py-2 pl-10 pr-4 text-sm text-[#0f172a] transition-all placeholder:text-[#94a3b8] focus:border-cyan-500 focus:bg-[#ffffff] focus:outline-none ${focusControlClass}`}
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-1.5" aria-label="Client risk filters">
                                {FILTERS.map(f => (
                                    <button
                                        key={f.value}
                                        type="button"
                                        aria-pressed={filter === f.value}
                                        aria-describedby={CLIENTS_LIST_ACTION_STATUS_ID}
                                        disabled={filter === f.value}
                                        onClick={() => setFilter(f.value)}
                                        className={`min-h-11 rounded-[9999px] px-3.5 py-1.5 text-xs font-semibold transition-all ${focusControlClass} ${
                                            filter === f.value
                                                ? 'cursor-default border border-cyan-600 bg-[#06b6d4]/10 text-cyan-800 font-bold shadow-xs'
                                                : 'border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                                        }`}
                                    >
                                        {f.label}
                                        <span className={`ml-1.5 font-mono ${filter === f.value ? 'text-cyan-900 font-bold' : 'text-[#94a3b8]'}`}>
                                            {f.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Spacer + Add button */}
                            <div className="flex-1" />
                            <button
                                ref={registrationTriggerRef}
                                type="button"
                                aria-describedby={CLIENTS_LIST_ACTION_STATUS_ID}
                                onClick={handleOpenRegistration}
                                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-[14px] bg-[#0f172a] px-4 py-2 text-sm font-semibold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] ${focusControlClass}`}
                            >
                                <Plus className="w-4 h-4" /> Create sample record
                            </button>
                        </div>
                        <p
                            id={CLIENTS_LIST_ACTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label={CLIENTS_LIST_ACTION_STATUS_LABEL}
                            className="sr-only"
                        >
                            {clientsListActionStatusMessage}
                        </p>
                    </div>

                    {/* Split Pane */}
                    <div className="flex min-h-[580px] overflow-hidden">
                        {/* Client list */}
                        <div className={`flex flex-col overflow-hidden bg-[#ffffff] transition-all duration-200 ${
                            selectedClient ? 'w-full lg:w-[440px] xl:w-[480px] shrink-0' : 'flex-1'
                        }`}>
                            {/* Column headers */}
                            <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-[#e2e8f0] bg-[#f8fafc] px-6 py-3 md:grid">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Client / Protocol</p>
                                <p className="w-24 text-center text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Risk Status</p>
                                <p className="w-32 text-right text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Next Session</p>
                            </div>

                            {/* Rows */}
                            <div className="flex-1 divide-y divide-[#f1f5f9] overflow-y-auto">
                                {filtered.length === 0 && (
                                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center">
                                        <p className="text-sm font-bold text-[#0f172a]">No sample client records match this view.</p>
                                        <p className="text-xs leading-relaxed text-[#64748b]">
                                            Clear the filters to return to the preview records, or contact Hylono for workspace access questions.
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                                            {hasActiveFilters ? (
                                                <button
                                                    type="button"
                                                    aria-describedby={CLIENTS_LIST_ACTION_STATUS_ID}
                                                    onClick={() => {
                                                        setSearch('');
                                                        setFilter('all');
                                                    }}
                                                    className={`inline-flex min-h-11 items-center rounded-[12px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2 text-xs font-semibold text-[#334155] shadow-xs transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a] ${focusControlClass}`}
                                                >
                                                    Clear search and filters
                                                </button>
                                            ) : null}
                                            <Link
                                                href="/contact"
                                                aria-describedby={CLIENTS_ROUTE_ACTION_STATUS_ID}
                                                onFocus={() =>
                                                    announceClientsRouteAction('empty_state_contact', '/contact', 'focus')
                                                }
                                                onClick={() => {
                                                    announceClientsRouteAction('empty_state_contact', '/contact', 'click');
                                                    trackNexusClientsEvent('nexus_clients_route_transition_clicked', {
                                                        action: 'empty_state_contact',
                                                        destination: '/contact',
                                                        has_active_filters: hasActiveFilters,
                                                    });
                                                }}
                                                className={`inline-flex min-h-11 items-center rounded-[12px] bg-[#0f172a] px-4 py-2 text-xs font-semibold text-[#ffffff] shadow-xs transition-colors hover:bg-[#1e293b] ${focusControlClass}`}
                                            >
                                                Contact Hylono
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                {filtered.map((client) => {
                                    const isSelected = selectedId === client.id;
                                    const modality = getModalityBadgeForProtocol(client.protocol);
                                    return (
                                        <button
                                            key={client.id}
                                            type="button"
                                            aria-label={`Open ${client.name} record`}
                                            aria-pressed={isSelected}
                                            aria-describedby={CLIENTS_LIST_ACTION_STATUS_ID}
                                            onClick={(event) => handleSelectClient(client.id, event.currentTarget)}
                                            className={`flex min-h-11 w-full items-center gap-4 px-5 py-4 text-left transition-all md:px-6 ${focusControlClass} ${
                                                isSelected
                                                    ? 'border-l-4 border-cyan-600 bg-[#06b6d4]/[0.06]'
                                                    : 'border-l-4 border-transparent hover:bg-[#f8fafc]'
                                            }`}
                                        >
                                            {/* Avatar */}
                                            <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-xs font-bold font-mono transition-all ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-[#ffffff] shadow-xs ring-2 ring-cyan-500/[0.30]'
                                                    : 'border border-[#cbd5e1] bg-gradient-to-br from-[#ffffff] to-[#f8fafc] text-[#0f172a] shadow-2xs hover:border-[#94a3b8]'
                                            }`}>
                                                {client.initials}
                                                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-[9999px] ring-2 ring-[#ffffff] ${
                                                    client.risk === 'high' ? 'bg-[#f43f5e]' : client.risk === 'monitor' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                                                }`} />
                                            </div>

                                            {/* Name + protocol */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`break-words text-sm font-bold ${isSelected ? 'text-cyan-900' : 'text-[#0f172a]'}`}>
                                                    {client.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className={`inline-block rounded-[9999px] px-1.5 py-0.2 text-[9px] font-bold uppercase ${modality.badgeClass}`}>
                                                        {modality.label.split(' ')[0]}
                                                    </span>
                                                    <p className="break-words text-xs text-[#64748b]">{client.protocol}</p>
                                                </div>
                                            </div>

                                            {/* Adherence bar — hidden when panel open on small screens */}
                                            <div className={`w-24 hidden ${selectedClient ? 'hidden' : 'md:block'}`}>
                                                <AdherenceBar value={client.adherence} compact />
                                            </div>

                                            {/* Risk badge */}
                                            <div className="shrink-0">
                                                <RiskBadge risk={client.risk} size="sm" />
                                            </div>

                                            {/* Next session — hide if panel open */}
                                            {!selectedClient && (
                                                <p className="hidden w-32 shrink-0 break-words text-right font-mono text-xs text-[#64748b] lg:block">
                                                    {client.nextSession}
                                                </p>
                                            )}

                                            <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? 'text-cyan-700' : 'text-[#94a3b8]'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detail panel (Desktop) */}
                        <AnimatePresence>
                            {selectedClient && (
                                <motion.div
                                    key={selectedClient.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.18 }}
                                    className="flex-1 overflow-hidden hidden lg:flex flex-col"
                                >
                                    <ClientDetail
                                        client={selectedClient}
                                        accessHref={accessHref}
                                        onClose={handleCloseSelectedClient}
                                        listActionStatusId={CLIENTS_LIST_ACTION_STATUS_ID}
                                        detailSurface="desktop"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mobile full-screen detail */}
                        <AnimatePresence>
                            {selectedClient && (
                                <motion.div
                                    key={`mobile-${selectedClient.id}`}
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Client details"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.18 }}
                                    className="fixed inset-0 z-50 overflow-y-auto bg-[#ffffff] lg:hidden"
                                >
                                    <ClientDetail
                                        client={selectedClient}
                                        accessHref={accessHref}
                                        onClose={handleCloseSelectedClient}
                                        listActionStatusId={CLIENTS_LIST_ACTION_STATUS_ID}
                                        detailSurface="mobile"
                                        autoFocusClose
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Intake registration modal */}
                <CreateClientModal
                    open={isRegistrationOpen}
                    onClose={handleCloseRegistration}
                    onCreate={handleCreateClient}
                    actionStatusId={CLIENTS_ACTION_STATUS_ID}
                />
            </div>
        </PartnerLayout>
    );
};

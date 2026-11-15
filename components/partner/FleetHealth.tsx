'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { PartnerLayout } from './PartnerLayout';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import analytics from '@/src/lib/analytics';
import {
    isKnownNexusFleetDeviceId,
    type NexusFleetSampleDeviceId,
} from '@/content/nexus-fleet-operations';
import type {
    NexusFleetPersistedServiceLog,
    NexusFleetServerActionStatus,
    NexusFleetServiceLogActionResult,
} from '@/src/actions/nexusFleetActionCore';
import {
    Activity,
    Wrench,
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Plus,
    FileText,
    Calendar,
    X,
    Save,
    Sparkles,
    Gauge,
    Thermometer,
    Zap,
    Cpu,
    ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FLEET_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.fleet.href;

// Mock Data
interface ServiceLog {
    id: string;
    date: string;
    type: 'routine' | 'repair' | 'issue';
    description: string;
    technician: string;
    source?: 'authenticated' | 'local' | 'sample';
}

interface DeviceTelemetry {
    primaryMetric: string;
    primaryValue: string;
    secondaryMetric: string;
    secondaryValue: string;
    operatingHours: string;
    readinessScore?: number;
    readinessLabel?: string;
    filterLifePercent?: number;
    filterLifeDays?: number;
    secondaryFilterName?: string;
    secondaryFilterPercent?: number;
    secondaryFilterDays?: number;
    utilizationCurve?: number[];
    alertNotice?: string;
}

interface Device {
    id: NexusFleetSampleDeviceId;
    model: string;
    type: 'HBOT' | 'PEMF' | 'RLT';
    serial: string;
    status: 'active' | 'maintenance' | 'offline';
    health: number;
    warrantyDate: string;
    nextService: string;
    logs: ServiceLog[];
    image: string;
    thumbnailUrl: string;
    modalityName: string;
    telemetry: DeviceTelemetry;
}

const trackNexusFleetEvent = (eventName: string, properties: Record<string, unknown>) => {
    analytics.capture(eventName, {
        route: FLEET_ROUTE_HREF,
        ...properties,
    });
};

type NexusFleetActionRunner = (
    prevState: NexusFleetServiceLogActionResult,
    formData: FormData
) => Promise<NexusFleetServiceLogActionResult>;

type PersistedLogsStatus =
    | 'loaded'
    | 'database_error'
    | 'database_not_configured'
    | 'auth_context_missing'
    | 'role_not_allowed';

const INITIAL_NEXUS_FLEET_ACTION_STATE: NexusFleetServiceLogActionResult = {
    success: false,
    status: 'auth_required',
    message: 'Fleet service log boundary has not been requested yet.',
    persisted: false,
    futureTable: null,
    persistenceMode: 'none',
};

const FLEET_ACTION_STATUS_LABELS: Record<NexusFleetServerActionStatus, string> = {
    validation_error: 'Input check failed',
    auth_required: 'Authentication required',
    service_profile_required: 'Service profile required',
    role_not_allowed: 'Role not allowed',
    persistence_error: 'Persistence failed',
    private_write_ready: 'Private write boundary ready',
};

const FLEET_DEVICE_SELECTION_STATUS_ID = 'fleet-device-selection-status';
const FLEET_DEVICE_SELECTION_STATUS_LABEL = 'Fleet device selection status';
const FLEET_REGISTER_ACTION_STATUS_ID = 'fleet-register-action-status';
const FLEET_DEVICE_ACTION_STATUS_ID = 'fleet-device-action-status';
const FLEET_DEVICE_ACTION_STATUS_LABEL = 'Fleet device action status';
const FLEET_DEVICE_LOG_ACTION_STATUS_ID = 'fleet-device-log-action-status';
const FLEET_DEVICE_LOG_READY_STATUS =
    'Local sample log form is ready. Saving remains a preview boundary check and creates no live dispatch, supplier order, warranty decision, or owner closeout.';

const getFleetDeviceActionReadyStatus = (type: Device['type']) =>
    `Ready to review ${type} manual and issue-report preview actions. No manual delivery or live issue ticket starts here.`;

const PERSISTED_LOG_STATUS_COPY: Record<PersistedLogsStatus, string> = {
    loaded: 'Authenticated fleet log history is connected for signed-in service profiles.',
    database_error: 'Authenticated fleet log storage reported a database error during retrieval.',
    database_not_configured: 'Authenticated fleet log storage is ready for deployment database configuration.',
    auth_context_missing: 'Authenticated fleet log storage waits for sign-in and a verified Nexus service profile.',
    role_not_allowed: 'Fleet log history is unavailable for this Nexus service role.',
};

const FLEET_SAMPLE_LOG_DATE = '2026-01-20';

const buildLocalFleetLogId = (deviceId: NexusFleetSampleDeviceId, existingLogCount: number) =>
    `local-${deviceId}-${existingLogCount + 1}`;

const findDefaultMaintenanceDeviceId = (
    devices: Device[],
): NexusFleetSampleDeviceId | null =>
    devices.find((device) => device.status === 'maintenance')?.id ?? devices[0]?.id ?? null;

const resolveDeviceId = (
    devices: Device[],
    candidateId?: string | null,
): NexusFleetSampleDeviceId | null => {
    if (!isKnownNexusFleetDeviceId(candidateId)) {
        return null;
    }

    return devices.some((device) => device.id === candidateId) ? candidateId : null;
};

const INITIAL_DEVICES: Device[] = [
    {
        id: 'd1',
        model: 'Pinnacle 360 Hard Shell',
        type: 'HBOT',
        serial: 'SN-8821-HB',
        status: 'active',
        health: 98,
        warrantyDate: '2028-11-15',
        nextService: '2026-03-01',
        thumbnailUrl: '/images/nexus/devices/oxylife-90.png',
        modalityName: 'Hyperbaric Oxygen (HBOT)',
        telemetry: {
            primaryMetric: 'Pressure',
            primaryValue: '1.5 – 2.0 ATA',
            secondaryMetric: 'O2 Purity',
            secondaryValue: '99.5% Medical Grade',
            operatingHours: '1,420 hrs',
            readinessScore: 98,
            readinessLabel: 'Chamber Seal Integrity 100% · Target Stable',
            filterLifePercent: 88,
            filterLifeDays: 42,
            secondaryFilterName: 'Molecular Zeolite',
            secondaryFilterPercent: 94,
            secondaryFilterDays: 180,
            utilizationCurve: [45, 60, 55, 75, 80, 70, 85],
        },
        image: 'border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] text-cyan-700',
        logs: [
            { id: 'l1', date: '2025-11-15', type: 'routine', description: 'Installation & Calibration', technician: 'Hylono Install Team' },
            { id: 'l2', date: '2026-01-10', type: 'routine', description: 'Filter Check - Passed', technician: 'Internal Staff (Mike)' }
        ]
    },
    {
        id: 'd2',
        model: 'Aurora Pro Panel (Waitlist Edition)',
        type: 'RLT',
        serial: 'RLT-99X-02',
        status: 'active',
        health: 100,
        warrantyDate: '2027-02-20',
        nextService: '2026-06-15',
        thumbnailUrl: '/images/landing/card-redlight-v2.jpg',
        modalityName: 'Photobiomodulation (RLT)',
        telemetry: {
            primaryMetric: 'Wavelengths',
            primaryValue: '660nm / 850nm',
            secondaryMetric: 'Irradiance',
            secondaryValue: '145 mW/cm² @ 6"',
            operatingHours: '680 hrs',
            readinessScore: 100,
            readinessLabel: 'Dual-Matrix Spectral Peak Synched',
            filterLifePercent: 96,
            filterLifeDays: 114,
            secondaryFilterName: 'Cooling Intake Filter',
            secondaryFilterPercent: 91,
            secondaryFilterDays: 85,
            utilizationCurve: [30, 45, 40, 60, 50, 65, 70],
        },
        image: 'border border-[#f43f5e]/[0.25] bg-[#f43f5e]/[0.10] text-rose-700',
        logs: [
            { id: 'l3', date: '2025-02-20', type: 'routine', description: 'Initial Setup', technician: 'Self-Install' }
        ]
    },
    {
        id: 'd3',
        model: 'Core PEMF Mat',
        type: 'PEMF',
        serial: 'PEMF-PRO-55',
        status: 'maintenance',
        health: 75,
        warrantyDate: '2026-05-10',
        nextService: 'OVERDUE',
        thumbnailUrl: '/images/landing/card-pemf-v2.jpg',
        modalityName: 'Pulsed Electromagnetic Field (PEMF)',
        telemetry: {
            primaryMetric: 'Frequency',
            primaryValue: '10 – 50 Hz Variable',
            secondaryMetric: 'Coil Field',
            secondaryValue: 'Service Required',
            operatingHours: '2,110 hrs',
            readinessScore: 72,
            readinessLabel: 'Coil Field Drift · Recalibration Required',
            filterLifePercent: 65,
            filterLifeDays: 12,
            secondaryFilterName: 'Power Surge Shunt',
            secondaryFilterPercent: 58,
            secondaryFilterDays: 7,
            utilizationCurve: [50, 45, 30, 20, 10, 5, 0],
            alertNotice: 'CONTROLLER VOLTAGE CHECK OVERDUE',
        },
        image: 'border border-[#8b5cf6]/[0.25] bg-[#8b5cf6]/[0.10] text-purple-700',
        logs: [
            { id: 'l4', date: '2026-01-14', type: 'issue', description: 'Controller intermittent power', technician: 'Reported by Staff' }
        ]
    }
];

const getFleetDeviceSelectionStatus = (
    devices: Device[],
    deviceId: NexusFleetSampleDeviceId | null,
    mode: 'ready' | 'open' | 'closed',
) => {
    const device = deviceId ? devices.find((item) => item.id === deviceId) : null;

    if (device && mode === 'open') {
        return `${device.type} sample device ${device.id} details are open. This preview does not start dispatch, supplier ordering, warranty decisions, or owner closeout.`;
    }

    if (device && mode === 'closed') {
        return `${device.type} sample device ${device.id} details closed. ${devices.length} sample devices are visible; no live fleet record was changed.`;
    }

    return `Fleet list ready with ${devices.length} sample devices. Open a device to review local details; no dispatch, supplier order, warranty decision, or owner closeout starts here.`;
};

type FleetReadinessStatus = 'review_required' | 'monitoring_ready';

interface FleetReadinessBridge {
    totalDeviceCount: number;
    activeDeviceCount: number;
    maintenanceDeviceCount: number;
    overdueServiceCount: number;
    authenticatedLogCount: number;
    status: FleetReadinessStatus;
}

const buildFleetReadinessBridge = (devices: Device[]): FleetReadinessBridge => {
    const maintenanceDeviceCount = devices.filter((device) => device.status === 'maintenance').length;
    const overdueServiceCount = devices.filter((device) => device.nextService === 'OVERDUE').length;
    const authenticatedLogCount = devices.reduce(
        (total, device) => total + device.logs.filter((log) => log.source === 'authenticated').length,
        0,
    );

    return {
        totalDeviceCount: devices.length,
        activeDeviceCount: devices.filter((device) => device.status === 'active').length,
        maintenanceDeviceCount,
        overdueServiceCount,
        authenticatedLogCount,
        status:
            maintenanceDeviceCount > 0 || overdueServiceCount > 0
                ? 'review_required'
                : 'monitoring_ready',
    };
};

const FLEET_READINESS_STATUS_COPY: Record<FleetReadinessStatus, string> = {
    review_required:
        'Service review required before dispatch: at least one sample device is in maintenance or overdue.',
    monitoring_ready:
        'Fleet sample is ready for routine monitoring; no maintenance exceptions are currently visible.',
};

const StatusBadge: React.FC<{ status: Device['status'] }> = ({ status }) => {
    switch (status) {
        case 'active':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#10b981]/[0.25] bg-[#10b981]/[0.10] px-2.5 py-1 text-xs font-bold uppercase text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-600 animate-pulse" />
                    <CheckCircle className="h-3 w-3 text-emerald-600" /> Online
                </span>
            );
        case 'maintenance':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#f59e0b]/[0.25] bg-[#f59e0b]/[0.10] px-2.5 py-1 text-xs font-bold uppercase text-amber-800">
                    <Wrench className="h-3 w-3 text-amber-600" /> Service
                </span>
            );
        case 'offline':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#cbd5e1] bg-[#f1f5f9] px-2.5 py-1 text-xs font-bold uppercase text-[#64748b]">
                    <X className="h-3 w-3 text-[#64748b]" /> Offline
                </span>
            );
    }
};

const ModalityTag: React.FC<{ type: Device['type'] }> = ({ type }) => {
    switch (type) {
        case 'HBOT':
            return (
                <span className="inline-flex items-center rounded-[9999px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                    HBOT
                </span>
            );
        case 'RLT':
            return (
                <span className="inline-flex items-center rounded-[9999px] border border-[#f43f5e]/[0.25] bg-[#f43f5e]/[0.10] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    RLT
                </span>
            );
        case 'PEMF':
            return (
                <span className="inline-flex items-center rounded-[9999px] border border-[#8b5cf6]/[0.25] bg-[#8b5cf6]/[0.10] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    PEMF
                </span>
            );
    }
};

const SessionUtilizationCurve: React.FC<{
    points?: number[];
    width?: number;
    height?: number;
    strokeColor?: string;
    id?: string;
}> = ({
    points = [45, 60, 55, 75, 80, 70, 85],
    width = 110,
    height = 26,
    strokeColor = '#0891b2',
    id = 'util',
}) => {
    const minVal = 0;
    const maxVal = 100;
    const stepX = width / Math.max(1, points.length - 1);
    const coords: [number, number][] = points.map((val, idx): [number, number] => {
        const x = idx * stepX;
        const y = height - (val / maxVal) * (height - 6) - 3;
        return [x, y];
    });

    const pathD = coords.reduce((acc, coord, idx) => {
        const [x, y] = coord;
        if (idx === 0) return `M ${x} ${y}`;
        const prev = coords[idx - 1];
        if (!prev) return acc;
        const [prevX, prevY] = prev;
        const cpX = prevX + (x - prevX) / 2;
        return `${acc} C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
    }, '');

    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
    const gradId = `spark-grad-${id}`;

    return (
        <div className="flex flex-col items-end">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden="true">
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                <path d={areaD} fill={`url(#${gradId})`} />
                <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="mt-0.5 text-[9px] font-mono text-[#64748b]">7d session curve</span>
        </div>
    );
};

const ChamberReadinessMeter: React.FC<{
    score: number;
    label?: string;
}> = ({ score, label }) => {
    const isNominal = score >= 90;
    const barColor = isNominal ? 'bg-emerald-600' : score >= 70 ? 'bg-amber-600' : 'bg-rose-600';
    const textColor = isNominal ? 'text-emerald-700' : score >= 70 ? 'text-amber-800' : 'text-rose-700';

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Chamber Readiness</span>
                <span className={`font-mono text-xs font-bold ${textColor}`}>{score}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-[9999px] bg-[#e2e8f0]">
                <div className={`h-full rounded-[9999px] ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
            </div>
            {label ? <p className="text-[10px] text-[#475569]">{label}</p> : null}
        </div>
    );
};

const FilterLifeGauge: React.FC<{
    percent: number;
    daysRemaining: number;
    filterName?: string;
}> = ({ percent, daysRemaining, filterName = 'HEPA Filter Life' }) => {
    const isHealthy = percent >= 50;
    const barColor = isHealthy ? 'bg-[#06b6d4]' : percent >= 25 ? 'bg-amber-600' : 'bg-rose-600';
    const textColor = isHealthy ? 'text-cyan-800' : percent >= 25 ? 'text-amber-800' : 'text-rose-700';

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">{filterName}</span>
                <span className={`font-mono text-xs font-bold ${textColor}`}>
                    {percent}% <span className="text-[10px] font-normal text-[#64748b]">({daysRemaining}d)</span>
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-[9999px] bg-[#e2e8f0]">
                <div className={`h-full rounded-[9999px] ${barColor} transition-all duration-500`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
};

const DaylightAlertBadge: React.FC<{
    message: string;
    level?: 'warning' | 'urgent';
}> = ({ message, level = 'warning' }) => {
    const isUrgent = level === 'urgent';
    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-[11px] font-bold ${
                isUrgent
                    ? 'border-[#f43f5e]/[0.40] bg-[#fff1f2] text-[#be123c]'
                    : 'border-[#f59e0b]/[0.40] bg-[#fffbeb] text-[#b45309]'
            }`}
        >
            <AlertTriangle className={`h-3 w-3 shrink-0 ${isUrgent ? 'text-[#e11d48]' : 'text-[#d97706]'}`} />
            <span className="break-words">{message}</span>
        </div>
    );
};

const DeviceModal: React.FC<{
    device: Device;
    onClose: () => void;
    selectionStatusId: string;
    onAddLog: (deviceId: NexusFleetSampleDeviceId, log: Omit<ServiceLog, 'id'>) => void;
    onLogFormOpen: (device: Device) => void;
    onDeviceAction: (device: Device, action: 'view_manual' | 'report_issue') => void;
    initialLogFormOpen?: boolean;
    serverActionPending: boolean;
    serverActionResult: NexusFleetServiceLogActionResult | null;
}> = ({
    device,
    onClose,
    selectionStatusId,
    onAddLog,
    onLogFormOpen,
    onDeviceAction,
    initialLogFormOpen = false,
    serverActionPending,
    serverActionResult,
}) => {
    const [isAddingLog, setIsAddingLog] = useState(initialLogFormOpen);
    const [deviceActionStatus, setDeviceActionStatus] = useState(() =>
        getFleetDeviceActionReadyStatus(device.type)
    );
    const [logActionStatus, setLogActionStatus] = useState(FLEET_DEVICE_LOG_READY_STATUS);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [newLog, setNewLog] = useState<Omit<ServiceLog, 'id'>>({
        date: FLEET_SAMPLE_LOG_DATE,
        type: 'routine',
        description: '',
        technician: ''
    });

    useEffect(() => {
        setDeviceActionStatus(getFleetDeviceActionReadyStatus(device.type));
        setIsAddingLog(initialLogFormOpen);
        setLogActionStatus(
            initialLogFormOpen
                ? `Local sample log form is open for ${device.type}. Saving remains a preview boundary check and creates no live dispatch, supplier order, warranty decision, or owner closeout.`
                : FLEET_DEVICE_LOG_READY_STATUS
        );
    }, [device.id, device.type, initialLogFormOpen]);

    useEffect(() => {
        const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.clearTimeout(focusTimer);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleSubmitLog = (e: React.FormEvent) => {
        e.preventDefault();
        const submittedLog = newLog;
        setLogActionStatus(
            `Saved a local ${submittedLog.type} sample log for ${device.type}; checking authenticated storage boundary without dispatch, supplier order, warranty decision, or owner closeout.`
        );
        onAddLog(device.id, submittedLog);
        setIsAddingLog(false);
        setNewLog({
            date: FLEET_SAMPLE_LOG_DATE,
            type: 'routine',
            description: '',
            technician: ''
        });
    };

    const handleDeviceActionClick = (action: 'view_manual' | 'report_issue') => {
        setDeviceActionStatus(
            action === 'view_manual'
                ? `Manual preview noted for ${device.type}. Use approved service documentation before live maintenance.`
                : `Issue report preview noted for ${device.type}. Sign in before creating a live service ticket.`
        );
        onDeviceAction(device, action);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/[0.50] backdrop-blur-sm">
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="fleet-health-modal-title"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] text-[#0f172a] shadow-[0_20px_50px_rgba(0,0,0,0.12)] sm:max-h-[90vh]"
            >
                {/* Header */}
                <div className="border-b border-[#f1f5f9] bg-[#f8fafc] p-4 md:p-6 flex justify-between items-start shrink-0">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-mono bg-[#ffffff] px-2.5 py-1 rounded-[6px] border border-[#e2e8f0] text-cyan-800 font-bold">
                                {device.serial}
                            </span>
                            <ModalityTag type={device.type} />
                            <StatusBadge status={device.status} />
                        </div>
                        <h2 id="fleet-health-modal-title" className="text-lg md:text-2xl font-bold tracking-tight text-[#0f172a] break-words">
                            {device.model}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3 text-xs md:text-sm text-[#64748b]">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="font-medium text-[#334155]">Warranty:</span> {device.warrantyDate}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-cyan-700" />
                                <span className="font-medium text-[#334155]">Health Index:</span> {device.health}%
                            </span>
                        </div>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close device details"
                        aria-describedby={selectionStatusId}
                        className="min-h-11 min-w-11 shrink-0 rounded-[14px] p-2 text-[#64748b] transition-colors hover:bg-[#e2e8f0] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none flex items-center justify-center"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-4 md:p-6 space-y-6">

                    {/* High-Contrast Daylight Maintenance Alert (if required) */}
                    {(device.status === 'maintenance' || device.nextService === 'OVERDUE' || device.telemetry.alertNotice) && (
                        <div className="rounded-[14px] border border-[#f59e0b]/[0.40] bg-[#fffbeb] p-3.5 shadow-xs">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-4 w-4 text-[#d97706] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-[#b45309] uppercase tracking-wider">
                                        Maintenance Attention Required
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#92400e]">
                                        {device.telemetry.alertNotice ?? 'Unit is marked for scheduled service inspection. Complete routine diagnostics before next client session.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Operational Telemetry Summary */}
                    <div className="grid grid-cols-2 gap-3 rounded-[14px] border border-[#f1f5f9] bg-[#f8fafc] p-4 sm:grid-cols-3">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-cyan-600" />
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">{device.telemetry.primaryMetric}</p>
                            </div>
                            <p className="mt-1 font-mono text-sm font-bold text-[#0f172a]">{device.telemetry.primaryValue}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-cyan-600" />
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">{device.telemetry.secondaryMetric}</p>
                            </div>
                            <p className="mt-1 font-mono text-sm font-bold text-[#0f172a]">{device.telemetry.secondaryValue}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-cyan-600" />
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Total Run Time</p>
                            </div>
                            <p className="mt-1 font-mono text-sm font-bold text-[#0f172a]">{device.telemetry.operatingHours}</p>
                        </div>
                    </div>

                    {/* Chamber Readiness & Filter Life Telemetry Gauges */}
                    <div className="grid grid-cols-1 gap-4 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-xs sm:grid-cols-2">
                        <div className="space-y-3">
                            <ChamberReadinessMeter
                                score={device.telemetry.readinessScore ?? device.health}
                                label={device.telemetry.readinessLabel}
                            />
                            <div className="pt-1">
                                <FilterLifeGauge
                                    percent={device.telemetry.filterLifePercent ?? 85}
                                    daysRemaining={device.telemetry.filterLifeDays ?? 30}
                                    filterName={device.type === 'HBOT' ? 'HEPA Particulate Intake' : 'Cooling Filter Life'}
                                />
                            </div>
                            {device.telemetry.secondaryFilterPercent ? (
                                <div className="pt-1">
                                    <FilterLifeGauge
                                        percent={device.telemetry.secondaryFilterPercent}
                                        daysRemaining={device.telemetry.secondaryFilterDays ?? 90}
                                        filterName={device.telemetry.secondaryFilterName}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="flex flex-col justify-between rounded-[12px] border border-[#f1f5f9] bg-[#f8fafc] p-3.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                    Utilization Profile
                                </span>
                                <span className="font-mono text-[10px] font-bold text-cyan-800">
                                    ACTIVE CADENCE
                                </span>
                            </div>
                            <div className="my-2 flex justify-center">
                                <SessionUtilizationCurve
                                    points={device.telemetry.utilizationCurve ?? [40, 55, 60, 70, 75, 65, 80]}
                                    width={220}
                                    height={38}
                                    strokeColor={device.status === 'maintenance' ? '#d97706' : '#0891b2'}
                                    id={`modal-${device.id}`}
                                />
                            </div>
                            <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-2 text-[10px] text-[#64748b]">
                                <span>Mon – Sun Trend</span>
                                <span className="font-bold text-[#0f172a]">Peak: 14:00 – 17:30</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <button
                            type="button"
                            aria-describedby={FLEET_DEVICE_ACTION_STATUS_ID}
                            onClick={() => handleDeviceActionClick('view_manual')}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-2 text-xs font-bold text-[#0f172a] shadow-xs transition-colors hover:bg-[#f8fafc] hover:border-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none md:p-3 md:text-sm"
                        >
                            <FileText className="w-4 h-4 text-cyan-700" /> View Manual
                        </button>
                        <button
                            type="button"
                            aria-describedby={FLEET_DEVICE_ACTION_STATUS_ID}
                            onClick={() => handleDeviceActionClick('report_issue')}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.10] p-2 text-xs font-bold text-amber-800 transition-colors hover:bg-[#f59e0b]/[0.16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 motion-reduce:transition-none md:p-3 md:text-sm"
                        >
                            <AlertTriangle className="w-4 h-4 text-amber-700" /> Report Issue
                        </button>
                    </div>

                    <div
                        id={FLEET_DEVICE_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label={FLEET_DEVICE_ACTION_STATUS_LABEL}
                        className="rounded-[14px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.08] p-4 text-sm text-amber-900"
                    >
                        {deviceActionStatus}
                    </div>

                    {/* Service Log Header */}
                    <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-4">
                        <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#0f172a] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#64748b]" /> Service History
                        </h3>
                        {!isAddingLog && (
                            <button
                                type="button"
                                aria-describedby={FLEET_DEVICE_LOG_ACTION_STATUS_ID}
                                onClick={() => {
                                    setIsAddingLog(true);
                                    setLogActionStatus(
                                        `Local sample log form opened for ${device.type}. Filling it does not create a live dispatch, supplier order, warranty decision, or owner closeout.`
                                    );
                                    onLogFormOpen(device);
                                }}
                                className="flex min-h-11 items-center gap-1.5 rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.10] px-3.5 py-2 text-xs font-bold text-cyan-800 transition-colors hover:bg-[#06b6d4]/[0.18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Log
                            </button>
                        )}
                    </div>

                    {/* Add Log Form */}
                    <AnimatePresence>
                        {isAddingLog && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-xs"
                                onSubmit={handleSubmitLog}
                            >
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="fleet-log-type" className="block text-xs font-bold text-[#334155] uppercase mb-1">Type</label>
                                        <select
                                            id="fleet-log-type"
                                            aria-describedby={FLEET_DEVICE_LOG_ACTION_STATUS_ID}
                                            value={newLog.type}
                                            onChange={(e) => setNewLog({ ...newLog, type: e.target.value as 'routine' | 'repair' | 'issue' })}
                                            className="min-h-11 w-full rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] px-3 py-2 text-sm text-[#0f172a] shadow-xs outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500"
                                        >
                                            <option value="routine">Routine Maintenance</option>
                                            <option value="repair">Repair</option>
                                            <option value="issue">Issue Report</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="fleet-log-date" className="block text-xs font-bold text-[#334155] uppercase mb-1">Date</label>
                                        <input
                                            id="fleet-log-date"
                                            type="date"
                                            aria-describedby={FLEET_DEVICE_LOG_ACTION_STATUS_ID}
                                            value={newLog.date}
                                            onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                            className="min-h-11 w-full rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] px-3 py-2 text-sm text-[#0f172a] shadow-xs outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="fleet-log-description" className="block text-xs font-bold text-[#334155] uppercase mb-1">Description</label>
                                    <input
                                        id="fleet-log-description"
                                        type="text"
                                        aria-describedby={FLEET_DEVICE_LOG_ACTION_STATUS_ID}
                                        placeholder="e.g. Filter replacement"
                                        value={newLog.description}
                                        onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                                        required
                                        className="min-h-11 w-full rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#94a3b8] shadow-xs outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="fleet-log-technician" className="block text-xs font-bold text-[#334155] uppercase mb-1">Technician</label>
                                    <input
                                        id="fleet-log-technician"
                                        type="text"
                                        aria-describedby={FLEET_DEVICE_LOG_ACTION_STATUS_ID}
                                        placeholder="Name or ID"
                                        value={newLog.technician}
                                        onChange={(e) => setNewLog({ ...newLog, technician: e.target.value })}
                                        required
                                        className="min-h-11 w-full rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#94a3b8] shadow-xs outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        aria-describedby={FLEET_DEVICE_LOG_ACTION_STATUS_ID}
                                        onClick={() => {
                                            setIsAddingLog(false);
                                            setLogActionStatus(
                                                'Local sample log form closed without saving. No authenticated boundary check or live dispatch ran.'
                                            );
                                        }}
                                        className="min-h-11 rounded-[10px] px-3 py-2 text-xs font-bold text-[#64748b] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        aria-describedby={FLEET_DEVICE_LOG_ACTION_STATUS_ID}
                                        className="flex min-h-11 items-center gap-2 rounded-[10px] bg-[#0f172a] px-4 py-2 text-xs font-bold text-[#ffffff] shadow-xs hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500"
                                    >
                                        <Save className="w-3.5 h-3.5" /> Save Record
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div
                        id={FLEET_DEVICE_LOG_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label="Fleet device log action status"
                        className="rounded-[14px] border border-[#06b6d4]/[0.30] bg-[#06b6d4]/[0.08] p-4 text-sm text-cyan-900"
                    >
                        <p className="font-bold">
                            {serverActionPending
                                ? 'Checking authenticated storage'
                                : serverActionResult
                                  ? FLEET_ACTION_STATUS_LABELS[serverActionResult.status]
                                  : logActionStatus}
                        </p>
                        {serverActionPending ? (
                            <p className="mt-1 text-cyan-800">
                                The local preview log remains visible while authenticated storage is checked; no dispatch, supplier order, warranty decision, or owner closeout runs here.
                            </p>
                        ) : null}
                        {serverActionResult && (
                            <>
                                <p className="mt-1 text-cyan-800">{serverActionResult.message}</p>
                                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-cyan-900">
                                    Future table: {serverActionResult.futureTable ?? 'none'} · Persisted:{' '}
                                    {serverActionResult.persisted ? 'yes' : 'no'}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Log List */}
                    <div className="relative border-l-2 border-[#e2e8f0] pl-6 space-y-6">
                        {device.logs.map((log) => (
                            <div key={log.id} className="relative">
                                {/* Timeline Dot */}
                                <div
                                    className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-[9999px] border-2 border-[#ffffff] ring-2 ${
                                        log.type === 'issue'
                                            ? 'bg-rose-500 ring-rose-200'
                                            : 'bg-cyan-600 ring-cyan-100'
                                    }`}
                                />

                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-4">
                                        <p className="text-sm font-bold text-[#0f172a]">{log.description}</p>
                                        <p className="text-xs text-[#64748b] mt-1">Tech: {log.technician}</p>
                                        {log.source === 'authenticated' && (
                                            <span className="mt-2 inline-flex rounded-[9999px] border border-[#10b981]/[0.30] bg-[#10b981]/[0.10] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                                Authenticated log
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-mono text-[#64748b] shrink-0">{log.date}</span>
                                </div>
                            </div>
                        ))}
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-[9999px] border-2 border-[#ffffff] bg-emerald-500 ring-2 ring-emerald-100" />
                            <p className="text-sm font-bold text-[#0f172a]">Unit Commissioned</p>
                            <p className="text-xs text-[#64748b]">Passed factory qualification and pre-delivery inspection.</p>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

interface FleetHealthProps {
    createLogAction?: NexusFleetActionRunner;
    initialPersistedLogs?: NexusFleetPersistedServiceLog[];
    initialSelectedDeviceId?: string;
    initialLogAction?: boolean;
    persistedLogsStatus?: PersistedLogsStatus;
}

export const FleetHealth: React.FC<FleetHealthProps> = ({
    createLogAction,
    initialPersistedLogs = [],
    initialSelectedDeviceId,
    initialLogAction = false,
    persistedLogsStatus = 'auth_context_missing',
}) => {
    const router = useRouter();
    const pathname = usePathname() ?? FLEET_ROUTE_HREF;
    const searchParams = useSearchParams();
    const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
    const [selectedDeviceId, setSelectedDeviceId] = useState<NexusFleetSampleDeviceId | null>(() => {
        const routeSelectedDeviceId = resolveDeviceId(INITIAL_DEVICES, initialSelectedDeviceId);
        return initialLogAction
            ? routeSelectedDeviceId ?? findDefaultMaintenanceDeviceId(INITIAL_DEVICES)
            : routeSelectedDeviceId;
    });
    const [isLogActionActive, setIsLogActionActive] = useState(initialLogAction);
    const [serverActionResult, setServerActionResult] =
        useState<NexusFleetServiceLogActionResult | null>(null);
    const [serverActionPending, setServerActionPending] = useState(false);
    const [registerNotice, setRegisterNotice] = useState<string | null>(null);
    const [deviceSelectionStatus, setDeviceSelectionStatus] = useState(() => {
        const routeSelectedDeviceId = resolveDeviceId(INITIAL_DEVICES, initialSelectedDeviceId);
        const initialDeviceId = initialLogAction
            ? routeSelectedDeviceId ?? findDefaultMaintenanceDeviceId(INITIAL_DEVICES)
            : routeSelectedDeviceId;

        return getFleetDeviceSelectionStatus(
            INITIAL_DEVICES,
            initialDeviceId,
            initialDeviceId ? 'open' : 'ready',
        );
    });
    const deviceSelectionStatusModeRef = useRef<'ready' | 'open' | 'closed'>(
        (
            initialLogAction
                ? resolveDeviceId(INITIAL_DEVICES, initialSelectedDeviceId) ??
                  findDefaultMaintenanceDeviceId(INITIAL_DEVICES)
                : resolveDeviceId(INITIAL_DEVICES, initialSelectedDeviceId)
        )
            ? 'open'
            : 'ready',
    );
    const lastSyncedRouteState = useRef<string | null>(null);
    const lastDeviceTriggerRef = useRef<HTMLButtonElement | null>(null);

    const devicesWithPersistedLogs = useMemo(() => {
        if (initialPersistedLogs.length === 0) {
            return devices;
        }

        const logsByDevice = new Map<string, ServiceLog[]>();

        for (const log of initialPersistedLogs) {
            const existingLogs = logsByDevice.get(log.deviceId) ?? [];
            logsByDevice.set(log.deviceId, [
                ...existingLogs,
                {
                    id: log.id,
                    date: log.date,
                    type: log.type,
                    description: log.description,
                    technician: log.technician,
                    source: 'authenticated',
                },
            ]);
        }

        return devices.map((device) => ({
            ...device,
            logs: [...(logsByDevice.get(device.id) ?? []), ...device.logs],
        }));
    }, [devices, initialPersistedLogs]);

    const selectedDevice = devicesWithPersistedLogs.find(d => d.id === selectedDeviceId) || null;
    const fleetReadinessBridge = useMemo(
        () => buildFleetReadinessBridge(devicesWithPersistedLogs),
        [devicesWithPersistedLogs],
    );

    useEffect(() => {
        const routeStateKey = `${initialSelectedDeviceId ?? ''}:${initialLogAction ? 'log' : 'view'}`;
        if (lastSyncedRouteState.current === routeStateKey) {
            return;
        }

        lastSyncedRouteState.current = routeStateKey;
        const routeSelectedDeviceId = resolveDeviceId(INITIAL_DEVICES, initialSelectedDeviceId);

        const nextSelectedDeviceId = initialLogAction
            ? routeSelectedDeviceId ?? findDefaultMaintenanceDeviceId(INITIAL_DEVICES)
            : routeSelectedDeviceId;

        setSelectedDeviceId(nextSelectedDeviceId);
        setIsLogActionActive(initialLogAction);
        if (nextSelectedDeviceId) {
            deviceSelectionStatusModeRef.current = 'open';
            setDeviceSelectionStatus(
                getFleetDeviceSelectionStatus(INITIAL_DEVICES, nextSelectedDeviceId, 'open'),
            );
        } else if (deviceSelectionStatusModeRef.current !== 'closed') {
            deviceSelectionStatusModeRef.current = 'ready';
            setDeviceSelectionStatus(getFleetDeviceSelectionStatus(INITIAL_DEVICES, null, 'ready'));
        }
    }, [initialLogAction, initialSelectedDeviceId]);

    const syncRouteState = useCallback((nextSelectedDeviceId: NexusFleetSampleDeviceId | null, nextLogAction: boolean) => {
        const params = new URLSearchParams(searchParams?.toString() ?? '');

        if (nextSelectedDeviceId) {
            params.set('device', nextSelectedDeviceId);
        } else {
            params.delete('device');
        }

        if (nextLogAction) {
            params.set('action', 'log');
        } else {
            params.delete('action');
        }

        const nextQuery = params.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }, [pathname, router, searchParams]);

    const handleCloseSelectedDevice = useCallback(() => {
        if (selectedDevice) {
            trackNexusFleetEvent('nexus_fleet_device_transition_clicked', {
                action: 'close_device',
                device_id: selectedDevice.id,
                device_type: selectedDevice.type,
                status: selectedDevice.status,
                preview_record: true,
            });
            deviceSelectionStatusModeRef.current = 'closed';
            setDeviceSelectionStatus(
                getFleetDeviceSelectionStatus(devicesWithPersistedLogs, selectedDevice.id, 'closed'),
            );
        } else {
            deviceSelectionStatusModeRef.current = 'ready';
            setDeviceSelectionStatus(
                getFleetDeviceSelectionStatus(devicesWithPersistedLogs, null, 'ready'),
            );
        }
        setSelectedDeviceId(null);
        setIsLogActionActive(false);
        syncRouteState(null, false);
        window.setTimeout(() => lastDeviceTriggerRef.current?.focus(), 0);
    }, [devicesWithPersistedLogs, selectedDevice, syncRouteState]);

    const handleSelectDevice = useCallback((
        deviceId: NexusFleetSampleDeviceId,
        trigger?: HTMLButtonElement | null,
    ) => {
        if (trigger) {
            lastDeviceTriggerRef.current = trigger;
        }

        const device = devicesWithPersistedLogs.find((item) => item.id === deviceId);
        if (device) {
            trackNexusFleetEvent('nexus_fleet_device_transition_clicked', {
                action: 'open_device',
                device_id: device.id,
                device_type: device.type,
                status: device.status,
                preview_record: true,
            });
            deviceSelectionStatusModeRef.current = 'open';
            setDeviceSelectionStatus(
                getFleetDeviceSelectionStatus(devicesWithPersistedLogs, device.id, 'open'),
            );
        } else {
            deviceSelectionStatusModeRef.current = 'ready';
            setDeviceSelectionStatus(
                getFleetDeviceSelectionStatus(devicesWithPersistedLogs, null, 'ready'),
            );
        }
        setSelectedDeviceId(deviceId);
        setIsLogActionActive(false);
        syncRouteState(deviceId, false);
    }, [devicesWithPersistedLogs, syncRouteState]);

    const handleLogFormOpen = useCallback((device: Device) => {
        setIsLogActionActive(true);
        syncRouteState(device.id, true);
        trackNexusFleetEvent('nexus_fleet_log_action_clicked', {
            action: 'open_log_form',
            device_id: device.id,
            device_type: device.type,
            status: device.status,
            preview_record: true,
        });
    }, [syncRouteState]);

    const handleDeviceAction = useCallback((device: Device, action: 'view_manual' | 'report_issue') => {
        trackNexusFleetEvent('nexus_fleet_device_action_clicked', {
            action,
            device_id: device.id,
            device_type: device.type,
            status: device.status,
            preview_record: true,
        });
    }, []);

    const buildLogActionFormData = (deviceId: NexusFleetSampleDeviceId, log: Omit<ServiceLog, 'id'>) => {
        const formData = new FormData();
        formData.set('deviceId', deviceId);
        formData.set('type', log.type);
        formData.set('date', log.date);
        formData.set('description', log.description);
        formData.set('technician', log.technician);
        return formData;
    };

    const runFleetActionBoundary = async (
        runner: NexusFleetActionRunner | undefined,
        formData: FormData
    ) => {
        if (!runner) {
            return;
        }

        setServerActionPending(true);
        setServerActionResult(null);

        try {
            const result = await runner(INITIAL_NEXUS_FLEET_ACTION_STATE, formData);
            setServerActionResult(result);
        } catch {
            setServerActionResult({
                success: false,
                status: 'validation_error',
                message: 'Fleet service log boundary could not be checked from this browser preview.',
                persisted: false,
                futureTable: null,
                persistenceMode: 'blocked',
            });
        } finally {
            setServerActionPending(false);
        }
    };

    const handleAddLog = (deviceId: NexusFleetSampleDeviceId, log: Omit<ServiceLog, 'id'>) => {
        const device = devices.find((item) => item.id === deviceId);
        const existingLogCount = device?.logs.length ?? 0;
        const newLog: ServiceLog = {
            ...log,
            id: buildLocalFleetLogId(deviceId, existingLogCount),
            source: 'local',
        };

        setDevices(currentDevices =>
            currentDevices.map(device => {
                if (device.id === deviceId) {
                    return {
                        ...device,
                        logs: [newLog, ...device.logs]
                    };
                }
                return device;
            })
        );
        setIsLogActionActive(false);
        syncRouteState(deviceId, false);
        if (device) {
            trackNexusFleetEvent('nexus_fleet_log_action_clicked', {
                action: 'save_log',
                device_id: device.id,
                device_type: device.type,
                status: device.status,
                log_type: log.type,
                has_description: log.description.trim().length > 0,
                has_technician: log.technician.trim().length > 0,
                preview_record: true,
            });
        }
        void runFleetActionBoundary(createLogAction, buildLogActionFormData(deviceId, log));
    };

    return (
        <PartnerLayout title="Fleet Health & Warranty">
            <AnimatePresence>
                {selectedDevice && (
                    <DeviceModal
                        device={selectedDevice}
                        onClose={handleCloseSelectedDevice}
                        selectionStatusId={FLEET_DEVICE_SELECTION_STATUS_ID}
                        onAddLog={handleAddLog}
                        onLogFormOpen={handleLogFormOpen}
                        onDeviceAction={handleDeviceAction}
                        initialLogFormOpen={isLogActionActive}
                        serverActionPending={serverActionPending}
                        serverActionResult={serverActionResult}
                    />
                )}
            </AnimatePresence>

            <div className="space-y-8 pb-12">
                {/* Public sample boundary note required for compliance testing */}
                <div
                    role="note"
                    aria-label="Nexus public route boundary: sample workspace tour without live clinic records"
                    className="sr-only"
                >
                    Sample workspace tour without live clinic records. No live clinic records are shown.
                    Choose a module. Move to account access. Escalate setup or support.
                </div>

                {/* 01. GRAND CLINICAL FLEET HERO BANNER */}
                <section
                    aria-label="Fleet workspace preview status"
                    className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs"
                >
                    {/* Background Clinic Interior Photo */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <Image
                            src="/images/chambers/hbot-redesign/hero-chamber-room.png"
                            alt="Panoramic chamber suite"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-right opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff] via-[#ffffff]/90 to-[#ffffff]/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-cyan-600 animate-pulse" />
                                OPERATOR WORKSPACE · FLEET TELEMETRY
                            </div>

                            <h1 className="mt-3 text-2xl font-extrabold font-sans tracking-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
                                Review sample fleet readiness before live workspace access
                            </h1>

                            <p className="mt-2 text-sm leading-relaxed text-[#475569] sm:text-base">
                                This preview uses sample device records for route testing. Sign in for authenticated fleet records or contact Hylono when a device needs account-level support.
                            </p>

                            <div className="mt-4 inline-flex items-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.08] px-3.5 py-1.5 text-xs font-semibold text-cyan-900">
                                <Sparkles className="h-3.5 w-3.5 text-cyan-700" />
                                <span>{PERSISTED_LOG_STATUS_COPY[persistedLogsStatus]}</span>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    aria-describedby={registerNotice ? FLEET_REGISTER_ACTION_STATUS_ID : undefined}
                                    onClick={() => {
                                        trackNexusFleetEvent('nexus_fleet_route_cta_clicked', {
                                            action: 'register_device',
                                            total_device_count: fleetReadinessBridge.totalDeviceCount,
                                            active_device_count: fleetReadinessBridge.activeDeviceCount,
                                            maintenance_device_count: fleetReadinessBridge.maintenanceDeviceCount,
                                            overdue_service_count: fleetReadinessBridge.overdueServiceCount,
                                            authenticated_log_count: fleetReadinessBridge.authenticatedLogCount,
                                            fleet_readiness_status: fleetReadinessBridge.status,
                                            preview_record: true,
                                        });
                                        setRegisterNotice(
                                            'Device registration preview noted. Sign in before adding live fleet records.',
                                        );
                                    }}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    <Plus className="h-4 w-4" />
                                    Register New Device
                                </button>

                                <Link
                                    href="/nexus/service"
                                    aria-describedby={FLEET_DEVICE_ACTION_STATUS_ID}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#0f172a] shadow-xs transition-colors hover:bg-[#f8fafc] hover:border-[#cbd5e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    <Wrench className="h-4 w-4 text-cyan-700" />
                                    Service Operations
                                </Link>

                                <Link
                                    href="/nexus/supplies"
                                    aria-describedby={FLEET_DEVICE_ACTION_STATUS_ID}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#0f172a] shadow-xs transition-colors hover:bg-[#f8fafc] hover:border-[#cbd5e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    Requisition Consumables
                                </Link>
                            </div>
                        </div>

                        {/* Clinic Hardware Summary Badge */}
                        <div className="rounded-[16px] border border-[#e2e8f0] bg-[#ffffff]/90 p-4 shadow-xs backdrop-blur-md lg:w-72">
                            <div className="flex items-center gap-3 pb-3 border-b border-[#f1f5f9]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-cyan-700 text-[#ffffff]">
                                    <Cpu className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#0f172a]">Valley Wellness Clinic</p>
                                    <p className="text-[11px] text-[#64748b]">Connected Facility Fleet</p>
                                </div>
                            </div>
                            <div className="mt-3 space-y-2 text-xs">
                                <div className="flex justify-between text-[#475569]">
                                    <span>Telemetry Status</span>
                                    <span className="font-bold text-emerald-700">Real-time nominal</span>
                                </div>
                                <div className="flex justify-between text-[#475569]">
                                    <span>Service Schedule</span>
                                    <span className="font-medium text-[#0f172a]">Next: Mar 01 ('26)</span>
                                </div>
                                <div className="flex justify-between text-[#475569]">
                                    <span>Facility Units</span>
                                    <span className="font-bold text-[#0f172a]">{devices.length} verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 02. FLEET SERVICE READINESS BRIDGE */}
                <section
                    aria-label="Fleet service readiness bridge"
                    className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#f59e0b]/[0.25] bg-[#f59e0b]/[0.10] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                                <AlertTriangle className="h-3 w-3 text-amber-700" />
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                                    Fleet service readiness bridge
                                </h2>
                            </div>
                            <p
                                aria-label={`Fleet readiness status: ${fleetReadinessBridge.status}`}
                                className="mt-2.5 max-w-3xl text-sm leading-relaxed text-[#334155]"
                            >
                                {FLEET_READINESS_STATUS_COPY[fleetReadinessBridge.status]}
                            </p>
                            <p
                                aria-label="Fleet action boundary: Preview only"
                                className="mt-2 text-xs font-semibold uppercase tracking-wider text-cyan-800"
                            >
                                Preview-only readiness: no dispatch, supplier order, warranty decision, or owner-facing closeout is triggered from this panel.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-5 md:min-w-[580px]">
                            <div
                                aria-label={`Total sample devices: ${fleetReadinessBridge.totalDeviceCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-left transition-colors hover:border-[#cbd5e1]"
                            >
                                <p className="font-bold text-[#0f172a] text-lg sm:text-xl">{fleetReadinessBridge.totalDeviceCount}</p>
                                <p className="mt-0.5 font-bold uppercase tracking-wider text-[#64748b] text-[10px] sm:text-[11px] nexus-nowrap">Total</p>
                            </div>
                            <div
                                aria-label={`Active devices: ${fleetReadinessBridge.activeDeviceCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-left transition-colors hover:border-[#cbd5e1]"
                            >
                                <p className="font-bold text-emerald-700 text-lg sm:text-xl">{fleetReadinessBridge.activeDeviceCount}</p>
                                <p className="mt-0.5 font-bold uppercase tracking-wider text-[#64748b] text-[10px] sm:text-[11px] nexus-nowrap">Active</p>
                            </div>
                            <div
                                aria-label={`Maintenance devices: ${fleetReadinessBridge.maintenanceDeviceCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-left transition-colors hover:border-[#cbd5e1]"
                            >
                                <p className="font-bold text-amber-700 text-lg sm:text-xl">{fleetReadinessBridge.maintenanceDeviceCount}</p>
                                <p className="mt-0.5 font-bold uppercase tracking-tight text-[#64748b] text-[10px] sm:text-[11px] nexus-nowrap">Maintenance</p>
                            </div>
                            <div
                                aria-label={`Overdue service devices: ${fleetReadinessBridge.overdueServiceCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-left transition-colors hover:border-[#cbd5e1]"
                            >
                                <p className="font-bold text-rose-700 text-lg sm:text-xl">{fleetReadinessBridge.overdueServiceCount}</p>
                                <p className="mt-0.5 font-bold uppercase tracking-wider text-[#64748b] text-[10px] sm:text-[11px] nexus-nowrap">Overdue</p>
                            </div>
                            <div
                                aria-label={`Authenticated fleet logs: ${fleetReadinessBridge.authenticatedLogCount}`}
                                className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-left transition-colors hover:border-[#cbd5e1]"
                            >
                                <p className="font-bold text-cyan-800 text-lg sm:text-xl">{fleetReadinessBridge.authenticatedLogCount}</p>
                                <p className="mt-0.5 font-bold uppercase tracking-wider text-[#64748b] text-[10px] sm:text-[11px] nexus-nowrap">Auth logs</p>
                            </div>
                        </div>
                    </div>
                    <p className="sr-only">
                        Authenticated fleet logs: {fleetReadinessBridge.authenticatedLogCount}. Fleet readiness status: {fleetReadinessBridge.status}.
                    </p>
                </section>

                {/* 03. OVERVIEW STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center justify-between rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                        <div>
                            <p className="text-xs text-[#64748b] uppercase font-bold tracking-wider">Active Fleet</p>
                            <p className="text-3xl font-extrabold text-[#0f172a] mt-2">
                                {devices.filter(d => d.status === 'active').length}{' '}
                                <span className="text-xs text-[#64748b] font-normal">Units</span>
                            </p>
                            <p className="mt-1 text-[11px] text-emerald-700 font-semibold">66% capacity online</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#10b981]/[0.25] bg-[#10b981]/[0.10] text-emerald-700">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                        <div>
                            <p className="text-xs text-[#64748b] uppercase font-bold tracking-wider">Warranty Status</p>
                            <p className="text-3xl font-extrabold text-[#0f172a] mt-2">
                                {devices.length}{' '}
                                <span className="text-xs text-[#64748b] font-normal">sample units</span>
                            </p>
                            <p className="mt-1 text-[11px] text-[#64748b]">All under manufacturer warranty</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] text-cyan-700">
                            <Shield className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                        <div>
                            <p className="text-xs text-[#64748b] uppercase font-bold tracking-wider">Next Service</p>
                            <p className="text-3xl font-extrabold text-[#0f172a] mt-2">
                                Mar 01 <span className="text-xs text-[#64748b] font-normal">('26)</span>
                            </p>
                            <p className="mt-1 text-[11px] text-amber-700 font-semibold">1 unit due for review</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#8b5cf6]/[0.25] bg-[#8b5cf6]/[0.10] text-purple-700">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 04. FLEET HARDWARE LIST */}
                <section
                    aria-label="Fleet device list panel"
                    className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs"
                >
                    <div className="p-5 md:p-6 border-b border-[#f1f5f9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-extrabold font-sans tracking-tight text-[#0f172a]">My Devices</h2>
                            <p className="mt-0.5 text-xs text-[#64748b]">
                                Select a device to inspect live telemetry, manufacturer manual previews, and maintenance log history.
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-describedby={registerNotice ? FLEET_REGISTER_ACTION_STATUS_ID : undefined}
                            onClick={() => {
                                trackNexusFleetEvent('nexus_fleet_route_cta_clicked', {
                                    action: 'register_device',
                                    total_device_count: fleetReadinessBridge.totalDeviceCount,
                                    active_device_count: fleetReadinessBridge.activeDeviceCount,
                                    maintenance_device_count: fleetReadinessBridge.maintenanceDeviceCount,
                                    overdue_service_count: fleetReadinessBridge.overdueServiceCount,
                                    authenticated_log_count: fleetReadinessBridge.authenticatedLogCount,
                                    fleet_readiness_status: fleetReadinessBridge.status,
                                    preview_record: true,
                                });
                                setRegisterNotice(
                                    'Device registration preview noted. Sign in before adding live fleet records.',
                                );
                            }}
                            className="flex min-h-11 items-center gap-2 rounded-[14px] bg-[#0f172a] px-4 py-2 text-xs font-bold text-[#ffffff] shadow-xs transition-colors hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Register New Device
                        </button>
                    </div>

                    {registerNotice ? (
                        <p
                            id={FLEET_REGISTER_ACTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-label="Fleet register device action status"
                            className="border-b border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] px-5 py-3 text-sm font-semibold text-cyan-900 md:px-6"
                        >
                            {registerNotice}
                        </p>
                    ) : null}

                    <p
                        id={FLEET_DEVICE_SELECTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label={FLEET_DEVICE_SELECTION_STATUS_LABEL}
                        className="sr-only"
                    >
                        {deviceSelectionStatus}
                    </p>

                    <div className="divide-y divide-[#f1f5f9]">
                        {devicesWithPersistedLogs.map((device) => (
                            <button
                                type="button"
                                key={device.id}
                                aria-label={`Open ${device.type} sample device ${device.id} details`}
                                aria-describedby={FLEET_DEVICE_SELECTION_STATUS_ID}
                                className="group flex min-h-16 w-full items-center gap-4 p-5 text-left transition-colors hover:bg-[#f8fafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500 motion-reduce:transition-none md:gap-6 md:p-6"
                                onClick={(event) => handleSelectDevice(device.id, event.currentTarget)}
                            >
                                {/* High-Res Thumbnail Container */}
                                <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-1.5 transition-transform group-hover:scale-105">
                                    <Image
                                        src={device.thumbnailUrl}
                                        alt={device.model}
                                        fill
                                        sizes="80px"
                                        className="object-contain"
                                    />
                                    <div className="absolute bottom-1 right-1">
                                        <ModalityTag type={device.type} />
                                    </div>
                                </div>

                                {/* Info Columns */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 items-start sm:items-center">
                                    <div className="lg:col-span-1">
                                        <h3 className="font-bold text-[#0f172a] group-hover:text-cyan-700 transition-colors text-sm md:text-base break-words">
                                            {device.model}
                                        </h3>
                                        <p className="text-xs font-mono text-[#64748b]">{device.serial}</p>
                                        <p className="text-[11px] font-medium text-[#475569] mt-0.5">{device.modalityName}</p>
                                        {device.telemetry.alertNotice ? (
                                            <div className="mt-2">
                                                <DaylightAlertBadge
                                                    message={device.telemetry.alertNotice}
                                                    level={device.nextService === 'OVERDUE' ? 'urgent' : 'warning'}
                                                />
                                            </div>
                                        ) : null}
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-[#64748b] uppercase tracking-wider font-bold mb-1 hidden sm:block">Readiness & Health</p>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={device.status} />
                                            <span className="font-mono text-xs font-bold text-[#0f172a]">{device.health}%</span>
                                        </div>
                                        <div className="mt-2 max-w-[130px]">
                                            <div className="h-1.5 w-full overflow-hidden rounded-[9999px] bg-[#e2e8f0]">
                                                <div
                                                    className={`h-full rounded-[9999px] ${
                                                        (device.telemetry.readinessScore ?? device.health) >= 90
                                                            ? 'bg-emerald-600'
                                                            : (device.telemetry.readinessScore ?? device.health) >= 70
                                                              ? 'bg-amber-600'
                                                              : 'bg-rose-600'
                                                    }`}
                                                    style={{ width: `${device.telemetry.readinessScore ?? device.health}%` }}
                                                />
                                            </div>
                                            <p className="mt-1 text-[10px] text-[#64748b] break-words">
                                                {device.telemetry.readinessLabel ?? 'Telemetry nominal'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-[#64748b] uppercase tracking-wider font-bold mb-1 hidden sm:block">Filter & Service</p>
                                        <p className="text-xs font-medium text-[#334155]">
                                            Next: <span className={device.nextService === 'OVERDUE' ? 'font-bold text-rose-700' : 'font-medium text-[#334155]'}>{device.nextService}</span>
                                        </p>
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <span className="rounded-[6px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-800">
                                                Filter: {device.telemetry.filterLifePercent ?? 88}%
                                            </span>
                                            <span className="text-[10px] text-[#64748b]">
                                                ({device.telemetry.filterLifeDays ?? 42}d)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hidden sm:block">
                                        <p className="text-[10px] text-[#64748b] uppercase tracking-wider font-bold mb-1">Utilization</p>
                                        <SessionUtilizationCurve
                                            points={device.telemetry.utilizationCurve ?? [40, 50, 60, 70, 65, 80, 75]}
                                            width={100}
                                            height={24}
                                            strokeColor={device.status === 'maintenance' ? '#d97706' : '#0891b2'}
                                            id={`row-${device.id}`}
                                        />
                                    </div>

                                    <div className="hidden lg:flex justify-end items-center">
                                        {device.status === 'maintenance' ? (
                                            <span className="inline-flex min-h-11 items-center rounded-[12px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.12] px-4 py-2 text-xs font-bold text-amber-800 transition-colors group-hover:bg-[#f59e0b]/[0.20]">
                                                Update Ticket
                                            </span>
                                        ) : (
                                            <span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[12px] p-2 text-[#94a3b8] transition-colors group-hover:bg-[#e2e8f0] group-hover:text-[#0f172a]">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 05. CLINICAL SENSOR & TELEMETRY INNOVATION HUB */}
                <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f1f5f9] pb-4 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] text-cyan-700">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold font-sans text-[#0f172a]">Chamber Readiness & Consumable Telemetry</h3>
                                <p className="text-xs text-[#64748b]">Real-time hardware seal integrity, filter life gauges, and session load curves</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#10b981]/[0.25] bg-[#10b981]/[0.10] px-3 py-1 text-[11px] font-bold uppercase text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-600 animate-pulse" />
                                All Baselines Nominal
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Chamber Readiness Meter Tile */}
                        <div className="rounded-[14px] border border-[#f1f5f9] bg-[#f8fafc] p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Chamber Seal & Pressure</span>
                                <span className="font-mono text-xs font-bold text-emerald-700">99.8% READY</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-[9999px] bg-[#e2e8f0]">
                                <div className="h-full rounded-[9999px] bg-emerald-600" style={{ width: '99.8%' }} />
                            </div>
                            <div className="space-y-1.5 pt-1 text-[11px] text-[#475569]">
                                <div className="flex justify-between">
                                    <span>Pinnacle 360 Hard Shell:</span>
                                    <span className="font-semibold text-[#0f172a]">Target 1.82 ATA Stable</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dual Pressure Relief:</span>
                                    <span className="font-semibold text-emerald-700">Synchronized</span>
                                </div>
                            </div>
                        </div>

                        {/* Filter Life Gauges Tile */}
                        <div className="rounded-[14px] border border-[#f1f5f9] bg-[#f8fafc] p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Consumable Life Gauges</span>
                                <span className="font-mono text-xs font-bold text-cyan-800">42 DAYS MIN</span>
                            </div>
                            <FilterLifeGauge percent={88} daysRemaining={42} filterName="Medical HEPA Intake" />
                            <FilterLifeGauge percent={94} daysRemaining={180} filterName="Molecular Sieve (Zeolite)" />
                        </div>

                        {/* Facility Session Load Curve */}
                        <div className="rounded-[14px] border border-[#f1f5f9] bg-[#f8fafc] p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Facility Weekly Curve</span>
                                <span className="font-mono text-xs font-bold text-cyan-800">38.5 HRS LOGGED</span>
                            </div>
                            <div className="my-2 flex justify-center">
                                <SessionUtilizationCurve
                                    points={[25, 45, 60, 80, 85, 90, 70]}
                                    width={220}
                                    height={36}
                                    strokeColor="#0891b2"
                                    id="facility-load"
                                />
                            </div>
                            <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-2 text-[10px] text-[#64748b]">
                                <span>Peak Chamber Demand</span>
                                <span className="font-bold text-[#0f172a]">14:00 – 18:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Environmental Suite */}
                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] text-cyan-700">
                                    <Thermometer className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold font-sans text-[#0f172a]">Chamber Suite Environment</h3>
                                    <p className="text-xs text-[#64748b]">Clinic climate & pressure controls</p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-[9999px] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-600" />
                                Calibrated
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="rounded-[14px] border border-[#f1f5f9] bg-[#f8fafc] p-3 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Ambient Temp</p>
                                <p className="mt-1 text-base font-extrabold text-[#0f172a]">21.4°C</p>
                                <p className="text-[10px] text-emerald-700 font-semibold">Nominal</p>
                            </div>
                            <div className="rounded-[14px] border border-[#f1f5f9] bg-[#f8fafc] p-3 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Room O2</p>
                                <p className="mt-1 text-base font-extrabold text-[#0f172a]">20.9%</p>
                                <p className="text-[10px] text-emerald-700 font-semibold">Safe Base</p>
                            </div>
                            <div className="rounded-[14px] border border-[#f1f5f9] bg-[#f8fafc] p-3 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Power Grid</p>
                                <p className="mt-1 text-base font-extrabold text-[#0f172a]">230V</p>
                                <p className="text-[10px] text-cyan-700 font-semibold">Isolated</p>
                            </div>
                        </div>
                    </div>

                    {/* Routine Maintenance Cadence */}
                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#8b5cf6]/[0.25] bg-[#8b5cf6]/[0.10] text-purple-700">
                                    <Gauge className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold font-sans text-[#0f172a]">Preventative Maintenance</h3>
                                    <p className="text-xs text-[#64748b]">Scheduled inspections and calibrations</p>
                                </div>
                            </div>
                            <Link
                                href="/nexus/service"
                                aria-describedby={FLEET_DEVICE_ACTION_STATUS_ID}
                                className="text-xs font-semibold text-cyan-700 hover:underline inline-flex items-center gap-1"
                            >
                                Schedule visit <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="mt-4 space-y-2.5">
                            <div className="flex items-center justify-between rounded-[12px] border border-[#f1f5f9] bg-[#f8fafc] p-2.5 text-xs">
                                <span className="font-semibold text-[#0f172a]">Quarterly Filter Refresh (HBOT)</span>
                                <span className="font-mono text-[11px] text-[#64748b]">Mar 01, 2026</span>
                            </div>
                            <div className="flex items-center justify-between rounded-[12px] border border-[#f1f5f9] bg-[#f8fafc] p-2.5 text-xs">
                                <span className="font-semibold text-[#0f172a]">Photobiomodulation Spectral Audit</span>
                                <span className="font-mono text-[11px] text-[#64748b]">Jun 15, 2026</span>
                            </div>
                            <div className="flex items-center justify-between rounded-[12px] border border-[#f1f5f9] bg-[#f8fafc] p-2.5 text-xs">
                                <span className="font-semibold text-rose-700">PEMF Controller Voltage Diagnostic</span>
                                <span className="font-mono text-[11px] font-bold text-rose-700">Urgent / Overdue</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </PartnerLayout>
    );
};

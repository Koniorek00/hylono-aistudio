'use client';

import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { MaintenanceScheduleItem } from './opsData';

export interface ServiceOpsMaintenanceScheduleProps {
  items?: MaintenanceScheduleItem[];
  onUpdateStatus?: (id: string, status: MaintenanceScheduleItem['status']) => void;
  onRequestService?: (chamberId: string) => void;
  className?: string;
}

const DEFAULT_SCHEDULE_ITEMS: MaintenanceScheduleItem[] = [
  {
    id: 'maint-01',
    chamberId: 'ch-01',
    chamberName: 'Hylono HBOT Alpha (Mono-Place 2.0 ATA)',
    task: 'Annual ASME PVHO-1 Acrylic Window & Main Seal Inspection',
    dueDate: '2026-10-30',
    status: 'pending',
    priority: 'urgent',
    technician: 'Ing. M. Kowalski (Lead Inspector)',
  },
  {
    id: 'maint-02',
    chamberId: 'ch-02',
    chamberName: 'Hylono HBOT Beta (Multi-Place 1.5 ATA)',
    task: 'Semi-annual Medical O2 Sensor Calibration (Dual Galvanic Cell)',
    dueDate: '2026-11-05',
    status: 'in_progress',
    priority: 'high',
    technician: 'Dr. W. Myszor',
  },
  {
    id: 'maint-03',
    chamberId: 'ch-01',
    chamberName: 'Hylono HBOT Alpha (Mono-Place 2.0 ATA)',
    task: 'HEPA 0.3μm Intake Particulate Filter & Activated Carbon Core Swap',
    dueDate: '2026-10-25',
    status: 'overdue',
    priority: 'urgent',
    technician: 'Unassigned',
  },
  {
    id: 'maint-04',
    chamberId: 'ch-03',
    chamberName: 'Hylono H2 Molecular Station',
    task: 'PEM Electrolyzer Deionized Water Filter & Conductivity Check (<0.1 μS/cm)',
    dueDate: '2026-11-12',
    status: 'pending',
    priority: 'medium',
    technician: 'Ing. M. Kowalski',
  },
  {
    id: 'maint-05',
    chamberId: 'ch-02',
    chamberName: 'Hylono HBOT Beta (Multi-Place 1.5 ATA)',
    task: 'Quarterly Emergency Depressurization Valve Pop-Off Test (PED 2014/68/EU)',
    dueDate: '2026-10-20',
    status: 'completed',
    priority: 'high',
    technician: 'Dr. W. Myszor',
  },
];

const STATUS_CONFIG: Record<
  MaintenanceScheduleItem['status'],
  { label: string; tone: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: 'Pending',
    tone: 'text-amber-800 bg-amber-50 border-amber-200',
    badge: 'Pending Review',
    icon: Clock3,
  },
  in_progress: {
    label: 'In Progress',
    tone: 'text-blue-800 bg-blue-50 border-blue-200',
    badge: 'Under Inspection',
    icon: Wrench,
  },
  completed: {
    label: 'Completed',
    tone: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    badge: 'Verified & Certified',
    icon: CheckCircle2,
  },
  overdue: {
    label: 'Overdue',
    tone: 'text-rose-800 bg-rose-50 border-rose-200',
    badge: 'Immediate Action',
    icon: AlertTriangle,
  },
};

const PRIORITY_BADGES: Record<MaintenanceScheduleItem['priority'], string> = {
  urgent: 'border-rose-300 bg-rose-100 text-rose-900 font-bold',
  high: 'border-amber-300 bg-amber-100 text-amber-900 font-semibold',
  medium: 'border-slate-200 bg-slate-100 text-slate-700',
  low: 'border-slate-200 bg-slate-50 text-slate-600',
};

export const ServiceOpsMaintenanceSchedule: React.FC<ServiceOpsMaintenanceScheduleProps> = ({
  items = DEFAULT_SCHEDULE_ITEMS,
  onUpdateStatus,
  onRequestService,
  className = '',
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const overdueCount = useMemo(
    () => items.filter((item) => item.status === 'overdue').length,
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus =
        selectedStatus === 'all' ? true : item.status === selectedStatus;
      const matchesQuery =
        searchQuery.trim() === ''
          ? true
          : item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.chamberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.technician && item.technician.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesQuery;
    });
  }, [items, selectedStatus, searchQuery]);

  return (
    <section
      aria-label="Preventative maintenance & safety schedule"
      className={`rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 text-[#0f172a] shadow-xs ${className}`}
    >
      {/* Top Header & Compliance Badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e2e8f0] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[9999px] border border-cyan-200 bg-cyan-50 px-3 py-0.5 text-xs font-semibold text-cyan-800">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
            ISO 13485:2016 & PED 2014/68/EU Compliance Register
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl">
            Hyperbaric & Hydrogen Preventative Maintenance Matrix
          </h2>
          <p className="mt-1 text-sm text-[#475569]">
            Certified safety inspections, galvanic cell calibrations, and pressure relief valve certifications.
          </p>
        </div>

        {overdueCount > 0 && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-[14px] border border-rose-300 bg-rose-50 px-4 py-2.5 text-rose-900"
          >
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Safety Action Required</p>
              <p className="text-sm font-semibold">{overdueCount} maintenance task overdue</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter maintenance tasks by status"
          className="flex flex-wrap items-center gap-1.5 rounded-[12px] bg-[#f8fafc] p-1 border border-[#e2e8f0]"
        >
          {['all', 'pending', 'in_progress', 'overdue', 'completed'].map((statusKey) => {
            const count =
              statusKey === 'all'
                ? items.length
                : items.filter((i) => i.status === statusKey).length;
            const isActive = selectedStatus === statusKey;
            return (
              <button
                key={statusKey}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setSelectedStatus(statusKey)}
                className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500 ${
                  isActive
                    ? 'bg-[#ffffff] text-[#0f172a] shadow-xs font-semibold'
                    : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#ffffff]/50'
                }`}
              >
                <span className="capitalize">{statusKey.replace('_', ' ')}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chamber, task, technician..."
            aria-label="Search maintenance tasks"
            className="w-full rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] py-1.5 pl-9 pr-3 text-xs text-[#0f172a] placeholder-[#94a3b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500"
          />
        </div>
      </div>

      {/* Task Matrix List */}
      <div className="mt-5 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[#cbd5e1] p-8 text-center text-sm text-[#64748b]">
            No maintenance tasks match the selected filter criteria.
          </div>
        ) : (
          filteredItems.map((item) => {
            const statusMeta = STATUS_CONFIG[item.status];
            const StatusIcon = statusMeta.icon;

            return (
              <article
                key={item.id}
                aria-labelledby={`task-title-${item.id}`}
                className="group flex flex-col justify-between gap-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4.5 transition hover:border-[#cbd5e1] hover:bg-[#ffffff] sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.tone}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusMeta.badge}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${PRIORITY_BADGES[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-xs font-semibold text-[#0f172a]">
                      {item.chamberName}
                    </span>
                  </div>

                  <h3
                    id={`task-title-${item.id}`}
                    className="text-sm font-bold text-[#0f172a] leading-snug"
                  >
                    {item.task}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#94a3b8]" />
                      Due: <strong className="text-[#334155]">{item.dueDate}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5 text-[#94a3b8]" />
                      Assigned: <strong className="text-[#334155]">{item.technician || 'Pending assignment'}</strong>
                    </span>
                  </div>
                </div>

                {/* Status Update Quick Action Controls */}
                <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0 border-t border-[#e2e8f0] sm:border-t-0">
                  {item.status !== 'completed' && (
                    <button
                      type="button"
                      aria-label={`Mark task ${item.id} completed`}
                      onClick={() => onUpdateStatus?.(item.id, 'completed')}
                      className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Sign Off
                    </button>
                  )}

                  {item.status === 'pending' && (
                    <button
                      type="button"
                      aria-label={`Start task ${item.id}`}
                      onClick={() => onUpdateStatus?.(item.id, 'in_progress')}
                      className="inline-flex items-center gap-1.5 rounded-[10px] border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      <Wrench className="h-3.5 w-3.5 text-blue-600" />
                      Begin
                    </button>
                  )}

                  {onRequestService && (
                    <button
                      type="button"
                      aria-label={`Request external parts or tech for ${item.chamberName}`}
                      onClick={() => onRequestService(item.chamberId)}
                      className="inline-flex items-center gap-1 rounded-[10px] border border-[#e2e8f0] bg-[#ffffff] px-2.5 py-1.5 text-xs font-medium text-[#475569] shadow-xs transition hover:bg-[#f1f5f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500"
                    >
                      Parts
                      <ArrowUpRight className="h-3 w-3 text-[#94a3b8]" />
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ServiceOpsMaintenanceSchedule;

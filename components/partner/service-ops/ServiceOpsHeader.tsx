'use client';

import React from 'react';
import { Activity, Search, ShieldCheck, Wrench, Users, Bell } from 'lucide-react';
import { ServiceOpsStatusBadge, ServiceStatus } from './ServiceOpsBadges';

export interface ServiceOpsHeaderProps {
  activeChamberCount: number;
  totalChambers: number;
  inSessionCount: number;
  maintenanceDueCount: number;
  overallStatus: ServiceStatus;
  technicianName?: string;
  technicianRole?: string;
  onSearchChange?: (term: string) => void;
  searchTerm?: string;
  unreadAlertCount?: number;
}

export const ServiceOpsHeader: React.FC<ServiceOpsHeaderProps> = ({
  activeChamberCount,
  totalChambers,
  inSessionCount,
  maintenanceDueCount,
  overallStatus,
  technicianName = 'Clinical Operations Specialist',
  technicianRole = 'Level 3 Hyperbaric Safety Director',
  onSearchChange,
  searchTerm = '',
  unreadAlertCount = 0,
}) => {
  return (
    <header
      aria-label="Nexus service operations control header"
      className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 text-[#0f172a] shadow-xs"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Operational Title & Badge */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-800">
              <ShieldCheck size={14} className="text-cyan-600" />
              <span>ISO 13485 & CE Medical Device Safety Registry</span>
            </div>
            <ServiceOpsStatusBadge status={overallStatus} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl font-display">
            Hyperbaric & Hydrogen Service Operations
          </h1>
          <p className="text-sm text-[#64748b] max-w-2xl leading-relaxed">
            Real-time chamber telemetry, clinical check-ins, scheduled preventative maintenance protocols,
            and safety inspections verified to European MDR specifications.
          </p>
        </div>

        {/* Right: Technician Profile & Metrics */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-right">
            <div className="h-10 w-10 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-700 font-semibold">
              <Users size={18} />
            </div>
            <div>
              <div className="text-xs font-medium text-[#475569]">{technicianRole}</div>
              <div className="text-sm font-semibold text-[#0f172a]">{technicianName}</div>
            </div>
          </div>

          {unreadAlertCount > 0 && (
            <div
              aria-label={`Unread alerts: ${unreadAlertCount}`}
              className="relative flex items-center justify-center h-10 w-10 rounded-[14px] border border-amber-500/30 bg-amber-500/10 text-amber-700"
            >
              <Bell size={18} />
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadAlertCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Grid & Search Bar */}
      <div className="mt-6 pt-6 border-t border-[#f1f5f9] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Active Fleet */}
        <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b]">
            <span>Active Chambers</span>
            <Activity size={14} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0f172a]">
            {activeChamberCount} <span className="text-xs font-normal text-[#64748b]">/ {totalChambers} online</span>
          </div>
        </div>

        {/* KPI 2: Live In-Session */}
        <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b]">
            <span>In-Session (Pressurized)</span>
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0f172a]">
            {inSessionCount} <span className="text-xs font-normal text-[#64748b]">sessions</span>
          </div>
        </div>

        {/* KPI 3: Maintenance Due */}
        <div className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b]">
            <span>Maintenance Schedule</span>
            <Wrench size={14} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0f172a]">
            {maintenanceDueCount}{' '}
            <span className="text-xs font-normal text-[#64748b]">
              {maintenanceDueCount === 1 ? 'task due' : 'tasks due'}
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-2 flex items-center">
          <Search size={16} className="text-[#94a3b8] ml-2" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search chamber ID, protocol..."
            aria-label="Filter service operations"
            className="w-full bg-transparent px-3 py-1.5 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-hidden"
          />
        </div>
      </div>
    </header>
  );
};

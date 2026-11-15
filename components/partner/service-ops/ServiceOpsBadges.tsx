'use client';

import React from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react';

export type ServiceStatus = 'operational' | 'maintenance_required' | 'under_repair' | 'offline';

export interface ServiceBadgeProps {
  status: ServiceStatus;
  lastInspectionDate?: string;
}

export function ServiceOpsStatusBadge({ status, lastInspectionDate }: ServiceBadgeProps) {
  const config = {
    operational: {
      label: 'Operational',
      icon: CheckCircle,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
    maintenance_required: {
      label: 'Maintenance Due',
      icon: Clock,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
    },
    under_repair: {
      label: 'Under Service',
      icon: Wrench,
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
    },
    offline: {
      label: 'Offline',
      icon: AlertCircle,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
    },
  }[status] || {
    label: 'Unknown',
    icon: Activity,
    bg: 'bg-slate-800',
    border: 'border-slate-700',
    text: 'text-slate-400',
  };

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.bg} ${config.border} ${config.text} text-xs font-semibold`}>
      <Icon size={14} />
      <span>{config.label}</span>
      {lastInspectionDate && (
        <span className="text-[10px] text-slate-400 ml-1 font-mono">({lastInspectionDate})</span>
      )}
    </div>
  );
}

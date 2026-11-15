'use client';

import React from 'react';
import { UserPlus, Wrench, ShieldAlert, Cpu, PackagePlus } from 'lucide-react';
import { QuickActionItem } from './types';

export interface ServiceOpsQuickActionsProps {
  onOpenClientCheckIn: () => void;
  onOpenMaintenanceLog: () => void;
  onRunEmergencySafetyCheck?: () => void;
  onOpenPartsRequisition?: () => void;
  customActions?: QuickActionItem[];
}

export const ServiceOpsQuickActions: React.FC<ServiceOpsQuickActionsProps> = ({
  onOpenClientCheckIn,
  onOpenMaintenanceLog,
  onRunEmergencySafetyCheck,
  onOpenPartsRequisition,
  customActions = [],
}) => {
  const defaultActions: QuickActionItem[] = [
    {
      id: 'quick-client-checkin',
      label: 'New Client Check-In',
      category: 'clinical',
      icon: <UserPlus size={16} className="text-cyan-700" />,
      badge: 'Vitals Required',
      onClick: onOpenClientCheckIn,
    },
    {
      id: 'quick-maintenance-entry',
      label: 'Log Service / Inspection',
      category: 'maintenance',
      icon: <Wrench size={16} className="text-amber-700" />,
      badge: 'MDR ISO 13485',
      onClick: onOpenMaintenanceLog,
    },
    {
      id: 'quick-safety-check',
      label: 'Safety Relief Valve Test',
      category: 'emergency',
      icon: <ShieldAlert size={16} className="text-rose-700" />,
      badge: 'Emergency Gate',
      onClick: () => {
        if (onRunEmergencySafetyCheck) onRunEmergencySafetyCheck();
      },
    },
    {
      id: 'quick-parts-requisition',
      label: 'Request Replacement Parts',
      category: 'maintenance',
      icon: <PackagePlus size={16} className="text-emerald-700" />,
      onClick: () => {
        if (onOpenPartsRequisition) onOpenPartsRequisition();
      },
    },
  ];

  const allActions = [...defaultActions, ...customActions];

  return (
    <nav
      aria-label="Service operations quick actions"
      className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 text-[#0f172a] shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide text-[#0f172a] uppercase flex items-center gap-2">
          <Cpu size={16} className="text-cyan-600" />
          <span>Operational Dispatch Rail</span>
        </h2>
        <span className="text-xs text-[#64748b]">Clinical & Maintenance Controls</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {allActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            aria-label={action.label}
            className="group relative flex flex-col justify-between rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left transition-all duration-150 hover:border-cyan-500/40 hover:bg-[#ffffff] hover:shadow-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50"
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#ffffff] group-hover:border-cyan-500/30">
                {action.icon}
              </div>
              {action.badge && (
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-800">
                  {action.badge}
                </span>
              )}
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold text-[#0f172a] group-hover:text-cyan-800 transition-colors">
                {action.label}
              </div>
              <div className="text-[11px] text-[#64748b] capitalize mt-0.5">
                {action.category} Action
              </div>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

import React, { type ReactNode } from 'react';
import { SwissMineralBadge } from './SwissMineralBadge';
import { CONTAINER_STANDARDS } from '@/lib/brand-tokens';

export interface TelemetryNode {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}

export interface TelemetryRibbonProps {
  nodes: TelemetryNode[];
  className?: string;
}

/**
 * TelemetryRibbon — Section 2 Floating Feature / Metric Dock
 *
 * Grounding bridge between the asymmetrical hero and core content grid.
 * Features translucent Swiss parchment dock and refined mineral icon docks.
 */
export function TelemetryRibbon({
  nodes,
  className = '',
}: TelemetryRibbonProps) {
  return (
    <div
      className={`relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-12 ${className}`}
    >
      <div
        className={`${CONTAINER_STANDARDS.previewCard} sm:${CONTAINER_STANDARDS.masterCard} border border-[#E8E1D5] bg-[#FAF8F5]/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_10px_30px_rgba(20,25,23,0.03)]`}
      >
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(
            nodes.length,
            5
          )} gap-4 lg:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E1D5]`}
        >
          {nodes.map((node, index) => (
            <div
              key={node.label || index}
              className={`flex items-center gap-3.5 px-3 py-2 sm:py-0 ${
                index > 0 ? 'pt-4 sm:pt-0' : ''
              }`}
            >
              <SwissMineralBadge icon={node.icon} size="md" />
              <div className="flex flex-col min-w-0">
                <span className="font-editorial text-xl sm:text-2xl font-light text-slate-950 leading-tight">
                  {node.value}
                </span>
                <span className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                  {node.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

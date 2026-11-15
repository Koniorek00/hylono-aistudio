import React, { type ReactNode } from 'react';
import { CONTAINER_STANDARDS, MODALITY_TOKENS, type ModalityKey } from '@/lib/brand-tokens';

export interface ModalityBadgeProps {
  modality: ModalityKey;
  tone?: 'daylight' | 'luminous' | 'mineral';
  size?: 'sm' | 'md' | 'lg';
  showGlowDot?: boolean;
  label?: string;
  icon?: ReactNode;
  className?: string;
}

export function ModalityBadge({
  modality,
  tone = 'daylight',
  size = 'md',
  showGlowDot = true,
  label,
  icon,
  className = '',
}: ModalityBadgeProps) {
  const theme = MODALITY_TOKENS[modality];
  const displayLabel = label ?? theme.shortName;

  // Geometry
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
    lg: 'text-sm px-4 py-1.5 gap-2.5',
  }[size];

  // Palette & Contrast (WCAG 2.2 AA Verified)
  const toneClasses = {
    daylight: `border font-medium ${
      modality === 'hbot'
        ? 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]'
        : modality === 'hydrogen'
        ? 'bg-[#F0FDFA] border-[#99F6E4] text-[#115E59]'
        : modality === 'pemf'
        ? 'bg-[#FAF5FF] border-[#DDD6FE] text-[#6D28D9]'
        : 'bg-[#FEF2F2] border-[#FECDD3] text-[#B91C1C]'
    }`,
    luminous: `border backdrop-blur-md font-semibold ${
      modality === 'hbot'
        ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#38BDF8]'
        : modality === 'hydrogen'
        ? 'bg-[#0EA5E9]/10 border-[#0EA5E9]/30 text-[#2DD4BF]'
        : modality === 'pemf'
        ? 'bg-[#A855F7]/10 border-[#A855F7]/30 text-[#C084FC]'
        : 'bg-[#F43F5E]/10 border-[#F43F5E]/30 text-[#FB7185]'
    }`,
    mineral: 'bg-[#F4EFEA] border border-[#DDD5C7] text-[#966D48] font-semibold',
  }[tone];

  return (
    <span
      className={`inline-flex items-center tracking-wide ${CONTAINER_STANDARDS.pillControl} ${sizeClasses} ${toneClasses} ${className}`}
    >
      {showGlowDot ? (
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full shrink-0 shadow-xs"
          style={{
            backgroundColor: theme.coreHex,
            boxShadow: tone === 'luminous' ? `0 0 8px ${theme.coreHex}` : undefined,
          }}
        />
      ) : null}
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{displayLabel}</span>
    </span>
  );
}

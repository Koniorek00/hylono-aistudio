import React, { type ReactNode } from 'react';
import { MODALITY_TOKENS, type ModalityKey } from '@/lib/brand-tokens';

export interface SwissMineralBadgeProps {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'mineral' | 'modality' | 'ghost';
  modality?: ModalityKey;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * SwissMineralBadge — Canonical replacement for the generic gray icon box (Anti-Pattern 1)
 *
 * Implements the Swiss mineral stone circular aesthetic (#F4EFEA / #DDD5C7 / #966D48)
 * or refined naked modality-tinted circular docks.
 */
export function SwissMineralBadge({
  icon,
  size = 'md',
  variant = 'mineral',
  modality,
  className = '',
  'aria-hidden': ariaHidden = true,
}: SwissMineralBadgeProps) {
  const sizeClasses = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-11 w-11 text-base',
    lg: 'h-14 w-14 text-lg',
  }[size];

  let variantClasses = '';

  if (variant === 'mineral') {
    variantClasses = 'bg-[#F4EFEA] border border-[#DDD5C7] text-[#966D48] shadow-xs';
  } else if (variant === 'modality' && modality) {
    const theme = MODALITY_TOKENS[modality];
    variantClasses = `${theme.daylight.bg} border ${theme.daylight.border} ${theme.daylight.textBold} shadow-xs`;
  } else {
    variantClasses = 'bg-white border border-[#E8E2D8] text-slate-800 shadow-xs';
  }

  return (
    <div
      aria-hidden={ariaHidden}
      className={`flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon}
    </div>
  );
}

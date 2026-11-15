import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import Link from 'next/link';
import { CONTAINER_STANDARDS, MODALITY_TOKENS, TOUCH_TARGET_STANDARDS, type ModalityKey } from '@/lib/brand-tokens';

export type LuxuryButtonVariant = 'primary' | 'secondary' | 'modality' | 'ghost' | 'mineral';
export type LuxuryButtonSize = 'sm' | 'md' | 'lg';

export interface LuxuryButtonBaseProps {
  children: ReactNode;
  variant?: LuxuryButtonVariant;
  size?: LuxuryButtonSize;
  modality?: ModalityKey;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  /** Enforces minimum 44px height for WCAG 2.5.8 touch target compliance */
  enforceTouchTarget?: boolean;
  className?: string;
}

export type LuxuryButtonProps =
  | (LuxuryButtonBaseProps & ComponentPropsWithoutRef<'button'> & { href?: undefined })
  | (LuxuryButtonBaseProps & ComponentPropsWithoutRef<typeof Link> & { href: string });

export function LuxuryButton({
  children,
  variant = 'primary',
  size = 'md',
  modality,
  icon,
  iconPosition = 'right',
  enforceTouchTarget = true,
  className = '',
  ...rest
}: LuxuryButtonProps) {
  const touchClass = enforceTouchTarget ? TOUCH_TARGET_STANDARDS.minHeight : '';

  const sizeClasses: Record<LuxuryButtonSize, string> = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-3 gap-2',
    lg: 'text-base px-8 py-3.5 gap-2.5',
  };

  const baseClasses = `inline-flex items-center justify-center font-semibold text-center select-none ${CONTAINER_STANDARDS.pillControl} ${touchClass} ${sizeClasses[size]} transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 break-words`;

  let variantClass = '';

  switch (variant) {
    case 'primary':
      variantClass =
        'bg-[#143D34] text-white hover:bg-[#0E2C25] shadow-xs focus-visible:ring-[#143D34]';
      break;
    case 'secondary':
      variantClass =
        'bg-white/90 backdrop-blur-xs border border-[#DDD6C8] text-slate-800 hover:bg-white hover:border-[#C4B7A0] shadow-xs focus-visible:ring-[#DDD6C8]';
      break;
    case 'mineral':
      variantClass =
        'bg-[#F4EFEA] border border-[#DDD5C7] text-[#966D48] hover:bg-[#EAE4DC] hover:border-[#C8BFB0] shadow-xs focus-visible:ring-[#966D48]';
      break;
    case 'ghost':
      variantClass =
        'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400';
      break;
    case 'modality':
      if (modality) {
        const theme = MODALITY_TOKENS[modality];
        variantClass = `${theme.daylight.bg} ${theme.daylight.textBold} border ${theme.daylight.border} hover:brightness-95 shadow-xs focus-visible:ring-[${theme.coreHex}]`;
      } else {
        variantClass =
          'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 shadow-xs focus-visible:ring-cyan-500';
      }
      break;
  }

  const combinedClass = `${baseClasses} ${variantClass} ${className}`;

  if ('href' in rest && rest.href) {
    const { href, ...linkProps } = rest as ComponentPropsWithoutRef<typeof Link> & { href: string };
    return (
      <Link href={href} prefetch={false} className={combinedClass} {...linkProps}>
        {icon && iconPosition === 'left' ? <span className="shrink-0">{icon}</span> : null}
        <span>{children}</span>
        {icon && iconPosition === 'right' ? <span className="shrink-0">{icon}</span> : null}
      </Link>
    );
  }

  const buttonProps = rest as ComponentPropsWithoutRef<'button'>;
  return (
    <button type={buttonProps.type ?? 'button'} className={combinedClass} {...buttonProps}>
      {icon && iconPosition === 'left' ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
      {icon && iconPosition === 'right' ? <span className="shrink-0">{icon}</span> : null}
    </button>
  );
}
